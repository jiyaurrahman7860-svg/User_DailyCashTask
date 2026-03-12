# GitHub Terminal Push Guide for User Panel

## Step 1: Install GitHub CLI (Gh CLI)

### Windows (PowerShell as Admin):
```powershell
# Using winget
winget install --id GitHub.cli

# OR using scoop
scoop install gh

# OR download from: https://cli.github.com/
```

### Verify Installation:
```bash
gh --version
```

---

## Step 2: Login to GitHub via CLI

```bash
# Browser mein login karega
gh auth login
```

### Login Steps:
1. **What account do you want to log into?** → `GitHub.com`
2. **What is your preferred protocol for Git operations?** → `HTTPS`
3. **Authenticate Git with your GitHub credentials?** → `Y`
4. **How would you like to authenticate?** → `Login with a web browser`
5. **Code copy hoga** → Browser mein paste karo aur authorize karo

---

## Step 3: Initialize Git in Project

```bash
# Project folder mein jao
cd c:\Web\DailyTaskPay\User_DailyTaskPay

# Git initialize karo
git init

# Check status
git status
```

---

## Step 4: Create Repository on GitHub

### Option A: CLI se create karo (Easy way):
```bash
# Private repo create karo
gh repo create User_DailyCashTask --private --source=. --remote=origin --push
```

### Option B: Manual create karo:
1. GitHub website pe jao: https://github.com/new
2. Repository name: `User_DailyCashTask`
3. Select: **Private**
4. Click **Create repository**

---

## Step 5: Connect Local to Remote (Manual repo create kiya to)

```bash
# Remote add karo (agar CLI se nahi kiya)
git remote add origin https://github.com/jiyaurrahman7860-svg/User_DailyCashTask.git

# Verify remote
git remote -v
```

---

## Step 6: Add Files and Commit

```bash
# Saare files add karo (except .gitignore wale)
git add .

# Commit karo
git commit -m "Initial commit: User panel setup with Next.js + Firebase"

# Ya better commit message:
git commit -m "feat: User panel with dashboard, tasks, wallet, spin wheel

- Added Next.js 16 app router structure
- Firebase authentication and Firestore integration
- User dashboard with earnings
- Task completion system
- Wallet and withdrawal features
- Spin wheel and referral system
- Responsive design with Tailwind CSS"
```

---

## Step 7: Push to GitHub

```bash
# Main branch push karo
git branch -M main
git push -u origin main
```

---

## Step 8: Future Updates (Changes push karna)

```bash
# Changes check karo
git status

# Add karo
git add .

# Commit karo
git commit -m "update: describe your changes here"

# Push karo
git push origin main
```

---

## Quick Commands Summary

| Command | Purpose |
|---------|---------|
| `git status` | Check modified files |
| `git add .` | Add all changes |
| `git commit -m "msg"` | Save changes locally |
| `git push origin main` | Upload to GitHub |
| `git pull origin main` | Download latest changes |
| `git log --oneline` | View commit history |

---

## ⚠️ Important Notes

### .env.local GitHub pe mat daalo!
`.gitignore` already set hai, lekin verify karo:
```bash
# Check karo .env.local track ho raha hai ya nahi
git check-ignore -v .env.local

# Agar kuch output nahi aaya to matlab track ho raha hai!
```

### Agar .env.local accidentally add ho gaya:
```bash
# Remove from tracking
git rm --cached .env.local
git commit -m "fix: remove .env.local from tracking"
git push origin main
```

### Merge Conflicts:
```bash
# Agar conflict aaya to
git pull origin main
# Conflict files edit karo
# Phir add, commit, push
```

---

## 🚀 One-Line Setup (All commands together)

```bash
cd c:\Web\DailyTaskPay\User_DailyTaskPay && git init && git add . && git commit -m "Initial commit" && gh repo create User_DailyCashTask --private --source=. --remote=origin --push
```

---

## 🔧 Troubleshooting

### Error: "fatal: not a git repository"
```bash
git init
```

### Error: "Permission denied"
```bash
# Token generate karo: https://github.com/settings/tokens
# Ya phir SSH setup karo:
gh auth login
```

### Error: "failed to push some refs"
```bash
git pull origin main --rebase
git push origin main
```

---

## Next Steps After GitHub Push

1. **Vercel mein connect karo:**
   - Vercel Dashboard → Add New Project
   - Import from GitHub
   - Select `User_DailyCashTask`

2. **Environment Variables set karo:**
   - Vercel Project Settings
   - Add all NEXT_PUBLIC_* variables from .env.local

3. **Deploy!**

---

## Need Help?

```bash
# Git help
git help
git help <command>

# GitHub CLI help
gh help
gh repo help
```
