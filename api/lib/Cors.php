<?php

declare(strict_types=1);

final class Cors
{
    public static function apply(array $allowedOrigins): void
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';

        if ($origin !== '' && self::isAllowed($origin, $allowedOrigins)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Vary: Origin');
        }

        header('Access-Control-Allow-Methods: POST, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type');
    }

    public static function handlePreflight(): void
    {
        if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }

    private static function isAllowed(string $origin, array $allowedOrigins): bool
    {
        if (in_array($origin, $allowedOrigins, true)) {
            return true;
        }

        // Allow Vite dev server and local XAMPP on any port
        return (bool) preg_match(
            '#^https?://(localhost|127\.0\.0\.1)(:\d+)?$#',
            $origin,
        );
    }
}
