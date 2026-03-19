import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

function transpilePromptModule(source) {
  return source
    .replace(/^import type .*;\n/m, "")
    .replace(/answers: Record<string, string>/g, "answers")
    .replace(/(profile|schemes|schemeIds): [A-Za-z_][A-Za-z0-9_\[\]]*/g, "$1")
    .replace(/\): string \{/g, ") {");
}

const promptsSource = readFileSync(
  new URL("../lib/prompts.ts", import.meta.url),
  "utf8",
);

const promptModuleUrl = `data:text/javascript,${encodeURIComponent(
  transpilePromptModule(promptsSource),
)}`;

const {
  buildActionPrompt,
  buildDocumentsPrompt,
  buildEligibilityPrompt,
  buildProfilePrompt,
} = await import(promptModuleUrl);

const profilePrompt = buildProfilePrompt({
  state: "Karnataka",
  occupation: "Farmer",
});

assert.match(
  profilePrompt,
  /Return ONLY valid JSON\. No explanation\. No markdown\. No extra text\./,
);
assert.match(profilePrompt, /"state": "Karnataka"/);
assert.match(profilePrompt, /"occupation": "Farmer"/);

const eligibilityPrompt = buildEligibilityPrompt(
  { state: "Karnataka", occupation: "Farmer", income: "Low" },
  [
    { id: "scheme-a", name: "Scheme A" },
    { id: "scheme-b", name: "Scheme B" },
  ],
);

assert.match(
  eligibilityPrompt,
  /Return ONLY valid JSON\. No markdown\. No explanation outside JSON\./,
);
assert.match(eligibilityPrompt, /"scheme-a"/);
assert.match(eligibilityPrompt, /"scheme-b"/);

const documentsPrompt = buildDocumentsPrompt(["scheme-a", "scheme-b"], [
  { id: "scheme-a", name: "Scheme A" },
  { id: "scheme-b", name: "Scheme B" },
  { id: "scheme-c", name: "Scheme C" },
]);

assert.match(documentsPrompt, /SCHEME IDs: \["scheme-a","scheme-b"\]/);
assert.doesNotMatch(documentsPrompt, /SCHEME IDs: \[\n/);
assert.match(
  documentsPrompt,
  /Return ONLY valid JSON\. No markdown\. No explanation\./,
);
assert.match(documentsPrompt, /"scheme-a"/);
assert.match(documentsPrompt, /"scheme-b"/);
assert.doesNotMatch(documentsPrompt, /"scheme-c"/);

const actionPrompt = buildActionPrompt(
  ["scheme-a", "scheme-b"],
  { state: "Karnataka", occupation: "Farmer", income: "Low" },
  [
    { id: "scheme-a", name: "Scheme A" },
    { id: "scheme-b", name: "Scheme B" },
  ],
);

assert.match(
  actionPrompt,
  /Give step-by-step apply instructions for each scheme for a citizen in Karnataka working as Farmer\./,
);
assert.match(actionPrompt, /SCHEME IDs: \["scheme-a","scheme-b"\]/);
assert.match(actionPrompt, /SCHEMES DATA:/);
assert.match(
  actionPrompt,
  /Return ONLY valid JSON\. No markdown\. No explanation\./,
);
assert.match(actionPrompt, /"scheme-a"/);
assert.match(actionPrompt, /"scheme-b"/);
assert.doesNotMatch(actionPrompt, /"scheme-c"/);

execFileSync(
  "npx",
  ["tsc", "--noEmit", "lib/prompts.ts", "lib/types.ts"],
  {
    cwd: new URL("..", import.meta.url),
    stdio: "pipe",
  },
);
