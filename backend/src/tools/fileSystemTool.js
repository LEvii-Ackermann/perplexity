import fs from "fs/promises";
import path from "path";

const BASE_DIR = path.resolve(process.cwd(), "../sandbox");

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

    if (!filePath) {
      throw new Error("filePath is required");
    }


    const fullPath = path.resolve(BASE_DIR, filePath);

    if (!fullPath.startsWith(BASE_DIR)) {
      throw new Error("Access Denied: Invalid Path");
    }

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
      const newFullPath = path.resolve(BASE_DIR, newPath); 

      if (!newFullPath.startsWith(BASE_DIR)) {
        throw new Error("Access Denied: Invalid Path");
      }

      await fs.mkdir(path.dirname(newFullPath), { recursive: true });
      await fs.rename(fullPath, newFullPath);
      return `Renamed ${filePath} → ${newPath}`;
    }

    return "Invalid action";
  } catch (err) {
    return `Error: ${err.message}`;
  }
};
