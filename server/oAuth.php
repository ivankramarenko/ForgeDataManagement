<?php
$ch = curl_init();

/*
$postData = array(
    "client_id"=>"",
    "client_secret"=>"",
    "grant_type"=>"client_credentials",
    "scope"=>"data:read data:write data:create bucket:read bucket:create"
);*/

curl_setopt($ch, CURLOPT_URL, "https://developer.api.autodesk.com/authentication/v1/authenticate");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, "client_id=  &grant_type=client_credentials&scope=data:read data:write data:create bucket:read bucket:create bucket:delete");
//curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($postData));
curl_setopt($ch, CURLOPT_POST, 1);

$headers = array();
$headers[] = "Content-Type: application/x-www-form-urlencoded";
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$result = curl_exec($ch);
if (curl_errno($ch)) {
    echo 'Error:' . curl_error($ch);
}
curl_close ($ch);
echo $result;
?> 

