sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function(Controller, JSONModel) {
    "use strict";

    return Controller.extend("ipms.atm.app.controllers.BaseController", {

        getRouter: function() {
            return sap.ui.core.UIComponent.getRouterFor(this);
        },

        getModel: function(name) {
            return this.getView().getModel(name);
        },

        getModelData: function(name, path) {
            return this.getView().getModel(name).getProperty(path);
        },

        setModel: function(oModel, name) {
            return this.getView().setModel(oModel, name);
        },

        setModelData: function(name, path, data) {
            return this.getView().getModel(name).setProperty(path, data);
        },

        getResourceBundle: function() {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        getI18nText: function(sKey) {
            return this.getResourceBundle().getText(sKey);
        },

        hashChanger: function(hash) {
            this._hashChanger.setHash(hash);
        },

        route: function(path, data) {
            this.getRouter().navTo(path, data);
        },

        handleLinkPress: function(oEvent) {
            var oThis = this;
            var oSource = oEvent.getSource();
            var type = oSource.data().type;
            var value = oSource.data().value;
            switch(type) {
                case 'phone':
                    sap.m.URLHelper.triggerTel(value);
                    break;
                case 'email':
                    sap.m.URLHelper.triggerEmail(value);
                    break;
            }
        },

        handleLogout: function(oEvent) {
            var oThis = this;
            localStorage.removeItem("ipms-user-details");
            var oComponent = oThis.getOwnerComponent();
            oComponent.setModel(new JSONModel({}), "UserData");
            oThis.route("login", null);
        },

        handleNavHome: function(oEvent) {
            var oThis = this;
            oThis.route("dashboard", null);
        },

    });

});
