import fs from "fs/promises";
import path from "path";

const BASE_DIR = path.resolve(process.cwd(), "../sandbox");

export const fileEditorTool = async ({
  action,
  filePath,
  content,
  target,
  replacement,
}) => {
  try {
    if (!filePath) {
      throw new Error("filePath is required");
    }

    const fullPath = path.resolve(BASE_DIR, filePath);

    if (!fullPath.startsWith(BASE_DIR)) {
      throw new Error("Access Denied: Invalid Path");
    }

    // read existing file
    let fileData = "";
    try {
      fileData = await fs.readFile(fullPath, "utf-8");
    } catch {
      // file may not exist yet
    }

    // 🔹 APPEND
    if (action === "append") {
      await fs.writeFile(fullPath, fileData + "\n" + (content || ""));
      return `Content appended to ${filePath}`;
    }

    // 🔹 REPLACE FULL FILE
    if (action === "replace") {
      await fs.writeFile(fullPath, content || "");
      return `File ${filePath} replaced successfully`;
    }

    // 🔹 REPLACE SPECIFIC TEXT
    if (action === "replace_text") {
      if (!target) {
        throw new Error("target text is required");
      }

      const updated = fileData.replace(target, replacement || "");

      await fs.writeFile(fullPath, updated);

      return `Text replaced in ${filePath}`;
    }

    return "Invalid action";
  } catch (err) {
    return `Error: ${err.message}`;
  }
};