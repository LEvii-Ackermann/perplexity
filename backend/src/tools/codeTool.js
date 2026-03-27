import axios from "axios";

const languageMap = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
};

export const runCode = async ({ code, language }) => {
  try {
    const response = await axios.post(
      "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
      {
        source_code: code,
        language_id: languageMap[language],
      },
    );

    if (response.data.stdout) {
      return response.data.stdout;
    }

    if (response.data.stderr) {
      return response.data.stderr;
    }

    if (response.data.compile_output) {
      return response.data.compile_output;
    }

    return "No output";
  } catch (error) {
    console.error("Execution error:", error.message);
    return { error: "Execution failed" };
  }
};
