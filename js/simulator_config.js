

/**
*	Refresh configuration ui
*
*/
function updateConfiguratorUI() {
	$("#demoEspHostInput").val(demoScenario.espLocationWindow);
	$("#demoRtdmHostInput").val(demoScenario.rtdmHost);
	$("#storeMapImgInput").val(demoScenario.storeMapImg);


	configBuildCustomerTable();

	configBuildLocationTable();
}

/**
*	Read configuration from ui
*
*/
function updateConfigurationFromUI() {
	demoScenario.espLocationWindow = $("#demoEspHostInput").val();
	demoScenario.rtdmHost = $("#demoRtdmHostInput").val(); 
	demoScenario.storeMapImg = $("#storeMapImgInput").val();
	demoScenario.customerList = configGetCustomersFromUi();
	demoScenario.locationList = configGetLocationsFromUi();
}

/**
*	Read configuration from ui
*
*/
function saveConfiguration() {
	updateConfigurationFromUI();
	refreshCustomers(demoScenario.customerList);
	refreshLocations(demoScenario.locationList);
	closeConfigurator();
	//window.localStorage.demoScenario = JSON.stringify(demoScenario);
	connectToProvider('saveScenario', demoScenario);
}

function showConfigurator() {
	console.log("Show configurator");
	$('#configuratorModal').modal('show');
}

function closeConfigurator() {
	$('#configuratorModal').modal('hide');
}

function resetConfiguration() {
	$("#configuratorCustomerTbody tr").remove();
	$("#configuratorLocationTbody tr").remove();
	demoScenario = defaultDemoScenario;
	updateConfiguratorUI(demoScenario);
}

function helpConfiguration() {

}


function configBuildCustomerTable() {
	var tableCols = Array();

	for (var customField of demoScenario.customFields) {
		if(["id", "label", "color", "img", "mobilenr"].includes(customField.key)) {
			continue;
		}

		if(customField.entity == "customer") {
			tableCols.push({label: customField.label});
		}
	}

	$("#configuratorCustomerTable").html(htmlTemplates.configCustomerTab({tableColumns: tableCols}));

	// display all customers
	$.each(demoScenario.customerList, function (index) {
		configAddCustomer(demoScenario.customerList[index]);
	});
}

function configBuildLocationTable() {
	var tableCols = Array();

	for (var customField of demoScenario.customFields) {
		if(["id", "label", "color"].includes(customField.key)) {
			continue;
		}

		if(customField.entity == "location") {
			tableCols.push({label: customField.label});
		}
	}

	$("#configuratorLocationTable").html(htmlTemplates.configLocationTab({tableColumns: tableCols}));

	$.each(demoScenario.locationList, function (index) {
		configAddLocation(demoScenario.locationList[index]);
	});
}

function configAddCustomer(customerObj) {
	var newEntry = customerObj == undefined || customerObj.id == undefined;
	var color = (newEntry || customerObj.color == undefined) ? getRandomeColor() : customerObj.color;
	var newEntryId = newEntry ? configGetNextCustomerId() : customerObj.id;

	var newCustomerEntry = {id: newEntryId, name: customerObj.label, image: customerObj.img, mobilenr: customerObj.mobilenr, backgroundColor: color, colorList: colors, customerAttributes: Array()};
	// populate customerAttributes array with customeFields
	for (var customField of demoScenario.customFields) {

		// this fields are included in the template - ignore if present
		if(["id", "label", "color", "img", "mobilenr"].includes(customField.key)) {
			continue;
		}
		
		if(customField.entity == "customer") {
			newCustomerEntry.customerAttributes.push({label: customField.label, key: customField.key, value: customerObj[customField.key], type: "text"});
		}
	}

	// render template and append to table
	$("#configuratorCustomerTbody").append(htmlTemplates.configCustomerRow(newCustomerEntry));

	return newCustomerEntry;
}

function configGetNextCustomerId() {
	return $("#configuratorCustomerTbody tr").map(function() {
		return parseInt($(this).find("input[name='id']").val());
	}).toArray().reduce(function(previousValue, currentValue, index, array) {
	 	return Math.max(currentValue, previousValue);
	}) + 1;
}

function configGetCustomersFromUi() {
	var customerList = [];

	$("#configuratorCustomerTbody tr").each(function() {

		var customerObj = {};
		customerObj.id = parseInt($(this).find("input[name='id']").val());
		customerObj.label = $(this).find("input[name='name']").val();
		customerObj.img = $(this).find("input[name='image']").val();
		customerObj.mobilenr = $(this).find("input[name='mobile']").val();
		customerObj.color = $(this).find("select[name='color']").val();
		for (var customField of demoScenario.customFields) {
			// this fields are included in the template - ignore if present
			if(["id", "label", "color", "img", "mobilenr"].includes(customField.key)) {
				continue;
			}
			if(customField.entity == "customer") {
				customerObj[customField.key] = $(this).find("input[name='" + customField.key + "']").val();	
			}
		}

		console.log(customerObj);
		customerList.push(customerObj);
	});

	return customerList;
} 



function configRemoveCustomer(element) {
	$(element).parent().parent().remove();
	return false;
}

function configAddLocation(locationObj) {
	var newEntry = locationObj == undefined || locationObj.id == undefined;
	var color = (newEntry || locationObj.color == undefined) ? getRandomeColor() : locationObj.color;
	var newEntryId = newEntry ? (9 + Math.ceil(100 * Math.random())) : locationObj.id;
	var entryName = newEntry ? "" : locationObj.label;


	var newLocationEntry = {id: newEntryId, name: entryName, locationAttributes: Array(), backgroundColor: color, colorList: colors};

	for (var customField of demoScenario.customFields) {
		if (customField.entity == "location") {
			// do not process this fields - as they are already rendered
			if(["id", "label"].includes(customField.key)) {
				continue;
			}

			newLocationEntry.locationAttributes.push({label: customField.label, key: customField.key, value: locationObj[customField.key], type: "text"});
		}
	}

	$("#configuratorLocationTbody").append(htmlTemplates.configLocationRow(newLocationEntry));
	return false;
}

function configRemoveLocation(element) {
	$(element).parent().parent().remove();
	return false;
}

function configGetLocationsFromUi() {
	var locationList = [];
	var switchToEditMode = false;

	$("#configuratorLocationTbody tr").each(function() {

		var locationObj = {};
		locationObj.id = parseInt($(this).find("input[name='id']").val());
		locationObj.label = $(this).find("input[name='name']").val();
		locationObj.color = $(this).find("select[name='color']").val();

		// check if new:
		var locationIndex = findIndexByKey(demoScenario.locationList, "id", locationObj.id);

		if(locationIndex > -1) {
			// existing
			//locationObj.newlyAdded = true;
			locationObj.size = demoScenario.locationList[locationIndex].size;
			locationObj.position = demoScenario.locationList[locationIndex].position;
		} else {
			// new location
			//locationObj.newlyAdded = false;
			locationObj.size = {};
			locationObj.size.height = 150;
			locationObj.size.width = 150;
			locationObj.position = {};
			locationObj.position.top = 50 + Math.ceil(500 * Math.random());
			locationObj.position.left = 50 + Math.ceil(800 * Math.random());
			switchToEditMode = true;
		}

		console.log(locationObj);
		locationList.push(locationObj);
	});


	if(switchToEditMode == true) {
		makeLocationsEditable();
	}
	
	return locationList;	
}












function configColorChange(element) {
	var color = $(element).val();
	$(element).parent().parent().css("background-color", color);

	return false;
}

function renderColorList(selectedColor) {
	var colorListHtml = "";
	
	if(!selectedColor) {
		selectedColor = getRandomeColor();
	}
			


	colorListHtml += "<option value='" + selectedColor + "' selected>" + selectedColor + "</option>";


	$.each(colors, function (index) {
		var color = colors[index];
		if(color != selectedColor)
		colorListHtml += "<option value='"+color+"'> "+color+"  </option>" ;
	});
	return colorListHtml;
}

function getRandomeColor() {
	return colors[Math.ceil(colors.length * Math.random())];
}

function getRandomeDarkColor() {
	return darkcolors[Math.ceil(darkcolors.length * Math.random())];
}
