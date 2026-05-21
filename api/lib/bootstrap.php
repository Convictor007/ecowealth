<?php

declare(strict_types=1);

require_once __DIR__ . '/Env.php';
require_once __DIR__ . '/AppConfig.php';

$projectRoot = dirname(__DIR__, 2);
Env::load($projectRoot . '/.env');

$configPath = dirname(__DIR__) . '/config/app.php';
if (!is_file($configPath)) {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode([
        'success' => false,
        'message' => 'Server configuration missing. Copy .env.example to .env and set your values.',
    ]);
    exit;
}

return require $configPath;
