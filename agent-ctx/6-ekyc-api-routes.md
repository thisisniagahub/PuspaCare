# Task 6: eKYC API Routes

**Agent:** Main Orchestrator
**Status:** ✅ Completed

## Work Done

### Files Created

1. **`/src/app/api/v1/ekyc/route.ts`** — Main eKYC route (GET + POST)
   - **GET**: Supports `?memberId=xxx` for single member lookup, `?status=xxx` for filtering all verifications. Includes related member data (name, ic, memberNumber).
   - **POST**: Validates body with Zod, checks member exists, creates or updates EKYCVerification record. Parses icDateOfBirth string to Date. Sets initial status to "pending", walletLimit/previousLimit to 200.

2. **`/src/app/api/v1/ekyc/verify/route.ts`** — Verify route (POST)
   - Accepts `{ memberId }` or `{ id }` to identify the record.
   - Rejects with clear error if faceMatchScore < 60 or livenessScore < 60.
   - Prevents double-verification (status already "verified").
   - On success: sets status="verified", bnmCompliant=true, amlaScreening="pass", riskLevel="low", upgrades walletLimit to 5000, enables wallet and bank transfer, sets verifiedAt/verifiedBy.

3. **`/src/app/api/v1/ekyc/reject/route.ts`** — Reject route (POST)
   - Accepts `{ memberId }` or `{ id }` plus required `reason` string.
   - Prevents rejecting already-verified records.
   - Sets status="rejected" and rejectionReason.

### Design Decisions
- All error messages in Bahasa Melayu per project convention.
- Consistent response shape: `{ success: boolean, data?, error?, message? }`.
- Proper HTTP status codes (201 for create, 400 for validation/bad state, 404 for not found, 500 for server errors).
- Member relation included with select for name/ic/memberNumber in all responses.
- Zod validation with `.refine()` for XOR logic (id OR memberId required in verify/reject).

### Lint Result
- 0 errors, 4 warnings (all pre-existing react-hook-form warnings, unrelated to this task).
