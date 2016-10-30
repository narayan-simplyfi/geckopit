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

    return BaseController.extend("ipms.atm.app.controllers.Dashboard", {

        Formatters: Formatters,

        onInit: function() {
            var oThis = this;
            var oView = oThis.getView();
            var oComponent = oThis.getOwnerComponent();
            oThis.Formatters = Formatters;
            oThis._router = oComponent.getRouter();
            oThis._router.getRoute("dashboard").attachMatched(oThis._init, oThis);
            oThis._router.getRoute("all").attachMatched(oThis._init, oThis);
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
            oThis._setModels();
            oThis._getData();
        },

        _setModels: function() {
            var oThis = this;
            oThis.setModel(new JSONModel({
                "atms": {
                    "total": 0,
                    "critical": 0
                },
                "tickets": {
                    "total": 0,
                    "open": 0,
                    "critical": 0
                },
                "operators": {
                    "total": 0,
                    "critical": 0
                },
                "users": {
                    "total": 0,
                    "active": 0,
                    "deactive": 0
                }
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

            var data = { "action": "getATMByRole", "role": role, "user_id": id };

            BusyIndicator.show(0);

            Api.post(Urls.geckopit(), data)
                .done(function(d) {
                    var data = (d || d.result) ? d.result : [];
                    oComponent.setModel(new JSONModel(data), "atmData");
                    jQuery.sap.delayedCall(10, oThis, function() {
                        oThis._setViewData();
                    });
                })
                .fail(function(d) {
                    MessageToast.show('Error getting data');
                })
                .always(function(d) {
                    BusyIndicator.hide();
                });
        },

        _setViewData: function() {
            var oThis = this;
            var oComponent = oThis.getOwnerComponent();

            var data = oComponent.getModel('atmData').getData();

            var total_atms = 0;
            var critical_atms = [];

            var total_tickets = 0;
            var open_tickets = 0;
            var critical_tickets = 0;

            var total_operators = data.length;
            var critical_operators = [];

            data.forEach(function(operator, opi) {
                operator.BANKS.forEach(function(bank, bki) {
                    total_atms++;
                    bank.ticketDetails.forEach(function(ticket, tki) {
                        total_tickets++;
                        if (ticket.TICKET_STATUS === "Opened" || ticket.TICKET_STATUS === "OPENED") {
                            open_tickets++;
                        }

                        if ( (ticket.TICKET_PRIORITY === "HIGH" || ticket.TICKET_PRIORITY === "High") && (ticket.TICKET_STATUS === "Opened" || ticket.TICKET_STATUS === "OPENED")) {
                            critical_tickets++;
                            if (critical_operators.indexOf(operator.operatorEmail) === -1) {
                                critical_operators.push(operator.operatorEmail);
                            }
                            if (critical_atms.indexOf(bank.ATM_ID) === -1) {
                                critical_atms.push(bank.ATM_ID);
                            }
                        }
                    });
                });
            });

            oThis.setModelData("View", "/atms/total", total_atms);
            oThis.setModelData("View", "/atms/critical", critical_atms.length);

            oThis.setModelData("View", "/tickets/total", total_tickets);
            oThis.setModelData("View", "/tickets/open", open_tickets);
            oThis.setModelData("View", "/tickets/critical", critical_tickets);

            oThis.setModelData("View", "/operators/total", total_operators);
            oThis.setModelData("View", "/operators/critical", critical_operators.length);

        },

        handleTileNav: function(oEvent) {
            var oThis = this;
            var oSource = oEvent.getSource();
            var data = oSource.data();
            var params = {};
            if (data.type) params.type = data.type;
            if (data.value) params.value = data.value;
            oThis.route(data.app, params);
        }


    });
});
