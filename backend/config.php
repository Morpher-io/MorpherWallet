<?php

require_once 'vendor/autoload.php';
require_once 'lib/Morpher/DbConnector.php';

if (!session_id())
{
    session_start();
}

// Call Facebook API

$facebook = new \Facebook\Facebook([
  'app_id'      => getenv("FACEBOOK_APP_ID"),
  'app_secret'     => getenv("FACEBOOK_APP_SECRET"),
  'default_graph_version'  => 'v7.0'
]);

?>