<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/lib/JsonResponse.php';
require_once dirname(__DIR__) . '/lib/repositories/AppointmentServiceRepository.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    JsonResponse::send(['success' => false, 'message' => 'Method not allowed.'], 405);
}

JsonResponse::send(['services' => AppointmentServiceRepository::listActive()]);
