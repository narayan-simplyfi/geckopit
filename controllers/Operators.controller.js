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

	return BaseController.extend("ipms.atm.app.controllers.Operators", {

		Formatters: Formatters,

		onInit: function() {
			var oThis = this;
			var oView = oThis.getView();
			var oComponent = oThis.getOwnerComponent();
			oThis.Formatters = Formatters;
			oThis._router = oComponent.getRouter();
			oThis._router.getRoute("operators").attachMatched(oThis._init, oThis);
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

			var oFilter1 = oView.byId('operators-list-filter');
			var oFilter2 = oView.byId('operators-tickets-table-filter');
			oFilter1.setValue('');
			oFilter2.setValue('');

			var oICTb = oView.byId('operators-details-ictb');
			oICTb.setSelectedKey('all');

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
			var oList = oView.byId("operators-list");

			var type = oThis.getModelData("View", "/type");
			var value = oThis.getModelData("View", "/value");

			var data = Utils.objectCopy(oComponent.getModel('atmData').getData());

			var results = [];

			data.forEach(function(operator, opi) {
				if (!operator.atmsCount) {
					operator.atmsCount = 0;
				}
				if (!operator.tickets) {
					operator.tickets = [];
				}

				if (!operator.lowCount || !operator.mediumCount || !operator.highCount) {
					operator.lowCount = 0;
					operator.mediumCount = 0;
					operator.highCount = 0;
				}

				if (!operator.isCritical) {
					operator.isCritical = false;
				}

				operator.BANKS.forEach(function(bank, bki) {
					operator.atmsCount++;

					bank.ticketDetails.forEach(function(ticket, tki) {
						switch (ticket.TICKET_PRIORITY) {
							case 'HIGH':
							case 'High':
								operator.highCount++;
								break;
							case 'MEDIUM':
							case 'Medium':
								operator.mediumCount++;
								break;
							case 'LOW':
							case 'Low':
								operator.lowCount++;
								break;
						}
						operator.tickets.push(ticket);
						operator.operatorId = ticket.TICKT_FROM.toString();

						// if (type === "priority" && value === "critical") {
						if ((ticket.TICKET_PRIORITY === "HIGH" || ticket.TICKET_PRIORITY === "High") && (ticket.TICKET_STATUS === "Opened" ||
								ticket.TICKET_STATUS === "OPENED")) {
							operator.isCritical = true;
						}
						// }
					});
				});
				if (type === "priority" && value === "critical") {
					if (operator.isCritical) {
						results.push(operator);
					}
				} else {
					results.push(operator);
				}
			});

			oThis.setModel(new JSONModel({
				"data": results,
				"searched_length": results.length
			}), "Operators");

			// console.log(data)

			jQuery.sap.delayedCall(10, oThis, function() {
				oThis._setSelectedOperator(results[0], "/data/0");
				oList.setSelectedItem(oList.getItems()[0]);
			});
		},

		filterOperators: function(oEvent) {
			var oThis = this;
			var oView = oThis.getView();
			var oList = oView.byId("operators-list").getBinding("items");
			var aFilters = [];
			var sQuery = oEvent.getParameter("newValue");
			if (sQuery && sQuery.length > 0) {
				var filterId = new Filter("operatorId", "Contains", sQuery);
				var filterName = new Filter("operatorName", "Contains", sQuery);
				aFilters = new Filter([filterId, filterName]);
			}
			oList.filter(aFilters, "Application");
			oThis.setModelData('Operators', '/searched_length', oList.iLength);
		},

		onOperatorSelection: function(oEvent) {
			var oThis = this;
			var oView = oThis.getView();
			var oFilter = oView.byId('operators-tickets-table-filter');
			oFilter.setValue('');

			var oICTb = oView.byId('operators-details-ictb');
			oICTb.setSelectedKey('all');

			var oSource = oEvent.getParameter('listItem');
			var oBinding = oSource.getBindingContext('Operators');
			var sPath = oBinding.sPath;
			var data = Utils.objectCopy(oThis.getModelData('Operators', sPath));
			oThis._setSelectedOperator(data, sPath);
		},

		_setSelectedOperator: function(data, path) {
			var oThis = this;
			oThis.setModel(new JSONModel({
				"data": data,
				"searched_tickets_length": data.tickets.length,
				"path": path
			}), 'SelectedOperator');
		},

		onTicketsPrioChange: function(oEvent) {
			var oThis = this;
			var oView = oThis.getView();
			var oBinding = oView.byId("operators-tickets-table").getBinding("items");
			var oFilter1;
			var oFilter2;
			var sKey = oEvent.getParameter("key");
			if (sKey === "low") {
				oFilter1 = new Filter("TICKET_PRIORITY", "Contains", "LOW");
				oFilter2 = new Filter("TICKET_PRIORITY", "Contains", "Low");
				oBinding.filter([oFilter1, oFilter2]);
			} else if (sKey === "medium") {
				oFilter1 = new Filter("TICKET_PRIORITY", "Contains", "MEDIUM");
				oFilter2 = new Filter("TICKET_PRIORITY", "Contains", "Medium");
				oBinding.filter([oFilter1, oFilter2]);
			} else if (sKey === "high") {
				oFilter1 = new Filter("TICKET_PRIORITY", "Contains", "HIGH");
				oFilter2 = new Filter("TICKET_PRIORITY", "Contains", "High");
				oBinding.filter([oFilter1, oFilter2]);
			} else {
				oBinding.filter([]);
			}
		},

		filterOperatorTickets: function(oEvent) {
			var oThis = this;
			var oView = oThis.getView();
			var oList = oView.byId("operators-tickets-table").getBinding("items");
			var aFilters = [];
			var sQuery = oEvent.getParameter("newValue");

			if (sQuery && sQuery.length > 0) {
				var filterID = new Filter("TICKET_ID", "Contains", sQuery);
				var filterATM = new Filter("ATM_ID", "Contains", sQuery);
				var filterBank = new Filter("BANK_NAME", "Contains", sQuery);
				var filterArea = new Filter("AREA_NAME", "Contains", sQuery);
				var filterSubject = new Filter("TICKET_SUBJECT", "Contains", sQuery);
				var filterDescription = new Filter("TICKET_DESCRIPTION", "Contains", sQuery);
				var filterStatus = new Filter("TICKET_STATUS", "Contains", sQuery);
				var filterPrio = new Filter("TICKET_PRIORITY", "Contains", sQuery);
				var filterCreated = new Filter("CREATED", "Contains", sQuery);

				aFilters = new Filter([filterID, filterATM, filterBank, filterArea, filterSubject, filterStatus, filterPrio, filterCreated]);
			}
			oList.filter(aFilters, "Application");
		},

	});
});