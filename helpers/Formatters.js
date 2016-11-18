sap.ui.define([], function() {
    "use strict";

    var date = function(pat, date) {
        var formatter = sap.ui.core.format.DateFormat.getDateTimeInstance({ pattern: pat });
        return formatter.format(new Date(date));
    };

    var ticketPriorityState = function(prio) {
        var state = "None";
        switch (prio) {
            case 'HIGH':
            case 'High':
                state = "Error";
                break;
            case 'MEDIUM':
            case 'Medium':
                state = "Warning";
                break;
            case 'LOW':
            case 'Low':
                state = "Success";
                break;
        }
        return state;
    };

    var ticketPriorityText = function(prio) {
        var text = prio;
        switch (prio) {
            case 'HIGH':
                text = "High";
                break;
            case 'MEDIUM':
                text = "Medium";
                break;
            case 'LOW':
                text = "Low";
                break;
        }
        return text;
    };

    var ticketStatusText = function(status) {
        var text = status;
        switch (status) {
            case 'CLOSED':
                text = "Closed";
                break;
            case 'REJECTED':
                text = "Rejected";
                break;
            case 'OPENED':
                text = "Open";
                break;
            case 'APPROVED':
                text = "Approved";
                break;
            case 'FAKE':
                text = "Fake";
                break;
        }
        return text;
    };

    var sensorIcon = function(sensor) {
        var icon = "sap-icon://";
        switch (sensor) {
            case "vibration":
                icon += "line-charts";
                break;
            case "heat":
                icon += "temperature";
                break;
            case "contact":
                icon += "detail-view";
                break;
            case "motion":
                icon += "step";
                break;
            case "pid":
                icon += "physical-activity";
                break;
            case "door1":
            case "door2":
                icon += "visits";
                break;
            case "battery1":
                icon += "disconnected";
                break;
            case "battery2":
                icon += "disconnected";
                break;
            case "smoke":
                icon += "upload-to-cloud";
                break;
            case "power":
                icon += "lightbulb";
                break;
            case "voltage":
                icon += "journey-change";
                break;
            case "panic":
                icon += "physical-activity";
                break;
            case "AC1":
                icon += "heating-cooling";
                break;
            case "AC2":
                icon += "heating-cooling";
                break;
            case "Alarm":
                icon += "marketing-campaign";
                break;
            case "RFID":
                icon += "bar-code";
                break;
            case "powerstatus":
                icon += "energy-saving-lightbulb";
                break;
            case "currentvalue":
                icon += "performance";
                break;
            case "speaker":
                icon += "sound";
                break;
            case "camera1":
                icon += "camera";
                break;
            case "camera2":
                icon += "camera";
                break;
            case "camera3":
                icon += "camera";
                break;
            case "camera4":
                icon += "camera";
                break;
            case "light":
                icon += "lightbulb";
                break;
            case "controlbox":
                icon += "sap-box";
                break;
        }
        return icon;
    };

    var sensorText = function(sensor) {
        var text = "";
        switch (sensor) {
            case "vibration":
                text = "Vibration";
                break;
            case "heat":
                text = "Heat";
                break;
            case "contact":
                text = "Contact";
                break;
            case "motion":
                text = "Motion";
                break;
            case "pid":
                text = "PID";
                break;
            case "door1":
                text = "Door 1";
                break;
            case "door2":
                text = "Door 2";
                break;
            case "battery1":
                text = "Battery 1";
                break;
            case "battery2":
                text = "Battery 2";
                break;
            case "smoke":
                text = "Smoke";
                break;
            case "power":
                text = "Power";
                break;
            case "voltage":
                text = "Voltage";
                break;
            case "panic":
                text = "Panic";
                break;
            case "AC1":
                text = "AC 1";
                break;
            case "AC2":
                text = "AC 2";
                break;
            case "Alarm":
                text = "Alarm";
                break;
            case "RFID":
                text = "RFID";
                break;
            case "powerstatus":
                text = "Power Status";
                break;
            case "currentvalue":
                text = "Current";
                break;
            case "speaker":
                text = "Speaker";
                break;
            case "camera1":
                text = "Camera 1";
                break;
            case "camera2":
                text = "Camera 2";
                break;
            case "camera3":
                text = "Camera 3";
                break;
            case "camera4":
                text = "Camera 4";
                break;
            case "light":
                text = "Light";
                break;
            case "controlbox":
                text = "Control Box";
                break;
        }
        return text;
    };

    var sensorSwitch = function(status) {
        var state = false;
        switch (status) {
            case '1':
                state = true;
                break;
            case 'None':
                state = true;
                break;
            case '0':
                state = false;
                break;
            default:
                state = true;
                break;
        }
        return state;
    };

    var createATMPage1 = function(atmid, atmname, userid, bankid, areaname, cityid, pincode, latitude, logitude) {
        var enabled = true;
        if (atmid === "" || atmname === "" || userid === "" || bankid === "" || areaname === "" || cityid === "" || pincode === "" || latitude === "" || logitude === "") {
            enabled = false;
        }
        return enabled;
    };

    var createATMPage2 = function(cp1name, cp1email, cp1phone, cp2name, cp2email, cp2phone, cp3name, cp3email, cp3phone) {
        var enabled = true;
        if (cp1name === "" || cp1email === "" || cp1phone === "" || cp2name === "" || cp2email === "" || cp2phone === "" || cp3name === "" || cp3email === "" || cp3phone === "") {
            enabled = false;
        }
        return enabled;
    };

    var createATMPage3 = function(deviceid, brand, ip, date) {
        var enabled = true;
        if (deviceid === "" || brand === "" || ip === "" || date === "") {
            enabled = false;
        }
        return enabled;
    };

    return {
        date: date,
        ticketPriorityState: ticketPriorityState,
        ticketPriorityText: ticketPriorityText,
        ticketStatusText: ticketStatusText,
        sensorText: sensorText,
        sensorIcon: sensorIcon,
        sensorSwitch: sensorSwitch,
        createATMPage1: createATMPage1,
        createATMPage2: createATMPage2,
        createATMPage3: createATMPage3
    };
});