<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, GET, POST, DELETE, OPTIONS');

if(!empty($_GET["user"])){
	$user = $_GET['user'];
	$password = $_GET['pass'];
	$name = $_GET['name'];
	$db = new PDO('sqlite:/home/ana3d/login.db');
	$db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
	$db->setAttribute( PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION );
	$db->exec("CREATE TABLE IF NOT EXISTS login (id INTEGER PRIMARY KEY AUTOINCREMENT, login TEXT, password TEXT, name TEXT)");


	$sql  = "SELECT * FROM login WHERE login='" . $user . "'";
	$result = $db->query($sql);
	if($result->fetch()){
		
		$result=null;
		$db=null;
		echo json_encode("false");
	}else{
		
		$db->exec('INSERT INTO login (login, password, name) VALUES ("' . $user. '","' .$password .'","' .$name. '");');	
		$db=null;
		echo json_encode("true");
		
	}
		
}




?>