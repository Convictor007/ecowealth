<?php

declare(strict_types=1);

/**
 * Minimal SMTP client (AUTH LOGIN + STARTTLS) for Gmail and similar relays.
 * No Composer required — works on XAMPP with openssl enabled.
 */
final class SmtpMailer
{
    /**
     * @param string|array{html: string, text: string} $body
     */
    public function send(
        string $to,
        string $subject,
        string|array $body,
        string $replyTo,
        string $fromEmail,
        string $fromName,
        array $smtp,
    ): bool {
        $host = (string) ($smtp['host'] ?? '');
        $port = (int) ($smtp['port'] ?? 587);
        $encryption = (string) ($smtp['encryption'] ?? 'tls');
        $username = (string) ($smtp['username'] ?? '');
        $password = (string) ($smtp['password'] ?? '');

        if ($host === '' || $username === '' || $password === '') {
            return false;
        }

        $remote = ($encryption === 'ssl' ? 'ssl://' : 'tcp://') . $host . ':' . $port;
        $timeout = (int) ($smtp['timeout'] ?? 30);
        $socket = @stream_socket_client($remote, $errno, $errstr, $timeout, STREAM_CLIENT_CONNECT);

        if (!$socket) {
            return false;
        }

        stream_set_timeout($socket, $timeout);

        try {
            $this->expect($socket, [220]);
            $this->cmd($socket, 'EHLO localhost', [250]);

            if ($encryption === 'tls') {
                $this->cmd($socket, 'STARTTLS', [220]);
                if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
                    return false;
                }
                $this->cmd($socket, 'EHLO localhost', [250]);
            }

            $this->cmd($socket, 'AUTH LOGIN', [334]);
            $this->cmd($socket, base64_encode($username), [334]);
            $this->cmd($socket, base64_encode($password), [235]);

            $this->cmd($socket, 'MAIL FROM:<' . $fromEmail . '>', [250]);
            $this->cmd($socket, 'RCPT TO:<' . $to . '>', [250, 251]);
            $this->cmd($socket, 'DATA', [354]);

            $message = $this->buildMessage($fromEmail, $fromName, $to, $replyTo, $subject, $body);
            fwrite($socket, $message . "\r\n.\r\n");
            $this->expect($socket, [250]);

            $this->cmd($socket, 'QUIT', [221]);
            return true;
        } catch (Throwable) {
            return false;
        } finally {
            fclose($socket);
        }
    }

    /** @param string|array{html: string, text: string} $body */
    private function buildMessage(
        string $fromEmail,
        string $fromName,
        string $to,
        string $replyTo,
        string $subject,
        string|array $body,
    ): string {
        $safeName = str_replace(["\r", "\n"], '', $fromName);
        $encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

        $headers = [
            'From: "' . $safeName . '" <' . $fromEmail . '>',
            'To: <' . $to . '>',
            'Reply-To: <' . $replyTo . '>',
            'Subject: ' . $encodedSubject,
            'MIME-Version: 1.0',
        ];

        if (is_array($body)) {
            $boundary = 'ew_' . bin2hex(random_bytes(8));
            $headers[] = 'Content-Type: multipart/alternative; boundary="' . $boundary . '"';

            $parts = [
                '--' . $boundary,
                'Content-Type: text/plain; charset=UTF-8',
                'Content-Transfer-Encoding: 8bit',
                '',
                $body['text'],
                '--' . $boundary,
                'Content-Type: text/html; charset=UTF-8',
                'Content-Transfer-Encoding: 8bit',
                '',
                $body['html'],
                '--' . $boundary . '--',
            ];

            $payload = implode("\r\n", $parts);
        } else {
            $headers[] = 'Content-Type: text/plain; charset=UTF-8';
            $headers[] = 'Content-Transfer-Encoding: 8bit';
            $payload = $body;
        }

        return implode("\r\n", $headers) . "\r\n\r\n" . $payload;
    }

    /** @param resource $socket */
    private function cmd($socket, string $command, array $okCodes): void
    {
        fwrite($socket, $command . "\r\n");
        $this->expect($socket, $okCodes);
    }

    /** @param resource $socket */
    private function expect($socket, array $okCodes): void
    {
        $response = '';
        while ($line = fgets($socket, 515)) {
            $response .= $line;
            if (isset($line[3]) && $line[3] === ' ') {
                break;
            }
        }

        $code = (int) substr(trim($response), 0, 3);
        if (!in_array($code, $okCodes, true)) {
            throw new RuntimeException('SMTP error: ' . trim($response));
        }
    }
}
