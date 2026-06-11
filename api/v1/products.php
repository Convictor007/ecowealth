<?php

declare(strict_types=1);

require_once __DIR__ . '/_bootstrap.php';
require_once dirname(__DIR__) . '/lib/repositories/ProductRepository.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'GET') {
    JsonResponse::send(['success' => false, 'message' => 'Method not allowed.'], 405);
}

JsonResponse::send(ProductRepository::listAll());
