<?php

$bucketName = $_POST['bucketName'];
$token = $_POST['token'];

$bucketName = strtolower($bucketName);

$postData = array(
    "bucketKey"=> $bucketName,
    "policyKey"=> "persistent"
);

print_r($bucketName);

$request = curl_init();

$auth = "Authorization: Bearer ";
$auth .= $token;
$contentType = "Content-Type: application/json";

$headers = array();
$headers[] = $auth;
$headers[] = $contentType;

curl_setopt($request, CURLOPT_URL, "https://developer.api.autodesk.com/oss/v2/buckets");
curl_setopt($request, CURLOPT_POSTFIELDS, json_encode($postData));
curl_setopt($request, CURLOPT_HTTPHEADER, $headers);

$result = curl_exec($request);
if (curl_errno($request)){
    echo 'Error: '.curl_error($request);
}
curl_close($request);

echo($result);
//header("location: /index.html");*/
?>