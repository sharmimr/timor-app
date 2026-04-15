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
header("Access-Control-Allow-Headers: Content-Type, Authorization, Accept");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

/* ================= AUTH ================= */
$headers = getallheaders();
$auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';

if (!$auth || stripos($auth,'Bearer ') !== 0) {
    echo json_encode(["status"=>"error","message"=>"Authorization missing"]);
    exit;
}

$token = trim(str_ireplace('Bearer','',$auth));
$decoded = json_decode(base64_decode($token), true);

if (!$decoded || !isset($decoded['usr'])) {
    echo json_encode(["status"=>"error","message"=>"Invalid token"]);
    exit;
}

$username = $decoded['usr'];

/* ================= INPUT ================= */
$data = json_decode(file_get_contents("php://input"), true);

$link         = trim($data['link'] ?? '');
$page         = trim($data['page'] ?? '');
$pageLevel    = $data['pageLevel'] ?? null;
$updateTarget = $data['updateTarget'] ?? null;
$statusFlag   = $data['status'] ?? null;
$sid          = isset($data['sid']) ? $data['sid'] : null;

if ($link === '' && $statusFlag === null && $updateTarget !== 'sid') {
    echo json_encode(["status"=>"error","message"=>"No data received"]);
    exit;
}

/* ================= DB ================= */
$conn = mysqli_connect("154.26.155.43","haap","Haap@haap$123","haap",3306);
if (!$conn) {
    echo json_encode(["status"=>"error","message"=>"DB connection failed"]);
    exit;
}

/* ================= USER → PID ================= */
$u = mysqli_prepare($conn, "SELECT id FROM users WHERE username=?");
mysqli_stmt_bind_param($u, "s", $username);
mysqli_stmt_execute($u);
$ur = mysqli_stmt_get_result($u);
$userRow = mysqli_fetch_assoc($ur);

if (!$userRow) {
    echo json_encode(["status"=>"error","message"=>"User not found"]);
    exit;
}

$pid = $userRow['id'];

/* ================= SID UPDATE ================= */
if ($updateTarget === 'sid' && $sid) {

    $s = mysqli_prepare($conn,
        "SELECT id FROM activity_result
         WHERE pid=?
         ORDER BY id DESC
         LIMIT 1"
    );
    mysqli_stmt_bind_param($s, "i", $pid);
    mysqli_stmt_execute($s);
    $r = mysqli_stmt_get_result($s);

    if ($row = mysqli_fetch_assoc($r)) {
        $upd = mysqli_prepare($conn,
            "UPDATE activity_result SET sid=? WHERE id=?"
        );
        mysqli_stmt_bind_param($upd, "ss", $sid, $row['id']);
        mysqli_stmt_execute($upd);
    } else {
        $ins = mysqli_prepare($conn,
            "INSERT INTO activity_result
             (pid, status, sid, activity_name, activity_result, category1, category2, category3)
             VALUES (?, 'Tentadu', ?, '', 'Tentadu', '', '', '')"
        );
        mysqli_stmt_bind_param($ins, "ss", $pid, $sid);
        mysqli_stmt_execute($ins);
    }

    echo json_encode([
        "status" => "ok",
        "message" => "Child selected",
        "sid" => $sid
    ]);
    exit;
}

/* ================= FETCH LATEST ================= */
$stmt = mysqli_prepare(
    $conn,
    "SELECT id, pid, sid, category1, activity_name, activity_result
     FROM activity_result
     WHERE pid=?
     ORDER BY id DESC
     LIMIT 1"
);
mysqli_stmt_bind_param($stmt,"i",$pid);
mysqli_stmt_execute($stmt);
$res = mysqli_stmt_get_result($stmt);

if (!$row = mysqli_fetch_assoc($res)) {
    echo json_encode(["status"=>"error","message"=>"No activity row found"]);
    exit;
}

$activityId = (int)$row['id'];
$isLocked   = !empty($row['activity_name']);

/* ================= COMPLETION ================= */

// Re-fetch latest row
$refetch = mysqli_prepare($conn,
    "SELECT id, pid, sid, category1, activity_name, activity_result
     FROM activity_result
     WHERE id = ?"
);
mysqli_stmt_bind_param($refetch, "i", $activityId);
mysqli_stmt_execute($refetch);
$res = mysqli_stmt_get_result($refetch);
$row = mysqli_fetch_assoc($res);

if (!$row) {
    echo json_encode(["status"=>"error","message"=>"Activity row missing"]);
    exit;
}

if ($statusFlag === 'completed') {
$category = trim($row['category1']);
    $activity = trim($row['activity_name']);
    
        if(stripos($category, "Ha'u") !== false &&
    stripos($category, "- Númeru") !== false && $activity === "Sekuénsia"){
            $completedText = "bele tau númeru sekuénsia 1 to'o 5.";
        }elseif (stripos($category, "Transporte") !== false &&
    stripos($category, "- Sobu monta") !== false && $activity === "Monta 1") {

        $completedText = "bele tau hamutuk seksaun oin no kotuk husi imajen motor ida nian.";

    } elseif (stripos($category, "Ha'u") !== false &&
    stripos($category, "- Númeru") !== false && $activity === "Forma sira") {

        $completedText = "aprende kona-ba forma sira";

    } elseif (stripos($category, "Ha'u") !== false &&
    stripos($category, "- Sobu monta") !== false && $activity === "Liafuan ba forma") {

        $completedText = "bele hili liafuan sira husi forma sira.";

    } elseif (stripos($category, "Transporte") !== false &&
    stripos($category, "- Arte") !== false && $activity === "Tau kór 1") {

        $completedText = "bele fó kór ba parte sira hosi autokarru ida.";

    } elseif (stripos($category, "Transporte") !== false &&
    stripos($category, "- Sobu monta") !== false && $activity === "Monta 7") {

        $completedText = "bele tau hamutuk seksaun oin, klaran no kotuk hosi imajen tum tum ida.";

    } elseif (stripos($category, "Ha'u") !== false &&
    stripos($category, "- Lian") !== false && $activity === "activity") {

        $completedText = "bele soletra liafuan simples ho tulun - tema Ha'u nia an";

    } elseif (stripos($category, "Kultura rai") !== false &&
    stripos($category, "- Arte") !== false && $activity === "Sinal ho kór sira 1") {

        $completedText = "bele identifika kór sira ho signifikadu kulturál.";

    }elseif (stripos($category, "Kultura rai") !== false &&
    stripos($category, "- Lian") !== false && $activity === "Soe letra") {

        $completedText = " bele soletra liafuan simples - tema kultura.";

    }elseif (stripos($category, "Kultura rai") !== false &&
    stripos($category, "- Sobu monta") !== false && $activity === "Kultura matimg") {

        $completedText = "bele identifika kór sira ho signifikadu kulturál.";

    }elseif (stripos($category, "Ha'u") !== false &&
    stripos($category, "- Sobu monta") !== false && $activity === "Sírkulu azúl") {

        $completedText = "rezolve puzzle hodi forma sírkulu";

    }elseif (stripos($category, "Ha'u") !== false &&
    stripos($category, "- Sobu monta") !== false && $activity === "Asu ho tinta") {

        $completedText = "bele ordena parte sira husi istória (Asu no pinta azul)";

    }elseif (stripos($category, "Ha'u") !== false &&
    stripos($category, "- Sobu monta") !== false && $activity === "Forma match") {

        $completedText = "bele kombina no tau forma sira uza liman ho diak.";

    }elseif (stripos($category, "Ha'u") !== false &&
    stripos($category, "- Kanta") !== false && $activity === "Mai ita hotu arruma sasán") {

        $completedText = "rona música (Hamoos sala aula)";

    }elseif (stripos($category, "Transporte") !== false &&
    stripos($category, "- Sobu monta") !== false && $activity === "Vizita avo feto") {

        $completedText = "bele ordena parte sira husi istória (Visita Avó)";

    }elseif (stripos($category, "Ha'u") !== false &&
    stripos($category, "- Istoría") !== false && $activity === "Ai-fuan sira-nia sentidu") {

        $completedText = "aprende kona-ba hahalok diak";

    }elseif (stripos($category, "Ha'u") !== false &&
    stripos($category, "- Númeru") !== false && $activity === "Konta liman-fuan") {

        $completedText = "aprende kona-ba konta liman-fuan";

    }elseif (stripos($category, "Ha'u") !== false &&
    stripos($category, "- Númeru") !== false && $activity === "Dezeñu númeru 1 to'o 10") {

        $completedText = "koko hakerek númeru sira";

    }elseif (stripos($category, "Transporte") !== false &&
    stripos($category, "- Númeru") !== false && $activity === "Vizita avo feto finje") {

        $completedText = "bele sekuénsia númeru 1 to'o 3 (Vizita avó feto)";

    }elseif (stripos($category, "Komunidade") !== false &&
    stripos($category, "- Númeru") !== false && $activity === "Barbeq ne'ebé justu") {

        $completedText = "bele halo kuantidade sira hanesan no justu (hahán Barbeq)";

    }elseif (stripos($category, "Komunidade") !== false &&
    stripos($category, "- Númeru") !== false && $activity === "Konta bola ho númeru") {

        $completedText = "bele sekuénsia númeru 1 to'o 3 (Sura bola sira)";

    }elseif (stripos($category, "Komunidade") !== false &&
    stripos($category, "- Sobu monta") !== false && $activity === "Mantein bee-dalan sira moos") {

        $completedText = "bele identifika no soe foer (Tasi-ibun moos)";

    }    elseif (stripos($category, "Kultura rai") !== false &&
    stripos($category, "- Sobu monta") !== false && $activity === "Babebar") {

        $completedText = "bele arranja objetu sira tuir orden medida nian (Borboleta sira)";

    }elseif (stripos($category, "Kultura rai") !== false &&
    stripos($category, "- Istoría") !== false && $activity === "Lafaek") {

        $completedText = "bele ko'alia kona-ba istória ida";

    }elseif (stripos($category, "Komunidade") !== false &&
    stripos($category, "- Númeru") !== false && $activity === "Finje kompras") {

        $completedText = "bele aprezenta osan-besi sira ne'ebé loos (kompras)";

    }elseif (stripos($category, "Selebrasaun") !== false &&
    stripos($category, "- Istoría") !== false && $activity === "Finje kompras") {

        $completedText = "bele identifika selebrasaun família nian balu";

    }elseif (stripos($category, "Esplora") !== false && stripos($category, "- Familia") !== false &&
    stripos($category, "- Arte") !== false && $activity === "Dezeña família") {

        $completedText = "bele dezeña membru família ida";

    }elseif (stripos($category, "Esplora") !== false && stripos($category, "- Saúde ho moris-di'ak") !== false &&
    stripos($category, "- Halimar") !== false && $activity === "Ita-nia sentimentu") {

        $completedText = "bele identifika kontente no triste";

    }elseif (stripos($category, "Esplora") !== false && stripos($category, "- Diverte") !== false &&
    stripos($category, "- Halimar") !== false && $activity === "Soe no simu bola ba fatin") {

        $completedText = "bele halimar jogu bola";

    } elseif (stripos($category, "Selebrasaun") !== false &&
    stripos($category, "- Istoría") !== false && $activity === "Selebrasaun familiár sira") {

        $completedText = "bele identifika selebrasaun família nian balu";

    }elseif (stripos($category, "Ha'u") !== false &&
    stripos($category, "- Lian") !== false && $activity === "a") {

        $completedText = "bele lolos halo lian husi letra 'a'.";

    }elseif (stripos($category, "Ha'u") !== false &&
    stripos($category, "- Lian") !== false && $activity === "s") {

        $completedText = "bele lolos halo lian husi letra 's'.";

    }elseif (stripos($category, "Ha'u") !== false &&
    stripos($category, "- Lian") !== false && $activity === "r") {

        $completedText = "bele lolos halo lian husi letra 'r'.";

    }elseif (stripos($category, "Ha'u") !== false &&
    stripos($category, "- Lian") !== false && $activity === "m") {

        $completedText = "bele lolos halo lian husi letra 'm'.";

    }else $completedText = "Tentadu"; 
    

    $upd = mysqli_prepare($conn,
        "UPDATE activity_result
         SET activity_result = ?
         WHERE id = ?"
    );
    mysqli_stmt_bind_param($upd, "si", $completedText, $row['id']);
    mysqli_stmt_execute($upd);

    echo json_encode([
        "status"  => "ok",
        "message" => "Activity completed",
        "result"  => $completedText
    ]);
    exit;
}

/* ================= CATEGORY1 ================= */
if ($updateTarget === 'category1' && $link !== '') {

    if ($isLocked) {
        $ins = mysqli_prepare($conn,
            "INSERT INTO activity_result
             (pid, sid, status, activity_name, activity_result, category1, category2, category3)
             VALUES (?, ?, 'Tentadu', '', 'Tentadu', '', '', '')"
        );
        mysqli_stmt_bind_param($ins,"ss",$pid,$row['sid']);
        mysqli_stmt_execute($ins);

        $targetId = mysqli_insert_id($conn);
        $current  = '';
    } else {
        $targetId = $activityId;
        $current  = $row['category1'] ?? '';
    }

    $newValue = $current ? ($current . ' - ' . $link) : ($page === 'theme_explore_level_1.html' && $link === 'activity' ? 'Esplora':$link);

    $upd = mysqli_prepare($conn,
        "UPDATE activity_result SET category1=? WHERE id=?"
    );
    mysqli_stmt_bind_param($upd,"si",$newValue,$targetId);
    mysqli_stmt_execute($upd);
}

/* ================= ACTIVITY NAME ================= */
if ($updateTarget === 'activity_name' && $link !== '') {

    // 1️⃣ Look for existing row with same pid, sid, category1, activity_name
    $chk = mysqli_prepare($conn,
        "SELECT id
         FROM activity_result
         WHERE pid = ?
           AND sid = ?
           AND category1 = ?
           AND activity_name = ?
         ORDER BY id ASC
         LIMIT 1"
    );

    mysqli_stmt_bind_param(
        $chk,
        "isss",
        $pid,
        $row['sid'],
        $row['category1'],
        $link
    );

    mysqli_stmt_execute($chk);
    $chkRes = mysqli_stmt_get_result($chk);

    if ($existing = mysqli_fetch_assoc($chkRes)) {

        $existingId = (int)$existing['id'];

        // 2️⃣ Delete the current row
        $del = mysqli_prepare($conn,
            "DELETE FROM activity_result WHERE id = ?"
        );
        mysqli_stmt_bind_param($del, "i", $activityId);
        mysqli_stmt_execute($del);

        // 3️⃣ Switch target to existing row
        $activityId = $existingId;
    }


   // 4️⃣ Update activity_name on the correct row
    if($link === 'Fim de semana nian' || $link === 'Konta liman-fuan' || $link === 'Mantein bee-dalan sira moos'){
    $activityResult ='';
    if ($link === 'Fim de semana nian') {
    $activityResult = 'koko hakerek númeru sira';
}else if($link === 'Konta liman-fuan'){
    $activityResult = 'aprende kona-ba konta liman-fuan';
}else {
    $activityResult = 'bele arranja objetu sira tuir orden medida nian (Borboleta sira)';
}
        // $activityResult ='koko hakerek númeru sira';
        $upd = mysqli_prepare($conn,
        "UPDATE activity_result
         SET activity_name = ?, activity_result = ?
         WHERE id = ?"
    );
    mysqli_stmt_bind_param($upd, "ssi", $link, $activityResult, $activityId);
    mysqli_stmt_execute($upd);
    }else{
        $upd = mysqli_prepare($conn,
            "UPDATE activity_result
            SET activity_name = ?
            WHERE id = ?"
        );
        mysqli_stmt_bind_param($upd, "si", $link, $activityId);
        mysqli_stmt_execute($upd);
    }
}

mysqli_close($conn);

echo json_encode([
    "status"  => "ok",
    "updated" => $updateTarget,
    "link"    => $link,
    "pid"     => $pid,
    "sid"     => $row['sid'] ?? null
]);
exit;