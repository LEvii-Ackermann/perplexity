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

const init = async () => {
  try {
    await fs.mkdir(BASE_DIR, { recursive: true });
  } catch (error) {
    console.log(error);
  }
};

init();

export const fileSystemTool = async ({ action, filePath, content, newPath }) => {
  try {
    const fullPath = await getSafePath(filePath, {
      checkParentWhenMissing:
        action === "create_folder" || action === "create_file",
    });

    if (action === "create_folder") {
      await fs.mkdir(fullPath, { recursive: true });
      return `Folder created at ${filePath}`;
    }

    if (action === "create_file") {
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content || "");
      return `File created at ${filePath}`;
    }

    if (action === "read_file") {
      const data = await fs.readFile(fullPath, "utf-8");
      return data;
    }

    if (action === "delete_file") {
      await fs.unlink(fullPath);
      return `File deleted at ${filePath}`;
    }

    if (action === "delete_folder") {
      await fs.rm(fullPath, { recursive: true, force: true });
      return `Folder deleted at ${filePath}`;
    }

    if (action === "list_files") {
      const files = await fs.readdir(fullPath, { withFileTypes: true });

      return files
        .map((file) =>
          file.isDirectory() ? `📁 ${file.name}` : `📄 ${file.name}`,
        )
        .join("\n");
    }

    if (action === "rename") {
      if (!newPath) {
        throw new Error("newPath is required for rename");
      }

      const newFullPath = await getSafePath(newPath, {
        checkParentWhenMissing: true,
      });

      await fs.mkdir(path.dirname(newFullPath), { recursive: true });
      await fs.rename(fullPath, newFullPath);
      return `Renamed ${filePath} → ${newPath}`;
    }

    return "Invalid action";
  } catch (err) {
    return `Error: ${err.message}`;
  }
};
