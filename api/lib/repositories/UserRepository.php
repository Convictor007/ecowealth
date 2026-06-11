<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/Database.php';

final class UserRepository
{
    /** Find patient by phone or create a new patient row. */
    public static function findOrCreatePatient(string $fullName, string $phone): int
    {
        $pdo = Database::connection();
        $normalizedPhone = self::normalizePhone($phone);

        $stmt = $pdo->prepare(
            'SELECT id, full_name FROM `user` WHERE phone = ? AND role = ? LIMIT 1'
        );
        $stmt->execute([$normalizedPhone, 'patient']);
        $existing = $stmt->fetch();

        if ($existing !== false) {
            $userId = (int) $existing['id'];
            if ($existing['full_name'] !== $fullName) {
                $update = $pdo->prepare('UPDATE `user` SET full_name = ? WHERE id = ?');
                $update->execute([$fullName, $userId]);
            }
            return $userId;
        }

        $insert = $pdo->prepare(
            'INSERT INTO `user` (role, full_name, phone, is_active) VALUES (?, ?, ?, 1)'
        );
        $insert->execute(['patient', $fullName, $normalizedPhone]);

        return (int) $pdo->lastInsertId();
    }

    public static function normalizePhone(string $phone): string
    {
        return preg_replace('/\s+/', '', trim($phone)) ?? trim($phone);
    }
}
