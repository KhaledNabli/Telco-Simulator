var configScenario = {	
	"customFields": [
		{
			"entity": "customer",
			"key": "age",
			"label": "Age",
			"rtdmKey": "",
			"espKey": "memberAge",
			"style": "" 
		},
		{
			"entity": "customer",
			"key": "device",
			"label": "Device",
			"rtdmKey": "",
			"espKey": "",
			"style": ""
		},
		{
			"entity": "customer",
			"key": "avgSmsUsg",
			"label": "Avg SMS Usage",
			"rtdmKey": "",
			"espKey": "",
			"style": ""
		},
		{
			"entity": "customer",
			"key": "avgTopUp",
			"label": "Avg Top Up",
			"rtdmKey": "",
			"espKey": "",
			"style": ""
		},
		{
			"entity": "customer",
			"key": "avgDataUsg",
			"label": "Data Usage",
			"rtdmKey": "",
			"espKey": "avgData",
			"style": ""
		},
		{
			"entity": "customer",
			"key": "avgNatMin",
			"label": "Avg National Minutes",
			"rtdmKey": "",
			"espKey": "",
			"style": ""
		},
		{
			"entity": "customer",
			"key": "roamingFlg",
			"label": "Roaming Flag",
			"rtdmKey": "",
			"espKey": "",
			"style": ""
		},
		{
			"entity": "customer",
			"key": "lastUpdate",
			"label": "Last Update",
			"rtdmKey": "currentTime",
			"espKey": "",
			"style": ""
		},
		{
			"entity": "customer",
			"key": "dataPackage",
			"label": "Data Package",
			"rtdmKey": "",
			"espKey": "dataPackage",
			"style": ""
		},
		{
			"entity": "customer",
			"key": "dataUsed",
			"label": "Data Used",
			"rtdmKey": "",
			"espKey": "dataUsed",
			"style": ""
		}
	],
	"espHost" : "racesx11058.demo.sas.com",
	"espAdminPort": "8081",
	"espProject": "TelcoGeoDetection",
	"espQuery":"TelcoGeoQuery",
	"espWindow": "GeoEvents",
	"rtdmHost":"racesx11058.demo.sas.com",
	"rtdmEvent":"IOT_Telco_Get_Customer_Profile",
	"storeMapImg": "img/geomap.jpg",
	"interestCalculation" : "mean_value",
	"storeMapOrigWidth": 0,
	"storeMapScale": 1,
	"customerList": [
		{"id":1, "label": "Khaled", "age": 29, "color": "aquamarine", "dataPackage":"1000","dataUsed":"555","device": "Data Capable", "avgTopUp": "35", "avgSmsUsg": "110", "avgDataUsg" : "1024", "avgNatMin":"130", "avgIntMin" : "30", "roamingFlg" : "no", "img": "img/nabli.jpg", "mobilenr": "41795095890" }, 
		{"id":2, "label": "Mathias", "age": 31, "color": "aliceblue", 	"device": "Non-Data", "avgTopUp": "15", "avgSmsUsg": "40", "avgDataUsg" : "0", "avgNatMin":"689", "avgIntMin" : "1200", "roamingFlg" : "no", "img": "img/bouten.jpg", "mobilenr": "41795095890"}, 
		{"id":3, "label": "Nico", "age": 37, "color": "blanchedalmond", "device": "Non-Data", "avgTopUp": "10", "avgSmsUsg": "0", "avgDataUsg" : "0", "avgNatMin":"0", "avgIntMin" : "0", "roamingFlg" : "yes", "img": "img/payares.jpg", "mobilenr": "41795095890"}
	],
	"locationList": [
		{"id":1,"label":"Airport","color":"red","size":{"height":175,"width":197},"position":{"top":841,"left":698}},
		{"id":2,"label":"Shopping Centers","color":"darkgreen","size":{"height":94,"width":128},"position":{"top":587,"left":1007}},
		{"id":3,"label":"Business Destricts","color":"blue","size":{"height":160,"width":180},"position":{"top":488,"left":768}},
		{"id":4,"label":"City Center","color":"maroon","size":{"height":123,"width":80},"position":{"top":86,"left":541}},
		{"id":5,"label":"Bayshore","color":"orange","size":{"height":54,"width":143},"position":{"top":861,"left":465}},
		{"id":6,"label":"SM Mall of Asia","color":"darkorange","size":{"height":116,"width":69},"position":{"top":694,"left":488}},
		{"id":7,"label":"Ocen Park","color":"darkblue","size":{"height":86,"width":110},"position":{"top":326,"left":400}},
		{"id":8,"label":"Golf Club","color":"brown","size":{"height":86,"width":138},"position":{"top":230,"left":995}},
		{"id":107,"label":"Smart Araneta Coliseum","color":"fuchsia","size":{"height":71,"width":255},"position":{"top":16,"left":1021}}
	],
	"mobileApp": {
		"espWindow":         "NetworkEvents",
        "colorTheme":        "#428BCA",
        "colorThemeBar":     "#5A5A5A",
        "colorThemeBarText": "#FFFFFF",
        "colorThemeButton":  "#034A75",
        "colorThemePage":    "#FFFFFF",
        "colorThemeText":    "#034A75",
        "colorThemeBorder":  "#7C7C7C",
        "homescreen_image":  "./images/home.jpg",
		"eventParameters": [
			{"key": "customerId", "label": "Customer ID", "dataType":"string"},
			{"key": "value", "label": "Event Value", "dataType":"number"}
		],
		"eventTypes": [
			{"key": "topup_event", "label": "Top-Up"}, 
			{"key": "sms_usage", "label": "SMS Usage"}, 
			{"key": "call_usage", "label": "Minutes Usage"}, 
			{"key": "data_usage", "label": "Data Usage"}, 
			{"key": "balance_check", "label": "Balance Check"}
		],
		"eventGenerators": [
			{"key": "topup_event", "label": "Generate Top Ups", 
			 "intervalFrom": 200, "intervalTo": 1000, "valueFrom": 10, "valueTo": 50},
			 {"key": "data_usage", "label": "Generate Data", 
			 "intervalFrom": 200, "intervalTo": 2000, "valueFrom": 30, "valueTo": 70}
		]
	}
};