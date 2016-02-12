<?php
session_set_cookie_params(3600*24*30);
session_start();



@$http_proxy = "srv01gr.unx.sas.com:80";
@$demoConfigFile = "config.json";
@$demoConfig = array();
@$enable_logging = true;
@$logging_db = array(
	"host" => "localhost:3306", 
	"user" => "iot_demo",
	"pass" => "CXfmZqwVzDpfzTKJ");



$mysql_link = new mysqli($logging_db['host'], $logging_db['user'], $logging_db['pass'], $logging_db['user']);

if ($mysql_link->connect_errno) {
    // Let's try this:
    echo "Sorry, this website is experiencing problems.";

    echo "Error: Failed to make a MySQL connection, here is why: \n";
    echo "Errno: " . $mysql_link->connect_errno . "\n";
    echo "Error: " . $mysql_link->connect_error . "\n";
    
    exit;
}

$mysql_link->query("set names 'utf8';");





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
	$token = getRequestParameter("token");

	if ($action == 'getAllDemos') {
		$maxItems = getRequestParameter("maxItems");
		$userEmail = getRequestParameter("userEmail");
		logUsage($action, "", $maxItems, $userEmail);
		echo json_encode(getAllConfigsFromDatabase($userEmail, $maxItems));
	}

	else if ($action == 'getStandardDemos') {
		logUsage($action, "", "", "");
		echo json_encode(getDefaultConfigsFromDatabase());
	}

	else if($action == 'saveConfig') {
		$config = getRequestParameter("config");
		$savedConfig = saveConfig(json_decode($config));
		logUsage($action, "", $savedConfig->token, $config);
		echo json_encode($savedConfig);
	}

	else if($action == 'copyConfig') {
		// copy token config to a new token
		// copy website...
		$newToken = copyConfig($token);
		logUsage($action, "", $newToken, "");
		echo json_encode($newToken);
	}

	else if($action == 'getConfig') {
		logUsage($action, "", $token, "");
		echo json_encode(getConfig($token));
	} 
	else {
		// display how to use service.
		$endpointVariables = array("Name" => "token", "Type" => "String", "Mandatory" => false);
		$serviceEndpoints = array( 	
			array("Name" => "Reset Demo", "Description" => "....", "Endpoint" => "/api?action=resetDemo&token=...", "Variables" => $endpointVariables),
			array("Name" => "Get Configuration", "Description" => "....", "Endpoint" => "/api?action=getConfig[&token=...]"),
			array("Name" => "Save Configuration", "Description" => "....", "Endpoint" => "/api?action=saveConfig&config=..."),
			array("Name" => "Get Offers", "Description" => "....", "Endpoint" => "/api?action=getOffers&customer=...&maxOffer=...&token=..."),
			array("Name" => "Respond to Offer", "Description" => "....", "Endpoint" => "/api?action=respondToOffer&offer=...&customer=...&token=..."),
			array("Name" => "Get History", "Description" => "....", "Endpoint" => "/api?action=getHistory&customer=...&token=...")
		);
		$serviceEndpointDesc = array("Service Endpoints" => $serviceEndpoints);

		echo json_encode($serviceEndpointDesc);	
	}

	// log usage



	return;
}








/**
*
*/
function getConfig($token) {
	global $demoConfigFile;
	$config = null;

	if(!empty($token)) {
		$config = getConfigFromDatabase($token);
	}

	if(empty($config) || $config == null){
		// load from default config.json
		$config = json_decode(file_get_contents($demoConfigFile));

		if(!empty($token)) {
			$config->token = "";
			$config->message = "Token is invalid. You got the default configuration.";
		}
	}
 
	return $config;
}


/**
*
*/
function getConfigFromDatabase($token) {
	global $mysql_link;
	$config = null;

	$configQuerySql = "SELECT * FROM `demo_config` WHERE `token` = '".$token."'";
	$configQueryResult = $mysql_link->query($configQuerySql);



	if(!$configQueryResult || @$configQueryResult->num_rows != 1) {
		return null;
	}
	else {
		$configItem = $configQueryResult->fetch_assoc();;
		$config = json_decode($configItem["config_json"]);
		$config->readOnly = $configItem["read_only"];
	}


	return $config;
}


/**
*
*/
function saveConfig($config) {

	if($config == null || empty($config)) return array("error" => "no configuration to save");
	global $mysql_link;

	$token = $config->token;
	$tokenValid = false; // true when token is valid
	$copyConfig = false; // true when config is marked as readOnly

	$userEmail = 	$config->general->userEmail;
	$configName = 	$config->general->demoName;
	$configDesc = 	$config->general->demoDescription;
	$userIP = gethostbyaddr($_SERVER['REMOTE_ADDR']);
	$config->message = "";

	if(!empty($token)) {
		// check if token is valid.
		$configFromDB = getConfigFromDatabase($token);
		if($configFromDB != null) $tokenValid = true;

		$copyConfig = @$configFromDB->readOnly != null;

		if($tokenValid && !$copyConfig) {
			// update existing configuration
			$configString = $mysql_link->real_escape_string(json_encode($config));
			$updateConfigSql = "UPDATE `iot_demo`.`demo_config` SET  `config_name` = '".$configName."',  `config_desc` = '".$configDesc."', `config_json` = '".$configString."', `email_to` = '".$userEmail."', `modify_by` = '".$userIP."', `modify_dttm` = CURRENT_TIMESTAMP WHERE `demo_config`.`token` = '" . $token . "' ;";
			$mysql_link->query($updateConfigSql);
			$config->message = "Configuration saved successfully.";
		}
	}

	if(empty($token) || !$tokenValid || $copyConfig) {
		// save new configuration
		$oldToken = $token;
		$token = generateRandomToken();
		$config->token = $token;
		$configString = $mysql_link->real_escape_string(json_encode($config));

		$createConfigSql = "INSERT INTO `iot_demo`.`demo_config` (`id`, `token`, `config_name`, `config_desc`, `config_json`, `create_dttm`, `modify_dttm`, `modify_by`, `email_to`) VALUES (NULL, '".$token."', '".$configName."', '".$configDesc."', '".$configString."', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '".$userIP."', '".$userEmail."');";
		$createConfigResult = $mysql_link->query($createConfigSql);
		$config->message = "Configuration saved successfully - with new Token: " . $token;;
	}


	return $config;
}


function copyConfig($token) {
	global $mysql_link;
	
	$configFromDB = getConfigFromDatabase($token);
	$newToken = "";
	if($configFromDB != null) {
		$newToken = generateRandomToken();
		$configFromDB->token = $newToken;

		$userEmail = $configFromDB->general->userEmail;
		$configName = $configFromDB->general->demoName;
		$configDesc = "Copy of token " . $token . "\n" . $configFromDB->general->demoDescription;
		$userIP = gethostbyaddr($_SERVER['REMOTE_ADDR']);
		$configString = $mysql_link->real_escape_string(json_encode($configFromDB));

		$createConfigSql = "INSERT INTO `iot_demo`.`demo_config` (`id`, `token`, `config_name`, `config_desc`, `config_json`, `create_dttm`, `modify_dttm`, `modify_by`, `email_to`) VALUES (NULL, '".$newToken."', '".$configName."', '".$configDesc."', '".$configString."', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '".$userIP."', '".$userEmail."');";
		$createConfigResult = $mysql_link->query($createConfigSql);


	}

	return $newToken;
}



function getAllConfigsFromDatabase($email, $limit) {
	global $mysql_link;
	$result = array();

	$criteria = "";

	if(!empty($email)) {
		$criteria = "WHERE `email_to` = '".$email."'";
	}

	if(!empty($limit)) {
		$criteria = $criteria . " LIMIT ". $limit;
	}

	$configQuerySql = "SELECT id, token, config_name, config_desc, read_only, create_dttm, modify_dttm, email_to  FROM `demo_config` " . $criteria . " ORDER BY `modify_dttm` DESC"; 
	$configQueryResult = $mysql_link->query($configQuerySql);
	$configQuerySize = @$configQueryResult->num_rows;

	for($i = 0; $i < $configQuerySize; $i++) {
		$result[$i] = $configQueryResult->fetch_assoc();
	}

	return $result;
}

function getDefaultConfigsFromDatabase() {
	global $mysql_link;
	$result = array();


	$configQuerySql = "SELECT id, token, config_name, config_desc, read_only, create_dttm, modify_dttm, email_to  FROM `demo_config` WHERE read_only = '1' ORDER BY `modify_dttm` DESC"; 
	$configQueryResult = $mysql_link->query($configQuerySql);
	$configQuerySize = @$configQueryResult->num_rows;

	for($i = 0; $i < $configQuerySize; $i++) {
		$result[$i] = $configQueryResult->fetch_assoc();
	}

	return $result;
}




/**
*
*/
function generateRandomToken($bytes = 6){
	return base64_encode(openssl_random_pseudo_bytes($bytes));
}


function logUsage($eventType, $userPayload, $detail1, $detail2) {
	global $enable_logging;
	global $mysql_link;

	if($enable_logging == false) {
		return false; 
	}

	$userIp = (isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? "Proxy: " . ($_SERVER['HTTP_X_FORWARDED_FOR']) : $_SERVER['REMOTE_ADDR']);
	$userHost =  gethostbyaddr($_SERVER['REMOTE_ADDR']);
	$userSystem =  "Computer: " .  ($userHost != null ?  $userHost : "Unknown" ) . ". Browser: " . htmlspecialchars($_SERVER["HTTP_USER_AGENT"]) ;

	$sqlInsertQuery = "INSERT INTO iot_demo.demo_events (id, session,event_dttm, event_type, user_ip, user_system, user_scenario, detail1, detail2) VALUES (NULL, \"". session_id() ."\" ,CURRENT_TIMESTAMP, \"" . $eventType . "\", \"".$userIp."\",\"".$userSystem."\", \"". addslashes(json_encode($userPayload)) ."\", \"".$detail1."\",  \"".$detail2."\");";
	$mysql_link->query($sqlInsertQuery);
	return true;
}

?>