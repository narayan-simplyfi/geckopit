sap.ui.define([
    "ipms/atm/app/helpers/Urls",
    "ipms/atm/app/helpers/Api",
    "ipms/atm/app/helpers/Utils",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/BusyIndicator"
], function(Urls, Api, Utils, JSONModel, MessageBox, MessageToast, BusyIndicator) {
    "use strict";

    var getData = function(oThis) {
        var oView = oThis.getView();
        var oComponent = oThis.getOwnerComponent();
        if (!oComponent.getModel('rawAtm')) {
            BusyIndicator.show(0);
            Api.get(Urls.user())
                .done(function(d) {
                    oComponent.setModel(new JSONModel(d.result), "rawAtm");
                })
                .fail(function(d) {
                    MessageToast.show('Error getting atm data');
                })
                .always(function(d) {
                    BusyIndicator.hide();
                });
        }

    };

    var setUserData = function(oThis, data) {
        var oComponent = oThis.getOwnerComponent();
    };

    return {
        init: init,
        getUserData: getUserData,
        setUserData: setUserData
    };
});
