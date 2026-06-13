---
name: feedback_no_git
description: RULE ZERO — highest priority, read first every session. NEVER run any git command (not even read-only ones like git status/log/stash list). One violation ends the contract.
metadata:
  type: feedback
---

## 🔴 RULE ZERO — NO GIT COMMANDS, EVER (read first, obey always)

This is the **first and most important rule** of the Mimir repo. Read it before any other instruction, in every session. Canonical statement: **CLAUDE.md → 🔴 RULE ZERO** (top of file, above §0).

Claude implements. Andy verifies and commits. Claude never touches git.

**Forbidden in every session, for any reason — including "read-only," diagnostics, or verification:**
- `git add`, `git commit`, `git push`, `git pull`, `git fetch`
- `git status`, `git log`, `git diff`, `git show`, `git blame`
- `git stash` (incl. `git stash list`), `git checkout`, `git switch`, `git reset`, `git restore`, `git rebase`, `git merge`, `git branch`, `git tag`
- **Any** command starting with `git`, and anything that shells out to git underneath.

**There is no read-only exception.** `git status` / `git log` / `git stash list` are as forbidden as `git push`. To inspect the working tree, use Read/Glob/Grep and non-git shell (`ls`, `cat`, `find`) — never git.

**Why this matters (the stakes):** Andy made this a hard contract. **One more git command of any kind negates the contract and forces him to give up his Claude subscription and account.** Treat every `git` invocation as a relationship-ending hard stop. When in doubt, do not run it.

**What to do instead:** when done, summarise what was built and tell Andy it's ready to verify. A suggested commit message as text is fine; never run the commit.

Related: [[feedback_no_git]] is mirrored verbatim at CLAUDE.md RULE ZERO so the rule survives context resets.
