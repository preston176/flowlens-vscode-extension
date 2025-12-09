# 🎯 FlowLens Quick Reference Guide

**Version:** 0.2.0  
**Last Updated:** December 9, 2025

---

## 🚀 Quick Start

### **Build & Test**

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode (auto-rebuild)
npm run watch

# Lint code
npm run lint

# Run tests
npm test

# Package extension
vsce package

# Publish to marketplace
vsce publish
```

### **Launch Extension (Development)**

1. Open project in VS Code
2. Press `F5` to launch Extension Development Host
3. Test commands with `Cmd+Shift+P`

---

## ⌨️ Keyboard Shortcuts

| Shortcut      | Command               | Description                         |
| ------------- | --------------------- | ----------------------------------- |
| `Cmd+Shift+F` | Quick Capture         | One-click capture with smart naming |
| `Cmd+Shift+R` | Show Sessions         | Browse all captured sessions        |
| `Cmd+Shift+T` | Capture from Template | Create session from template        |

---

## 📋 All Commands (11 Total)

### **Core Commands**

1. `FlowLens.captureSession` - Manual capture with prompts
2. `FlowLens.quickCapture` - Smart one-click capture ⚡
3. `FlowLens.captureFromTemplate` - Template-based capture 📋
4. `FlowLens.showSessions` - Browse all sessions
5. `FlowLens.openSessionsPanel` - Open webview panel

### **Advanced Commands**

6. `FlowLens.showProductivityDashboard` - View analytics & ROI 📊
7. `FlowLens.exportSessions` - Export to JSON file 📤
8. `FlowLens.importSessions` - Import from JSON file 📥
9. `FlowLens.shareSession` - Share via link/code/markdown 🔗

### **Monetization**

10. `FlowLens.upgradeToPro` - Show upgrade prompt 💎

---

## ⚙️ Configuration Options

```json
{
  // Auto-capture settings
  "flowlens.autoCapture.enabled": true,
  "flowlens.autoCapture.onBranchSwitch": true,
  "flowlens.autoCapture.onIdleTime": false,
  "flowlens.autoCapture.idleMinutes": 30,
  "flowlens.autoCapture.onWorkspaceFolderChange": true,
  "flowlens.autoCapture.maxPerDay": 20,

  // Analytics
  "flowlens.analytics.trackUsage": true
}
```

---

## 📦 Architecture

```
Services (8):
├── SmartNamingService     - AI naming from git/files/time
├── TemplateService        - Built-in + custom templates
├── AutoCaptureService     - Branch/idle/workspace triggers
├── AnalyticsService       - Time/money tracking
├── SharingService         - Export/import/share
├── DebugService           - Breakpoints + watch expressions
├── SettingsService        - VS Code settings capture
└── MonetizationService    - Freemium tier logic

Commands (10):
├── captureSession         - Original manual capture
├── quickCapture           - NEW: Smart capture
├── captureFromTemplate    - NEW: Template-based
├── showSessions           - Browse all
├── openSessionsPanel      - Webview
├── showProductivityDashboard - NEW: Analytics
├── exportSessions         - NEW: Export
├── importSessions         - NEW: Import
├── shareSession           - NEW: Share
└── upgradeToPro           - NEW: Monetization
```

---

## 💰 Pricing Tiers

| Tier           | Price       | Max Sessions | Sessions/Day | Key Features                                   |
| -------------- | ----------- | ------------ | ------------ | ---------------------------------------------- |
| **Free**       | $0          | 50           | 10           | Core features, templates, AI naming            |
| **Pro**        | $5/mo       | ∞            | ∞            | Auto-capture, advanced analytics, cloud sync\* |
| **Team**       | $12/user/mo | ∞            | ∞            | Team sharing, SSO, team dashboard              |
| **Enterprise** | Custom      | ∞            | ∞            | On-prem, compliance, SLA                       |

\*Cloud sync coming soon

---

## 📊 Built-in Templates

1. **React Component** - Component dev with test files
2. **API Debugging** - API routes + logs + terminals
3. **Full-Stack Feature** - Frontend + backend + DB
4. **Bug Investigation** - Repro doc + test terminal

---

## 🎯 Testing Checklist

### **Manual Testing**

- [ ] Quick capture (Cmd+Shift+F)
- [ ] Restore session with multiple files
- [ ] Auto-capture on branch switch
- [ ] Create custom template
- [ ] Export sessions to JSON
- [ ] Import sessions from JSON
- [ ] Share session as markdown
- [ ] View productivity dashboard
- [ ] Check usage limits (free tier)
- [ ] Test upgrade prompt

### **Edge Cases**

- [ ] No files open → should handle gracefully
- [ ] No git repo → should work without git info
- [ ] Large sessions (50+ files)
- [ ] Deleted files in session → should show warning
- [ ] Concurrent captures

---

## 🐛 Debugging

### **Common Issues**

**Problem:** Auto-capture not working  
**Solution:** Check `flowlens.autoCapture.enabled` setting

**Problem:** Session restore fails  
**Solution:** Files may have been moved/deleted. Check paths.

**Problem:** Smart naming not working  
**Solution:** Ensure git repository exists and has commits

**Problem:** Upgrade prompt not showing  
**Solution:** Check usage stats in globalState

### **Logs**

Check VS Code Developer Tools:

1. Help → Toggle Developer Tools
2. Console tab → Filter "FlowLens"

---

## 📈 Analytics Tracked

### **Usage Metrics**

- Total sessions captured
- Sessions per day/week
- Most productive day of week
- Context switches per day

### **Value Metrics**

- Time saved (23 min → 2 min per switch)
- Money saved (based on $75/hr developer rate)
- Productivity multiplier (11.5x faster recovery)

### **Feature Adoption**

- Templates used
- Auto-captures triggered
- Sessions shared/exported
- Keyboard shortcut usage

---

## 🚀 Launch Checklist

### **Pre-Launch**

- [ ] Update version in `package.json`
- [ ] Run `npm run compile` (no errors)
- [ ] Run `npm run lint` (pass)
- [ ] Test all 11 commands
- [ ] Update `README.md` with new features
- [ ] Create `CHANGELOG.md`
- [ ] Create demo video (30s, 2min)

### **Launch Day**

- [ ] `vsce package`
- [ ] `vsce publish`
- [ ] Post on Product Hunt
- [ ] Post on Reddit (r/vscode)
- [ ] Post on Hacker News
- [ ] Twitter announcement thread
- [ ] Update website

### **Post-Launch**

- [ ] Monitor marketplace ratings
- [ ] Respond to all feedback
- [ ] Track install growth
- [ ] Fix critical bugs ASAP
- [ ] Plan v0.3.0 features

---

## 💡 Pro Tips

### **For Users**

1. Use `Cmd+Shift+F` constantly - make it muscle memory
2. Create custom templates for your common workflows
3. Check productivity dashboard weekly for motivation
4. Share sessions with team to speed up debugging
5. Export sessions before major refactors

### **For Marketing**

1. Show the $210/day value in all materials
2. Lead with pain point: "Lose 3 hours to meetings daily?"
3. Use GIFs - show capture → restore in 5 seconds
4. Social proof: Case studies with time saved
5. Viral loop: Every shared session = potential install

### **For Sales**

1. Bottom-up: Individual devs love it → team adopts
2. ROI calculator: Show exact savings for their team size
3. Trial: 14 days Pro, no credit card required
4. References: Happy users from similar companies
5. Enterprise: Lead with compliance, security, SLA

---

## 📚 Documentation

- `README.md` - Main project README
- `GO_TO_MARKET_ROADMAP.md` - 18-month GTM strategy (comprehensive)
- `TECHNICAL_SUMMARY.md` - Implementation details
- `SPRINT_COMPLETED.md` - What we built today
- `QUICK_REFERENCE.md` - This file

---

## 🔗 Links

- **GitHub:** https://github.com/preston176/flowlens-vscode-extension
- **Marketplace:** https://marketplace.visualstudio.com/items?itemName=preston176.flowlens
- **Website:** https://flowlens-vscode.vercel.app
- **Issues:** https://github.com/preston176/flowlens-vscode-extension/issues

---

## 🎯 Next Milestones

### **Week 1** (Target: 100 installs)

- Launch on Product Hunt
- Get first reviews
- Fix any critical bugs
- Start content marketing

### **Month 1** (Target: 1,000 installs)

- 10 paying Pro users ($50 MRR)
- 300 DAU
- 3 case studies
- 4.5+ marketplace rating

### **Quarter 1** (Target: 10,000 installs)

- 100 paying users ($500 MRR)
- 2,000 DAU
- Team tier launched
- First enterprise customer

---

## 🤝 Contributing

See `CONTRIBUTING.md` for:

- Code style guidelines
- Pull request process
- Testing requirements
- Community guidelines

---

## 📞 Support

- **Bugs:** GitHub Issues
- **Features:** GitHub Discussions
- **Questions:** Discord (coming soon)
- **Email:** support@flowlens.app (future)

---

**Last Updated:** December 9, 2025  
**Status:** ✅ Production Ready  
**Next Version:** 0.3.0 (cloud sync, team features)

---

_"Make context switching as seamless as git checkout"_ 🚀
