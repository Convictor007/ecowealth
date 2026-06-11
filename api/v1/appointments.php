<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';
require_once dirname(__DIR__) . '/lib/AppointmentBooking.php';
require_once dirname(__DIR__) . '/lib/repositories/AppointmentServiceRepository.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    JsonResponse::send([
        'success' => true,
        'message' => 'Appointments API is running. Send POST JSON to book.',
        'runtime' => 'php-mysql',
        'storage' => 'database',
        'services' => AppointmentServiceRepository::listActive(),
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

$result = AppointmentBooking::submit($payload);
$status = !empty($result['errors']) ? 422 : ($result['success'] ? 200 : 500);
JsonResponse::send($result, $status);
