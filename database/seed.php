<?php

declare(strict_types=1);

/**
 * Seed ecowealth database (user, products).
 * Clinic + appointment services stay in public/api/*.json
 *
 * Usage: php database/seed.php
 */

$root = dirname(__DIR__);
require_once $root . '/api/lib/Env.php';
require_once $root . '/api/lib/Database.php';

Env::load($root . '/.env');

try {
    $pdo = Database::connection();
} catch (Throwable $e) {
    fwrite(STDERR, "Database connection failed: {$e->getMessage()}\n");
    fwrite(STDERR, "Run database/schema.sql first and set DB_* in .env\n");
    exit(1);
}

function readJson(string $path): mixed
{
    if (!is_file($path)) {
        throw new RuntimeException("Missing file: {$path}");
    }
    $data = json_decode((string) file_get_contents($path), true);
    if (!is_array($data) && !is_object($data)) {
        throw new RuntimeException("Invalid JSON: {$path}");
    }
    return $data;
}

echo "Seeding default admin user…\n";
$pdo->exec('DELETE FROM audit');
$pdo->exec('DELETE FROM appointment');
$pdo->exec('DELETE FROM products');
$pdo->exec('DELETE FROM `user`');

$stmtUser = $pdo->prepare(
    'INSERT INTO `user` (role, full_name, phone, email, is_active) VALUES (?, ?, ?, ?, 1)'
);
$stmtUser->execute(['admin', 'Clinic Admin', '09000000001', 'admin@ecowealth.local']);

echo "Seeding products…\n";
$products = readJson($root . '/public/api/products.json');
$stmtProduct = $pdo->prepare(
    'INSERT INTO products (name, category, brand, price, description, package_size, dosage, image, available, sort_order, extra_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
);
foreach ($products as $i => $p) {
    $extraKeys = ['benefits', 'warnings', 'ingredients', 'certifications'];
    $extra = [];
    foreach ($extraKeys as $key) {
        if (!empty($p[$key])) {
            $extra[$key] = $p[$key];
        }
    }
    $stmtProduct->execute([
        (string) $p['name'],
        (string) $p['category'],
        $p['brand'] ?? null,
        (string) $p['price'],
        (string) $p['description'],
        $p['packageSize'] ?? null,
        $p['dosage'] ?? null,
        (string) $p['image'],
        !empty($p['available']) ? 1 : 0,
        $i + 1,
        $extra === [] ? null : json_encode($extra, JSON_UNESCAPED_UNICODE),
    ]);
}

$stmtAudit = $pdo->prepare(
    'INSERT INTO audit (user_id, entity_type, entity_id, action, payload_json)
     VALUES (1, ?, NULL, ?, ?)'
);
$stmtAudit->execute([
    'products',
    'seed',
    json_encode(['count' => count($products)], JSON_UNESCAPED_UNICODE),
]);

echo "Done. Admin user id=1, " . count($products) . " products seeded.\n";
echo "Change the admin phone/email in the database before production use.\n";
