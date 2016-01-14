var demoScenario = {};
//var contactHistoryTab = {};


function loadDemo() {
	// load scenario...
	loadConfiguration();
	// build up configurator ui...
	setupConfiguration();
	
	$("#storeMap").html("<img id=\"storeMapImg\" src=\"" + demoScenario.storeMapImg + "\" ></img>");
	
	$("#saveBeaconPosition").hide();
	$("#customerInfoDialog").dialog({autoOpen: false, resizable: false, height:450, width:750, hide: "explode"});

	setTimeout(function () {
		refreshCustomers(demoScenario.customerList);
		refreshBeacons(demoScenario.beaconList);
	}, 2000);

}

function setupConfiguration() {
	$("#demoConfigurator").load("./configurator.html", function () {
		console.log("Loading Configurator completed.");
		initConfigurator();
		console.log("Init Configurator completed.");
	});
}



function loadConfiguration() {
	// check local storage
	if(window.localStorage.demoScenario == undefined || 
		window.localStorage.demoScenario == "") {
		console.log("No saved demoScenario in localStorage");
		demoScenario = defaultDemoScenario;
		console.log("Loading default settings from democonfig.js");
	} else {
		console.log("Loading demoScenario from localStorage");
		demoScenario = JSON.parse(window.localStorage.demoScenario);
	}
	


	var serverParam = getUrlParameter('server');
	if(serverParam != undefined) {
		console.log("Overwriting Server Parameter");
		demoScenario.espBeaconWindow = "http://"+serverParam+":8081/inject/BeaconDetection/InStoreQuery/BeaconServer?blocksize=1";
		demoScenario.rtdmHost = serverParam;
	}

	connectToProvider('', demoScenario);
	return demoScenario;
}


function refreshCustomers(customerList) {
	// clear
	$(".draggableCustomer").parent().remove();

	$.each(customerList, function () {
		//console.log("add customer: " + this.label)

		var customerDivOuter = $("<div class=\"col-xs-12\"></div>");
		var customerDiv = $("<div></div>");
		customerDiv.attr("id", "customer_div_" + this.id);
		customerDivOuter.append(customerDiv);
		//customerDiv.css("background-color", this.color);
		customerDiv.css("z-index", 10);
		customerDiv.addClass("draggableCustomer");

		var customerImgDiv = $("<div class=\"col-xs-6 avatarImgCol vcenter\"></div>");
		var avatarImg = "img/map_pin_" + this.id + ".png" ;
		customerDiv.append("<img class=\"mapPin \" src=\"" + avatarImg + "\" />");
		customerDiv.append("<div class=\"mapPinPointer\"></div>");
		//customerDiv.append(customerImgDiv);

		/*
		var customerProfileDiv = $("<div class=\"col-xs-6 vcenter\"></div>");
		customerProfileDiv.append("<h4>"+this.label+"</h4>");
		customerProfileDiv.append("Member: "+this.id+"<br>");
		customerProfileDiv.append("Age: "+this.age+"<br>");
		customerDiv.append(customerProfileDiv);
		*/

		$("#customer-list").append(customerDivOuter);
	});
	$( ".draggableCustomer" ).draggable();

	$( ".draggableCustomer" ).on('tap', function() {
  		displayCustomerProfile(this);
	});
	$( ".draggableCustomer" ).on('click', function() {
  		displayCustomerProfile(this);
	});
}

function refreshBeacons(beaconList) {
	
	var makeBeaconsEditable = $(".beaconPlace.editable").length > 0;
	$(".beaconPlace").remove();
	demoScenario.storeMapScale = $("#storeMapImg").width() / demoScenario.storeMapOrigWidth;

	$.each(beaconList, function () {
		//console.log("add beacon: " + this.label);

		var beaconDiv = $("<div></div>");
		beaconDiv.attr("id", "beacon_div_" + this.id);
		beaconDiv.css("position", "absolute");
		beaconDiv.css("top", this.position.top * demoScenario.storeMapScale);
		beaconDiv.css("left", this.position.left * demoScenario.storeMapScale);
		beaconDiv.css("width", this.size.width * demoScenario.storeMapScale);
		beaconDiv.css("height", this.size.height * demoScenario.storeMapScale);
		beaconDiv.css("background-color", this.color);
		beaconDiv.addClass("beaconPlace");
		beaconDiv.html("<h3>"+ this.label +"</h3>");
		if(makeBeaconsEditable) {
			beaconDiv.addClass("editable");
			beaconDiv.draggable();
			beaconDiv.resizable();
		}

		$("#storeMap").append(beaconDiv);
	});




	$( ".beaconPlace" ).droppable({ tolerance: "intersect"});
	$( ".beaconPlace" ).on( "dropover", function( event, ui ) {


		console.log(ui.draggable.context.id + " dropped on " + this.id);

		// animate this beacon.
		//console.log($(this));

		var divElement = $(this);
		console.log("Starting Animation");
		divElement.addClass("animateBeacon");
		setTimeout(function () {
			console.log("Removing Animation");
			$(".animateBeacon").removeClass("animateBeacon");
		},1000);
		


		processBeaconEvent(parseDivId("beacon_div_",this.id), parseDivId("customer_div_",ui.draggable.context.id));
	} );
}


function findObjectById(list, id) {
	for(i = 0; i < list.length; i++) {
		if(list[i].id === id) return i;
	}
	return -1;
}

function findObjectByLabel(list, label) {
	for(i = 0; i < list.length; i++) {
		if(list[i].label === label) return i;
	}
	return -1;
}


function processBeaconEvent(beaconId, customerId) {


	console.log("processBeaconEvent(beaconId: " + beaconId + ", customerId: " + customerId + ");");
	var customerIndex = findObjectById(demoScenario.customerList, customerId);
	var beaconIndex = findObjectById(demoScenario.beaconList, beaconId);
	if(customerIndex < 0 || beaconIndex < 0)
		return;

	//$("#infobox").html(demoScenario.customerList[customerIndex].label + " has reached " + demoScenario.beaconList[beaconIndex].label + ".");

	var espEventDttm = getCurrentTimestamp()
	var espEventCsv = "i,n,,"+ (demoScenario.customerList[customerIndex].id) +","+ (demoScenario.beaconList[beaconIndex].id) +","+ (demoScenario.customerList[customerIndex].label) +"," + (demoScenario.beaconList[beaconIndex].label) +","+ espEventDttm+","+ (demoScenario.customerList[customerIndex].mobilenr) + ","+ (demoScenario.customerList[customerIndex].age) + ","+ (demoScenario.customerList[customerIndex].avgTopUp) + ","+ (demoScenario.customerList[customerIndex].avgDataUsg) + ","+ (demoScenario.customerList[customerIndex].avgNatMin) + ","+ (demoScenario.customerList[customerIndex].avgIntMin) + ","+ (demoScenario.customerList[customerIndex].avgSmsUsg) + ","+ (demoScenario.customerList[customerIndex].roamingFlg) + ","+ (demoScenario.customerList[customerIndex].device) +"\r\n";
	

	publishEspEvent(demoScenario.espBeaconWindow, espEventCsv);
}


function getCurrentTimestamp() {
	var currentDate = new Date();
	return $.format.date(currentDate, "yyyy-MM-dd HH:mm:ss:SSS");
}

function parseDivId(divPrefix, divId) {
	return parseInt(divId.replace(divPrefix, ""));
}
	
function publishEspEvent(windowUrl, eventCsv) {
	$.ajax({
		type: "POST",
		url: windowUrl,
		contentType : "text/csv",
		data: eventCsv})
	.error(function (responseXml, status) {
		//alert("ERROR: Can not connect to ESP!\nPlease check connection details.");
	})
	.always(function(responseXml, status) {
		console.log(responseXml);
	});
}
	
function makeBeaconsEditable() {
	$( ".beaconPlace" ).addClass("editable");
	$( ".beaconPlace" ).draggable();
	$( ".beaconPlace" ).resizable();
	$("#editBeaconPosition").hide();
	$("#saveBeaconPosition").show();
}
	
function makeBeaconsHidden() {
	$( ".beaconPlace.editable" ).draggable("destroy");
	$( ".beaconPlace.editable" ).resizable("destroy");
	$( ".beaconPlace.editable" ).removeClass("editable");
}


function saveBeaconPosition(){
	$.each(demoScenario.beaconList, function () {
		//console.log("get position of beacon: " + this.label);
		this.size.width = 	Math.round($("#beacon_div_"+this.id).width() / demoScenario.storeMapScale);
		this.size.height = 	Math.round($("#beacon_div_"+this.id).height() / demoScenario.storeMapScale);
		this.position.top = Math.round($("#beacon_div_"+this.id).position().top / demoScenario.storeMapScale);
		this.position.left = Math.round($("#beacon_div_"+this.id).position().left / demoScenario.storeMapScale);
		//console.log(this);
	});
	makeBeaconsHidden();
	window.localStorage.demoScenario = JSON.stringify(demoScenario);
	$("#editBeaconPosition").show();
	$("#saveBeaconPosition").hide();
}



function displayCustomerProfile(element) {
	var customerId = parseDivId("customer_div_", element.id);
	var customerIndex = findObjectById(demoScenario.customerList, customerId);
	console.log("Display Customer Profile for : " + element.id + " Index: " + customerIndex);
	$("#customerInfoDialog").dialog({'title': 'Profile of ' + demoScenario.customerList[customerIndex].label});
	$('#dialogCustomerName').html(demoScenario.customerList[customerIndex].label);
	$('#dialogCustomerAge').html(demoScenario.customerList[customerIndex].age);
	$('#dialogCustomerPhone').html(demoScenario.customerList[customerIndex].mobilenr);
	$('#dialogCustomerDevice').html(demoScenario.customerList[customerIndex].device);
	$('#dialogCustomerAvgTopUp').html(demoScenario.customerList[customerIndex].avgTopUp);
	$('#dialogCustomerAvgDataUsg').html(demoScenario.customerList[customerIndex].avgDataUsg);

	if(demoScenario.customerList[customerIndex].img != "") {
		$('#dialogCustomerImage').attr("src",demoScenario.customerList[customerIndex].img);
	} else {
		$('#dialogCustomerImage').attr("src","img/no_avatar.png");
	}
	
	$("#customerInfoDialogCHTr > tr").remove();
	$("#dialogCustomerInterests > div").remove();

	readCustomerProfileFromRtdm(customerId);

	$("#customerInfoDialog").dialog('open');
}













function readCustomerProfileFromRtdm(customerId) {
	var rtdmRequestUrl = "http://" + demoScenario.rtdmHost + "/SASDecisionServices/rest/runtime/decisions/" + demoScenario.rtdmEvent;
	var contentType = 'application/vnd.sas.decision.request+json';
	var rtdmRequest = {version : 1, clientTimeZone : "Europe/Berlin", "inputs":{}};

	

	rtdmRequest.inputs.MemberID = customerId;
	console.log(JSON.stringify(rtdmRequest));

	$.ajax({
		method: "POST",
		contentType: contentType,
		url: rtdmRequestUrl,
		data: JSON.stringify(rtdmRequest)
	})
	.done(function( rtdmResponse ) {
		console.log(rtdmResponse);

		


		var dataSetInterest = rtdmResponse.outputs["BeaconStatistics"][1].data;
		var totalCategoryPct = 0;
		var favoriteCategoryPct = 0;
		var favoriteCategory = "";
		var lastOffer = "";
		var totalVisits = 0;
		var lastOfferDt = undefined;
		$.each(dataSetInterest, function(index) {
			var categoryNm = dataSetInterest[index][2];
			var categoryPct = Math.round(parseFloat(dataSetInterest[index][5]));
			var categoryVisit = parseInt(dataSetInterest[index][3]);
			totalCategoryPct+=categoryPct;
			totalVisits+=categoryVisit;

			if(categoryPct > favoriteCategoryPct) {
				favoriteCategoryPct = categoryPct;
				favoriteCategory = categoryNm;
			}

			// fix progressbar width due to use of round.
			if((index+1) >= dataSetInterest.length) {
				categoryPct += (100 - totalCategoryPct);
			}

			var interestHtml = "<div class='progress-bar' role='progressbar' aria-valuenow='"+categoryPct+"' aria-valuemin='0' aria-valuemax='100' style='width: "+categoryPct+"%;background-color: "+getBeaconColor(categoryNm)+"; '>"+categoryNm+"</div>";
			$("#dialogCustomerInterests").append(interestHtml);
		});

		var dataSetCH = rtdmResponse.outputs["ContactHistory"][1].data;
		$.each(dataSetCH, function(index) {
			var entryDate = new Date(dataSetCH[index][0]);

			if(lastOfferDt == undefined || lastOfferDt < entryDate) {
				lastOfferDt = entryDate;
				lastOffer = dataSetCH[index][3];
			}

		    var newTabTrEntry = $("<tr></tr>");
		    newTabTrEntry.append($("<td>" + $.format.date(entryDate, "dd.MM.yyyy HH:mm") + "</td>"));
		    newTabTrEntry.append($("<td>" + dataSetCH[index][1] + "</td>"));
		    newTabTrEntry.append($("<td>" + dataSetCH[index][2] + "</td>"));
		    newTabTrEntry.append($("<td>" + dataSetCH[index][3] + "</td>"));
		    newTabTrEntry.append($("<td>" + dataSetCH[index][4] + "</td>"));
		    newTabTrEntry.append($("<td>" + dataSetCH[index][5] + "</td>"));	

		    $("#customerInfoDialogCHTr").append(newTabTrEntry);
		});

		$('#dialogCustomerAvgTurnOver').html(rtdmResponse.outputs["AvgTurnover"]);
		$('#dialogCustomerSegment').html(rtdmResponse.outputs["Segment"]);
		$('#dialogCustomerVisitsLst4Weeks').html(rtdmResponse.outputs["VisitsLst4Weeks"]);
		$('#dialogCustomerCurrentOffer').html(lastOffer);
		$("#dialogCustomerTotalVisits").html(totalVisits);
		$("#dialogCustomerFavCategory").html(favoriteCategory);
	});
}


function windowsResize(event) {

	if(event.target === window) {
		console.log("resize window");
		refreshBeacons(demoScenario.beaconList);
	}
	else {
		console.log("resize " + event.type);
		event.stopPropagation();
	}
}



function connectToProvider(action, demoScenario) {
	$.ajax({
		method: "POST",
		url: 'data/provider.php',
		data: {action: action, param: demoScenario}
	});
}


function getUrlParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) 
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) 
        {
            return sParameterName[1];
        }
    }
}


function getBeaconColor(beaconNm) {
	var beaconIndex = findObjectByLabel(demoScenario.beaconList, beaconNm);
	var beaconColor = getRandomeDarkColor();
	if(beaconIndex >= 0) {
		beaconColor = demoScenario.beaconList[beaconIndex].color;
	}
	return beaconColor;
}