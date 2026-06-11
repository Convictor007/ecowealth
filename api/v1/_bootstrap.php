<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/lib/JsonResponse.php';
require_once dirname(__DIR__) . '/lib/Database.php';

$config = require dirname(__DIR__) . '/lib/bootstrap.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    Database::connection();
} catch (Throwable $e) {
    JsonResponse::send([
        'success' => false,
        'message' => 'Database unavailable. Run database/schema.sql and database/seed.php.',
        'detail' => $e->getMessage(),
    ], 503);
}
