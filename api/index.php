<?php
/**
 * DEYSCOM MOTORSPORT — API propia de la web (sustituye a Google Sheets / Apps Script).
 * Vive en el hosting de IONOS y guarda los datos en una base SQLite fuera de la carpeta pública.
 *
 *  · POST (formulario de la web)           → guarda un lead y avisa por email
 *  · POST (JSON con "api")                 → API privada del CRM (crm.html)
 *  · GET ?action=plazas|juego_inicio|ranking|stock|estado
 *
 * Mismo formato de respuestas que el antiguo Code.gs, así la web y el CRM no cambian.
 */
declare(strict_types=1);
date_default_timezone_set('Europe/Madrid');
header('Content-Type: application/json; charset=utf-8');
header('X-Robots-Tag: noindex, nofollow');
header('Cache-Control: no-store');

const NOTIFY_EMAIL = 'info@deyscom.com';
const MAIL_FROM = 'web@deyscom.com';
const BOOTSTRAP_EMAIL = 'info@deyscom.com';   // el primer acceso al CRM se envía a este buzón
// Administradores autorizados (huella SHA-256 del email, para no publicarlo): pueden pedir su primer acceso
// con «¿Primera vez…?» aunque ya existan otros usuarios. La contraseña solo llega a su buzón.
const ADMIN_EMAIL_HASHES = ['93460ce97f57c69bc8a8fdd609597890acafa7bd4ab6d652e581b19fef764791'];
const CRM_URL = 'https://deyscom.com/crm/';
const WALLAPOP_PROFILE = 'https://es.wallapop.com/user/deyscomm-467502343';
const ESTADOS = ['Nuevo', 'Contactado', 'Presupuesto enviado', 'Negociación', 'Ganado', 'Perdido'];
const EDITABLE = ['estado', 'valor', 'proxima_accion', 'asignado', 'etiquetas', 'edicion', 'envio', 'nombre', 'telefono', 'email', 'servicio', 'vehiculo', 'anio', 'presupuesto', 'plazo', 'mensaje', 'plazas'];
const SESSION_SECONDS = 21600;
const MAX_LOGIN_FAILS = 5;
const STRIPE_SYNC_DAYS = 120;
const GAME = ['MAX_COINS' => 60, 'PAR' => 95, 'MIN_TIME' => 55, 'MAX_TIME' => 900, 'COIN_POINTS' => 100, 'TIME_POINTS' => 60, 'OVERTAKE_POINTS' => 150, 'MAX_OVERTAKES' => 5, 'DIRT_BONUS' => 1.1];
const EMPRESA = ['nombre' => 'DEYSCOM MOTORSPORT, S.L.', 'cif' => 'B09939471', 'direccion' => 'C/ Canal de Isabel II, 2, Nave 3 · 28180 Torrelaguna (Madrid)',
    'telefono' => '(+34) 615 97 22 33', 'email' => 'info@deyscom.com', 'web' => 'deyscom.com'];

/* ---------------- almacenamiento ---------------- */
function data_dir(): string {
    static $dir = null;
    if ($dir !== null) return $dir;
    // 1) fuera de la carpeta pública (junto a /deyscom-web), 2) dentro de api/datos protegida
    foreach ([dirname(__DIR__, 2) . '/deyscom-datos', __DIR__ . '/datos'] as $d) {
        if ((is_dir($d) || @mkdir($d, 0700, true)) && is_writable($d)) { $dir = $d; break; }
    }
    if ($dir === null) throw new RuntimeException('No hay carpeta de datos con permiso de escritura.');
    if (!file_exists("$dir/.htaccess")) @file_put_contents("$dir/.htaccess", "Require all denied\nDeny from all\n");
    return $dir;
}

function db(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;
    $pdo = new PDO('sqlite:' . data_dir() . '/crm.sqlite', null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
    $pdo->exec('PRAGMA busy_timeout = 15000');
    $pdo->exec('PRAGMA journal_mode = WAL');
    $pdo->exec('CREATE TABLE IF NOT EXISTS leads (id TEXT PRIMARY KEY, recibido TEXT, data TEXT)');
    $pdo->exec('CREATE TABLE IF NOT EXISTS actividad (n INTEGER PRIMARY KEY AUTOINCREMENT, lead_id TEXT, fecha TEXT, usuario TEXT, tipo TEXT, texto TEXT)');
    $pdo->exec('CREATE TABLE IF NOT EXISTS ventas (session_id TEXT PRIMARY KEY, data TEXT)');
    $pdo->exec('CREATE TABLE IF NOT EXISTS presupuestos (numero TEXT PRIMARY KEY, data TEXT, html TEXT)');
    $pdo->exec('CREATE TABLE IF NOT EXISTS ranking (n INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT)');
    $pdo->exec('CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT, expira INTEGER)');
    return $pdo;
}

function kv_get(string $k, $def = null) {
    $r = db()->prepare('SELECT v, expira FROM kv WHERE k = ?'); $r->execute([$k]); $row = $r->fetch();
    if (!$row || ($row['expira'] && $row['expira'] < time())) return $def;
    return json_decode($row['v'], true);
}
function kv_set(string $k, $v, int $ttl = 0): void {
    db()->prepare('REPLACE INTO kv (k, v, expira) VALUES (?, ?, ?)')->execute([$k, json_encode($v, JSON_UNESCAPED_UNICODE), $ttl ? time() + $ttl : 0]);
}
function kv_del(string $k): void { db()->prepare('DELETE FROM kv WHERE k = ?')->execute([$k]); }

function config(): array {
    $f = data_dir() . '/config.json';
    return is_file($f) ? (json_decode((string) file_get_contents($f), true) ?: []) : [];
}

/* ---------------- utilidades ---------------- */
function out(array $o): void { echo json_encode($o, JSON_UNESCAPED_UNICODE); exit; }
function uid(int $n = 8): string { return substr(bin2hex(random_bytes(8)), 0, $n); }
function now_iso(): string { return gmdate('Y-m-d\TH:i:s.v\Z'); }
function clean($v): string { return mb_substr(trim(str_replace("\0", '', (string) ($v ?? ''))), 0, 5000); }
function h($t): string { return htmlspecialchars((string) ($t ?? ''), ENT_QUOTES, 'UTF-8'); }
function money($n): string { return number_format((float) $n, 2, ',', '.') . ' €'; }
function num($v): float { return (float) str_replace(',', '.', (string) $v); }

function send_mail($to, string $subject, string $html, string $replyTo = ''): bool {
    $to = is_array($to) ? implode(',', $to) : $to;
    if (!$to) return false;
    $headers = "MIME-Version: 1.0\r\nContent-Type: text/html; charset=UTF-8\r\nFrom: =?UTF-8?B?" . base64_encode('Deyscom Motorsport') . "?= <" . MAIL_FROM . ">\r\n";
    if ($replyTo) $headers .= "Reply-To: $replyTo\r\n";
    return @mail($to, '=?UTF-8?B?' . base64_encode($subject) . '?=', $html, $headers, '-f' . MAIL_FROM);
}

/* ---------------- leads ---------------- */
function lead_get(string $id): ?array {
    $r = db()->prepare('SELECT data FROM leads WHERE id = ?'); $r->execute([$id]); $row = $r->fetch();
    return $row ? json_decode($row['data'], true) : null;
}
function lead_put(array $l): void {
    db()->prepare('REPLACE INTO leads (id, recibido, data) VALUES (?, ?, ?)')->execute([$l['id'], $l['recibido'] ?? '', json_encode($l, JSON_UNESCAPED_UNICODE)]);
}
function leads_all(): array {
    return array_map(fn($r) => json_decode($r['data'], true), db()->query('SELECT data FROM leads ORDER BY recibido')->fetchAll());
}
function log_activity(string $id, ?array $s, string $tipo, string $texto): array {
    $a = ['lead_id' => $id, 'fecha' => now_iso(), 'usuario' => $s['nombre'] ?? 'web', 'tipo' => $tipo, 'texto' => mb_substr($texto, 0, 5000)];
    db()->prepare('INSERT INTO actividad (lead_id, fecha, usuario, tipo, texto) VALUES (?, ?, ?, ?, ?)')->execute(array_values($a));
    return $a;
}
function activity_all(): array {
    return db()->query('SELECT lead_id, fecha, usuario, tipo, texto FROM actividad ORDER BY n DESC LIMIT 3000')->fetchAll();
}

function update_lead(string $id, array $fields, ?array $s): array {
    $l = lead_get($id);
    if (!$l) return ['ok' => false, 'error' => 'Lead no encontrado.'];
    $changes = [];
    foreach (EDITABLE as $k) {
        if (!array_key_exists($k, $fields)) continue;
        $val = clean($fields[$k]);
        if ($k === 'estado' && !in_array($val, ESTADOS, true)) continue;
        if (($l[$k] ?? '') === $val) continue;
        $changes[] = $k === 'estado' ? 'Estado: ' . (($l[$k] ?? '') ?: '—') . ' → ' . $val : $k . ': ' . ($val ?: '—');
        $l[$k] = $val;
    }
    if ($changes) {
        $l['actualizado'] = now_iso();
        lead_put($l);
        $onlyState = isset($fields['estado']) && count($changes) === 1 && str_starts_with($changes[0], 'Estado');
        log_activity($id, $s, $onlyState ? 'estado' : 'edicion', implode(' · ', $changes));
    }
    return ['ok' => true, 'changes' => count($changes)];
}

function create_lead(array $fields, ?array $s): array {
    $p = [];
    foreach (EDITABLE as $k) if (isset($fields[$k])) $p[$k] = clean($fields[$k]);
    if (empty($p['nombre'])) return ['ok' => false, 'error' => 'El nombre es obligatorio.'];
    $p['id'] = uid(); $p['recibido'] = now_iso(); $p['fecha'] = date('d/m/Y, H:i:s'); $p['formulario'] = 'crm-manual';
    $p['estado'] = in_array($p['estado'] ?? '', ESTADOS, true) ? $p['estado'] : 'Nuevo';
    $p['referrer'] = !empty($fields['origen']) ? 'manual:' . clean($fields['origen']) : 'manual';
    lead_put($p);
    log_activity($p['id'], $s, 'creado', 'Lead creado a mano' . (!empty($fields['origen']) ? ' · origen: ' . clean($fields['origen']) : ''));
    return ['ok' => true, 'id' => $p['id']];
}

/* ---------------- formularios de la web ---------------- */
function web_form(array $p): array {
    $l = [];
    foreach ($p as $k => $v) if (preg_match('/^[a-z0-9_]{1,40}$/i', (string) $k) && !is_array($v)) $l[$k] = clean($v);
    if (($l['_hp'] ?? '') !== '') return ['ok' => true];   // robot
    unset($l['_hp']);
    if (($l['formulario'] ?? '') === 'juego-ax') return game_score($l);
    unset($l['token']);
    $webId = $l['id'] ?? '';
    $l['id'] = preg_match('/^w[a-z0-9]{11}$/', $webId) && !lead_get($webId) ? $webId : uid();
    $l['recibido'] = now_iso();
    $l['estado'] = 'Nuevo';
    foreach (['valor', 'proxima_accion', 'asignado', 'actualizado'] as $k) unset($l[$k]);
    lead_put($l);
    if (NOTIFY_EMAIL) {
        $rows = '';
        foreach ($l as $k => $v) if ($v !== '' && !in_array($k, ['recibido', 'estado'], true)) $rows .= '<tr><td style="padding:4px 10px 4px 0;color:#777">' . h($k) . '</td><td style="padding:4px 0"><b>' . nl2br(h($v)) . '</b></td></tr>';
        send_mail(NOTIFY_EMAIL, '🏁 Nuevo lead web · ' . ($l['servicio'] ?? $l['formulario'] ?? 'Contacto') . ' · ' . ($l['nombre'] ?? ''),
            '<div style="font-family:Arial,sans-serif"><table>' . $rows . '</table><p><a href="' . CRM_URL . '">Abrir el CRM</a></p></div>', $l['email'] ?? '');
    }
    return ['ok' => true];
}

/* ---------------- usuarios y sesiones ---------------- */
function users(): array { return kv_get('users', []); }
function save_users(array $u): void { kv_set('users', $u); }
function make_user(string $nombre, string $rol, string $pass): array {
    return ['nombre' => $nombre, 'rol' => $rol === 'admin' ? 'admin' : 'cliente', 'hash' => password_hash($pass, PASSWORD_DEFAULT), 'activo' => true, 'creado' => now_iso()];
}
function random_password(): string {
    $chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'; $o = '';
    for ($i = 0; $i < 14; $i++) $o .= $chars[random_int(0, strlen($chars) - 1)];
    return substr($o, 0, 4) . '-' . substr($o, 4, 5) . '-' . substr($o, 9, 5);
}

function login(array $req): array {
    $email = strtolower(trim((string) ($req['email'] ?? '')));
    $fails = (int) kv_get('fail_' . $email, 0);
    if ($fails >= MAX_LOGIN_FAILS) return ['ok' => false, 'error' => 'Demasiados intentos. Espera 15 minutos y vuelve a probar.'];
    $all = users(); $u = $all[$email] ?? null; $pass = (string) ($req['password'] ?? '');
    // contraseña enviada por «He olvidado mi contraseña»: vale 24 h y sustituye a la anterior al usarla
    if ($u && $u['activo'] && !empty($u['pending']) && ($u['pending_exp'] ?? 0) > time() && password_verify($pass, $u['pending'])) {
        $u['hash'] = $u['pending']; unset($u['pending'], $u['pending_exp']); $all[$email] = $u; save_users($all);
    }
    if (!$u || !$u['activo'] || !password_verify($pass, $u['hash'])) {
        kv_set('fail_' . $email, $fails + 1, 900); usleep(600000);
        return ['ok' => false, 'error' => 'Email o contraseña incorrectos.'];
    }
    kv_del('fail_' . $email);
    $token = bin2hex(random_bytes(24));
    $s = ['email' => $email, 'nombre' => $u['nombre'], 'rol' => $u['rol']];
    kv_set('tok_' . hash('sha256', $token), $s, SESSION_SECONDS);
    return ['ok' => true, 'token' => $token, 'user' => $s];
}
function session(?string $token): ?array {
    if (!$token) return null;
    $k = 'tok_' . hash('sha256', $token);
    $s = kv_get($k);
    if (!$s) return null;
    $u = users()[$s['email']] ?? null;
    if (!$u || !$u['activo']) { kv_del($k); return null; }
    $s['rol'] = $u['rol']; $s['nombre'] = $u['nombre'];
    kv_set($k, $s, SESSION_SECONDS);
    return $s;
}

/** «Primer acceso / he olvidado la contraseña»: la contraseña nueva solo llega al email del usuario. */
function recover(array $req): array {
    $email = strtolower(trim((string) ($req['email'] ?? '')));
    $msg = ['ok' => true, 'message' => 'Si ese email tiene acceso al CRM, acabamos de enviarle una contraseña nueva. Revisa también la carpeta de spam.'];
    if (!preg_match('/^[^@\s]+@[^@\s]+\.[^@\s]+$/', $email)) return ['ok' => false, 'error' => 'Escribe un email válido.'];
    if (kv_get('rec_' . $email)) return $msg;                          // como mucho un envío cada 10 minutos
    kv_set('rec_' . $email, 1, 600);
    $all = users();
    $first = (!$all && $email === BOOTSTRAP_EMAIL) || (!isset($all[$email]) && in_array(hash('sha256', $email), ADMIN_EMAIL_HASHES, true));
    if (!$first && empty($all[$email]['activo'])) return $msg;
    $pass = random_password();
    if ($first) $all[$email] = make_user($email === BOOTSTRAP_EMAIL ? 'Deyscom Motorsport' : 'Administrador', 'admin', $pass);
    else { $all[$email]['pending'] = password_hash($pass, PASSWORD_DEFAULT); $all[$email]['pending_exp'] = time() + 86400; }
    save_users($all);
    send_mail($email, 'Tu acceso al CRM de Deyscom Motorsport',
        '<div style="font-family:Arial,sans-serif;max-width:560px"><h2 style="border-bottom:3px solid #ff66c4;padding-bottom:6px">Acceso al CRM</h2>' .
        '<p>Email: <b>' . h($email) . '</b><br>Contraseña: <b style="font-family:monospace;font-size:16px">' . h($pass) . '</b></p>' .
        '<p><a href="' . CRM_URL . '" style="background:#ff66c4;color:#000;padding:10px 16px;text-decoration:none;font-weight:bold">Entrar en el CRM</a></p>' .
        '<p style="color:#777;font-size:12px">Puedes cambiarla desde «Mi cuenta». Si no has pedido este email, ignóralo: tu contraseña de siempre sigue funcionando.</p></div>');
    return $msg;
}

function api(array $req): array {
    $a = $req['api'] ?? '';
    if ($a === 'login') return login($req);
    if ($a === 'recover') return recover($req);
    $s = session($req['token'] ?? null);
    if (!$s) return ['ok' => false, 'error' => 'auth'];
    $admin = $s['rol'] === 'admin';
    switch ($a) {
        case 'me': return ['ok' => true, 'user' => $s];
        case 'logout': kv_del('tok_' . hash('sha256', (string) $req['token'])); return ['ok' => true];
        case 'leads':
            maybe_sync_stripe();
            $leads = leads_all();
            return ['ok' => true, 'user' => $s, 'estados' => ESTADOS, 'leads' => $leads, 'activity' => array_reverse(activity_all()), 'ediciones' => editions($leads),
                'presupuestos' => quotes_all(), 'ventas' => sales_all(), 'stripe' => (bool) stripe_key()];
        case 'update': return update_lead((string) ($req['id'] ?? ''), (array) ($req['fields'] ?? []), $s);
        case 'note':
            $t = trim((string) ($req['text'] ?? ''));
            if ($t === '') return ['ok' => false, 'error' => 'La nota está vacía.'];
            if (!lead_get((string) $req['id'])) return ['ok' => false, 'error' => 'Lead no encontrado.'];
            return ['ok' => true, 'activity' => log_activity((string) $req['id'], $s, 'nota', $t)];
        case 'create': return create_lead((array) ($req['fields'] ?? []), $s);
        case 'delete':
            if (!$admin) return ['ok' => false, 'error' => 'Solo el administrador puede borrar leads.'];
            if (!lead_get((string) $req['id'])) return ['ok' => false, 'error' => 'Lead no encontrado.'];
            db()->prepare('DELETE FROM leads WHERE id = ?')->execute([(string) $req['id']]);
            log_activity((string) $req['id'], $s, 'borrado', 'Lead borrado');
            return ['ok' => true];
        case 'password':
            $all = users(); $u = $all[$s['email']] ?? null;
            if (!$u || !password_verify((string) ($req['current'] ?? ''), $u['hash'])) return ['ok' => false, 'error' => 'La contraseña actual no es correcta.'];
            if (mb_strlen((string) ($req['next'] ?? '')) < 10) return ['ok' => false, 'error' => 'La nueva contraseña debe tener al menos 10 caracteres.'];
            $all[$s['email']]['hash'] = password_hash((string) $req['next'], PASSWORD_DEFAULT); save_users($all);
            return ['ok' => true];
        case 'users':
            if (!$admin) return ['ok' => false, 'error' => 'Solo para administradores.'];
            return ['ok' => true, 'users' => array_map(fn($k, $u) => ['email' => $k, 'nombre' => $u['nombre'], 'rol' => $u['rol'], 'activo' => $u['activo']], array_keys(users()), users())];
        case 'resetUser':
            if (!$admin) return ['ok' => false, 'error' => 'Solo para administradores.'];
            $email = strtolower(trim((string) ($req['email'] ?? '')));
            if (!preg_match('/^[^@\s]+@[^@\s]+\.[^@\s]+$/', $email)) return ['ok' => false, 'error' => 'Email no válido.'];
            $all = users(); $prev = $all[$email] ?? null; $pass = random_password();
            $all[$email] = make_user((string) ($req['nombre'] ?? '') ?: ($prev['nombre'] ?? $email), (string) ($req['rol'] ?? '') ?: ($prev['rol'] ?? 'cliente'), $pass);
            if (($req['activo'] ?? true) === false) $all[$email]['activo'] = false;
            save_users($all);
            return ['ok' => true, 'email' => $email, 'password' => $pass];
        case 'syncStripe': return sync_stripe();
        case 'quote': return create_quote($req, $s);
        case 'quotePdf':
            $r = db()->prepare('SELECT html FROM presupuestos WHERE numero = ?'); $r->execute([(string) $req['numero']]); $row = $r->fetch();
            return $row ? ['ok' => true, 'numero' => $req['numero'], 'html' => $row['html']] : ['ok' => false, 'error' => 'Presupuesto no encontrado.'];
        case 'quoteStatus': return quote_status((string) $req['numero'], (string) $req['estado'], $s);
        case 'digest': return ['ok' => true, 'sent' => daily_digest(true)];
    }
    return ['ok' => false, 'error' => 'Acción no válida'];
}

/* ---------------- fechas y plazas de las experiencias ---------------- */
function site_editions(): array {
    $f = dirname(__DIR__) . '/ediciones.json';
    return is_file($f) ? (json_decode((string) file_get_contents($f), true)['ediciones'] ?? []) : [];
}
function editions(?array $leads = null): array {
    $taken = [];
    foreach ($leads ?? leads_all() as $l) {
        if (empty($l['edicion']) || ($l['estado'] ?? '') !== 'Ganado') continue;
        $n = (int) ($l['plazas'] ?? 1); $taken[$l['edicion']] = ($taken[$l['edicion']] ?? 0) + max(1, $n);
    }
    return array_map(function ($e) use ($taken) { $e['ocupadas'] = $taken[$e['id']] ?? 0; return $e; }, site_editions());
}
function public_editions(?string $exp): array {
    $today = date('Y-m-d'); $out = [];
    foreach (editions() as $r) {
        if (($exp && $r['experiencia'] !== $exp) || ($r['estado'] ?? '') === 'Cancelada' || $r['fecha'] < $today) continue;
        $plazas = (int) ($r['plazas'] ?? 0); $libres = $plazas ? max(0, $plazas - $r['ocupadas']) : null;
        $out[] = ['id' => $r['id'], 'experiencia' => $r['experiencia'], 'fecha' => $r['fecha'], 'turno' => $r['turno'] ?? '', 'plazas' => $plazas, 'libres' => $libres,
            'completa' => ($r['estado'] ?? '') === 'Completa' || $libres === 0];
    }
    return $out;
}

/* ---------------- ventas de Stripe ---------------- */
function stripe_key(): string { return (string) (config()['stripe_key'] ?? ''); }
function sales_all(): array { return array_map(fn($r) => json_decode($r['data'], true), db()->query('SELECT data FROM ventas')->fetchAll()); }
function stripe_get(string $path, array $params = []): array {
    $ch = curl_init('https://api.stripe.com/v1/' . $path . ($params ? '?' . http_build_query($params) : ''));
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 25, CURLOPT_HTTPHEADER => ['Authorization: Bearer ' . stripe_key()]]);
    $body = (string) curl_exec($ch); $code = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
    $d = json_decode($body, true) ?: [];
    if ($code !== 200) throw new RuntimeException('Stripe ' . $code . ': ' . ($d['error']['message'] ?? ''));
    return $d;
}
function stripe_list(string $path, array $params = []): array {
    $out = []; $after = '';
    for ($i = 0; $i < 20; $i++) {
        $p = $params + ['limit' => 100]; if ($after) $p['starting_after'] = $after;
        $d = stripe_get($path, $p); $out = array_merge($out, $d['data'] ?? []);
        if (empty($d['has_more']) || empty($d['data'])) break;
        $after = end($d['data'])['id'];
    }
    return $out;
}
function maybe_sync_stripe(): void {
    if (!stripe_key() || kv_get('stripe_recent')) return;
    kv_set('stripe_recent', 1, 900);
    try { sync_stripe(); } catch (Throwable $e) { /* se reintenta en 15 min */ }
}
function sync_stripe(): array {
    if (!stripe_key()) return ['ok' => false, 'error' => 'Stripe aún no está conectado: falta la clave (README → Ventas con Stripe).'];
    $eds = site_editions(); $byUrl = []; $count = []; $byId = [];
    foreach ($eds as $e) { $byId[$e['id']] = $e; if (empty($e['stripe'])) continue; $u = rtrim(explode('?', $e['stripe'])[0], '/'); $count[$u] = ($count[$u] ?? 0) + 1; $byUrl[$u] = $e; }
    foreach ($count as $u => $n) if ($n > 1) unset($byUrl[$u]);
    $linkEd = [];
    foreach (stripe_list('payment_links') as $pl) { $e = $byUrl[rtrim((string) $pl['url'], '/')] ?? null; if ($e) $linkEd[$pl['id']] = $e; }
    $sessions = stripe_list('checkout/sessions', ['status' => 'complete', 'created[gte]' => time() - STRIPE_SYNC_DAYS * 86400]);
    $known = []; foreach (sales_all() as $v) $known[$v['session_id']] = 1;
    $sys = ['nombre' => 'Stripe']; $nuevas = [];
    foreach ($sessions as $cs) {
        if (isset($known[$cs['id']]) || !in_array($cs['payment_status'] ?? '', ['paid', 'no_payment_required'], true)) continue;
        $importe = ($cs['amount_total'] ?? 0) / 100; $cd = $cs['customer_details'] ?? [];
        $leadId = !empty($cs['client_reference_id']) && lead_get($cs['client_reference_id']) ? $cs['client_reference_id'] : '';
        $lead = $leadId ? lead_get($leadId) : null;
        $ed = ($lead && isset($byId[$lead['edicion'] ?? ''])) ? $byId[$lead['edicion']] : ($linkEd[$cs['payment_link'] ?? ''] ?? null);
        $plazas = $ed && (float) $ed['precio'] ? max(1, (int) round($importe / (float) $ed['precio'])) : 1;
        $fields = ['estado' => 'Ganado', 'valor' => (string) $importe, 'plazas' => (string) $plazas];
        if ($ed) $fields['edicion'] = $ed['id'];
        if (!$lead) $leadId = create_lead(['nombre' => $cd['name'] ?? $cd['email'] ?? 'Cliente Stripe', 'email' => $cd['email'] ?? '', 'telefono' => $cd['phone'] ?? '', 'servicio' => $ed['nombre'] ?? 'Pago Stripe', 'origen' => 'Stripe'], $sys)['id'];
        update_lead($leadId, $fields, $sys);
        $v = ['session_id' => $cs['id'], 'fecha' => gmdate('c', (int) $cs['created']), 'cliente' => $cd['name'] ?? ($lead['nombre'] ?? ''), 'email' => $cd['email'] ?? '',
            'telefono' => $cd['phone'] ?? ($lead['telefono'] ?? ''), 'importe' => $importe, 'moneda' => strtoupper($cs['currency'] ?? 'eur'), 'plazas' => $plazas,
            'edicion' => $ed['id'] ?? '', 'experiencia' => $ed['nombre'] ?? '', 'fecha_edicion' => $ed['etiqueta'] ?? '', 'lead_id' => $leadId, 'payment_link' => $cs['payment_link'] ?? '', 'estado' => 'Pagado'];
        db()->prepare('INSERT OR IGNORE INTO ventas (session_id, data) VALUES (?, ?)')->execute([$cs['id'], json_encode($v, JSON_UNESCAPED_UNICODE)]);
        log_activity($leadId, $sys, 'pago', 'Pago recibido en Stripe: ' . money($importe) . ($ed ? ' · ' . $ed['nombre'] . ' · ' . $ed['etiqueta'] : '') . ' · ' . $plazas . ($plazas === 1 ? ' plaza' : ' plazas'));
        $nuevas[] = '<li><b>' . h($v['cliente'] ?: $v['email']) . '</b> · ' . money($importe) . ($ed ? ' · ' . h($ed['nombre'] . ' · ' . $ed['etiqueta']) : '') . '</li>';
    }
    if ($nuevas) send_mail(NOTIFY_EMAIL, '💳 ' . count($nuevas) . (count($nuevas) === 1 ? ' venta nueva' : ' ventas nuevas') . ' en Stripe', '<ul>' . implode('', $nuevas) . '</ul><p><a href="' . CRM_URL . '">Ver en el CRM</a></p>');
    return ['ok' => true, 'nuevas' => count($nuevas), 'revisadas' => count($sessions)];
}

/* ---------------- presupuestos ---------------- */
function quotes_all(): array { return array_map(fn($r) => json_decode($r['data'], true), db()->query('SELECT data FROM presupuestos ORDER BY numero')->fetchAll()); }
function quote_html(array $q): string {
    $rows = '';
    foreach ($q['lineas'] as $l) $rows .= '<tr><td>' . h($l['concepto']) . '</td><td class="n">' . h($l['cantidad']) . '</td><td class="n">' . money($l['precio']) . '</td><td class="n">' . money($l['cantidad'] * $l['precio']) . '</td></tr>';
    $e = EMPRESA;
    return '<html><head><meta charset="utf-8"><title>Presupuesto ' . h($q['numero']) . '</title><style>body{font-family:Arial,Helvetica,sans-serif;color:#111;font-size:11pt;margin:24px}' .
        '.top{border-bottom:4px solid #ff66c4;padding-bottom:12px;margin-bottom:18px}.brand{font-size:24pt;font-weight:bold;font-style:italic;letter-spacing:1px}.brand span{color:#ff66c4}' .
        '.small{font-size:9pt;color:#555}h1{font-size:16pt;margin:0 0 4px}table{width:100%;border-collapse:collapse}th{background:#111;color:#fff;text-align:left;padding:7px;font-size:9pt}' .
        'td{padding:7px;border-bottom:1px solid #ddd;vertical-align:top}.n{text-align:right;white-space:nowrap}.tot td{border:0;padding:4px 7px}.tot .big td{font-size:14pt;font-weight:bold;border-top:2px solid #111}' .
        '.box{background:#f6f6f6;padding:10px;margin-top:16px;font-size:9.5pt}</style></head><body>' .
        '<table class="top"><tr><td><div class="brand">DEYS<span>COM</span> MOTORSPORT</div><div class="small">' . h($e['nombre']) . ' · CIF ' . $e['cif'] . '<br>' . h($e['direccion']) . '<br>' .
        $e['telefono'] . ' · ' . $e['email'] . ' · ' . $e['web'] . '</div></td><td class="n"><h1>PRESUPUESTO</h1><b>' . h($q['numero']) . '</b><br><span class="small">Fecha: ' . h($q['fechaTxt']) .
        '<br>Válido hasta: ' . h($q['validezTxt']) . '</span></td></tr></table>' .
        '<p><b>Cliente:</b> ' . h($q['cliente']) . ($q['email'] ? ' · ' . h($q['email']) : '') . ($q['telefono'] ? ' · ' . h($q['telefono']) : '') .
        ($q['vehiculo'] ? '<br><b>Vehículo:</b> ' . h($q['vehiculo']) : '') . ($q['servicio'] ? '<br><b>Servicio:</b> ' . h($q['servicio']) : '') . '</p>' .
        '<table><tr><th>Concepto</th><th class="n">Cant.</th><th class="n">Precio</th><th class="n">Importe</th></tr>' . $rows . '</table>' .
        '<table class="tot" style="width:45%;margin-left:55%;margin-top:10px"><tr><td>Base imponible</td><td class="n">' . money($q['base']) . '</td></tr><tr><td>IVA (' . $q['ivaPct'] . '%)</td><td class="n">' .
        money($q['iva']) . '</td></tr><tr class="big"><td>Total</td><td class="n">' . money($q['total']) . '</td></tr></table>' .
        ($q['notas'] ? '<div class="box"><b>Observaciones</b><br>' . nl2br(h($q['notas'])) . '</div>' : '') .
        '<p class="small" style="margin-top:22px">Presupuesto sin compromiso. Los trabajos no previstos que aparezcan durante la reparación se comunicarán y presupuestarán antes de realizarse. ' .
        'Para aceptarlo, responde a este email o escríbenos al ' . $e['telefono'] . '.</p></body></html>';
}
function create_quote(array $req, array $s): array {
    $lead = lead_get((string) ($req['lead_id'] ?? ''));
    if (!$lead) return ['ok' => false, 'error' => 'Lead no encontrado.'];
    $lineas = [];
    foreach ((array) ($req['lineas'] ?? []) as $l) {
        $x = ['concepto' => mb_substr((string) ($l['concepto'] ?? ''), 0, 300), 'cantidad' => (float) ($l['cantidad'] ?? 0), 'precio' => (float) ($l['precio'] ?? 0)];
        if ($x['concepto'] !== '' && $x['cantidad']) $lineas[] = $x;
    }
    if (!$lineas) return ['ok' => false, 'error' => 'Añade al menos una línea.'];
    $ivaPct = isset($req['iva']) ? (float) $req['iva'] : 21;
    $base = array_sum(array_map(fn($l) => $l['cantidad'] * $l['precio'], $lineas));
    $iva = round($base * $ivaPct) / 100; $total = round($base + $iva, 2);
    $dias = (int) ($req['validez'] ?? 30) ?: 30; $vence = time() + $dias * 86400;
    $year = date('Y'); $max = 0;
    foreach (quotes_all() as $q0) if (preg_match('/^P-(\d{4})-(\d+)$/', (string) $q0['numero'], $m) && $m[1] === $year) $max = max($max, (int) $m[2]);
    $q = ['numero' => sprintf('P-%s-%03d', $year, $max + 1), 'cliente' => $lead['nombre'] ?? '', 'email' => ($req['email'] ?? '') ?: ($lead['email'] ?? ''), 'telefono' => $lead['telefono'] ?? '',
        'vehiculo' => $lead['vehiculo'] ?? '', 'servicio' => $lead['servicio'] ?? '', 'lineas' => $lineas, 'base' => $base, 'iva' => $iva, 'total' => $total, 'ivaPct' => $ivaPct,
        'notas' => (string) ($req['notas'] ?? ''), 'fechaTxt' => date('d/m/Y'), 'validezTxt' => date('d/m/Y', $vence)];
    $html = quote_html($q);
    $sent = false;
    if (!empty($req['enviar']) && $q['email']) {
        $first = explode(' ', (string) ($lead['nombre'] ?? ''))[0];
        $sent = send_mail($q['email'], 'Presupuesto ' . $q['numero'] . ' · Deyscom Motorsport',
            '<p>Hola ' . h($first) . ',</p><p>Te enviamos el presupuesto que nos pediste' . (!empty($lead['servicio']) ? ' para <b>' . h($lead['servicio']) . '</b>' : '') . '.</p>' .
            '<p>Total: <b>' . money($total) . '</b> (IVA incluido). Válido hasta el ' . $q['validezTxt'] . '.</p><p>Cualquier duda, responde a este email o escríbenos por WhatsApp al ' . EMPRESA['telefono'] .
            '.</p><p>¡Un saludo!<br><b>Deyscom Motorsport</b></p><hr>' . preg_replace('~^.*<body>|</body>.*$~s', '', $html), EMPRESA['email']);
    }
    $row = ['numero' => $q['numero'], 'lead_id' => $lead['id'], 'fecha' => date('Y-m-d'), 'cliente' => $q['cliente'], 'email' => $q['email'], 'lineas' => json_encode($lineas, JSON_UNESCAPED_UNICODE),
        'base' => $base, 'iva' => $iva, 'total' => $total, 'validez' => date('Y-m-d', $vence), 'notas' => $q['notas'], 'estado' => $sent ? 'Enviado' : 'Creado', 'pdf_id' => '', 'usuario' => $s['nombre']];
    db()->prepare('INSERT INTO presupuestos (numero, data, html) VALUES (?, ?, ?)')->execute([$q['numero'], json_encode($row, JSON_UNESCAPED_UNICODE), $html]);
    $upd = ['valor' => (string) $total];
    if (in_array($lead['estado'] ?? '', ['Nuevo', 'Contactado'], true)) $upd['estado'] = 'Presupuesto enviado';
    update_lead($lead['id'], $upd, $s);
    log_activity($lead['id'], $s, 'presupuesto', 'Presupuesto ' . $q['numero'] . ' · ' . money($total) . ($sent ? ' · enviado a ' . $q['email'] : ''));
    return ['ok' => true, 'numero' => $q['numero'], 'total' => $total, 'sent' => $sent, 'html' => $html];
}
function quote_status(string $numero, string $estado, array $s): array {
    if (!in_array($estado, ['Creado', 'Enviado', 'Aceptado', 'Rechazado'], true)) return ['ok' => false, 'error' => 'Estado no válido.'];
    $r = db()->prepare('SELECT data FROM presupuestos WHERE numero = ?'); $r->execute([$numero]); $row = $r->fetch();
    if (!$row) return ['ok' => false, 'error' => 'Presupuesto no encontrado.'];
    $q = json_decode($row['data'], true); $q['estado'] = $estado;
    db()->prepare('UPDATE presupuestos SET data = ? WHERE numero = ?')->execute([json_encode($q, JSON_UNESCAPED_UNICODE), $numero]);
    log_activity($q['lead_id'], $s, 'presupuesto', 'Presupuesto ' . $numero . ' → ' . $estado);
    if ($estado === 'Aceptado') update_lead($q['lead_id'], ['estado' => 'Ganado', 'valor' => (string) $q['total']], $s);
    return ['ok' => true];
}

/* ---------------- emails automáticos (se lanzan solos con las visitas a la web) ---------------- */
function recipients(): array {
    $list = [];
    foreach (users() as $k => $u) if ($u['activo'] && !str_contains($k, '@ejemplo.com')) $list[] = $k;
    if (NOTIFY_EMAIL && !in_array(NOTIFY_EMAIL, $list, true)) $list[] = NOTIFY_EMAIL;
    return $list;
}
function lead_time(array $l): int { $t = strtotime((string) ($l['recibido'] ?? '')); return $t ?: 0; }
function lead_line(array $l, string $extra = ''): string {
    return '<li><b>' . h(($l['nombre'] ?? '') ?: 'Sin nombre') . '</b> · ' . h($l['servicio'] ?? $l['formulario'] ?? '') . (!empty($l['telefono']) ? ' · ' . h($l['telefono']) : '') . ($extra ? ' · ' . $extra : '') . '</li>';
}
function daily_digest(bool $force = false): bool {
    $leads = leads_all(); $today = date('Y-m-d'); $since = time() - 86400;
    $nuevos = array_filter($leads, fn($l) => lead_time($l) >= $since);
    $sin = array_filter($leads, fn($l) => ($l['estado'] ?? '') === 'Nuevo' && lead_time($l) < $since);
    $abiertos = array_filter($leads, fn($l) => !in_array($l['estado'] ?? '', ['Ganado', 'Perdido'], true) && preg_match('/^\d{4}-\d{2}-\d{2}$/', (string) ($l['proxima_accion'] ?? '')));
    $hoy = array_filter($abiertos, fn($l) => $l['proxima_accion'] === $today);
    $tarde = array_filter($abiertos, fn($l) => $l['proxima_accion'] < $today);
    $ventas = array_filter(sales_all(), fn($v) => strtotime((string) $v['fecha']) >= $since);
    if (!$force && !$nuevos && !$hoy && !$tarde && !$sin && !$ventas) return false;
    $sec = function ($t, $arr, $fn) { return $arr ? '<h3 style="margin:18px 0 6px">' . $t . ' (' . count($arr) . ')</h3><ul>' . implode('', array_map($fn, array_slice(array_values($arr), 0, 25))) . '</ul>' : ''; };
    $html = '<div style="font-family:Arial,sans-serif;max-width:620px"><h2 style="border-bottom:3px solid #ff66c4;padding-bottom:6px">Resumen del día · Deyscom Motorsport</h2>' .
        $sec('💳 Ventas (24 h)', $ventas, fn($v) => '<li><b>' . h($v['cliente']) . '</b> · ' . money($v['importe']) . ' · ' . h($v['experiencia'] . ' ' . $v['fecha_edicion']) . '</li>') .
        $sec('🆕 Leads nuevos (24 h)', $nuevos, fn($l) => lead_line($l)) .
        $sec('📅 Llamadas para hoy', $hoy, fn($l) => lead_line($l, h($l['estado'] ?? ''))) .
        $sec('⚠️ Atrasadas', $tarde, fn($l) => lead_line($l, 'desde ' . $l['proxima_accion'])) .
        $sec('⏳ Siguen sin contactar', $sin, fn($l) => lead_line($l)) .
        (($nuevos || $hoy || $tarde || $sin) ? '' : '<p>Todo al día. 🏁</p>') .
        '<p style="margin-top:22px"><a href="' . CRM_URL . '" style="background:#ff66c4;color:#000;padding:10px 16px;text-decoration:none;font-weight:bold">Abrir el CRM</a></p></div>';
    return send_mail(recipients(), '🏁 Resumen del día: ' . count($nuevos) . ' nuevos · ' . (count($hoy) + count($tarde)) . ' llamadas pendientes', $html);
}
function origin_name(array $l): string {
    $ref = strtolower((string) ($l['referrer'] ?? ''));
    if (($l['formulario'] ?? '') === 'crm-manual' || str_starts_with($ref, 'manual')) return 'Manual';
    if (!empty($l['gclid'])) return 'Google Ads';
    if (!empty($l['fbclid'])) return 'Meta Ads';
    if (!empty($l['utm_source'])) return $l['utm_source'];
    foreach (['google' => 'Google orgánico', 'bing' => 'Bing', 'instagram' => 'Instagram', 'facebook' => 'Facebook', 'tiktok' => 'TikTok', 'youtube' => 'YouTube',
        'chatgpt' => 'ChatGPT', 'openai' => 'ChatGPT', 'perplexity' => 'Perplexity', 'wallapop' => 'Wallapop'] as $k => $n) if (str_contains($ref, $k)) return $n;
    return $ref ? 'Otras webs' : 'Directo';
}
function monthly_report(): void {
    $start = strtotime(date('Y-m-01') . ' -1 month'); $end = strtotime(date('Y-m-01'));
    $meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    $mes = $meses[(int) date('n', $start) - 1] . ' ' . date('Y', $start);
    $leads = array_filter(leads_all(), fn($l) => lead_time($l) >= $start && lead_time($l) < $end);
    $table = function ($fn) use ($leads) {
        $o = [];
        foreach ($leads as $l) { $k = $fn($l); $o[$k] ??= ['n' => 0, 'g' => 0, 'v' => 0]; $o[$k]['n']++; if (($l['estado'] ?? '') === 'Ganado') { $o[$k]['g']++; $o[$k]['v'] += num($l['valor'] ?? 0); } }
        uasort($o, fn($a, $b) => $b['n'] <=> $a['n']);
        $rows = '';
        foreach ($o as $k => $x) $rows .= '<tr><td style="padding:6px;border-bottom:1px solid #ddd">' . h($k) . '</td><td align="center">' . $x['n'] . '</td><td align="center">' . $x['g'] . '</td><td align="center">' . round($x['g'] / $x['n'] * 100) . '%</td><td align="right" style="padding:6px">' . money($x['v']) . '</td></tr>';
        return '<table style="border-collapse:collapse;width:100%"><tr style="background:#111;color:#fff"><th align="left" style="padding:6px">Canal</th><th>Leads</th><th>Ganados</th><th>Conversión</th><th align="right" style="padding:6px">Valor ganado</th></tr>' . $rows . '</table>';
    };
    $won = array_filter($leads, fn($l) => ($l['estado'] ?? '') === 'Ganado');
    $html = '<div style="font-family:Arial,sans-serif;max-width:680px"><h2 style="border-bottom:3px solid #ff66c4;padding-bottom:6px">Informe de ' . $mes . ' · Deyscom Motorsport</h2>' .
        '<p><b>' . count($leads) . '</b> leads · <b>' . count($won) . '</b> ganados · <b>' . money(array_sum(array_map(fn($l) => num($l['valor'] ?? 0), $won))) . '</b> de valor ganado.</p>' .
        '<h3>Por canal</h3>' . $table('origin_name') . '<h3>Por servicio</h3>' . $table(fn($l) => ($l['servicio'] ?? '') ?: ($l['formulario'] ?? 'Sin servicio')) .
        '<p style="margin-top:22px"><a href="' . CRM_URL . '">Abrir el CRM</a></p></div>';
    send_mail(recipients(), '📊 Informe de ' . $mes . ': ' . count($leads) . ' leads, ' . count($won) . ' ganados', $html);
}
/** Sin cron: la primera visita después de las 08:00 envía el resumen del día (y el día 1, el informe del mes). */
function scheduled_jobs(): void {
    if ((int) date('G') < 8 || !users()) return;
    $today = date('Y-m-d');
    if (kv_get('digest_day') !== $today) { kv_set('digest_day', $today); try { daily_digest(); } catch (Throwable $e) {} }
    $month = date('Y-m');
    if (kv_get('report_month') !== $month) { kv_set('report_month', $month); try { monthly_report(); } catch (Throwable $e) {} }
}

/* ---------------- juego AX Rally ---------------- */
function game_points(int $monedas, float $tiempo, string $sup, int $adel): int {
    $base = $monedas * GAME['COIN_POINTS'] + max(0, (int) round((GAME['PAR'] - $tiempo) * GAME['TIME_POINTS'])) + min(GAME['MAX_OVERTAKES'], $adel) * GAME['OVERTAKE_POINTS'];
    return (int) round($base * ($sup === 'tierra' ? GAME['DIRT_BONUS'] : 1));
}
function game_start(): array { $t = uid(20); kv_set('jg_' . $t, microtime(true), 7200); return ['ok' => true, 'token' => $t]; }
function game_ranking(): array {
    $best = []; $total = 0;
    foreach (db()->query('SELECT data FROM ranking')->fetchAll() as $r) {
        $x = json_decode($r['data'], true);
        if (($x['valida'] ?? '') !== 'sí') continue;
        $total++; $k = strtolower(($x['email'] ?? '') ?: $x['alias']);
        if (!isset($best[$k]) || $x['puntos'] > $best[$k]['puntos']) $best[$k] = ['alias' => mb_substr($x['alias'], 0, 18), 'puntos' => $x['puntos'], 'circuito' => $x['circuito'], 'superficie' => $x['superficie'], 'tiempo' => $x['tiempo']];
    }
    $list = array_values($best);
    usort($list, fn($a, $b) => $b['puntos'] <=> $a['puntos'] ?: $a['tiempo'] <=> $b['tiempo']);
    return ['ok' => true, 'jugadores' => count($list), 'partidas' => $total, 'top' => array_slice($list, 0, 20)];
}
function game_score(array $p): array {
    $token = (string) ($p['token'] ?? ''); $started = (float) kv_get('jg_' . $token, 0);
    $monedas = (int) floor((float) ($p['monedas'] ?? 0)); $tiempo = (float) ($p['tiempo'] ?? 0); $sup = ($p['superficie'] ?? '') === 'tierra' ? 'tierra' : 'asfalto';
    $adel = (int) floor((float) ($p['adelantamientos'] ?? 0));
    $alias = mb_substr(trim(preg_replace('/[<>"\']/', '', (string) (($p['alias'] ?? '') ?: ($p['nombre'] ?? 'Piloto')))), 0, 18) ?: 'Piloto';
    $email = mb_substr(strtolower(trim((string) ($p['email'] ?? ''))), 0, 120);
    $valid = $started && $monedas >= 0 && $monedas <= GAME['MAX_COINS'] && $tiempo >= GAME['MIN_TIME'] && $tiempo <= GAME['MAX_TIME']
        && (microtime(true) - $started) >= $tiempo - 3 && preg_match('/^[a-z0-9-]{2,40}$/', (string) ($p['circuito'] ?? '')) && $adel >= 0 && $adel <= GAME['MAX_OVERTAKES'];
    if ($started) kv_del('jg_' . $token);
    $puntos = $valid ? game_points($monedas, $tiempo, $sup, $adel) : 0;
    $resumen = 'Juego AX Rally · ' . ($valid ? $puntos . ' puntos' : 'partida no válida') . ' · ' . $monedas . ' monedas · ' . $adel . ' adelantamientos · ' . $tiempo . ' s · ' . ($p['circuito'] ?? '') . ' (' . $sup . ')'
        . (($p['acepta_comunicaciones'] ?? '') === 'sí' ? ' · Acepta comunicaciones comerciales' : '');
    $lead = null;
    if ($email) foreach (array_reverse(leads_all()) as $l) if (strtolower($l['email'] ?? '') === $email && ($l['formulario'] ?? '') === 'juego-ax') { $lead = $l; break; }
    if ($lead) {
        $lead['mensaje'] = mb_substr($resumen . "\n" . ($lead['mensaje'] ?? ''), 0, 4000); $lead['actualizado'] = now_iso(); lead_put($lead);
    } else {
        $lead = ['id' => uid(), 'recibido' => now_iso(), 'fecha' => $p['fecha'] ?? '', 'formulario' => 'juego-ax', 'servicio' => 'Juego AX Rally', 'nombre' => $p['nombre'] ?? '', 'telefono' => $p['telefono'] ?? '',
            'email' => $email, 'mensaje' => $resumen, 'pagina' => $p['pagina'] ?? '', 'landing' => $p['landing'] ?? '', 'referrer' => $p['referrer'] ?? '', 'utm_source' => $p['utm_source'] ?? '',
            'utm_medium' => $p['utm_medium'] ?? '', 'utm_campaign' => $p['utm_campaign'] ?? '', 'estado' => 'Nuevo', 'etiquetas' => 'juego'];
        lead_put($lead);
    }
    $row = ['fecha' => now_iso(), 'alias' => $alias, 'nombre' => $p['nombre'] ?? '', 'email' => $email, 'telefono' => $p['telefono'] ?? '', 'circuito' => $p['circuito'] ?? '', 'superficie' => $sup,
        'monedas' => $monedas, 'tiempo' => $tiempo, 'golpes' => (int) ($p['golpes'] ?? 0), 'puntos' => $puntos, 'lead_id' => $lead['id'], 'valida' => $valid ? 'sí' : 'no', 'adelantamientos' => $adel];
    db()->prepare('INSERT INTO ranking (data) VALUES (?)')->execute([json_encode($row, JSON_UNESCAPED_UNICODE)]);
    return ['ok' => true, 'valida' => $valid, 'puntos' => $puntos];
}

/* ---------------- coches en venta (Wallapop) ---------------- */
function http_get(string $url, array $headers): array {
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 15, CURLOPT_FOLLOWLOCATION => true, CURLOPT_HTTPHEADER => $headers]);
    $b = (string) curl_exec($ch); $c = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
    return [$c, $b];
}
function stock(bool $refresh): array {
    if (!$refresh && ($c = kv_get('stock'))) return $c;
    $items = [];
    try {
        $hd = ['User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36', 'Accept: application/json, text/plain, */*', 'Accept-Language: es-ES,es;q=0.9', 'X-DeviceOS: 0'];
        $uidW = kv_get('wallapop_user_id', '');
        if (!$uidW) {
            [, $html] = http_get(WALLAPOP_PROFILE, $hd);
            if (preg_match('~"userId"\s*:\s*"([a-z0-9]{8,})"~i', $html, $m) || preg_match('~users/([a-z0-9]{8,})/~i', $html, $m)) { $uidW = $m[1]; kv_set('wallapop_user_id', $uidW); }
        }
        $next = '';
        for ($page = 0; $uidW && $page < 5; $page++) {
            [$code, $body] = http_get('https://api.wallapop.com/api/v3/users/' . $uidW . '/items' . ($next ? '?since=' . urlencode($next) : ''), $hd);
            if ($code !== 200) break;
            $d = json_decode($body, true) ?: []; $list = $d['data'] ?? $d['items'] ?? [];
            foreach ($list as $it) {
                $c = $it['content'] ?? $it;
                if (!empty($c['flags']['sold'])) continue;
                $img = $c['images'][0]['urls']['medium'] ?? $c['images'][0]['urls']['big'] ?? $c['images'][0]['medium'] ?? '';
                $slug = $c['web_slug'] ?? $c['slug'] ?? '';
                $at = $c['type_attributes'] ?? [];
                $val = fn($k) => is_array($at[$k] ?? null) ? ($at[$k]['value'] ?? $at[$k]['text'] ?? '') : ($at[$k] ?? '');
                $items[] = ['id' => $c['id'] ?? $slug, 'title' => $c['title'] ?? '', 'description' => mb_substr((string) ($c['description'] ?? ''), 0, 280),
                    'price' => is_array($c['price'] ?? null) ? ($c['price']['amount'] ?? null) : ($c['price'] ?? null), 'currency' => $c['price']['currency'] ?? 'EUR', 'image' => $img,
                    'url' => $slug ? 'https://es.wallapop.com/item/' . $slug : WALLAPOP_PROFILE, 'year' => $val('year'), 'km' => $val('km'), 'fuel' => $val('engine') ?: $val('fuel'),
                    'gearbox' => $val('gearbox'), 'reserved' => !empty($c['flags']['reserved'])];
            }
            $next = $d['meta']['next'] ?? $d['meta']['since'] ?? '';
            if (!$next || !$list) break;
        }
    } catch (Throwable $e) { /* sin coches: la web muestra el enlace a Wallapop */ }
    $res = ['ok' => true, 'source' => 'wallapop', 'profile' => WALLAPOP_PROFILE, 'updated' => now_iso(), 'items' => $items];
    kv_set('stock', $res, 1800);
    return $res;
}

/* ---------------- entrada ---------------- */
try {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if ($method === 'POST') {
        $raw = (string) file_get_contents('php://input');
        if (preg_match('/^\s*\{/', $raw)) {
            $req = json_decode($raw, true);
            if (!is_array($req) || empty($req['api'])) out(['ok' => false, 'error' => 'Petición no válida']);
            db()->beginTransaction();
            $res = api($req);
            db()->commit();
            out($res);
        }
        $p = $_POST ?: [];
        if (!$p && $raw) parse_str($raw, $p);
        db()->beginTransaction();
        $res = web_form($p);
        db()->commit();
        scheduled_jobs();
        out($res);
    }
    $action = $_GET['action'] ?? '';
    if ($action === 'plazas' || $action === 'ediciones') out(['ok' => true, 'ediciones' => public_editions($_GET['producto'] ?? null)]);
    if ($action === 'juego_inicio') out(game_start());
    if ($action === 'ranking') out(game_ranking());
    if ($action === 'stock') out(stock(($_GET['refresh'] ?? '') === '1'));
    if ($action === 'estado') { db(); scheduled_jobs(); out(['ok' => true, 'php' => PHP_VERSION, 'datos' => str_contains(data_dir(), 'deyscom-datos') ? 'fuera de la web' : 'api/datos', 'usuarios' => count(users())]); }
    out(['ok' => true, 'service' => 'Deyscom Motorsport API']);
} catch (Throwable $e) {
    try { if (db()->inTransaction()) db()->rollBack(); } catch (Throwable $x) { /* sin base de datos */ }
    http_response_code(500);
    out(['ok' => false, 'error' => 'Error del servidor: ' . $e->getMessage()]);
}
