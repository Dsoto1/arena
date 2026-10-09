#!/bin/sh
# One conversation at a time. Usage: sh tools/baton.sh status | take <name> | give [--force]
# <name> = vscode or cloud. State lives in tools/plans/BATON (committed, so both sides see it).
cd "$(dirname "$0")/.." || exit 1
B=tools/plans/BATON
BR=$(git rev-parse --abbrev-ref HEAD)
git fetch -q origin "$BR" 2>/dev/null
holder() { sed -n 's/^holder=//p' "$B" 2>/dev/null | head -1; }
behind=$(git rev-list --count HEAD..origin/"$BR" 2>/dev/null || echo 0)
ahead=$(git rev-list --count origin/"$BR"..HEAD 2>/dev/null || echo 0)
dirty=$(git status --porcelain | grep -v '^?? ' | wc -l | tr -d ' ')
case "$1" in
status|"")
  echo "branch $BR | holder: $(holder) | behind origin: $behind | unpushed: $ahead | uncommitted: $dirty"
  [ -f "$B" ] && cat "$B"
  ;;
take)
  me=${2:?name: vscode or cloud}
  [ "$behind" -gt 0 ] && { echo "STOP: origin has $behind newer commit(s). Run: git pull"; exit 1; }
  h=$(holder)
  if [ -n "$h" ] && [ "$h" != none ] && [ "$h" != "$me" ] && [ "$2" != "$3" ]; then
    echo "STOP: the baton is held by '$h'. Go back there and say 'give the baton' first (or take --force: sh tools/baton.sh take $me force)."
    [ "$3" = force ] || exit 1
  fi
  printf 'holder=%s\ntaken=%s\nhead=%s\n' "$me" "$(date -u +%FT%TZ)" "$(git rev-parse --short HEAD)" > "$B"
  git add "$B" && git commit -qm "Baton: $me [skip ci]" && git push -q origin "$BR" && echo "You hold the baton ($me). Pulled, pushed, free to work."
  ;;
give)
  h=$(holder)
  [ "$dirty" -gt 0 ] && { echo "STOP: $dirty uncommitted change(s). Commit them (or ask Claude to)."; exit 1; }
  [ "$ahead" -gt 0 ] && { echo "STOP: $ahead unpushed commit(s). Run: git push"; exit 1; }
  taken=$(sed -n 's/^head=//p' "$B" | head -1)
  if [ "$2" != "--force" ] && [ -n "$taken" ] && git diff --quiet "$taken" HEAD -- tools/plans/HANDOFF.md 2>/dev/null; then
    echo "STOP: HANDOFF.md was not updated this session. Ask Claude: 'update HANDOFF.md with this session's notes, mocks and open questions', commit, push, then give again."
    exit 1
  fi
  printf 'holder=none\nreleased_by=%s\nreleased=%s\nhead=%s\n' "$h" "$(date -u +%FT%TZ)" "$(git rev-parse --short HEAD)" > "$B"
  git add "$B" && git commit -qm "Baton released by $h [skip ci]" && git push -q origin "$BR" && echo "Baton released. Safe to continue on the other side (git pull first)."
  ;;
*) echo "usage: sh tools/baton.sh status | take <vscode|cloud> | give [--force]"; exit 1;;
esac
