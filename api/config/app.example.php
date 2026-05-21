<?php

/**
 * Configuration is loaded from the project-root .env file.
 *
 * 1. Copy ../../.env.example to ../../.env
 * 2. Set CLINIC_EMAIL, MAIL_SMTP_USER, MAIL_SMTP_PASS, etc.
 * 3. Values are read via api/lib/AppConfig.php (see api/README.md)
 */

declare(strict_types=1);

require_once dirname(__DIR__) . '/lib/AppConfig.php';

return AppConfig::load();
