<?php

require_once 'vendor/autoload.php';

if (!session_id())
{
    session_start();
}