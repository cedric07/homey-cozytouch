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

// Adjustable-setpoint radiators (Ipala, etc.) — operating mode + heating level
const ADJUSTABLE_SETPOINT_OPERATING_TO_MODE = {
  standby: 'off',
  off: 'off',
  antifreeze: 'off',
  frostprotection: 'off',
  away: 'off',
  manual: 'manual',
  normal: 'manual',
  on: 'manual',
  max: 'manual',
  boost: 'manual',
  eco: 'eco_plus',
  prog: 'prog',
  program: 'prog',
  auto: 'prog',
  // Legacy values seen on other Overkiz/HA mappings
  basic: 'manual',
  internal: 'prog',
  external: 'prog',
};

const MODE_TO_ADJUSTABLE_SETPOINT = {
  off: { command: 'setOperatingMode', value: 'off' },
  manual: { command: 'setOperatingMode', value: 'manual' },
  eco_plus: { command: 'setHeatingLevel', value: 'eco' },
  prog: { command: 'setOperatingMode', value: 'prog' },
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

// ── Extra commands not in OverkizAPI.COMMANDS ─────────────────────

const EXTRA_COMMANDS = {
  SET_TARGET_TEMPERATURE: 'setTargetTemperature',
  SET_OPERATING_MODE: 'setOperatingMode',
  SET_SCHEDULING_TYPE: 'setSchedulingType',
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
  ADJUSTABLE_SETPOINT_OPERATING_TO_MODE,
  MODE_TO_ADJUSTABLE_SETPOINT,
  OVERKIZ_DHW_TO_MODE,
  MODE_TO_OVERKIZ_DHW,
  getStateValue,
};
