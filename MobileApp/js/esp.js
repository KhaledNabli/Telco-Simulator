

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

function sendEventToESP(espUrl, eventObject) {
	if(espUrl == "") {
		return;
	}

	espUrl += "?blocksize=1&quiesce=false";

	if(eventObject.opcode == undefined) {
		eventObject.opcode   = "i";
	}
	
    var eventBlock = [[eventObject]];
    var eventJSON  = JSON.stringify(eventBlock);

	return $.ajax({type: "POST",
					url: espUrl,
					contentType : "JSON",
					data: eventJSON});
}
