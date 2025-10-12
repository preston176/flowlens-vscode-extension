# How To Use FlowLens to Capture and Resume Your Coding Sessions

This guide explains how to use the FlowLens extension for Visual Studio Code to save your work context and quickly resume where you left off.

## Introduction

FlowLens helps you remember what you were working on by saving your open files, terminals, git branch, and notes. With one click, you can restore your coding session and get back to work instantly.

## Prerequisites

- Visual Studio Code installed on your computer
- FlowLens extension installed and enabled
- Basic familiarity with opening and closing files in VS Code

## Steps

### 1. Capture Your Current Session

1. Open Visual Studio Code and work as usual (open files, run terminals, make changes).
2. When you want to save your current work context, press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac) to open the Command Palette.
3. Type `FlowLens: Capture Session` and select it from the list.
4. Enter a short title for your session (for example, "Fixing API bug").
5. (Optional) Add a note to remind yourself what you were doing.
6. You will see a confirmation message that your session was captured.

### 2. View and Resume a Saved Session

1. Press `Ctrl+Shift+P` or `Cmd+Shift+P` to open the Command Palette.
2. Type `FlowLens: Open Sessions Panel` and select it.
3. The FlowLens Sessions Panel will open, showing a list of your saved sessions.
4. Use the search bar at the top to find a session by title, note, file name, or terminal command.
5. Click the **Resume** button next to the session you want to restore.
6. VS Code will reopen your files, set your cursor positions, and restore your work context.

### 3. Delete a Session

1. In the FlowLens Sessions Panel, find the session you want to remove.
2. Click the **Delete** button next to that session.
3. The session will be removed from your list.

## Expected Results

- After capturing a session, it appears in the Sessions Panel with your title and note.
- When you resume a session, your files and terminals are restored to the state they were in when you saved.
- Deleted sessions are removed from the list and cannot be restored.

## Troubleshooting

- **Sessions not appearing:** Make sure you have captured at least one session. Try reloading VS Code if the panel is blank.
- **Files not reopening:** If a file was moved or deleted after capturing, it may not reopen. Check your file paths.
- **Extension not working:** Ensure FlowLens is enabled in the Extensions sidebar. Try reinstalling if problems persist.

## Additional Information

- FlowLens only saves metadata (file paths, cursor positions, terminal commands, git branch, and notes). Your code is never uploaded.
- All session data is stored locally on your machine by default.
- You can add a short note to each session to help you remember why you paused.
- For more details or updates, visit the FlowLens website or contact support.
