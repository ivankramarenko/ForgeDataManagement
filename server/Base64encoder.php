<?php
$sourceURN = $_POST['sourceURN'];
$base64Urn = rtrim( strtr( base64_encode( $sourceURN ), '+/', '-_' ), '=' );
echo $base64Urn;
?>