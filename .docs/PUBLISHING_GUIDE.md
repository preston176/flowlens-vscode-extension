# 📦 FlowLens Publishing Guide

Complete step-by-step guide to publish your extension to the VS Code Marketplace.

---

## ✅ Pre-Publishing Checklist

Before you start, make sure you have:

- [x] `package.json` updated with all required fields
- [x] `LICENSE` file created
- [x] `.vscodeignore` configured
- [ ] **Icon created** (`images/icon.png` - 128x128px PNG) ⚠️ **ACTION REQUIRED**
- [ ] **Publisher ID** (you'll create this in Step 2)
- [x] GitHub repository set up
- [x] Extension tested locally

---

## 🚀 Publishing Steps

### Step 1: Install VS Code Extension Manager (vsce)

Install the official publishing tool:

```bash
npm install -g @vscode/vsce
```

Or if you prefer using it locally:

```bash
npm install --save-dev @vscode/vsce
```

---

### Step 2: Create Your Publisher Account

#### 2.1 Sign in to Azure DevOps

1. Go to [Azure DevOps](https://dev.azure.com/)
2. Sign in with your Microsoft account
   - Don't have one? [Create a free Microsoft account](https://signup.live.com/)
3. Complete the initial setup (you can skip creating an organization)

#### 2.2 Create Your Publisher

1. Go to [Visual Studio Marketplace Publisher Management](https://marketplace.visualstudio.com/manage)
2. Click **"Create Publisher"**
3. Fill in the form:
   - **Publisher ID**: Choose a unique ID (e.g., `preston176` or `flowlens-team`)
     - ⚠️ This cannot be changed later!
     - Use lowercase, hyphens allowed
     - Will be visible in your extension URL
   - **Display Name**: `FlowLens` or `Your Name`
   - **Description**: Optional description of your publisher profile
   - **Email**: Your contact email (optional, can be hidden)
4. Click **Create**
5. **✏️ IMPORTANT**: Copy your Publisher ID - you'll need it next!

---

### Step 3: Update Your Publisher ID

Open `package.json` and replace `YOUR_PUBLISHER_ID` with your actual Publisher ID:

```json
{
  "publisher": "your-actual-publisher-id",
  ...
}
```

---

### Step 4: Generate a Personal Access Token (PAT)

#### 4.1 Create the Token

1. In [Azure DevOps](https://dev.azure.com/), click your profile icon (top right)
2. Select **"Personal access tokens"**
3. Click **"+ New Token"**
4. Fill in the details:
   - **Name**: `FlowLens Extension Publishing`
   - **Organization**: Select **"All accessible organizations"**
   - **Expiration**: Choose your preferred duration (90 days, 1 year, or custom)
   - **Scopes**: Click **"Show all scopes"** and scroll to find:
     - ✅ Check **"Marketplace"** → **"Manage"**
5. Click **"Create"**
6. **⚠️ CRITICAL**: Copy the token immediately - you won't see it again!
   - Store it securely (password manager, env variable, etc.)

#### 4.2 Troubleshooting Token Issues

If you lose your token:
- Go back to Personal Access Tokens
- Delete the old one
- Create a new token following the same steps

---

### Step 5: Create Your Extension Icon

**⚠️ YOU MUST DO THIS BEFORE PUBLISHING**

1. Create a 128x128 pixel PNG icon
2. Save it as `images/icon.png`
3. See `images/ICON_GUIDE.md` for design tips and tools

Quick option: Use AI to generate it:
- Prompt: "minimal flat icon for VS Code extension about coding flow and productivity, purple color, 128x128, transparent background"

---

### Step 6: Test Your Package

Before publishing, test that your extension packages correctly:

```bash
cd /Users/app/Code/personal/flowlens-vscode-extension
vsce package
```

This will create a `.vsix` file (e.g., `flowlens-0.0.1.vsix`).

#### 6.1 Test the Package Locally

Install and test your packaged extension:

```bash
code --install-extension flowlens-0.0.1.vsix
```

Test all features in VS Code to ensure everything works.

#### 6.2 Check Package Contents

```bash
vsce ls
```

This shows all files that will be included in your package.

---

### Step 7: Publish Your Extension

#### Option A: Publish with Login

```bash
# Login first
vsce login YOUR_PUBLISHER_ID

# Then publish
vsce publish
```

#### Option B: Publish Directly (Recommended)

```bash
vsce publish -p YOUR_PERSONAL_ACCESS_TOKEN
```

Replace `YOUR_PERSONAL_ACCESS_TOKEN` with the token from Step 4.

#### 7.1 What Happens Next

- ✅ Extension is uploaded to the marketplace
- 🔍 Microsoft validation (usually 5-30 minutes)
- 📧 You'll receive an email when it's live
- 🌐 Extension will be available at: `https://marketplace.visualstudio.com/items?itemName=YOUR_PUBLISHER_ID.flowlens`

---

### Step 8: Verify Your Extension

Once published:

1. Search for "FlowLens" in VS Code Extensions marketplace
2. Check your extension page for:
   - Icon displays correctly
   - Description is clear
   - Screenshots/README renders properly
   - All links work
3. Install from the marketplace and test

---

## 🔄 Publishing Updates

### Versioning

FlowLens follows [Semantic Versioning](https://semver.org/):
- **Patch** (0.0.1 → 0.0.2): Bug fixes
- **Minor** (0.0.1 → 0.1.0): New features (backward compatible)
- **Major** (0.0.1 → 1.0.0): Breaking changes

### Quick Update Commands

```bash
# Patch update (bug fixes)
vsce publish patch -p YOUR_PAT

# Minor update (new features)
vsce publish minor -p YOUR_PAT

# Major update (breaking changes)
vsce publish major -p YOUR_PAT

# Specific version
vsce publish 1.0.0 -p YOUR_PAT
```

### Update Workflow

1. Make your changes
2. Update `CHANGELOG.md`
3. Run tests: `npm test`
4. Build: `npm run package`
5. Test locally: `vsce package` → install `.vsix`
6. Publish: `vsce publish patch -p YOUR_PAT`

---

## 🛡️ Best Practices

### Before Each Release

- [ ] Test all features thoroughly
- [ ] Update `CHANGELOG.md`
- [ ] Bump version in `package.json` (or use `vsce publish patch/minor/major`)
- [ ] Review README for accuracy
- [ ] Check all links work
- [ ] Test in both Light and Dark themes
- [ ] Run `npm run lint` to check for issues
- [ ] Build production version: `npm run package`

### Security

- **Never commit your PAT to Git**
- Store PAT in a password manager
- Set expiration dates on tokens
- Rotate tokens periodically
- Use environment variables for automation:
  ```bash
  export VSCE_PAT="your-token-here"
  vsce publish -p $VSCE_PAT
  ```

### Marketing Your Extension

After publishing:
1. Share on Twitter/X, Reddit, LinkedIn
2. Post in VS Code community forums
3. Add to your GitHub profile README
4. Update your website with marketplace link
5. Collect user feedback and iterate

---

## 🐛 Troubleshooting

### Common Errors

#### Error: "Missing publisher name"
**Solution**: Add `"publisher": "your-id"` to `package.json`

#### Error: "Missing icon"
**Solution**: Create `images/icon.png` (128x128px)

#### Error: "LICENSE file not found"
**Solution**: Already created ✅

#### Error: "Invalid token"
**Solution**: 
- Make sure you selected "Marketplace → Manage" scope
- Try creating a new token
- Check token hasn't expired

#### Error: "Extension name already taken"
**Solution**: Change the `name` field in `package.json` to something unique

#### Extension shows as "outdated" after publishing
**Solution**: Wait 5-10 minutes for marketplace cache to update

### Need Help?

- [VS Code Publishing Documentation](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [vsce GitHub Issues](https://github.com/microsoft/vscode-vsce/issues)
- [VS Code Extension API](https://code.visualstudio.com/api)

---

## 📊 Post-Publishing

### Monitor Your Extension

1. **View Stats**: Go to [Marketplace Publisher Management](https://marketplace.visualstudio.com/manage)
2. **Metrics Available**:
   - Total installs
   - Daily active users
   - Ratings and reviews
   - Download trends

### Respond to Users

- Monitor GitHub Issues
- Respond to marketplace reviews
- Update documentation based on feedback
- Plan feature roadmap

### Continuous Improvement

- Gather user feedback
- Track usage analytics
- Add requested features
- Fix bugs promptly
- Keep dependencies updated

---

## 🎯 Quick Command Reference

```bash
# Install vsce
npm install -g @vscode/vsce

# Package (test)
vsce package

# List package contents
vsce ls

# Login
vsce login YOUR_PUBLISHER_ID

# Publish
vsce publish -p YOUR_PAT

# Publish with version bump
vsce publish patch -p YOUR_PAT
vsce publish minor -p YOUR_PAT
vsce publish major -p YOUR_PAT

# Unpublish (use carefully!)
vsce unpublish YOUR_PUBLISHER_ID.flowlens
```

---

## ✨ Your Next Steps

1. **Create your icon** → See `images/ICON_GUIDE.md`
2. **Create Publisher account** → [marketplace.visualstudio.com/manage](https://marketplace.visualstudio.com/manage)
3. **Generate PAT** → [dev.azure.com](https://dev.azure.com/)
4. **Update publisher ID** → Edit `package.json`
5. **Test package** → `vsce package`
6. **Publish** → `vsce publish -p YOUR_PAT`
7. **Celebrate** → Share your extension with the world! 🎉

---

## 💰 Remember: It's 100% FREE!

No credit card, no subscription, no hidden costs. Just create your Microsoft account and publish!

---

**Good luck with your launch! 🚀**

For questions or issues, open an issue on GitHub or check the official VS Code documentation.

