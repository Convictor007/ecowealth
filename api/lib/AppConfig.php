<?php

declare(strict_types=1);

/**
 * Builds API config from project-root .env (loaded by bootstrap.php first).
 */
final class AppConfig
{
    public static function load(): array
    {
        $smtpUser = Env::getAlt('MAIL_SMTP_USER', 'email.SMTPUser', '') ?? '';
        $smtpPass = Env::getAlt('MAIL_SMTP_PASS', 'email.SMTPPass', '') ?? '';
        $smtpFrom = Env::getAlt('MAIL_FROM_EMAIL', 'email.SMTPUser', $smtpUser) ?? $smtpUser;
        if ($smtpFrom === '') {
            $smtpFrom = $smtpUser;
        }

        $phones = Env::list('EMAIL_PHONES');
        if ($phones === []) {
            $phones = ['0951 611 4125', '0991 391 6469'];
        }

        return [
            'clinic_name' => Env::get('CLINIC_NAME', 'Eco Wealth Wellnessolution'),
            'clinic_email' => Env::get('CLINIC_EMAIL', ''),

            'mail_transport' => Env::getAlt('MAIL_TRANSPORT', 'email.protocol', 'smtp'),

            'smtp' => [
                'host' => Env::getAlt('MAIL_SMTP_HOST', 'email.SMTPHost', 'smtp.gmail.com') ?? 'smtp.gmail.com',
                'port' => (int) (Env::getAlt('MAIL_SMTP_PORT', 'email.SMTPPort', '587') ?? '587'),
                'encryption' => Env::getAlt('MAIL_SMTP_ENCRYPTION', 'email.SMTPCrypto', 'tls') ?? 'tls',
                'timeout' => (int) (Env::getAlt('MAIL_SMTP_TIMEOUT', 'email.SMTPTimeout', '30') ?? '30'),
                'username' => $smtpUser,
                'password' => $smtpPass,
                'from_email' => $smtpFrom,
                'from_name' => Env::get('MAIL_FROM_NAME', 'Eco Wealth Appointments') ?? 'Eco Wealth Appointments',
                'charset' => Env::getAlt('MAIL_CHARSET', 'email.charset', 'utf-8') ?? 'utf-8',
            ],

            'mail_from' => $smtpFrom,
            'mail_from_name' => Env::get('MAIL_FROM_NAME', 'Eco Wealth Appointments') ?? 'Eco Wealth Appointments',
            'store_requests' => Env::bool('STORE_APPOINTMENTS', true),

            'email_branding' => [
                'tagline' => Env::get('EMAIL_TAGLINE', 'Natural Healing · Holistic Wellness · Trusted Care')
                    ?? 'Natural Healing · Holistic Wellness · Trusted Care',
                'practitioner' => Env::get('EMAIL_PRACTITIONER', 'Edgar Bustamante, N.D.') ?? 'Edgar Bustamante, N.D.',
                'practitioner_title' => Env::get('EMAIL_PRACTITIONER_TITLE', 'Naturopathy Practitioner')
                    ?? 'Naturopathy Practitioner',
                'phones' => $phones,
                'hours' => Env::get('EMAIL_HOURS', 'Mon–Sat 9:00 AM – 6:00 PM · Sunday by appointment')
                    ?? 'Mon–Sat 9:00 AM – 6:00 PM · Sunday by appointment',
                'location' => Env::get('EMAIL_LOCATION', 'ONEWAYHI Health and Wellness, Bicol Region, Philippines')
                    ?? 'ONEWAYHI Health and Wellness, Bicol Region, Philippines',
            ],
        ];
    }
}
