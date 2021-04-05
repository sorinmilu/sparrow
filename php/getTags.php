<?php

include_once('SQLBD.php');
$DB = new SQLBD();
$tgname = $_GET["nume"];
#$tgname = 'popular';
$tags = $DB->getArray("SELECT taglist FROM taggroups where nume = '$tgname'", 'taglist');
header('Content-Type: application/json');
echo json_encode(json_decode($tags[0]));

