var espServerIP = "xracesx09088.demo.sas.com";
var espPort = "44444";

// will be overwriten by processEvent function
var espBeaconWindow = "http://" + espServerIP + ":" + espPort + "/inject/PaybackPoc/PaybackUseCases/BeaconEventSource?blocksize=1";

function publishEspEvent(windowUrl, eventCsv) {
	$.ajax({
		type: "POST",
		url: windowUrl,
		contentType : "text/csv",
		data: eventCsv})
	.always(function(responseXml, status) {
		console.log(responseXml);
	});
}

function getCurrentTimestamp() {
	var currentDate = new Date();
	return $.format.date(currentDate, "yyyy-MM-dd HH:mm:ss:SSS");
}

function processEvent(event_type) {
	
	var espEventDttm = getCurrentTimestamp();
	
	var espServer  = jsonData["espServer"];
	var espProject = jsonData["espProject"];
	var espQuery   = jsonData["espQuery"];
	var espWindow  = jsonData["espWindow"];
	var inputValue = $("#eventValue").val();
	var customerId = $("#inputCustomerId").val();
	var mobileNr = $("#inputMobileNr").val();

	var espEvent =  customerId + "," + event_type + "," + inputValue + "," + espEventDttm;
	console.log("input espEvent = " + espEvent);

	var espBeaconWindow = "http://" + espServer + "/inject/" + espProject + "/" + espQuery + "/" + espWindow + "?blocksize=1";


	var espEventPrefix = "i,n,,";
	var espEventPostfix= "\r\n";
	var espEventMessage = espEventPrefix + espEvent + espEventPostfix;
	console.log("[processEvent] data: " + espEventMessage);
	
	publishEspEvent(espBeaconWindow, espEventMessage);
}