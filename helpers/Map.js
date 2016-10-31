sap.ui.define([
    "ipms/atm/app/helpers/Urls",
    "ipms/atm/app/helpers/Api",
    "ipms/atm/app/helpers/Utils",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/ui/core/BusyIndicator",
    "ipms/atm/app/helpers/Data"
], function(Urls, Api, Utils, JSONModel, MessageBox, BusyIndicator, Data) {
    "use strict";
    var pinimg;
    var templat;
    var templng;
    var init = function(oThis) {
        var oView = oThis.getView();
        var mapDom = oView.byId("dashboard-page-map").getDomRef();
        var mapOptions = {
            center: new google.maps.LatLng(0, 0),
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        oThis._map = new google.maps.Map(mapDom, mapOptions);

        var iotJson;
        // var odatamodel = oView.getModel("IOT");

        // odatamodel.read("/app.svc/IPMS_SENSOR.T_IOT_1F0D3E4EB8C68DF7577E", null, null, false,
        //     function fnSuccess(d) {
        //         iotJson = new sap.ui.model.json.JSONModel();
        //         iotJson.setData(d);

        //     },
        //     function fnError(response) {}
        // );

        var iotJson = {
        	oData : dummyData().d
        }
        console.log(iotJson);
        var i = iotJson.oData.results.length - 1;



        //	this.byId('idIcon').setText(iotJson.oData.results[i].G_CREATED);
        window.oGlobalValue = iotJson.oData.results[i].G_CREATED;

        oThis.sensorATMS = JSON.parse("{" +
            "\"sensor\": {" +
            "\"SBIWRDATM1\": {" +
            "\"G_DEVICE\": \"SBIWRDATM1\"," +
            "\"G_CREATED\": \"" + iotJson.oData.results[i].G_CREATED + "\"," +
            "\"C_PIR\": \"" + iotJson.oData.results[i].C_PIR + "\"," +
            "\"C_DOOR1\": \"" + iotJson.oData.results[i].C_DOOR1 + "\"," +
            "\"C_DOOR2\": \"" + iotJson.oData.results[i].C_DOOR2 + "\"," +
            "\"C_SMOKE\": \"" + iotJson.oData.results[i].C_SMOKE + "\"," +
            "\"C_VIBRATION\": \"" + iotJson.oData.results[i].C_VIBRATION + "\"," +
            "\"C_PANICBUTTON\": \"" + iotJson.oData.results[i].C_PANICBUTTON + "\"," +
            "\"C_AC1\": \"" + iotJson.oData.results[i].C_AC1 + "\"," +
            "\"C_AC2\": \"" + iotJson.oData.results[i].C_AC2 + "\"," +
            "\"C_ALARM\": \"" + iotJson.oData.results[i].C_ALARM + "\"," +
            "\"C_RFID\": \"" + iotJson.oData.results[i].C_RFID + "\"," +
            "\"C_POWERSTATUS\": \"" + iotJson.oData.results[i].C_POWERSTATUS + "\"," +
            "\"C_POWERVALUE\": \"" + iotJson.oData.results[i].C_POWERVALUE + "\"," +
            "\"C_CURRENTVALUE\":\"" + iotJson.oData.results[i].C_CURRENTVALUE + "\"," +
            "\"C_VOLTAGEVALUE\": \"" + iotJson.oData.results[i].C_VOLTAGEVALUE + "\"," +
            "\"C_SPEAKER\": \"" + iotJson.oData.results[i].C_SPEAKER + "\"," +
            "\"C_CAMERA1STATUS\": \"" + iotJson.oData.results[i].C_CAMERA1STATUS + "\"," +
            "\"C_CAMERA2STATUS\": \"" + iotJson.oData.results[i].C_CAMERA2STATUS + "\"," +
            "\"C_CAMERA3STATUS\": \"" + iotJson.oData.results[i].C_CAMERA3STATUS + "\"," +
            "\"C_CAMERA4STATUS\": \"" + iotJson.oData.results[i].C_CAMERA4STATUS + "\"," +
            "\"C_TEMPERATURE\": \"" + iotJson.oData.results[i].C_TEMPERATURE + "\"," +
            "\"C_LIGHT\": \"" + iotJson.oData.results[i].C_LIGHT + "\"," +
            "\"C_CONTROLBOX\": \"" + iotJson.oData.results[i].C_CONTROLBOX + "\"" +

            "}," +
            "\"SBIAAAATM1\": {" +
            "\"G_DEVICE\": \"SBIMRSATM1\"," +
            "\"G_CREATED\": \"" + iotJson.oData.results[i].G_CREATED + "\"," +
            "\"C_PIR\": \"" + iotJson.oData.results[i].C_PIR + "\"," +
            "\"C_DOOR1\": \"" + iotJson.oData.results[i].C_DOOR1 + "\"," +
            "\"C_DOOR2\": \"" + iotJson.oData.results[i].C_DOOR2 + "\"," +
            "\"C_SMOKE\": \"" + iotJson.oData.results[i].C_SMOKE + "\"," +
            "\"C_VIBRATION\": \"" + iotJson.oData.results[i].C_VIBRATION + "\"," +
            "\"C_PANICBUTTON\": \"" + iotJson.oData.results[i].C_PANICBUTTON + "\"," +
            "\"C_AC1\": \"" + iotJson.oData.results[i].C_AC1 + "\"," +
            "\"C_AC2\": \"" + iotJson.oData.results[i].C_AC2 + "\"," +
            "\"C_ALARM\": \"" + iotJson.oData.results[i].C_ALARM + "\"," +
            "\"C_RFID\": \"" + iotJson.oData.results[i].C_RFID + "\"," +
            "\"C_POWERSTATUS\": \"" + iotJson.oData.results[i].C_POWERSTATUS + "\"," +
            "\"C_POWERVALUE\": \"" + iotJson.oData.results[i].C_POWERVALUE + "\"," +
            "\"C_CURRENTVALUE\":\"" + iotJson.oData.results[i].C_CURRENTVALUE + "\"," +
            "\"C_VOLTAGEVALUE\": \"" + iotJson.oData.results[i].C_VOLTAGEVALUE + "\"," +
            "\"C_SPEAKER\": \"" + iotJson.oData.results[i].C_SPEAKER + "\"," +
            "\"C_CAMERA1STATUS\": \"" + iotJson.oData.results[i].C_CAMERA1STATUS + "\"," +
            "\"C_CAMERA2STATUS\": \"" + iotJson.oData.results[i].C_CAMERA2STATUS + "\"," +
            "\"C_CAMERA3STATUS\": \"" + iotJson.oData.results[i].C_CAMERA3STATUS + "\"," +
            "\"C_CAMERA4STATUS\": \"" + iotJson.oData.results[i].C_CAMERA4STATUS + "\"," +
            "\"C_TEMPERATURE\": \"" + iotJson.oData.results[i].C_TEMPERATURE + "\"," +
            "\"C_LIGHT\": \"" + iotJson.oData.results[i].C_LIGHT + "\"," +
            "\"C_CONTROLBOX\": \"" + iotJson.oData.results[i].C_CONTROLBOX + "\"" +
            " }" +
            "}" +
            "}");
		console.log(oThis.sensorATMS);
        getData(oThis);
    };
    var getSensorData = function(data) {

        data.selectedButton = "details";
        var sensorMap = data;
        // for (var kk = 0; kk < data.sensor.length; kk++) {
        // 	var value = data.sensor[kk];

        // 	sensorMap[value['SENSOR_NAME']] = value['ALERT_NAME'];

        // }
        // for (var property in data) {
        // 	// sensorMap[value['SENSOR_NAME']] = value['ALERT_NAME'];
        // }
        // add sensor data begin
        var sensors = [{
            type: "vibration",
            status: sensorMap['C_VIBRATION'] != null ? sensorMap['C_VIBRATION'] : 'None',
            state: sensorMap['C_VIBRATION'] == 0 ? "Error" : "Success"
        }, {
            type: "heat",
            status: sensorMap['C_TEMPERATURE'] != null ? sensorMap['C_TEMPERATURE'] : 'None',
            state: sensorMap['C_TEMPERATURE'] >= 18 && sensorMap['C_TEMPERATURE'] <= 22 ? "Success" : 'Error'
        }, {
            type: "contact",
            status: sensorMap['Contact'] != null ? sensorMap['Contact'] : 'None',
            state: "None"
        }, {
            type: "motion",
            status: sensorMap['Motion'] != null ? sensorMap['Motion'] : 'None',
            state: "None"
        }, {
            type: "pid",
            status: sensorMap['C_PIR'] != null ? sensorMap['C_PIR'] : 'None',
            state: sensorMap['C_PIR'] == 0 ? "Error" : "Success"
        }, {
            type: "door",
            status: sensorMap['C_POWERSTATUS'] != null ? sensorMap['C_POWERSTATUS'] : 'None',
            state: sensorMap['C_POWERSTATUS'] == 0 ? "Error" : "Success"
        }, {
            type: "battery1",
            status: sensorMap['C_DOOR1'] != null ? sensorMap['C_DOOR1'] : 'None',
            state: sensorMap['C_DOOR1'] == 0 ? "Error" : "Success"
        }, {
            type: "battery2",
            status: sensorMap['C_DOOR2'] != null ? sensorMap['C_DOOR2'] : 'None',
            state: sensorMap['C_DOOR2'] == 0 ? "Error" : "Success"
        }, {
            type: "smoke",
            status: sensorMap['C_SMOKE'] != null ? sensorMap['C_SMOKE'] : 'None',
            state: sensorMap['C_SMOKE'] == 0 ? "Error" : "Success"
        }, {
            type: "power",
            status: sensorMap['C_POWERVALUE'] != null ? sensorMap['C_POWERVALUE'] : 'None',
            state: sensorMap['C_POWERVALUE'] >= 6 && sensorMap['C_POWERVALUE'] <= 10 ? "Success" : 'Error'
        }, {
            type: "voltage",
            status: sensorMap['C_VOLTAGEVALUE'] != null ? sensorMap['C_VOLTAGEVALUE'] : 'None',
            state: sensorMap['C_VOLTAGEVALUE'] >= 180 && sensorMap['C_VOLTAGEVALUE'] <= 240 ? "Success" : 'Error'
        }, {
            type: "panic",
            status: sensorMap['C_PANICBUTTON'] != null ? sensorMap['C_PANICBUTTON'] : 'None',
            state: sensorMap['C_PANICBUTTON'] == 0 ? "Error" : "Success"
        }, {
            type: "AC1",
            status: sensorMap['C_AC1'] != null ? sensorMap['C_AC1'] : 'None',
            state: sensorMap['C_AC1'] == 0 ? "Error" : "Success"
        }, {
            type: "AC2",
            status: sensorMap['C_AC2'] != null ? sensorMap['C_AC1'] : 'None',
            state: sensorMap['C_AC2'] == 0 ? "Error" : "Success"
        }, {
            type: "Alarm",
            status: sensorMap['C_ALARM'] != null ? sensorMap['C_ALARM'] : 'None',
            state: sensorMap['C_ALARM'] == 0 ? "Error" : "Success"
        }, {
            type: "RFID",
            status: sensorMap['C_RFID'] != null ? sensorMap['C_RFID'] : 'None',
            state: sensorMap['C_RFID'] == 0 ? "Error" : "Success"
        }, {
            type: "powerstatus",
            status: sensorMap['C_POWERSTATUS'] != null ? sensorMap['C_POWERSTATUS'] : 'None',
            state: sensorMap['C_POWERSTATUS'] == 0 ? "Error" : "Success"
        }, {
            type: "currentvalue",
            status: sensorMap['C_CURRENTVALUE'] != null ? sensorMap['C_CURRENTVALUE'] : 'None',
            state: sensorMap['C_CURRENTVALUE'] >= 8 && sensorMap['C_CURRENTVALUE'] <= 10 ? "Success" : 'Error'
        }, {
            type: "speaker",
            status: sensorMap['C_SPEAKER'] != null ? sensorMap['C_SPEAKER'] : 'None',
            state: sensorMap['C_SPEAKER'] == 0 ? "Error" : "Success"
        }, {
            type: "camera1",
            status: sensorMap['C_CAMERA1STATUS'] != null ? sensorMap['C_CAMERA1STATUS'] : 'None',
            state: sensorMap['C_CAMERA1STATUS'] == 0 ? "Error" : "Success"
        }, {
            type: "camera2",
            status: sensorMap['C_CAMERA2STATUS'] != null ? sensorMap['C_CAMERA2STATUS'] : 'None',
            state: sensorMap['C_CAMERA2STATUS'] == 0 ? "Error" : "Success"
        }, {
            type: "camera3",
            status: sensorMap['C_CAMERA3STATUS'] != null ? sensorMap['C_CAMERA3STATUS'] : 'None',
            state: sensorMap['C_CAMERA3STATUS'] == 0 ? "Error" : "Success"
        }, {
            type: "camera4",
            status: sensorMap['C_CAMERA4STATUS'] != null ? sensorMap['C_CAMERA4STATUS'] : 'None',
            state: sensorMap['C_CAMERA4STATUS'] == 0 ? "Error" : "Success"
        }, {
            type: "light",
            status: sensorMap['C_LIGHT'] != null ? sensorMap['C_LIGHT'] : 'None',
            state: sensorMap['C_LIGHT'] == 0 ? "Error" : "Success"
        }, {
            type: "controlbox",
            status: sensorMap['C_CONTROLBOX'] != null ? sensorMap['C_CONTROLBOX'] : 'None',
            state: sensorMap['C_CONTROLBOX'] == 0 ? "Error" : "Success"
        }];
        return sensors;

    };

    var getStatusData = function(data) {

        var sensorMap = data;

        if (!(sensorMap['C_TEMPERATUREVALUE'] >= 18 && sensorMap['C_TEMPERATUREVALUE'] <= 22)) {
            return 'critical';
        }
        if (!(sensorMap['C_POWERVALUE'] >= 6 && sensorMap['C_POWERVALUE'] <= 10)) {
            return 'critical';
        }
        if (!(sensorMap['C_VOLTAGEVALUE'] >= 180 && sensorMap['C_VOLTAGEVALUE'] <= 240)) {
            return 'critical';
        }
        if (!(sensorMap['C_CURRENTVALUE'] >= 8 && sensorMap['C_CURRENTVALUE'] <= 10)) {
            return 'critical';
        }

        return 'low';

    };
    var getData = function(oThis) {

        // BusyIndicator.show(0);
        // var userId = parseInt(sap.ui.getCore().getModel('clickedUser').getData().USER_ID);
        // if (userId === 7) {
        //     userId = 5;
        // }
        var userId = 5;
        if (userId != null) {
            var data = {
                action: "getuserATMS",
                userid: userId
            };
            var pinnedAtms = [];
            Api.post(Urls.url(), data)
                .done(function(d) {
                    //alert('success');
                    //alert(d.result);

                    oThis.markerData = d.result;
                    //check whether atm is pinned, if pinned add to pinned model begin
                    //var pinnedAtms = [];
                    //check whether atm is pinned, if pinned add to pinned model end
                    //get status

                    for (var i = 0; i < d.result.length; i++) {
                        // if(data[i]['id']==='INI25471'){

                        var item = d.result[i];
                        //check whether atm is pinned, if pinned add to pinned model begin
                        if (item.isPinned === "1") {

                            pinnedAtms.push(item);
                        }
                        //check whether atm is pinned, if pinned add to pinned model end

                        var medFlag = false;
                        var criticalFlag = false;
                        //hashmaps for bank and priority
                        var bankFilterData = {};
                        var priorityFilter = {};
                        // convert sensor data
                        // item.sensor = getSensorData(oThis.sensorATMS);


                        //NNNNNN
                        item.sensor = getSensorData(oThis.sensorATMS.sensor[item.ATM_ID]);
                        item.status = getStatusData(oThis.sensorATMS.sensor[item.ATM_ID]); //"critical";
                        //NNNNNN


                        // item.status = "low";
                        //console.log(d.result);	
                        // for (var j = 0; j < item.sensor.length; j++) {
                        // 	var value = item.sensor[j];
                        // 	if (value.status === "medium") {
                        // 		medFlag = true;
                        // 		continue;
                        // 	} else if (value.status === "critical") {
                        // 		criticalFlag = true;
                        // 		break;
                        // 	}

                        // }
                        // d.result[i].status = "low";
                        // if (medFlag) {
                        // 	d.result[i].status = "medium";

                        // }
                        // if (criticalFlag) {
                        // 	d.result[i].status = "critical";
                        // }

                        // make a model with hash map of alert type
                        if (priorityFilter[item.status] == null) {
                            priorityFilter[item.status] = [i];
                        } else {
                            priorityFilter[item.status].push(i);
                        }

                        // //// make a model with hash map of bank type
                        if (bankFilterData[item['BANK_NAME']] == null) {
                            bankFilterData[item['BANK_NAME']] = [i];
                        } else {
                            bankFilterData[item.BANK_NAME].push(i);
                        }
                        var filters = {
                            priorities: [],
                            banks: []
                        };
                        for (var property in priorityFilter) {
                            if (priorityFilter.hasOwnProperty(property)) {
                                filters.priorities.push({
                                    priority: property,
                                    selected: true,
                                    obj: d.result[i]
                                });
                            }
                        }

                        for (var property1 in bankFilterData) {
                            if (bankFilterData.hasOwnProperty(property1)) {
                                filters.banks.push({
                                    bank: property1,
                                    selected: true,
                                    obj: d.result[i]
                                });
                            }
                        }
                    }

                    oThis.getView().getModel('pinnedATMs').setData(pinnedAtms);
                    if (d.result != null && d.result.length > 0) {
                        templat = d.result[0].LATITUDE;
                        templng = d.result[0].LONGITUDE;
                        setData(oThis, {

                            center: {
                                lat: d.result[0].LATITUDE,
                                lng: d.result[0].LONGITUDE
                            },
                            points: d.result,
                            filters: filters

                        });
                    }
                })
                .fail(function(d) {
                    MessageBox.show(
                        oThis.i18n().getText('message_box_msg_fetch_data_failed'),
                        null,
                        oThis.i18n().getText('message_box_title_error'), [oThis.i18n().getText('message_box_button_ok')]
                    );
                })
                .always(function(d) {
                    // BusyIndicator.hide();
                });

        }

        // else{

        // 	var dataS = sap.ui.getCore().getModel('OPR').getData();
        // 	dataS.atms = [];
        // 	for (var jj=0; jj<dataS.operators.length; jj++) {
        // 		var opr = dataS.operators[jj];
        // 			for (var jk=0; jk<opr.BANKS; jk++) {
        // 				var atm = opr.BANKS[jk];
        // 				dataS.atms.push(atm);
        // 			}
        // 	}

        // }
        // Begin of comment - commenting data that gets hardcoded data333
        // Api.get(Urls.map())
        // 	.done(function(d) {
        // 		setData(oThis, d);
        // 	})
        // 	.fail(function(d) {
        // 		MessageBox.show(
        // 			oThis.i18n().getText('message_box_msg_fetch_data_failed'),
        // 			null,
        // 			oThis.i18n().getText('message_box_title_error'), [oThis.i18n().getText('message_box_button_ok')]
        // 		);
        // 	})
        // 	.always(function(d) {
        // 		BusyIndicator.hide();
        // 	});

        // End of comment - commenting data that gets hardcoded data
    };

    // var filterMarkers = function(oThis, type) {
    // 	var that = this;
    // 	Map.type = type;
    // 	Api.get(Urls.map())
    // 		.done(function(d) {
    // 			var d_filtered = [];

    // 			//change icon from dots to company icons
    // 			for (var j = 0; j < d.points.length; j++) {
    // 				// d.points[j]status-icon']===d.points[j].img;

    // 			}

    // 			if (Map.type === "") {
    // 				// d_filtered = d;
    // 				// } else if (Map.type==="normal") {

    // 				// } else if (Map.type==="medium") {

    // 				// }else if (Map.type==="critical") {

    // 			} else {

    // 				for (var j = 0; j < d.points.length; j++) {
    // 					var value = d.points[j];
    // 					if (value.status === Map.type) {
    // 						d_filtered.push(value);
    // 					}
    // 				}
    // 				d.points = d_filtered;
    // 			}

    // 			setData(oThis, d);

    // 		})
    // 		.fail(function(d) {
    // 			MessageBox.show(
    // 				oThis.i18n().getText('message_box_msg_fetch_data_failed'),
    // 				null,
    // 				oThis.i18n().getText('message_box_title_error'), [oThis.i18n().getText('message_box_button_ok')]
    // 			);
    // 		})
    // 		.always(function(d) {
    // 			BusyIndicator.hide();
    // 		});
    // };

    var setData = function(oThis, data) {
        setCenter(oThis, data.center);
        setMarkers(oThis, data.points);
        setFilters(oThis, data.filters);
        //setButton(oThis, data.center);
    };

    var setFilters = function(oThis, data) {
        var oView = oThis.getView();
        oView.setModel(new JSONModel(data), "atmFilters");
    };

    var setCenter = function(oThis, data) {
        var center = new google.maps.LatLng(parseFloat(data.lat), parseFloat(data.lng));
        oThis._map.panTo(center);
    };

    var setButton = function(oThis, data) {
        //var center = new google.maps.LatLng(parseFloat(data.lat), parseFloat(data.lng));
        //oThis._map.panTo(center);

        // Create the DIV to hold the control and call the CenterControl()
        // constructor passing in this DIV.
        var centerControlDiv = document.createElement('div');
        var centerControl = new CenterControl(centerControlDiv, oThis._map, data);

        centerControlDiv.index = 1;
        oThis._map.controls[google.maps.ControlPosition.TOP_CENTER].push(centerControlDiv);
    };

    /**
     * The CenterControl adds a control to the map that recenters the map on
     * Chicago.
     * This constructor takes the control DIV as an argument.
     * @constructor
     */
    function CenterControl(controlDiv, map, location) {

        // Set CSS for the control border.
        var controlUI = document.createElement('div');
        controlUI.style.backgroundColor = '#fff';
        controlUI.style.border = '2px solid #fff';
        controlUI.style.borderRadius = '3px';
        controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
        controlUI.style.cursor = 'pointer';
        controlUI.style.marginBottom = '22px';
        controlUI.style.textAlign = 'center';
        controlUI.title = 'Click to recenter the map';
        controlDiv.appendChild(controlUI);

        // Set CSS for the control interior.
        var controlText = document.createElement('div');
        controlText.style.color = 'rgb(25,25,25)';
        controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
        controlText.style.fontSize = '16px';
        controlText.style.lineHeight = '38px';
        controlText.style.paddingLeft = '5px';
        controlText.style.paddingRight = '5px';
        controlText.innerHTML = 'My Location';
        controlUI.appendChild(controlText);

        // Setup the click event listeners: simply set the map to Chicago.
        controlText.addEventListener('click', function() {

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position) {
                    var pos = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    };

                    //infoWindow.setPosition(pos);
                    //infoWindow.setContent('Location found.');
                    //map.setCenter(pos);
                    map.panTo(pos);
                }, function() {
                    //handleLocationError(true, infoWindow, map.getCenter());
                });
            } else {
                // Browser doesn't support Geolocation
                //handleLocationError(false, infoWindow, map.getCenter());
            }

        });

        // Set CSS for the control interior.
        var controlText1 = document.createElement('div');
        controlText1.style.color = 'rgb(25,25,25)';
        controlText1.style.fontFamily = 'Roboto,Arial,sans-serif';
        controlText1.style.fontSize = '16px';
        controlText1.style.lineHeight = '38px';
        controlText1.style.paddingLeft = '5px';
        controlText1.style.paddingRight = '5px';
        controlText1.innerHTML = 'My Region';
        controlUI.appendChild(controlText1);

        // Setup the click event listeners: simply set the map to Chicago.
        controlText1.addEventListener('click', function() {
            var center = new google.maps.LatLng(templat, templng);
            //alert(center);
            map.panTo(center);
        });

    }

    var setMarkers = function(oThis, data) {
        var oView = oThis.getView();
        oView.setModel(new JSONModel(data), "atmsModel");
        for (var i = 0; i < data.length; i++) {
            // 	// if(data[i]['id']==='INI25471'){

            var item = data[i];
            // 	// console.log(JSON.stringify(item.pos));
            var img = "G";

            switch (data[i].status) {
                case 'critical':
                    img = "R";
                    break;
                case 'medium':
                    img = "A";
                    break;

                case 'low':
                    img = "G";
                    break;
            }
            switch (data[i]['BANK_NAME']) {
                case 'Ing Vysya Bank Ltd.':
                    data[i]['marker-icon'] = './images/' + img + '_' + 'HDFC' + '_46X46.png';
                    break;

                default:
                    data[i]['marker-icon'] = './images/' + img + '_SB_46X46.png';
            }

            if (data[i]['marker-icon'] != null) {
                img = data[i]['marker-icon'];
            }
            var icon = new google.maps.MarkerImage(
                data[i]['marker-icon'],
                new google.maps.Size(256, 256),
                new google.maps.Point(0, 0),
                new google.maps.Point(64, 64)
            );
            // icon.url += '#' + item.id;
            var marker = new google.maps.Marker({
                position: {
                    "lat": parseFloat(item.LATITUDE),
                    "lng": parseFloat(item.LONGITUDE)
                },
                map: oThis._map,
                optimized: false,
                icon: icon,
                animation: google.maps.Animation.DROP
            });
            handleMarkerClick(oThis, marker, data[i]);

            oThis._markers.push(marker);
            // }
        }
    };

    var handleMarkerClick = function(oThis, marker, data) {
        var oView = oThis.getView();
        marker.addListener('click', function() {
            var dom = jQuery(jQuery('img[src="' + marker.icon.url + '"]')[1]);
            showDetails(oThis, dom, data);
        });
    };

    var pin = function(oThis, oEvent) {
        var oView = oThis.getView();
        oView.getModel('selectedATMModel').setProperty('/pinned', true);
        var selected = oView.getModel('selectedATMModel').getData();
        var data = oView.getModel('pinnedATMs').getData();
        data.push(selected);
        var userId = oView.getModel('userData').getData().USER_ID;
        oView.getModel('pinnedATMs').setData(Utils.objectCopy(data));

        //db call tp pin atm begin

        // BusyIndicator.show(0);

        var dataSend = {};
        dataSend.action = "isatmPinned";
        dataSend.pinnedDetails = {};
        dataSend.pinnedDetails.PINNED = "1";
        dataSend.pinnedDetails.USER_ID = parseInt(userId);
        dataSend.pinnedDetails.ATM_ID = selected.ATM_ID; //"HDFCWRDATM1";
        // 	action: "isatmPinned",

        // 	pinnedDetails: {
        // 		PINNED: "1",
        // 		userid: "2",
        // 		ATM_ID: "HDFCWRDATM1"
        // 	}
        // };
        Api.post(Urls.url(), dataSend)
            .done(function(d) {
                //alert('success');
                // oThis.markerData = d.result;
                // BusyIndicator.hide();
                if (d.result != null && d.result.length > 0) {
                    if (d.result[0].STATUS_CODE === "201") {
                        MessageBox.show(d.result[0].STATUS_MSG, {
                            icon: MessageBox.Icon.SUCCESS,
                            title: "ATM Pin Success",
                            onClose: function() {

                                oThis.closeDialog();
                            }
                        });

                    } else {
                        MessageBox.show(d.result[0].STATUS_MSG, {
                            icon: MessageBox.Icon.ERROR,
                            title: oThis.i18n().getText('ticket_error'),
                            onClose: function() {
                                // BusyIndicator.close();
                            }
                        });
                    }
                    BusyIndicator.hide();
                }

            });

        //db call tp pin atm end

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
        var userId = parseInt(oView.getModel('userData').getData().USER_ID);

        var index;
        for (var i = 0; i < data.length; i++) {
            if (data[i].ATM_ID === item.ATM_ID) {
                index = i;
            }
        }
        data.splice(index, 1);
        oView.getModel('selectedATMModel').setProperty('/pinned', false);
        oView.getModel('pinnedATMs').setData(Utils.objectCopy([]));

        var dataSend = {};
        dataSend.action = "isatmPinned";
        dataSend.pinnedDetails = {};
        dataSend.pinnedDetails.PINNED = "0";
        dataSend.pinnedDetails.USER_ID = userId;
        dataSend.pinnedDetails.ATM_ID = item.ATM_ID; //"HDFCWRDATM1";
        // 	action: "isatmPinned",

        // 	pinnedDetails: {
        // 		PINNED: "1",
        // 		userid: "2",
        // 		ATM_ID: "HDFCWRDATM1"
        // 	}
        // };
        Api.post(Urls.url(), dataSend)
            .done(function(d) {
                //alert('success');
                // oThis.markerData = d.result;
                // BusyIndicator.hide();
                if (d.result != null && d.result.length > 0) {
                    if (d.result[0].STATUS_CODE === "201") {
                        MessageBox.show(d.result[0].STATUS_MSG, {
                            icon: MessageBox.Icon.SUCCESS,
                            title: "ATM Unpin Success",
                            onClose: function() {

                                oThis.closeDialog();
                            }
                        });

                    } else {
                        MessageBox.show(d.result[0].STATUS_MSG, {
                            icon: MessageBox.Icon.ERROR,
                            title: oThis.i18n().getText('ticket_error'),
                            onClose: function() {
                                // BusyIndicator.close();
                            }
                        });
                    }
                    BusyIndicator.hide();
                }

            });

    };

    var showDetails = function(oThis, dom, data) {
        oThis.lastClickedMarkerDom = dom;
        var oView = oThis.getView();
        var pdata = oView.getModel('pinnedATMs').getData();
        data.pinned = false;
        if (pdata.length === 0) {
            data.pinned = false;
        }
        for (var i = 0; i < pdata.length; i++) {
            if (data.id === pdata[i].id) {
                data.pinned = true;
            }
        }

        if (oThis._oATMDetailsPopover == null) {
            oThis._oATMDetailsPopover = sap.ui.xmlfragment("ipms.atm.app.fragments.PopoverATMv2", oThis);
            oThis.getView().addDependent(oThis._oATMDetailsPopover);

        }
        var videoContent = new sap.ui.core.HTML({
            content: "<video id='video_with_controls' width='100%'  controls autoplay><source src='https://documentc918f143b.ap1.hana.ondemand.com/document/rest/download?DocId=Ht-bKpJuiJl2FzloaxpD_KxHGjvFaUkifh-j53HROpA' type='video/mp4'/>Your browser does not support the video tag</video>"
        });
        var videoBoxInside = oThis._oATMDetailsPopover.getContent()[0].getPages()[0].getContent()[0].getItems()[1].getItems()[1];
        if (videoBoxInside.getItems().length < 1) {
            videoBoxInside.addItem(videoContent);
        }

        //var sensors = getSensorData(data);
        // data.sensor=sensors;
        // add sensor data		
        if (oView.getModel('selectedATMModel')) {
            oView.getModel('selectedATMModel').setData(data);
        } else {
            oView.setModel(new JSONModel(data), "selectedATMModel");
        }

        //load ticket Details start
        // var data1 = {
        // 	action: "getTickets",
        // 	ATM_ID: oThis.getView().getModel('selectedATMModel').getData().ATM_ID
        // };
        // Api.post(Urls.url(), data1).done(function(d) {

        // 	// var oModel = new sap.ui.model.json.JSONModel();
        // 	// oModel.setData(d);

        // 	oView.setModel(new JSONModel(d), "selectedATMTickets");

        // });
        //load ticket details end
        // oThis._oATMDetailsPopover.openBy(oThis.lastClickedMarkerDom);
        jQuery.sap.delayedCall(0, oThis, function() {
            var oNavContainer = sap.ui.getCore().byId("atm-details-popup-ncv2");
            oNavContainer.back();
            oThis._oATMDetailsPopover.openBy(dom);
        });
    };

    var clear = function(oThis) {
        var oView = oThis.getView();
        for (var i = 0; i < oThis._markers.length; i++) {
            oThis._markers[i].setMap(null);
        }
        oThis._markers.length = 0;
    };

    var getOperatorData = function(oThis, fn) {
        // BusyIndicator.show(0);
        // var userId = parseInt(oThis.getView().getModel('userData').getData().USER_ID);
        var userId = sap.ui.getCore().getModel('userData').getData().USER_ID;

        if (userId != null) {
            var data = {
                action: "getAllUserDetails",
                supervisor_id: userId
            };
            Api.post(Urls.url(), data)
                .done(function(d) {
                    //alert('success');
                    oThis.markerData = d.result;

                    // for (var i = 0; i < d.result.length; i++) {
                    // 	// if(data[i]['id']==='INI25471'){

                    // 	var item = d.result[i];

                    // 	var medFlag = false;
                    // 	var criticalFlag = false;
                    // 	//hashmaps for bank and priority
                    // 	var bankFilterData = {};
                    // 	var priorityFilter = {};
                    // 	//convert sensor data
                    // 	item.sensor = getSensorData(item);

                    // 	item.status = "low";

                    // 	for (var j = 0; j < item.sensor.length; j++) {
                    // 		var value = item.sensor[j];
                    // 		if (value.status === "medium") {
                    // 			medFlag = true;
                    // 			continue;
                    // 		} else if (value.status === "critical") {
                    // 			criticalFlag = true;
                    // 			break;
                    // 		}

                    // 	}
                    // 	d.result[i].status = "low";
                    // 	if (medFlag) {
                    // 		d.result[i].status = "medium";

                    // 	}
                    // 	if (criticalFlag) {
                    // 		d.result[i].status = "critical";
                    // 	}

                    // 	// make a model with hash map of alert type
                    // 	// if (priorityFilter[item.status] == null) {
                    // 	// 	priorityFilter[item.status] = [i];
                    // 	// } else {
                    // 	// 	priorityFilter[item.status].push(i);
                    // 	// }

                    // 	// // //// make a model with hash map of bank type
                    // 	// if (bankFilterData[item['BANK_NAME']] == null) {
                    // 	// 	bankFilterData[item['BANK_NAME']] = [i];
                    // 	// } else {
                    // 	// 	bankFilterData[item.BANK_NAME].push(i);
                    // 	// }
                    // 	// var filters = {
                    // 	// 	priorities: [],
                    // 	// 	banks: []
                    // 	// };
                    // 	// for (var property in priorityFilter) {
                    // 	// 	if (priorityFilter.hasOwnProperty(property)) {
                    // 	// 		filters.priorities.push({
                    // 	// 			priority: property,
                    // 	// 			selected: true,
                    // 	// 			obj: d.result[i]
                    // 	// 		});
                    // 	// 	}
                    // 	// }

                    // 	// for (var property1 in bankFilterData) {
                    // 	// 	if (bankFilterData.hasOwnProperty(property1)) {
                    // 	// 		filters.banks.push({
                    // 	// 			bank: property1,
                    // 	// 			selected: true,
                    // 	// 			obj: d.result[i]
                    // 	// 		});
                    // 	// 	}
                    // 	// }
                    // }

                    // if (d.result != null && d.result.length > 0) {
                    // 	templat = d.result[0].LATITUDE;
                    // 	templng = d.result[0].LONGITUDE;
                    // 	setData(oThis, {

                    // 		center: {
                    // 			lat: d.result[0].LATITUDE,
                    // 			lng: d.result[0].LONGITUDE
                    // 		},
                    // 		points: d.result,
                    // 		filters: filters

                    // 	});
                    // }
                    fn(d.result, oThis);
                })
                .fail(function(d) {
                    MessageBox.show(
                        oThis.i18n().getText('message_box_msg_fetch_data_failed'),
                        null,
                        oThis.i18n().getText('message_box_title_error'), [oThis.i18n().getText('message_box_button_ok')]
                    );
                })
                .always(function(d) {
                    // BusyIndicator.hide();
                });

        }
    };


    var getAdminData = function(oThis, fn) {
        // BusyIndicator.show(0);
        // var userId = parseInt(oThis.getView().getModel('userData').getData().USER_ID);
        var userId = sap.ui.getCore().getModel('userData').getData().USER_ID;

        if (userId != null) {
            var data = {
                action: "getAllATMS"
                    //supervisor_id: userId
            };
            Api.post(Urls.url(), data)
                .done(function(d) {
                    //alert('success');
                    oThis.markerData = d.result;

                    fn(d.result, oThis);
                })
                .fail(function(d) {
                    MessageBox.show(
                        oThis.i18n().getText('message_box_msg_fetch_data_failed'),
                        null,
                        oThis.i18n().getText('message_box_title_error'), [oThis.i18n().getText('message_box_button_ok')]
                    );
                })
                .always(function(d) {
                    // BusyIndicator.hide();
                });

        }
    };

    return {
        init: init,
        getOperatorData: getOperatorData,
        getData: getData,
        pin: pin,
        pinDetails: pinDetails,
        pinRemove: pinRemove,
        getSensorData: getSensorData,
        getAdminData: getAdminData
    };
});
