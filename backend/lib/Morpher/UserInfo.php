<?php

namespace Morpher;

class UserInfo {

    /**
     * Returns all registered recovery methods for the user or an empty array if none
     */
    public static function getRecoveryMethods($email) {
        $db = \Morpher\DbConnector::getInstance();
        $result = $db->connection->query("SELECT rt.* FROM `User` u JOIN `Recovery` r ON r.user_idfk = u.user_id JOIN RecoveryType rt ON rt.recoverytype_id = r.recoverytype_idfk WHERE user_email = " . $db->escapeString($email));
        $recovery_methods = array();
        while($row = $result->fetch_object()) {
            $recovery_methods[] = $row;
        }

        return $recovery_methods;
    }
}