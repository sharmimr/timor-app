<?php
error_log(print_r(getallheaders(), true));
ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(E_ALL);

/* ================= CORS ================= */
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
}
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/* ================= DB ================= */
$conn = mysqli_connect("154.26.155.43","haap","Haap@haap$123","haap",3306);
if(!$conn){
    echo json_encode(["status"=>"error","message"=>"Ligasaun ba base dadus falla"]);
    exit;
}

/* ================= INPUT ================= */
$data = json_decode(file_get_contents("php://input"), true);
$username = trim($data['username'] ?? '');
$password = trim($data['password'] ?? '');   // optional

if (!$username) {
    echo json_encode(["status"=>"error","message"=>"Naran utilizadór presiza"]);
    exit;
}

/* ================= PASSWORD VERIFY ================= */
function pbkdf2_verify($pass, $hash){
    $parts = explode('$', $hash);
    if(count($parts) !== 4) return false;
    [$algo, $iter, $salt, $h] = $parts;
    if($algo !== 'pbkdf2_sha256') return false;
    return hash_equals(
        base64_decode($h),
        hash_pbkdf2('sha256', $pass, $salt, (int)$iter, strlen(base64_decode($h)), true)
    );
}
/* ================= FETCH USER ================= */
$stmt = mysqli_prepare(
    $conn,
    "SELECT id, whatsapp_number, password FROM users WHERE whatsapp_number=?"
);
mysqli_stmt_bind_param($stmt, "s", $username);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

if (!$result || mysqli_num_rows($result) === 0) {
    echo json_encode(["status"=>"error","message"=>"Utilizadór la hetan"]);
    exit;
}

$user = mysqli_fetch_assoc($result);

/* ================= CONDITIONAL PASSWORD CHECK ================= */
if ($password !== '') {
    if (!pbkdf2_verify($password, $user['password'])) {
        echo json_encode(["status"=>"error","message"=>"Naran utilizadór ka senha ne'ebé la válidu"]);
        exit;
    }
}
/* ================= TOKEN ================= */
$token = base64_encode(json_encode(["usr"=>$username]));

/* ================= FETCH CHILD ================= */
$childStmt = mysqli_prepare(
    $conn,
    "SELECT id, first_name FROM children WHERE parent_id like ?"
);
mysqli_stmt_bind_param($childStmt, "s", $user['id']);
mysqli_stmt_execute($childStmt);
$childResult = mysqli_stmt_get_result($childStmt);

if (!$childResult || mysqli_num_rows($childResult) === 0) {
    echo json_encode(["status"=>"error","message"=>"Labarik la hetan"]);
    exit;
}

// $child = mysqli_fetch_assoc($childResult);

$children = [];

while ($row = mysqli_fetch_assoc($childResult)) {
    $children[] = [
        "id" => $row['id'],
        "first_name" => $row['first_name']
    ];
}

/* ================= INSERT ACTIVITY ================= */
$insertSql = "
    INSERT INTO activity_result
    (pid, status, activity_name, activity_result, category1, category2, category3, sid)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
";
$insertStmt = mysqli_prepare($conn, $insertSql);

$activity_result = "Tentadu";
$activity_name = '';
$c1 = $c2 = $c3 = '';
$sid='';

mysqli_stmt_bind_param(
    $insertStmt,
    "ssssssss",
    $user['id'],
    $activity_result,
    $activity_name,
    $activity_result,
    $c1,
    $c2,
    $c3,
    $sid
);
mysqli_stmt_execute($insertStmt);

/* ================= RESPONSE ================= */
echo json_encode([
    "status" => "ok",
    "message" => "Success",
    "token" => $token,
    "child" => $children,
    "username" => $username,
]);

mysqli_close($conn);
exit;