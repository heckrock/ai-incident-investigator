#!/bin/bash
set -euo pipefail

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$REPO_DIR"

echo "=== AI Incident Investigator — GitHub Push Helper ==="
echo ""

# 1. Verify local repo
echo "[1/4] Checking local repo..."
git status --short
git log -1 --oneline
echo ""

# 2. Test GitHub connectivity
echo "[2/4] Testing GitHub connectivity..."
if ! ping -c 1 -W 3 github.com &>/dev/null; then
  echo "ERROR: Cannot reach github.com. Check your internet connection."
  exit 1
fi
echo "  github.com is reachable"
echo ""

# 3. Test SSH auth
echo "[3/4] Testing SSH auth to GitHub..."
SSH_RESULT=$(ssh -T git@github.com -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10 2>&1 || true)
echo "  $SSH_RESULT"

if echo "$SSH_RESULT" | grep -q "Hi heckrock"; then
  echo ""
  echo "[4/4] SSH works — pushing to origin main..."
  git remote set-url origin git@github.com:heckrock/ai-incident-investigator.git
  git push -u origin main
  echo ""
  echo "SUCCESS: https://github.com/heckrock/ai-incident-investigator"
  exit 0
fi

# 4. Fall back to gh CLI
echo ""
echo "[4/4] SSH not configured — trying GitHub CLI..."
export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

if ! command -v gh &>/dev/null; then
  echo "ERROR: Neither SSH nor gh CLI is working."
  echo ""
  echo "Fix option A — SSH (recommended):"
  echo "  1. Copy your public key:"
  echo "     cat ~/.ssh/id_ed25519.pub"
  echo "  2. Add it at https://github.com/settings/keys"
  echo "  3. Run: ssh-add --apple-use-keychain ~/.ssh/id_ed25519"
  echo "  4. Re-run this script"
  exit 1
fi

if ! gh auth status &>/dev/null; then
  echo "ERROR: gh CLI token is expired or invalid."
  echo ""
  echo "Fix option B — Re-authenticate gh:"
  echo "  gh auth login -h github.com"
  echo "  (Choose GitHub.com → SSH → Login with browser)"
  echo "  Then re-run this script"
  exit 1
fi

echo "  gh auth OK — pushing..."
git push -u origin main
echo ""
echo "SUCCESS: https://github.com/heckrock/ai-incident-investigator"
