<?php

declare(strict_types=1);

/**
 * Minimal .env loader (no Composer). Reads project-root .env for PHP API config.
 */
final class Env
{
    private static bool $loaded = false;

    public static function load(string $path): void
    {
        if (self::$loaded || !is_readable($path)) {
            return;
        }

        self::$loaded = true;
        $lines = file($path, FILE_IGNORE_NEW_LINES) ?: [];

        foreach ($lines as $line) {
            $line = trim($line);
            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }
            if (!str_contains($line, '=')) {
                continue;
            }

            [$key, $value] = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value);

            if ($key === '') {
                continue;
            }

            if (
                (str_starts_with($value, '"') && str_ends_with($value, '"'))
                || (str_starts_with($value, "'") && str_ends_with($value, "'"))
            ) {
                $value = substr($value, 1, -1);
            }

            $_ENV[$key] = $value;
            putenv($key . '=' . $value);
        }
    }

    public static function get(string $key, ?string $default = null): ?string
    {
        if (array_key_exists($key, $_ENV)) {
            $value = $_ENV[$key];
            return $value === '' ? $default : $value;
        }

        $fromEnv = getenv($key);
        if ($fromEnv !== false && $fromEnv !== '') {
            return $fromEnv;
        }

        return $default;
    }

    /** Prefer modern key, then legacy CodeIgniter-style key from .env */
    public static function getAlt(string $primary, string $legacy, ?string $default = null): ?string
    {
        return self::get($primary) ?? self::get($legacy, $default);
    }

    public static function bool(string $key, bool $default = false): bool
    {
        $value = strtolower((string) self::get($key, ''));
        if ($value === '') {
            return $default;
        }

        return in_array($value, ['1', 'true', 'yes', 'on'], true);
    }

    /** @return list<string> */
    public static function list(string $key, string $separator = ','): array
    {
        $raw = self::get($key, '');
        if ($raw === null || $raw === '') {
            return [];
        }

        return array_values(array_filter(array_map('trim', explode($separator, $raw))));
    }
}
