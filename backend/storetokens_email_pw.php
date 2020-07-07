<?php
header("Access-Control-Allow-Origin: *");
header('Content-type: text/json');
include('config.php');

$payload = file_get_contents('php://input');
$data = json_decode($payload);

$db = Morpher\DbConnector::getInstance();

$result = $db->connection->query("SELECT * FROM `User` WHERE user_email = ".$db->escapeString($data->email));
$user_id = 0;
if($result->num_rows > 0) {
    $user_id = $result->fetch_row()[0];
    $db->connection->query("DELETE FROM Recovery WHERE user_idfk = $user_id AND recoverytype_idfk = 1");
} else {
    $db->connection->query("INSERT INTO User (user_email) VALUES ( ".$db->escapeString($data->email)." )");

    $user_id = $db->connection->insert_id;
}

$db->connection->query("INSERT INTO Recovery (recoverytype_idfk, user_idfk, recovery_encryptedSeed, recovery_key) VALUES (1, $user_id, ". $db->escapeString(json_encode($data->seed)).",". $db->escapeString($data->email).")");

$recovery_id = $db->connection->insert_id;
echo json_encode(["recovery_id" => $recovery_id]);
