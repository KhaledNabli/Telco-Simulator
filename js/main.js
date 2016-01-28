var demoScenario = {};
var htmlTemplates = {};

function onReady() {
	compileTemplates();
	preConfiguration();
	loadDefaultConfiguration(onConfigurationLoadedHandler);	
}

function compileTemplates () {
	$("script[type='text/x-handlebars-template']").each(function(elem) {
		htmlTemplates[this.id] = Handlebars.compile($(this).html());
	});
}

// called before configuration is available
function preConfiguration() {
	$("#saveLocationsPosition").hide();

}

// called after configuration is available
function onConfigurationLoadedHandler() {

	console.log("configuration loaded");
	// update UI Here...
	displayMapAndLocations();
	refreshCustomers(demoScenario.customerList);
	createCustomerDialog();
	loadConfiguratorUI();
}

function loadDefaultConfiguration(callFunctionWhenReady) {
	$.getJSON("config.json", function(configJSON) {
	    demoScenario = configJSON;
	    callFunctionWhenReady();
	});
}

function loadConfigurationFromToken(token, callFunctionWhenReady) {
	// TODO get configuration from token server
	callFunctionWhenReady();
}

function displayMapAndLocations() {
	// Display image in Tempate
	$("#storeMap").html(htmlTemplates.storeMapDiv({image: demoScenario.storeMapImg}));

	// workaround to resize beacons based on original image width vs browser window width
	var newImg = new Image();
	newImg.onload = function() {
      var height = newImg.height;
      var width = newImg.width;
      demoScenario.storeMapOrigWidth = width;
      refreshLocations(demoScenario.locationList);
    }

    // needs to be after the event handler
    newImg.src = demoScenario.storeMapImg;
}

function createCustomerDialog() {
	var customerAttributes = Array();

	for (var customField of demoScenario.customFields) {
		if(customField.entity == "customer") { 
			customerAttributes.push({key: customField.key, label: customField.label}) ;
		}
	};
    
	$("#dialogCustomerFields").html(htmlTemplates.custDialogue({customerAttributes: customerAttributes}));
	$("#customerInfoDialog").dialog({autoOpen: false, resizable: false, height:450, width:750, hide: "explode"});
}


function loadConfiguratorUI() {
	$("#demoConfigurator").load("./configurator_old.html", 
		function () {
			console.log("Loading Configurator completed.");
			updateConfiguratorUI(); // defined in configurator.js
			console.log("Init Configurator completed.");
		}
	);
}


	
function makeLocationsEditable() {
	$( ".location.container" ).addClass("editable");
	$( ".location.container" ).draggable();
	$( ".location.container" ).resizable();
	$("#editLocationsPosition").hide();
	$("#saveLocationsPosition").show();
}
	
function makeLocationsHidden() {
	$( ".location.container.editable" ).draggable("destroy");
	$( ".location.container.editable" ).resizable("destroy");
	$( ".location.container.editable" ).removeClass("editable");
}


function saveLocationsPosition(){
	$.each(demoScenario.locationList, function () {
		var locationContainer = $("#location_div_"+this.id);
		this.size.width = 	Math.round(locationContainer.width() / demoScenario.storeMapScale);
		this.size.height = 	Math.round(locationContainer.height() / demoScenario.storeMapScale);
		this.position.top = Math.round(locationContainer.position().top / demoScenario.storeMapScale);
		this.position.left = Math.round(locationContainer.position().left / demoScenario.storeMapScale);
	});

	makeLocationsHidden();
	
	$("#editLocationsPosition").show();
	$("#saveLocationsPosition").hide();
}


function refreshCustomers(customerList) {
	// clear
	$(".customer.container").parent().remove();

	$.each(customerList, function () {
		// Render Tempate customerDiv
		$("#customer-list").append(htmlTemplates.customerContainerDiv({id: this.id , image: "img/map_pin_" +this.id+ ".png"}));
	});
	$( ".customer.container" ).draggable();

	$( ".customer.container" ).on('tap', function() {
  		onClickOnCustomer(this);
	});
	$( ".customer.container" ).on('click', function() {
  		onClickOnCustomer(this);
	});
}

function refreshLocations(beaconList) {
	var makeLocationsEditable = $(".location.container.editable").length > 0; // TODO: error prone!
	$(".location.container").remove();
	demoScenario.storeMapScale = $("#storeMapImg").width() / demoScenario.storeMapOrigWidth;

	$.each(beaconList, function () {
		var top = this.position.top * demoScenario.storeMapScale;
		var left = this.position.left * demoScenario.storeMapScale;
		var width = this.size.width * demoScenario.storeMapScale; 
		var height = this.size.height * demoScenario.storeMapScale;

		
		var additionalClass = makeLocationsEditable == true ? "editable" : "";

		var newLocationContainerHtml = htmlTemplates.locationContainerDiv({	label: this.label, 
																			id: this.id, 
																			top: top, 
																			left: left, 
																			width: width, 
																			height: height, 
																			color: this.color, 
																			additionalClass: additionalClass
																			});
		var locationContainer = $(newLocationContainerHtml);
		if(makeLocationsEditable == true) {
			locationContainer.draggable();
			locationContainer.resizable();
		}

		$("#storeMap").append(locationContainer);
	});

	$( ".location.container" ).droppable({ tolerance: "intersect"});
	$( ".location.container" ).on( "dropover", onDropOver );
}


function onDropOver(event, ui) {
	var locationId = parseDivId("location_div_",this.id);
	var customerId = parseDivId("customer_div_",ui.draggable.context.id);
	var customerIndex = findIndexByKey(demoScenario.customerList, "id", customerId);
	var locationIndex = findIndexByKey(demoScenario.locationList, "id", locationId);

	if(customerIndex < 0 || locationIndex < 0) {
		return;
	}

	var divElement = $(this);
	divElement.addClass("animateLocation");
	setTimeout(function () {
		$(".animateLocation").removeClass("animateLocation");
	},1000);


	var eventObject = {eventDttm: getCurrentTimestamp(), customerId: customerId, locationId: locationId};

	// TODO: design as customFields?
	eventObject.memberNm = demoScenario.customerList[customerIndex].label;
	eventObject.mobileNr = demoScenario.customerList[customerIndex].mobilenr;
	eventObject.locationNm = demoScenario.locationList[locationIndex].label;
	// construct customFields for ESP 
	for (var customField of demoScenario.customFields) {
		if(customField.entity == "customer" && customField.espKey != "") {
			eventObject[customField.espKey] = demoScenario.customerList[customerIndex][customField.key];
		}
		else if(customField.entity == "location" && customField.espKey != "") {
			eventObject[customField.espKey] = demoScenario.locationList[locationIndex][customField.key];
		}
	}

	// send event
	var espUrl = "http://" + demoScenario.espHost + ":" + demoScenario.espAdminPort + "/inject/" + demoScenario.espProject + "/" + demoScenario.espQuery + "/" + demoScenario.espWindow
	sendEventToESP(espUrl, eventObject); // .done()... to check connectivity
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

function displayCustomFields(entityType, entityObject, cssPrefix) {
	for (var customField of demoScenario.customFields) {
		if(customField.entity == entityType) {
			$(cssPrefix + customField.key).html(entityObject[customField.key]);
		}
	}
}



function onClickOnCustomer(element) {
	var customerId = parseDivId("customer_div_", element.id);
	displayCustomerProfile(customerId)
}

function displayCustomerProfile(customerId) {
	var customerIndex = findIndexByKey(demoScenario.customerList, "id" , customerId);

	// display mandatory fields: name and mobilenr
	$("#customerInfoDialog").dialog({'title': 'Profile of ' + demoScenario.customerList[customerIndex].label});
	$('#dialogCustomerName').html(demoScenario.customerList[customerIndex].label);
	$('#dialogCustomerPhone').html(demoScenario.customerList[customerIndex].mobilenr);
	
	// display customFields
	displayCustomFields("customer", demoScenario.customerList[customerIndex], "#dialogCustomer_");

	// display image
	if(demoScenario.customerList[customerIndex].img != "") {
		$('#dialogCustomerImage').attr("src",demoScenario.customerList[customerIndex].img);
	} else {
		$('#dialogCustomerImage').attr("src","img/no_avatar.png");
	}
	
	// clear contact history and interest
	$("#dialogCustomerHistory > table").remove();
	$("#dialogCustomerInterests > div").remove();

	// display profile from RTDM
	readCustomerProfileFromRtdm(customerId).done(onProfileReceivedFromRtdm);

	// open dialog
	$("#customerInfoDialog").dialog('open');
}


function transformRtdmDatagrid(datagrid) {
	var result = {};
	result.columns = Array();
	result.values = Array();

	if(datagrid == undefined || datagrid.length != 2 || datagrid[0].metadata == undefined || datagrid[1].data == undefined) {
		// invalid schema!
		console.log("Warning: Provided RTDM Datagrid has an invalid schema.");
		return result;
	} 

	for(var columnIndex in datagrid[0].metadata) {
		var columnMetadata = datagrid[0].metadata[columnIndex];
		for(var columnProp in columnMetadata) {
			result.columns.push({index: columnIndex, name: columnProp, dataType: columnMetadata[columnProp]});
		}
	}

	for(var rowData of datagrid[1].data) {
		var rowObject = {};
		for(var column of result.columns) {
			rowObject[column.name] = rowData[column.index];
		}
		result.values.push(rowObject);
	}

	return result;
}


function onProfileReceivedFromRtdm(rtdmResponse) {
	var customerIndex = findIndexByKey(demoScenario.customerList, "id", rtdmResponse.outputs.customerId);
	var interests = transformRtdmDatagrid(rtdmResponse.outputs.interests);
	var contactHistory = transformRtdmDatagrid(rtdmResponse.outputs.contactHistory);


	updateCustomerInterestsBar(interests.values);
	updateCustomerContacthistory(contactHistory.values);

	// TODO: update customFields
	for (var customField of demoScenario.customFields) {
		if(customField.entity == "customer" && customField.rtdmKey != "" && rtdmResponse.outputs.hasOwnProperty(customField.rtdmKey)) {
			if(customerIndex >= 0) {
				demoScenario.customerList[customerIndex][customField.key] = rtdmResponse.outputs[customField.rtdmKey];
			}
			
			$("#dialogCustomer_" + customField.key).html(rtdmResponse.outputs[customField.rtdmKey]);
		}
	}
}

function updateCustomerInterestsBar(interests) {
	var sum = 0;
	var key = demoScenario.interestCalculation;

	// scale based on sum
	for (var item of interests) {
		sum += item[key];
	}

	// recalc the value
	for (var item of interests) {
		item.value = Math.round(item[key] / sum * 100);
		item.color = getObjectColorByKey("location", "label", item.label);
	}

	$("#dialogCustomerInterests").html(htmlTemplates.dialogCustomerInterestBar({interests: interests}));

}

function updateCustomerContacthistory(contactHistory) {
	var contacts = Array();

	for(var item of contactHistory) {
		var contact = {};


		contact.date = 		$.format.date((new Date(item["CONTACT_DTTM"])), "dd.MM.yy HH:mm");
		contact.campaign = 	item["CAMPAIGN_NM"];
		contact.segment = 	item["MARKETING_CELL_NM"];
		contact.offer = 	item["TREATMENT_NM"];
		contact.info1 = 	item["EXTERNAL_CONTACT_INFO_ID1"];
		contact.info2 = 	item["EXTERNAL_CONTACT_INFO_ID2"];

		contacts.push(contact);
	}

	$("#dialogCustomerHistory").html(htmlTemplates.dialogCustomerHistoryTable({contacts: contacts}));
}


function readCustomerProfileFromRtdm(customerId) {
	var rtdmRequestUrl = "http://" + demoScenario.rtdmHost + "/SASDecisionServices/rest/runtime/decisions/" + demoScenario.rtdmEvent;
	var contentType = 'application/vnd.sas.decision.request+json';
	var rtdmRequest = {version : 1.0, clientTimeZone : jstz.determine().name(), inputs:{}};

	rtdmRequest.inputs = {customerId : customerId};
	
	return $.ajax({
		method: "POST",
		contentType: contentType,
		url: rtdmRequestUrl,
		data: JSON.stringify(rtdmRequest)
	});
}



function getCurrentTimestamp() {
	var currentDate = new Date();
	return $.format.date(currentDate, "yyyy-MM-dd HH:mm:ss:SSS");
}

function parseDivId(divPrefix, divId) {
	return parseInt(divId.replace(divPrefix, ""));
}
	

function onResize(event) {
	if(event.target === window) {
		refreshLocations(demoScenario.locationList);
	}
	else {
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


function getObjectColorByKey(entity, key, value) {
	var objectType = entity == "location" ? "locationList" : "customerList";
	var objectIndex = findIndexByKey(demoScenario[objectType], key , value);
	var objectColor = (objectIndex < 0) ? getRandomeDarkColor() : demoScenario[objectType][objectIndex].color;
	return objectColor;
}


function findIndexByKey(list, key, value) {
	return list.findIndex(function (element) { return element[key] === value; });
}
