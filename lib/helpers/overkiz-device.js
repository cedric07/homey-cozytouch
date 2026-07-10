'use strict';

/**
 * Connected electric radiators with adjustable temperature setpoint
 * (e.g. Sauter/Thermor Ipala — AtlanticElectricalHeaterWithAdjustableTemperatureSetpoint).
 */
function isAdjustableSetpointElectricalHeater(deviceOrStore) {
  const controllable = deviceOrStore.controllableName
    || deviceOrStore.controllable_name
    || '';
  const widget = deviceOrStore.widget || '';

  return controllable.includes('AtlanticElectricalHeaterWithAdjustableTemperatureSetpointIOComponent')
    || widget === 'AtlanticElectricalHeaterWithAdjustableTemperatureSetpoint';
}

/** Linked IO temperature sensor index on the same Overkiz device stack. */
const ADJUSTABLE_SETPOINT_TEMP_SENSOR_INDEX = 2;

function getAdjustableSetpointTemperatureSensorUrl(deviceURL) {
  if (!deviceURL) return null;
  if (/#\d+$/.test(deviceURL)) {
    return deviceURL.replace(/#\d+$/, `#${ADJUSTABLE_SETPOINT_TEMP_SENSOR_INDEX}`);
  }
  return `${deviceURL}#${ADJUSTABLE_SETPOINT_TEMP_SENSOR_INDEX}`;
}

module.exports = {
  isAdjustableSetpointElectricalHeater,
  getAdjustableSetpointTemperatureSensorUrl,
};
