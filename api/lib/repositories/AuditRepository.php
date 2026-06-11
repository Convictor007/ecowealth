<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/Database.php';

final class AuditRepository
{
    /** @param array<string, mixed>|null $payload */
    public static function log(
        ?int $userId,
        string $entityType,
        ?int $entityId,
        string $action,
        ?array $payload = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
    ): void {
        $pdo = Database::connection();
        $stmt = $pdo->prepare(
            'INSERT INTO audit (user_id, entity_type, entity_id, action, payload_json, ip_address, user_agent)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $stmt->execute([
            $userId,
            $entityType,
            $entityId,
            $action,
            $payload === null ? null : json_encode($payload, JSON_UNESCAPED_UNICODE),
            $ipAddress,
            $userAgent !== null ? mb_substr($userAgent, 0, 512) : null,
        ]);
    }

    public static function clientIp(): ?string
    {
        $keys = ['HTTP_X_FORWARDED_FOR', 'HTTP_CLIENT_IP', 'REMOTE_ADDR'];
        foreach ($keys as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = explode(',', (string) $_SERVER[$key])[0];
                return trim($ip);
            }
        }
        return null;
    }

    public static function clientUserAgent(): ?string
    {
        return isset($_SERVER['HTTP_USER_AGENT']) ? (string) $_SERVER['HTTP_USER_AGENT'] : null;
    }
}
