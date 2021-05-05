<?php
$token = $_POST['token'];
$bucket = $_POST['bucket'];

$ch = curl_init();

$url = "https://developer.api.autodesk.com/oss/v2/buckets/";
$url .=$bucket;
$url .= "/objects?limit=100";

curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");

$auth = "Authorization: Bearer ";
$auth .= $token;

$headers = array();
$headers[] = $auth;
$headers[] = "Content-Type: application/json";
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$result = curl_exec($ch);
if (curl_errno($ch)) {
    echo 'Error:' . curl_error($ch);
}
curl_close ($ch);
echo $result;
?>