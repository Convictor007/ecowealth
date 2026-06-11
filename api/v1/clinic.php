<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/lib/JsonResponse.php';
require_once dirname(__DIR__) . '/lib/repositories/ClinicRepository.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    JsonResponse::send(['success' => false, 'message' => 'Method not allowed.'], 405);
}

$clinic = ClinicRepository::get();
if ($clinic === null) {
    JsonResponse::send(['success' => false, 'message' => 'Clinic data not found in public/api/clinic.json.'], 404);
}

JsonResponse::send($clinic);
