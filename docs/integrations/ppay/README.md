# Ppay Integration Guide (Portable)

Vendor-only Ppay (MFS payment gateway) integration reference. No project-specific
content — copy this folder into any project to integrate Ppay checkout, IPN webhook,
instant payout, and refunds.

Sandbox base: `https://p-pay-api.dev-polygontech.xyz/api`. Credentials issued per-project
by Polygon Technology / Ppay merchant portal.

---

## 0. Concepts

- **Classic Checkout** — single-step. You initiate → get a redirect URL → send the
  buyer's browser there → Ppay hosts the payment page → Ppay redirects back AND posts an IPN.
- **IPN webhook** — the *only authoritative* confirmation. Browser redirect alone never
  confirms a payment. Wait for IPN `status: SUCCESSFUL`.
- **Instant Payout** — disburse to recipient wallets (`bulks[]`).
- **Refund** — full/partial, up to 10 per transaction.
- All API calls require a `Bearer <idToken>` obtained via the token endpoints.

---

## 1. Environment variables

| Variable | Description |
|---|---|
| `P_PAY_BASEURL` | API base, e.g. `https://p-pay-api.dev-polygontech.xyz/api` |
| `P_PAY_MERCHANT_MID` | Merchant ID (numeric string) |
| `P_PAY_APIKEY` | API key from merchant portal |
| `P_PAY_API_SECRET` | API secret from merchant portal |
| `P_PAY_IPN_URL` | Your public webhook URL (must be reachable by Ppay; use ngrok in dev) |
| `P_PAY_SUCCESS_URL` | Browser redirect on success |
| `P_PAY_FAIL_URL` | Browser redirect on failure |
| `P_PAY_CANCEL_URL` | Browser redirect on cancel |
| `P_PAY_TIMEOUT_MS` | API call timeout (default `30000`) |

Secrets in a vault (AWS Secrets Manager / equivalent) for prod. Never log
`P_PAY_API_SECRET`, `idToken`, or `refreshToken`. Never return tokens in API responses.

---

## 2. Authentication — Token Lifecycle

Server-side only. No customer interaction.

### Grant token
```
POST {BASEURL}/auth/grant
Content-Type: application/json
Accept: application/json

{ "mid": "<MERCHANT_MID>", "apiKey": "<APIKEY>", "apiSecret": "<API_SECRET>" }

→ 200
{ "idToken": "<JWT>", "refreshToken": "<JWT>" }
```

### Refresh token
```
POST {BASEURL}/auth/refresh
Content-Type: application/json

{ "token": "<refreshToken>" }

→ 200
{ "idToken": "<JWT>", "refreshToken": "<JWT>" }
```

**Policy:**
- Lifetime: **3600 s (1 hour)**.
- Refresh at the **50–55 min** mark.
- On expiry/cache-miss: re-grant.
- Put `idToken` in `Authorization: Bearer <idToken>` on all subsequent calls.
- Recommended store: Redis with TTL; background refresh at min 52.

---

## 3. Classic Checkout

### Initiate
```
POST {BASEURL}/checkout/initiate
Content-Type: application/json
Authorization: Bearer <idToken>

{
  "uniqueIdForMerchant": "<your order/payment id, max 100 chars>",
  "amount": 150,                       // integer, whole currency unit ($150.00 → 150)
  "purchaseInfo": "<short description>",
  "ipnURL":     "<P_PAY_IPN_URL>",
  "successURL": "<P_PAY_SUCCESS_URL>",
  "failURL":    "<P_PAY_FAIL_URL>",
  "cancelURL":  "<P_PAY_CANCEL_URL>",
  "payerReference": "<optional 11-digit phone — auto-fills wallet>",
  "remarks": "<optional>"
}

→ 200
{ "paymentId": "<uuid>", "redirectUrl": "<url>" }
```

**Amount:** integer, whole units. Round half-up. No decimals. Internally keep money as
`numeric(14,2)` / strings — never floats.

### Flow
```
1. Backend POST /checkout/initiate → { paymentId, redirectUrl }
2. Store paymentId against your order row (state = pending)
3. Redirect buyer browser → redirectUrl (Ppay-hosted page)
4. Buyer enters wallet number, OTP, PIN on Ppay page
5. Ppay browser-redirects to successURL / failURL / cancelURL  (UI only)
6. Ppay POSTs IPN webhook → backend confirms  (authoritative)
```

Do not fulfill the order until IPN `SUCCESSFUL` is received and processed.

### Redirect pages (UI only, no state change)
| URL | Show |
|---|---|
| success | "Payment submitted — awaiting confirmation" |
| failure | "Payment failed — try again" |
| cancel | "Payment cancelled" |

---

## 4. IPN Webhook

Ppay POSTs to `P_PAY_IPN_URL` on payment events.

```json
{
  "paymentId": "<uuid>",
  "uniqueIdForMerchant": "<your id sent at checkout>",
  "status": "SUCCESSFUL | FAILED | CANCELLED | INITIATED",
  "transactionId": "<string>",
  "failReason": "<string | null>"
}
```

### Handling
| status | Action |
|---|---|
| `SUCCESSFUL` | mark order paid; fulfill |
| `FAILED` | mark failed |
| `CANCELLED` | mark cancelled |
| `INITIATED` | ack 200, no state change |

### Required webhook rules
- **Validate signature.** Ppay signs each notification; mechanism not formally documented.
  Most likely Ppay sends `P_PAY_API_SECRET` as an `x-api-key` header:
  ```js
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.P_PAY_API_SECRET) {
    return res.status(401).json({ error: 'signature_invalid' });
  }
  ```
  Verify in sandbox. Fallback: source-IP allowlist until confirmed. Invalid/missing
  credential → **401** + audit log.
- **Idempotency.** Use `paymentId` as the dedupe key. Duplicate callbacks → 200, no
  second state transition.
- **Always 200 for already-processed / unknown payments** (Ppay test events); 400 only
  for malformed payloads (Ppay should not retry those).
- Serve the webhook from an **isolated endpoint** with minimal write surface — ideally a
  separate service, not your main API.

---

## 5. Query Payment (fallback when IPN doesn't arrive)

```
GET {BASEURL}/manage/query?paymentId=<uuid>
  OR ?mid=<MERCHANT_MID>&uniqueId=<uniqueIdForMerchant>
Authorization: Bearer <idToken>

→ 200
{ "paymentId", "uniqueIdForMerchant", "status", "transactionId", "failReason" }
```
Same shape as IPN. Prefer `paymentId` as lookup key.

---

## 6. Instant Payout (disbursement)

### Initiate
```
POST {BASEURL}/api/v1/instant-payment/initiate
Authorization: Bearer <idToken>

{
  "payerReference": "<merchant phone, 11 digits>",
  "successURL": "<P_PAY_SUCCESS_URL>",
  "failURL":    "<P_PAY_FAIL_URL>",
  "cancelURL":  "<P_PAY_CANCEL_URL>",
  "bulks": [
    { "toAccount": "<recipient wallet number>", "amount": 127 }   // integer, whole units
  ]
}

→ 200
{ "paymentId": "<uuid>", "redirectUrl": "<authorise url>", "statusUrl": "<poll url>" }
```
Supports multiple recipients in one call. Merchant/admin may need to authorise via `redirectUrl`.

### Check disbursement status
```
GET {BASEURL}/api/v1/instant-payment/disbursements?instantPaymentRequest=<paymentId>
Authorization: Bearer <idToken>

→ 200
{
  "instantPayments": [
    {
      "requestId", "fromAccount", "toAccount", "amount",
      "status": "SUCCESS | FAILED | PENDING",
      "failedReason", "referenceNumber", "merchantId", "createdAt"
    }
  ]
}
```

---

## 7. Refund

Full + partial. Up to **10 refunds per transaction** until full amount refunded.

### Initiate
```
POST {BASEURL}/manage/refund
Authorization: Bearer <idToken>

{ "paymentId": "<uuid>", "ipnURL": "<P_PAY_IPN_URL>", "reason": "<string>" }

→ 200
{
  "paymentId", "originalTransactionId", "refundReason",
  "refundStatus": "INITIATED | SUCCESSFUL | FAILED | CANCELLED",
  "refundTransactionId", "refundFailReason"
}
```
> ⚠️ Docs show **no `amount` field** despite claiming partial refunds. Confirm with Ppay
> whether `amount` is a hidden required field or each call refunds the full remaining balance.

### Query refund
```
GET {BASEURL}/manage/refund/query?paymentId=<uuid>
  OR ?mid=<MERCHANT_MID>&uniqueId=<uniqueIdForMerchant>
Authorization: Bearer <idToken>

→ 200  (same shape as refund initiate response)
```

---

## 8. Feature availability

| Feature | Status |
|---|---|
| Classic Checkout | Available ✓ |
| Instant Payout | Available ✓ |
| Tokenized Checkout | Available |
| Trusted Checkout | Available |
| After Service Payment | Upcoming |
| Subscriptions | Upcoming |

---

## 9. Security checklist

- [ ] All Ppay calls server-side only. No client/browser holds Ppay credentials.
- [ ] No user-facing endpoint directly initiates a Ppay funds transfer.
- [ ] IPN signature/credential validated; failure → 401 + audit log.
- [ ] IPN idempotent on `paymentId`.
- [ ] `P_PAY_API_SECRET`, `idToken`, `refreshToken` never logged or returned.
- [ ] Tokens in cache (Redis) only, with TTL — not persisted in DB.
- [ ] Prod credentials in a secrets vault.
- [ ] TLS on all endpoints; webhook URL is HTTPS in prod.
- [ ] Money handled as integer (to Ppay) / decimal-string (internal). No floats.
- [ ] 30 s timeout on all Ppay calls.

---

## 10. Integration steps

1. Get sandbox `MID` / `APIKEY` / `API_SECRET` from Ppay merchant portal.
2. Set env vars (§1). Expose a public IPN URL (ngrok in dev).
3. Implement token service: grant → cache idToken+refreshToken in Redis → refresh at min 52.
4. Implement checkout: `POST /checkout/initiate` → store `paymentId` → redirect browser.
5. Implement webhook receiver: validate `x-api-key`, dedupe on `paymentId`, transition order
   state, ack 200. Isolated endpoint.
6. Add query-payment fallback for missing IPNs.
7. (If paying out) implement instant-payout initiate + status poll.
8. (If refunding) implement refund initiate + query.
9. Test in sandbox: confirm IPN signing header, refund amount semantics, retry policy.
10. Prod: move secrets to vault; HTTPS everywhere; legal/fund-holding clearance if you hold funds.

---

## 11. Open questions to confirm with Ppay

- IPN signing mechanism (verify `x-api-key: <API_SECRET>` assumption in sandbox).
- Partial refund `amount` field (missing from docs).
- Webhook retry policy (back-off, max attempts).
- Settlement timing (T+N days).
- Checkout timeout default.
