sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "ipms/atm/app/helpers/Api",
    "ipms/atm/app/helpers/Utils",
    "ipms/atm/app/helpers/Urls"
], function(JSONModel, BusyIndicator, MessageToast, Filter, Api, Utils, Urls) {
    "use strict";

    var init = function(oThis) {
        var oView = oThis.getView();

        var oFilter = oView.byId('atms-list-filter');
        oFilter.setValue('');

        var oICTb = oView.byId('atm-details-ictb');
        oICTb.setSelectedKey('info');
    };

    var setModels = function(oThis) {
        oThis.setModel(new JSONModel({
            "atmId": "",
            "atmName": "",
            "userid": "",
            "bankId": "",
            "areaName": "",
            "cityId": "",
            "pincode": "",
            "latitude": "",
            "logitude": "",
            "contactPerson1": "",
            "contactPerson2": "",
            "contactPerson3": "",
            "contactEmail1": "",
            "contactEmail2": "",
            "contactEmail3": "",
            "contactNo1": "",
            "contactNo2": "",
            "contactNo3": "",
            "contactDetails1": "",
            "contactDetails2": "",
            "contactDetails3": "",
            "brandName": "",
            "installationDate": "",
            "ipAddress": "",
            "online": false,
            "status": false,
            "deviceid": ""
        }), "ATM");
    };

    var setData = function(oThis, data) {
        var oView = oThis.getView();
        var oList = oView.byId("atms-list");
        var oICTb = oView.byId('atm-details-ictb');
        
        _setSelectedATM(oThis, data, "/data/0");
        oList.setSelectedItem(oList.getItems()[0]);
        oICTb.setSelectedKey('info');
    };

    var _setSelectedATM = function(oThis, data, path) {
        oThis.setModel(new JSONModel({
            "data": data,
            "path": path
        }), 'SelectedATM');
    };

    var filter = function(oThis, oEvent) {
        var oView = oThis.getView();
        var oList = oView.byId("atms-list").getBinding("items");
        var aFilters = [];
        var sQuery = oEvent.getParameter("newValue");
        if (sQuery && sQuery.length > 0) {
            var filterId = new Filter("ATM_ID", "Contains", sQuery);
            var filterCount = new Filter("CRITICAL_COUNT", "Contains", sQuery);
            var filterName = new Filter("ATM_NAME", "Contains", sQuery);
            var filterBank = new Filter("BANK_NAME", "Contains", sQuery);
            var filterArea = new Filter("AREA_NAME", "Contains", sQuery);
            var filterPin = new Filter("PINCODE", "Contains", sQuery);

            aFilters = new Filter([filterId, filterCount, filterName, filterBank, filterArea, filterPin]);
        }
        oList.filter(aFilters, "Application");
        oThis.setModelData('ATMs', '/searched_length', oList.iLength);
    };

    var selection = function(oThis, oEvent) {
        var oView = oThis.getView();

        var oICTb = oView.byId('atm-details-ictb');
        oICTb.setSelectedKey('info');

        var oSource = oEvent.getParameter('listItem');
        var oBinding = oSource.getBindingContext('ATMs');
        var sPath = oBinding.sPath;
        var data = Utils.objectCopy(oThis.getModelData('ATMs', sPath));
        _setSelectedATM(oThis, data, sPath);
    };

    var tabChange = function(oThis, oEvent) {
        var oView = oThis.getView();
        var sKey = oEvent.getParameter("key");
        if (sKey === "sensors") {
            Api.get(Urls.sensors())
                .done(function(d) {
                    jQuery.sap.delayedCall(10, oThis, function() {
                        _setSensorsData(oThis, d.d.results[0]);
                    });
                })
                .fail(function(d) {
                    MessageToast.show(oThis.getI18nText('message_error_failed_to_fetch_data'));
                })
                .always(function(d) {
                    BusyIndicator.hide();
                });
        }
    };

    var _setSensorsData = function(oThis, data) {
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
        oThis.setModelData("SelectedATM", "/data/sensors", sensors);
        oThis.setModelData("SelectedATM", "/data/date", date);
    };

    var openCreate = function(oThis) {
        var oView = oThis.getView();
        setModels(oThis);
        if (!oThis.oATMCreate) {
            oThis.oATMCreate = sap.ui.xmlfragment("ipms.atm.app.fragments.ATMCreateDialog", oThis);
            oView.addDependent(oThis.oATMCreate);
        }
        BusyIndicator.show(0);
        _getCreateATMData(oThis);
    };

    var _getCreateATMData = function(oThis) {
        if (oThis.getModel("ATMCreateHelpers")) {
            BusyIndicator.hide();
            oThis.oATMCreate.open();
            return;
        }

        var user = { "action": "getAllUsers" };
        var bank = { "action": "getAllBanks" };
        var city = { "action": "getAllCity" };
        $.when(
            Api.post(Urls.geckopit(), user),
            Api.post(Urls.geckopit(), bank),
            Api.post(Urls.geckopit(), city)
        ).done(function(data1, data2, data3) {
            var users = [];
            var banks = data2[0].result;
            var cities = data3[0].result;

            data1[0].result.forEach(function(user, index) {
                if (user.userStatus === "A") {
                    users.push(user);
                }
            });

            oThis.setModel(new JSONModel({
                "users": users,
                "banks": banks,
                "cities": cities
            }), 'ATMCreateHelpers');
            BusyIndicator.hide();
            jQuery.sap.delayedCall(0, oThis, function() {
                oThis.oATMCreate.open();
            });
        }).fail(function(data1, data2, data3) {
            MessageToast.show(oThis.getI18nText('message_error_failed_to_fetch_data'));
        });
    };

    var closeCreate = function(oThis) {
        var oCore = sap.ui.getCore();
        var oNavContainer = oCore.byId("create-atm-nc");
        oThis.oATMCreate.close();
        oNavContainer.backToPage(oCore.byId("create-atm-page-1"));
        setModels(oThis);
    };

    var goToPage2 = function(oThis) {
        var oCore = sap.ui.getCore();
        var oNavContainer = oCore.byId("create-atm-nc");
        oNavContainer.to(oCore.byId("create-atm-page-2"));
    };

    var goToPage3 = function(oThis) {
        var oCore = sap.ui.getCore();
        var oNavContainer = oCore.byId("create-atm-nc");
        oNavContainer.to(oCore.byId("create-atm-page-3"));
    };

    var goBackToPage1 = function(oThis) {
        var oCore = sap.ui.getCore();
        var oNavContainer = oCore.byId("create-atm-nc");
        oNavContainer.backToPage(oCore.byId("create-atm-page-1"));
    };

    var goBackToPage2 = function(oThis) {
        var oCore = sap.ui.getCore();
        var oNavContainer = oCore.byId("create-atm-nc");
        oNavContainer.backToPage(oCore.byId("create-atm-page-2"));
    };

    var create = function(oThis) {
        var data = Utils.objectCopy(oThis.getModelData("ATM", "/"));

        data.online = (data.online) ? "1" : "0";
        data.status = (data.status) ? "1" : "0";

        data.userid = Number(data.userid);
        data.bankId = Number(data.bankId);
        data.cityId = Number(data.cityId);
        data.pincode = Number(data.pincode);

        var payload = {
            "action": "setATM",
            "atmDetails": data
        };

        BusyIndicator.show(0);

        Api.post(Urls.geckopit(), payload)
            .done(function(d) {
                if (d.result && d.result[0] && d.result[0].STATUS_MSG) {
                    MessageToast.show(d.result[0].STATUS_MSG);
                    if (d.result[0].STATUS_CODE === "201") {
                        oThis._getData();
                        closeCreate(oThis);
                    }
                }
            })
            .fail(function(d) {
                MessageToast.show(oThis.getI18nText('Failed to create ATM'));
            })
            .always(function(d) {
                BusyIndicator.hide();
            });
    };

    var sensorSwitch = function(oThis) {
        var oView = oThis.getView();
        var sensors = oThis.getModelData("SelectedATM", "/data/sensors/");
        var switches = {};
        var payload = {
            "mode": "sync",
            "messageType": "70ddb0ec6c60d201f854",
            "method": "http",
            "sender": "My IoT application",
            "messages": [{
                "ATM_Current": "1",
                "Siren": "",
                "Relay1": "",
                "Relay2": ""
            }]
        };
        sensors.forEach(function(sensor, index) {
            if (sensor.type === "AC1" || sensor.type === "AC2" || sensor.type === "Alarm") {
                switches[sensor.type] = sensor;
            }
        });

        payload.messages[0]["Siren"] = (switches["Alarm"].onState) ? "1" : "0";

        if (switches["AC1"].onState && switches["AC2"].onState) {
            payload.messages[0]["Relay1"] = "0";
        } else if (!switches["AC1"].onState && !switches["AC2"].onState) {
            payload.messages[0]["Relay1"] = "1";
        } else if (switches["AC1"].onState && !switches["AC2"].onState) {
            payload.messages[0]["Relay2"] = "0";
        } else if (!switches["AC1"].onState && switches["AC2"].onState) {
            payload.messages[0]["Relay2"] = "1";
        }


        BusyIndicator.show(0);

        Api.post(Urls.geckopit(), payload)
            .done(function(d) {
                MessageToast.show(oThis.getI18nText('Sensor data updated successfully'));
            })
            .fail(function(d) {
                MessageToast.show(oThis.getI18nText('Failed to toggle state'));
            })
            .always(function(d) {
                BusyIndicator.hide();
            });
    };

    return {
        init: init,
        setModels: setModels,
        setData: setData,
        filter: filter,
        selection: selection,
        tabChange: tabChange,
        openCreate: openCreate,
        closeCreate: closeCreate,
        goToPage2: goToPage2,
        goToPage3: goToPage3,
        goBackToPage1: goBackToPage1,
        goBackToPage2: goBackToPage2,
        create: create,
        sensorSwitch: sensorSwitch
    };
});