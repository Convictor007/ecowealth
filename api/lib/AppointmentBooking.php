<?php

declare(strict_types=1);

require_once __DIR__ . '/AppointmentValidator.php';
require_once __DIR__ . '/repositories/AppointmentRepository.php';
require_once __DIR__ . '/repositories/AppointmentServiceRepository.php';
require_once __DIR__ . '/repositories/UserRepository.php';
require_once __DIR__ . '/repositories/AuditRepository.php';

final class AppointmentBooking
{
    /** @return array{success: bool, message: string, referenceId?: string, errors?: array<string, string>} */
    public static function submit(array $payload): array
    {
        $result = AppointmentValidator::validate($payload);
        if ($result['errors'] !== []) {
            return [
                'success' => false,
                'message' => 'Please correct the errors below.',
                'errors' => $result['errors'],
            ];
        }

        $appointment = $result['data'];

        if (!AppointmentServiceRepository::exists($appointment['service'])) {
            return [
                'success' => false,
                'message' => 'Please correct the errors below.',
                'errors' => ['service' => 'Please select a service.'],
            ];
        }

        $userId = UserRepository::findOrCreatePatient(
            $appointment['fullName'],
            $appointment['phone'],
        );

        $referenceId = strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
        $serviceLabel = AppointmentServiceRepository::label($appointment['service']);

        $saved = AppointmentRepository::create($userId, $appointment, $referenceId, $serviceLabel);

        AuditRepository::log(
            $userId,
            'appointment',
            $saved['id'],
            'book',
            [
                'referenceId' => $referenceId,
                'service' => $appointment['service'],
                'serviceLabel' => $serviceLabel,
            ],
            AuditRepository::clientIp(),
            AuditRepository::clientUserAgent(),
        );

        return [
            'success' => true,
            'message' => 'Thank you! Your appointment request was saved. We will contact you by phone soon.',
            'referenceId' => $referenceId,
            'savedToDatabase' => true,
        ];
    }
}
