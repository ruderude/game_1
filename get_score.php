<?php

try {

    $dsn = 'mysql:host=127.0.0.1;dbname=fukurou_game;charset=utf8mb4';
    $user = 'admin';
    $password = 'password';

    $dbh = new PDO($dsn, $user, $password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $sql = "SELECT * FROM scores ORDER BY score DESC LIMIT 5";

    $stmt = $dbh->query($sql);

    $scores = $stmt->fetchALL(PDO::FETCH_ASSOC);

    $dbh = null;

    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode($scores);
    exit;

} catch (PDOException $e) {
    $error_message =  "障害発生: " . $e->getMessage() . "\n";
    echo $error_message;
    exit;
}