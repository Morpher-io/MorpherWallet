<?php

require_once 'vendor/autoload.php';

if (!session_id())
{
    session_start();
}

// Call Facebook API

$facebook = new \Facebook\Facebook([
  'app_id'      => '299132904630133',
  'app_secret'     => 'db3693734c6dd7c5581d5e1f012e3e84',
  'default_graph_version'  => 'v7.0'
]);

?>