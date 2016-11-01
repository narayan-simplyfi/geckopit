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

	var init = function(oThis) {
		var oView = oThis.getView();
		var mapDom = oView.byId("atms-page-map").getDomRef();
		var mapOptions = {
			center: new google.maps.LatLng(0, 0),
			zoom: 15,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
		oThis._map = new google.maps.Map(mapDom, mapOptions);
	};

	var setData = function(oThis) {
		clear(oThis);
		setCenter(oThis);
		setMarkers(oThis);
	};

	var setCenter = function(oThis) {
		var data = oThis.getModelData("ATMs", "/data/0");
		if (!data) {
			return;
		}
		var center = new google.maps.LatLng(data.LATITUDE, data.LONGITUDE);
		oThis._map.panTo(center);
	};

	var setMarkers = function(oThis) {
		var data = oThis.getModelData("ATMs", "/data/");
		// var oView = oThis.getView();
		// oView.setModel(new JSONModel(data), "atmsModel");
		var banks = [24, 25, 26, 28, 36, 51, 52, 53, 54, 55, 56, 57];
		data.forEach(function(atm, index) {
			var img = "./images/";
			var color = "G";

			switch (atm.sensor_status) {
				case 'low':
					// if (banks.indexOf(atm.BANK_ID) !== -1)
					color = "G";
					break;
				case 'critical':
					color = "R";
					break;
			}

			if (banks.indexOf(atm.BANK_ID) !== -1) {
				img += color + "_" + atm.BANK_ID + "_46X46.png";
			} else {
				img += color + "_64X64.png";
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

			handleMarkerClick(oThis, marker, atm, index);
			oThis._markers.push(marker);

		});
	};

	var handleMarkerClick = function(oThis, marker, data, index) {
		var oView = oThis.getView();
		marker.addListener('click', function() {
			var dom = jQuery(jQuery('img[src="' + marker.icon.url + '"]')[0]);
			oThis.setModel(new JSONModel({
				"data": data,
				"path": "/data/" + index
			}), 'SelectedATM');
			showDetails(oThis, dom);
		});
	};

	var showDetails = function(oThis, dom) {
		if (!oThis._oATMDetailsPopover) {
			oThis._oATMDetailsPopover = sap.ui.xmlfragment("ipms.atm.app.fragments.ATMView.PopoverATM", oThis);
			oThis.getView().addDependent(oThis._oATMDetailsPopover);
		}

		jQuery.sap.delayedCall(0, oThis, function() {
			var oNavContainer = sap.ui.getCore().byId("atm-details-popup-nc");
			oThis.setModelData("View", "/popPage", "1");
			oNavContainer.to("atm-details-popup-page-1");
			oThis._oATMDetailsPopover.openBy(dom);
		});
	};

	var pin = function(oThis) {
		var oComponent = oThis.getOwnerComponent();
		var userData = oComponent.getModel('UserData').getData();
		var data = {
			"action": "isatmPinned",
			"pinnedDetails": {
				"PINNED": "1",
				"USER_ID": userData.USER_ID,
				"ATM_ID": oThis.getModelData("SelectedATM", "/data/ATM_ID")
			}
		};
		BusyIndicator.show(0);
		Api.post(Urls.geckopit(), data)
			.done(function(d) {
				if (d.result && d.result[0] && d.result[0].STATUS_MSG) {
					MessageToast.show(d.result[0].STATUS_MSG);
					if (d.result[0].STATUS_CODE === "201") {
						oThis.setModelData("SelectedATM", "/data/isPinned", true);
						oThis.setModelData("ATMs", oThis.getModelData("SelectedATM", "/path") + "/isPinned", true);
					}
				}
			})
			.fail(function(d) {
				MessageToast.show("Failed to pin atm");
			})
			.always(function(d) {
				BusyIndicator.hide();
			});
	};

	var unpin = function(oThis) {
		var oComponent = oThis.getOwnerComponent();
		var userData = oComponent.getModel('UserData').getData();
		var data = {
			"action": "isatmPinned",
			"pinnedDetails": {
				"PINNED": "0",
				"USER_ID": userData.USER_ID,
				"ATM_ID": oThis.getModelData("SelectedATM", "/data/ATM_ID")
			}
		};
		BusyIndicator.show(0);
		Api.post(Urls.geckopit(), data)
			.done(function(d) {
				if (d.result && d.result[0] && d.result[0].STATUS_MSG) {
					MessageToast.show(d.result[0].STATUS_MSG);
					if (d.result[0].STATUS_CODE === "201") {
						oThis.setModelData("SelectedATM", "/data/isPinned", false);
						oThis.setModelData("ATMs", oThis.getModelData("SelectedATM", "/path") + "/isPinned", false);
					}
				}
			})
			.fail(function(d) {
				MessageToast.show("Failed to unpin atm");
			})
			.always(function(d) {
				BusyIndicator.hide();
			});
	};

	var clear = function(oThis) {
		var oView = oThis.getView();
		for (var i = 0; i < oThis._markers.length; i++) {
			oThis._markers[i].setMap(null);
		}
		oThis._markers.length = 0;
	};

	var selectPinned = function(oThis, oEvent) {
		var oSource = oEvent.getSource();
		var dom = oSource.getDomRef();
		var oBinding = oSource.getBindingContext('ATMs');
		oThis.setModel(new JSONModel({
			"data": Utils.objectCopy(oThis.getModelData("ATMs", oBinding.sPath)),
			"path": oBinding.sPath
		}), 'SelectedATM');
		showDetails(oThis, dom);
	};

	var popupNav = function(oThis, oEvent) {
		var oContainer = sap.ui.getCore().byId("atm-details-popup-nc");
		var oSource = oEvent.getSource();
		var next = oSource.data("number");
		oThis.setModelData("View", "/popPage", next);
		oContainer.to(oSource.data("page"));
		jQuery("#atm-details-popup-page-2-video").empty();
		if (next === "2") {
			jQuery("#atm-details-popup-page-2-video").append("<video id='video_with_controls' width='100%'  controls autoplay><source src='https://documentc918f143b.ap1.hana.ondemand.com/document/rest/download?DocId=Ht-bKpJuiJl2FzloaxpD_KxHGjvFaUkifh-j53HROpA' type='video/mp4'/>Your browser does not support the video tag</video>");
		}
	};
	
	var goToTickets = function(oThis, oEvent) {
        var oSource = oEvent.getSource();
        var data = oSource.data();
        var params = {};
        params.type = data.type;
        params.value = data.value;
        oThis.route("ticket-management", params);
	};

	return {
		init: init,
		setData: setData,
		pin: pin,
		unpin: unpin,
		selectPinned: selectPinned,
		popupNav: popupNav,
		goToTickets: goToTickets
	};
});