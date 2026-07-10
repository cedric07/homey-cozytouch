'use strict';

const CozyTouchDriver = require('../../lib/CozyTouchDriver');
const CozyTouchAPI = require('../../lib/CozyTouchAPI');
const OverkizAPI = require('../../lib/OverkizAPI');
const {
  isPassAPCZoneControlMain,
  isPassAPCHeatingAndCoolingZone,
  isPassAPCZoneTemperatureSensor,
  getPassAPCMainDeviceURL,
  getPassAPCZoneTemperatureSensorUrl,
} = require('../../lib/helpers/overkiz-device');

class ClimateDriver extends CozyTouchDriver {

  _filterDevices(allDevices) {
    return allDevices.filter((dev) => {
      if (dev._protocol === 'overkiz') {
        if (isPassAPCZoneTemperatureSensor(dev)) return false;
        if (isPassAPCZoneControlMain(dev) || isPassAPCHeatingAndCoolingZone(dev)) {
          return true;
        }
        const overkizApi = new OverkizAPI({});
        return overkizApi.getDeviceType(dev) === 'CLIMATE';
      }
      const cozyApi = new CozyTouchAPI({});
      const type = cozyApi.getDeviceType(dev.modelId);
      return type === 'HEAT_PUMP' || type === 'AC';
    });
  }

  _mapCozyTouchDevice(dev, username, password) {
    const base = super._mapCozyTouchDevice(dev, username, password);
    const cozyApi = new CozyTouchAPI({});
    const type = cozyApi.getDeviceType(dev.modelId);
    const hvacModes = cozyApi.getHvacModes(dev.modelId);

    const capabilities = ['target_temperature', 'measure_temperature', 'cozytouch_hvac_mode', 'onoff'];
    if (type === 'AC') {
      capabilities.push('cozytouch_fan_mode');
      capabilities.push('cozytouch_swing_mode');
    }

    base.capabilities = capabilities;
    base.store.hvacModes = hvacModes;
    base.store.deviceType = type;
    return base;
  }

  _mapOverkizDevice(dev, username, password) {
    const base = super._mapOverkizDevice(dev, username, password);

    if (isPassAPCZoneControlMain(dev)) {
      base.store.passApcRole = 'controller';
      base.capabilities = ['cozytouch_hvac_mode', 'onoff'];
      return base;
    }

    if (isPassAPCHeatingAndCoolingZone(dev)) {
      base.store.passApcRole = 'zone';
      base.store.passApcMainDeviceURL = getPassAPCMainDeviceURL(dev.deviceURL);
      base.store.passApcTemperatureSensorURL = getPassAPCZoneTemperatureSensorUrl(dev.deviceURL);
      base.capabilities = ['target_temperature', 'measure_temperature', 'cozytouch_hvac_mode', 'onoff'];
      return base;
    }

    base.capabilities = ['target_temperature', 'measure_temperature', 'cozytouch_hvac_mode', 'onoff'];
    return base;
  }

}

module.exports = ClimateDriver;
