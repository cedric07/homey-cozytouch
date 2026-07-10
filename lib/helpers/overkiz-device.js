'use strict';

function _controllable(deviceOrStore) {
  return deviceOrStore.controllableName
    || deviceOrStore.controllable_name
    || '';
}

function _widget(deviceOrStore) {
  return deviceOrStore.widget || '';
}

/** Atlantic Pass APC global zone controller (Shogun Zone Control 2.0). */
function isPassAPCZoneControlMain(deviceOrStore) {
  const controllable = _controllable(deviceOrStore);
  const widget = _widget(deviceOrStore);

  return controllable.includes('AtlanticPassAPCZoneControlMainComponent')
    || widget === 'AtlanticPassAPCZoneControl';
}

/** Atlantic Pass APC heating/cooling zone (room circuit). */
function isPassAPCHeatingAndCoolingZone(deviceOrStore) {
  const controllable = _controllable(deviceOrStore);
  const widget = _widget(deviceOrStore);

  return controllable.includes('AtlanticPassAPCZoneControlZoneComponent')
    && widget === 'AtlanticPassAPCHeatingAndCoolingZone';
}

function isPassAPCZoneTemperatureSensor(deviceOrStore) {
  return _controllable(deviceOrStore).includes('AtlanticPassAPCZoneTemperatureSensor');
}

function isPassAPCDevice(deviceOrStore) {
  return isPassAPCZoneControlMain(deviceOrStore)
    || isPassAPCHeatingAndCoolingZone(deviceOrStore)
    || isPassAPCZoneTemperatureSensor(deviceOrStore);
}

/** Main controller is always endpoint #1 on the same Overkiz stack. */
function getPassAPCMainDeviceURL(deviceURL) {
  if (!deviceURL) return null;
  return deviceURL.replace(/#\d+$/, '#1');
}

/** Zone temperature sensor is the next endpoint index (zone #2 → sensor #3). */
function getPassAPCZoneTemperatureSensorUrl(zoneDeviceURL) {
  if (!zoneDeviceURL) return null;
  const match = zoneDeviceURL.match(/#(\d+)$/);
  if (!match) return null;
  const zoneIndex = parseInt(match[1], 10);
  return zoneDeviceURL.replace(/#\d+$/, `#${zoneIndex + 1}`);
}

module.exports = {
  isPassAPCZoneControlMain,
  isPassAPCHeatingAndCoolingZone,
  isPassAPCZoneTemperatureSensor,
  isPassAPCDevice,
  getPassAPCMainDeviceURL,
  getPassAPCZoneTemperatureSensorUrl,
};
