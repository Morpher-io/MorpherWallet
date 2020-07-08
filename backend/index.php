<?php

header("Access-Control-Allow-Origin: *");
header('Content-type: text/json');
include('config.php');

$payload = file_get_contents('php://input');
$data = json_decode($payload);

switch ($_GET['endpoint']) {
    case 'saveEmailPassword':
        $result = \Morpher\SeedRecovery\Password::saveAndOverride($data->email, $data->key, $data->seed);
        break;
    case 'restoreEmailPassword':
        $result = \Morpher\SeedRecovery\Password::getEncryptedSeed($data->key);
        break;
    case 'saveFacebook':
        $result = \Morpher\SeedRecovery\Facebook::saveAndOverride($data->accessToken, $data->key, $data->seed, $data->email);
        break;
    case 'restoreFacebook':
        $result = \Morpher\SeedRecovery\Facebook::getEncryptedSeed($data->accessToken, $data->key);
        break;
    default:
        $result = false;
    break;
}


echo json_encode($result);
