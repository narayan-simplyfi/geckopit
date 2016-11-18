sap.ui.define([
	"sap/m/MessageToast",
	"ipms/atm/app/helpers/Urls",
	"ipms/atm/app/helpers/Api",
	"ipms/atm/app/helpers/Utils",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/core/BusyIndicator"
], function(MessageToast, Urls, Api, Utils, JSONModel, MessageBox, BusyIndicator) {
	"use strict";

	var setData = function(oThis) {
		var atms = oThis.getModelData("ATMs", "/data/");

		if (atms.length === 0) {
			return;
		}

		BusyIndicator.show(0);
		atms.forEach(function(atm, index) {
			_fetchData(oThis, index);
		});
	};

	var _fetchDataO = function(oThis, index) {
		var oComponent = oThis.getOwnerComponent();
		var oData = oComponent.getModel("IoT");
		var device_id = oThis.getModelData("ATMs", "/data/" + index + "/DEVICEID");
		oThis.setModelData("ATMs", "/data/" + index + "/loading", true);
		oData.read("/app.svc/IPMS_SENSOR.T_IOT_1F0D3E4EB8C68DF7577E?$top=1&$filter=G_DEVICE eq '" + device_id + "'", null, null, true,
			function(d) {
				oThis.setModelData("ATMs", "/data/" + index + "/loading", false);
				if (d.results.length > 0) {
					_setSensorsData(oThis, d.results[0], index);
					_setSensorsStatus(oThis, d.results[0], index);
					oThis.setModelData("ATMs", "/data/" + index + "/hasSensorData", true);
					if (oThis.getModelData("ATMs", "/data/length") === (index + 1)) {
						jQuery.sap.delayedCall(10, oThis, function() {
							oThis.filterData();
							BusyIndicator.hide();
						});
					}
				} else {
					oThis.setModelData("ATMs", "/data/" + index + "/hasSensorData", false);
					oThis.setModelData("ATMs", "/data/" + index + "/sensor_status", "low");
					oThis.setModelData("ATMs", "/data/" + index + "/date", "");
					oThis.setModelData("ATMs", "/data/" + index + "/sensors", []);
					if (oThis.getModelData("ATMs", "/data/length") === (index + 1)) {
						jQuery.sap.delayedCall(10, oThis, function() {
							oThis.filterData();
							BusyIndicator.hide();
						});
					}
				}
			},
			function(d) {
				oThis.setModelData("ATMs", "/data/" + index + "/loading", false);
				oThis.setModelData("ATMs", "/data/" + index + "/hasSensorData", false);
				oThis.setModelData("ATMs", "/data/" + index + "/sensor_status", "low");
				oThis.setModelData("ATMs", "/data/" + index + "/date", "");
				oThis.setModelData("ATMs", "/data/" + index + "/sensors", []);
				if (oThis.getModelData("ATMs", "/data/length") === (index + 1)) {
					jQuery.sap.delayedCall(10, oThis, function() {
						oThis.filterData();
						BusyIndicator.hide();
					});
				}
			}
		);
	};

	var _fetchData = function(oThis, top) {
		top = (top) ? top : 1;
		var oComponent = oThis.getOwnerComponent();
		var oData = oComponent.getModel("IoT");
		var device_id = oThis.getModelData("ATMs", "/data/" + index + "/DEVICEID");
		oThis.setModelData("ATMs", "/data/" + index + "/loading", true);
		oData.read("/app.svc/IPMS_SENSOR.T_IOT_1F0D3E4EB8C68DF7577E?$top=" + top + "&$filter=G_DEVICE eq '" + device_id + "'", null, null,
			true,
			function(d) {
				oThis.setModelData("ATMs", "/data/" + index + "/loading", false);
				if (d.results.length > 0) {
					_setSensorsData(oThis, d.results[0], index);
					_setSensorsStatus(oThis, d.results[0], index);
					oThis.setModelData("ATMs", "/data/" + index + "/hasSensorData", true);
					BusyIndicator.hide();
				} else {
					oThis.setModelData("ATMs", "/data/" + index + "/hasSensorData", false);
					oThis.setModelData("ATMs", "/data/" + index + "/sensor_status", "low");
					oThis.setModelData("ATMs", "/data/" + index + "/date", "");
					oThis.setModelData("ATMs", "/data/" + index + "/sensors", []);
					BusyIndicator.hide();
				}
			},
			function(d) {
				oThis.setModelData("ATMs", "/data/" + index + "/loading", false);
				oThis.setModelData("ATMs", "/data/" + index + "/hasSensorData", false);
				oThis.setModelData("ATMs", "/data/" + index + "/sensor_status", "low");
				oThis.setModelData("ATMs", "/data/" + index + "/date", "");
				oThis.setModelData("ATMs", "/data/" + index + "/sensors", []);
			}
		);
	};

	var fetchData = function(oThis, top) {
		top = (top) ? top : 1;
		BusyIndicator.show(0);
		var oComponent = oThis.getOwnerComponent();
		var oData = oComponent.getModel("IoT");
		var device_id = oThis.getModelData("SelectedATM", "/data/DEVICEID");
		oData.read("/app.svc/IPMS_SENSOR.T_IOT_1F0D3E4EB8C68DF7577E?$top=" + top + "&$filter=G_DEVICE eq '" + device_id + "'", null, null,
			false,
			function(d) {
				if (d.results.length > 0) {
					_setSensorsData(oThis, d.results, top);
					_setSensorsStatus(oThis, d.results, top);
					oThis.setModelData("SelectedATM", "/data/hasSensorData", true);
				} else {
					oThis.setModelData("SelectedATM", "/data/hasSensorData", false);
					oThis.setModelData("SelectedATM", "/data/sensor_status", "low");
					oThis.setModelData("SelectedATM", "/data/date", "");
					oThis.setModelData("SelectedATM", "/data/sensors", []);
					MessageToast.show("No sensor data found for this ATM");
				}
				BusyIndicator.hide();
			},
			function(d) {
				oThis.setModelData("SelectedATM", "/data/loading", false);
				oThis.setModelData("SelectedATM", "/data/hasSensorData", false);
				oThis.setModelData("SelectedATM", "/data/sensor_status", "low");
				oThis.setModelData("SelectedATM", "/data/date", "");
				oThis.setModelData("SelectedATM", "/data/sensors", []);
				MessageToast.show(oThis.getI18nText('message_error_failed_to_fetch_data'));
				BusyIndicator.hide();
			}
		);
	};

	var _setSensorsData = function(oThis, allData, top) {
		var data = allData[0];
		var sensors = [{
			type: "vibration",
			status: (data['C_VIBRATION']) ? data['C_VIBRATION'] : 'None',
			action: false,
			state: (data['C_VIBRATION'] == 0) ? "Success" : "Error",
			trend: []
		}, {
			type: "heat",
			status: (data['C_TEMPERATURE']) ? data['C_TEMPERATURE'] : 'None',
			action: false,
			state: data['C_TEMPERATURE'] >= 18 && data['C_TEMPERATURE'] <= 22 ? "Success" : 'Error',
			trend: []
		}, {
			type: "contact",
			status: (data['Contact']) ? data['Contact'] : 'None',
			action: false,
			state: "None",
			trend: []
		}, {
			type: "motion",
			status: (data['Motion']) ? data['Motion'] : 'None',
			action: false,
			state: "None",
			trend: []
		}, {
			type: "pid",
			status: (data['C_PIR']) ? data['C_PIR'] : 'None',
			action: false,
			state: (data['C_PIR'] == 0) ? "Success" : "Error",
			trend: []
		}, {
			type: "door1",
			status: (data['C_DOOR1']) ? data['C_DOOR1'] : 'None',
			action: false,
			state: (data['C_DOOR1'] == 0) ? "Success" : "Error",
			trend: []
		}, {
			type: "door2",
			status: (data['C_DOOR2']) ? data['C_DOOR2'] : 'None',
			action: false,
			state: (data['C_DOOR2'] == 0) ? "Success" : "Error",
			trend: []
		}, {
			type: "smoke",
			status: (data['C_SMOKE']) ? data['C_SMOKE'] : 'None',
			action: false,
			state: (data['C_SMOKE'] == 0) ? "Success" : "Error",
			trend: []
		}, {
			type: "power",
			status: (data['C_POWERVALUE']) ? data['C_POWERVALUE'] : 'None',
			action: false,
			state: (data['C_POWERVALUE'] >= 6 && data['C_POWERVALUE'] <= 10) ? "Success" : 'Error',
			trend: []
		}, {
			type: "voltage",
			status: (data['C_VOLTAGEVALUE']) ? data['C_VOLTAGEVALUE'] : 'None',
			action: false,
			state: (data['C_VOLTAGEVALUE'] >= 180 && data['C_VOLTAGEVALUE'] <= 240) ? "Success" : 'Error',
			trend: []
		}, {
			type: "panic",
			status: (data['C_PANICBUTTON']) ? data['C_PANICBUTTON'] : 'None',
			action: false,
			state: (data['C_PANICBUTTON'] == 0) ? "Success" : "Error",
			trend: []
		}, {
			type: "AC1",
			status: (data['C_AC1']) ? data['C_AC1'] : 'None',
			action: true,
			state: (data['C_AC1'] == 0) ? "Error" : "Success",
			onState: (data['C_AC1'] == "1") ? true : false,
			trend: []
		}, {
			type: "AC2",
			status: (data['C_AC2']) ? data['C_AC2'] : 'None',
			action: true,
			state: (data['C_AC2'] == 0) ? "Error" : "Success",
			onState: (data['C_AC2'] == "1") ? true : false,
			trend: []
		}, {
			type: "Alarm",
			status: (data['C_ALARM']) ? data['C_ALARM'] : 'None',
			action: true,
			state: (data['C_ALARM'] == 0) ? "Success" : "Error",
			onState: (data['C_ALARM'] == "1") ? true : false,
			trend: []
		}, {
			type: "RFID",
			status: (data['C_RFID']) ? data['C_RFID'] : 'None',
			action: false,
			state: (data['C_RFID'] == 0) ? "Error" : "Success",
			trend: []
		}, {
			type: "powerstatus",
			status: (data['C_POWERSTATUS']) ? data['C_POWERSTATUS'] : 'None',
			action: false,
			state: (data['C_POWERSTATUS'] == 0) ? "Error" : "Success",
			trend: []
		}, {
			type: "currentvalue",
			status: (data['C_CURRENTVALUE']) ? data['C_CURRENTVALUE'] : 'None',
			action: false,
			state: (data['C_CURRENTVALUE'] >= 8 && data['C_CURRENTVALUE'] <= 10) ? "Success" : 'Error',
			trend: []
		}, {
			type: "speaker",
			status: (data['C_SPEAKER']) ? data['C_SPEAKER'] : 'None',
			action: false,
			state: (data['C_SPEAKER'] == 0) ? "Error" : "Success",
			trend: []
		}, {
			type: "camera1",
			status: (data['C_CAMERA1STATUS']) ? data['C_CAMERA1STATUS'] : 'None',
			action: false,
			state: (data['C_CAMERA1STATUS'] == 0) ? "Error" : "Success",
			trend: []
		}, {
			type: "camera2",
			status: (data['C_CAMERA2STATUS']) ? data['C_CAMERA2STATUS'] : 'None',
			action: false,
			state: (data['C_CAMERA2STATUS'] == 0) ? "Error" : "Success",
			trend: []
		}, {
			type: "camera3",
			status: (data['C_CAMERA3STATUS']) ? data['C_CAMERA3STATUS'] : 'None',
			action: false,
			state: (data['C_CAMERA3STATUS'] == 0) ? "Error" : "Success",
			trend: []
		}, {
			type: "camera4",
			status: (data['C_CAMERA4STATUS']) ? data['C_CAMERA4STATUS'] : 'None',
			action: false,
			state: (data['C_CAMERA4STATUS'] == 0) ? "Error" : "Success",
			trend: []
		}, {
			type: "light",
			status: (data['C_LIGHT']) ? data['C_LIGHT'] : 'None',
			action: false,
			state: (data['C_LIGHT'] == 0) ? "Error" : "Success",
			trend: []
		}, {
			type: "controlbox",
			status: (data['C_CONTROLBOX']) ? data['C_CONTROLBOX'] : 'None',
			action: false,
			state: (data['C_CONTROLBOX'] == 0) ? "Error" : "Success",
			trend: []
		}];

		if (top === 11) {
			for (var i = 1; i < allData.length; i++) {
				sensors.forEach(function(sensor, index) {
					switch (sensor.type) {
						case 'vibration':
							sensor.trend.push({
								value: (allData[i]['C_VIBRATION']) ? Number(allData[i]['C_VIBRATION']) : 0,
								color: (allData[i]['C_VIBRATION'] == 0) ? "Good" : "Error"
							});
							break;
						case 'heat':
							sensor.trend.push({
								value: (allData[i]['C_TEMPERATURE']) ? Number(allData[i]['C_TEMPERATURE']) : 0,
								color: allData[i]['C_TEMPERATURE'] >= 18 && allData[i]['C_TEMPERATURE'] <= 22 ? "Good" : "Error"
							});
							break;
						case 'contact':
							sensor.trend.push({
								value: (allData[i]['Contact']) ? Number(allData[i]['Contact']) : 0,
								color: "Neutral"
							});
							break;
						case 'motion':
							sensor.trend.push({
								value: (allData[i]['Motion']) ? Number(allData[i]['Motion']) : 0,
								color: "Neutral"
							});
							break;
						case 'pid':
							sensor.trend.push({
								value: (allData[i]['C_PIR']) ? Number(allData[i]['C_PIR']) : 0,
								color: (allData[i]['C_PIR'] == 0) ? "Good" : "Error"
							});
							break;
						case 'door1':
							sensor.trend.push({
								value: (allData[i]['C_DOOR1']) ? Number(allData[i]['C_DOOR1']) : 0,
								color: (allData[i]['C_DOOR1'] == 0) ? "Good" : "Error"
							});
							break;
						case 'door2':
							sensor.trend.push({
								value: (allData[i]['C_DOOR2']) ? Number(allData[i]['C_DOOR2']) : 0,
								color: (allData[i]['C_DOOR2'] == 0) ? "Good" : "Error"
							});
							break;
						case 'smoke':
							sensor.trend.push({
								value: (allData[i]['C_SMOKE']) ? Number(allData[i]['C_SMOKE']) : 0,
								color: (allData[i]['C_SMOKE'] == 0) ? "Good" : "Error"
							});
							break;
						case 'power':
							sensor.trend.push({
								value: (allData[i]['C_POWERVALUE']) ? Number(allData[i]['C_POWERVALUE']) : 0,
								color: (allData[i]['C_POWERVALUE'] >= 6 && allData[i]['C_POWERVALUE'] <= 10) ? "Good" : "Error"
							});
							break;
						case 'voltage':
							sensor.trend.push({
								value: (allData[i]['C_VOLTAGEVALUE']) ? Number(allData[i]['C_VOLTAGEVALUE']) : 0,
								color: (allData[i]['C_VOLTAGEVALUE'] >= 180 && allData[i]['C_VOLTAGEVALUE'] <= 240) ? "Good" : "Error"
							});
							break;
						case 'panic':
							sensor.trend.push({
								value: (allData[i]['C_PANICBUTTON']) ? Number(allData[i]['C_PANICBUTTON']) : 0,
								color: (allData[i]['C_PANICBUTTON'] == 0) ? "Good" : "Error"
							});
							break;
						case 'AC1':
							sensor.trend.push({
								value: (allData[i]['C_AC1']) ? Number(allData[i]['C_AC1']) : 0,
								color: (allData[i]['C_AC1'] == 0) ? "Error" : "Good"
							});
							break;
						case 'AC2':
							sensor.trend.push({
								value: (allData[i]['C_AC2']) ? Number(allData[i]['C_AC2']) : 0,
								color: (allData[i]['C_AC2'] == 0) ? "Error" : "Good"
							});
							break;
						case 'Alarm':
							sensor.trend.push({
								value: (allData[i]['C_ALARM']) ? Number(allData[i]['C_ALARM']) : 0,
								color: (allData[i]['C_ALARM'] == 0) ? "Good" : "Error"
							});
							break;
						case 'RFID':
							sensor.trend.push({
								value: (allData[i]['C_RFID']) ? Number(allData[i]['C_RFID']) : 0,
								color: (allData[i]['C_RFID'] == 0) ? "Error" : "Good"
							});
							break;
						case 'powerstatus':
							sensor.trend.push({
								value: (allData[i]['C_POWERSTATUS']) ? Number(allData[i]['C_POWERSTATUS']) : 0,
								color: (allData[i]['C_POWERSTATUS'] == 0) ? "Error" : "Good"
							});
							break;
						case 'currentvalue':
							sensor.trend.push({
								value: (allData[i]['C_CURRENTVALUE']) ? Number(allData[i]['C_CURRENTVALUE']) : 0,
								color: (allData[i]['C_CURRENTVALUE'] >= 8 && allData[i]['C_CURRENTVALUE'] <= 10) ? "Good" : "Error"
							});
							break;
						case 'speaker':
							sensor.trend.push({
								value: (allData[i]['C_SPEAKER']) ? Number(allData[i]['C_SPEAKER']) : 0,
								color: (allData[i]['C_SPEAKER'] == 0) ? "Error" : "Good"
							});
							break;
						case 'camera1':
							sensor.trend.push({
								value: (allData[i]['C_CAMERA1STATUS']) ? Number(allData[i]['C_CAMERA1STATUS']) : 0,
								color: (allData[i]['C_CAMERA1STATUS'] == 0) ? "Error" : "Good"
							});
							break;
						case 'camera2':
							sensor.trend.push({
								value: (allData[i]['C_CAMERA2STATUS']) ? Number(allData[i]['C_CAMERA2STATUS']) : 0,
								color: (allData[i]['C_CAMERA2STATUS'] == 0) ? "Error" : "Good"
							});
							break;
						case 'camera3':
							sensor.trend.push({
								value: (allData[i]['C_CAMERA3STATUS']) ? Number(allData[i]['C_CAMERA3STATUS']) : 0,
								color: (allData[i]['C_CAMERA3STATUS'] == 0) ? "Error" : "Good"
							});
							break;
						case 'camera4':
							sensor.trend.push({
								value: (allData[i]['C_CAMERA4STATUS']) ? Number(allData[i]['C_CAMERA4STATUS']) : 0,
								color: (allData[i]['C_CAMERA4STATUS'] == 0) ? "Error" : "Good"
							});
							break;
						case 'light':
							sensor.trend.push({
								value: (allData[i]['C_LIGHT']) ? Number(allData[i]['C_LIGHT']) : 0,
								color: (allData[i]['C_LIGHT'] == 0) ? "Error" : "Good"
							});
							break;
						case 'controlbox':
							sensor.trend.push({
								value: (allData[i]['C_CONTROLBOX']) ? Number(allData[i]['C_CONTROLBOX']) : 0,
								color: (allData[i]['C_CONTROLBOX'] == 0) ? "Error" : "Good"
							});
							break;
						default:
							break;
					}
				});
			}
		}
		var date = data['G_CREATED'];
		date = date.substr(date.indexOf("(") + 1, date.indexOf(")") - date.indexOf("(") - 1);
		date = oThis.Formatters.date("dd MMM, yyyy hh:mm:ss", Number(date));
		oThis.setModelData("SelectedATM", "/data/sensors", sensors);
		oThis.setModelData("SelectedATM", "/data/date", date);
	};

	var _setSensorsStatus = function(oThis, allData, top) {
		var data = allData[0];

		var status = "low";

		if (!(data['C_TEMPERATUREVALUE'] >= 18 && data['C_TEMPERATUREVALUE'] <= 22)) {
			status = 'critical';
		}
		if (!(data['C_POWERVALUE'] >= 6 && data['C_POWERVALUE'] <= 10)) {
			status = 'critical';
		}
		if (!(data['C_VOLTAGEVALUE'] >= 180 && data['C_VOLTAGEVALUE'] <= 240)) {
			status = 'critical';
		}
		if (!(data['C_CURRENTVALUE'] >= 8 && data['C_CURRENTVALUE'] <= 10)) {
			status = 'critical';
		}
		oThis.setModelData("SelectedATM", "/data/sensor_status", status);
	};

	return {
		setData: setData,
		fetchData: fetchData
	};
});