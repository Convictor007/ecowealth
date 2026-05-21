<?php

declare(strict_types=1);

final class AppointmentMailer
{
    public function __construct(private readonly array $config) {}

    public function send(array $appointment): bool
    {
        $clinicName = $this->config['clinic_name'];
        $to = $this->config['clinic_email'];
        $content = AppointmentEmailTemplate::build($appointment, $this->config);
        $subject = AppointmentEmailTemplate::subject($clinicName, $appointment);
        $smtp = $this->config['smtp'] ?? [];

        if (($this->config['mail_transport'] ?? '') === 'smtp' && !empty($smtp['password'])) {
            $smtpMailer = new SmtpMailer();

            return $smtpMailer->send(
                $to,
                $subject,
                $content,
                $appointment['email'],
                (string) ($smtp['from_email'] ?? $smtp['username']),
                (string) ($smtp['from_name'] ?? $this->config['mail_from_name']),
                $smtp,
            );
        }

        $from = $this->config['mail_from'];
        $fromName = $this->config['mail_from_name'];
        $headers = [
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
            'From: ' . $this->formatAddress($from, $fromName),
            'Reply-To: ' . $appointment['email'],
        ];

        return @mail($to, $subject, $content['html'], implode("\r\n", $headers));
    }

    private function formatAddress(string $email, string $name): string
    {
        $safeName = str_replace(['"', "\r", "\n"], '', $name);
        return sprintf('"%s" <%s>', $safeName, $email);
    }
}
