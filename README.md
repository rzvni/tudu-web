# tudu-web

Minimal web frontend for [tudu](https://github.com/rzvni/tudu) — single-page work-task app, gated behind a TOTP authenticator code. Reads/writes via the existing tudu API at `tudu-beta.vercel.app`.

## Stack

- Next.js 16 (App Router, Server Actions)
- TOTP auth (RFC 6238) + HMAC-signed session cookie (30 days)
- Talks to backend over HTTP using bearer token

## Local dev

```bash
pnpm install
cp .env.example .env.local   # fill in secrets
pnpm dev                     # http://localhost:3000
```

## Env vars

| Name | What |
| --- | --- |
| `TUDU_API_BASE` | Backend base URL, e.g. `https://tudu-beta.vercel.app` |
| `TUDU_BEARER_TOKEN` | Bearer token for backend (same as iOS app uses) |
| `TOTP_SECRET` | base32 TOTP secret, scan into authenticator app |
| `SESSION_SECRET` | 64-char hex, signs the session cookie |

### Generate fresh secrets

```bash
node -e "
const crypto = require('crypto');
const ALPH='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function b32e(b){let bits=0,v=0,o='';for(const x of b){v=(v<<8)|x;bits+=8;while(bits>=5){o+=ALPH[(v>>>(bits-5))&31];bits-=5;}}if(bits>0)o+=ALPH[(v<<(5-bits))&31];return o;}
const totp = b32e(crypto.randomBytes(20));
const session = crypto.randomBytes(32).toString('hex');
const otpauth = 'otpauth://totp/' + encodeURIComponent('tudu:work') + '?secret=' + totp + '&issuer=tudu&algorithm=SHA1&digits=6&period=30';
console.log('TOTP_SECRET=' + totp);
console.log('SESSION_SECRET=' + session);
console.log('OTPAUTH_URI=' + otpauth);
"
```

Scan the `OTPAUTH_URI` (or paste secret manually) into Google Authenticator / Authy / 1Password etc.

## Deploy (Vercel)

1. `vercel link` (pick project / create new)
2. `vercel env add TUDU_API_BASE production`
3. `vercel env add TUDU_BEARER_TOKEN production`
4. `vercel env add TOTP_SECRET production`
5. `vercel env add SESSION_SECRET production`
6. `vercel deploy --prod`

## Routes

| Path | What |
| --- | --- |
| `/` | Work-task list + add input (auth-gated → redirects to `/login`) |
| `/login` | TOTP code entry |

Tasks created here automatically get `category: "Work"` and the page filters the list by that category.
