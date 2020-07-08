<?php
header("Access-Control-Allow-Origin: *");
header('Content-type: text/json');
include('config.php');

$payload = file_get_contents('php://input');
$data = json_decode($payload);

$result = \Morpher\SeedRecovery\Password::saveAndOverride($data->email, $data->key, $data->seed);

echo json_encode($result);
