<?php

header("Access-Control-Allow-Origin: *");
header('Content-type: text/json');
include('config.php');

$payload = file_get_contents('php://input');
$data = json_decode($payload);

switch ($_GET['endpoint']) {
    /**
     * Email / Password recovery
     */
    case 'saveEmailPassword':
        $result = \Morpher\SeedRecovery\Password::saveAndOverride($data->email, $data->key, $data->seed);
        break;
    case 'restoreEmailPassword':
        $result = \Morpher\SeedRecovery\Password::getEncryptedSeed($data->key);
        break;

    case 'getRecoveryMethods':
        $result = \Morpher\UserInfo::getRecoveryMethods($data->email);

    /**
     * Facebook Recovery
     */
    case 'saveFacebook':
        $result = \Morpher\SeedRecovery\Facebook::saveAndOverride($data->key, $data->seed, $data->email);
        break;
    case 'restoreFacebook':
        $result = \Morpher\SeedRecovery\Facebook::getEncryptedSeed($data->accessToken);
        break;

    /**
     * Google Recovery
     */
    case 'saveGoogle':
        $result = \Morpher\SeedRecovery\Google::saveAndOverride($data->key, $data->seed, $data->email);
        break;
    case 'restoreGoogle':
        $result = \Morpher\SeedRecovery\Google::getEncryptedSeed($data->accessToken);
        break;
    default:
        $result = false;
        break;
}


echo json_encode($result);
