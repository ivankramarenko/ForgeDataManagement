<?php
$bucketKey = $_POST["bucketKey"];
$objectKey = $_POST["objectKey"];
$token=$_POST["token"];

$auth = "Authorization: Bearer ";
$auth .= $token;
$contentType = "Content-Type: application/json";

$headers = array();
$headers[] = $auth;
$headers[] = $contentType;

$request = curl_init();
curl_setopt($request, CURLOPT_URL, "https://developer.api.autodesk.com/oss/v2/buckets/".$bucketKey."//objects/".$objectKey);
curl_setopt($request, CURLOPT_CUSTOMREQUEST, "DELETE");
curl_setopt($request, CURLOPT_HTTPHEADER, $headers);

$result = curl_exec($request);
if (curl_errno($request)){
    echo('Error: '.curl_error($request));
}
else {
   echo("File \"".$objectKey."\" deleted successfully.");
}

curl_close($request);

//header("location: /index.html");

?>