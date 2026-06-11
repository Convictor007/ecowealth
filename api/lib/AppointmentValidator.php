<?php

declare(strict_types=1);

require_once __DIR__ . '/AppointmentServices.php';

final class AppointmentValidator
{
    /** @return array{data: array<string, string>, errors: array<string, string>} */
    public static function validate(array $input): array
    {
        $errors = [];
        $fullName = trim((string) ($input['fullName'] ?? ''));
        $phone = trim((string) ($input['phone'] ?? ''));
        $service = trim((string) ($input['service'] ?? ''));
        $preferredDate = trim((string) ($input['preferredDate'] ?? ''));
        $preferredTime = trim((string) ($input['preferredTime'] ?? ''));
        $notes = trim((string) ($input['notes'] ?? ''));

        if ($fullName === '' || mb_strlen($fullName) < 2) {
            $errors['fullName'] = 'Please enter your full name.';
        }
        if ($phone === '' || !preg_match('/^[\d\s+\-()]{7,20}$/', $phone)) {
            $errors['phone'] = 'Please enter a valid phone number.';
        }
        if ($service === '') {
            $errors['service'] = 'Please select a service.';
        }
        if ($preferredDate !== '' && !self::isValidDate($preferredDate)) {
            $errors['preferredDate'] = 'Please enter a valid preferred date.';
        }
        if ($preferredTime !== '' && !preg_match('/^\d{2}:\d{2}$/', $preferredTime)) {
            $errors['preferredTime'] = 'Please enter a valid time (HH:MM).';
        }
        if (mb_strlen($notes) > 1000) {
            $errors['notes'] = 'Notes must be 1000 characters or less.';
        }

        return [
            'data' => [
                'fullName' => $fullName,
                'phone' => $phone,
                'service' => $service,
                'preferredDate' => $preferredDate,
                'preferredTime' => $preferredTime,
                'notes' => $notes,
            ],
            'errors' => $errors,
        ];
    }

    public static function serviceLabel(string $slug): string
    {
        return AppointmentServices::label($slug);
    }

    private static function isValidDate(string $date): bool
    {
        $dt = DateTime::createFromFormat('Y-m-d', $date);
        return $dt !== false && $dt->format('Y-m-d') === $date;
    }
}
