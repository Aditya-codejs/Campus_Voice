export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32 || secret.includes('<') || secret.includes('>')) {
    throw new Error('JWT_SECRET must be configured with at least 32 random characters.');
  }
  return secret;
};
