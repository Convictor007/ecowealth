<?php

declare(strict_types=1);

final class AppointmentServices
{
    /** @var array<string, string>|null */
    private static ?array $labels = null;

    /** @return array<string, string> id => label */
    public static function labels(): array
    {
        if (self::$labels !== null) {
            return self::$labels;
        }

        $path = dirname(__DIR__, 2) . '/public/api/appointment-services.json';
        if (!is_file($path)) {
            self::$labels = self::defaultLabels();
            return self::$labels;
        }

        $json = json_decode((string) file_get_contents($path), true);
        $services = $json['services'] ?? [];
        $map = [];
        foreach ($services as $row) {
            if (isset($row['id'], $row['label'])) {
                $map[(string) $row['id']] = (string) $row['label'];
            }
        }

        self::$labels = $map !== [] ? $map : self::defaultLabels();
        return self::$labels;
    }

    /** @return list<string> */
    public static function allowedIds(): array
    {
        return array_keys(self::labels());
    }

    public static function label(string $id): string
    {
        $labels = self::labels();
        return $labels[$id] ?? $id;
    }

    /** @return array<string, string> */
    private static function defaultLabels(): array
    {
        return [
            'free-checkup' => 'Free check-up / consultation',
            'colon-hydrotherapy' => 'Colon hydrotherapy',
            'iridology' => 'Iridology',
            'herbology' => 'Herbology',
            'herbal-coffee' => 'Herbal coffee',
            'supplements' => 'Food supplements',
            'general-consultation' => 'General wellness consultation',
            'products-inquiry' => 'Products inquiry (in-clinic)',
        ];
    }
}
