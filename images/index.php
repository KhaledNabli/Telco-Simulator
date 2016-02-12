<?php
session_set_cookie_params(3600*24*30);
session_start();


header("Content-Type: text/html;charset=UTF-8");

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


return processRequest();
// Continue reading in processRequest();


function getRequestParameter($parameter) {
	if($_SERVER['REQUEST_METHOD'] == "POST")
		return @$_POST[$parameter] ? @$_POST[$parameter] : @$_GET[$parameter] ;
	else
		return @$_GET[$parameter];
}



function processRequest() {
	// if POST
	// -> handle Upload
	if($_SERVER['REQUEST_METHOD'] == "POST") {
		header('Content-type: application/json');
		echo json_encode(processUpload());
	}

	// if GET
	// -> show Image by ID
	else {
		$imageId = getRequestParameter("img");
		header("Content-type: image/jpeg");
		echo showImage($imageId);
	}
}





function processUpload() {
	global $mysql_link;
	
	// TODO update
	$image_desc = getRequestParameter("imageDesc");
	$upload_user = gethostbyaddr($_SERVER['REMOTE_ADDR']);

	
	

	$image = addslashes(file_get_contents($_FILES['image']['tmp_name'])); //SQL Injection defence!
	$image_name = addslashes($_FILES['image']['name']);
	$uploadSql = "INSERT INTO `iot_demo`.`demo_image` (`id`, `image`, `name`, `desc`, `create_dttm`, `modify_dttm`, `uploaded_by`) VALUES (NULL, '{$image}', '{$image_name}', '{$image_desc}', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, '{$upload_user}');";
	$result = $mysql_link->query($uploadSql);

	$returnValue = array();

	$returnValue["tmp_img_name"] = $_FILES['image']['tmp_name'];
	$returnValue["upload_error"] = $_FILES['image']['error'];

	if($result) {
		$imgFolderUrl = "http://". $_SERVER['SERVER_NAME'] ."/IOTSimulator/images/?img=";
		$returnValue["status"] = "success";
		$returnValue["message"] = "Image uploaded successfully";
		$returnValue["imageId"] = $mysql_link->insert_id;
		$returnValue["imageUrl"] = $imgFolderUrl . $mysql_link->insert_id;	
	} else {
		$returnValue["status"] = "error";
		$returnValue["message"] = $mysql_link->error;
		$returnValue["imageId"] = null;
		$returnValue["imageUrl"] = null;		
	}

	return $returnValue;
}



function showImage($imageId) {
	global $mysql_link;

	$imageSql = "SELECT `image` FROM `iot_demo`.`demo_image` WHERE `id` = '".$imageId."'";
	$imageResult = $mysql_link->query($imageSql);
	$row = $imageResult->fetch_assoc();

	
  	return $row['image'];
}
