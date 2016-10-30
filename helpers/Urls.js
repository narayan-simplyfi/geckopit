sap.ui.define([], function() {
    "use strict";

    var root = 'https://j5oc918f143b.ap1.hana.ondemand.com/';
    var local = jQuery.sap.getModulePath("ipms.atm.app") + "/data/";

    var geckopit =  function() { return root + "GECKOPIT/" ;};
    var sensors =  function() { 
    	return local + "sensors.json"
    };

    return {
    	geckopit: geckopit,
    	sensors: sensors
    };
});