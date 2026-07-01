const fs = require("node:fs");

const inputPath = process.argv[2] || "elements.json";
const outputPath = process.argv[3] || "question-identifiers.csv";

const raw = fs.readFileSync(inputPath, "utf8");

// Supports either:
// 1. a pure JSON array
// 2. a JS file containing: const something = `[ ... ]`
function extractJsonArray(rawText) {
  const trimmed = rawText.trim();

  if (trimmed.startsWith("[")) {
    return JSON.parse(trimmed);
  }

  const templateArrayMatch = rawText.match(/`(\[\s*[\s\S]*?\])`/);

  if (!templateArrayMatch) {
    throw new Error("Could not find a JSON array in the input file.");
  }

  return JSON.parse(templateArrayMatch[1]);
}

function extractItmIdentifier(content) {
  if (!content) return null;

  // Handles normal XML:
  // identifier="ITM-..."
  //
  // Also handles escaped XML from JS/JSON examples:
  // identifier=\"ITM-...\"
  const match = content.match(/\bidentifier=\\?"(ITM[^"\\]*)\\?"/);

  return match ? match[1] : null;
}

const elements = extractJsonArray(raw);

const rows = [];

for (const element of elements) {
  if (element.element_type !== "Question") {
    continue;
  }

  const id = element.id;
  const identifier = extractItmIdentifier(element.content);

  if (!id || !identifier) {
    console.warn("Skipping question because id or identifier is missing:", {
      id,
      identifier,
    });
    continue;
  }

  rows.push({ id, identifier });
}

const csv = [
  "id,identifier",
  ...rows.map((row) => `${row.id},${row.identifier}`),
].join("\n");

fs.writeFileSync(outputPath, csv, "utf8");

console.log(`Extracted ${rows.length} question identifiers.`);
console.log(`Output written to ${outputPath}`);