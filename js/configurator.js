/**
*	Init configuration ui
*
*/
function initConfigurator() {
	refreshConfigurator(demoScenario);
}


/**
*	Refresh configuration ui
*
*/
function refreshConfigurator(demoScenario) {
	$("#demoEspHostInput").val(demoScenario.espBeaconWindow);
	$("#demoRtdmHostInput").val(demoScenario.rtdmHost);
	$("#storeMapImgInput").val(demoScenario.storeMapImg);


	$.each(demoScenario.customerList, function (index) {
		configAddCustomer(demoScenario.customerList[index]);
	});


	$.each(demoScenario.beaconList, function (index) {
		configAddBeacon(demoScenario.beaconList[index]);
	});

}

/**
*	Read configuration from ui
*
*/
function updateConfiguration() {
	demoScenario.espBeaconWindow = $("#demoEspHostInput").val();
	demoScenario.rtdmHost = $("#demoRtdmHostInput").val(); 
	demoScenario.storeMapImg = $("#storeMapImgInput").val();
	demoScenario.customerList = configGetCustomersFromUi();
	demoScenario.beaconList = configGetBeaconsFromUi();
}

/**
*	Read configuration from ui
*
*/
function saveConfiguration() {
	updateConfiguration();
	refreshCustomers(demoScenario.customerList);
	refreshBeacons(demoScenario.beaconList);
	closeConfigurator();
	window.localStorage.demoScenario = JSON.stringify(demoScenario);
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
	$("#configuratorBeaconTbody tr").remove();
	demoScenario = defaultDemoScenario;
	refreshConfigurator(demoScenario);
}

function helpConfiguration() {

}



function configAddCustomer(customerObj) {
	var newEntry = customerObj == undefined || customerObj.id == undefined;
	var color = (newEntry || customerObj.color == undefined) ? getRandomeColor() : customerObj.color;
	var newEntryId = newEntry ? configGetNextCustomerId() : customerObj.id;
	htmlTag = "<tr style='background-color: " + color + "'" +">"
		+"<td><input name='id' type='number' placeholder='ID' value='"+ (newEntry ? newEntryId : customerObj.id) +"'   class='form-control input-md'/>" +  "</td>"
		+"<td><input name='label' type='text' placeholder='Label' value='"+ (newEntry ? "" : customerObj.label) +"'   class='form-control input-md'/>" +  "</td>"
		+"<td><input name='img' type='text' placeholder='Image Url' value='"+ (newEntry ? "" : customerObj.img) +"'   class='form-control input-md'/>" + "</td>"
		+"<td><input name='age' type='number' placeholder='Age' value='"+ (newEntry ? "" : customerObj.age) +"'   class='form-control input-md'/>" + "</td>"
		+"<td><input name='mobilenr' type='text' placeholder='Mobile' value='"+ (newEntry ? "" : customerObj.mobilenr) +"'   class='form-control input-md'/>" + "</td>"
		+"<td><select name='color' class='form-control' onchange=\"return configColorChange(this);\" > "+ renderColorList(color) +" </select>" + "</td>"
		+"<td class=\"text-center\"> <button type=\"button\" onclick=\"configRemoveCustomer(this);\">Delete</button> </td>"
		+"</tr>";
	$("#configuratorCustomerTbody").append(htmlTag);
	return newEntry;
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
		customerObj.label = $(this).find("input[name='label']").val();
		customerObj.img = $(this).find("input[name='img']").val();
		customerObj.age = parseInt($(this).find("input[name='age']").val());
		customerObj.mobilenr = $(this).find("input[name='mobilenr']").val();
		customerObj.color = $(this).find("select[name='color']").val();
		console.log(customerObj);
		customerList.push(customerObj);
	});

	return customerList;
} 



function configRemoveCustomer(element) {
	$(element).parent().parent().remove();
	return false;
}

function configAddBeacon(beaconObj) {
	var newEntry = beaconObj == undefined || beaconObj.id == undefined;
	var color = (newEntry || beaconObj.color == undefined) ? getRandomeColor() : beaconObj.color;
	var newEntryId = newEntry ? (9 + Math.ceil(100 * Math.random())) : beaconObj.id;

	htmlTag = "<tr style='background-color: " + color + "'" +">"
		+"<td><input name='id' type='number' placeholder='ID' value='"+ (newEntry ? newEntryId : beaconObj.id) +"'   class='form-control input-md'/>" +  "</td>"
		+"<td><input name='label' type='text' placeholder='Label' value='"+ (newEntry ? "" : beaconObj.label) +"'   class='form-control input-md'/>" +  "</td>"
		+"<td><input name='store' type='text' placeholder='Store' value='"+ (newEntry ? "" : beaconObj.store) +"'   class='form-control input-md'/>" 
		+ "<input name='existing' type='hidden' value='"+ (newEntry ? "true" : "false") +"'/>"+ "</td>"
		+"<td><select name='color' class='form-control' onchange=\"return configColorChange(this);\" > "+ renderColorList(color) +" </select>" + "</td>"
		+"<td class=\"text-center\"> <button type=\"button\" onclick=\"configRemoveCustomer(this);\">Delete</button> </td>"
		+"</tr>";
	$("#configuratorBeaconTbody").append(htmlTag);
	return false;
}

function configRemoveBeacon(element) {
	$(element).parent().parent().remove();
	return false;
}

function configGetBeaconsFromUi() {
	var beaconList = [];

	$("#configuratorBeaconTbody tr").each(function() {

		var beaconObj = {};
		beaconObj.id = parseInt($(this).find("input[name='id']").val());
		beaconObj.label = $(this).find("input[name='label']").val();
		beaconObj.store = $(this).find("input[name='store']").val();
		beaconObj.color = $(this).find("select[name='color']").val();

		// check if new:
		var beaconIndex = findObjectById(demoScenario.beaconList, beaconObj.id);

		if(beaconIndex > -1) {
			// existing
			beaconObj.existing = true;
			beaconObj.size = demoScenario.beaconList[beaconIndex].size;
			beaconObj.position = demoScenario.beaconList[beaconIndex].position;
		} else {
			// new beacon
			beaconObj.existing = false;
			beaconObj.size = {};
			beaconObj.size.height = 150;
			beaconObj.size.width = 150;
			beaconObj.position = {};
			beaconObj.position.top = 50 + Math.ceil(500 * Math.random());
			beaconObj.position.left = 50 + Math.ceil(800 * Math.random());
		}

		console.log(beaconObj);
		beaconList.push(beaconObj);
	});

	return beaconList;	
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