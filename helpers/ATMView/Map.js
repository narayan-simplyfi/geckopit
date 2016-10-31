sap.ui.define([
    "ipms/atm/app/helpers/Urls",
    "ipms/atm/app/helpers/Api",
    "ipms/atm/app/helpers/Utils",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator"
], function(Urls, Api, Utils, JSONModel, MessageBox, BusyIndicator) {
    "use strict";

    var init = function(oThis) {
        var oView = oThis.getView();
        var mapDom = oView.byId("atms-page-map").getDomRef();
        var mapOptions = {
            center: new google.maps.LatLng(0, 0),
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        oThis._map = new google.maps.Map(mapDom, mapOptions);
        // getData(oThis);
    };

    var getData = function(oThis) {
        BusyIndicator.show(0);
        Api.get(Urls.map())
            .done(function(d) {
                setData(oThis, d);
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

    var setData = function(oThis) {
        setCenter(oThis);
        setMarkers(oThis);
    };

    var setCenter = function(oThis) {
        var data = oThis.getModelData("ATMs", "/data/0");
        var center = new google.maps.LatLng(data.LATITUDE, data.LONGITUDE);
        oThis._map.panTo(center);
    };

    var setMarkers = function(oThis) {
        var data = oThis.getModelData("ATMs", "/data/");
        // var oView = oThis.getView();
        // oView.setModel(new JSONModel(data), "atmsModel");

        data.forEach(function(atm, index) {
        	console.log(atm);
        	
            var img = "G_64X64.png";
            
        	switch(atm.sensor_status) {
        		case 'low':
        			img = "G_" + atm.BANK_ID + "_46X46.png";
        			break;
        		case 'critical':
        			img = "R_" + atm.BANK_ID + "_46X46.png";
        			break;
        	}
        
            var icon = new google.maps.MarkerImage(
                img,
                new google.maps.Size(64, 64),
                new google.maps.Point(0, 0),
                new google.maps.Point(48, 32)
            );
            icon.url += '#' + atm.ATM_ID;
            var marker = new google.maps.Marker({
                position: {
                    "lat": Number(atm.LATITUDE),
                    "lng": Number(atm.LONGITUDE)
                },
                map: oThis._map,
                optimized: false,
                icon: icon,
                animation: google.maps.Animation.DROP
            });
            handleMarkerClick(oThis, marker, atm);
            oThis._markers.push(marker);

        });
    };

    var handleMarkerClick = function(oThis, marker, data) {
        var oView = oThis.getView();
        marker.addListener('click', function() {
            var dom = jQuery(jQuery('img[src="' + marker.icon.url + '"]')[0]);
            showDetails(oThis, dom, data);
        });
    };

    var pin = function(oThis, oEvent) {
        var oView = oThis.getView();
        oView.getModel('selectedATMModel').setProperty('/pinned', true);
        var selected = oView.getModel('selectedATMModel').getData();
        var data = oView.getModel('pinnedATMs').getData();
        data.push(selected);
        oView.getModel('pinnedATMs').setData(Utils.objectCopy(data));
    };

    var pinDetails = function(oThis, oEvent) {
        var oView = oThis.getView();
        var oSource = oEvent.getSource();
        var path = oSource.getBindingContext('pinnedATMs').sPath;
        var data = oView.getModel('pinnedATMs').getProperty(path);
        showDetails(oThis, oSource, data);
    };

    var pinRemove = function(oThis, oEvent) {
        var oView = oThis.getView();
        var oSource = oEvent.getSource();
        var item = oView.getModel('selectedATMModel').getData();
        var data = oView.getModel('pinnedATMs').getData();
        var index;
        for (var i = 0; i < data.length; i++) {
            if (data[i].id === item.id) {
                index = i;
            }
        };
        data.splice(index, 1);
        oView.getModel('selectedATMModel').setProperty('/pinned', false);
        oView.getModel('pinnedATMs').setData(Utils.objectCopy(data));
    };

    var showDetails = function(oThis, dom, data) {
        var oView = oThis.getView();
        console.log(dom, data);
        // var pdata = oView.getModel('pinnedATMs').getData();
        // data.pinned = false;
        // if (pdata.length === 0) data.pinned = false;
        // for (var i = 0; i < pdata.length; i++) {
        //     if (data.id === pdata[i].id) {
        //         data.pinned = true;
        //     }
        // };

        // if (!oThis._oATMDetailsPopover) {
        //     oThis._oATMDetailsPopover = sap.ui.xmlfragment("ipms.atm.app.fragments.PopoverATM", oThis);
        //     oThis.getView().addDependent(oThis._oATMDetailsPopover);
        // }
        // if (oView.getModel('selectedATMModel')) {
        //     oView.getModel('selectedATMModel').setData(data);
        // } else {
        //     oView.setModel(new JSONModel(data), "selectedATMModel");
        // }
        // jQuery.sap.delayedCall(0, oThis, function() {
        //     var oNavContainer = sap.ui.getCore().byId("atm-details-popup-nc");
        //     oNavContainer.back();
        //     oThis._oATMDetailsPopover.openBy(dom);
        // });
    };

    var clear = function(oThis) {
        var oView = oThis.getView();
        for (var i = 0; i < oThis._markers.length; i++) {
            oThis._markers[i].setMap(null);
        }
        oThis._markers.length = 0;
    };

    return {
        init: init,
        setData: setData,
        pin: pin,
        pinDetails: pinDetails,
        pinRemove: pinRemove
    };
});