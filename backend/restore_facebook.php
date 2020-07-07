<?php
 header("Access-Control-Allow-Origin: *");
 header('Content-type: text/json');
 include('config.php');

 $payload = file_get_contents('php://input');
 $data = json_decode($payload);
 $facebook->setDefaultAccessToken($data->access_token);

 $graph_response = $facebook->get("/me?fields=name,email", $data->access_token);
 $facebook_user_info = $graph_response->getGraphUser();
 echo json_encode($facebook_user_info->asArray());