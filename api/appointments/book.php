<?php

declare(strict_types=1);

/**
 * XAMPP booking endpoint (Apache + PHP).
 * Vercel uses api/appointments/index.ts — do not add index.php here (route conflict).
 */

require_once dirname(__DIR__) . '/lib/Cors.php';
require_once dirname(__DIR__) . '/lib/JsonResponse.php';
require_once dirname(__DIR__) . '/lib/AppointmentServices.php';
require_once dirname(__DIR__) . '/lib/AppointmentValidator.php';
require_once dirname(__DIR__) . '/lib/SmtpMailer.php';
require_once dirname(__DIR__) . '/lib/AppointmentEmailTemplate.php';
require_once dirname(__DIR__) . '/lib/AppointmentMailer.php';
require_once dirname(__DIR__) . '/lib/AppointmentStore.php';

$config = require dirname(__DIR__) . '/lib/bootstrap.php';

Cors::apply($config['allowed_origins']);
Cors::handlePreflight();

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    JsonResponse::send([
        'success' => true,
        'message' => 'Appointments API is running. Send POST JSON to book.',
    ]);
}

if ($method !== 'POST') {
    JsonResponse::send(['success' => false, 'message' => 'Method not allowed.'], 405);
}

$raw = file_get_contents('php://input');
$payload = json_decode($raw ?: '', true);
if (!is_array($payload)) {
    JsonResponse::send(['success' => false, 'message' => 'Invalid JSON body.'], 400);
}

$result = AppointmentValidator::validate($payload);
if ($result['errors'] !== []) {
    JsonResponse::send([
        'success' => false,
        'message' => 'Please correct the errors below.',
        'errors' => $result['errors'],
    ], 422);
}

$appointment = $result['data'];

if (!empty($config['store_requests'])) {
    $store = new AppointmentStore(dirname(__DIR__) . '/storage/appointments');
    $store->save($appointment);
}

$mailer = new AppointmentMailer($config);
$sent = $mailer->send($appointment);

if (!$sent) {
    JsonResponse::send([
        'success' => true,
        'message' => 'Request saved. Our team will follow up with you shortly.',
        'emailSent' => false,
    ]);
}

JsonResponse::send([
    'success' => true,
    'message' => 'Thank you! Your appointment request was received. We will contact you soon.',
    'emailSent' => true,
]);
