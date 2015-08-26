<?php

$uri = $_REQUEST['uri'];
$amount = 1;
$owner = 'https://inartes.databox.me/profile/card#me';
$wallet = 'inartes.com';


$turtle = "<$uri> <http://xmlns.com/foaf/0.1/maker> <$owner> . \n";
$turtle .= "<$uri> <https://w3id.org/commerce/rate> 25 . \n";
$turtle .= "<$owner> <https://w3id.org/cc#wallet> <https://localhost/etc/wallet/inartes.com/wallet#wallet> . \n";
$turtle .= "<https://localhost/etc/wallet/inartes.com/wallet#wallet> <https://w3id.org/cc#inbox> <https://localhost/etc/wallet/inartes.com/inbox/> . \n";




header('Access-Control-Allow-Origin : *');
header("Vary: Accept");

http_response_code(200);

if (stristr($_SERVER["HTTP_ACCEPT"], "application/turtle")) {
  header("Content-Type: application/turtle");
  echo $turtle;
  exit;
}
if (stristr($_SERVER["HTTP_ACCEPT"], "text/turtle")) {
  header("Content-Type: text/turtle");
  echo $turtle;
  exit;
}

echo "$turtle";

?>
