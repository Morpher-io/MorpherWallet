<?php

namespace Morpher\SeedRecovery;

class Email
{
    static function change($oldemail, $newemail, $key, $encryptedSeed)
    {
        $db = \Morpher\DbConnector::getInstance();
        $result = $db->connection->query("SELECT * FROM `User` WHERE user_email = " . $db->escapeString($oldemail));
        $user_id = 0;
        if ($result->num_rows > 0) {
            $user_id = $result->fetch_row()[0];
			$db->connection->query("UPDATE User SET user_email = " . $db->escapeString($newemail) . " WHERE user_id = $user_id ");
			
            $db->connection->query("DELETE FROM Recovery WHERE user_idfk = $user_id AND recoverytype_idfk = 1");
        

			$db->connection->query("INSERT INTO Recovery (recoverytype_idfk, user_idfk, recovery_encryptedSeed, recovery_key) VALUES (1, $user_id, " . $db->escapeString(json_encode($encryptedSeed)) . "," . $db->escapeString($key) . ")");

			$recovery_id = $db->connection->insert_id;
			return ["recovery_id" => $recovery_id];
		}
    }
}

