<?php

$token = $_POST['token'];

$request = curl_init();
curl_setopt($request, CURLOPT_URL, "https://developer.api.autodesk.com/oss/v2/buckets?limit=100");

$auth = "Authorization: Bearer ";
$auth .= $token;

$headers = array();
$headers[] = $auth;
curl_setopt($request, CURLOPT_HTTPHEADER, $headers);

$result = curl_exec($request);
if (curl_errno($request)){
    echo 'Error: '.curl_error($request);
}
curl_close($request);

echo("");
//echo $result;
?>
