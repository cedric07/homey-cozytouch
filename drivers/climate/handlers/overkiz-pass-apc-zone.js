'use strict';

const {
  PASS_APC_STATES,
  PASS_APC_COMMANDS,
  STATES,
  getStateValue,
} = require('../../../lib/constants/overkiz-mappings');
const { getPassAPCZoneTemperatureSensorUrl } = require('../../../lib/helpers/overkiz-device');

/**
 * Overkiz handler for Atlantic Pass APC heating/cooling zones
 * (AtlanticPassAPCHeatingAndCoolingZone — Shogun Zone Control 2.0 room circuits).
 *
 * Uses setHeatingTargetTemperature / setCoolingTargetTemperature (not setDerogatedTargetTemperature,
 * which is absent on Zone Control 2.0 zone endpoints).
 */
class PassAPCZoneOverkizHandler {

  constructor(ctx) { this.ctx = ctx; }

  _mainDeviceURL() {
    return this.ctx.store.passApcMainDeviceURL
      || this.ctx.store.passApcMainDeviceUrl;
  }

  _sensorDeviceURL() {
    return this.ctx.store.passApcTemperatureSensorURL
      || getPassAPCZoneTemperatureSensorUrl(this.ctx.deviceURL);
  }

  async _getSystemOperatingMode() {
    const mainUrl = this._mainDeviceURL();
    if (!mainUrl) return 'heating';

    try {
      const states = await this.ctx.api.getDeviceState(mainUrl);
      return getStateValue(states, PASS_APC_STATES.OPERATING_MODE) || 'heating';
    } catch (err) {
      this.ctx.log(`Pass APC main controller unavailable: ${err.message}`);
      return 'heating';
    }
  }

  _isCooling(systemMode) {
    return systemMode === 'cooling';
  }

  async setTargetTemperature(value) {
    const systemMode = await this._getSystemOperatingMode();
    const command = this._isCooling(systemMode)
      ? PASS_APC_COMMANDS.SET_COOLING_TARGET_TEMP
      : PASS_APC_COMMANDS.SET_HEATING_TARGET_TEMP;

    await this.ctx.executeCommand(command, [value]);
    await this.ctx.executeCommand(PASS_APC_COMMANDS.SET_DEROGATION_ON_OFF, ['on']);
  }

  async setOnOff(value) {
    const systemMode = await this._getSystemOperatingMode();
    const onOff = value ? 'on' : 'off';

    if (this._isCooling(systemMode)) {
      await this.ctx.executeCommand(PASS_APC_COMMANDS.SET_COOLING_ON_OFF, [onOff]);
      if (value) {
        await this.ctx.executeCommand(PASS_APC_COMMANDS.SET_COOLING_MODE, ['manu']);
      } else {
        await this.ctx.executeCommand(PASS_APC_COMMANDS.SET_COOLING_MODE, ['stop']);
      }
    } else {
      await this.ctx.executeCommand(PASS_APC_COMMANDS.SET_HEATING_ON_OFF, [onOff]);
      if (value) {
        await this.ctx.executeCommand(PASS_APC_COMMANDS.SET_HEATING_MODE, ['manu']);
      } else {
        await this.ctx.executeCommand(PASS_APC_COMMANDS.SET_HEATING_MODE, ['stop']);
      }
    }

    this._syncHvacCapability(systemMode, value);
  }

  async setMode(mode) {
    if (mode === 'off') {
      await this.setOnOff(false);
      return;
    }

    const systemMode = await this._getSystemOperatingMode();

    if (mode === 'cool' && !this._isCooling(systemMode)) {
      throw new Error('System is not in cooling mode');
    }
    if (mode === 'heat' && this._isCooling(systemMode)) {
      throw new Error('System is not in heating mode');
    }

    await this.setOnOff(true);
    this._syncHvacCapability(systemMode, true, mode);
  }

  _syncHvacCapability(systemMode, isOn, forcedMode) {
    if (!isOn) {
      this.ctx.setCapability('cozytouch_hvac_mode', 'off');
      this.ctx.setCapability('onoff', false);
      return;
    }

    const hvacMode = forcedMode
      || (this._isCooling(systemMode) ? 'cool' : 'heat');
    this.ctx.setCapability('cozytouch_hvac_mode', hvacMode);
    this.ctx.setCapability('onoff', true);
  }

  async _readLinkedTemperature() {
    const sensorUrl = this._sensorDeviceURL();
    if (!sensorUrl) return null;

    try {
      const sensorStates = await this.ctx.api.getDeviceState(sensorUrl);
      return getStateValue(sensorStates, STATES.TEMPERATURE);
    } catch (err) {
      this.ctx.log(`Linked zone temperature sensor unavailable: ${err.message}`);
      return null;
    }
  }

  _readZoneOnOff(states, systemMode) {
    if (this._isCooling(systemMode)) {
      const coolingMode = getStateValue(states, PASS_APC_STATES.COOLING_MODE);
      if (coolingMode === 'stop') return false;
      const coolingOnOff = getStateValue(states, PASS_APC_STATES.COOLING_ON_OFF);
      return coolingOnOff === 'on';
    }

    const heatingMode = getStateValue(states, PASS_APC_STATES.HEATING_MODE);
    if (heatingMode === 'stop') return false;
    const heatingOnOff = getStateValue(states, PASS_APC_STATES.HEATING_ON_OFF);
    return heatingOnOff === 'on';
  }

  _readTargetTemperature(states, systemMode) {
    if (this._isCooling(systemMode)) {
      return getStateValue(states, PASS_APC_STATES.COOLING_TARGET_TEMP)
        || getStateValue(states, PASS_APC_STATES.TARGET_TEMP);
    }
    return getStateValue(states, PASS_APC_STATES.HEATING_TARGET_TEMP)
      || getStateValue(states, PASS_APC_STATES.TARGET_TEMP);
  }

  _readTargetLimits(states, systemMode) {
    if (this._isCooling(systemMode)) {
      return {
        min: getStateValue(states, PASS_APC_STATES.MIN_COOLING_TARGET_TEMP),
        max: getStateValue(states, PASS_APC_STATES.MAX_COOLING_TARGET_TEMP),
      };
    }
    return {
      min: getStateValue(states, PASS_APC_STATES.MIN_HEATING_TARGET_TEMP),
      max: getStateValue(states, PASS_APC_STATES.MAX_HEATING_TARGET_TEMP),
    };
  }

  async updateState() {
    const states = await this.ctx.getDeviceState();
    const systemMode = await this._getSystemOperatingMode();

    const isOn = this._readZoneOnOff(states, systemMode);
    this._syncHvacCapability(systemMode, isOn);

    const targetTemp = this._readTargetTemperature(states, systemMode);
    if (targetTemp !== null) {
      this.ctx.setCapability('target_temperature', parseFloat(targetTemp));
    }

    let currentTemp = getStateValue(states, STATES.TEMPERATURE);
    if (currentTemp === null) {
      currentTemp = await this._readLinkedTemperature();
    }
    if (currentTemp !== null) {
      this.ctx.setCapability('measure_temperature', parseFloat(currentTemp));
    }

    const { min, max } = this._readTargetLimits(states, systemMode);
    if (min !== null && max !== null) {
      this.ctx.setCapabilityOptions('target_temperature', {
        min: parseFloat(min), max: parseFloat(max),
      });
    }
  }

}

module.exports = PassAPCZoneOverkizHandler;
