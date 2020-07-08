<?php

namespace Morpher\SeedRecovery;

class Password
{
    static function saveAndOverride($email, $key, $encryptedSeed)
    {
        $db = \Morpher\DbConnector::getInstance();

        $result = $db->connection->query("SELECT * FROM `User` WHERE user_email = " . $db->escapeString($email));
        $user_id = 0;
        if ($result->num_rows > 0) {
            $user_id = $result->fetch_row()[0];
            $db->connection->query("DELETE FROM Recovery WHERE user_idfk = $user_id AND recoverytype_idfk = 1");
        } else {
            $db->connection->query("INSERT INTO User (user_email) VALUES ( " . $db->escapeString($email) . " )");

            $user_id = $db->connection->insert_id;
        }

        $db->connection->query("INSERT INTO Recovery (recoverytype_idfk, user_idfk, recovery_encryptedSeed, recovery_key) VALUES (1, $user_id, " . $db->escapeString(json_encode($encryptedSeed)) . "," . $db->escapeString($key) . ")");

        $recovery_id = $db->connection->insert_id;
        return ["recovery_id" => $recovery_id];
    }

    static function getEncryptedSeed($key) {
        $db = \Morpher\DbConnector::getInstance();

        $result = $db->connection->query("SELECT * FROM `Recovery` WHERE recovery_key = ".$db->escapeString($key));
        if($result->num_rows > 0) {
            return $result->fetch_object()->recovery_encryptedSeed;
        }
        return false;
    }
}
