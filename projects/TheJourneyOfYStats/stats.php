<?php
if (isset($_GET['mode']) && !empty($_GET['mode'])) {
    $mode = $_GET["mode"];
    $pdo = new PDO('mysql:host=localhost;dbname=prima', 'user', 'pw');
    $status = $pdo->getAttribute(PDO::ATTR_CONNECTION_STATUS);
    if ($mode == "insert") {
        if (isset($_POST['name']) && !empty($_POST['name']) && isset($_POST['score']) && !empty($_POST['score'])) {
            $name = strip_tags($_POST["name"]);
            $score = strip_tags($_POST["score"]);
            $name = preg_replace("/[^A-Za-z0-9 ]/", '', $name);
            $score = preg_replace("/[^0-9 ]/", '', $score);
            if (is_numeric($score)) {
                $statement = $pdo->prepare("INSERT INTO stats (name, score) VALUES (?, ?)");
                $statement->execute(array($name, $score));
            } else {
                echo "Score must be a number";
            }
        } else {
            echo "No name or score provided!";
        }
    } else if ($mode == "get") {
        $selectstatement = "SELECT name, score FROM stats";
        $statsarray = array();
        foreach ($pdo->query($selectstatement) as $row) {
            $myObj = new stdClass;
            $myObj->name = $row['name'];
            $myObj->score = (int)$row['score'];
            array_push($statsarray, $myObj);
        }
        $statsarray = array_values($statsarray);
        header('Content-Type: application/json');
        echo json_encode($statsarray);
    }
} else {
    //default landing page
    echo "false arguments...";
}
?>