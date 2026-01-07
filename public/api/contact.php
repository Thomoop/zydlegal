<?php
/**
 * Procesador de formulario de contacto - Zeballos & Díaz
 * Envía consultas a contacto@zydlegal.cl
 */

// Configuración
$destinatario = 'contacto@zydlegal.cl';
$asunto_base = 'Nueva consulta desde zydlegal.cl';

// Headers para respuesta JSON
header('Content-Type: application/json; charset=utf-8');

// Solo aceptar POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// Obtener y sanitizar datos
$nombre = isset($_POST['nombre']) ? trim(strip_tags($_POST['nombre'])) : '';
$telefono = isset($_POST['telefono']) ? trim(strip_tags($_POST['telefono'])) : '';
$email = isset($_POST['email']) ? trim(filter_var($_POST['email'], FILTER_SANITIZE_EMAIL)) : '';
$tipo = isset($_POST['tipo']) ? trim(strip_tags($_POST['tipo'])) : '';
$mensaje = isset($_POST['mensaje']) ? trim(strip_tags($_POST['mensaje'])) : '';

// Validaciones
$errores = [];

if (empty($nombre)) {
    $errores[] = 'El nombre es requerido';
}

if (empty($telefono)) {
    $errores[] = 'El teléfono es requerido';
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errores[] = 'Email inválido';
}

if (empty($tipo)) {
    $errores[] = 'Seleccione un tipo de consulta';
}

if (empty($mensaje)) {
    $errores[] = 'El mensaje es requerido';
}

// Si hay errores, responder
if (!empty($errores)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => implode(', ', $errores)]);
    exit;
}

// Mapeo de tipos de consulta
$tipos_consulta = [
    'penal' => 'Derecho Penal / Ley 20.000',
    'familia' => 'Derecho de Familia',
    'tributario' => 'Derecho Tributario',
    'laboral' => 'Derecho Laboral',
    'otro' => 'Otro'
];

$tipo_legible = isset($tipos_consulta[$tipo]) ? $tipos_consulta[$tipo] : $tipo;

// Construir el email
$asunto = "$asunto_base - $tipo_legible";

$cuerpo = "
====================================
NUEVA CONSULTA - ZYDLEGAL.CL
====================================

DATOS DEL CONTACTO:
-------------------
Nombre: $nombre
Teléfono: $telefono
Email: $email
Tipo de Consulta: $tipo_legible

MENSAJE:
--------
$mensaje

====================================
Fecha: " . date('d/m/Y H:i:s') . "
IP: " . $_SERVER['REMOTE_ADDR'] . "
====================================
";

// Headers del email
$headers = "From: noreply@zydlegal.cl\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// Enviar email
$enviado = mail($destinatario, $asunto, $cuerpo, $headers);

if ($enviado) {
    echo json_encode([
        'success' => true,
        'message' => 'Gracias por contactarnos. Responderemos a la brevedad.'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al enviar el mensaje. Por favor intente nuevamente o contáctenos por teléfono.'
    ]);
}
