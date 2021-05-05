<?php
ini_set('memory_limit', '1024M');
ini_set('max_execution_time', 300); //300 seconds = 5 minutes
class FileUpload
{
    public $URN;
    public $Path;
}

$bucketKey = $_POST['bucketKey'];
$token = $_POST['inputToken'];
$countFiles = count($_FILES['files']);

//print_r($_FILES['files']['name'][0]);

$fileArray = array();
//for ($i = 0; $i < $countFiles; $i++) {
    if (isset($_FILES['files']['name']) /* && pathinfo($_FILES['files']['name'][$i], PATHINFO_EXTENSION) == "rvt"*/) {
        //print_r($_FILES['files']['name']);
        $fileName = $_FILES['files']['name']; 
        $fileName = replaceUmlaut($fileName);
        $fileName = replaceFraction($fileName);

        $fileSize = $_FILES['files']['size'];
        $fileTemp = $_FILES['files']['tmp_name'];
       
        $currentDir = getcwd();
        $uploadDirectory = "\uploads\\";
        $uploadPath = $currentDir . $uploadDirectory . basename($fileName);
        //$uploadPath = str_replace('\\', '/', $uploadPath);
        
        move_uploaded_file($fileTemp, $uploadPath);
        $urn = forgeUpload($fileName, $fileSize, $uploadPath, $bucketKey, $token);   
       // header ("Location: localhost:3000/ForgeDataManagement/");
       // header("Refresh:0");
       
    }
//}

function forgeUpload($file, $size, $uploadPath, $bucketKey, $token)
{
    $request = curl_init();
    $url = "https://developer.api.autodesk.com/oss/v2/buckets/" . $bucketKey . "/objects/" . $file;
    $auth = "Authorization: Bearer ";
    $auth .= $token;
    $contentType = "Content-Type: application/octet-stream";
    $fileSize = "Content-Length: " . $size;
    $dataBinary = file_get_contents($uploadPath);

    $headers = array();
    $headers[] = $auth;
    $headers[] = $contentType;
    $headers[] = $dataBinary;

    curl_setopt($request, CURLOPT_URL, $url);
    curl_setopt($request, CURLOPT_CUSTOMREQUEST, "PUT");
    curl_setopt($request, CURLOPT_POSTFIELDS, file_get_contents($uploadPath));
    curl_setopt($request, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($request, CURLOPT_RETURNTRANSFER, true);

    $response = json_decode(curl_exec($request), true);
   
    //print_r("RESPONSE".$response);

    $sourceURN = $response['objectId'];
    $urn = rtrim(strtr(base64_encode($sourceURN), '+/', '-_'), '=');    
   // echo($urn);
        //postJob($urn, $uploadPath, $token);    

    //echo (curl_getinfo($request, CURLINFO_HTTP_CODE));

    if (curl_errno($request)) {
        echo 'Error:' . curl_error($response);
    }
    else{
        postJob($urn, $uploadPath, $token);
       
    }
   
    return $urn;

}

function postJob($urn, $rootPath, $token)
{
    /*
    echo ($urn);
    echo ('<br>');
    echo ($rootPath);
    echo ('<br>');*/

    $request = curl_init();
    $url = "https://developer.api.autodesk.com/modelderivative/v2/designdata/job";
    $auth = "Authorization: Bearer ";
    $auth .= $token;
    $contentType = "Content-Type: application/json ; charset=utf-8";
    $adsForce = 'x-ads-force: true';

    $headers = array();
    $headers[] = $auth;
    $headers[] = $contentType;
    $headers[] = $adsForce;

    $postData = array(
        "input" => array(
            "urn" => $urn,
            "compressedUrn" => false,
            "rootFilename" => $rootPath,
        ),
        "output" => array(
            "formats" => array(
                array(
                    "type" => "svf", 
                    "views" => array("3d", "2d")
                )
                ),
                "advanced"=>array("generateMasterViews"=>true)
        ),
    );

    //echo json_encode($postData);

    curl_setopt($request, CURLOPT_URL, $url);
    curl_setopt($request, CURLOPT_CUSTOMREQUEST, "POST");
    curl_setopt($request, CURLOPT_POSTFIELDS, json_encode($postData));
    curl_setopt($request, CURLOPT_HTTPHEADER, $headers);
    //echo ('<br>');
    $response = curl_exec($request);
}

function replaceUmlaut($string){
    if (strpos("Ä", $string) === false ||
        strpos("Ö", $string) === false ||
        strpos("Ü", $string) === false ||
        strpos("ä", $string) === false ||
        strpos("ö", $string) === false ||
        strpos("ü", $string) === false)
    {
    $string = str_replace("Ä", "AE", $string);
    $string = str_replace("Ö", "OE", $string);
    $string = str_replace("Ü", "UE", $string);

    $string = str_replace("ä", "ae", $string);
    $string = str_replace("ö", "oe", $string);
    $string = str_replace("ü", "ue", $string);
    }

    return $string;
}

function replaceFraction($string){
    if (strpos("½", $string) === false ||
        strpos("¼", $string) === false ||
        strpos("¾", $string) === false ||
        strpos("⅛", $string) === false)
    {
        $string = str_replace("½", "+1_2+", $string);
        $string = str_replace("¼", "+1_4+", $string);
        $string = str_replace("¾", "+3_4+", $string);
        $string = str_replace("⅛", "+1_8+", $string);
    }
    return $string;
}