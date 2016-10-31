sap.ui.define([
    "ipms/atm/app/controllers/BaseController",
    "sap/ui/core/routing/HashChanger",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "ipms/atm/app/helpers/Api",
    "ipms/atm/app/helpers/Utils",
    "ipms/atm/app/helpers/Urls",
    "ipms/atm/app/helpers/Formatters",
    "ipms/atm/app/helpers/ATMView/List",
    "ipms/atm/app/helpers/ATMView/Map",
    "ipms/atm/app/helpers/ATMView/Sensors"
], function(BaseController, HashChanger, JSONModel, BusyIndicator, MessageBox, MessageToast, Api, Utils, Urls, Formatters, List, Map, Sensors) {
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
                "show": "map"
            }), "View");
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

            oThis.setModel(new JSONModel({
                "data": atms,
                "searched_length": atms.length
            }), "ATMs");

            Sensors.setData(oThis);
        },

        handleChangeView: function(oEvent) {
            var oThis = this;
            var oSource = oEvent.getSource();
            oThis.setModelData("View", "/show", oSource.data("view"));
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
        }
    });
});