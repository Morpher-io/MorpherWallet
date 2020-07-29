<?php

namespace Morpher;

class DbConnector
{

    public $connection;

    public static $_instance;

    public static function getInstance()
    {
        if (!(self::$_instance instanceof self)) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    private function __construct()
    {
        $servername = getenv("DB_HOSTNAME");
        $username = getenv("DB_USERNAME");
        $password = getenv("DB_PASSWORD");
        $db_name = getenv("DB_DATABASE");
        $connection = new \mysqli($servername, $username, $password, $db_name);
        if ($connection->connect_error) {
            die("Connection unsuccessful " . $connection->connect_error);
        } else {
            $this->connection = $connection;
        }
    }

    public function escapeString($escString)
    {
        return "'" . mysqli_real_escape_string($this->connection, $escString) . "'";
    }
}
