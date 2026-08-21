// CREDENTIALS_DB with correct SHA-256 hashes
const CREDENTIALS_DB: Record<string, string> = {
  admin: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', // admin
  manager: '6ee4a469cd4e91053847f5d3fcb61dbcc91e8f0ef10be7748da4c4a1ba382d17', // manager
  kitchen: '3171d89ad00530ffa19a244f040e9401a657903cbbbca724996b90a56df2c189', // kitchen
  waiter: '9beb7c0bd91394a08c1138752c0f196ab638f1da2c290184890184cfcb821ab4', // waiter
};

// Improved hashPassword with explicit UTF-8 encoding
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Enhanced validation with case normalization and length check
export async function validateCredentials(
  username: string, password: string
): Promise<string | null> {
  // Normalize inputs
  let normalizedUsername = username.toLowerCase();
  if (normalizedUsername === 'administrator') {
    normalizedUsername = 'admin';
  }
  const normalizedPassword = password.toLowerCase();

  if (normalizedUsername.length < 3) return null;
  if (normalizedPassword.length < 4) return null;

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));

  if (!CREDENTIALS_DB[normalizedUsername]) return null;

  const storedHash = CREDENTIALS_DB[normalizedUsername];
  const providedHash = await hashPassword(normalizedPassword);

  return providedHash === storedHash ? normalizedUsername : null;
}