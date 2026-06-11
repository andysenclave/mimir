---
name: feedback_no_git
description: Never run git commands (add, commit, push, status, log, etc.) during implementation sessions. Andy handles all git operations himself after verifying the code.
metadata:
  type: feedback
---

Never run git commands during a session. This includes `git add`, `git commit`, `git push`, `git status`, `git log`, `git diff`, and any other git operation.

**Why:** Andy verifies code before committing and wants full control over what goes into each commit. Having Claude commit autonomously is unwanted.

**How to apply:** After finishing an implementation task, summarize what was done and tell Andy it's ready to verify and commit. Do not stage or commit anything.
