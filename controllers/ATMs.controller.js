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
	"ipms/atm/app/helpers/Formatters",
	"ipms/atm/app/helpers/ATMView/List",
	"ipms/atm/app/helpers/ATMView/Map",
	"ipms/atm/app/helpers/ATMView/Sensors"
], function(BaseController, HashChanger, JSONModel, BusyIndicator, MessageBox, MessageToast, Filter, Api, Utils, Urls, Formatters, List,
	Map,
	Sensors) {
	"use strict";

	return BaseController.extend("ipms.atm.app.controllers.ATMs", {

		Formatters: Formatters,

		onInit: function() {
			var oThis = this;
			var oComponent = oThis.getOwnerComponent();
			oThis.Formatters = Formatters;
			oThis._router = oComponent.getRouter();
			oThis._router.getRoute("atms").attachMatched(oThis._init, oThis);
			oThis._hashChanger = new HashChanger();
		},

		onAfterRendering: function() {
			var oThis = this;
			var oView = oThis.getView();
			Map.init(oThis);
		},

		_map: null,
		_markers: [],

		_init: function(oEvent) {
			var oThis = this;
			var oComponent = oThis.getOwnerComponent();
			if (!localStorage.getItem("ipms-user-details")) {
				oThis.route("login", null);
				return;
			} else {
				oComponent.setModel(new JSONModel(JSON.parse(localStorage.getItem("ipms-user-details"))), "UserData");
			}

			List.init(oThis);

			var params = oEvent.getParameter("arguments");
			oThis._setModels(params);
			oThis._getData();
		},

		_setModels: function(params) {
			var oThis = this;
			oThis.setModel(new JSONModel({
				"type": params.type,
				"value": params.value,
				"show": "list",
				"popPage": "1"
			}), "View");

			oThis.setModel(new JSONModel({
				"status": [{
					"name": "All",
					"key": "",
					"selected": true
				}, {
					"name": "Critical",
					"key": "critical",
					"selected": false
				}, {
					"name": "Ok",
					"key": "low",
					"selected": false
				}],
				"banks": []
			}), "ATMFilters");

			List.setModels(oThis);
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

			var data = {
				"action": "getATMByRole",
				"role": role,
				"user_id": id
			};

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

			var type = oThis.getModelData("View", "/type");
			var value = oThis.getModelData("View", "/value");

			var data = Utils.objectCopy(oComponent.getModel('atmData').getData());
			var atms = [];

			var banksFilter = [];

			data.forEach(function(operator, opi) {
				operator.BANKS.forEach(function(bank, bki) {
					if (!bank.CRITICAL_COUNT) {
						bank.CRITICAL_COUNT = 0;
					}

					if (!bank.ticketsCount) {
						bank.ticketsCount = {
							total: 0,
							open: 0,
							critical: 0
						};
					}

					if (banksFilter.indexOf(bank.BANK_NAME) === -1) {
						banksFilter.push(bank.BANK_NAME);
					}

					bank.ticketDetails.forEach(function(ticket, tki) {
						bank.ticketsCount.total++;
						if ((ticket.TICKET_PRIORITY === "HIGH" || ticket.TICKET_PRIORITY === "High") && (ticket.TICKET_STATUS === "Opened" ||
								ticket.TICKET_STATUS === "OPENED")) {
							bank.CRITICAL_COUNT++;
							bank.ticketsCount.critical++;
						}

						if ((ticket.TICKET_STATUS === "Opened" || ticket.TICKET_STATUS === "OPENED")) {
							bank.ticketsCount.open++;
						}
					});
					var bankItem = Utils.objectCopy(bank);
					bankItem.isPinned = (bankItem.isPinned === "0") ? false : true;
					bankItem.CRITICAL_COUNT = bankItem.CRITICAL_COUNT.toString();
					delete bankItem.ticketDetails;

					if (type === "priority" && value === "critical") {
						if (bankItem.CRITICAL_COUNT !== "0") {
							atms.push(bankItem);
						}
					} else {
						atms.push(bankItem);
					}
				});
			});

			if (!oThis.getModel("ATMFilters") || ((banksFilter.length + 1) !== (oThis.getModelData("ATMFilters", "/banks/length")))) {
				var finalBankFilters = [{
					"name": "All",
					"key": "",
					"selected": true
				}];

				banksFilter.forEach(function(bank, index) {
					finalBankFilters.push({
						"name": bank,
						"key": bank,
						"selected": false
					});
				});
				oThis.setModelData("ATMFilters", "/banks", finalBankFilters);
			}

			oThis.setModel(new JSONModel({
				"data": atms,
				"searched_length": atms.length
			}), "ATMs");

			oThis.setModel(new JSONModel({
				"data": atms,
				"searched_length": atms.length
			}), "AllATMs");

			Sensors.setData(oThis);
		},

		filterData: function() {
			var oThis = this;
			var status = oThis.getModelData("ATMFilters", "/status");
			var banks = oThis.getModelData("ATMFilters", "/banks");

			var atms = Utils.objectCopy(oThis.getModelData("AllATMs", "/data"));
			var filteredATMS = [];

			var statusFilters = [];
			var banksFilters = [];

			status.forEach(function(single, index) {
				if (single.selected && (single.key !== "")) {
					statusFilters.push(single.key);
				}
			});

			banks.forEach(function(bank, index) {
				if (bank.selected && (bank.key !== "")) {
					banksFilters.push(bank.key);
				}
			});

			if (statusFilters.length === 0 && banksFilters.length === 0) {
				filteredATMS = atms;
			} else if (statusFilters.length !== 0 && banksFilters.length === 0) {
				atms.forEach(function(atm, index) {
					if (statusFilters.indexOf(atm.sensor_status) !== -1) {
						filteredATMS.push(atm);
					}
				});
			} else if (statusFilters.length === 0 && banksFilters.length !== 0) {
				atms.forEach(function(atm, index) {
					if (banksFilters.indexOf(atm.BANK_NAME) !== -1) {
						filteredATMS.push(atm);
					}
				});
			} else {
				atms.forEach(function(atm, index) {
					if (statusFilters.indexOf(atm.sensor_status) !== -1 && banksFilters.indexOf(atm.BANK_NAME) !== -1) {
						filteredATMS.push(atm);
					}
				});
			}

			oThis.setModel(new JSONModel({
				"data": filteredATMS,
				"searched_length": filteredATMS.length
			}), "ATMs");
			List.setData(oThis);
			Map.setData(oThis);
		},

		handleShowFilters: function() {
			var oThis = this;
			var oView = oThis.getView();
			if (!oThis._oATMFilters) {
				oThis._oATMFilters = sap.ui.xmlfragment("ipms.atm.app.fragments.ATMView.Filters", oThis);
				oView.addDependent(oThis._oATMFilters);
			}
			var backUpData = Utils.objectCopy(oThis.getModelData('ATMFilters', '/'));
			oThis.setModel(new JSONModel(backUpData), 'ATMFiltersBackUp');
			oThis._oATMFilters.open();			
		},
		
		applyFilters: function() {
			var oThis = this;
			oThis.filterData();	
			oThis._oATMFilters.close();
		},

		clearFilters: function() {
			var oThis = this;
			var status = oThis.getModelData("ATMFilters", "/status");
			var banks = oThis.getModelData("ATMFilters", "/banks");
			status.forEach(function(single, index) {
				if (single.name === "All") {
					single.selected = true;
				} else {
					single.selected = false;
				}
			});
			banks.forEach(function(bank, index) {
				if (bank.name === "All") {
					bank.selected = true;
				} else {
					bank.selected = false;
				}
			});
			oThis.setModelData("ATMFilters", "/status", status);
			oThis.setModelData("ATMFilters", "/banks", banks);
			oThis.applyFilters();
		},

		closeFilters: function() {
			var oThis = this;
			var originalFiltersData = Utils.objectCopy(oThis.getModelData('ATMFiltersBackUp', '/'));
			oThis.setModelData('ATMFilters', '/', originalFiltersData);
			oThis._oATMFilters.close();
		},		

		handleStatusFilterChange: function(oEvent) {
			var oThis = this;
			var status = oThis.getModelData("ATMFilters", "/status");
			var id = oEvent.getParameter("id");
			var selected = oEvent.getParameter("selected");
			var oCheckbox = sap.ui.getCore().byId(id);
			var text = oCheckbox.getText();
			if (selected && text === "All") {
				status.forEach(function(single, index) {
					if (single.name !== "All") {
						single.selected = false;
					}
				});
			} else {
				status.forEach(function(single, index) {
					if (single.name === "All") {
						single.selected = false;
					}
				});
			}
			oThis.setModelData("ATMFilters", "/status", status);
		},
		
		handleBankFilterChange: function(oEvent) {
			var oThis = this;
			var banks = oThis.getModelData("ATMFilters", "/banks");
			var id = oEvent.getParameter("id");
			var selected = oEvent.getParameter("selected");
			var oCheckbox = sap.ui.getCore().byId(id);
			var text = oCheckbox.getText();
			if (selected && text === "All") {
				banks.forEach(function(bank, index) {
					if (bank.name !== "All") {
						bank.selected = false;
					}
				});
			} else {
				banks.forEach(function(bank, index) {
					if (bank.name === "All") {
						bank.selected = false;
					}
				});
			}
			oThis.setModelData("ATMFilters", "/banks", banks);
		},

		handleChangeView: function(oEvent) {
			var oThis = this;
			var oSource = oEvent.getSource();
			var view = oSource.data("view");
			oThis.setModelData("View", "/show", view);
			if (view === "list") {
				List.refresh(oThis);
			}
		},

		filterATMs: function(oEvent) {
			var oThis = this;
			List.filter(oThis, oEvent);
		},

		onATMSelection: function(oEvent) {
			var oThis = this;
			List.selection(oThis, oEvent);
		},

		onCreateATM: function() {
			var oThis = this;
			List.openCreate(oThis);
		},

		onCancelCreateATM: function() {
			var oThis = this;
			List.closeCreate(oThis);
		},

		goToCreateATMPage2: function() {
			var oThis = this;
			List.goToPage2(oThis);
		},

		goToCreateATMPage3: function() {
			var oThis = this;
			List.goToPage3(oThis);
		},

		goBackToCreateATMPage1: function() {
			var oThis = this;
			List.goBackToPage1(oThis);
		},

		goBackToCreateATMPage2: function() {
			var oThis = this;
			List.goBackToPage2(oThis);
		},

		submitCreateATM: function() {
			var oThis = this;
			List.create(oThis);
		},

		onSensorSwitch: function() {
			var oThis = this;
			List.sensorSwitch(oThis);
		},

		handleATMPin: function(oEvent) {
			var oThis = this;
			var oSource = oEvent.getSource();
			if (oSource.data('action') === 'pin') {
				Map.pin(oThis);
			} else {
				Map.unpin(oThis);
			}
		},

		openPinnedDetails: function(oEvent) {
			var oThis = this;
			Map.selectPinned(oThis, oEvent);
		},

		handleATMPopNav: function(oEvent) {
			var oThis = this;
			Map.popupNav(oThis, oEvent);
		},

		atmPopupGoToTM: function(oEvent) {
			var oThis = this;
			Map.goToTickets(oThis, oEvent);
		}
	});
});