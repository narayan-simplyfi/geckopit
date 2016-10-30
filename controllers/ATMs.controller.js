sap.ui.define([
    "ipms/atm/app/controllers/BaseController",
    "sap/ui/core/routing/HashChanger",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "ipms/atm/app/helpers/Api",
    "ipms/atm/app/helpers/Utils",
    "ipms/atm/app/helpers/Urls",
    "ipms/atm/app/helpers/Formatters"
], function(BaseController, HashChanger, JSONModel, BusyIndicator, MessageBox, MessageToast, Filter, Api, Utils, Urls, Formatters) {
    "use strict";

    return BaseController.extend("ipms.atm.app.controllers.ATMs", {

        Formatters: Formatters,

        onInit: function() {
            var oThis = this;
            var oView = oThis.getView();
            var oComponent = oThis.getOwnerComponent();
            oThis.Formatters = Formatters;
            oThis._router = oComponent.getRouter();
            oThis._router.getRoute("atms").attachMatched(oThis._init, oThis);
            oThis._hashChanger = new HashChanger();
        },

        _init: function(oEvent) {
            var oThis = this;
            var oComponent = oThis.getOwnerComponent();
            if (!localStorage.getItem("ipms-user-details")) {
                oThis.route("login", null);
                return;
            } else {
                oComponent.setModel(new JSONModel(JSON.parse(localStorage.getItem("ipms-user-details"))), "UserData");
            }
            var oView = oThis.getView();

            var oFilter = oView.byId('atms-list-filter');
            oFilter.setValue('');

            var oICTb = oView.byId('atm-details-ictb');
            oICTb.setSelectedKey('info');

            var params = oEvent.getParameter("arguments");
            oThis._setModels(params);
            oThis._getData();
        },

        _setModels: function(params) {
            var oThis = this;
            oThis.setModel(new JSONModel({
                "type": params.type,
                "value": params.value
            }), "View");
            oThis._setCreateATMModel();
        },

        _setCreateATMModel: function() {
            var oThis = this;
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
        },

        _getData: function() {
            var oThis = this;
            var oView = oThis.getView();
            var oComponent = oThis.getOwnerComponent();

            var id = oComponent.getModel('UserData').getData().USER_ID;
            var role_name = oComponent.getModel('UserData').getData().ROLE_NAME;
            var role;

            switch (role_name) {
                case 'Admin':
                    role = '0';
                    break;
                case 'Supervisor':
                    role = '1';
                    break;
                case 'Operator':
                    role = '2';
                    break;
            }

            var data = { "action": "getATMByRole", "role": role, "user_id": id };

            BusyIndicator.show(0);

            Api.post(Urls.geckopit(), data)
                .done(function(d) {
                    var data = (d || d.result) ? d.result : [];
                    oComponent.setModel(new JSONModel(data), "atmData");
                    jQuery.sap.delayedCall(10, oThis, function() {
                        oThis._setData();
                    });
                })
                .fail(function(d) {
                    MessageToast.show(oThis.getI18nText('message_error_failed_to_fetch_data'));
                })
                .always(function(d) {
                    BusyIndicator.hide();
                });
        },

        _setData: function() {
            var oThis = this;
            var oView = oThis.getView();
            var oComponent = oThis.getOwnerComponent();
            var oList = oView.byId("atms-list");

            var type = oThis.getModelData("View", "/type");
            var value = oThis.getModelData("View", "/value");

            var data = Utils.objectCopy(oComponent.getModel('atmData').getData());
            var atms = [];

            data.forEach(function(operator, opi) {
                operator.BANKS.forEach(function(bank, bki) {
                    if (!bank.CRITICAL_COUNT) {
                        bank.CRITICAL_COUNT = 0;
                    }
                    bank.ticketDetails.forEach(function(ticket, tki) {
                        if ((ticket.TICKET_PRIORITY === "HIGH" || ticket.TICKET_PRIORITY === "High") && (ticket.TICKET_STATUS === "Opened" || ticket.TICKET_STATUS === "OPENED")) {
                            bank.CRITICAL_COUNT++;
                        }
                    });
                    var bankItem = Utils.objectCopy(bank);
                    bankItem.CRITICAL_COUNT = bankItem.CRITICAL_COUNT.toString();
                    delete bankItem.ticketDetails;

                    if (type === "priority" && value === "critical") {
                        if (bankItem.CRITICAL_COUNT !== "0") {
                            atms.push(bankItem)
                        }
                    } else {
                        atms.push(bankItem)
                    }
                });
            });

            oThis.setModel(new JSONModel({
                "data": atms,
                "searched_length": atms.length
            }), "ATMs");

            jQuery.sap.delayedCall(10, oThis, function() {
                oThis._setSelectedATM(atms[0], "/data/0");
                oList.setSelectedItem(oList.getItems()[0]);
            });
        },

        filterATMs: function(oEvent) {
            var oThis = this;
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
        },

        onATMSelection: function(oEvent) {
            var oThis = this;
            var oView = oThis.getView();

            var oICTb = oView.byId('atm-details-ictb');
            oICTb.setSelectedKey('info');

            var oSource = oEvent.getParameter('listItem');
            var oBinding = oSource.getBindingContext('ATMs');
            var sPath = oBinding.sPath;
            var data = Utils.objectCopy(oThis.getModelData('ATMs', sPath));
            oThis._setSelectedATM(data, sPath);
        },

        _setSelectedATM: function(data, path) {
            var oThis = this;
            oThis.setModel(new JSONModel({
                "data": data,
                "path": path
            }), 'SelectedATM');
        },

        onTabChange: function(oEvent) {
            var oThis = this;
            var oView = oThis.getView();
            var sKey = oEvent.getParameter("key");
            if (sKey === "sensors") {
                Api.get(Urls.sensors())
                    .done(function(d) {
                        jQuery.sap.delayedCall(10, oThis, function() {
                            oThis._setSensorsData(d.d.results[0]);
                        });
                    })
                    .fail(function(d) {
                        MessageToast.show(oThis.getI18nText('message_error_failed_to_fetch_data'));
                    })
                    .always(function(d) {
                        BusyIndicator.hide();
                    });
            }
        },

        _setSensorsData: function(data) {
            var oThis = this;
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
        },

        onCreateATM: function() {
            var oThis = this;
            var oView = oThis.getView();
            oThis._setCreateATMModel();
            if (!oThis.oATMCreate) {
                oThis.oATMCreate = sap.ui.xmlfragment("ipms.atm.app.fragments.ATMCreateDialog", oThis);
                oView.addDependent(oThis.oATMCreate);
            }
            BusyIndicator.show(0);
            oThis._getCreateATMData();
        },

        _getCreateATMData: function() {
            var oThis = this;

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
        },

        onCancelCreateATM: function() {
            var oThis = this;
            var oCore = sap.ui.getCore();
            var oNavContainer = oCore.byId("create-atm-nc");
            oThis.oATMCreate.close();
            oNavContainer.backToPage(oCore.byId("create-atm-page-1"));
            oThis._setCreateATMModel();
        },

        goToPage2: function() {
            var oThis = this;
            var oView = oThis.getView();
            var oCore = sap.ui.getCore();
            var oNavContainer = oCore.byId("create-atm-nc");
            oNavContainer.to(oCore.byId("create-atm-page-2"));
        },

        goToPage3: function() {
            var oThis = this;
            var oView = oThis.getView();
            var oCore = sap.ui.getCore();
            var oNavContainer = oCore.byId("create-atm-nc");
            oNavContainer.to(oCore.byId("create-atm-page-3"));
        },

        goBackToPage1: function() {
            var oThis = this;
            var oView = oThis.getView();
            var oCore = sap.ui.getCore();
            var oNavContainer = oCore.byId("create-atm-nc");
            oNavContainer.backToPage(oCore.byId("create-atm-page-1"));
        },

        goBackToPage2: function() {
            var oThis = this;
            var oView = oThis.getView();
            var oCore = sap.ui.getCore();
            var oNavContainer = oCore.byId("create-atm-nc");
            oNavContainer.backToPage(oCore.byId("create-atm-page-2"));
        },

        submitCreateATM: function() {
            var oThis = this;
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
                            oThis.onCancelCreateATM();
                        }
                    }
                })
                .fail(function(d) {
                    MessageToast.show(oThis.getI18nText('Failed to create ATM'));
                })
                .always(function(d) {
                    BusyIndicator.hide();
                });
        },

        onSensorSwitch: function() {
            var oThis = this;
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

        },

    });
});
