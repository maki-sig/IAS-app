# Encryption Key Setup for AES-256 Data Protection

## Overview

The IAS application uses AES-256-GCM encryption to protect sensitive Personally Identifiable Information (PII) stored in the database.

**Encrypted Fields:**
- First Name (fname)
- Middle Name (mname)
- Last Name (lname)
- Birth Date (birth_date)
- Address (address)
- Contact Number (contact_no)

## Generating the Encryption Key

To generate a secure 32-byte (256-bit) encryption key, run:

```bash
node -e "console.log(crypto.randomBytes(32).toString('hex'))"
```

This will output a 64-character hexadecimal string.

## Setting Up the Environment Variable

Add the generated key to your `.env.local` file:

```env
ENCRYPTION_KEY=<your-64-character-hex-key-here>
```

**Example:**
```env
ENCRYPTION_KEY=a1b2c3d4e5f6789012345678901234567890123456789012345678901234ab
```

## Security Best Practices

1. **Key Management:**
   - Never commit the `.env.local` file to version control
   - Use different keys for development and production
   - Rotate encryption keys periodically (requires data re-encryption)

2. **Key Storage:**
   - Store the production key in a secure secrets management system (AWS Secrets Manager, HashiCorp Vault, etc.)
   - Restrict access to the key to authorized personnel only

3. **Database Encryption:**
   - This application encrypts data at the application layer
   - Ensure your Supabase database also has encryption at rest enabled

4. **Backup & Recovery:**
   - Keep encrypted backups of the encryption key in a secure location
   - Document the key rotation procedure

## How It Works

### Encryption Process (Writing Data)

1. User submits employee data via forms
2. Server-side actions (registerEmployee, updateEmployee) validate the data
3. Sensitive fields are encrypted using AES-256-GCM before database insertion
4. Encrypted data is stored in the database

**Encryption Format:** `IV:AuthTag:EncryptedData` (all hex-encoded)
- IV: 12-byte initialization vector (random)
- AuthTag: 16-byte authentication tag (ensures data integrity)
- EncryptedData: The actual encrypted payload

### Decryption Process (Reading Data)

1. Data is fetched from the database
2. Encrypted fields are automatically decrypted
3. Decrypted data is passed to frontend components for display
4. Search and filtering operate on decrypted values

## Verification

To verify encryption is working:

1. Log in to your Supabase dashboard
2. Navigate to the `EMPLOYEE` table
3. View the `fname`, `mname`, `lname`, `birth_date`, `address`, and `contact_no` columns
4. The data should appear as random-looking strings like: `a1b2c3d4:e5f6789012345678:9abcdef1234567890...`

## Troubleshooting

**Error: "ENCRYPTION_KEY environment variable is not set"**
- Solution: Add the encryption key to your `.env.local` file

**Error: "ENCRYPTION_KEY must be exactly 64 hex characters"**
- Solution: Regenerate the key using the command above

**Decryption failures in logs**
- Possible causes:
  - Wrong encryption key in the environment
  - Corrupted encrypted data in the database
  - Manually edited encrypted values
- Solution: Verify the encryption key is correct; check database integrity

## Data Migration

If you have existing unencrypted data, you'll need to encrypt it:

```javascript
// This would be a one-time migration script
// Update all existing employee records with encrypted values
// using the encryptFields() function from utils/encryption.ts
```

Contact the security team for data migration assistance.
