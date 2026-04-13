# 🔥 GAINZ FOR GRUB

> Earn it. Eat it. No regrets.

---

## 🚀 DEPLOY IN 4 STEPS

### STEP 1 — Set up JSONBin (your free database, takes 3 minutes)

JSONBin stores your app's data (workout logs, feast bank, tier lists).

1. Go to **https://jsonbin.io** and click **Sign Up Free**
2. After signing in, click **API Keys** in the left sidebar
3. Click **+ Create Master Key** → give it any name → copy the key (starts with `$2b$...`)
4. Now create your first bin:
   - Click **Bins** in the sidebar → **+ New Bin**
   - In the editor, type `{}` and click **Create Bin**
   - Name it `gfg-shared`
   - Copy the **Bin ID** from the URL bar (looks like `64abc123def456`)
5. Create a second bin the same way, name it `gfg-personal`, copy its ID too
6. On each bin, click the **lock icon** and set it to **Private** (important!)

You now have:
- ✅ A master key
- ✅ A shared bin ID
- ✅ A personal bin ID

---

### STEP 2 — Set up your secret file

1. In the `gainz-for-grub` folder, find the file called `.env.example`
2. Make a **copy** of it
3. Rename the copy to `.env.local`  
   *(on Mac: it might hide itself — that's fine, it still exists)*
4. Open `.env.local` and fill in your three values:

```
VITE_JSONBIN_KEY=your-master-key-here
VITE_SHARED_BIN=your-shared-bin-id-here
VITE_PERSONAL_BIN=your-personal-bin-id-here
```

Save it. **Never share this file with anyone.**

---

### STEP 3 — Push to GitHub

1. Go to **https://github.com** → sign in
2. Click the **+** button → **New repository**
3. Name it `gainz-for-grub`
4. Set it to **Private** (keeps your PINs safe)
5. Click **Create repository**
6. GitHub will show you some commands. Open **Terminal** (Mac) or **Command Prompt** (Windows), navigate to your folder, and run:

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/gainz-for-grub.git
git push -u origin main
```

*(Replace YOUR-USERNAME with your GitHub username)*

---

### STEP 4 — Deploy on Vercel (free, takes 2 minutes)

1. Go to **https://vercel.com** → **Sign Up** → choose **Continue with GitHub**
2. Click **Add New Project**
3. Find `gainz-for-grub` in the list → click **Import**
4. Vercel detects Vite automatically — **don't change any settings**
5. Before hitting Deploy, scroll down to **Environment Variables**
6. Add these three variables (copy from your `.env.local`):

| Name | Value |
|------|-------|
| `VITE_JSONBIN_KEY` | your master key |
| `VITE_SHARED_BIN` | your shared bin ID |
| `VITE_PERSONAL_BIN` | your personal bin ID |

7. Click **Deploy**
8. Wait ~60 seconds ☕
9. You get a live URL like `gainz-for-grub.vercel.app` — share it with the boys!

---

## 📱 PIN REFERENCE

| Person | PIN | Change in `src/App.jsx` line ~15 |
|--------|-----|----------------------------------|
| The Ironclad | 1111 | `pin:"1111"` |
| The Shuttle | 2222 | `pin:"2222"` |
| The Spinmaster | 3333 | `pin:"3333"` |

**To change PINs:** Open `src/App.jsx`, find the `USERS` array near the top, change the pin values, save, commit, push. Vercel redeploys automatically.

---

## 🔄 How to update the app after changes

Any time you change a file:

```bash
git add .
git commit -m "describe what you changed"
git push
```

Vercel automatically redeploys within ~60 seconds.

---

## 🆓 Free tier limits (you won't hit these)

| Service | Free limit | Your usage |
|---------|-----------|------------|
| Vercel | 100GB bandwidth/month | ~a few KB per visit |
| JSONBin | 10,000 requests/month | ~20-50 per session |
| GitHub | Unlimited private repos | Nothing |

---

## 🛟 Common issues

**"App loads but data doesn't save"**
→ Check your `.env.local` values are correct, and that you added the env vars to Vercel too

**"Vercel says build failed"**
→ Make sure `package.json` is in the root of the folder, not inside a subfolder

**"I can't see .env.local on Mac"**
→ Press `Cmd + Shift + .` in Finder to show hidden files

**"JSONBin returns 401 error"**
→ Your master key is wrong or the bin is set to Public — re-check both
