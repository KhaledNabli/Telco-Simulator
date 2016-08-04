

function migrateToCurrentConfiguration(config) {
	var currentVersion = 102;

    if(config.version == 101) {
        // entferne alles was seit 101 nicht mehr gebraucht wird
        delete config.mobileApp.colorThemeBar;
        delete config.mobileApp.colorThemeBarText;
        delete config.mobileApp.colorThemeButton;
        delete config.mobileApp.colorThemePage;
        delete config.mobileApp.colorThemeText;
        delete config.mobileApp.colorThemeBorder;
        console.log("INFO: version 101 detected - deleting unessaccery properties.");

        // füge alles hinzu was seit 100 hinzu kommt
    }

    if(config.version == 102) {
        // entferne alles was seit 102 nicht mehr gebraucht wird

        // füge alles hinzu was seit 101 hinzu kommt
    }

    if (config.version < currentVersion) {
        // füge alles hinzu was seit 102 hinzugekommen ist
        console.log("INFO: older version detected - adding required properties.");
        config.mobileApp.colorNavbarBack = '#2C3E50';
        config.mobileApp.colorNavbarText = '#eeeeee';
        config.mobileApp.colorPageBack = '#eeeeee';
        config.mobileApp.colorPageText = '#2C3E50';
        config.mobileApp.colorButtonBack = '#2C3E50';
        config.mobileApp.colorButtonText = '#eeeeee';
        config.mobileApp.colorNavItemInactive = 'rgba(0, 0, 0, 0.4)';
        config.mobileApp.colorNavItemActive = '#eeeeee';

        config.version = currentVersion;
    }

    return config;
}


function getExistingDemos(userEmail, maxItems) {
	return callApi({action: 'getAllDemos',
		maxItems: maxItems,
		userEmail : userEmail
	});
}


function getConfigurationByToken(token) {
	return callApi({action: 'getConfig',
		token: token
	});
}

function copyConfigurationToNewToken(oldToken) {
	return callApi({action: 'copyConfig',
		token: oldToken
	});
}

function saveConfiguration(config) {
	return callApi({action: 'saveConfig',
		config: JSON.stringify(config)
	});
}


function callApi(parameters) {
	var apiUrl = window.location.protocol + "//" + window.location.host + "/IOTSimulator/api/";
	return $.ajax(apiUrl, {
		type: 'POST',
		data: parameters
	} );
}

function callRemoteApi(apiUrl, parameters) {
	return $.ajax(apiUrl, {
		type: 'POST',
		data: parameters
	} );
}


function findIndexByKey(list, key, value) {
	return list.findIndex(function (element) { return element[key] === value; });
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

	return $.ajax( {
		type: "POST",
		url: espUrl,
		data: eventJSON,
		contentType: "JSON"
	});
}


function sendEventToESPProxy(proxyUrl, espUrl, eventObject) {
	if(espUrl == "") {
		return;
	}

	espUrl += "?blocksize=1&quiesce=false";

	if(eventObject.opcode == undefined) {
		eventObject.opcode   = "i";
	}

	var eventBlock = [[eventObject]];
	var eventJSON  = JSON.stringify(eventBlock);

	var proxyRequestData = {espRequestUrl: espUrl, espRequestData: eventJSON};

	return $.post(proxyUrl, proxyRequestData);
}


function sendRequestToRTDM(rtdmHost, rtdmEvent, rtdmRequestInputs) {
	var rtdmRequestUrl = "http://" + rtdmHost + "/SASDecisionServices/rest/runtime/decisions/" + rtdmEvent;
	var contentType = 'application/vnd.sas.decision.request+json';
	var clientTimeZone = jstz != undefined ? jstz.determine().name() : "America/New_York";

	var rtdmRequest = {version : 1.0, clientTimeZone : clientTimeZone, inputs:rtdmRequestInputs};

	return jQuery.ajax({
		method: "POST",
		contentType: contentType,
		url: rtdmRequestUrl,
		data: JSON.stringify(rtdmRequest)
	});
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

function queryRTDMEventDefinition(rtdmEngine, eventIndex, onDoneHandler ) {
	var eventId = rtdmEngine.events[eventIndex].decisionId;
	var rtdmQueryUrl = "http://" + rtdmEngine.host + "/RTDM/rest/decisionDefinitions/" + eventId;

	return jQuery.ajax({
		method: "GET",
		url: rtdmQueryUrl,
		contentType: "application/vnd.sas.decision.definition.summary",
	}).done(function (response) {
		rtdmEngine.events[eventIndex].inputs = response.inputs ? response.inputs : {};
		rtdmEngine.events[eventIndex].outputs = response.outputs ? response.outputs : {};
		onDoneHandler(rtdmEngine,eventIndex);
	});

}

function queryRTDMEvents(rtdmEngine, onDoneHandler) {
	var rtdmQueryUrl = "http://" + rtdmEngine.host + "/RTDM/rest/decisionDefinitions";

	return jQuery.ajax({
		method: "GET",
		url: rtdmQueryUrl,
		contentType: "application/vnd.sas.decision.request+json",
		data: {limit: 1000}
	}).done(function (response) {
		rtdmEngine.events = response.items ? response.items.map(function (item) {return {decisionId: item.decisionId, decisionId: item.decisionId, version: item.version, timeoutEnabled: item.timeoutEnabled, timeout: item.timeout, lastModifiedBy: item.lastModifiedBy, created: item.created, modified: item.modified}}) : Array();
		rtdmEngine.eventCount = response.count ? response.count : 0;

		// sort events
		rtdmEngine.events.sort(function (a, b) {
			return a.decisionId.localeCompare(b.decisionId);
		});

		onDoneHandler(rtdmEngine);
	});
}


// TODO: Khaled - shame on you :)
function queryESPModel(espEngine, espVersion, onDoneHandler) {
	var espQueryUrl = "http://" + espEngine.host + ":" + espEngine.portHttpAdmin + "/model?schema=true";
	
	//** added by Mathias - new ESP 3.2 API **/
	if (espVersion == "3.2") {
		espQueryUrl = "http://" + espEngine.host + ":" + espEngine.portHttpAdmin + "/SASESP/projects?schema=true";
	}

	return jQuery.ajax({
		method: "GET",
		url: espQueryUrl
	}).done(function (response) {
		var jsonObj = jQuery.xml2json(response);

		//** added by Mathias - new ESP 3.2 API **/
		if (espVersion == "3.2") {
			espEngine.projects = jsonObj.project != undefined ? jsonObj.project : Array();
		} else {
			espEngine.projects = jsonObj.projects != undefined ? jsonObj.projects.project : Array();
		}
		espEngine.windows = Array();

		if(espEngine.projects instanceof Array) {
			for(var i = 0; i < espEngine.projects.length; i++) {
				var windows = espEngine.projects[i].contqueries.contquery.windows;

				var projectName = espEngine.projects[i].name;
				var queryName = espEngine.projects[i].contqueries.contquery.name;

				if (windows.window_source instanceof Array) {
					for(var j = 0; j < windows.window_source.length; j++) {
						var windowName = windows.window_source[j].name;
						var espUrl = projectName +"/"+ queryName +"/"+ windowName;
						var newWindow = {label: windowName, espProject: projectName, espQuery: queryName, espWindow: windowName, espUrl: espUrl, fields: windows.window_source[j].schema.fields.field};
						espEngine.windows.push(newWindow);
					}
				} else {
					var windowName = windows.window_source.name;
					var espUrl = projectName +"/"+ queryName +"/"+ windowName;
					var newWindow = {label: windowName, espProject: projectName, espQuery: queryName, espWindow: windowName, espUrl: espUrl, fields: windows.window_source.schema.fields.field};
					espEngine.windows.push(newWindow);
				}
			}
		} else {
			var windows = espEngine.projects.contqueries.contquery.windows;

			var projectName = espEngine.projects.name;
			var queryName = espEngine.projects.contqueries.contquery.name;

			if (windows.window_source instanceof Array) {
				for(var j = 0; j < windows.window_source.length; j++) {
					var windowName = windows.window_source[j].name;
					var espUrl = projectName +"/"+ queryName +"/"+ windowName;
					var newWindow = {label: windowName, espProject: projectName, espQuery: queryName, espWindow: windowName, espUrl: espUrl, fields: windows.window_source[j].schema.fields.field};
					espEngine.windows.push(newWindow);
				}
			} else {
				var windowName = windows.window_source.name;
				var espUrl = projectName +"/"+ queryName +"/"+ windowName;
				var newWindow = {label: windowName, espProject: projectName, espQuery: queryName, espWindow: windowName, espUrl: espUrl, fields: windows.window_source.schema.fields.field};
				espEngine.windows.push(newWindow);
			}

		}


		onDoneHandler(espEngine);
	});
}

function getRaceServerInfo(raceHost) {
	var raceRequestUrl = "http://" + raceHost + ":8000/race_service.php";

	return callRemoteApi (raceRequestUrl,
		{action: 'getInfo'});
}

