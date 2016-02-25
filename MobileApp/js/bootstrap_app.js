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
    var token = window.location.href.split("#")[1];
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


function updateMobileAppUI() {

	$('.pageBackgroundImage').css("background-image","url('"+configScenario.mobileApp.homescreen_image+"')");
	
	$("#divInputFields").append(htmlTemplates.inputFields({field: configScenario.mobileApp.eventParameters}));
	$("#divEventButtons").append(htmlTemplates.eventButtons({button: configScenario.mobileApp.eventTypes}));
	$("#divToggleButtons").append(htmlTemplates.toggleButtons({toggle: configScenario.mobileApp.eventGenerators}));
	$("#divCustDropdown").append(htmlTemplates.custDropdown({customer: configScenario.customerList}));
	$("#divEventDropdown").append(htmlTemplates.eventDropdown({eventType: configScenario.mobileApp.eventTypes}));
	// set theme color
	setThemeColor(configScenario.mobileApp.colorThemePage,   "page");
	setThemeColor(configScenario.mobileApp.colorThemeBar,    "bar");
	setThemeColor(configScenario.mobileApp.colorThemeBarText,"bar-text");
	setThemeColor(configScenario.mobileApp.colorThemeButton, "button");
	setThemeColor(configScenario.mobileApp.colorThemeText,   "text-theme");
	setThemeColor(configScenario.mobileApp.colorThemeBorder, "border-theme");

	configScenario.mobileApp.navHistory = Array();
	configScenario.mobileApp.navHistory.push("Home");
	configScenario.currentPageName = "Home";

	configScenario.mobileApp.eventGeneratorObject = {};

	$(".switch").bootstrapSwitch().on('switchChange.bootstrapSwitch', function(event, state) {
	  onToggleClick(this, state)
	});

	$('#navHome').addClass('navItemActive');
}


function addDisplayAttributeToEventParameters() {
	//configScenario.mobileApp.eventParameters
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
	sendEventToESPProxy("http://dachgpci01.emea.sas.com/ESPServiceAdapter/", espUrl, eventObject);
}


function processGeneratedEvent(eventType, generatedValue) {

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


	eventObject.value = generatedValue;

	console.log("  send generated event " + eventType);

	//sendEventToESP(espUrl, eventObject);
	sendEventToESPProxy("http://dachgpci01.emea.sas.com/ESPServiceAdapter/", espUrl, eventObject);
}


function eventGenerator(eventGeneratorObject) {

	if(eventGeneratorObject.run == true) { 

		// generate a new interval value with random function
		var newInterval = Math.random() * 
				(parseInt(eventGeneratorObject.intervalTo) - parseInt(eventGeneratorObject.intervalFrom)) 
				+ parseInt(eventGeneratorObject.intervalFrom);
		
		// generate a new data value with random function
		var valueRange = (parseInt(eventGeneratorObject.valueTo) - parseInt(eventGeneratorObject.valueFrom));
		var valueFrom = parseInt(eventGeneratorObject.valueFrom); 
		var valueFactor = Math.random();
		var newData = parseInt((valueFactor * valueRange) + valueFrom);

		console.log("  value: " + newData);

		processGeneratedEvent(eventGeneratorObject.event, newData); 
		
		setTimeout(function() {
			eventGenerator(eventGeneratorObject)
		}, newInterval); 
		 
	} 
}

function onToggleClick(element, state) {
	var eventName = $(element).attr("name");
	
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

function onNavClick(element) {
	var page = $(element).attr('name');
	var id = $(element).attr('id');
	if (page != configScenario.currentPageName) {
		$('#page'+page).removeClass('hidePage');
		$('#page'+configScenario.currentPageName).addClass('hidePage');		
		$(element).addClass('navItemActive');
		$('#nav'+configScenario.currentPageName).removeClass('navItemActive');
		configScenario.currentPageName = page;
	}
}

function onNavItemClick(navToPageName, animation) {

	var idPrevPage = "page" + configScenario.currentPageName;
	var idNextPage = "page" + navToPageName;
	var navIconPosition = "";

	// if you click on same nav icon again - do nothing
	if (idPrevPage == idNextPage) {
		return;
	}

	//fill navigation History Array
	configScenario.mobileApp.navHistory.push(navToPageName);
	console.log(configScenario.mobileApp.navHistory);

	if (animation == "SwipeLeft" || animation == "SwipeRight") {
	} else {
		if (navToPageName == "Home" ) {
			animation = "ShowUpLeft";
		} else if (navToPageName == "Generator") {
			animation = "ShowUpRight";
		} else {
			animation = "ShowUpCenter";
		}
	}  	
	appear(idNextPage, idPrevPage, animation);	
	
	$("#nav"  + configScenario.currentPageName).removeClass("active");
	$("#nav" + navToPageName).addClass("active");
	
	// set global page variable to new page name
	configScenario.currentPageName = navToPageName;

	console.log("navToPageName: " + navToPageName);

}

function appear(page, prevpage, animation) {
	var animationClass = "animate" + animation;
	var page = "#" + page;
	var prevpage = "#" + prevpage;
	
	$(page).removeClass("hidePage");
	$(page).addClass(animationClass);
	
	$(page).on("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(e){
		console.log("hide page: " + prevpage);
		$(prevpage).addClass("hidePage");
		removeAnimations();
  	});
}

function removeAnimations() {
	$('.page').removeClass("animateShowUpLeft");
	$('.page').removeClass("animateShowUpCenter");
	$('.page').removeClass("animateShowUpRight");
	$('.page').removeClass("animateSwipeLeft");
	$('.page').removeClass("animateSwipeRight");
}