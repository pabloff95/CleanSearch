// Verifies the DNR regex behavior that decides redirect vs allow.
// Mirrors the two regexes in extension/main.js.
const SEARCH_REGEX = /^https?:\/\/(?:[a-z0-9-]+\.)*google\.[a-z.]+\/search\?/;
const TAB_REGEX = /^https?:\/\/(?:[a-z0-9-]+\.)*google\.[a-z.]+\/search\?.*tbm=/;

// For each URL, decide whether the request should be REDIRECTED (add udm=14)
// or ALLOWED (left untouched) when the extension is active.
function decision(url) {
  if (!SEARCH_REGEX.test(url)) return "no-match";
  if (TAB_REGEX.test(url)) return "allow";
  return "redirect";
}

const cases = [
  ["https://www.google.com/search?q=cats", "redirect"],
  ["http://google.com/search?q=cats", "redirect"],
  ["https://www.google.co.uk/search?q=cats&hl=en", "redirect"],
  ["https://www.google.com/search?q=cats&udm=14", "redirect"], // re-assert udm=14 (idempotent)
  ["https://www.google.com/search?q=cats&tbm=isch", "allow"],
  ["https://www.google.com/search?tbm=vid&q=cats", "allow"],
  ["https://www.google.com/search?q=cats&sca_esv=1&tbm=nws", "allow"],
  ["https://www.google.com/search?q=cats&tbm=shop", "allow"],
  ["https://www.google.com/search?q=tbm", "redirect"], // 'tbm' as a search term, not a param
  ["https://images.google.com/search?q=cats", "redirect"],
  ["https://www.google.com/maps?q=cats", "no-match"],
  ["https://www.google.com/search", "no-match"], // no query string
  ["https://www.google.com/", "no-match"],
  ["https://duckduckgo.com/search?q=cats", "no-match"],
];

let pass = true;
for (const [url, want] of cases) {
  const got = decision(url);
  const ok = got === want;
  if (!ok) pass = false;
  console.log((ok ? "PASS" : "FAIL") + "  want=" + want.padEnd(9) + " got=" + got.padEnd(9) + " " + url);
}
console.log("\n" + (pass ? "ALL PASS" : "SOME FAILED"));
process.exit(pass ? 0 : 1);
