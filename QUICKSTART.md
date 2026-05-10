# Quick Start: AES-256 Encryption & RBAC

## TL;DR - Get Started in 2 Minutes

### Step 1: Generate Encryption Key (30 seconds)

```bash
node -e "console.log(crypto.randomBytes(32).toString('hex'))"
# Copy the output (64 hex characters)
```

### Step 2: Add to .env.local (30 seconds)

```env
ENCRYPTION_KEY=paste_your_64_hex_characters_here
```

### Step 3: Start App (1 minute)

```bash
npm run dev
```

**Done!** 🎉 Encryption and RBAC are now active.

---

## What's Protected Now?

### Encryption (AES-256-GCM)
✅ Employee Names (fname, mname, lname)  
✅ Birth Dates  
✅ Addresses  
✅ Contact Numbers  

All encrypted in the database, automatically decrypted when displayed.

### Access Control (Role-Based)
✅ Admins only → `/dashboard`  
✅ Non-admins → `/welcome`  
✅ Unauthenticated → `/` (login)

---

## Testing

### Test Encryption
1. Create a new employee
2. Open Supabase dashboard → EMPLOYEE table
3. Employee names should look like gibberish: `a1b2c3d4e5f6789:...`

### Test RBAC
1. Login as admin → Can access `/dashboard` ✅
2. Login as manager → Redirected to `/welcome` ✅
3. Not logged in → Redirected to `/` ✅

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "ENCRYPTION_KEY not set" | Add to `.env.local` |
| "Must be 64 hex chars" | Run the generate command again |
| Employee data looks encrypted in dashboard | Wrong encryption key (check `.env.local`) |
| Can't access dashboard as admin | Check `user_role` cookie is set to `'admin'` |

---

## Documentation

- 📖 [Full Setup Guide](./ENCRYPTION_SETUP.md)
- 📖 [Technical Details](./ENCRYPTION_IMPLEMENTATION.md)  
- 📖 [Security Overview](./SECURITY_IMPLEMENTATION.md)

---

## Key Concepts

**Encryption:** AES-256-GCM
- 256-bit key (very strong)
- Random IV per encryption (unique ciphertext each time)
- Authentication tag (detects tampering)

**Access Control:** Cookie-based RBAC
- Middleware layer: Route protection
- Page-level guard: Backup check
- Role validation: `admin` only for dashboard

**Data Flow:** Encrypt on write, decrypt on read
- Form → Validate → Encrypt → Database
- Database → Fetch → Decrypt → Display

---

## What Changed?

### New Files
```
utils/encryption.ts              ← AES-256 encryption utility
ENCRYPTION_SETUP.md              ← Setup guide
ENCRYPTION_IMPLEMENTATION.md     ← Technical docs
SECURITY_IMPLEMENTATION.md       ← Overview
```

### Modified Files
```
app/actions.ts                   ← Encrypts on insert/update
components/DashboardContent.tsx  ← Decrypts on fetch
utils/supabase/middleware.ts     ← RBAC enforcement
app/dashboard/page.tsx           ← Server-side role check
```

---

## One More Thing

**Backup Your Encryption Key!**

If you lose it, you won't be able to decrypt existing data.

```bash
# Save it somewhere secure (not in code)
echo "ENCRYPTION_KEY=<your_key>" > encryption-key-backup.txt
chmod 600 encryption-key-backup.txt  # Make it read-only for you
```

---

**Questions?** Check the full documentation in the files above. 🔐
