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

	return BaseController.extend("ipms.atm.app.controllers.TicketManagement", {

		Formatters: Formatters,

		onInit: function() {
			var oThis = this;
			var oView = oThis.getView();
			var oComponent = oThis.getOwnerComponent();
			oThis.Formatters = Formatters;
			oThis._router = oComponent.getRouter();
			oThis._router.getRoute("ticket-management").attachMatched(oThis._init, oThis);
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

			var oFilter = oView.byId('tickets-list-filter');
			oFilter.setValue('');

			var params = oEvent.getParameter("arguments");
			oThis._setModels(params);
			oThis._getData();
		},

		_setModels: function(params) {
			var oThis = this;
			oThis.setModel(new JSONModel({
				"type": params.type,
				"value": params.value,
				"atm": params.atm,
				"ticket_id": params.ticket_id
			}), "View");
			oThis.setModel(new JSONModel({
				"action": null,
				"text": ""
			}), "TicketAction");
			oThis.setModel(new JSONModel({
				"atm": "",
				"priority": "HIGH",
				"subject": "",
				"comments": "",
				"all_atms": []
			}), "TicketCreate");
		},

		_getData: function(flag) {
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
						oThis._setData(flag);
					});
				})
				.fail(function(d) {
					MessageToast.show(oThis.getI18nText('message_error_failed_to_fetch_data'));
				})
				.always(function(d) {
					BusyIndicator.hide();
				});
		},

		_setData: function(flag) {
			var oThis = this;
			var oView = oThis.getView();
			var oComponent = oThis.getOwnerComponent();
			var oList = oView.byId("tickets-list");

			var type = oThis.getModelData("View", "/type");
			var value = oThis.getModelData("View", "/value");
			var atm = oThis.getModelData("View", "/atm");
			var ticket_id = oThis.getModelData("View", "/ticket_id");

			var data = Utils.objectCopy(oComponent.getModel('atmData').getData());
			var atms = [];
			var tickets = [];

			data.forEach(function(operator, opi) {
				operator.BANKS.forEach(function(bank, bki) {
					atms.push({
						"id": bank.ATM_ID,
						"name": bank.ATM_NAME,
						"deviceid": bank.DEVICEID,
						"operatorId": operator.operatorId
					});
					bank.ticketDetails.forEach(function(ticket, tki) {
						if (ticket_id && ticket_id !== "") {
							if (ticket.TICKET_ID === ticket_id) {
								tickets.push(ticket);
							}
						} else if (type === "status" && value === "open" && atm) {
							if ((ticket.TICKET_STATUS === "Opened" || ticket.TICKET_STATUS === "OPENED") && ticket.ATM_ID === atm) {
								tickets.push(ticket);
							}
						} else if (type === "priority" && value === "critical" && atm) {
							if (((ticket.TICKET_PRIORITY === "HIGH" || ticket.TICKET_PRIORITY === "High") && (ticket.TICKET_STATUS === "Opened" ||
									ticket.TICKET_STATUS === "OPENED")) && ticket.ATM_ID === atm) {
								tickets.push(ticket);
							}
						} else if (type === "-" && value === "-" && atm) {
							if (ticket.ATM_ID === atm) {
								tickets.push(ticket);
							}
						} else if (type === "status" && value === "open") {
							if (ticket.TICKET_STATUS === "Opened" || ticket.TICKET_STATUS === "OPENED") {
								tickets.push(ticket);
							}
						} else if (type === "priority" && value === "critical") {
							if ((ticket.TICKET_PRIORITY === "HIGH" || ticket.TICKET_PRIORITY === "High") && (ticket.TICKET_STATUS === "Opened" ||
									ticket.TICKET_STATUS === "OPENED")) {
								tickets.push(ticket);
							}
						} else {
							tickets.push(ticket);
						}
					});
				});
			});

			tickets.sort(function(a, b) {
				if (a.TICKET_PRIORITY === "HIGH" && b.TICKET_PRIORITY !== "HIGH") {
					return -1;
				} else if (a.TICKET_PRIORITY !== "HIGH" && b.TICKET_PRIORITY === "HIGH") {
					return 1;
				} else if (a.TICKET_PRIORITY === "MEDIUM" && b.TICKET_PRIORITY !== "HIGH") {
					return -1;
				} else if (a.TICKET_PRIORITY === "LOW" && b.TICKET_PRIORITY !== "LOW") {
					return 1;
				}
			});

			oThis.setModel(new JSONModel({
				"data": tickets,
				"searched_length": tickets.length
			}), "Tickets");

			jQuery.sap.delayedCall(10, oThis, function() {
				oThis._setSelectedTicket(tickets[0], "/data/0");
				oList.setSelectedItem(oList.getItems()[0]);
			});

			oThis.setModelData('TicketCreate', '/all_atms', atms);

			if (type === "create") {
				if (flag) {
					var params = {};
					params.type = "";
					params.value = "";
					params.atm = "";
					oThis.route("ticket-management", params);
				} else {
					oThis.onCreateTicket();
				}
			}
		},

		filterTickets: function(oEvent) {
			var oThis = this;
			var oView = oThis.getView();
			var oList = oView.byId("tickets-list").getBinding("items");
			var aFilters = [];
			var sQuery = oEvent.getParameter("newValue");
			if (sQuery && sQuery.length > 0) {
				var filterSubject = new Filter("TICKET_SUBJECT", "Contains", sQuery);
				var filterPrio = new Filter("TICKET_PRIORITY", "Contains", sQuery);
				var filterStatus = new Filter("TICKET_STATUS", "Contains", sQuery);
				var filterTicketTo = new Filter("TICKET_TO", "Contains", sQuery);
				var filterATM = new Filter("ATM_ID", "Contains", sQuery);
				aFilters = new Filter([filterSubject, filterPrio, filterStatus, filterTicketTo, filterATM]);
			}
			oList.filter(aFilters, "Application");
			oThis.setModelData('Tickets', '/searched_length', oList.iLength);
		},

		onTicketSelection: function(oEvent) {
			var oThis = this;
			var oSource = oEvent.getParameter('listItem');
			var oBinding = oSource.getBindingContext('Tickets');
			var sPath = oBinding.sPath;
			var data = Utils.objectCopy(oThis.getModelData('Tickets', sPath));
			oThis._setSelectedTicket(data, sPath);
		},

		_setSelectedTicket: function(data, path) {
			var oThis = this;
			if (!data) {
				oThis.setModel(new JSONModel({
					"data": [],
					"path": null
				}), 'SelectedTicket');
				return;
			}
			data.CREATED = Formatters.date("dd MMM, yyyy hh:mm:ss", data.CREATED);
			data.MODIFIED = Formatters.date("dd MMM, yyyy hh:mm:ss", data.MODIFIED);
			oThis.setModel(new JSONModel({
				"data": data,
				"path": path
			}), 'SelectedTicket');
		},

		handleTicketAction: function(oEvent) {
			var oThis = this;
			var oView = oThis.getView();
			var oSource = oEvent.getSource();
			var type = oSource.data().type;
			oThis.setModelData('TicketAction', '/action', type);
			oThis.setModelData('TicketAction', '/text', '');
			if (!oThis.oTicketsAction) {
				oThis.oTicketsAction = sap.ui.xmlfragment("ipms.atm.app.fragments.TicketActionsDialog", oThis);
				oView.addDependent(oThis.oTicketsAction);
			}
			oThis.oTicketsAction.open();
		},

		onSubmitTicketActions: function(oEvent) {
			var oThis = this;
			var oView = oThis.getView();

			var selected = Utils.objectCopy(oThis.getModelData('SelectedTicket', '/data'));
			var path = Utils.objectCopy(oThis.getModelData('SelectedTicket', '/path'));

			var action = oThis.getModelData('TicketAction', '/action');
			var text = selected.TICKET_DESCRIPTION;
			text += "\n\n" + action.toLowerCase().charAt(0).toUpperCase() + action.toLowerCase().slice(1);
			text += " at (" + Formatters.date("dd MMM, YYYY hh:mm:ss", new Date()) + ") :";
			text += "\n" + oThis.getModelData('TicketAction', '/text');

			var data = {
				"action": "updateTicket",
				"ticketDetails": {
					"TICKET_ID": Number(selected.TICKET_ID),
					"TICKET_STATUS": action,
					"TICKET_DESCRIPTION": text
				}
			};

			BusyIndicator.show(0);

			Api.post(Urls.geckopit(), data)
				.done(function(d) {
					if (d.result && d.result[0] && d.result[0].STATUS_MSG) {
						MessageToast.show(d.result[0].STATUS_MSG);
						if (d.result[0].STATUS_CODE === "201") {
							oThis.oTicketsAction.close();
							oThis.setModelData('Tickets', path + "/TICKET_STATUS", action);
							oThis.setModelData('Tickets', path + "/TICKET_DESCRIPTION", text);
							oThis.setModelData('SelectedTicket', "/data/TICKET_STATUS", action);
							oThis.setModelData('SelectedTicket', "/data/TICKET_DESCRIPTION", text);
						}
					}
				})
				.fail(function(d) {
					MessageToast.show(oThis.getI18nText('message_ticket_update_failed'));
				})
				.always(function(d) {
					BusyIndicator.hide();
				});
		},

		onCancelTicketActions: function(oEvent) {
			var oThis = this;
			oThis.setModelData('TicketAction', '/action', null);
			oThis.setModelData('TicketAction', '/text', '');
			oThis.oTicketsAction.close();
		},

		onCreateTicket: function() {
			var oThis = this;
			var oView = oThis.getView();
			var type = oThis.getModelData("View", "/type");
			var value = oThis.getModelData("View", "/value");
			oThis.setModelData('TicketCreate', '/priority', 'HIGH');
			oThis.setModelData('TicketCreate', '/subject', '');
			oThis.setModelData('TicketCreate', '/comments', '');
			if (!oThis.oTicketCreate) {
				oThis.oTicketCreate = sap.ui.xmlfragment("ipms.atm.app.fragments.TicketCreateDialog", oThis);
				oView.addDependent(oThis.oTicketCreate);
			}

			if (type === "create") {
				oThis.setModelData('TicketCreate', '/atm', value);
				oThis.getComments();
			} else {
				oThis.setModelData('TicketCreate', '/atm', '');
				oThis.oTicketCreate.open();
			}
		},

		getComments: function() {
			var oThis = this;
			var atmId = oThis.getModelData("View", "/value");
			var allAtms = oThis.getModelData('TicketCreate', '/all_atms');
			var deviceId = null;
			allAtms.forEach(function(atm, index) {
				if (atm.id === atmId) {
					deviceId = atm.deviceid;
				}
			});
			if (deviceId) {
				oThis._fetchSensorData(deviceId)
					.done(function(msg) {
						var issues = msg.split("\n");
						var count = issues.length;
						if (count === 1) {
							oThis.setModelData('TicketCreate', '/subject', atmId + ": " + issues[0]);
						} else if (count > 1) {
							oThis.setModelData('TicketCreate', '/subject', atmId + ": " + count + " Issues Found");
						}
						oThis.setModelData('TicketCreate', '/comments', msg);
					})
					.fail(function(msg) {})
					.always(function() {
						oThis.oTicketCreate.open();
					});
			} else {
				oThis.oTicketCreate.open();
			}
		},

		_fetchSensorData: function(device_id) {
			var oThis = this;
			var def = jQuery.Deferred();
			BusyIndicator.show(0);
			var oComponent = oThis.getOwnerComponent();
			var oData = oComponent.getModel("IoT");
			oData.read("/app.svc/IPMS_SENSOR.T_IOT_1F0D3E4EB8C68DF7577E?$top=1&$filter=G_DEVICE eq '" + device_id + "'", null, null,
				false,
				function(d) {
					if (d.results.length > 0) {
						oThis._generateComment(d.results)
							.done(function(msg) {
								def.resolve(msg);
							})
							.fail(function(msg) {
								def.reject(msg);
							});
					} else {
						def.reject(-1);
						MessageToast.show("No sensor data found for this ATM");
					}
					BusyIndicator.hide();
				},
				function(d) {
					def.reject(-1);
					MessageToast.show(oThis.getI18nText('message_error_failed_to_fetch_data'));
					BusyIndicator.hide();
				}
			);
			return def.promise();
		},

		_generateComment: function(data) {
			var def = jQuery.Deferred();
			var msg = "";
			var sensors = data[0];
			for (var i in sensors) {
				switch (i) {
					case 'C_VIBRATION':
						msg += (sensors[i]['C_VIBRATION'] == 0) ? "" : "Possible vibration on ATM machine \n";
						break;
					case 'C_TEMPERATURE':
						msg += sensors[i]['C_TEMPERATURE'] >= 18 && sensors[i]['C_TEMPERATURE'] <= 22 ? "" : "Temperature is not normal \n";
						break;
					case 'Contact':
						msg += "";
						break;
					case 'Motion':
						msg += "";
						break;
					case 'C_PIR':
						msg += (sensors[i]['C_PIR'] == 0) ? "" : "Person intrusion detected \n";
						break;
					case 'C_DOOR1':
						msg += (sensors[i]['C_DOOR1'] == 0) ? "" : "Back door 1 is open \n";
						break;
					case 'C_DOOR2':
						msg += (sensors[i]['C_DOOR2'] == 0) ? "" : "Back door 2 is open \n";
						break;
					case 'C_SMOKE':
						msg += (sensors[i]['C_SMOKE'] == 0) ? "" : "Possible smoke in ATM \n";
						break;
					case 'C_POWERVALUE':
						msg += (sensors[i]['C_POWERVALUE'] >= 6 && sensors[i]['C_POWERVALUE'] <= 10) ? "" : "Power is critical \n";
						break;
					case 'C_VOLTAGEVALUE':
						msg += (sensors[i]['C_VOLTAGEVALUE'] >= 180 && sensors[i]['C_VOLTAGEVALUE'] <= 240) ? "" : "Voltage is not normal \n";
						break;
					case 'C_PANICBUTTON':
						msg += (sensors[i]['C_PANICBUTTON'] == 0) ? "" : "Panic button pressed \n";
						break;
					case 'C_AC1':
						msg += (sensors[i]['C_AC1'] == 0) ? "AC 1 is off \n" : "";
						break;
					case 'C_AC2':
						msg += (sensors[i]['C_AC2'] == 0) ? "AC 2 is off \n" : "";
						break;
					case 'C_ALARM':
						msg += (sensors[i]['C_ALARM'] == 0) ? "" : "Alarm raised \n";
						break;
					case 'C_RFID':
						msg += "";
						break;
					case 'C_POWERSTATUS':
						msg += (sensors[i]['C_POWERSTATUS'] == 0) ? "Power is off \n" : "";
						break;
					case 'C_CURRENTVALUE':
						msg += (sensors[i]['C_CURRENTVALUE'] >= 8 && sensors[i]['C_CURRENTVALUE'] <= 10) ? "" : "Current value is not normal \n";
						break;
					case 'C_SPEAKER':
						msg += (sensors[i]['C_SPEAKER'] == 0) ? "Speaker not working \n" : "";
						break;
					case 'C_CAMERA1STATUS':
						msg += (sensors[i]['C_CAMERA1STATUS'] == 0) ? "Camera 1 not working \n" : "";
						break;
					case 'C_CAMERA2STATUS':
						msg += (sensors[i]['C_CAMERA2STATUS'] == 0) ? "Camera 2 not working \n" : "";
						break;
					case 'C_CAMERA3STATUS':
						msg += (sensors[i]['C_CAMERA3STATUS'] == 0) ? "Camera 3 not working \n" : "";
						break;
					case 'C_CAMERA4STATUS':
						msg += (sensors[i]['C_CAMERA4STATUS'] == 0) ? "Camera 4 not working \n" : "";
						break;
					case 'C_LIGHT':
						msg += (sensors[i]['C_LIGHT'] == 0) ? "Light not working \n" : "";
						break;
					case 'C_CONTROLBOX':
						msg += (sensors[i]['C_CONTROLBOX'] == 0) ? "Control box not working \n" : "";
						break;
					default:
						break;
				}
			}
			def.resolve(msg);

			return def.promise();
		},

		onSubmitTicketCreate: function(oEvent) {
			var oThis = this;
			var oComponent = oThis.getOwnerComponent();
			var oView = oThis.getView();
			var userData = oComponent.getModel('UserData').getData();
			var ticketData = oThis.getModelData('TicketCreate', '/');

			var text = "Opened";
			text += " at (" + Formatters.date("dd MMM, YYYY hh:mm:ss", new Date()) + ") :";
			text += "\n" + oThis.getModelData('TicketCreate', '/comments');

			var atmId = ticketData.atm;
			var allAtms = oThis.getModelData('TicketCreate', '/all_atms');
			var operatorId;
			
			allAtms.forEach(function(atm, index) {
				if (atm.id === atmId) {
					operatorId = Number(atm.operatorId);
				}
			});
			
			var data = {
				"action": "createTicket",
				"ticketDetails": {
					"TICKET_TO": operatorId,
					"TICKET_SUBJECT": ticketData.subject,
					"TICKET_DESCRIPTION": text,
					"TICKET_STATUS": "OPENED",
					"TICKET_PRIORITY": ticketData.priority,
					"TICKET_FROM": userData.USER_ID,
					"ATMID": ticketData.atm
				}
			};

			BusyIndicator.show(0);

			Api.post(Urls.geckopit(), data)
				.done(function(d) {
					if (d.result && d.result[0] && d.result[0].STATUS_MSG) {
						MessageToast.show(d.result[0].STATUS_MSG);
						if (d.result[0].STATUS_CODE === "201") {
							oThis.oTicketCreate.close();
							oThis._getData(true);
						}
					}
				})
				.fail(function(d) {
					MessageToast.show(oThis.getI18nText('message_ticket_create_failed'));
				})
				.always(function(d) {
					BusyIndicator.hide();
				});

		},

		onCancelTicketCreate: function(oEvent) {
			var oThis = this;
			var oView = oThis.getView();
			oThis.setModelData('TicketCreate', '/atm', '');
			oThis.setModelData('TicketCreate', '/priority', 'HIGH');
			oThis.setModelData('TicketCreate', '/subject', '');
			oThis.setModelData('TicketCreate', '/comments', '');
			oThis.oTicketCreate.close();
		},

	});
});