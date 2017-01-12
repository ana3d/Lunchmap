<?php

if(!empty($_GET["uuid"])){
	$place_name = $_GET['place_name'];
	$place_url = $_GET['place_url'];
	$device_uuid = $_GET['uuid'];
	$db = new PDO('sqlite:favorites.db');
	$db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
	$db->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
	$db->exec("CREATE TABLE IF NOT EXISTS favorites (id INTEGER PRIMARY KEY AUTOINCREMENT, uuid TEXT, place_name TEXT, place_url TEXT)");
	$db->exec('INSERT INTO favorites (uuid, place_name, place_url) VALUES ("' . $device_uuid. '","' .$place_name .'", "' .$place_url . '");');
		
}

?> 