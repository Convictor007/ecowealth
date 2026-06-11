<?php

declare(strict_types=1);

require_once __DIR__ . '/AppointmentValidator.php';

/**
 * Branded appointment notification emails for Eco Wealth Wellnessolution.
 * HTML layout: api/templates/appointment-email.html
 */
final class AppointmentEmailTemplate
{
    private const BLUE = '#0d5c8c';
    private const TEXT_MUTED = '#4a5f57';

    public static function subject(string $clinicName, array $appointment): string
    {
        $service = AppointmentValidator::serviceLabel($appointment['service']);

        return sprintf(
            '%s · New appointment · %s — %s',
            $clinicName,
            $appointment['fullName'],
            $service,
        );
    }

    /** @return array{html: string, text: string} */
    public static function build(array $appointment, array $config): array
    {
        $clinicName = (string) ($config['clinic_name'] ?? 'Eco Wealth Wellnessolution');
        $serviceLabel = AppointmentValidator::serviceLabel($appointment['service']);
        $submittedAt = self::formatSubmittedAt();

        return [
            'html' => self::buildHtml($appointment, $clinicName, $serviceLabel, $submittedAt, $config),
            'text' => self::buildPlain($appointment, $clinicName, $serviceLabel, $submittedAt),
        ];
    }

    private static function formatSubmittedAt(): string
    {
        $tz = new DateTimeZone('Asia/Manila');
        $now = new DateTimeImmutable('now', $tz);

        return $now->format('F j, Y \a\t g:i A') . ' (Philippines)';
    }

    private static function formatPreferredDate(string $date): string
    {
        if ($date === '') {
            return 'Flexible / to be confirmed';
        }

        $parsed = DateTimeImmutable::createFromFormat('Y-m-d', $date);

        return $parsed === false ? $date : $parsed->format('l, F j, Y');
    }

    private static function formatPreferredTime(string $time): string
    {
        if ($time === '') {
            return 'Flexible / to be confirmed';
        }

        $parsed = DateTimeImmutable::createFromFormat('H:i', $time);

        return $parsed === false ? $time : $parsed->format('g:i A');
    }

    private static function e(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    private static function eNbsp(string $value): string
    {
        return str_replace(' ', '&nbsp;', self::e($value));
    }

    /** @return array{tagline: string, practitioner: string, practitioner_title: string, phones: list<string>, hours: string, location: string} */
    private static function branding(array $config): array
    {
        $brand = $config['email_branding'] ?? [];

        return [
            'tagline' => (string) ($brand['tagline'] ?? 'Natural Healing · Holistic Wellness · Trusted Care'),
            'practitioner' => (string) ($brand['practitioner'] ?? 'Edgar Bustamante, N.D.'),
            'practitioner_title' => (string) ($brand['practitioner_title'] ?? 'Naturopathy Practitioner'),
            'phones' => is_array($brand['phones'] ?? null) ? $brand['phones'] : ['0919 861 3002', '0991 391 6469'],
            'hours' => (string) ($brand['hours'] ?? 'Mon–Sat 9:00 AM – 6:00 PM · Sunday by appointment'),
            'location' => (string) ($brand['location'] ?? 'ONEWAYHI Health and Wellness, Bicol Region, Philippines'),
        ];
    }

    private static function infoCell(string $label, string $valueHtml): string
    {
        return '<td width="50%" valign="top" style="padding:8px 6px;">'
            . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #d8e4df;border-radius:10px;">'
            . '<tr><td style="padding:14px 16px;">'
            . '<p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:'
            . self::TEXT_MUTED . ';">' . self::e($label) . '</p>'
            . '<div style="font-size:15px;line-height:1.45;color:#1a2e28;font-weight:600;">' . $valueHtml . '</div>'
            . '</td></tr></table></td>';
    }

    private static function buildContactGrid(array $appointment): string
    {
        $phoneDigits = preg_replace('/\D+/', '', $appointment['phone']) ?? '';
        $phone = self::e($appointment['phone']);
        $email = self::e($appointment['email']);

        return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>'
            . self::infoCell('Full name', self::e($appointment['fullName']))
            . self::infoCell(
                'Phone',
                '<a href="tel:' . self::e($phoneDigits) . '" style="color:' . self::BLUE . ';text-decoration:none;">' . $phone . '</a>',
            )
            . '</tr><tr><td colspan="2" style="padding:8px 6px;">'
            . '<table role="presentation" width="100%" style="background:#ffffff;border:1px solid #d8e4df;border-radius:10px;">'
            . '<tr><td style="padding:14px 16px;">'
            . '<p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:'
            . self::TEXT_MUTED . ';">Email</p>'
            . '<div style="font-size:15px;font-weight:600;"><a href="mailto:' . $email
            . '" style="color:' . self::BLUE . ';text-decoration:none;word-break:break-all;">' . $email . '</a></div>'
            . '</td></tr></table></td></tr></table>';
    }

    private static function buildPhonesHtml(array $phones): string
    {
        $parts = [];
        foreach ($phones as $p) {
            $tel = preg_replace('/\D+/', '', (string) $p) ?? '';
            $parts[] = '<a href="tel:' . self::e($tel) . '" style="color:#b8e6cf;text-decoration:none;font-weight:600;">'
                . self::e((string) $p) . '</a>';
        }

        return implode(' &nbsp;|&nbsp; ', $parts);
    }

    private static function loadHtmlTemplate(): string
    {
        $path = dirname(__DIR__) . '/templates/appointment-email.html';
        if (!is_readable($path)) {
            throw new RuntimeException('Email template not found: ' . $path);
        }

        return (string) file_get_contents($path);
    }

    private static function applyPlaceholders(string $html, array $vars): string
    {
        foreach ($vars as $key => $value) {
            $html = str_replace('{{' . $key . '}}', $value, $html);
        }

        return $html;
    }

    private static function buildPlain(
        array $appointment,
        string $clinicName,
        string $serviceLabel,
        string $submittedAt,
    ): string {
        $notes = $appointment['notes'] !== '' ? $appointment['notes'] : '(none)';

        return implode("\n", [
            $clinicName,
            'New appointment request from your website',
            str_repeat('=', 48),
            '',
            'Patient details',
            '  Name:           ' . $appointment['fullName'],
            '  Phone:          ' . $appointment['phone'],
            '  Email:          ' . $appointment['email'],
            '',
            'Requested visit',
            '  Service:        ' . $serviceLabel,
            '  Preferred date: ' . self::formatPreferredDate($appointment['preferredDate']),
            '  Preferred time: ' . self::formatPreferredTime($appointment['preferredTime']),
            '',
            'Notes from patient',
            $notes,
            '',
            'Submitted: ' . $submittedAt,
            '',
            'Reply directly to this email to reach ' . $appointment['fullName'] . '.',
        ]);
    }

    private static function buildHtml(
        array $appointment,
        string $clinicName,
        string $serviceLabel,
        string $submittedAt,
        array $config,
    ): string {
        $brand = self::branding($config);
        $phoneDigits = preg_replace('/\D+/', '', $appointment['phone']) ?? '';
        $notesRaw = $appointment['notes'] !== '' ? $appointment['notes'] : 'No additional notes provided.';
        $notes = nl2br(self::e($notesRaw), false);

        $vars = [
            'CLINIC_NAME' => self::eNbsp($clinicName),
            'TAGLINE' => self::e($brand['tagline']),
            'PATIENT_NAME' => self::e($appointment['fullName']),
            'SERVICE' => self::e($serviceLabel),
            'PREFERRED_DATE' => self::e(self::formatPreferredDate($appointment['preferredDate'])),
            'PREFERRED_TIME' => self::e(self::formatPreferredTime($appointment['preferredTime'])),
            'CONTACT_GRID' => self::buildContactGrid($appointment),
            'NOTES' => $notes,
            'REPLY_URL' => 'mailto:' . rawurlencode($appointment['email'])
                . '?subject=' . rawurlencode('Re: Your Eco Wealth appointment request'),
            'TEL_URL' => 'tel:' . self::e($phoneDigits),
            'SUBMITTED_AT' => self::e($submittedAt),
            'PRACTITIONER' => self::e($brand['practitioner']),
            'PRACTITIONER_TITLE' => self::e($brand['practitioner_title']),
            'LOCATION' => self::e($brand['location']),
            'HOURS' => self::e($brand['hours']),
            'PHONES_HTML' => self::buildPhonesHtml($brand['phones']),
        ];

        return self::applyPlaceholders(self::loadHtmlTemplate(), $vars);
    }
}
