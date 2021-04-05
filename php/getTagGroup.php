<?php

include_once('SQLBD.php');
$DB = new SQLBD();
$grupuri = $DB->getArray("SELECT * FROM taggroups", 'nume');
header('Content-Type: application/json');
echo json_encode($grupuri);
