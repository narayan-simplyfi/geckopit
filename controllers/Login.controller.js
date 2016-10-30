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

    return BaseController.extend("ipms.atm.app.controllers.Login", {

        Formatters: Formatters,

        /**
         * Lifecycle Method - Called when the Login controller is instantiated.
         * @public
         * @authors 
         */
        onInit: function() {
            var oThis = this;
            var oView = oThis.getView();
            var oComponent = oThis.getOwnerComponent();
            oThis.Formatters = Formatters;
            oThis._router = oComponent.getRouter();
            oThis._router.getRoute("login").attachMatched(oThis._init, oThis);
            oThis._hashChanger = new HashChanger();
        },

        /**
         * Lifecycle Method - Called when the Login controller route matches is instantiated.
         * @private
         * @param {sap.ui.base.Event} oEvent : On Init
         * @authors 
         */
        _init: function(oEvent) {
            var oThis = this;
            if (localStorage.getItem("ipms-user-details")) {
                oThis.route("dashboard", null);
                return;
            }
            var oView = oThis.getView();
            oThis._setModels();
        },

        /**
         * 
         * Internal Method - Method to get set all view models.
         * @private
         * @authors 
         */
        _setModels: function() {
            var oThis = this;
            oThis.setModel(new JSONModel({
                "username": "",
                "password": ""
            }), "View");
        },

        handleLogin: function(oEvent) {
            var oThis = this;
            var oComponent = oThis.getOwnerComponent();

            var data = {
                action: "checkUser",
                userDetails: {
                    userid: oThis.getModelData('View', '/username'),
                    password: oThis.getModelData('View', '/password')
                }
            };

            BusyIndicator.show(0);
            Api.post(Urls.geckopit(), data)
                .done(function(d) {
                    if (!d.result || d.result.length <= 0) {
                        MessageToast.show(oThis.getI18nText('message_error_login'));
                        return;
                    } else if (d.result[0].STATUS_CODE === "100") {
                        MessageToast.show(d.result[0].STATUS_MSG);
                        return;
                    } else {
                        localStorage.setItem("ipms-user-details", JSON.stringify(d.result[0]))
                        oComponent.setModel(new JSONModel(d.result[0]), "UserData");
                		oThis.route("dashboard", null);
                    }
                })
                .fail(function(d) {
                    MessageToast.show(oThis.getI18nText('message_error_login'));
                })
                .always(function(d) {
                    BusyIndicator.hide();
                });

        },

    });
});
