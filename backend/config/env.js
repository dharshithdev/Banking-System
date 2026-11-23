const EXAMPLE_SECRET = 'REPLACE_WITH_64_CHAR_RANDOM_HEX_SECRET';

function validateEnv(env = process.env) {
  const secret = env.JWT_SECRET;
  if (typeof secret !== 'string' || secret.trim().length < 32 || secret.trim() === EXAMPLE_SECRET) {
    throw new Error('JWT_SECRET must be set to a unique secret of at least 32 characters (the .env.example placeholder is not allowed).');
  }
  const enabledValue = env.EMAIL_2FA_ENABLED ?? 'true';
  if (!['true', 'false'].includes(String(enabledValue).trim().toLowerCase())) {
    throw new Error('EMAIL_2FA_ENABLED must be either true or false.');
  }
  if (String(enabledValue).trim().toLowerCase() === 'true') {
    const missing = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM']
      .filter((key) => typeof env[key] !== 'string' || !env[key].trim());
    if (missing.length) throw new Error(`Email 2FA is enabled but SMTP configuration is missing: ${missing.join(', ')}.`);
    const port = Number(env.SMTP_PORT);
    if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('SMTP_PORT must be an integer between 1 and 65535.');
  }
}

module.exports = { validateEnv, EXAMPLE_SECRET };
