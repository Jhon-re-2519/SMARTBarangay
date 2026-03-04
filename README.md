# SMARTBarangay
A Web-based Information Management System

````markdown
# Project Deployment Workflow Guide  
### Using GitHub Codespaces with Branch Protection Strategy

---

## 📌 Project Structure Overview

This repository follows a **two-branch workflow** to ensure system stability and controlled deployment.

### 🌿 Branches

- **`main`**
  - Serves as the **stable production branch**
  - Represents the **main frame of the deployed system**
  - Only approved and tested code should be merged here
  - This branch is connected to the live deployment

- **`prototype`**
  - Serves as the **working development branch**
  - Used for feature development, updates, and experiments
  - Code must be tested and reviewed before merging into `main`

---

# 🚀 Using GitHub Codespaces

All development must be done inside **Codespaces**.

## 1️⃣ Opening Codespaces

1. Go to the repository.
2. Click the green **Code** button.
3. Select the **Codespaces** tab.
4. Click **Create codespace on prototype** (IMPORTANT: Always use the `prototype` branch for development).

---

# 🔄 Working With Branches in Codespaces

## 2️⃣ Make Sure You Are on the Correct Branch

Inside Codespaces terminal:

```bash
git branch
````

If you are not on `prototype`, switch to it:

```bash
git checkout prototype
```

If the branch does not exist locally:

```bash
git checkout -b prototype origin/prototype
```

---

# 💻 Development Workflow (Prototype Branch)

## 3️⃣ Add or Modify Files

Make your changes inside Codespaces.

Check status:

```bash
git status
```

---

## 4️⃣ Stage Changes

```bash
git add .
```

Or stage specific files:

```bash
git add filename.html
```

---

## 5️⃣ Commit Changes

```bash
git commit -m "Describe your changes clearly"
```

Example:

```bash
git commit -m "Added appointment approval logic in admin dashboard"
```

---

## 6️⃣ Push to Prototype Branch

```bash
git push origin prototype
```

This updates the remote `prototype` branch.

---

# 🔎 Testing Before Merge

Before merging to `main`, ensure:

* ✅ No console errors
* ✅ No broken UI components
* ✅ Authentication works
* ✅ Core features are stable
* ✅ No test/demo data remains

---

# 🔁 Merging Prototype to Main (For Approval Only)

⚠️ DO NOT merge directly without approval.

## 7️⃣ Create a Pull Request

1. Go to repository page.
2. Click **Pull Requests**.
3. Click **New Pull Request**.
4. Base branch: `main`
5. Compare branch: `prototype`
6. Click **Create Pull Request**.
7. Add description of:

   * What was added
   * What was fixed
   * What was improved
8. Submit for review.


# 📦 Deployment Logic

* `main` → Connected to deployment platform
* `prototype` → Development and staging environment

Only merge to `main` when:

* The system is stable
* All features are tested
* Approval is granted

---

# 🛑 Important Rules

* ❌ Never push unfinished work to `main`
* ❌ Never develop directly in `main`
* ✅ Always develop in `prototype`
* ✅ Always test before merging
* ✅ Always use clear commit messages

---

# 🧠 Recommended Best Practice

For larger updates, create feature branches from `prototype`:

```bash
git checkout -b feature-login-update
```

Then merge back to `prototype` after testing.

---

# 📌 Summary Workflow

1. Open Codespaces on `prototype`
2. Develop and test
3. Commit and push to `prototype`
4. Create Pull Request to `main`
5. Get approval
6. Merge
7. Deployment updates automatically

---

This structured workflow protects the stability of the deployed system while allowing continuous improvement through controlled development.

```
```
````markdown
---

# 🔄 Handling Updates After Deployment

Once changes from `prototype` are merged into `main`, the deployment system will automatically rebuild (if connected to GitHub).

## 8️⃣ Keep Prototype Updated With Main

After merging into `main`, always sync `prototype` to avoid conflicts later.

Inside Codespaces:

```bash
git checkout prototype
git pull origin prototype
git merge main
git push origin prototype
````

This ensures both branches stay aligned after approved releases.

---

# 🛠 Handling Merge Conflicts

Sometimes, Git may show a **merge conflict** if the same file was modified in both branches.

If this happens:

1. Git will highlight conflicting files.
2. Open the file in Codespaces.
3. Look for markers like:

```
<<<<<<< HEAD
Code from current branch
=======
Code from merging branch
>>>>>>> main
```

4. Manually edit and choose the correct version.
5. Remove the markers.
6. Save the file.
7. Run:

```bash
git add .
git commit -m "Resolved merge conflict"
git push origin prototype
```

Then recreate or update the Pull Request.

---

# 📋 Branch Protection (Recommended Setup)

To protect the `main` branch:

1. Go to **Repository Settings**
2. Click **Branches**
3. Add a Branch Protection Rule
4. Set:

   * Branch name pattern: `main`
   * Require a pull request before merging
   * Require review approval before merging
   * Restrict direct pushes

This prevents accidental modification of the live system.

---

# 🧪 Optional: Version Tagging for Releases

After merging stable updates into `main`, you may tag releases:

```bash
git checkout main
git pull origin main
git tag -a v1.0 -m "Stable release version 1.0"
git push origin v1.0
```

Version tags help track official releases of the system.

---

# 📂 Clean Development Practices

To maintain a professional workflow:

* Use descriptive commit messages
* Keep commits small and focused
* Avoid committing unnecessary files
* Do not upload node_modules or environment secrets
* Use `.gitignore` properly

---

# 🧠 Example Real Workflow Scenario

Example situation:

* You are adding a new feature in `prototype`
* You complete development
* You test locally in Codespaces
* You push to `prototype`
* You create Pull Request
* Review is approved
* You merge into `main`
* System automatically deploys
* You sync `prototype` with `main`

This ensures the deployed system remains stable at all times.

---

# 📌 Final Architecture Summary

```
Development Flow:

feature branches (optional)
        ↓
prototype
        ↓ (Pull Request + Approval)
main
        ↓
Live Deployment
```
---

# 🚨🚨🚨 CRITICAL WARNING 🚨🚨🚨

# ❗ DO NOT COMMIT DIRECTLY TO THE `main` BRANCH ❗

The `main` branch is the **LIVE DEPLOYED SYSTEM**.

Any direct commit to `main` will:

- ❌ Immediately affect the deployed build
- ❌ Potentially break the live system
- ❌ Cause instability in production
- ❌ Bypass testing and approval process
- ❌ Violate the branch workflow policy

---

## 🔒 STRICT RULE

You must NEVER:

```bash
git checkout main
git add .
git commit -m "update"
git push origin main
---
✅ CORRECT DEVELOPMENT PROCESS

Always follow this structure:

git checkout prototype

Then:

git add .
git commit -m "Your changes"
git push origin prototype

Then create a Pull Request from prototype → main for approval.

# ✅ Final Reminder

This workflow ensures:

* Stability of deployed system
* Organized version control
* Clean development lifecycle
* Proper approval before release
* Professional Git practice

---

