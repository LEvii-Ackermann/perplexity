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


🔐 Authentication System (JWT + Google OAuth)
🧠 Overview

This project uses a unified authentication system where:

Users can login via email/password or Google OAuth
After login, a JWT token is generated
All protected routes are secured using middleware
Redis is used for token blacklisting (logout system)
🔑 Authentication Flow
1. Register/Login (Normal Auth)
User sends email + password
Server validates user
JWT token is generated
Token is sent via cookies
User → Login/Register → Generate JWT → Send Token
2. Google OAuth Flow
User clicks "Login with Google"
Redirected to Google
Google returns user profile
Backend:
Extracts user data
Creates user (if not exists)
Generates JWT
Sends token
User → Google → Callback → Create/Login User → Generate JWT
🧾 Google Profile Data

From req.user:

{
  id,
  displayName,
  emails: [{ value }],
  photos: [{ value }]
}
Extracted Fields:
const email = emails[0].value
const avatar = photos[0].value
👤 Username Generation Logic
Base username from displayName
Remove spaces + lowercase
Ensure uniqueness
const baseUsername = displayName.replace(/\s+/g, "").toLowerCase()
let username = baseUsername
let count = 1

while(await userModel.findOne({ username })){
    username = `${baseUsername}${count}`
    count++
}
🔐 JWT Token
Payload:
{
  id,
  email,
  username
}
Expiry:
expiresIn: "7d"
Sent via:
res.cookie("token", token)