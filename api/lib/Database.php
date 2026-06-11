<?php

declare(strict_types=1);

require_once __DIR__ . '/Env.php';

final class Database
{
    private static ?PDO $pdo = null;

    public static function connection(): PDO
    {
        if (self::$pdo instanceof PDO) {
            return self::$pdo;
        }

        $host = Env::get('DB_HOST', '127.0.0.1') ?? '127.0.0.1';
        $port = Env::get('DB_PORT', '3306') ?? '3306';
        $name = Env::get('DB_NAME', 'ecowealth') ?? 'ecowealth';
        $user = Env::get('DB_USER', 'ecowealth') ?? 'ecowealth';
        $pass = Env::get('DB_PASS', 'ecowealth_pass') ?? 'ecowealth_pass';

        $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $name);

        self::$pdo = new PDO($dsn, $user, $pass, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);

        return self::$pdo;
    }

    public static function isConfigured(): bool
    {
        return (Env::get('DB_NAME', '') ?? '') !== '';
    }
}
