<?php
header('Access-Control-Allow-Origin: *');

if(!empty($_GET["user"])){

	$user = $_GET['user'];
	$password = $_GET['pass'];
	$db = new PDO('sqlite:/home/ana3d/login.db');
	$db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
	$db->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
	$sql  = "SELECT name FROM login WHERE login='" . $user . "' AND password='" .$password. "'";
	$array = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);	
	
	if (!empty($array)) {
		echo json_encode($array);
	}
	else {
		echo json_encode("false");
	}



}	


?> 