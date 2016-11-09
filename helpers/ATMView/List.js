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

	var setData = function(oThis) {
		var oView = oThis.getView();
		var oList = oView.byId("atms-list");
		var oICTb = oView.byId('atm-details-ictb');
		var data = oThis.getModelData("ATMs", "/data/");
		_setSelectedATM(oThis, (data[0] || []), "/data/0");
		oList.setSelectedItem(oList.getItems()[0]);
		oICTb.setSelectedKey('info');
	};

	var _setSelectedATM = function(oThis, data, path) {
		oThis.setModel(new JSONModel({
			"data": data,
			"path": path
		}), 'SelectedATM');
	};

	var refresh = function(oThis) {
		var oView = oThis.getView();
		var oList = oView.byId("atms-list");

		if (!oThis.getModel("SelectedATM")) {
			return;
		}

		var path = oThis.getModelData("SelectedATM", "/path");
		var index = path.substr(path.lastIndexOf("/") + 1, path.length);
		oList.setSelectedItem(oList.getItems()[index]);
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

		var user = {
			"action": "getAllUsers"
		};
		var bank = {
			"action": "getAllBanks"
		};
		var city = {
			"action": "getAllCity"
		};
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
		var data = Utils.objectCopy(oThis.getModelData("View", "/bankIds"));
		var enteredId = oThis.getModelData("ATM", "/atmId");
		var oInput = oCore.byId('create-atm-id-input');
		if (data.indexOf(enteredId) === -1) {
			oInput.setValueState("None");
			oInput.setValueStateText("");
			oNavContainer.to(oCore.byId("create-atm-page-2"));
		} else {
			oInput.setValueState("Error");
			oInput.setValueStateText("ATM ID already exists!");
		}
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
		refresh: refresh,
		filter: filter,
		selection: selection,
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