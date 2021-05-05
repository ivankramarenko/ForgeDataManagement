<?php
$content = $_POST['content'];
$dataArray = json_decode($content);

$xml = new SimpleXMLElement('<ArrayOfFamilyData/>');

foreach ($dataArray as $data) {
    $FamilyData = $xml->addChild('FamilyData');
    $FamilyData->addChild('FileName', str_replace("$", '*', $data[0]));
    $FamilyData->addChild('Urn', $data[1]);
}

$xml->asXML('../xml/modelUrn.xml');

?>
