
var configScenario = {};
var espEngine = {host: "sasbap.demo.sas.com", portHttpAdmin: 44445, portHttpPubSub: 8081};
var rtdmEngine = {host: "sasbap.demo.sas.com"};

function startConfigurator() {
    var token = window.location.href.split("#")[1];
    loadConfiguration(token);
}

function loadConfiguration(token) {
    console.log("Loading Configuration for Token: " + token);
    getConfigurationByToken(token).done(function (config) { onLoadConfigurationDone(config);  });
}

function onLoadConfigurationDone(config) {
    if(config.version == undefined) {
        // offer migration
    }

    console.log("Loading Configuration for Token: " + config.token + " successfull.");
    if(config.message) {
        alert(config.message);
    }
    configScenario = config;

    if(config.readOnly == "1") {
        configScenario.general.demoDescription = "Copy of " + config.general.demoName;
        configScenario.general.demoName = "";
        configScenario.general.userEmail = "";
        console.log("This Demo is marked as read-only.");
    }


    updateConfiguratorUI();
}


function onLoadTokenBtn(element) {
    var token = $('#selectToken').val();
    if(token != "") {
        loadConfiguration(token);
    }
    $('#popupLoadToken').modal('hide');
}

function updateConfiguratorUI() {
    // TODO refresh UI
    updateTokenDemoLinks();
    updateConfiguratorTables();
    initConfiguratorSelections();
    Holder.run();
}

function updateConfiguratorTables() {
    displayObjectElements(configScenario.general, "#general_");
    displayObjectElements(configScenario.locationApp, "#locationApp_");
    configBuildCustomerTable();
    configBuildLocationTable();
    configBuildMobileParameterTable();
    configBuildMobileTransactionTable();
    configBuildMobileGeneratorTable();
    configBuildCustomFieldTable();
}

function updateTokenDemoLinks() {
    var token = configScenario.token;
    var baseUrl = window.location.href.toLowerCase().split("iotsimulator")[0];
    baseUrl = baseUrl + 'IOTSimulator/';

    if(token != '') {
    	var encodedToken = encodeURIComponent(token);
        $('.token-display').html("Token: " + configScenario.token);
        
        $('a.link2mobileapp').html(baseUrl + 'MobileApp/#' + encodedToken);
        $('a.link2mobileapp').attr('href', baseUrl + 'MobileApp/#' + encodedToken);

        $('a.link2locationapp').html(baseUrl + 'simulator.html/#' + encodedToken);
        $('a.link2locationapp').attr('href', baseUrl + 'simulator.html#' + encodedToken);

        $('a.link2streamviewer').html(baseUrl + 'Streamviewer/#' + encodedToken);
        $('a.link2streamviewer').attr('href', baseUrl + 'Streamviewer/#' + encodedToken);

        $('div.qr2mobileapp > canvas').remove();
        $('div.qr2mobileapp').qrcode({text: baseUrl + 'MobileApp/#' + encodedToken, size: 150})
        $('div.qr2mobileapp').show();
    }
    else {
        $('.token-display').html("Please save your demo!");

        $('a.link2mobileapp').html("Please save your configuration to get the link to Mobile App");
        $('a.link2mobileapp').attr('href', "#");

        $('a.link2locationapp').html("Please save your configuration to get the link to Mobile App");
        $('a.link2locationapp').attr('href', "#");

        $('a.link2streamviewer').html("Please save your configuration to get the link to Mobile App");
        $('a.link2streamviewer').attr('href', "#");

        $('div.qr2mobileapp').hide();
    }

    // set navigation items to point to #token in url
    $("a[onclick]").attr("href", "#" + configScenario.token);
    // set url hash to token
    location.hash = configScenario.token;
}







function readConfigurationFromUI() {

    /*** for-loop to get all fromFields from configurator.html ***/
    readObjectElements(configScenario.general, "#general_");
    readObjectElements(configScenario.mobileApp, "#mobileApp_");
    readObjectElements(configScenario.locationApp, "#locationApp_");
    configScenario.customerList = configGetCustomersFromUi();
    configScenario.locationList = configGetLocationsFromUi();
    configScenario.mobileApp.eventParameters = configGetMobileParametersFromUI();
    configScenario.mobileApp.eventTypes = configGetMobileTransactionsFromUI();
    configScenario.mobileApp.eventGenerators = configGetMobileGeneratorsFromUI();
    configScenario.customFields = configGetCustomFieldsFromUI();
}

function onCopyConfiguration() {

    if(configScenario.token != "") {
        copyConfigurationToNewToken(configScenario.token).done(function (newToken) { loadConfiguration(newToken) });
    } else {
        alert("Here is nothing to copy.");
    }

}





function onSaveConfigurationBtn() {

    readConfigurationFromUI();
    
    // add validity checks: required fields:
    if(configScenario.general.demoName.length < 5) {
        alert("Please enter a name for your demo. The current name is too short.");
        return;
    }
    if(configScenario.general.demoDescription.length < 5) {
        alert("Please enter a description for your demo. The current description is too short.");
        return;
    }
    if(configScenario.general.userEmail.length < 5) {
        alert("Please enter your email adress. The current adress is too short.");
        return;
    }
    

    saveConfiguration(configScenario).done(function (config) { onLoadConfigurationDone(config); });

    return;
}


function exportConfiguration() {
	// TODO CHECK THIS
    return JSON.stringify(configScenario);
}


function dropTableRecord(object) {
    var tr = $(object).closest('tr');
    tr.remove();
}



function onUploadImageIconClick(iconElem) {
    if(configScenario.token == "" || configScenario.readOnly == "1") {
        alert("You cannot change this demo. Please save your configuration to obtain a new token.");
        return;
    }

    var elem = $(iconElem).parent().parent().find("input")[0];
    console.log(elem);

    // if element do not have an id assigned - then assign temporary id
    if(!elem.id || elem.id == "") {
        elem.id = "tempImageUploadId" + Math.ceil(Math.random()*1000000);
    }
    var fieldId = elem.id;
    var fieldSelector = "#" + fieldId;

    console.log("Fieldselector to update later: " + fieldSelector);

    // the selector is stored in a hidden field to be used when we upload the picture
    $("#formUploadImage > div > input[name='uploadTriggeredBy']").val(fieldSelector);
    $("#formUploadImage > div > input[name='imageDesc']").val("T:" + configScenario.token + " : F:" + fieldSelector);
    // show the modal window
    $('#popupUploadImage').modal('show');
}


function onPreviewImageIconClick(iconElem) {
    var elem = $(iconElem).parent().parent().find("input");
    $('#imgPreviewImage').attr('src', elem.val());
    $('#modalTitlePreviewImage').text("Image Preview");
    $('#popupPreviewImage').modal('show');
}



function onClickUploadImageField(event) {
    if(configScenario.token == "" || configScenario.readOnly == "1") {
        alert("You cannot change this demo. Please save your configuration to obtain a new token.");
        return;
    }
    // we apply a trick here:
    // we register all elements with the class = "upload-image" to call this function on click
    // find the element id who was clicked and store the id and css-selector
    var elem = event.currentTarget;
    // if element do not have an id assigned - then assign temporary id
    if(!elem.id || elem.id == "") {
        elem.id = "tempImageUploadId" + Math.ceil(Math.random()*1000000);
    }
    var fieldId = elem.id;
    var fieldSelector = "#" + fieldId;

    console.log("Fieldselector to update later: " + fieldSelector);

    // the selector is stored in a hidden field to be used when we upload the picture
    $("#formUploadImage > div > input[name='uploadTriggeredBy']").val(fieldSelector);
    $("#formUploadImage > div > input[name='imageDesc']").val("T:" + configScenario.token + " : F:" + fieldSelector);
    // show the modal window
    $('#popupUploadImage').modal('show');
}



function onUploadImageSubmit(elem,event) {
    // upload picture with ajax method

    var formData = new FormData($(elem)[0]);

    $.ajax({
        url: "./images/",
        type: "POST",
        data: formData,
        async: false,
        cache: false,
        contentType: false,
        processData: false,
        success: function (result) {
            if(result.status == "success") {
                // when the picture is uploaded, we need to store the url in the field which initiated the upload
                // the field is identified by the selector which is stored in the hidden field (name = uploadTriggeredBy)
                var fieldToUpdate = $("#formUploadImage > div > input[name='uploadTriggeredBy']").val();
                // update the value of the field with the new url
                console.log("Field to update: " + fieldToUpdate);
                $(fieldToUpdate).val(result.imageUrl);
                // hide modal window
                $('#popupUploadImage').modal('hide');
            } else {
                alert(result.message);
            }
        }
    });

    event.preventDefault();
}


function onClickPreviewImage(event) {
    // get element of clicked target
    var elem = event.currentTarget;
    var fieldId = elem.id;
    var fieldSelector = "#" + fieldId;

    // retrieve value of attribute FOR
    var forValue = $(fieldSelector).attr('for');
    // retrieve the label text
    var fieldTitle = $(fieldSelector).text();

    $('#imgPreviewImage').attr('src', $('#' + forValue).val());
    //console.log(" input image field value: " + $('#' + forValue).val());

    $('#modalTitlePreviewImage').text(fieldTitle);

    $('#popupPreviewImage').modal('show');
}




function onLoadExistingDemoBtn() {
    var existingDemosList = [];
    return getExistingDemos().done(function (existingDemos) {
        existingDemosList = existingDemos.map(function (item) {
            var id = item.token;
            var text =  item.config_name + " (Token: "+ item.token + " )";
            return {id: id, text: text};
        });

        $("#selectToken").select2({
            data: existingDemosList
        });

        $('#popupLoadToken').modal('show');
    });
}


/**
*   Display elements of object in DOM.
*   Properties: Object or Array
*   selectorPrefix: Prefix for CSS selector.
*/
function displayObjectElements(properties, selectorPrefix) {
    for (var property in properties) {
        $(selectorPrefix + property).val(properties[property]);
    }
}

/**
*   Read elements from DOM and save in Object.
*   Properties: Object or Array
*   selectorPrefix: Prefix for CSS selector.
*/
function readObjectElements(properties, selectorPrefix) {
    for (var property in properties) {
        // if element doesnt exist, do not override value.
        var selectedElements = $(selectorPrefix + property);

        if( selectedElements.length == 1) {
            properties[property] = selectedElements.val();

        } else if ( selectedElements.length > 1 ) {
            console.log("Warning: readObjectElements is pointing to an selector: " + selectorPrefix + property + ", which is not unique. Counting: " + selectedElements.length);

        } else {
            console.log("Note: readObjectElements is pointing to an selector: " + selectorPrefix + property + ", which does not exist.");
        }
    }
}






function configBuildCustomerTable() {
    var tableCols = Array();

    for (var customField of configScenario.customFields) {
        if(["id", "label", "color", "img", "mobilenr"].includes(customField.key)) {
            continue;
        }

        if(customField.entity == "customer") {
            tableCols.push({label: customField.label});
        }
    }

    $("#configuratorCustomerTable").html(htmlTemplates.configCustomerTab({tableColumns: tableCols}));

    // display all customers
    $.each(configScenario.customerList, function (index) {
        configAddCustomer(configScenario.customerList[index]);
    });
}

function configBuildLocationTable() {
    var tableCols = Array();

    for (var customField of configScenario.customFields) {
        if(["id", "label", "color"].includes(customField.key)) {
            continue;
        }

        if(customField.entity == "location") {
            tableCols.push({label: customField.label});
        }
    }

    $("#configuratorLocationTable").html(htmlTemplates.configLocationTab({tableColumns: tableCols}));

    $.each(configScenario.locationList, function (index) {
        configAddLocation(configScenario.locationList[index]);
    });
}

function configAddCustomer(customerObj) {
    var newEntry = customerObj == undefined || customerObj.id == undefined;
    var color = (newEntry || customerObj.color == undefined) ? getRandomeColor() : customerObj.color;
    var newEntryId = newEntry ? configGetNextCustomerId() : customerObj.id;

    var newCustomerEntry = {id: newEntryId, name: customerObj.label, image: customerObj.img, mobilenr: customerObj.mobilenr, backgroundColor: color, colorList: colors, customerAttributes: Array()};
    // populate customerAttributes array with customeFields
    for (var customField of configScenario.customFields) {




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
    Holder.run();
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
        for (var customField of configScenario.customFields) {
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



function configRemoveCustomer(elem) {
    return configRemoveParent(elem, 'tr');
}



function configAddLocation(locationObj) {
    var newEntry = locationObj == undefined || locationObj.id == undefined;
    var color = (newEntry || locationObj.color == undefined) ? getRandomeColor() : locationObj.color;
    var newEntryId = newEntry ? (9 + Math.ceil(100 * Math.random())) : locationObj.id;
    var entryName = newEntry ? "" : locationObj.label;


    var newLocationEntry = {id: newEntryId, name: entryName, locationAttributes: Array(), backgroundColor: color, colorList: colors};

    for (var customField of configScenario.customFields) {
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


function configRemoveLocation(elem) {
    return configRemoveParent(elem, 'tr');
}


function configGetLocationsFromUi() {
    var locationList = [];

    $("#configuratorLocationTbody tr").each(function() {

        var locationObj = {};
        locationObj.id = parseInt($(this).find("input[name='id']").val());
        locationObj.label = $(this).find("input[name='name']").val();
        locationObj.color = $(this).find("select[name='color']").val();

        // check if new:
        var locationIndex = findIndexByKey(configScenario.locationList, "id", locationObj.id);

        if(locationIndex > -1) {
            // existing
            //locationObj.newlyAdded = true;
            locationObj.size = configScenario.locationList[locationIndex].size;
            locationObj.position = configScenario.locationList[locationIndex].position;
        } else {
            // new location
            //locationObj.newlyAdded = false;
            locationObj.size = {};
            locationObj.size.height = 150;
            locationObj.size.width = 150;
            locationObj.position = {};
            locationObj.position.top = 50 + Math.ceil(500 * Math.random());
            locationObj.position.left = 50 + Math.ceil(800 * Math.random());
        }

        console.log(locationObj);
        locationList.push(locationObj);
    });
    
    return locationList;    
}


function configBuildMobileTransactionTable() {
    $("#configuratorMobileTrxTbody > tr").remove();

    configScenario.mobileApp.eventTypes.map(function (eventType) {
        configAddMobileTransaction(eventType);
    });

}

function configAddMobileTransaction(transaction) {
    $("#configuratorMobileTrxTbody").append(htmlTemplates.configMobileTransactionRow(transaction));
}

function configGetMobileTransactionsFromUI() {
    var mobileTransactions = Array();
    $("#configuratorMobileTrxTbody > tr").each(function () {
        var transactionObj = {};
        transactionObj.key = $(this).find("input[name='key']").val();
        transactionObj.label = $(this).find("input[name='label']").val();

        mobileTransactions.push(transactionObj);
    });

    return mobileTransactions;
}

function configRemoveMobileTransaction(elem) {
    return configRemoveParent(elem, 'tr');
}



function configBuildMobileParameterTable() {
    $("#configuratorMobileParametersTbody > tr").remove();

    configScenario.mobileApp.eventParameters.map(function (parameter) {
        configAddMobileParameter({key: parameter.key, label: parameter.label, type: parameter.dataType});
    });
}

function configAddMobileParameter(parameter) {
    parameter.dataTypes = Array();
    parameter.dataTypes.push({value: "", label: "", selected: parameter.type == "" ? "selected" : ""});
    parameter.dataTypes.push({value: "text", label: "Text", selected: parameter.type == "text" ? "selected" : ""});
    parameter.dataTypes.push({value: "numeric", label: "Numeric", selected: parameter.type == "numeric" ? "selected" : ""});
    parameter.dataTypes.push({value: "date", label: "Date", selected: parameter.type == "date" ? "selected" : ""});

    parameter.parameterInput = Array();
    parameter.parameterInput.push({key: parameter.key, isSelected: "selected"});
    
    if(espEngine.windows != undefined) {
        var espWindowIndex = findIndexByKey(espEngine.windows, "espUrl", $("#mobileApp_espWindow").val());    
        if(espWindowIndex >= 0) {
            for(inputField of espEngine.windows[espWindowIndex].fields) {
                parameter.parameterInput.push({key: inputField.name, isSelected: ""});
            } 
        }
    }
    
    $("#configuratorMobileParametersTbody").append(htmlTemplates.configMobileParameterRow(parameter));

}

function configGetMobileParametersFromUI() {
    var mobileParameters = Array();
    $("#configuratorMobileParametersTbody > tr").each(function () {
        var parameterObj = {};
        parameterObj.key = $(this).find("select[name='key']").val();
        parameterObj.label = $(this).find("input[name='label']").val();
        parameterObj.dataType = $(this).find("select[name='dataType']").val();

        mobileParameters.push(parameterObj);
    });

    return mobileParameters;
}

function configRemoveMobileParameter(elem) {
    return configRemoveParent(elem, 'tr');
}



function configBuildMobileGeneratorTable() {
    $("#configuratorMobileGeneratorsTbody > tr").remove();

    configScenario.mobileApp.eventGenerators.map(function (generator) {
        configAddMobileGenerator(generator);        
    })
}

function configAddMobileGenerator(generator) {
    generator.transactionType = Array();
    generator.transactionType.push({label: "", value: "", isSelected: ""});

    for(eventType of configScenario.mobileApp.eventTypes) {
        generator.transactionType.push({label: eventType.label, value: eventType.key, isSelected: eventType.key == generator.event ? "selected" : ""}); 
    }
    $("#configuratorMobileGeneratorsTbody").append(htmlTemplates.configMobileGeneratorRow(generator));
}

function configGetMobileGeneratorsFromUI() {
    var mobileGenerators = Array();
    $("#configuratorMobileGeneratorsTbody > tr").each(function () {
        var generatorObj = {};
        generatorObj.event = $(this).find("select[name='transaction']").val();
        generatorObj.label = $(this).find("input[name='label']").val();
        generatorObj.intervalFrom = $(this).find("input[name='interval_from']").val();
        generatorObj.intervalTo = $(this).find("input[name='interval_to']").val();
        generatorObj.valueFrom = $(this).find("input[name='value_from']").val();
        generatorObj.valueTo = $(this).find("input[name='value_to']").val();

        mobileGenerators.push(generatorObj);
    });

    return mobileGenerators;   
}

function configRemoveMobileGenerator(elem) {
    return configRemoveParent(elem, 'tr');
}



function configBuildCustomFieldTable() {
    $("#configuratorCustomFieldTbody > tr").remove();

    configScenario.customFields.map(function (customField) {
        configAddCustomField(customField);        
    })
}

function configAddCustomField(customField) {
    customField.entityTypes = Array();
    customField.entityTypes.push({value: "", label: "", isSelected: customField.entity == "" ? "selected" : ""});
    customField.entityTypes.push({value: "customer", label: "Customer", isSelected: customField.entity == "customer" ? "selected" : ""});
    customField.entityTypes.push({value: "location", label: "Location", isSelected: customField.entity == "location" ? "selected" : ""});

    customField.rtdmKeys = Array();
    customField.rtdmKeys.push({key: customField.rtdmKey, isSelected: "selected"});

    if(rtdmEngine.events != undefined) {
        var rtdmEventIndex = findIndexByKey(rtdmEngine.events, "decisionId", $("#locationApp_rtdmEvent").val());
        if(rtdmEventIndex >= 0) {
            for(field in rtdmEngine.events[rtdmEventIndex].outputs) {
                    customField.rtdmKeys.push({key: field, isSelected: ""});
                }   
        }
    }


    customField.espKeys = Array();
    customField.espKeys.push({key: customField.espKey, isSelected: "selected"});
    if(espEngine.windows != undefined) {
        var espWindowIndex = findIndexByKey(espEngine.windows, "espUrl", $("#locationApp_espWindow").val());    
        if(espWindowIndex >= 0) {
            for(inputField of espEngine.windows[espWindowIndex].fields) {
                customField.espKeys.push({key: inputField.name, isSelected: ""});
            } 
        }
    }

    $("#configuratorCustomFieldTbody").append(htmlTemplates.configCustomFieldRow(customField));

}

function configGetCustomFieldsFromUI() {
    var customFields = Array();

    $("#configuratorCustomFieldTbody > tr").each(function () {
        var customFieldObj = {};
        customFieldObj.entity = $(this).find("select[name='entity']").val();
        customFieldObj.key = $(this).find("input[name='key']").val();
        customFieldObj.label = $(this).find("input[name='label']").val();
        customFieldObj.rtdmKey = $(this).find("select[name='rtdmKey']").val();
        customFieldObj.espKey = $(this).find("select[name='espKey']").val();
        customFieldObj.style = $(this).find("input[name='style']").val();

        customFields.push(customFieldObj);
    });

    return customFields;
}

function configRemoveCustomField(elem) {
    return configRemoveParent(elem, 'tr');
}


function configRemoveParent(elem, parentType) {
    $(elem).parents(parentType).remove();
    return false;
}



function configColorChange(element) {
    var color = $(element).val();
    $(element).parents("tr").css("background-color", color);

    return false;
}


function getRandomeColor() {
    return colors[Math.ceil(colors.length * Math.random())];
}

function getRandomeDarkColor() {
    return darkcolors[Math.ceil(darkcolors.length * Math.random())];
}

function initSelectionListOptions(selectionElements) {
    selectionElements.map(function (item) {
        $("select#" + item.id).html(htmlTemplates.configSelectOptions({optionList: [{value: item.value, label: item.label, markSelected: "selected"}]}));
    });
}

function initConfiguratorSelections() {
    var selectionElements = Array();
    var locationAppEspWindow = configScenario.locationApp.espWindow;
    selectionElements.push({id: "locationApp_espWindow", label: (locationAppEspWindow.split("/").length == 3 ? locationAppEspWindow.split("/")[2] : locationAppEspWindow), value: locationAppEspWindow});
    var mobileAppEspWindow = configScenario.mobileApp.espWindow;
    selectionElements.push({id: "mobileApp_espWindow", label: (mobileAppEspWindow.split("/").length == 3 ? mobileAppEspWindow.split("/")[2] : mobileAppEspWindow), value: mobileAppEspWindow});

    var locationAppRtdmEvent = configScenario.locationApp.rtdmEvent;
    selectionElements.push({id: "locationApp_rtdmEvent", label: locationAppRtdmEvent, value: locationAppRtdmEvent});


    initSelectionListOptions(selectionElements);
}

function updateESPWindowSelections() {
    $("select.selection-esp-windows").each(function (i,e) {
        var element = $(e);
        // store current value.
        var currentValue = element.val();
        var newOptions = Array();
        for(sourceWindow of espEngine.windows) {
            var markSelected = (sourceWindow.espUrl == currentValue ? "selected" : "");
            newOptions.push({value: sourceWindow.espUrl, label: sourceWindow.label, markSelected: markSelected});
        }
        element.html(htmlTemplates.configSelectOptions({optionList: newOptions}));
    });

    $("select.selection-esp-windows").prop("disabled", false);

    updateESPTrxInputSelections();
    updateESPKeySelections();
}

function onUpdateESPWindowSelections(elem) {
    espEngine.host = $("#general_espHost").val();
    espEngine.portHttpAdmin = $("#general_espAdminPort").val();
    espEngine.portHttpPubSub = $("#general_espPubSubPort").val();

    $("select.selection-esp-windows").prop("disabled", true);
    queryESPModel(espEngine, updateESPWindowSelections);
}



function updateRTDMEventSelections() {
    $("select.selection-rtdm-events").each(function (i,e) {
        var element = $(e);
        // store current value.
        var currentValue = element.val();
        var newOptions = Array();
        for(event of rtdmEngine.events) {
            var markSelected = (event.decisionId == currentValue ? "selected" : "");
            newOptions.push({value: event.decisionId, label: event.decisionId, markSelected: markSelected});
        }
        element.html(htmlTemplates.configSelectOptions({optionList: newOptions}));
    });

    $("select.selection-rtdm-events").prop("disabled", false);
    updateRTDMKeySelections();
}


function updateESPTrxInputSelections() {
    var espWindowIndex = findIndexByKey(espEngine.windows, "espUrl", $("#mobileApp_espWindow").val());
    
    if(espWindowIndex < 0) {
        return;
    }


    $("select.selection-esp-transaction-input").each(function (i,e) {
        var element = $(e);
        // store current value.
        var currentValue = element.val();
        var newOptions = Array();
        for(field of espEngine.windows[espWindowIndex].fields) {
            var markSelected = (field.name == currentValue ? "selected" : "");
            newOptions.push({value: field.name, label: field.name, markSelected: markSelected});
        }
        element.html(htmlTemplates.configSelectOptions({optionList: newOptions}));
    });

}

function updateESPKeySelections() {
    var espWindowIndex = findIndexByKey(espEngine.windows, "espUrl", $("#locationApp_espWindow").val());
    
    if(espWindowIndex < 0) {
        return;
    }

    $("select.selection-esp-key-input").each(function (i,e) {
        var element = $(e);
        // store current value.
        var currentValue = element.val();
        var newOptions = Array();
        newOptions.push({value: "", label: "", markSelected: currentValue == "" ? "selected" : "" });
        for(field of espEngine.windows[espWindowIndex].fields) {
            var markSelected = (field.name == currentValue ? "selected" : "");
            newOptions.push({value: field.name, label: field.name, markSelected: markSelected});
        }
        element.html(htmlTemplates.configSelectOptions({optionList: newOptions}));
    });
}


function updateRTDMKeySelections() {
    var rtdmEventIndex = findIndexByKey(rtdmEngine.events, "decisionId", $("#locationApp_rtdmEvent").val());

    if(rtdmEventIndex < 0) {
        return;
    }
    
    queryRTDMEventDefinition(rtdmEngine, rtdmEventIndex, function () {
        $("select.selection-rtdm-key-input").each(function (i,e) {
            var element = $(e);
            // store current value.
            var currentValue = element.val();
            var newOptions = Array();
            newOptions.push({value: "", label: "", markSelected: currentValue == "" ? "selected" : "" });
            for(field in rtdmEngine.events[rtdmEventIndex].outputs) {
                var markSelected = (field == currentValue ? "selected" : "");
                newOptions.push({value: field, label: field, markSelected: markSelected});
            }
            element.html(htmlTemplates.configSelectOptions({optionList: newOptions}));
        });
    });
}

function onUpdateRTDMEventSelections(event, elem) {
    rtdmEngine.host = $("#general_rtdmHost").val();
    $("select.selection-rtdm-events").prop("disabled", true);
    queryRTDMEvents(rtdmEngine, updateRTDMEventSelections);
}


function onValidateESPConnection(elem) {
    espEngine.host = $("#general_espHost").val();
    espEngine.portHttpAdmin = $("#general_espAdminPort").val();
    espEngine.portHttpPubSub = $("#general_espPubSubPort").val();

    var jqElem = $(elem);
    jqElem.removeClass("btn-info");
    jqElem.removeClass("btn-success");
    jqElem.removeClass("btn-danger");

    $("select.selection-esp-windows").prop("disabled", true);
    queryESPModel(espEngine, updateESPWindowSelections).success(function (elem) {
        jqElem.addClass("btn-success");
    }).error(function (elem) {
        jqElem.addClass("btn-danger");
    });
}

function onValidateRTDMConnection(elem) {
    rtdmEngine.host = $("#general_rtdmHost").val();

    var jqElem = $(elem);
    jqElem.removeClass("btn-info");
    jqElem.removeClass("btn-success");
    jqElem.removeClass("btn-danger");

    $("select.selection-rtdm-events").prop("disabled", true);
    queryRTDMEvents(rtdmEngine, updateRTDMEventSelections).success(function (elem) {
        jqElem.addClass("btn-success");
    }).error(function (elem) {
        jqElem.addClass("btn-danger");
    });
}


function onResetConfigurationBtn(elem) {
    loadConfiguration("");
}

function refreshStreamviewerUrl(oldUrl, currentEspHost, currentEspPort) {
    var oldServer = oldUrl.substring((oldUrl.indexOf('server=http://') + 'server=http://'.length), oldUrl.indexOf('&') < 0 ? oldUrl.length : oldUrl.indexOf('&'));
    var newServer = currentEspHost + ":" + currentEspPort;
    var newStreamviewerUrl = oldUrl.replace(oldServer, newServer);

    return newStreamviewerUrl;
}