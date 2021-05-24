<?php
ini_set('display_errors', "On");

$json = file_get_contents("php://input");
$contents = json_decode($json, true);

$name = isset($contents['name']) ? $contents['name'] : "test";
$score = isset($contents['score']) ? $contents['score'] : "0";

$data = [
    "name" => $name,
    "score" => $score
];

try {

    $dsn = 'mysql:host=127.0.0.1;dbname=fukurou_game;charset=utf8mb4';
    $user = 'admin';
    $password = 'password';
    
    $dbh = new PDO($dsn, $user, $password);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $sql = "INSERT INTO scores (name, score) VALUES (:name, :score)";
    $stmt = $dbh->prepare($sql);

    //クエリの設定
    $stmt->bindValue(':name', $name);
    $stmt->bindValue(':score', $score);

    //クエリの実行
    $stmt->execute();
    
    $dbh = null;

    error_log(json_encode($data));

    header("Content-Type: application/json; charset=UTF-8");
    echo json_encode($data);
    exit;
    
} catch (PDOException $e) {
    $error_message =  "障害発生: " . $e->getMessage() . "\n";
    echo $error_message;
    exit;
}