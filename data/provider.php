<?php



@$demoScenario = array();
@$enable_logging = true;
@$logging_db = array(
	"host" => "localhost:3306", 
	"user" => "beacondemo",
	"pass" => "HhNMCX6mqQZPP3PW"); // on GERSASCI: hKByMym2E9eKeV2F


if($_SERVER['REQUEST_METHOD'] == "GET") {
	@$action = $_GET['action'];
	@$param = $_GET['param'];
} else {
	@$action = $_POST['action'];
	@$param = $_POST['param'];	
}


session_set_cookie_params(3600*24*30);
session_start();


process($action, $param);
return;


function process($action, $param) {
	if($action == 'reset') {
		session_destroy();
		header('Location:'.$_SERVER['PHP_SELF'] );
		return true;
	}

	else if($action == 'saveScenario') {
		@header('Content-type: application/json');
		@logUsage("DEMO_SAVE", $param, "", "");
		return true;
	}
	else {
		@header('Content-type: application/json');
		@logUsage("DEMO_LOADING", $param, "", "");
		return true;	
	}
}


function logUsage($eventType, $demoScenario, $detail1, $detail2) {
	global $enable_logging;
	global $logging_db;

	if($enable_logging == false) {
		return false; 
	}


	$userIp = (isset($_SERVER['HTTP_X_FORWARDED_FOR']) ? "Proxy: " . ($_SERVER['HTTP_X_FORWARDED_FOR']) : $_SERVER['REMOTE_ADDR']);
	$userHost =  gethostbyaddr($_SERVER['REMOTE_ADDR']);
	$userSystem =  "Computer: " .  ($userHost != null ?  $userHost : "Unknown" ) . ". Browser: " . htmlspecialchars($_SERVER["HTTP_USER_AGENT"]) ;


	$link = mysqli_connect($logging_db['host'], $logging_db['user'], $logging_db['pass']);
	if (!$link) {
	   	return false;
	}

	$sqlInsertQuery = "INSERT INTO beacondemo.demo_events (id, session,event_dttm, event_type, user_ip, user_system, user_scenario, detail1, detail2) VALUES (NULL, \"". session_id() ."\" ,CURRENT_TIMESTAMP, \"" . $eventType . "\", \"".$userIp."\",\"".$userSystem."\", \"". addslashes(json_encode($demoScenario)) ."\", \"".$detail1."\",  \"".$detail2."\");";
	//echo $sqlInsertQuery;
	mysqli_query($link,$sqlInsertQuery);
	mysqli_close($link);
	return true;
}







?>