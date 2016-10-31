sap.ui.define([
    "ipms/atm/app/helpers/Urls",
    "ipms/atm/app/helpers/Api",
    "ipms/atm/app/helpers/Utils",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator"
], function(Urls, Api, Utils, JSONModel, MessageBox, BusyIndicator) {
    "use strict";

    var setData = function(oThis) {
        var atms = oThis.getModelData("ATMs", "/data/");
        atms.forEach(function(atm, index) {
            _fetchData(oThis, index);
        });
    };

    var _fetchData = function(oThis, index) {
        var oComponent = oThis.getOwnerComponent();
        var oData = oComponent.getModel("IoT");
        var device_id = oThis.getModelData("ATMs", "/data/" + index + "/DEVICEID");
        oThis.setModelData("ATMs", "/data/" + index + "/loading", true);
        oData.read("/app.svc/IPMS_SENSOR.T_IOT_1F0D3E4EB8C68DF7577E?$top=1&$filter=G_DEVICE eq '" + device_id + "'", null, null, false,
            function(d) {
                oThis.setModelData("ATMs", "/data/" + index + "/loading", false);
                if (d.results.length > 0) {
                    _setSensorsData(oThis, d.results[0], index);
                    _setSensorsStatus(oThis, d.results[0], index);
                    oThis.setModelData("ATMs", "/data/" + index + "/hasSensorData", true);
                } else {
                    oThis.setModelData("ATMs", "/data/" + index + "/hasSensorData", false);
                    oThis.setModelData("ATMs", "/data/" + index + "/sensor_status", "low");
                    oThis.setModelData("ATMs", "/data/" + index + "/date", "");
                    oThis.setModelData("ATMs", "/data/" + index + "/sensors", []);
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

    var _setSensorsStatus = function(oThis, data, index) {
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
        oThis.setModelData("ATMs", "/data/" + index + "/sensor_status", status);
    };

    var _setSensorsData = function(oThis, data, index) {
        var sensors = [{
            type: "vibration",
            status: (data['C_VIBRATION']) ? data['C_VIBRATION'] : 'None',
            action: false,
            state: (data['C_VIBRATION'] === 0) ? "Error" : "Success"
        }, {
            type: "heat",
            status: (data['C_TEMPERATURE']) ? data['C_TEMPERATURE'] : 'None',
            action: false,
            state: data['C_TEMPERATURE'] >= 18 && data['C_TEMPERATURE'] <= 22 ? "Success" : 'Error'
        }, {
            type: "contact",
            status: (data['Contact']) ? data['Contact'] : 'None',
            action: false,
            state: "None"
        }, {
            type: "motion",
            status: (data['Motion']) ? data['Motion'] : 'None',
            action: false,
            state: "None"
        }, {
            type: "pid",
            status: (data['C_PIR']) ? data['C_PIR'] : 'None',
            action: false,
            state: (data['C_PIR'] === 0) ? "Error" : "Success"
        }, {
            type: "door",
            status: (data['C_POWERSTATUS']) ? data['C_POWERSTATUS'] : 'None',
            action: false,
            state: (data['C_POWERSTATUS'] === 0) ? "Error" : "Success"
        }, {
            type: "battery1",
            status: (data['C_DOOR1']) ? data['C_DOOR1'] : 'None',
            action: false,
            state: (data['C_DOOR1'] === 0) ? "Error" : "Success"
        }, {
            type: "battery2",
            status: (data['C_DOOR2']) ? data['C_DOOR2'] : 'None',
            action: false,
            state: (data['C_DOOR2'] === 0) ? "Error" : "Success"
        }, {
            type: "smoke",
            status: (data['C_SMOKE']) ? data['C_SMOKE'] : 'None',
            action: false,
            state: (data['C_SMOKE'] === 0) ? "Error" : "Success"
        }, {
            type: "power",
            status: (data['C_POWERVALUE']) ? data['C_POWERVALUE'] : 'None',
            action: false,
            state: (data['C_POWERVALUE'] >= 6 && data['C_POWERVALUE'] <= 10) ? "Success" : 'Error'
        }, {
            type: "voltage",
            status: (data['C_VOLTAGEVALUE']) ? data['C_VOLTAGEVALUE'] : 'None',
            action: false,
            state: (data['C_VOLTAGEVALUE'] >= 180 && data['C_VOLTAGEVALUE'] <= 240) ? "Success" : 'Error'
        }, {
            type: "panic",
            status: (data['C_PANICBUTTON']) ? data['C_PANICBUTTON'] : 'None',
            action: false,
            state: (data['C_PANICBUTTON'] === 0) ? "Error" : "Success"
        }, {
            type: "AC1",
            status: (data['C_AC1']) ? data['C_AC1'] : 'None',
            action: true,
            state: (data['C_AC1'] === 0) ? "Error" : "Success",
            onState: (data['C_AC1'] === "1") ? true : false
        }, {
            type: "AC2",
            status: (data['C_AC2']) ? data['C_AC1'] : 'None',
            action: true,
            state: (data['C_AC2'] === 0) ? "Error" : "Success",
            onState: (data['C_AC2'] === "1") ? true : false
        }, {
            type: "Alarm",
            status: (data['C_ALARM']) ? data['C_ALARM'] : 'None',
            action: true,
            state: (data['C_ALARM'] === 0) ? "Error" : "Success",
            onState: (data['C_ALARM'] === "1") ? true : false
        }, {
            type: "RFID",
            status: (data['C_RFID']) ? data['C_RFID'] : 'None',
            action: false,
            state: (data['C_RFID'] === 0) ? "Error" : "Success"
        }, {
            type: "powerstatus",
            status: (data['C_POWERSTATUS']) ? data['C_POWERSTATUS'] : 'None',
            action: false,
            state: (data['C_POWERSTATUS'] === 0) ? "Error" : "Success"
        }, {
            type: "currentvalue",
            status: (data['C_CURRENTVALUE']) ? data['C_CURRENTVALUE'] : 'None',
            action: false,
            state: (data['C_CURRENTVALUE'] >= 8 && data['C_CURRENTVALUE'] <= 10) ? "Success" : 'Error'
        }, {
            type: "speaker",
            status: (data['C_SPEAKER']) ? data['C_SPEAKER'] : 'None',
            action: false,
            state: (data['C_SPEAKER'] === 0) ? "Error" : "Success"
        }, {
            type: "camera1",
            status: (data['C_CAMERA1STATUS']) ? data['C_CAMERA1STATUS'] : 'None',
            action: false,
            state: (data['C_CAMERA1STATUS'] === 0) ? "Error" : "Success"
        }, {
            type: "camera2",
            status: (data['C_CAMERA2STATUS']) ? data['C_CAMERA2STATUS'] : 'None',
            action: false,
            state: (data['C_CAMERA2STATUS'] === 0) ? "Error" : "Success"
        }, {
            type: "camera3",
            status: (data['C_CAMERA3STATUS']) ? data['C_CAMERA3STATUS'] : 'None',
            action: false,
            state: (data['C_CAMERA3STATUS'] === 0) ? "Error" : "Success"
        }, {
            type: "camera4",
            status: (data['C_CAMERA4STATUS']) ? data['C_CAMERA4STATUS'] : 'None',
            action: false,
            state: (data['C_CAMERA4STATUS'] === 0) ? "Error" : "Success"
        }, {
            type: "light",
            status: (data['C_LIGHT']) ? data['C_LIGHT'] : 'None',
            action: false,
            state: (data['C_LIGHT'] === 0) ? "Error" : "Success"
        }, {
            type: "controlbox",
            status: (data['C_CONTROLBOX']) ? data['C_CONTROLBOX'] : 'None',
            action: false,
            state: (data['C_CONTROLBOX'] === 0) ? "Error" : "Success"
        }];

        var date = data['G_CREATED'];
        date = date.substr(date.indexOf("(") + 1, date.indexOf(")") - date.indexOf("(") - 1);
        date = oThis.Formatters.date("dd MMM, yyyy hh:mm:ss", Number(date));
        oThis.setModelData("ATMs", "/data/" + index + "sensors", sensors);
        oThis.setModelData("ATMs", "/data/" + index + "date", date);
    };


    return {
        setData: setData,
    };
});
