<?php

declare(strict_types=1);

/** Clinic profile is stored in public/api/clinic.json (not in MySQL). */
final class ClinicRepository
{
    /** @return array<string, mixed>|null */
    public static function get(): ?array
    {
        $path = dirname(__DIR__, 3) . '/public/api/clinic.json';
        if (!is_file($path)) {
            return null;
        }
        $data = json_decode((string) file_get_contents($path), true);
        return is_array($data) ? $data : null;
    }
}
