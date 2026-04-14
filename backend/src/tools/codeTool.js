import vm from "node:vm";

const MAX_EXECUTION_MS = 2500;
const MAX_OUTPUT_CHARS = 4000;
const ALLOWED_LANGUAGES = new Set(["javascript", "js"]);

function limitOutput(text = "") {
  if (text.length <= MAX_OUTPUT_CHARS) {
    return text;
  }

  return `${text.slice(0, MAX_OUTPUT_CHARS)}\n... output truncated ...`;
}

export const runCode = async ({ code, language }) => {
  try {
    const normalizedLanguage = String(language || "javascript").toLowerCase();

    if (!ALLOWED_LANGUAGES.has(normalizedLanguage)) {
      throw new Error("Only JavaScript execution is allowed.");
    }

    const logs = [];
    const errors = [];

    const sandboxConsole = {
      log: (...args) => logs.push(args.map(String).join(" ")),
      info: (...args) => logs.push(args.map(String).join(" ")),
      warn: (...args) => logs.push(args.map(String).join(" ")),
      error: (...args) => errors.push(args.map(String).join(" ")),
    };

    const sandbox = {
      console: sandboxConsole,
      process: undefined,
      require: undefined,
      global: undefined,
      Buffer: undefined,
      Function: undefined,
      eval: undefined,
      setImmediate: undefined,
      setInterval: undefined,
      setTimeout: undefined,
    };

    const context = vm.createContext(sandbox);
    const wrappedCode = `
      (async () => {
        "use strict";
        ${code}
      })()
    `;

    const script = new vm.Script(wrappedCode);
    const executionPromise = script.runInContext(context, {
      timeout: MAX_EXECUTION_MS,
      displayErrors: false,
    });

    await Promise.race([
      executionPromise,
      new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error("Execution timed out."));
        }, MAX_EXECUTION_MS + 100);
      }),
    ]);

    const output = [...logs, ...errors].join("\n").trim();
    return limitOutput(output || "No output");
  } catch (error) {
    const safeMessage = error?.message || "Execution failed";
    return `Execution error: ${limitOutput(safeMessage)}`;
  }
};
