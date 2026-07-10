'use strict';

/**
 * Atlantic Cozytouch fil pilote IO module (ref. 602251).
 * Sits behind any fil-pilote appliance (radiator, towel dryer, etc.).
 * Uses setHeatingLevel only — no temperature setpoint on the module itself.
 */
function isFilPiloteElectricalHeater(deviceOrStore) {
  const controllable = deviceOrStore.controllableName
    || deviceOrStore.controllable_name
    || '';
  const widget = deviceOrStore.widget || '';

  return controllable.includes('AtlanticElectricalHeaterIOComponent')
    || widget === 'AtlanticElectricalHeater';
}

module.exports = {
  isFilPiloteElectricalHeater,
};
