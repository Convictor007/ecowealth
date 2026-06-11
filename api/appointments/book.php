<?php

declare(strict_types=1);

/**
 * XAMPP booking endpoint — saves to MySQL (no email).
 * Vercel uses api/appointments/index.ts with the same database when DB_* env is set.
 */

require_once dirname(__DIR__) . '/lib/JsonResponse.php';
require_once dirname(__DIR__) . '/lib/AppointmentBooking.php';
require_once dirname(__DIR__) . '/lib/repositories/AppointmentServiceRepository.php';
require_once dirname(__DIR__) . '/lib/Database.php';

$config = require dirname(__DIR__) . '/lib/bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    try {
        Database::connection();
        $dbOk = true;
    } catch (Throwable) {
        $dbOk = false;
    }

    JsonResponse::send([
        'success' => true,
        'message' => 'Appointments API is running. Send POST JSON to book.',
        'runtime' => 'php-xampp',
        'storage' => $dbOk ? 'database' : 'unavailable',
        'services' => $dbOk ? AppointmentServiceRepository::listActive() : [],
    ]);
}

if ($method !== 'POST') {
    JsonResponse::send(['success' => false, 'message' => 'Method not allowed.'], 405);
}

try {
    Database::connection();
} catch (Throwable $e) {
    JsonResponse::send([
        'success' => false,
        'message' => 'Database unavailable. Run database/schema.sql and database/seed.php.',
    ], 503);
}

$raw = file_get_contents('php://input');
$payload = json_decode($raw ?: '', true);
if (!is_array($payload)) {
    JsonResponse::send(['success' => false, 'message' => 'Invalid JSON body.'], 400);
}

$result = AppointmentBooking::submit($payload);
$status = !empty($result['errors']) ? 422 : ($result['success'] ? 200 : 500);
JsonResponse::send($result, $status);
