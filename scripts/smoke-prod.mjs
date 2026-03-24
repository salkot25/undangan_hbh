import process from "node:process";

const PROD_URL = process.env.SMOKE_URL || "https://undangan.salkot.online/";
const REQUIRED_ASSET_PREFIX = process.env.SMOKE_ASSET_PREFIX || "/assets/";
const REQUIRED_GAS_HOST = process.env.SMOKE_GAS_HOST || "script.google.com";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function extractFirstMatch(text, regex, label) {
  const match = text.match(regex);
  assert(match && match[1], `Gagal menemukan ${label} di HTML.`);
  return match[1];
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "cache-control": "no-cache",
      pragma: "no-cache",
    },
  });

  assert(response.ok, `Request gagal ${url} (status: ${response.status}).`);
  return response.text();
}

async function run() {
  const nonce = Date.now();
  const pageUrl = `${PROD_URL}${PROD_URL.includes("?") ? "&" : "?"}t=${nonce}`;

  console.log(`Smoke check URL: ${pageUrl}`);
  const html = await fetchText(pageUrl);

  const scriptSrc = extractFirstMatch(
    html,
    /<script[^>]*src=\"([^\"]+)\"/i,
    "script src",
  );
  const cssHref = extractFirstMatch(
    html,
    /<link[^>]*href=\"([^\"]+\.css)\"/i,
    "css href",
  );

  assert(
    scriptSrc.startsWith(REQUIRED_ASSET_PREFIX),
    `Path JS tidak valid: ${scriptSrc} (harus diawali ${REQUIRED_ASSET_PREFIX}).`,
  );
  assert(
    cssHref.startsWith(REQUIRED_ASSET_PREFIX),
    `Path CSS tidak valid: ${cssHref} (harus diawali ${REQUIRED_ASSET_PREFIX}).`,
  );

  const scriptUrl = new URL(scriptSrc, PROD_URL).toString();
  const scriptContent = await fetchText(scriptUrl);

  assert(
    scriptContent.includes(REQUIRED_GAS_HOST),
    `Bundle produksi tidak mengandung host ${REQUIRED_GAS_HOST}.`,
  );

  console.log("Smoke check production: PASS");
}

run().catch((error) => {
  console.error("Smoke check production: FAIL");
  console.error(error.message || error);
  process.exit(1);
});
