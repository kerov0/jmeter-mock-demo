const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_INPUT_PATH = "data/elements 2.txt";
const DEFAULT_OUTPUT_PATH = "data/question-identifiers.csv";
const QUESTION_TYPE = "Question";
const ITM_IDENTIFIER_PATTERN = /\bidentifier=\\?"(ITM[^"\\]*)\\?"/;

const inputPath = process.argv[2] || DEFAULT_INPUT_PATH;
const outputPath = process.argv[3] || DEFAULT_OUTPUT_PATH;

function readInput(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function parseElements(rawText) {
  const trimmed = rawText.trim();

  if (trimmed.startsWith("[")) {
    return JSON.parse(trimmed);
  }

  const embeddedJson = rawText.match(/`(\[\s*[\s\S]*?\])`/);

  if (!embeddedJson) {
    throw new Error("Input does not contain a JSON array.");
  }

  return JSON.parse(embeddedJson[1]);
}

function extractItmIdentifier(content) {
  return content?.match(ITM_IDENTIFIER_PATTERN)?.[1] || null;
}

function mapQuestionIdentifiers(elements) {
  return elements
    .filter((element) => element.element_type === QUESTION_TYPE)
    .map((element) => ({
      id: element.id,
      identifier: extractItmIdentifier(element.content),
    }))
    .filter(({ id, identifier }) => id && identifier);
}

function toCsv(rows) {
  return [
    "id,identifier",
    ...rows.map(({ id, identifier }) => `${id},${identifier}`),
  ].join("\n");
}

function writeOutput(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

const rawInput = readInput(inputPath);
const elements = parseElements(rawInput);
const questionIdentifiers = mapQuestionIdentifiers(elements);

writeOutput(outputPath, toCsv(questionIdentifiers));

console.log(`Extracted ${questionIdentifiers.length} question identifiers.`);
console.log(`Output written to ${outputPath}`);