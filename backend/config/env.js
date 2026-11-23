const EXAMPLE_SECRET = 'REPLACE_WITH_64_CHAR_RANDOM_HEX_SECRET';

function validateEnv() {
  const secret = process.env.JWT_SECRET;
  if (typeof secret !== 'string' || secret.trim().length < 32 || secret.trim() === EXAMPLE_SECRET) {
    throw new Error('JWT_SECRET must be set to a unique secret of at least 32 characters (the .env.example placeholder is not allowed).');
  }
}

module.exports = { validateEnv, EXAMPLE_SECRET };
