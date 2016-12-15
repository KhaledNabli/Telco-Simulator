var htmlTemplates = {};


function compileTemplates () {
	$("script[type='text/x-handlebars-template']").each(function(elem) {
		htmlTemplates[this.id] = Handlebars.compile($(this).html());
	});
}

function onMobileAppReady() {
	compileTemplates();
	console.log("Mobile App ready");
	startMobileApp();
}

function startMobileApp() {
	var token = location.href.split("#")[1] ? decodeURIComponent(location.href.split("#")[1]) : "";
    //var token = window.location.href.split("#")[1];
    loadConfiguration(token);
}

function loadConfiguration(token) {
    console.log("Loading Configuration for Token: " + token);
    getConfigurationByToken(token).done(function (config) { onLoadConfigurationDone(config);  });
}

function onLoadConfigurationDone(config) {

    console.log("Loading Configuration for Token: " + config.token + " successfull.");

    configScenario = config;

    updateMobileAppUI();
}

function checkVersion(config) {
	if (config.version < 102) {
		//2C3E50 rot:D62C1A blau:217DBB grün:166104 telekom-pink:D90A7D
		config.mobileApp.colorNavbarBack = '#2C3E50'; 
		config.mobileApp.colorNavbarText = '#eeeeee';
		config.mobileApp.colorPageBack = '#eeeeee';
		config.mobileApp.colorPageText = '#2C3E50';
		config.mobileApp.colorButtonBack = '#2C3E50';	
		config.mobileApp.colorButtonText = '#eeeeee';
		config.mobileApp.colorNavItemInactive = 'rgba(0, 0, 0, 0.4)';
		config.mobileApp.colorNavItemActive = '#eeeeee';
	}	
}


function updateMobileAppUI() {
	checkVersion(configScenario);

	$('.pageBackgroundImage').css("background-image","url('"+configScenario.mobileApp.homescreen_image+"')");
	addDisplayAttributeToEventParameters(configScenario.mobileApp.eventParameters);

	$("#divInputFields").append(htmlTemplates.inputFields({field: configScenario.mobileApp.eventParameters}));
	$("#divEventButtons").append(htmlTemplates.eventButtons({button: configScenario.mobileApp.eventTypes}));
	$("#divToggleButtons").append(htmlTemplates.toggleButtons({toggle: configScenario.mobileApp.eventGenerators}));
	$("#divCustDropdown").append(htmlTemplates.custDropdown({customer: configScenario.customerList}));
	$("#divEventDropdown").append(htmlTemplates.eventDropdown({eventType: configScenario.mobileApp.eventTypes}));
	
	configScenario.mobileApp.navHistory = Array();
	configScenario.mobileApp.navHistory.push("Home");
	configScenario.currentPageName = "Home";

	configScenario.mobileApp.eventGeneratorObject = {};

	$(".switch").bootstrapSwitch().on('switchChange.bootstrapSwitch', function(event, state) {
	  onToggleClick(this, state)
	});

	setThemeColor('navbar-back', configScenario.mobileApp.colorNavbarBack);
	setThemeColor('navbar-text', configScenario.mobileApp.colorNavbarText);
	setThemeColor('page-back', configScenario.mobileApp.colorPageBack);
	setThemeColor('page-text', configScenario.mobileApp.colorPageText);
	setThemeColor('button-back', configScenario.mobileApp.colorButtonBack);	
	setThemeColor('button-text', configScenario.mobileApp.colorButtonText);
	setThemeColor('navbar-text-inactive', configScenario.mobileApp.colorNavItemInactive);
	setThemeColor('navbar-text-active', configScenario.mobileApp.colorNavItemActive);
	
}


function addDisplayAttributeToEventParameters(eventParameters) {
	//create two more attributes for default values
	//if there is a comma separated list, then add attribute displayAsDropDown
	//and add an array with default values
	eventParameters.map(function (element) {
		var defaultValueList = element.defaultValue.split(",");
		if (defaultValueList.length > 1) {
			element.defaultValueList = defaultValueList;
		} 
	});
}


function getCurrentTimestamp() {
	var currentDate = new Date();
	return $.format.date(currentDate, "yyyy-MM-dd HH:mm:ss:SSS");
}

function processSingleEvent(eventType) {

	var espUrl = "http://" + configScenario.general.espHost + ":" + configScenario.general.espPubSubPort 
			 + "/inject/" + configScenario.mobileApp.espWindow + "?blocksize=1";

	var espEventDttm = getCurrentTimestamp();
	
	var eventObject = {};
	eventObject.eventType = eventType;
	eventObject.eventDttm = espEventDttm;
	eventObject.customerId = $('#customerId').val();

	configScenario.mobileApp.eventParameters.map(function (element) {
		if (element.dataType == "number") {
			eventObject[element.key] = parseInt($('#input_' + element.key).val());
		} else {
			eventObject[element.key] = $('#input_' + element.key).val();
		}
	});

	console.log(" send single event " + eventType);

	//sendEventToESP(espUrl, eventObject);
	$('#divWarningMessage').hide();
	if(configScenario.mobileApp.useEspProxy == 'No') {
		console.log("No Esp Proxy, send directly to ESP");
		sendEventToESP(espUrl, eventObject).done(
			function(result) {
					console.log("Success from ESP: " + result);
			});
	} else {
		sendEventToESPProxy("http://dachgpci01.emea.sas.com/ESPServiceAdapter/", espUrl, eventObject).done(
			function(result) {
				if (result.search("injected") > 0) {
					//console.log("Success");
				} else {
					console.log("Failed");
					$('#divWarningMessage').html("WARNING: ESP event injection failed - check ESP Server and RACE image name!");
					$('#divWarningMessage').show();
				}
			});		
	}
}


function processGeneratedEvent(eventGeneratorObject, generatedValue, toggleElement) {

	var espUrl = "http://" + configScenario.general.espHost + ":" + configScenario.general.espPubSubPort 
			 + "/inject/" + configScenario.mobileApp.espWindow + "?blocksize=1";

	var espEventDttm = getCurrentTimestamp();
	
	var eventObject = {};
	eventObject.eventType = eventGeneratorObject.event;
	eventObject.eventDttm = espEventDttm;
	eventObject.customerId = $('#customerId').val();

	configScenario.mobileApp.eventParameters.map(function (element) {
		if (element.dataType == "number") {
			eventObject[element.key] = parseInt($('#input_' + element.key).val());
		} else {
			eventObject[element.key] = $('#input_' + element.key).val();
		}
	});

	// configScenario.mobileApp.eventTypeKey = "eventType"
	// configScenario.mobileApp.eventDttmKey = "eventDttm"
	// configScenario.mobileApp.generatedValuesKey = "value" oder "amount"
	// eventObject[configScenario.mobileApp.generatedValuesKey] = generatedValue;
	eventObject.value = generatedValue;

	console.log("  send generated event " + eventGeneratorObject.event);

	//sendEventToESP(espUrl, eventObject);
	$('#divWarningMessage').hide();
	if(configScenario.mobileApp.useEspProxy == 'No') {
		console.log("No Esp Proxy, send directly to ESP");
		sendEventToESP(espUrl, eventObject).done(
			function(result) {
					console.log("Success from ESP: " + result);
			});
	} else {
		sendEventToESPProxy("http://dachgpci01.emea.sas.com/ESPServiceAdapter/", espUrl, eventObject).done(
			function(result) {
				if (result.search("injected") > 0) {
					//console.log("Success" + eventGeneratorObject.run);
				} else {
					eventGeneratorObject.run = false;
					$(toggleElement).bootstrapSwitch("state", false);
					$('#divWarningMessage').html("WARNING: ESP event injection failed - check ESP Server and RACE image name!");
					$('#divWarningMessage').show();
					console.log("WARNING: ESP event injection failed - check ESP Server and RACE image name!");
				}
			});		
	}
}


function eventGenerator(eventGeneratorObject, toggleElement) {

	if(eventGeneratorObject.run == true) { 

		// generate a new interval value with random function
		if(parseInt(eventGeneratorObject.intervalFrom) < 250) {
			console.log("intervalFrom was " + eventGeneratorObject.intervalFrom);
			eventGeneratorObject.intervalFrom = 250;
			console.log("intervalFrom is changed to " + eventGeneratorObject.intervalFrom);
		}
		var newInterval = Math.random() * 
				(parseInt(eventGeneratorObject.intervalTo) - parseInt(eventGeneratorObject.intervalFrom)) 
				+ parseInt(eventGeneratorObject.intervalFrom);
		
		// generate a new data value with random function
		var valueRange = (parseInt(eventGeneratorObject.valueTo) - parseInt(eventGeneratorObject.valueFrom));
		var valueFrom = parseInt(eventGeneratorObject.valueFrom); 
		var valueFactor = Math.random();
		var newData = parseInt((valueFactor * valueRange) + valueFrom);

		console.log("  value: " + newData);

		processGeneratedEvent(eventGeneratorObject, newData, toggleElement); 
		
		setTimeout(function() {
			eventGenerator(eventGeneratorObject)
		}, newInterval); 
		 
	} 
}

function onToggleClick(toggleElement, state) {
	var eventName = $(toggleElement).attr("name");
	
	if(eventName != "generator") {	
		var indexOfObject = findIndexByKey(configScenario.mobileApp.eventGenerators,"event",eventName);
		eventGeneratorObject = configScenario.mobileApp.eventGenerators[indexOfObject];
	} else {
		configScenario.mobileApp.eventGeneratorObject.event        
			= $('#input_eventName').val();
		configScenario.mobileApp.eventGeneratorObject.intervalFrom 
			= parseInt($('#input_intervalFrom').val());
		configScenario.mobileApp.eventGeneratorObject.intervalTo   
			= parseInt($('#input_intervalTo').val());
		configScenario.mobileApp.eventGeneratorObject.valueFrom    
			= parseInt($('#input_valueFrom').val());
		configScenario.mobileApp.eventGeneratorObject.valueTo      
			= parseInt($('#input_valueTo').val());
		eventGeneratorObject = configScenario.mobileApp.eventGeneratorObject;
	}

	if(state == false) {	
		eventGeneratorObject.run = false;
		console.log("STOP SENDING " + eventName);
	} else {
		eventGeneratorObject.run = true;
		console.log("START SENDING " + eventName);
		eventGenerator(eventGeneratorObject, toggleElement);
	}
}

function setThemeColor(element, color) {

	if (element == "page-back") {		
		$('.page').css('background-color', color);
	} else if (element == "page-text") {
		$('body').css('color', color);
	} else if (element == "navbar-back") {
		$('.navbar-default').css('background-color', color);
	} else if (element == "navbar-text") {
		$('.navbar-brand').css('color', color);
		$('.navbar-brand:focus').css('color', color);
	} else if (element == "button-back") {
		$('.btn').css('background-color', color);
		$('.btn').css('border-width', 0);
		$('.bootstrap-switch-handle-on.bootstrap-switch-primary').css('background-color',color);
	} else if (element == "button-text") {
		$('.btn').css('color', color);
		$('.bootstrap-switch-handle-on.bootstrap-switch-primary').css('color',color);
	} else if (element == "navbar-text-inactive") {
		$('.navItemInActive').css('color', color);
	} else if (element == "navbar-text-active") {
		$('.navItemActive').css('color', color);
	}
}

function onNavItemClick(navToPageName) {
	var idNavItemFrom = '#nav' + configScenario.currentPageName;
	var idNavItemTo = '#nav' + navToPageName;
	if (navToPageName != configScenario.currentPageName) {
		$('#page'+navToPageName).removeClass('hidePage');
		$('#page'+navToPageName).addClass('animateShowUpCenter');
		$('#page'+configScenario.currentPageName).addClass('hidePage');	

		$(idNavItemTo).addClass('navItemActive');
		$(idNavItemTo).removeClass('navItemInActive');

		$(idNavItemFrom).removeClass('navItemActive');
		$(idNavItemFrom).addClass('navItemInActive');

		configScenario.currentPageName = navToPageName;
	}
	/*setThemeColor('navbar-text-inactive', 'rgba(0, 0, 0, 0.4)');
	setThemeColor('navbar-text-active', '#eeeeee');
	*/
	setThemeColor('navbar-text-inactive', configScenario.mobileApp.colorNavItemInactive);
	setThemeColor('navbar-text-active', configScenario.mobileApp.colorNavItemActive);
}

function openPane(element) {
	var pane = $(element).attr("name");
	var paneId = "#page" + pane;
	$(paneId).removeClass('hidePage');
	$(paneId).removeClass(pane + 'Close');
	$(paneId).addClass(pane + 'Open');
}

function closePane(element) {
	var pane = $(element).attr("name");
	var paneId = "#page" + pane;
	$(paneId).removeClass(pane + 'Open');
	$(paneId).addClass(pane + 'Close');
}


function removeAnimations() {
	$('.page').removeClass("animateShowUpCenter");
	$('.page').removeClass("animateSwipeLeft");
	$('.page').removeClass("animateSwipeRight");
}