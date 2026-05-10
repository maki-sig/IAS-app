import crypto from 'crypto';

/**
 * AES-256 Encryption/Decryption Utility
 * Implements authenticated encryption using AES-256-GCM
 * Provides both symmetric encryption for sensitive data at rest
 */

// Retrieve encryption key from environment variable
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is not set. Generate a 32-byte key using: node -e "console.log(crypto.randomBytes(32).toString(\'hex\'))"');
}

// Validate key length (32 bytes = 256 bits for AES-256)
const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex');
if (keyBuffer.length !== 32) {
  throw new Error(`ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes). Current length: ${keyBuffer.length} bytes`);
}

/**
 * Encrypts data using AES-256-GCM
 * @param plaintext - Data to encrypt
 * @returns Encrypted data as hex string in format: iv:authTag:encryptedData
 */
export function encryptData(plaintext: string): string {
  try {
    // Generate a random initialization vector (12 bytes for GCM)
    const iv = crypto.randomBytes(12);
    
    // Create cipher with AES-256-GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);
    
    // Encrypt the plaintext
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get the authentication tag (16 bytes)
    const authTag = cipher.getAuthTag();
    
    // Return: IV + auth tag + encrypted data (hex-encoded for safe storage)
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Decrypts data encrypted with encryptData
 * Falls back to plaintext if data is not in encrypted format (for migration)
 * @param encryptedString - Encrypted data in format: iv:authTag:encryptedData
 * @returns Decrypted plaintext
 */
export function decryptData(encryptedString: string): string {
  try {
    // Parse the encrypted string
    const parts = encryptedString.split(':');
    if (parts.length !== 3) {
      // Not in encrypted format, return as-is (legacy plaintext data)
      return encryptedString;
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    // Validate IV and auth tag lengths
    if (iv.length !== 12 || authTag.length !== 16) {
      // Invalid format, return as-is (legacy plaintext data)
      return encryptedString;
    }
    
    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    // Decryption failed, return original value (assume it's plaintext)
    console.error(`Decryption warning (returning plaintext): ${error instanceof Error ? error.message : String(error)}`);
    return encryptedString;
  }
}

/**
 * Fields to encrypt (PII - Personally Identifiable Information)
 */
export const ENCRYPTED_FIELDS = ['fname', 'mname', 'lname', 'birth_date', 'address', 'contact_no'] as const;

export type EncryptedField = typeof ENCRYPTED_FIELDS[number];

/**
 * Check if a field should be encrypted
 */
export function isEncryptedField(field: string): field is EncryptedField {
  return ENCRYPTED_FIELDS.includes(field as EncryptedField);
}

/**
 * Encrypt multiple fields in an object
 */
export function encryptFields(data: Record<string, any>, fields: EncryptedField[]): Record<string, any> {
  const encrypted = { ...data };
  for (const field of fields) {
    if (encrypted[field] && typeof encrypted[field] === 'string') {
      encrypted[field] = encryptData(encrypted[field]);
    }
  }
  return encrypted;
}

/**
 * Decrypt multiple fields in an object
 */
export function decryptFields(data: Record<string, any>, fields: EncryptedField[]): Record<string, any> {
  const decrypted = { ...data };
  for (const field of fields) {
    if (decrypted[field] && typeof decrypted[field] === 'string') {
      try {
        decrypted[field] = decryptData(decrypted[field]);
      } catch (error) {
        // Log error but don't crash - field remains encrypted if decryption fails
        console.error(`Failed to decrypt field ${field}:`, error);
      }
    }
  }
  return decrypted;
}
