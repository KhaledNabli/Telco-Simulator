var jsonData = {};
	jsonData["espServer"]  = "racesx11058.demo.sas.com:8081";
	jsonData["espProject"] = "TelcoGeoDetection";
	jsonData["espQuery"]   = "TelcoGeoQuery";
	jsonData["espWindow"]  = "NetworkEvents";
	jsonData["inputValue"] = "10";


var checkPage = function(){
    //Only run if twitter-widget exists on page
    var pageTitle = document.title;
    console.log("page changed to " + pageTitle);

    //if (pageTitle == "Settings") {
    	onSettingsReady();
    //}
};

window.addEventListener('push', checkPage);

function showDetails(offerImage) {
	$('#offerListDiv').hide();
	$('#imageOfferDetails').attr("src",offerImage);
	$('#offerDetailsDiv').show();
	$('#offerPageBackButton').attr("href","offers.html");
}

function onSubmitButtonClick() {
	$(".offer-details").toggle();
}


function getDefaultSettings() {
	$('#espServer').val("racesx11058.demo.sas.com:8081");
	$('#espProject').val("Telco_01");
	$('#espQuery').val("AggrQuery");
	$('#espWindow').val("CDR_Source");
	$('#espEvent').val('1,minutes,34');

	jsonData["espServer"]  = $('#espServer').val();
	jsonData["espProject"] = $('#espProject').val();
	jsonData["espQuery"]   = $('#espQuery').val();
	jsonData["espWindow"]  = $('#espWindow').val();
	jsonData["espEvent"]   = $('#espEvent').val();
}

function saveIntoStorage(element) {

	jsonData[$(element).prop("id")] = $(element).val(); 
	console.log("save: " + $(element).prop("id") + " = " + $(element).val());
}

function onSettingsReady() {
	console.log("onSettingsReady call");
	$('#espServer').val(jsonData["espServer"]);
	$('#espProject').val(jsonData["espProject"]);
	$('#espQuery').val(jsonData["espQuery"]);
	$('#espWindow').val(jsonData["espWindow"]);
	$('#espEvent').val(jsonData["espEvent"]);
}


