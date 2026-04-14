import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BASE_DIR = path.resolve(__dirname, "../../../sandbox");

function ensureInsideSandbox(resolvedPath) {
  const relativePath = path.relative(BASE_DIR, resolvedPath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error("Access Denied: Invalid Path");
  }
}

async function ensureNotSymlink(targetPath, { allowMissing = false } = {}) {
  try {
    const stats = await fs.lstat(targetPath);

    if (stats.isSymbolicLink()) {
      throw new Error("Access Denied: Symbolic links are not allowed");
    }
  } catch (error) {
    if (allowMissing && error?.code === "ENOENT") {
      return;
    }

    throw error;
  }
}

async function getSafePath(filePath, { checkParentWhenMissing = false } = {}) {
  if (!filePath) {
    throw new Error("filePath is required");
  }

  const resolvedPath = path.resolve(BASE_DIR, filePath);
  ensureInsideSandbox(resolvedPath);

  try {
    await ensureNotSymlink(resolvedPath);
  } catch (error) {
    if (!(checkParentWhenMissing && error?.code === "ENOENT")) {
      throw error;
    }

    const parentPath = path.dirname(resolvedPath);
    ensureInsideSandbox(parentPath);
    await ensureNotSymlink(parentPath);
  }

  return resolvedPath;
}

export const fileEditorTool = async ({
  action,
  filePath,
  content,
  target,
  replacement,
}) => {
  try {
    const fullPath = await getSafePath(filePath, {
      checkParentWhenMissing: true,
    });

    // read existing file
    let fileData = "";
    try {
      fileData = await fs.readFile(fullPath, "utf-8");
    } catch {
      // file may not exist yet
    }

    // 🔹 APPEND
    if (action === "append") {
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, fileData + "\n" + (content || ""));
      return `Content appended to ${filePath}`;
    }

    // 🔹 REPLACE FULL FILE
    if (action === "replace") {
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content || "");
      return `File ${filePath} replaced successfully`;
    }

    // 🔹 REPLACE SPECIFIC TEXT
    if (action === "replace_text" && !fileData.includes(target)) {
      return "Target text not found";
    }
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