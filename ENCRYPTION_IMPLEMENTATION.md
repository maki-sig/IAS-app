# AES-256 Encryption Implementation for Employee PII

## Summary

This document provides a comprehensive guide to the AES-256-GCM encryption implementation for the IAS application, focusing on protecting Personally Identifiable Information (PII) stored in the employee records.

---

## 🔐 Encrypted Data Fields

The following sensitive fields are now encrypted using AES-256-GCM:

| Field | PII Category | Database Column |
|-------|-------------|-----------------|
| First Name | Identity | fname |
| Middle Name | Identity | mname |
| Last Name | Identity | lname |
| Birth Date | Personal | birth_date |
| Address | Location | address |
| Contact Number | Communication | contact_no |

---

## 🛠️ Implementation Components

### 1. **Encryption Utility** (`utils/encryption.ts`)

**Features:**
- AES-256-GCM encryption with authenticated encryption
- Random 12-byte initialization vector (IV) per encryption
- 16-byte authentication tag for integrity verification
- Hex-encoded output format: `IV:AuthTag:EncryptedData`

**Key Functions:**
- `encryptData(plaintext)` - Encrypts a single string
- `decryptData(encryptedString)` - Decrypts encrypted data
- `encryptFields(data, fields)` - Encrypts multiple fields in an object
- `decryptFields(data, fields)` - Decrypts multiple fields in an object

**Encryption Key Management:**
- 256-bit (32-byte) key stored in `ENCRYPTION_KEY` environment variable
- Key validation on module load
- Automatic error handling for missing/invalid keys

### 2. **Server Actions** (`app/actions.ts`)

**Modified Functions:**

#### `registerEmployee()`
- Validates input data before encryption
- Encrypts sensitive fields using `encryptFields()`
- Stores encrypted data in the EMPLOYEE table
- Returns success/error response

#### `updateEmployee()`
- Validates updated employee data
- Encrypts sensitive fields before update
- Updates encrypted data in the database
- Revalidates dashboard cache

### 3. **Dashboard Data Retrieval** (`components/DashboardContent.tsx`)

**Data Flow:**
1. Fetches encrypted employee records from database
2. Automatically decrypts sensitive fields using `decryptFields()`
3. Passes decrypted data to dashboard components
4. Maintains data integrity and validity for display/filtering

**Decryption Points:**
- **Employees Tab:** Decrypts all employee records for display
- **Credentials Tab:** Decrypts employee names for dropdown selection
- **User Data:** Decrypts employee information linked to user accounts

### 4. **Frontend Components**

**DashboardClient.tsx** - No changes needed
- Receives already-decrypted data
- Filtering and search work on plaintext values
- Display functions work seamlessly

**CredentialModal.tsx** - No changes needed
- Receives decrypted employee names
- Displays employee information correctly in dropdown

---

## 🔑 Encryption Key Setup

### Generate Encryption Key

```bash
# Generate a random 32-byte (256-bit) key
node -e "console.log(crypto.randomBytes(32).toString('hex'))"
```

**Output Example:**
```
a1b2c3d4e5f6789012345678901234567890123456789012345678901234ab
```

### Configure Environment

Add to `.env.local`:
```env
ENCRYPTION_KEY=a1b2c3d4e5f6789012345678901234567890123456789012345678901234ab
```

---

## 🔄 Data Flow Diagram

### Writing Data (Encryption)
```
User Form Input
    ↓
Input Validation (registerEmployee/updateEmployee)
    ↓
Encrypt Sensitive Fields (encryptFields)
    ↓
Store in Database (EMPLOYEE table)
    ↓
Encrypted Data at Rest
```

### Reading Data (Decryption)
```
Query Database (DashboardContent)
    ↓
Retrieve Encrypted Records
    ↓
Decrypt Fields (decryptFields)
    ↓
Pass Decrypted Data to Components
    ↓
Display/Filter/Search
```

---

## 🔒 Security Features

### 1. **Authenticated Encryption**
- Uses AES-256-GCM (Galois/Counter Mode)
- Provides both confidentiality AND authenticity
- Detects tampering with encrypted data

### 2. **Random Initialization Vectors**
- Each encryption uses a unique 12-byte random IV
- Prevents pattern detection in encrypted data
- Different ciphertexts for identical plaintext

### 3. **Secure Key Storage**
- 256-bit (32-byte) cryptographic key
- Stored in environment variables (never in code)
- Should be managed by a secrets management system in production

### 4. **Data Integrity**
- 16-byte authentication tag prevents unauthorized modifications
- Decryption fails if data is tampered with
- Errors logged but don't crash the application

---

## 📋 Field Validation (Pre-Encryption)

All data is validated BEFORE encryption:

| Field | Validation Rules |
|-------|-----------------|
| fname/mname/lname | Letters, spaces, apostrophes, hyphens, periods only |
| birth_date | YYYY-MM-DD format, between 1900-2099 |
| address | Letters, numbers, spaces, commas, periods, hyphens |
| contact_no | Philippine mobile format (09XXXXXXXXX) |

---

## ⚠️ Important Notes

### Data Storage
- Encrypted data is stored as hex strings in the database
- Example encrypted value: `a1b2c3d4e5f6789:0123456789abcdef:9876543210fedcba...`
- Original plaintext is NEVER stored

### Search & Filtering
- Searches happen on DECRYPTED data in memory
- Cannot search on encrypted database values directly
- All employee records are decrypted on dashboard load

### Performance Implications
- Decryption happens on each page load (for employees tab)
- Minimal performance impact for typical record counts
- Consider caching strategies for large datasets (>10,000 records)

### Key Rotation
- To rotate keys: decrypt all data with old key, re-encrypt with new key
- No automatic key rotation script provided (requires manual implementation)
- Plan key rotation procedure with security team

---

## ✅ Verification Steps

### 1. Verify Encryption Key
```bash
# Should output 64 hex characters
echo $ENCRYPTION_KEY | wc -c
# Should show: 65 (64 chars + newline)
```

### 2. Check Database
- Log into Supabase dashboard
- View EMPLOYEE table
- Encrypted fields should appear as random hex strings
- Example: `a1b2c3d4e5f6789012345678:...`

### 3. Test Application
1. Log in with valid credentials
2. Create a new employee with test data
3. Verify data displays correctly on dashboard
4. Check Supabase table shows encrypted values
5. Search/filter employees (should work on decrypted values)

### 4. Monitor Logs
```bash
npm run dev
# Watch for any decryption errors in console
# Look for "[utils/encryption.ts]" messages
```

---

## 🐛 Troubleshooting

### "ENCRYPTION_KEY environment variable is not set"
- **Cause:** Missing environment variable
- **Solution:** Add `ENCRYPTION_KEY` to `.env.local`

### "ENCRYPTION_KEY must be exactly 64 hex characters"
- **Cause:** Invalid key length
- **Solution:** Regenerate key: `node -e "console.log(crypto.randomBytes(32).toString('hex'))"`

### "Decryption failed" in logs
- **Cause:** Wrong encryption key, corrupted data, or manual edits
- **Solution:** 
  1. Verify correct key in `.env.local`
  2. Check database for data corruption
  3. Don't manually edit encrypted fields

### Employee data shows as gibberish
- **Cause:** Encryption key changed or data corrupted
- **Solution:** Restore from backup or regenerate data

---

## 📚 Files Modified/Created

### New Files
- `utils/encryption.ts` - AES-256 encryption utility
- `ENCRYPTION_SETUP.md` - Detailed setup guide
- `.env.example` - Updated with ENCRYPTION_KEY variable
- `ENCRYPTION_IMPLEMENTATION.md` - This document

### Modified Files
- `app/actions.ts` - Added encryption to registerEmployee/updateEmployee
- `components/DashboardContent.tsx` - Added decryption when fetching data

### Unchanged Files
- `components/DashboardClient.tsx` - Works with decrypted data
- `components/CredentialModal.tsx` - Works with decrypted data
- `app/dashboard/page.tsx` - No encryption logic needed
- All other components - No changes required

---

## 🔗 References

### Encryption Standard
- **Algorithm:** AES (Advanced Encryption Standard)
- **Mode:** GCM (Galois/Counter Mode)
- **Key Size:** 256 bits (32 bytes)
- **IV Size:** 12 bytes (96 bits)
- **Auth Tag Size:** 16 bytes (128 bits)
- **Reference:** NIST SP 800-38D

### Node.js Crypto Module
- Documentation: https://nodejs.org/api/crypto.html
- createCipheriv() - Encryption
- createDecipheriv() - Decryption
- getAuthTag()/setAuthTag() - Authenticated encryption

---

## 🔐 Compliance & Security Considerations

### GDPR Compliance
- Encryption at rest protects personal data
- Meets data protection principles
- Supports right to deletion (decrypt and delete)

### HIPAA Compliance (if applicable)
- AES-256-GCM meets encryption requirements
- Should complement database-level encryption

### PCI DSS Compliance
- Strong encryption (AES-256) for sensitive data
- Proper key management recommended
- Integration with key management service recommended for production

---

**Last Updated:** May 2026
**Version:** 1.0
**Status:** Production Ready
