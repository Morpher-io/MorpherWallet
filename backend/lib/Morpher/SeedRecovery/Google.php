<?php

namespace Morpher\SeedRecovery;

class Google
{
    /**
     * @param $key is the key generated by the frontend from app_id + user_id
     * @param $encryptedSeed is the seed encrypted with the user_id
     * @param $originalSignupEmail is the mail that might differ from the facebook email address, originally used to signup to Morpher (email/password signup with additional facebook recovery later added). If false, then facebook was used to signup to morpher in the first place
     */
    static function saveAndOverride($key, $encryptedSeed, $originalSignupEmail)
    {
        $db = \Morpher\DbConnector::getInstance();


        $result = $db->connection->query("SELECT * FROM `User` WHERE user_email = " . $db->escapeString($originalSignupEmail));
        $user_id = 0;
        if ($result->num_rows > 0) {
            $user_id = $result->fetch_row()[0];
            $db->connection->query("DELETE FROM Recovery WHERE user_idfk = $user_id AND recoverytype_idfk = 3");
        } else {
            $db->connection->query("INSERT INTO User (user_email) VALUES ( " . $db->escapeString($originalSignupEmail) . " )");

            $user_id = $db->connection->insert_id;
        }
        $db->connection->query("INSERT INTO Recovery (recoverytype_idfk, user_idfk, recovery_encryptedSeed, recovery_key) VALUES (3, $user_id, " . $db->escapeString(json_encode($encryptedSeed)) . "," . $db->escapeString($key) . ")");
        $recovery_id = $db->connection->insert_id;
        return ["recovery_id" => $recovery_id];
    }

    static function getEncryptedSeed($accessToken, $originalSignupEmail)
    {
        $db = \Morpher\DbConnector::getInstance();

        // Call Facebook API
        $client = new \Google_Client(array('application_name' => 'ZeroWallet-Recoverable', 'client_id' => getenv("GOOGLE_APP_ID"), 'client_secret' => getenv("GOOGLE_SECRET_ID")));
        $client->setAccessToken($accessToken);
        //if (!$client->isAccessTokenExpired()) {
        $client->setScopes(array(
            "https://www.googleapis.com/auth/plus.login",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/plus.me"
        ));
        $oAuth = new \Google_Service_Oauth2($client);
        $userData = $oAuth->userinfo_v2_me->get();

        $key = hash("sha256", getenv("GOOGLE_APP_ID") . $userData["id"]);

        $result = $db->connection->query("SELECT r.* FROM `Recovery` r JOIN `User` u ON u.user_id = r.user_idfk WHERE r.recovery_key = " . $db->escapeString($key) . " AND r.recoverytype_idfk = 3 AND u.user_email = " . $db->escapeString($originalSignupEmail));
        if ($result->num_rows > 0) {
            return $result->fetch_object()->recovery_encryptedSeed;
        }

        //}




        return false;
    }
}