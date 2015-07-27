<?php

$contentURI = $_REQUEST['contentURI'];
$amount = 1;
$owner = 'https://inartes.databox.me/profile/card#me';
$wallet = 'inartes.com';


$turtle = "<$contentURI> <http://xmlns.com/foaf/0.1/maker> <$owner> . \n";
$turtle .= "<$contentURI> <https://w3id.org/commerce/rate> 1 . \n";
$turtle .= "<$owner> <https://w3id.org/cc#wallet> <https://gitpay.databox.me/Public/.wallet/github.com/melvincarvalho/inartex.com/wallet#this> . \n";
$turtle .= "<https://gitpay.databox.me/Public/.wallet/github.com/melvincarvalho/inartex.com/wallet#this> <https://w3id.org/cc#inbox> <https://gitpay.databox.me/Public/.wallet/github.com/melvincarvalho/inartex.com/inbox/> . \n";




header('Access-Control-Allow-Origin : *');
header("Vary: Accept");

http_response_code(402);

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
