<?php

declare(strict_types=1);

require_once __DIR__ . '/AppointmentValidator.php';

/**
 * Branded appointment notification emails for Eco Wealth Wellnessolution.
 */
final class AppointmentEmailTemplate
{
    private const GREEN = '#1a7a4a';
    private const GREEN_DARK = '#145f3a';
    private const BLUE = '#0d5c8c';
    private const FOOTER_BG = '#0c3d52';
    private const TEXT = '#1a2e28';
    private const TEXT_MUTED = '#4a5f57';
    private const BG_MUTED = '#f7f9f8';
    private const CARD_BG = '#eef4f1';
    private const BORDER = '#d8e4df';

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
        if ($parsed === false) {
            return $date;
        }

        return $parsed->format('l, F j, Y');
    }

    private static function formatPreferredTime(string $time): string
    {
        if ($time === '') {
            return 'Flexible / to be confirmed';
        }

        $parsed = DateTimeImmutable::createFromFormat('H:i', $time);
        if ($parsed === false) {
            return $time;
        }

        return $parsed->format('g:i A');
    }

    private static function e(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    /** Keeps words like "Eco Wealth" from collapsing in email clients. */
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
            'phones' => is_array($brand['phones'] ?? null) ? $brand['phones'] : ['0951 611 4125', '0991 391 6469'],
            'hours' => (string) ($brand['hours'] ?? 'Mon–Sat 9:00 AM – 6:00 PM · Sunday by appointment'),
            'location' => (string) ($brand['location'] ?? 'ONEWAYHI Health and Wellness, Bicol Region, Philippines'),
        ];
    }

    private static function detailRow(string $label, string $valueHtml): string
    {
        return '<tr>'
            . '<td style="padding:10px 0 4px;font-size:11px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:'
            . self::TEXT_MUTED . ';">' . self::e($label) . '</td></tr>'
            . '<tr><td style="padding:0 0 14px;font-size:16px;color:' . self::TEXT . ';border-bottom:1px solid '
            . self::BORDER . ';">' . $valueHtml . '</td></tr>';
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
        $name = self::e($appointment['fullName']);
        $phoneDigits = preg_replace('/\D+/', '', $appointment['phone']) ?? '';
        $phone = self::e($appointment['phone']);
        $email = self::e($appointment['email']);
        $service = self::e($serviceLabel);
        $prefDate = self::e(self::formatPreferredDate($appointment['preferredDate']));
        $prefTime = self::e(self::formatPreferredTime($appointment['preferredTime']));
        $notesRaw = $appointment['notes'] !== '' ? $appointment['notes'] : 'No additional notes provided.';
        $notes = nl2br(self::e($notesRaw), false);
        $tagline = self::e($brand['tagline']);
        $practitioner = self::e($brand['practitioner']);
        $practitionerTitle = self::e($brand['practitioner_title']);
        $hours = self::e($brand['hours']);
        $location = self::e($brand['location']);
        $clinic = self::eNbsp($clinicName);
        $submitted = self::e($submittedAt);
        $replyMailto = 'mailto:' . rawurlencode($appointment['email'])
            . '?subject=' . rawurlencode('Re: Your Eco Wealth appointment request');

        $phonesHtml = '';
        foreach ($brand['phones'] as $p) {
            $tel = preg_replace('/\D+/', '', (string) $p) ?? '';
            $phonesHtml .= '<a href="tel:' . self::e($tel) . '" style="color:#b8e6cf;text-decoration:none;">'
                . self::e((string) $p) . '</a><br>';
        }

        $patientRows = self::detailRow('Full name', $name)
            . self::detailRow('Phone', '<a href="tel:' . self::e($phoneDigits) . '" style="color:' . self::BLUE . ';text-decoration:none;font-weight:600;">' . $phone . '</a>')
            . self::detailRow('Email', '<a href="mailto:' . $email . '" style="color:' . self::BLUE . ';text-decoration:none;font-weight:600;">' . $email . '</a>');

        $visitRows = self::detailRow('Service', '<span style="color:' . self::GREEN . ';font-weight:600;">' . $service . '</span>')
            . self::detailRow('Preferred date', $prefDate)
            . self::detailRow('Preferred time', $prefTime);

        $configBg = self::BG_MUTED;
        $g1 = self::GREEN;
        $g2 = self::GREEN_DARK;
        $blue = self::BLUE;
        $textColor = self::TEXT;
        $textMuted = self::TEXT_MUTED;
        $cardBg = self::CARD_BG;
        $borderColor = self::BORDER;
        $footerBg = self::FOOTER_BG;

        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>New appointment — {$clinic}</title>
</head>
<body style="margin:0;padding:0;background-color:{$configBg};font-family:'Segoe UI',system-ui,-apple-system,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:{$configBg};padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 8px 24px rgba(26,46,40,0.08);">

<tr>
<td style="background:linear-gradient(135deg, {$g1} 0%, {$g2} 55%, {$blue} 100%);padding:28px 32px 24px;">
<p style="margin:0 0 6px;font-size:11px;font-weight:600;color:rgba(255,255,255,0.85);">Eco&nbsp;Wealth · Website booking</p>
<h1 style="margin:0 0 8px;font-size:24px;font-weight:700;line-height:1.25;color:#ffffff;font-family:Georgia,'Times New Roman',serif;">{$clinic}</h1>
<p style="margin:0;font-size:14px;line-height:1.5;color:rgba(255,255,255,0.92);">{$tagline}</p>
</td>
</tr>

<tr>
<td style="padding:28px 32px 8px;">
<p style="margin:0 0 6px;font-size:13px;font-weight:600;color:{$g1};">New appointment request</p>
<h2 style="margin:0 0 8px;font-size:20px;font-weight:600;color:{$textColor};">A patient would like to visit the clinic</h2>
<p style="margin:0;font-size:15px;line-height:1.6;color:{$textMuted};">Review the details below and reply to confirm their preferred schedule.</p>
</td>
</tr>

<tr>
<td style="padding:8px 32px 24px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:{$cardBg};border-radius:12px;border:1px solid {$borderColor};">
<tr><td style="padding:20px 24px;">
<p style="margin:0 0 16px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:{$textMuted};">Patient</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
{$patientRows}
</table>
</td></tr>
</table>
</td>
</tr>

<tr>
<td style="padding:0 32px 24px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid {$borderColor};">
<tr><td style="padding:20px 24px;">
<p style="margin:0 0 16px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:{$textMuted};">Requested visit</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
{$visitRows}
</table>
</td></tr>
</table>
</td>
</tr>

<tr>
<td style="padding:0 32px 28px;">
<p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:{$textMuted};">Notes from patient</p>
<div style="margin:0;padding:0;font-size:15px;line-height:1.65;color:{$textColor};">{$notes}</div>
</td>
</tr>

<tr>
<td style="padding:0 32px 32px;" align="center">
<a href="{$replyMailto}" style="display:inline-block;padding:14px 28px;background:{$g1};color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px;">Reply to {$name}</a>
<p style="margin:14px 0 0;font-size:13px;color:{$textMuted};">Submitted {$submitted}</p>
</td>
</tr>

<tr>
<td style="background:{$footerBg};padding:24px 32px;">
<p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#ffffff;">{$practitioner}</p>
<p style="margin:0 0 12px;font-size:13px;color:rgba(255,255,255,0.8);">{$practitionerTitle} · {$clinic}</p>
<p style="margin:0 0 8px;font-size:13px;line-height:1.5;color:rgba(255,255,255,0.75);">{$location}</p>
<p style="margin:0 0 8px;font-size:13px;color:rgba(255,255,255,0.75);">{$hours}</p>
<p style="margin:0;font-size:14px;line-height:1.6;">{$phonesHtml}</p>
</td>
</tr>

</table>
</td></tr>
</table>
</body>
</html>
HTML;
    }
}
