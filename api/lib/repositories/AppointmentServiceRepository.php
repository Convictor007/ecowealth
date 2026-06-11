<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/AppointmentServices.php';

final class AppointmentServiceRepository
{
    /** @return list<array{id: string, label: string}> */
    public static function listActive(): array
    {
        $out = [];
        foreach (AppointmentServices::labels() as $id => $label) {
            $out[] = ['id' => $id, 'label' => $label];
        }
        return $out;
    }

    public static function exists(string $id): bool
    {
        return isset(AppointmentServices::labels()[$id]);
    }

    public static function label(string $id): string
    {
        return AppointmentServices::label($id);
    }
}
