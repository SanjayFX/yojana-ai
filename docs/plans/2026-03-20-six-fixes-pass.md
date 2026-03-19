# Six Fixes Pass Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the six requested fixes in one pass, keep the existing in-progress UI changes intact, and finish with typecheck, API checks, commit, and push.

**Architecture:** Keep the existing Next.js app/router structure. Add one new route handler for the explain agent, tighten the search route with a tested query helper, update the eligibility prompt text, and patch the scheme data plus UI rendering where the current worktree is still incomplete.

**Tech Stack:** Next.js 16 App Router, React 19 client page, TypeScript, Supabase, Gemini/Groq AI calls, Node built-in test runner.

---

### Task 1: Regression Checks First

**Files:**
- Create: `tests/prompts.test.ts`
- Create: `tests/search-route.test.ts`
- Modify: `src/app/api/schemes/search/route.ts`
- Modify: `src/lib/prompts.ts`

**Step 1: Write the failing tests**

- Assert the eligibility prompt includes the new additional accuracy rules text.
- Assert the search helper translates regional input and preserves both original and translated search terms.

**Step 2: Run tests to verify they fail**

Run: `node --test tests/prompts.test.ts tests/search-route.test.ts`

Expected: failures because the prompt rules and tested search helper behavior are not fully implemented yet.

### Task 2: Finish Production Changes

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/app/api/schemes/search/route.ts`
- Modify: `src/lib/prompts.ts`
- Modify: `src/data/schemes.json`
- Create: `src/app/api/explain/route.ts`

**Step 1: Complete the remaining UI and API patches**

- Keep the existing SVG chakra and helpline/explainer UI work.
- Add the new explain route handler.
- Finish search matching so it checks both raw and translated terms.
- Add the requested additional accuracy rules to the eligibility prompt.
- Update helplines in the local scheme data.

**Step 2: Update the live Supabase records**

- Use the service-role credentials already present in the workspace env to apply the helpline updates to the `schemes` table.

### Task 3: Verify and Ship

**Files:**
- No code changes required unless verification fails.

**Step 1: Run verification**

- `node --test tests/prompts.test.ts tests/search-route.test.ts`
- `npx tsc --noEmit`
- `npm run dev`
- Requested `curl` checks for `find-schemes`, search, and explain.

**Step 2: Commit and push**

- `git add .`
- `git commit -m "feat: chakra fix, helplines, multilingual search, better matching, explain agent — full debug pass"`
- `git push origin main`
