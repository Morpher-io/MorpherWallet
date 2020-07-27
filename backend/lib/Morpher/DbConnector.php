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

    /**
     * Encrypts AES-256-CBC and Decrypts again for double salting in case database is lost
     * 
     * Key comes from the envrionment variables and is a server side setting
     * 
     * https://www.johnconde.net/blog/php-simple-encryption/
     */
    public static function encrypt($value, $key)
    {
        try {
            $encryption = \Encryption\Encryption::getEncryptionObject();
            $iv = $encryption->generateIv();
            $encryptedText = $encryption->encrypt($value, $key, $iv);
            //$decryptedText = $encryption->decrypt($encryptedText, $key, $iv);
         
            $obj = new \stdClass();
            $obj->cipher = $encryption->getName();
            $obj->encryptedText = $encryptedText;
            $obj->iv = base64_encode($iv);
            return json_encode($obj);
        }
        catch (\Encryption\EncryptionException $e) {
            error_log($e);
        }
    }

    public static function decrypt($jsonCipherAndIV, $key)
    {
        $obj = json_decode($jsonCipherAndIV);
        try {
            $encryption = \Encryption\Encryption::getEncryptionObject();
            $decryptedText = $encryption->decrypt($obj->encryptedText, $key, base64_decode($obj->iv));
         
           return $decryptedText;
        }
        catch (\Encryption\EncryptionException $e) {
            error_log($e);
        }
    }
    
}
