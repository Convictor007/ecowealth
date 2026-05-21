<?php

declare(strict_types=1);

final class AppointmentStore
{
    public function __construct(private readonly string $storageDir) {}

    public function save(array $appointment): void
    {
        if (!is_dir($this->storageDir)) {
            mkdir($this->storageDir, 0755, true);
        }

        $record = array_merge($appointment, [
            'id' => bin2hex(random_bytes(8)),
            'createdAt' => gmdate('c'),
        ]);

        $file = $this->storageDir . '/' . date('Y-m-d') . '.jsonl';
        file_put_contents($file, json_encode($record, JSON_UNESCAPED_UNICODE) . PHP_EOL, FILE_APPEND | LOCK_EX);
    }
}
