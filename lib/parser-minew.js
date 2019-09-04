/* ------------------------------------------------------------------
* node-beacon-scanner - parser-minew.js
*
* Copyright (c) 2019, James Lucas, All rights reserved.
* Released under the MIT license
* Date: 2019-08-27
* ---------------------------------------------------------------- */
'use strict';

/* ------------------------------------------------------------------
* Constructor: BeaconParserMinew()
* ---------------------------------------------------------------- */
const BeaconParserMinew = function() {
	this._MINEW_SERVICE_UUID = 'ffe1';
};

/* ------------------------------------------------------------------
* Method: parse(peripheral)
* - peripheral: `Peripheral` object of the noble
* ---------------------------------------------------------------- */
BeaconParserMinew.prototype.parse = function(peripheral) {
	let data = this._getServiceData(peripheral);
	if(!data) {
		return null;
	}
	data = data.toString('hex');
	// Minew Sensor
	var minew = null;

	var type = data.substr(0,2);

	if(type === 'a1') {
		minew = {};
		minew.frameType = type;
		minew.productModel = parseInt(data.substr(2,2),16);

		switch(minew.productModel) {
			case 1:
				minew.batteryPercent = parseInt(data.substr(4,2),16);
				minew.temperature = this.toDecimal(data.substr(6,4));
				minew.humidity = this.toDecimal(data.substr(10,4));
				minew.macAddress = this.toMAC(data.substr(14,12));
				break;
			case 2:
				minew.batteryPercent = parseInt(data.substr(4,2),16);
				minew.visibleLight = ((parseInt(data.substr(6,2)) & 0x01) === 0x01);
				minew.macAddress = this.toMAC(data.substr(8,12));
				break;
			case 3:
				minew.batteryPercent = parseInt(data.substr(4,2),16);
				minew.accelerationX = this.toDecimal(data.substr(6,4));
				minew.accelerationY = this.toDecimal(data.substr(10,4));
				minew.accelerationZ = this.toDecimal(data.substr(14,4));
				minew.macAddress = this.toMAC(data.substr(18,12));
				break;
			case 8:
				minew.batteryPercent = parseInt(data.substr(4,2),16);
				minew.macAddress = this.toMAC(data.substr(6,12));
				minew.name = this.hexToString(data.substr(18));
				break;
			default:
				minew.frameType = type;
				minew.payload = data.substr(2);
		}
	}

	return minew;
};

BeaconParserMinew.prototype._getServiceData = function(peripheral) {
	let ad = peripheral.advertisement;
	let minew_service = ad.serviceData.find((el) => {
		return el.uuid === this._MINEW_SERVICE_UUID;
	});
	if(!minew_service) {
		return null;
	}
	let data = minew_service.data || null;
	return data;
};

/**
 * Convert the given signed 8.8 fixed-point hexadecimal string to decimal.
 * @param {String} word The data word as a string.
 */
BeaconParserMinew.prototype.toDecimal = function(word) {
	var integer = parseInt(word.substr(0,2),16);
	var decimal = parseInt(word.substr(2,2),16) / 256;

	if(integer > 127) {
		return (integer - 256) + decimal;
	}
	return integer + decimal;
}

/**
 * Convert the given hexadecimal string to a MAC address string.
 * @param {String} word The MAC data word as a string.
 */
BeaconParserMinew.prototype.toMAC = function(word) {
	return	word.substr(10,2) + ':' + word.substr(8,2) + ':' +
		word.substr(6,2) + ':' + word.substr(4,2) + ':' +
		word.substr(2,2) + ':' + word.substr(0,2);
}

/**
 * Convert the given hexadecimal string to an ASCII string.
 * @param {String} name The hexadecimal string.
 */
BeaconParserMinew.prototype.hexToString = function(hex) {
	var name = '';
	for(var cByte = 0; cByte < hex.length; cByte += 2) {
		name += String.fromCharCode(parseInt(hex.substr(cByte, 2), 16));
	}

	return name;
}

module.exports = new BeaconParserMinew();
