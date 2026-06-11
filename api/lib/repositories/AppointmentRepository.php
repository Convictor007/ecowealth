<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/Database.php';

final class AppointmentRepository
{
    /**
     * @param array<string, string> $data
     * @return array{id: int, reference_id: string}
     */
    public static function create(int $userId, array $data, string $referenceId, string $serviceLabel): array
    {
        $pdo = Database::connection();
        $preferredDate = ($data['preferredDate'] ?? '') !== '' ? $data['preferredDate'] : null;
        $preferredTime = ($data['preferredTime'] ?? '') !== '' ? $data['preferredTime'] . ':00' : null;
        $notes = ($data['notes'] ?? '') !== '' ? $data['notes'] : null;

        $stmt = $pdo->prepare(
            'INSERT INTO appointment (user_id, reference_id, service_slug, service_label, preferred_date, preferred_time, notes, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $userId,
            $referenceId,
            $data['service'],
            $serviceLabel,
            $preferredDate,
            $preferredTime,
            $notes,
            'pending',
        ]);

        return [
            'id' => (int) $pdo->lastInsertId(),
            'reference_id' => $referenceId,
        ];
    }
}
