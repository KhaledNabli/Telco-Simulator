var htmlTemplates = {};

function compileTemplates () {
	$("script[type='text/x-handlebars-template']").each(function(elem) {
		htmlTemplates[this.id] = Handlebars.compile($(this).html());
	});
}

function onMobileAppReady() {
	compileTemplates();
	updateMobileAppUI();
	console.log("Mobile App ready");
}

function updateMobileAppUI() {

	$('.pageBackgroundImage').css("background-image","url('"+configScenario.mobileApp.homescreen_image+"')");
	
	$("#divInputFields").append(htmlTemplates.inputFields({field: configScenario.mobileApp.eventParameters}));
	$("#divEventButtons").append(htmlTemplates.eventButtons({button: configScenario.mobileApp.eventTypes}));
	$("#divToggleButtons").append(htmlTemplates.toggleButtons({toggle: configScenario.mobileApp.eventGenerators}));
	// set theme color
	setThemeColor(configScenario.mobileApp.colorThemePage,   "page");
	setThemeColor(configScenario.mobileApp.colorThemeBar,    "bar");
	setThemeColor(configScenario.mobileApp.colorThemeBarText,"bar-text");
	setThemeColor(configScenario.mobileApp.colorThemeButton, "button");
	setThemeColor(configScenario.mobileApp.colorThemeText,   "text-theme");
	setThemeColor(configScenario.mobileApp.colorThemeBorder, "border-theme");
}

function getCurrentTimestamp() {
	var currentDate = new Date();
	return $.format.date(currentDate, "yyyy-MM-dd HH:mm:ss:SSS");
}

function processEvent(eventType, value) {

	var espUrl = "http://" + configScenario.espHost + ":" + configScenario.espAdminPort 
			 + "/inject/" + configScenario.espProject + "/" + configScenario.espQuery 
			 + "/" + configScenario.mobileApp.espWindow + "?blocksize=1";
	
	var espEventDttm = getCurrentTimestamp();
	
	var eventObject = {};
	eventObject.eventType = eventType;
	eventObject.eventDttm = espEventDttm;

	configScenario.mobileApp.eventParameters.map(function (element) {
		if (element.dataType == "number") {
			eventObject[element.key] = parseInt($('#input_' + element.key).val());
		} else {
			eventObject[element.key] = $('#input_' + element.key).val();
		}
	});

	if(value != undefined) {
		eventObject.value = value;
	} else {
		console.log(" send single event " + eventType);
	}

	//console.log(eventObject);
	

	sendEventToESP(espUrl, eventObject);
}


function eventGenerator(eventObject) { 
	if(eventObject.run == true) { 
		var newInterval = Math.random() * (eventObject.intervalTo - eventObject.intervalFrom) + eventObject.intervalFrom;
		var newData = parseInt(Math.random() * (eventObject.valueTo - eventObject.valueFrom) + eventObject.valueFrom);
		processEvent(eventObject.key, newData); 
		
		setTimeout(function() {
			eventGenerator(eventObject)
		}, newInterval); 

		console.log("  " + eventObject.key + " value: " + newData); 
	} 
}

function onToggleClick(element, key) {
	var isActive = $(element).attr("class").indexOf("active") > -1;
	var eventGeneratorObject = $.grep(configScenario.mobileApp.eventGenerators, 
					   function(e){ return e.key == key; })[0];

	if(isActive == true) {
		$(element).removeClass("active");	
		eventGeneratorObject.run = false;
		console.log("STOP SENDING " + key);
	} else {
		$(element).addClass("active");
		eventGeneratorObject.run = true;
		console.log("START SENDING " + key);
		eventGenerator(eventGeneratorObject);
	}
}

function setThemeColor(color, element) {
	/* style sheet string with placeholder for color */
	var styleString = "";

	if (element == "page") {
		
		$('.backgroundTransparent').css('background-color', color);
		//$('.page-layer').css('background-color', color);
		//styleString = ".page-layer { background-color: {{color}}; }";
	} else if (element == "bar") {
		$('.bar').css('background-color', color);
		$('.topbar').css('background-color', color);
	} else if (element == "button") {
		$('.btn-positive').css('background-color', color);
	} else if (element == "bar-text") {
		$('.bar-text-theme').css('color', color);
		styleString = ".bar-tab .tab-item.active {"
    				+ "  color: {{color}}; }";
	} else if (element == "text-theme") {
		$('.text-theme').css('color', color);
		styleString = ".text-theme, .navigate-right:after, .push-right:after {"
    				+ "  color: {{color}}; }";
	} else if (element == "border-theme") {
		$('.badge-theme').css('background-color', color);
		$('.border-theme').css('border-bottom-color', color);
		$('.border-theme').css('border-top-color', color);
		styleString = ".border-theme { border-bottom-color: {{color}}; border-top-color: {{color}}; }"
                    + ".nav-theme { color: {{color}}; }"
                    + ".bar-tab .tab-item { color: {{color}}; }"
                    + ".badge-theme{ background-color: {{color}};}";
	}

    var node = document.createElement('style');
    /* replace color placeholder and add style sheet string */
    node.innerHTML = styleString.replace(new RegExp("{{color}}",'g'), color);
    document.body.appendChild(node);
}