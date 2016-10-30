sap.ui.define([
    "sap/m/MessageToast"
], function(MessageToast) {
    "use strict";

    var objectCopy = function(data) {
        return JSON.parse(JSON.stringify(data))
    };

    var errorHandler = function(data, dm) {
    	var msg;
    	if (!data.responseJSON || !data.responseJSON.Message) {
    		msg = dm;
    	} else {
    		msg = data.responseJSON.Message;
    	}
    	MessageToast.show(msg);
    };

    return {
        objectCopy: objectCopy,
        errorHandler: errorHandler
    };
});
