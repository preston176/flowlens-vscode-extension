# Manual Testing Checklist - FlowLens v0.2.0

**Before Publishing:** Complete this checklist by testing in Extension Development Host (F5)

---

## 🚀 How to Test

1. Open VS Code with FlowLens project
2. Press **F5** to launch Extension Development Host
3. In the new VS Code window, open a test project
4. Follow checklist below

---

## ✅ Core Features

### Session Capture

- [ ] Open Command Palette (`Cmd+Shift+P`)
- [ ] Run: `FlowLens: Capture Session`
- [ ] Enter session title
- [ ] Verify success notification appears
- [ ] Check session was saved

### Quick Capture (Smart Naming)

- [ ] Press **`Cmd+Shift+F`** (keyboard shortcut)
- [ ] Verify session captured with smart name
- [ ] Check name includes git branch or file context
- [ ] Confirm success message

### View Sessions

- [ ] Open Command Palette
- [ ] Run: `FlowLens: Show Sessions`
- [ ] Verify sessions list appears
- [ ] Check session details are complete
- [ ] Verify timestamps are correct

### Restore Session

- [ ] Press **`Cmd+Shift+R`** (keyboard shortcut)
- [ ] Select a session from Quick Pick
- [ ] Verify files open correctly
- [ ] Check terminals are created
- [ ] Confirm git branch info shown
- [ ] Verify cursor positions restored

### Sessions Panel (Webview)

- [ ] Run: `FlowLens: Open Sessions Panel`
- [ ] Verify webview opens
- [ ] Check sessions display in list
- [ ] Test restore button
- [ ] Test delete button
- [ ] Verify panel updates after changes

---

## ✅ Template System

### Built-in Templates

- [ ] Run: `FlowLens: Capture from Template`
- [ ] Verify 4 templates appear:
  - [ ] React Component Development
  - [ ] API Debugging Session
  - [ ] Full-Stack Feature
  - [ ] Bug Fix Investigation
- [ ] Select one template
- [ ] Verify session created with template structure

### Custom Templates

- [ ] Run: `FlowLens: Save Session as Template`
- [ ] Name your custom template
- [ ] Verify template saved
- [ ] Re-run template capture command
- [ ] Confirm custom template appears in list

---

## ✅ Auto-Capture

### Branch Switch Trigger

- [ ] Open settings: `Cmd+,`
- [ ] Search: `flowlens autoCapture`
- [ ] Enable: `Auto-capture on Branch Switch`
- [ ] Switch git branches in terminal
- [ ] Wait 5 seconds
- [ ] Verify auto-capture occurred (check sessions list)

### Idle Time Trigger

- [ ] Enable: `Auto-capture on Idle Time`
- [ ] Set idle threshold to 1 minute (for testing)
- [ ] Stop typing/clicking for 1 minute
- [ ] Verify auto-capture after idle period

### Workspace Change Trigger

- [ ] Enable: `Auto-capture on Workspace Folder Change`
- [ ] Add/remove a folder from workspace
- [ ] Verify auto-capture occurred

---

## ✅ Analytics & ROI

### Productivity Dashboard

- [ ] Press **`Cmd+Shift+T`** (keyboard shortcut)
- [ ] Verify dashboard opens with:
  - [ ] Total sessions count
  - [ ] Time saved (minutes)
  - [ ] Cost saved (dollars)
  - [ ] Sessions today/this week
  - [ ] Average sessions per day
- [ ] Verify calculations are reasonable

### Productivity Report

- [ ] Run: `FlowLens: Show Productivity Dashboard`
- [ ] Click "Generate Report" button (if available)
- [ ] Verify report includes:
  - [ ] Session statistics
  - [ ] Time/cost savings
  - [ ] ROI calculation
  - [ ] Productivity insights

---

## ✅ Sharing & Collaboration

### Export Sessions

- [ ] Run: `FlowLens: Export Sessions`
- [ ] Select sessions to export
- [ ] Choose save location
- [ ] Verify JSON file created
- [ ] Open file and verify structure

### Export as Markdown

- [ ] Run: `FlowLens: Export Sessions as Markdown`
- [ ] Select sessions
- [ ] Save markdown file
- [ ] Open file and verify formatting

### Import Sessions

- [ ] Run: `FlowLens: Import Sessions`
- [ ] Select previously exported JSON file
- [ ] Verify import success message
- [ ] Check sessions list for imported items

### Share Session

- [ ] Run: `FlowLens: Share Session`
- [ ] Select a session
- [ ] Verify share code generated
- [ ] Copy share code
- [ ] (Optional) Test pasting in new window

---

## ✅ Monetization & Limits

### Free Tier Limits

- [ ] Create 10 sessions (free tier daily limit)
- [ ] Try to create 11th session
- [ ] Verify upgrade prompt appears
- [ ] Check message mentions Pro tier

### Usage Tracking

- [ ] Check settings for: `Track Usage Analytics`
- [ ] Verify it's enabled by default
- [ ] Create a few sessions
- [ ] Verify analytics update correctly

---

## ✅ Deep Integration

### Debug State Capture

- [ ] Set a breakpoint in any file
- [ ] Capture a session
- [ ] Remove breakpoint
- [ ] Restore the session
- [ ] Verify breakpoint is restored

### Settings Capture

- [ ] Change a VS Code setting (e.g., font size)
- [ ] Capture session with settings
- [ ] Change setting back
- [ ] Restore session
- [ ] Verify setting restored (check tooltip or confirmation)

---

## ✅ Keyboard Shortcuts

Test all shortcuts work:

- [ ] **`Cmd+Shift+F`** - Quick Capture
- [ ] **`Cmd+Shift+R`** - Restore Session
- [ ] **`Cmd+Shift+T`** - Show Dashboard

---

## ✅ Error Handling

### Edge Cases

- [ ] Try to restore non-existent file (should skip gracefully)
- [ ] Capture with no files open (should work with empty editors)
- [ ] Capture with no workspace (should handle undefined)
- [ ] Delete all sessions, then restore (should show empty list)
- [ ] Import invalid JSON (should show error message)

### Configuration Errors

- [ ] Set invalid auto-capture threshold (e.g., -1)
- [ ] Verify validation or graceful handling
- [ ] Set max sessions to 0
- [ ] Verify fallback behavior

---

## ✅ Performance

- [ ] Capture large session (20+ files, 5+ terminals)
- [ ] Verify capture completes in < 2 seconds
- [ ] Restore large session
- [ ] Verify restore completes in < 5 seconds
- [ ] Check CPU usage stays reasonable

---

## ✅ Visual & UX

### Notifications

- [ ] Verify all success messages are clear
- [ ] Verify all error messages are helpful
- [ ] Check icons appear in notifications (if used)

### Sessions Panel UI

- [ ] Verify webview styling looks professional
- [ ] Check responsiveness (resize panel)
- [ ] Verify buttons are clickable
- [ ] Check hover states on interactive elements

### Command Palette

- [ ] Verify all FlowLens commands have clear descriptions
- [ ] Check command names are consistent
- [ ] Verify commands appear when typing "flowlens"

---

## ✅ Documentation

### README

- [ ] Open project README.md
- [ ] Verify all features listed are working
- [ ] Check example session JSON is accurate
- [ ] Verify keyboard shortcuts documented

### Settings Documentation

- [ ] Open VS Code Settings UI
- [ ] Search "flowlens"
- [ ] Verify all setting descriptions are clear
- [ ] Check default values are reasonable

---

## 🐛 Bug Tracking

If you find any issues during testing, document here:

### Issue 1:

- **Feature:**
- **Steps to Reproduce:**
- **Expected:**
- **Actual:**
- **Severity:** (Critical / High / Medium / Low)

### Issue 2:

- **Feature:**
- **Steps to Reproduce:**
- **Expected:**
- **Actual:**
- **Severity:**

---

## ✅ Final Approval

Once all tests pass:

- [ ] All core features working
- [ ] All keyboard shortcuts working
- [ ] All templates loading
- [ ] Auto-capture triggers working
- [ ] Analytics calculations accurate
- [ ] Export/import working
- [ ] No critical bugs found
- [ ] Performance acceptable
- [ ] UX polished and professional

**Tester Name:** ******\_\_\_******  
**Date:** ******\_\_\_******  
**Status:** [ ] APPROVED FOR RELEASE [ ] NEEDS FIXES

---

## 🚀 Next Steps After Approval

1. **Version Bump:** Update `package.json` to `0.2.0`
2. **Changelog:** Document all changes in `CHANGELOG.md`
3. **README:** Update with new features
4. **Build:** Run `npm run package`
5. **Publish:** Run `vsce publish`
6. **Celebrate:** 🎉 You just shipped a production extension!

---

**Testing Guidelines:**

- Test each feature at least twice
- Try both happy paths and edge cases
- Use different project types (TypeScript, JavaScript, etc.)
- Test with and without git repositories
- Verify keyboard shortcuts work
- Check notifications are clear
- Ensure no errors in Developer Console (Help > Toggle Developer Tools)
