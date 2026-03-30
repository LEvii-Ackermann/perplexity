## Code Execution Tool

- Uses Judge0 API
- Sends code + language_id
- Returns stdout / stderr

Flow:
User → Agent → run_code → Judge0 → Output


-------------------------------------------------------------------------------------
## Send email Tool

- For documentation go to Ankurdotio github, then Difference-backend-video repo
- inside that you will find nodemailer 
- you can use same function for authorization also.


------------------------------------------------------------------------------------
# 🧠 File System Tool (Node.js) – Notes

## 📦 Imports

* **`fs/promises`**

  * Used for file operations (async)
  * Supports `await`

* **`path`**

  * Used to handle file paths safely
  * Avoids OS issues (Windows/Linux)

---

## 📁 Base Directory (Sandbox)

* ```js
  const BASE_DIR = path.resolve("sandbox");
  ```

* Converts `"sandbox"` into an **absolute path**

* **Purpose:**

  * Restrict all file access inside this folder
  * Prevent access to system files (security)

---

## 📁 Create Sandbox Folder

* ```js
  await fs.mkdir(BASE_DIR, { recursive: true });
  ```

* **What it does:**

  * Creates `"sandbox"` folder if not exists
  * Does nothing if already exists

* **`recursive: true`**

  * Creates parent folders if needed
  * Prevents error if folder already exists

---

## ⚙️ Main Function

* ```js
  fileSystemTool({ action, filePath, content })
  ```

* **Parameters:**

  * `action` → operation (create/read)
  * `filePath` → user-provided path
  * `content` → data to write

---

## 📍 Build Full Path

* ```js
  const fullPath = path.resolve(BASE_DIR, filePath);
  ```

* **What it does:**

  * Combines `BASE_DIR + filePath`
  * Converts into clean absolute path
  * Removes `../` (important for security)

---

## 🔐 Security Check

* ```js
  if (!fullPath.startsWith(BASE_DIR))
  ```

* **Purpose:**

  * Prevent access outside sandbox
  * Blocks `../` attacks

* **Example attack:**

  * `"../../secret.txt"` ❌ blocked

---

## 📂 Create Folder

* ```js
  await fs.mkdir(fullPath, { recursive: true });
  ```

* **What it does:**

  * Creates folder at given path
  * Supports nested folders

---

## 📄 Create File

* ```js
  await fs.writeFile(fullPath, content || "");
  ```

* **What it does:**

  * Creates file
  * Writes content
  * Overwrites if already exists

---

## 📖 Read File

* ```js
  await fs.readFile(fullPath, "utf-8");
  ```

* **What it does:**

  * Reads file content
  * `"utf-8"` converts buffer → readable text

---

## ⚠️ Error Handling

* ```js
  try...catch
  ```

* **Purpose:**

  * Prevent app crash
  * Return error message safely

---

## 🔥 Key Concepts

* Always use async (`fs/promises`)
* Avoid Sync methods in real apps
* Use `path.resolve` for safety
* Always validate paths (security check)
* Sandbox = controlled safe folder

---

## 🧠 One-Line Summary

➡️ This tool allows safe file operations inside a restricted sandbox folder using async Node.js APIs.
-------------------------------------------------------------------------------------------------------------------------