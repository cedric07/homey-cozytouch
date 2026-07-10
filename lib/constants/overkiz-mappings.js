'use strict';

const OverkizAPI = require('../OverkizAPI');

// Re-export core constants from OverkizAPI for handler convenience
const { STATES, COMMANDS } = OverkizAPI;

// ── Heating level maps (heater + towel_rack) ─────────────────────

const OVERKIZ_LEVEL_TO_MODE = {
  off: 'off',
  comfort: 'manual',
  eco: 'eco_plus',
  frostprotection: 'off',
};

const MODE_TO_OVERKIZ_LEVEL = {
  off: 'off',
  manual: 'comfort',
  eco_plus: 'eco',
  prog: 'comfort',
};

// ── DHW mode maps (water_heater only) ────────────────────────────

const OVERKIZ_DHW_TO_MODE = {
  manualEcoActive: 'eco_plus',
  manualEcoInactive: 'manual',
  autoMode: 'auto',
  boost: 'manual',
};

const MODE_TO_OVERKIZ_DHW = {
  manual: 'manualEcoInactive',
  eco_plus: 'manualEcoActive',
  auto: 'autoMode',
};

// Pass APC zone controller (Shogun Zone Control 2.0)
const PASS_APC_OPERATING_TO_HVAC = {
  heating: 'heat',
  cooling: 'cool',
  drying: 'dry',
  stop: 'off',
};

const HVAC_TO_PASS_APC_OPERATING = {
  heat: 'heating',
  cool: 'cooling',
  dry: 'drying',
  off: 'stop',
};

const PASS_APC_STATES = {
  OPERATING_MODE: 'io:PassAPCOperatingModeState',
  LAST_OPERATING_MODE: 'io:LastPassAPCOperatingModeState',
  AUTO_SWITCH: 'core:HeatingCoolingAutoSwitchState',
  HEATING_ON_OFF: 'core:HeatingOnOffState',
  COOLING_ON_OFF: 'core:CoolingOnOffState',
  HEATING_TARGET_TEMP: 'core:HeatingTargetTemperatureState',
  COOLING_TARGET_TEMP: 'core:CoolingTargetTemperatureState',
  TARGET_TEMP: 'core:TargetTemperatureState',
  MIN_HEATING_TARGET_TEMP: 'core:MinimumHeatingTargetTemperatureState',
  MAX_HEATING_TARGET_TEMP: 'core:MaximumHeatingTargetTemperatureState',
  MIN_COOLING_TARGET_TEMP: 'core:MinimumCoolingTargetTemperatureState',
  MAX_COOLING_TARGET_TEMP: 'core:MaximumCoolingTargetTemperatureState',
  HEATING_MODE: 'io:PassAPCHeatingModeState',
  COOLING_MODE: 'io:PassAPCCoolingModeState',
  DEROGATION_ON_OFF: 'core:DerogationOnOffState',
};

const PASS_APC_COMMANDS = {
  SET_OPERATING_MODE: 'setPassAPCOperatingMode',
  SET_AUTO_SWITCH: 'setHeatingCoolingAutoSwitch',
  SET_HEATING_TARGET_TEMP: 'setHeatingTargetTemperature',
  SET_COOLING_TARGET_TEMP: 'setCoolingTargetTemperature',
  SET_HEATING_ON_OFF: 'setHeatingOnOffState',
  SET_COOLING_ON_OFF: 'setCoolingOnOffState',
  SET_HEATING_MODE: 'setPassAPCHeatingMode',
  SET_COOLING_MODE: 'setPassAPCCoolingMode',
  SET_DEROGATION_ON_OFF: 'setDerogationOnOffState',
};

// ── Extra commands not in OverkizAPI.COMMANDS ─────────────────────

const EXTRA_COMMANDS = {
  SET_TARGET_TEMPERATURE: 'setTargetTemperature',
};

// ── Helper: read state value from array ──────────────────────────

function getStateValue(states, stateName) {
  const state = (states || []).find((s) => s.name === stateName);
  return state ? state.value : null;
}

module.exports = {
  STATES,
  COMMANDS,
  EXTRA_COMMANDS,
  OVERKIZ_LEVEL_TO_MODE,
  MODE_TO_OVERKIZ_LEVEL,
  OVERKIZ_DHW_TO_MODE,
  MODE_TO_OVERKIZ_DHW,
  PASS_APC_OPERATING_TO_HVAC,
  HVAC_TO_PASS_APC_OPERATING,
  PASS_APC_STATES,
  PASS_APC_COMMANDS,
  getStateValue,
};
