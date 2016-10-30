sap.ui.define([
    "ipms/atm/app/helpers/Urls",
    "ipms/atm/app/helpers/Api",
    "ipms/atm/app/helpers/Utils",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator"
], function(Urls, Api, Utils, JSONModel, MessageBox, BusyIndicator) {
    "use strict";

    var init = function(oThis,userData) {
        var oView = oThis.getView();
        var oComponent = oThis.getOwnerComponent();
        if (!oComponent.getModel('userData')) {
            // getUserData(oThis,userData); // this is toget local data
            //to set Data to online
            setUserData(oThis, userData);
        }
    };
    var getUserData = function(oThis) {
        BusyIndicator.show(0);
        Api.get(Urls.user())
            .done(function(d) {
                setUserData(oThis, d);
            })
            .fail(function(d) {
                MessageBox.show(
                    oThis.i18n().getText('message_box_msg_fetch_data_failed'),
                    null,
                    oThis.i18n().getText('message_box_title_error'), [oThis.i18n().getText('message_box_button_ok')]
                );
            })
            .always(function(d) {
                BusyIndicator.hide();
            });
    };

    var setUserData = function(oThis, data) {
        var oComponent = oThis.getOwnerComponent();
        oComponent.setModel(new JSONModel(data), "userData");
    };

    return {
        init: init,
        getUserData: getUserData,
        setUserData: setUserData
    };
});