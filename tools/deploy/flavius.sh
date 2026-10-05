#!/bin/bash
# flavius.sh — one helper for every Flavius Rule deployment, run in AWS CloudShell (us-east-1).
#
#   bash flavius.sh release                                 EVERYTHING in the right order, from the files uploaded here:
#                                                           server zip → game zip → site zip → privacy.html (each only if present) → status
#   bash flavius.sh game   flavius-site-update-v0.80.zip   the game: play/assets (if any) → play/index.html → play/version.json
#   bash flavius.sh download flavius-download-v0.88.zip    the standalone download: play/flavius-rule-arena.zip
#   (release finds every zip above by its name, updates this script from the game zip, and files used zips in ~/flavius-done)
#   bash flavius.sh site   flavius-site-v0.78.zip          the whole website (never touches play/ or FlaviusSiteMedia/)
#   bash flavius.sh page   privacy.html                    one file at the site root (or: page file.css some/folder/file.css)
#   bash flavius.sh server flavius-server-8.zip            the online server (asks for the Google client secret, hidden)
#   bash flavius.sh online online.json                     play/online.json (the game's server settings)
#   bash flavius.sh login                                  the own sign-in address login.flaviusrule.com, in two runs 15 min apart
#                                                           (1st: certificate · 2nd: the address + play/online.json); later server
#                                                           deploys keep it on by themselves (remembered in ~/.flavius.conf)
#   bash flavius.sh status                                 what is live: game version, server, sign-in, styles
#
# Everything is uploaded with Cache-Control: no-cache and CloudFront is cleared for exactly the changed paths.
# Nothing is ever deleted from the bucket. DRY=1 bash flavius.sh … prints the commands instead of running them.
# Your alert e-mail is asked once and kept in ~/.flavius.conf (never in this file).
set -euo pipefail
BUCKET="flaviusrule.com"
DIST="E3P6OKSHPTXJGF"
STACK="flavius-arena"
REGION="us-east-1"
POOL="us-east-1_VdMsuDJ59"
GOOGLE_ID="158703920017-qiaafniuvh2asr988n18sudlk7hkdcd4.apps.googleusercontent.com"
SITE="https://flaviusrule.com"
CONF="$HOME/.flavius.conf"
export AWS_DEFAULT_REGION="$REGION"

say(){ printf '\n\033[1;33m== %s\033[0m\n' "$*"; }
ok(){ printf '\033[1;32m✓ %s\033[0m\n' "$*"; }
die(){ printf '\033[1;31m✗ %s\033[0m\n' "$*" >&2; exit 1; }
run(){ if [ "${DRY:-}" = 1 ]; then printf '   [dry] %s\n' "$*"; else "$@"; fi; }
need_zip(){ [ -n "${1:-}" ] || die "Which zip? e.g.  bash flavius.sh $CMD the-file.zip"; [ -f "$1" ] || die "No file named $1 here. Upload it first (Actions → Upload file), then run this again from your home folder."; }
ctype(){ case "${1,,}" in
  *.html) echo "text/html; charset=utf-8";; *.css) echo "text/css";; *.js) echo "text/javascript";; *.json) echo "application/json";;
  *.png) echo "image/png";; *.jpg|*.jpeg) echo "image/jpeg";; *.webp) echo "image/webp";; *.svg) echo "image/svg+xml";; *.gif) echo "image/gif";;
  *.ico) echo "image/x-icon";; *.pdf) echo "application/pdf";; *.zip) echo "application/zip";; *.mp4) echo "video/mp4";; *.txt) echo "text/plain; charset=utf-8";;
  *) echo "application/octet-stream";; esac; }
put(){ # put <local file> <key in the bucket>
  run aws s3 cp "$1" "s3://$BUCKET/$2" --cache-control no-cache --content-type "$(ctype "$2")" --only-show-errors; ok "uploaded /$2"; }
clear_cdn(){ # clear_cdn <path> [<path> …] — and wait until CloudFront is done
  say "Clearing CloudFront: $*"
  if [ "${DRY:-}" = 1 ]; then printf '   [dry] aws cloudfront create-invalidation --distribution-id %s --paths %s\n' "$DIST" "$*"; return; fi
  local id; id=$(aws cloudfront create-invalidation --distribution-id "$DIST" --paths "$@" --query Invalidation.Id --output text)
  printf '   waiting (usually under a minute)…\n'; aws cloudfront wait invalidation-completed --distribution-id "$DIST" --id "$id" && ok "CloudFront cleared"; }
unpack(){ # unpack <zip> → prints the folder
  local d; d=$(mktemp -d "$HOME/.flavius-XXXX"); unzip -oq "$1" -d "$d"; echo "$d"; }

cmd_game(){ need_zip "${1:-}"; local d; d=$(unpack "$1"); local p="$d/play"
  [ -f "$p/index.html" ] && [ -f "$p/version.json" ] || die "That zip has no play/index.html + play/version.json — is it a game update?"
  local v; v=$(sed -n 's/.*"v" *: *"\([^"]*\)".*/\1/p' "$p/version.json"); say "Game update v$v"
  if [ -d "$p/assets" ]; then say "New art first (old files are kept)"; run aws s3 sync "$p/assets" "s3://$BUCKET/play/assets/" --only-show-errors; ok "play/assets synced"; fi
  put "$p/index.html" "play/index.html"
  [ -f "$p/flavius-rule-arena.zip" ] && put "$p/flavius-rule-arena.zip" "play/flavius-rule-arena.zip"
  [ -f "$p/arena_shot.webp" ] && put "$p/arena_shot.webp" "play/arena_shot.webp"   # the advert shot on play.html, retaken every release
  put "$p/version.json" "play/version.json"
  [ -f "$p/online.json" ] && printf '   (play/online.json in the zip was NOT uploaded — use: bash flavius.sh online …)\n'
  local cl=("/play/" "/play/index.html" "/play/version.json" "/play/flavius-rule-arena.zip" "/play/arena_shot.webp")
  [ -d "$p/assets" ] && cl+=("/play/assets/*")   # art that kept its name (arena.jpg, lang_*.js, card backs) must not be served from the old cache
  clear_cdn "${cl[@]}"
  [ "${DRY:-}" = 1 ] || { local live; live=$(curl -s "$SITE/play/version.json?x=$RANDOM" | sed -n 's/.*"v" *: *"\([^"]*\)".*/\1/p'); [ "$live" = "$v" ] && ok "live: v$live" || printf '   live version reads "%s" — give it a minute and run: bash flavius.sh status\n' "$live"; }
  rm -rf "$d"; }

cmd_download(){ need_zip "${1:-}"; local d; d=$(unpack "$1"); local f="$d/play/flavius-rule-arena.zip"
  [ -f "$f" ] || die "That zip has no play/flavius-rule-arena.zip — is it the download zip?"
  say "The download (standalone game)"; put "$f" "play/flavius-rule-arena.zip"; clear_cdn "/play/flavius-rule-arena.zip"; rm -rf "$d"; }

cmd_site(){ need_zip "${1:-}"; local d; d=$(unpack "$1"); [ -f "$d/index.html" ] || die "That zip has no index.html at its top — is it the full site zip?"
  say "Website (adds and replaces only; play/ and FlaviusSiteMedia/ are left alone)"
  run aws s3 sync "$d/" "s3://$BUCKET/" --exclude "README*" --exclude "play/*" --exclude "FlaviusSiteMedia/*" --cache-control no-cache --only-show-errors
  ok "site synced"; clear_cdn "/*"; rm -rf "$d"; }

cmd_page(){ local f="${1:-}"; [ -n "$f" ] && [ -f "$f" ] || die "Which file? e.g.  bash flavius.sh page privacy.html"
  local key="${2:-$(basename "$f")}"; key="${key#/}"; say "One file → /$key"; put "$f" "$key"
  local paths=("/$key"); case "$key" in *.html) paths+=("/${key%.html}");; esac; clear_cdn "${paths[@]}"; }

cmd_online(){ local f="${1:-}"; [ -n "$f" ] && [ -f "$f" ] || die "Which file? e.g.  bash flavius.sh online online.json"
  python3 -c "import json,sys;j=json.load(open(sys.argv[1]));assert j.get('ws','').startswith('wss://'),'no ws'" "$f" 2>/dev/null || die "$f is not a valid online.json (needs a wss:// \"ws\")"
  say "Online settings → /play/online.json"; cat "$f"; echo; put "$f" "play/online.json"; clear_cdn "/play/online.json"; }

cmd_server(){ need_zip "${1:-}"; local email=""
  [ -f "$CONF" ] && . "$CONF"; email="${ALERT_EMAIL:-}"
  if [ -z "$email" ]; then read -r -p "Budget alert e-mail (asked once, kept in ~/.flavius.conf): " email; email=$(printf '%s' "$email" | tr -d '\r\n\t '); printf 'ALERT_EMAIL=%q\n' "$email" > "$CONF"; fi
  say "Server: $1"; cd "$HOME"; run unzip -oq "$1"; [ "${DRY:-}" = 1 ] || [ -f "$HOME/server/deploy.sh" ] || die "The zip did not contain server/deploy.sh"
  printf 'Paste the Google client SECRET (nothing shows), then Enter: '; local sec; read -r -s sec; echo; sec=$(printf '%s' "$sec" | tr -d '\r\n\t ')
  [ ${#sec} -ge 20 ] || die "That secret is ${#sec} characters — expected about 35. Run again."
  ok "secret read (${#sec} characters)"
  [ "${DRY:-}" = 1 ] || cd "$HOME/server"; AUTH_DOMAIN="${AUTH_DOMAIN:-${LOGIN_DOMAIN:-none}}" AUTH_STAGE="${AUTH_STAGE:-${LOGIN_STAGE:-cert}}" GOOGLE_ID="$GOOGLE_ID" GOOGLE_SECRET="$sec" run sh deploy.sh "$email"
  unset sec; [ "${DRY:-}" = 1 ] || cmd_status; }

# the own sign-in address: run once → certificate; run again 15+ minutes later → the address goes live and the game switches to it
conf_set(){ touch "$CONF"; grep -v "^$1=" "$CONF" > "$CONF.tmp" || true; printf '%s=%q\n' "$1" "$2" >> "$CONF.tmp"; mv "$CONF.tmp" "$CONF"; }
cmd_login(){ local dom="login.flaviusrule.com" zip; [ -f "$CONF" ] && . "$CONF"
  zip=$(ls -t "$HOME"/flavius-server-*.zip 2>/dev/null | head -1 || true); [ -n "$zip" ] || die "Upload the newest server zip first (Actions → Upload file)."
  if [ "${LOGIN_STAGE:-}" = live ]; then say "$dom is already set up"; cmd_status; return; fi
  if [ "${LOGIN_STAGE:-}" != cert ]; then
    say "Step 1 of 2: the certificate for $dom (with $(basename "$zip"))"
    AUTH_DOMAIN="$dom" AUTH_STAGE=cert cmd_server "$zip"
    conf_set LOGIN_DOMAIN "$dom"; conf_set LOGIN_STAGE cert; conf_set LOGIN_CERT_AT "$(date +%s)"
    ok "Certificate made. Come back in 15 minutes and run:  bash flavius.sh login"; return; fi
  local wait=$(( ${LOGIN_CERT_AT:-0} + 900 - $(date +%s) ))
  [ "$wait" -le 0 ] || die "Too soon — CloudFront needs time to see the certificate. Run this again in $(( (wait+59)/60 )) min."
  say "Step 2 of 2: the sign-in address $dom"
  AUTH_DOMAIN="$dom" AUTH_STAGE=live cmd_server "$zip"
  local out; out=$(aws cloudformation describe-stacks --stack-name "$STACK" --query "Stacks[0].Outputs[?OutputKey=='SignInDomain'].OutputValue" --output text 2>/dev/null || true)
  [ "$out" = "https://$dom" ] || die "The server still reports '$out' as its sign-in address — nothing else changed. Send this to Claude."
  conf_set LOGIN_STAGE live
  say "The game now signs in through https://$dom"
  local oj; oj=$(curl -s -m 10 "$SITE/play/online.json?x=$RANDOM"); [ -n "$oj" ] || die "Could not read play/online.json"
  printf '%s' "$oj" | python3 -c "import json,sys;j=json.load(sys.stdin);j['auth']='https://$dom';json.dump(j,open('online-login.json','w'),separators=(',',':'))" || die "play/online.json is not valid JSON"
  cmd_online online-login.json
  ok "Done. Sign in once to check: Google should now name flaviusrule.com."; }

G(){ printf '  \033[1;32m●\033[0m %-16s %s\n' "$1" "$2"; }   # fine
Y(){ printf '  \033[1;33m●\033[0m %-16s %s\n' "$1" "$2"; YN=$((YN+1)); }   # worth a look
R(){ printf '  \033[1;31m●\033[0m %-16s %s\n' "$1" "$2"; RN=$((RN+1)); }   # needs attention now
cmd_status(){ set +e +o pipefail; say "What is live   (green = fine · yellow = worth a look · red = fix now)"; YN=0; RN=0
  # the game page and its version
  local vj v page pver; vj=$(curl -s -m 10 "$SITE/play/version.json?x=$RANDOM" || true); v=$(printf '%s' "$vj" | sed -n 's/.*"v" *: *"\([^"]*\)".*/\1/p')
  page=$(curl -s -m 20 "$SITE/play/?x=$RANDOM" || true); pver=$(printf '%s' "$page" | grep -o 'arena · v[0-9.]*' | head -1 | sed 's/.*v//')
  if [ -z "$v" ]; then R "game version" "play/version.json is missing or unreadable"
  elif [ -n "$pver" ] && [ "$pver" != "$v" ]; then Y "game version" "version.json says v$v but the page is v$pver (upload both, version.json last)"
  else G "game version" "v$v"; fi
  # online.json → the server address and the sign-in address the page uses
  local oj ws auth; oj=$(curl -s -m 10 "$SITE/play/online.json?x=$RANDOM" || true)
  ws=$(printf '%s' "$oj" | sed -n 's/.*"ws" *: *"\([^"]*\)".*/\1/p'); auth=$(printf '%s' "$oj" | sed -n 's/.*"auth" *: *"\([^"]*\)".*/\1/p')
  [ -n "$ws" ] && G "online.json" "server ${ws#wss://}" || R "online.json" "missing or unreadable — the game falls back to the offline preview"
  # the stack
  local st; st=$(aws cloudformation describe-stacks --stack-name "$STACK" --query 'Stacks[0].StackStatus' --output text 2>/dev/null || echo "?")
  case "$st" in
    UPDATE_ROLLBACK_COMPLETE) Y "server stack" "$st — the last update failed and was undone; the server before it is running";;
    *ROLLBACK*|*FAILED*|"?") R "server stack" "$st";;
    *IN_PROGRESS*) Y "server stack" "$st — a deploy is running";;
    *) G "server stack" "$st";; esac
  local out_auth; out_auth=$(aws cloudformation describe-stacks --stack-name "$STACK" --query "Stacks[0].Outputs[?OutputKey=='SignInDomain'].OutputValue" --output text 2>/dev/null || true)
  if [ -n "$auth" ] && [ -n "$out_auth" ] && [ "$out_auth" != "None" ]; then [ "$auth" = "$out_auth" ] && G "sign-in address" "${auth#https://}" || R "sign-in address" "online.json uses ${auth#https://} but the server's is ${out_auth#https://} — sign-in will fail"; fi
  case "$auth" in *amazoncognito.com*) Y "sign-in look" "Google shows amazoncognito.com (login.flaviusrule.com not set up yet)";; esac
  # the arena Lambda: when it was updated, and whether the budget switch closed it
  local fn; fn=$(aws cloudformation describe-stack-resources --stack-name "$STACK" --logical-resource-id Fn --query 'StackResources[0].PhysicalResourceId' --output text 2>/dev/null || true)
  if [ -n "$fn" ] && [ "$fn" != "None" ]; then
    G "server updated" "$(aws lambda get-function --function-name "$fn" --query Configuration.LastModified --output text 2>/dev/null | cut -c1-16 | tr T ' ') UTC"
    local cc; cc=$(aws lambda get-function-concurrency --function-name "$fn" --query ReservedConcurrentExecutions --output text 2>/dev/null || echo None)
    [ "$cc" = "0" ] && R "arena open?" "CLOSED by the budget switch — reopen: see the stack's ReopenCommand output" || G "arena open?" "open"
  else R "server updated" "the arena function was not found"; fi
  # page and server speak the same protocol? (the server answers 401 = 'sign in' when the version is right, 426 when it is not)
  local pv code; pv=$(printf '%s' "$page" | grep -o 'const VER=[0-9]*' | head -1 | cut -d= -f2)
  if [ -n "$ws" ] && [ -n "$pv" ]; then code=$(curl -s -m 10 -o /dev/null -w '%{http_code}' -H 'Connection: Upgrade' -H 'Upgrade: websocket' -H 'Sec-WebSocket-Version: 13' -H 'Sec-WebSocket-Key: Zmxhdml1c3J1bGVfX3Rlc3Q=' "https://${ws#wss://}?ver=$pv" || true)
    case "$code" in 401|403|101) G "versions match" "page protocol $pv is accepted by the server";; 426) R "versions match" "the server refuses the page's protocol $pv — deploy the matching server zip";; *) Y "versions match" "could not tell (answer $code)";; esac; fi
  # Google sign-in settings inside Cognito
  local cid; cid=$(aws cognito-idp describe-identity-provider --user-pool-id "$POOL" --provider-name Google --query IdentityProvider.ProviderDetails.client_id --output text 2>/dev/null || echo '?')
  [ "$cid" = "$GOOGLE_ID" ] && G "google client" "correct" || R "google client" "Cognito holds \"$cid\" — Google sign-in will fail"
  # this month's spend against the budget
  local acct lim spent; acct=$(aws sts get-caller-identity --query Account --output text 2>/dev/null || true)
  if [ -n "$acct" ]; then read -r lim spent < <(aws budgets describe-budget --account-id "$acct" --budget-name flavius-arena-budget --query 'Budget.[BudgetLimit.Amount,CalculatedSpend.ActualSpend.Amount]' --output text 2>/dev/null || echo "")
    if [ -n "${lim:-}" ] && [ -n "${spent:-}" ]; then local pct; pct=$(awk -v a="$spent" -v b="$lim" 'BEGIN{printf "%d", (b>0?a*100/b:0)}')
      if [ "$pct" -ge 100 ]; then R "this month" "\$$spent of \$$lim (${pct}%) — the arena closes at 100%"; elif [ "$pct" -ge 75 ]; then Y "this month" "\$$spent of \$$lim (${pct}%)"; else G "this month" "\$$spent of \$$lim (${pct}%)"; fi
    else Y "this month" "budget not readable"; fi; fi
  # the website
  local css; css=$(curl -s -m 10 "$SITE/styles.css?x=$RANDOM" | head -c 80 || true)
  case "$css" in *"look of the digital arena"*) G "site styles" "the arena look";; "") R "site styles" "styles.css not served";; *) Y "site styles" "an older styles.css is live — bash flavius.sh site <full site zip>";; esac
  local pc; pc=$(curl -s -m 10 -o /dev/null -w '%{http_code}' "$SITE/privacy" || true)
  [ "$pc" = "200" ] && G "privacy page" "/privacy" || Y "privacy page" "/privacy answers $pc (Google's consent screen links to it)"
  echo; if [ "$RN" -gt 0 ]; then printf '\033[1;31m%s to fix now\033[0m' "$RN"; elif [ "$YN" -gt 0 ]; then printf '\033[1;33mAll working — %s worth a look\033[0m' "$YN"; else printf '\033[1;32mAll green\033[0m'; fi; echo; }

# one command per release: the newest server zip, game zip, site zip and privacy.html found here, in the safe order
cmd_release(){ local here; here=$(pwd)
  local srv gam dl sit pri; srv=$(ls -t "$here"/flavius-server-*.zip 2>/dev/null | head -1 || true); gam=$(ls -t "$here"/flavius-site-update-*.zip 2>/dev/null | head -1 || true)
  dl=$(ls -t "$here"/flavius-download-*.zip 2>/dev/null | head -1 || true)
  # the game zip carries the newest flavius.sh: when it differs from this one, swap it in and run again (so the steps never change)
  if [ -n "$gam" ] && [ -z "${FLAVIUS_UPDATED:-}" ] && unzip -l "$gam" flavius.sh >/dev/null 2>&1; then
    local t; t=$(mktemp); unzip -p "$gam" flavius.sh > "$t"
    if ! cmp -s "$t" "$0"; then cp "$t" "$0"; rm -f "$t"; ok "flavius.sh updated from the game zip — continuing with the new one"; FLAVIUS_UPDATED=1 exec bash "$0" release; fi; rm -f "$t"; fi
  sit=$(ls -t "$here"/flavius-site-v*.zip 2>/dev/null | head -1 || true)
  pri=""; [ -f "$here/privacy.html" ] && pri="$here/privacy.html"
  [ -n "$srv$gam$sit$pri" ] || die "Nothing to release here. Upload the server zip, the game zip, the site zip and/or privacy.html first (Actions → Upload file)."
  say "Release plan"; echo "  1 server   : ${srv:-(none uploaded — skipped)}"; echo "  2 game     : ${gam:-(none uploaded — skipped)}"; echo "  3 download : ${dl:-(none uploaded — skipped)}"; echo "  4 site     : ${sit:-(none uploaded — skipped)}"; echo "  5 page     : ${pri:-(none uploaded — skipped)}"
  if [ "${DRY:-}" != 1 ]; then read -r -p "Go? [y/N] " ok; case "$ok" in y|Y|yes) ;; *) die "Stopped — nothing changed.";; esac; fi
  [ -n "$srv" ] && { cmd_server "$srv"; cd "$here"; }
  [ -n "$gam" ] && { cmd_game "$gam"; cd "$here"; }
  [ -n "$dl" ] && { cmd_download "$dl"; cd "$here"; }
  [ -n "$sit" ] && { cmd_site "$sit"; cd "$here"; }
  [ -n "$pri" ] && { cmd_page "$pri"; cd "$here"; }
  # file the zips that went out, so the next release only sees new ones (kept in ~/flavius-done, the last 3 releases)
  if [ "${DRY:-}" != 1 ]; then mkdir -p "$HOME/flavius-done"; for f in $srv $gam $dl $sit; do [ -n "$f" ] && mv -f "$f" "$HOME/flavius-done/"; done
    ls -t "$HOME"/flavius-done/*.zip 2>/dev/null | tail -n +13 | xargs -r rm -f; fi
  cmd_status; }

CMD="${1:-}"; shift || true
case "$CMD" in
  release) cmd_release;; game) cmd_game "$@";; download) cmd_download "$@";; site) cmd_site "$@";; page) cmd_page "$@";; online) cmd_online "$@";; login) cmd_login;; server) cmd_server "$@";; status) cmd_status;;
  *) sed -n '2,19p' "$0" | sed 's/^# \{0,1\}//';;
esac
