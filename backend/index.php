<?php

header("Access-Control-Allow-Origin: *");
header('Content-type: text/json');
include('config.php');

$payload = file_get_contents('php://input');
$data = json_decode($payload);
$result = "";

if (!isset($_GET['endpoint'])) {
    die("No Endpoint selected, aborting");
}

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
        $result = \Morpher\SeedRecovery\Facebook::getEncryptedSeed($data->accessToken, $data->signupEmail);
        break;

        /**
         * Google Recovery
         */
    case 'saveGoogle':
        $result = \Morpher\SeedRecovery\Google::saveAndOverride($data->key, $data->seed, $data->email);
        break;
    case 'restoreGoogle':
        $result = \Morpher\SeedRecovery\Google::getEncryptedSeed($data->accessToken, $data->signupEmail);
        break;

        /**
         * Twitter Recovery
         */
    case 'saveTwitter':
        $result = \Morpher\SeedRecovery\Twitter::saveAndOverride($data->key, $data->seed, $data->email);
        break;
    case 'restoreTwitter':
        $result = \Morpher\SeedRecovery\Twitter::getEncryptedSeed($data->accessToken, $data->accessTokenSecret, $data->signupEmail);
        break;
    
        /**
         * VKontakte Recovery
         */
    case 'testVkontakte':
		$code = $_GET['code'];
        $result = \Morpher\SeedRecovery\Vkontakte::testVkontakte($code);
        break;
    case 'saveVkontakte':
        $result = \Morpher\SeedRecovery\Vkontakte::saveAndOverride($data->key, $data->seed, $data->email);
        break;
    case 'restoreVkontakte':
        $result = \Morpher\SeedRecovery\Vkontakte::getEncryptedSeed($data->accessToken, $data->accessTokenSecret, $data->signupEmail);
        break;
    default:
        $result = false;
        break;
}


echo json_encode($result);
