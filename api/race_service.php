<?php
session_set_cookie_params(3600*24*30);
session_start();


/* RACE SERVER INFORMATION */
$espVersion 	= "3.1";
$espPort 		= "8081";
$rtdmVersion 	= "6.4";
$rtdmPort 		= "80";

$jsonRaceInfo = array( 
		'espVersion'  => $espVersion,
		'espPort'     => $espPort,
		'rtdmVersion' => $rtdmVersion,
		'rtdmPort'    => $rtdmPort 
	);
/**********************************************/


return processRequest();
exit;
/**********************************************/


function getRequestParameter($parameter) {
	if($_SERVER['REQUEST_METHOD'] == "POST")
		return @$_POST[$parameter];
	else
		return @$_GET[$parameter];
}

function processRequest() {
	@header('Content-type: application/json');

	$action = getRequestParameter("action");

	if ($action == "getInfo") {		
		global $jsonRaceInfo;
		echo json_encode($jsonRaceInfo);
	}
	else {
		// display how to use service.
		$serviceEndpoints = array( 	
			array("Name" => "Get Information", 
				  "Description" => "Returns information of the race image", 
				  "Endpoint" => "/race_service.php?action=getInfo"),
			array("Name" => "Example for another service", 
				  "Description" => "this service does something....", 
				  "Endpoint" => "/race_service.php?action=...")
		);
		$serviceEndpointDesc = array("Service Endpoints" => $serviceEndpoints);

		echo json_encode($serviceEndpointDesc);	
	}

	return;
}