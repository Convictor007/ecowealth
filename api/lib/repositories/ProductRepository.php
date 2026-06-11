<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/Database.php';

final class ProductRepository
{
    /** @return list<array<string, mixed>> */
    public static function listAll(): array
    {
        $pdo = Database::connection();
        $stmt = $pdo->query(
            'SELECT id, name, category, brand, price, description, package_size, dosage, image, available, extra_json
             FROM products
             ORDER BY sort_order ASC, name ASC'
        );
        $rows = $stmt->fetchAll();
        $out = [];
        foreach ($rows as $row) {
            $product = [
                'id' => (int) $row['id'],
                'name' => (string) $row['name'],
                'category' => (string) $row['category'],
                'price' => (string) $row['price'],
                'description' => (string) $row['description'],
                'available' => (bool) $row['available'],
                'image' => (string) $row['image'],
                'benefits' => [],
            ];
            if ($row['brand'] !== null && $row['brand'] !== '') {
                $product['brand'] = (string) $row['brand'];
            }
            if ($row['package_size'] !== null && $row['package_size'] !== '') {
                $product['packageSize'] = (string) $row['package_size'];
            }
            if ($row['dosage'] !== null && $row['dosage'] !== '') {
                $product['dosage'] = (string) $row['dosage'];
            }
            if ($row['extra_json'] !== null && $row['extra_json'] !== '') {
                $extra = json_decode((string) $row['extra_json'], true);
                if (is_array($extra)) {
                    foreach ($extra as $key => $value) {
                        $product[$key] = $value;
                    }
                }
            }
            if (!isset($product['benefits']) || !is_array($product['benefits'])) {
                $product['benefits'] = [];
            }
            $out[] = $product;
        }
        return $out;
    }
}
