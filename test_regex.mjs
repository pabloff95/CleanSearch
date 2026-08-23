// Verifies the DNR regex behavior that decides redirect vs allow vs strip.
// Imports the exact regex strings used by the extension's declarativeNetRequest
// rules (constants.js) and wraps them with new RegExp() for testing.
import {
  GOOGLE_REGEX,
} from "./extension/constants.js";

const SEARCH_RE = new RegExp(GOOGLE_REGEX.SEARCH);
const TAB_RE = new RegExp(GOOGLE_REGEX.TAB);
const UDM_RE = new RegExp(GOOGLE_REGEX.UDM);

// For each URL + state, decide the outcome.
// ON  -> redirect (add udm=14), unless tbm= present (allow)
// OFF -> strip udm if present (redirect w/ removeParams), unless tbm= (allow)
function decision(url, active) {
  if (!SEARCH_RE.test(url)) return "no-match";
  if (TAB_RE.test(url)) return "allow"; // tab URLs always pass through
  if (active) return "redirect-add";
  // OFF
  if (UDM_RE.test(url)) return "strip-udm";
  return "pass-through"; // no udm to strip, nothing to do
}

const cases = [
  // --- ON state ---
  ["https://www.google.com/search?q=cats", true, "redirect-add"],
  ["https://www.google.com/search?q=cats&udm=14", true, "redirect-add"],
  ["https://www.google.com/search?q=cats&tbm=isch", true, "allow"],
  ["https://www.google.com/search?q=cats&tbm=nws", true, "allow"],
  ["https://www.google.com/search?q=udm", true, "redirect-add"],

  // --- OFF state ---
  ["https://www.google.com/search?q=cats", false, "pass-through"],
  ["https://www.google.com/search?q=cats&udm=14", false, "strip-udm"],
  ["https://www.google.com/search?q=cats&sca_esv=1&udm=14", false, "strip-udm"],
  ["https://www.google.com/search?q=cats&udm=14&tbm=isch", false, "allow"],
  ["https://www.google.com/search?q=cats&tbm=isch", false, "allow"],
  ["https://www.google.com/search?q=udm", false, "pass-through"],

  // --- never matches ---
  ["https://www.google.com/maps?q=cats", true, "no-match"],
  ["https://www.google.com/maps?q=cats", false, "no-match"],
  ["https://duckduckgo.com/search?q=cats", true, "no-match"],
];

let pass = true;
for (const [url, active, want] of cases) {
  const got = decision(url, active);
  const ok = got === want;
  if (!ok) pass = false;
  const label = (active ? "ON " : "OFF") + " want=" + want.padEnd(12) + " got=" + got.padEnd(12);
  console.log((ok ? "PASS" : "FAIL") + "  " + label + " " + url);
}
console.log("\n" + (pass ? "ALL PASS" : "SOME FAILED"));
process.exit(pass ? 0 : 1);
