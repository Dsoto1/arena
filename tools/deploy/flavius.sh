#!/bin/bash
# flavius.sh — one helper for every Flavius Rule deployment, run in AWS CloudShell (us-east-1).
#
#   bash flavius.sh betaurl                                 prints the beta address again (no deploy)
#   bash flavius.sh release [1.02]                          EVERYTHING, straight from GitHub (no uploads): the newest release branch
#                                                           release/vX.YY on the repo (or the version named = a rollback) → server (only when it changed) → game →
#                                                           download → status. The GitHub token is asked once (hidden), kept in
#                                                           ~/.flavius.conf. If zips WERE uploaded here, they are used instead:
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
#   bash flavius.sh beta [branch]                          the work in progress → a PRIVATE test copy (its own address, its own saves):
#                                                           page + assets only, never the server, the download or the site
#   bash flavius.sh update                                 this script itself, from the newest work branch on GitHub (beta does it too)
#   bash flavius.sh status                                 what is live: game version, server, sign-in, styles
#   bash flavius.sh quota                                  the account's Lambda limit (the Ranked check needs room for 3 replays): asks AWS once, prints where it stands
#
# Everything is uploaded with Cache-Control: no-cache and CloudFront is cleared for exactly the changed paths.
# Nothing is ever deleted from the bucket. DRY=1 bash flavius.sh … prints the commands instead of running them.
# Your alert e-mail is asked once and kept in ~/.flavius.conf (never in this file).
set -euo pipefail
# this script's own version: a release only swaps in its copy when that copy is NEWER (a rollback never brings back an old script)
FSH_VER=10
BUCKET="flaviusrule.com"
DIST="E3P6OKSHPTXJGF"
STACK="flavius-arena"
REGION="us-east-1"
POOL="us-east-1_VdMsuDJ59"
GOOGLE_ID="158703920017-qiaafniuvh2asr988n18sudlk7hkdcd4.apps.googleusercontent.com"
SITE="https://flaviusrule.com"
CONF="$HOME/.flavius.conf"
export AWS_DEFAULT_REGION="$REGION"
# never page AWS output: CloudShell's pager waited at a ":" prompt after the server deploy, so the game/site steps never ran
export AWS_PAGER=""

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

cmd_game(){ need_zip "${1:-}"; local d; d=$(unpack "$1"); game_dir "$d/play"; rm -rf "$d"; }
# the standalone download built HERE from a game zip (v0.91: the download zip outgrew 30 MiB — the game zip carries tools/mkshare.py)
dl_from_game(){ local d v; d=$(unpack "$1"); [ -f "$d/tools/mkshare.py" ] || { rm -rf "$d"; die "That game zip has no tools/mkshare.py — upload the download zip instead."; }
  v=$(python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['v'])" "$d/play/version.json") || die "no version.json in the game zip"
  say "The standalone download v$v (built here from the game zip)"
  mkdir -p "$d/b/tools"; cp "$d/play/index.html" "$d/b/flavius-arena.html"; cp -r "$d/play/assets" "$d/b/assets"; cp "$d/tools/mkshare.py" "$d/b/tools/"
  (cd "$d/b" && python3 tools/mkshare.py "$v" | tail -1 && cd share && zip -q -9 flavius-rule-arena.zip "flavius-rule-arena-v$v.html") || die "building the download failed"
  put "$d/b/share/flavius-rule-arena.zip" "play/flavius-rule-arena.zip"; clear_cdn "/play/flavius-rule-arena.zip"; rm -rf "$d"; }
game_dir(){ local p="$1"
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
  [ "${DRY:-}" = 1 ] || { local live; live=$(curl -s "$SITE/play/version.json?x=$RANDOM" | sed -n 's/.*"v" *: *"\([^"]*\)".*/\1/p'); [ "$live" = "$v" ] && ok "live: v$live" || printf '   live version reads "%s" — give it a minute and run: bash flavius.sh status\n' "$live"; }; }

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
  server_dir "$HOME/server" "$email"; [ "${DRY:-}" = 1 ] || [ "$CMD" = release ] || cmd_status; }
server_dir(){ local sd="$1" email="$2"
  # the Google secret stays in the server once set: only asked when you want to change it (NEW_SECRET=1 bash flavius.sh …)
  local sec=""; if [ "${NEW_SECRET:-}" = 1 ]; then printf 'Paste the NEW Google client SECRET (nothing shows), then Enter: '; read -r -s sec; echo; sec=$(printf '%s' "$sec" | tr -d '\r\n\t ')
    [ ${#sec} -ge 20 ] || die "That secret is ${#sec} characters — expected about 35. Run again."; ok "new secret read (${#sec} characters)"
  else ok "Google secret: keeping the one the server already has (NEW_SECRET=1 to change it)"; fi
  lambda_quota || true
  [ "${DRY:-}" = 1 ] || cd "$sd"; AUTH_DOMAIN="${AUTH_DOMAIN:-${LOGIN_DOMAIN:-none}}" AUTH_STAGE="${AUTH_STAGE:-${LOGIN_STAGE:-cert}}" GOOGLE_ID="$GOOGLE_ID" GOOGLE_SECRET="$sec" run sh deploy.sh "$email"
  unset sec; ok "server deployed"; }

# v1.12 (R5a): the account's Lambda concurrency limit (Service Quotas L-B99A9384). A new AWS account has 10 at once — too few for the Ranked
# check's own 3 (AWS keeps 100 unreserved). Asks AWS ONCE for 1000 (the usual default) and prints where the request stands; an open request is
# never sent again, a denied one is reported (not re-sent). Run before every server deploy and by `bash flavius.sh quota`.
LQ_CODE="L-B99A9384"; LQ_WANT=1000
lambda_quota(){ local cur st dv
  cur=$(aws service-quotas get-service-quota --service-code lambda --quota-code "$LQ_CODE" --query 'Quota.Value' --output text 2>/dev/null | cut -d. -f1 || true)
  case "$cur" in ''|None|*[!0-9]*) cur=$(aws lambda get-account-settings --query AccountLimit.ConcurrentExecutions --output text 2>/dev/null || true);; esac
  case "$cur" in ''|None|*[!0-9]*) printf '\033[1;33m! Lambda limit: could not read it (the Ranked check works anyway, without its own 3)\033[0m\n'; return 0;; esac
  if [ "$cur" -ge 103 ]; then ok "Lambda limit: $cur at once (room for the Ranked check's 3)"; return 0; fi
  read -r st dv < <(aws service-quotas list-requested-service-quota-change-history-by-quota --service-code lambda --quota-code "$LQ_CODE" \
    --query 'reverse(sort_by(RequestedQuotas,&Created))[0].[Status,DesiredValue]' --output text 2>/dev/null || echo "None None")
  case "${st:-None}" in
    PENDING|CASE_OPENED) ok "Lambda limit: $cur now — AWS is reviewing the raise to ${dv%%.*} ($st; usually hours, AWS e-mails you). Nothing to do.";;
    DENIED|NOT_APPROVED) printf '\033[1;33m! Lambda limit: %s — AWS turned the raise down (%s). The Ranked check still works, sharing the pool. Send Claude this line.\033[0m\n' "$cur" "$st";;
    APPROVED|CASE_CLOSED) printf '\033[1;33m! Lambda limit: %s — AWS closed the request (%s) but the limit has not moved yet. Run bash flavius.sh quota again later.\033[0m\n' "$cur" "$st";;
    *) if [ "${DRY:-}" = 1 ]; then printf '   [dry] aws service-quotas request-service-quota-increase --service-code lambda --quota-code %s --desired-value %s\n' "$LQ_CODE" "$LQ_WANT"; return 0; fi
       if aws service-quotas request-service-quota-increase --service-code lambda --quota-code "$LQ_CODE" --desired-value "$LQ_WANT" --query 'RequestedQuota.Status' --output text >/dev/null 2>&1; then
         ok "Lambda limit: $cur now — asked AWS for $LQ_WANT (for the Ranked check's 3 replays at once; AWS e-mails you when it is done, no click needed)"
       else printf '\033[1;33m! Lambda limit: %s — the raise could not be asked for (permissions?). The Ranked check works anyway, sharing the pool.\033[0m\n' "$cur"; fi;;
  esac; return 0; }
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
    # v1.12 the Ranked check: its mode and its own 3 replays (reserved concurrency; a new account's limit cannot hold them yet)
    local rc vc; rc=$(aws cloudformation describe-stacks --stack-name "$STACK" --query "Stacks[0].Parameters[?ParameterKey=='RankedCheck'].ParameterValue" --output text 2>/dev/null || true)
    vc=$(aws lambda get-function-concurrency --function-name flavius-arena-verify --query ReservedConcurrentExecutions --output text 2>/dev/null || echo None)
    case "$rc" in enforce) [ "$vc" = "3" ] && G "ranked check" "enforce · 3 replays at once" || Y "ranked check" "enforce · no reserved 3 yet (the account's Lambda limit — bash flavius.sh quota)";;
      log|off) Y "ranked check" "$rc — results by agreement only (VERIFY_MODE=enforce on the next server deploy turns it back on)";; *) Y "ranked check" "not on this server yet";; esac
  else R "server updated" "the arena function was not found"; fi
  # page and server speak the same protocol? (the server answers 401 = 'sign in' when the version is right, 426 when it is not)
  local pv code; pv=$(printf '%s' "$page" | grep -oE 'C\.VER=[0-9]+' | tail -1 | cut -d= -f2); [ -n "$pv" ] || pv=$(printf '%s' "$page" | grep -o 'const VER=[0-9]*' | head -1 | cut -d= -f2)  # 111-onlcore raises its protocol with C.VER (v1.0: 8); older pages only have the first const VER
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

# ---- releases straight from GitHub (his pick 2026-10-06: no more uploading zips) ----
REPO="dsoto1/arena"; SRC="$HOME/.flavius-src"
gh_token(){ [ -f "$CONF" ] && . "$CONF"; if [ -z "${GH_TOKEN:-}" ]; then
    printf 'GitHub token (read-only, this repo only; asked once, kept in ~/.flavius.conf — nothing shows): '; read -r -s GH_TOKEN; echo; GH_TOKEN=$(printf '%s' "$GH_TOKEN" | tr -d '\r\n\t ')
    [ ${#GH_TOKEN} -ge 20 ] || die "That token is ${#GH_TOKEN} characters — expected 40 or more. Run again."; conf_set GH_TOKEN "$GH_TOKEN"; chmod 600 "$CONF"; ok "token kept"; fi; }
gh_api(){ curl -fsS -m 20 -H "Authorization: Bearer $GH_TOKEN" -H "Accept: application/vnd.github+json" "https://api.github.com/repos/$REPO/$1"; }
# the branch carrying the release: the version asked for, else the highest version.json among the branches
gh_pick(){ local want="${1:-}" b v best="" bestv="0"; local list; list=$(gh_api "branches?per_page=100" | python3 -c "import json,sys;[print(x['name']) for x in json.load(sys.stdin)]") || die "GitHub refused the token (or the repo is not reachable). Make a new token and run: GH_TOKEN= bash flavius.sh release"
  # a letter release (1.08a) sorts after 1.08, before 1.09
  # from v1.02 every release is a branch release/vX.YY (made when the release is pushed): the newest one, or the one asked for (a rollback)
  local rl; rl=$(printf '%s\n' $list | sed -n 's|^release/v\([0-9.]*[a-z]\{0,1\}\)$|\1|p' | sort -t. -k1,1n -k2,2n -k2,2 | tr '\n' ' ')
  if [ -n "$rl" ]; then if [ -n "$want" ]; then printf '%s\n' $rl | grep -qx "$want" || die "No release v$want on GitHub (releases there: $rl)"; echo "release/v$want $want"; return; fi
    local last; last=$(printf '%s\n' $rl | tail -1); echo "release/v$last $last"; return; fi
  for b in $list; do v=$(curl -fsS -m 20 -H "Authorization: Bearer $GH_TOKEN" -H "Accept: application/vnd.github.raw" "https://api.github.com/repos/$REPO/contents/version.json?ref=$b" 2>/dev/null | sed -n 's/.*"v" *: *"\([^"]*\)".*/\1/p' || true)
    [ -n "$v" ] || continue; if [ -n "$want" ]; then [ "$v" = "$want" ] && { echo "$b $v"; return; }; continue; fi
    if python3 -c "import sys;a,b=sys.argv[1:];sys.exit(0 if tuple(map(int,a.split('.')))>tuple(map(int,b.split('.'))) else 1)" "$v" "$bestv"; then best="$b"; bestv="$v"; fi; done
  [ -n "$want" ] && die "No branch on GitHub carries v$want yet."; [ -n "$best" ] || die "No release found on GitHub."; echo "$best $bestv"; }
# the server's code — and, since v1.01, the rules its Ranked verifier replays with (the page + tools/node, bundled by deploy.sh): a release that
# changes the game redeploys the stack so the verifier always holds the build the players run (matches on another build are only skipped)
srv_hash(){ (cd "$1" && cat server/template.yaml server/deploy.sh server/src/*.js server/src/*.json server/verify/*.js tools/node/*.js flavius-arena.html 2>/dev/null | sha256sum | cut -c1-16); }
# room for a release in CloudShell's 1 GB home: old clones/temp dirs, filed zips beyond the newest 3, npm caches
free_space(){ rm -rf "$HOME/.npm/_cacache" "$HOME/.cache/pip" "$HOME/server/node_modules" 2>/dev/null || true
  ls -t "$HOME"/flavius-done/*.zip 2>/dev/null | tail -n +4 | xargs -r rm -f
  local av; av=$(df -Pm "$HOME" | awk 'NR==2{print $4}'); ok "free space in your home: ${av:-?} MB"
  [ "${av:-999}" -ge 250 ] || die "Only ${av} MB free in your home (a release needs ~250 MB). See what is big: du -sh ~/* ~/.[!.]* | sort -h | tail"; }
fsh_ver(){ [ -f "$1" ] || { echo 0; return 0; }; sed -n 's/^FSH_VER=\([0-9]*\).*/\1/p' "$1" | head -1; }
# swap in the release's flavius.sh only when it is newer than this one
fsh_newer(){ local a b; a=$(fsh_ver "$1"); b=$(fsh_ver "$0"); [ "${a:-0}" -gt "${b:-0}" ]; }
cmd_clean(){ rm -rf "$SRC" "$HOME"/.flavius-????; free_space; }
cmd_gitrelease(){ local want="${1:-}"; gh_token
  local br v; if [ -n "${FLAVIUS_SRC_OK:-}" ] && [ -d "$SRC/.git" ]; then br=$(git -C "$SRC" rev-parse --abbrev-ref HEAD); v=$(sed -n 's/.*"v" *: *"\([^"]*\)".*/\1/p' "$SRC/version.json")
  else say "Looking for the release on GitHub"; local pk; pk=$(gh_pick "$want") || exit 1; read -r br v <<< "$pk"; [ -n "$br" ] || die "No release found on GitHub."; ok "v$v on $br"
    say "Fetching v$v (only what a release needs, ~60 MB)"; rm -rf "$SRC" "$HOME"/.flavius-????; free_space
    # CloudShell's home is 1 GB and the repo's tools/plans (screenshots) alone is ~700 MB: a partial, sparse clone takes only the
    # page, version.json, assets/, server/, site/ and tools/ (its files + tools/deploy + tools/node: the verifier's rules bundler) — nothing else is ever downloaded
    local gauth; gauth="Authorization: Basic $(printf 'x-access-token:%s' "$GH_TOKEN" | base64 -w0)"
    git -c http.extraHeader="$gauth" clone -q --depth 1 --filter=blob:none --sparse --branch "$br" "https://github.com/$REPO.git" "$SRC" || die "git clone failed"
    git -C "$SRC" -c http.extraHeader="$gauth" sparse-checkout set assets server site tools/deploy tools/node || die "git sparse checkout failed (disk full? run: bash flavius.sh clean)"
    ok "fetched $(git -C "$SRC" log -1 --format='%h · %cd' --date=format:'%Y-%m-%d %H:%M')"
    # the release carries the newest flavius.sh: when it differs from this one, swap it in and run again (so the steps never change)
    if fsh_newer "$SRC/tools/deploy/flavius.sh"; then cp "$SRC/tools/deploy/flavius.sh" "$0"; ok "flavius.sh updated from the release — continuing with the new one"; FLAVIUS_SRC_OK=1 exec bash "$0" release "$want"; fi; fi
  [ -f "$CONF" ] && . "$CONF"; local sh; sh=$(srv_hash "$SRC"); local live; live=$(curl -s -m 10 "$SITE/play/version.json?x=$RANDOM" | sed -n 's/.*"v" *: *"\([^"]*\)".*/\1/p')
  local dosrv=0; [ "$sh" != "${SERVER_HASH:-}" ] && dosrv=1
  say "Release plan (from GitHub, $br)"; echo "  1 server   : $([ $dosrv = 1 ] && echo "deploy — its code or the game's rules changed since the last server deploy from here (the Ranked verifier replays with this build)" || echo 'unchanged — skipped')"
  echo "  2 game     : v$v   (live now: v${live:-?})"; echo "  3 download : the standalone v$v (built here)"; echo "  4 site     : the pages in site/ (only when they changed)"
  if [ "${DRY:-}" != 1 ]; then read -r -p "Go? [y/N] " ok; case "$ok" in y|Y|yes) ;; *) die "Stopped — nothing changed.";; esac; fi
  if [ $dosrv = 1 ]; then local email="${ALERT_EMAIL:-}"
    if [ -z "$email" ]; then read -r -p "Budget alert e-mail (asked once, kept in ~/.flavius.conf): " email; email=$(printf '%s' "$email" | tr -d '\r\n\t '); conf_set ALERT_EMAIL "$email"; fi
    say "Server (from the release)"; server_dir "$SRC/server" "$email"; [ "${DRY:-}" = 1 ] || conf_set SERVER_HASH "$sh"; cd "$HOME"; say "Server done — now the game, the download and the site"; fi
  local P; P=$(mktemp -d "$HOME/.flavius-XXXX"); mkdir -p "$P/play"; cp "$SRC/flavius-arena.html" "$P/play/index.html"; cp "$SRC/version.json" "$P/play/"
  [ -f "$SRC/tools/deploy/arena_shot.webp" ] && cp "$SRC/tools/deploy/arena_shot.webp" "$P/play/"; cp -r "$SRC/assets" "$P/play/assets"
  say "The standalone download (built here from the release)"; (cd "$SRC" && python3 tools/mkshare.py "$v" | tail -1 && rm -f share/flavius-rule-arena.zip && cd share && zip -q -9 flavius-rule-arena.zip "flavius-rule-arena-v$v.html") || die "building the download failed"
  cp "$SRC/share/flavius-rule-arena.zip" "$P/play/flavius-rule-arena.zip"
  game_dir "$P/play"; rm -rf "$P" "$SRC/share"; site_git "$SRC/site"; cmd_status
  say "Release v$v done: server $([ $dosrv = 1 ] && echo deployed || echo unchanged) · game ✓ · download ✓ · site ✓"; }
# the public site pages from the release's site/ folder (in git since 2026-10-11) — only when they changed since the last site deploy from here
site_hash(){ (cd "$1" && find . -type f -not -name 'README*' -print0 | sort -z | xargs -0 cat | sha256sum | cut -c1-16); }
site_git(){ local d="$1"; [ -f "$d/index.html" ] || return 0; [ -f "$CONF" ] && . "$CONF"; local h; h=$(site_hash "$d")
  [ "$h" = "${SITE_HASH:-}" ] && { ok "site pages unchanged — skipped"; return 0; }
  say "Website pages (from the release; play/ and FlaviusSiteMedia/ are left alone)"
  run aws s3 sync "$d/" "s3://$BUCKET/" --exclude "README*" --exclude "REMOVED.txt" --exclude "play/*" --exclude "FlaviusSiteMedia/*" --cache-control no-cache --only-show-errors
  local f; if [ -f "$d/REMOVED.txt" ]; then while IFS= read -r f; do f="${f#/}"; case "$f" in ""|play/*|FlaviusSiteMedia/*|*..*) continue;; esac
    run aws s3 rm "s3://$BUCKET/$f" --only-show-errors || true; done < "$d/REMOVED.txt"; fi
  ok "site synced"; clear_cdn "/*"; [ "${DRY:-}" = 1 ] || conf_set SITE_HASH "$h"; }

# ---- update: only this script, from the newest work branch (never older than the one running)
cmd_update(){ gh_token; local b d best="" bestd=""
  for b in $(gh_api "branches?per_page=100" | python3 -c "import json,sys;[print(x['name']) for x in json.load(sys.stdin)]"); do case "$b" in release/*) continue;; esac
    d=$(gh_api "commits/$b" | python3 -c "import json,sys;print(json.load(sys.stdin)['commit']['committer']['date'])" 2>/dev/null || true); [ -n "$d" ] || continue
    [[ "$d" > "$bestd" ]] && { best="$b"; bestd="$d"; }; done; [ -n "$best" ] || die "No branch found."
  local t; t=$(mktemp); curl -fsS -m 20 -H "Authorization: Bearer $GH_TOKEN" -H "Accept: application/vnd.github.raw" "https://api.github.com/repos/$REPO/contents/tools/deploy/flavius.sh?ref=$best" -o "$t" || die "download failed"
  # a new file (mv), never written over the running one: bash reads this script while it runs
  if fsh_newer "$t"; then local v; v=$(fsh_ver "$t"); chmod +x "$t"; mv -f "$t" "$0"; ok "flavius.sh updated to version $v (from $best)"; exit 0; else ok "flavius.sh is already the newest (version $(fsh_ver "$0"))"; rm -f "$t"; fi; }

# ---- beta: the work in progress on its OWN address (CloudFront's own domain = another origin → its own saves, never the players')
cmd_beta(){ gh_token; local br="${1:-}"
  if [ -z "$br" ]; then say "Looking for the newest work branch"; local b d best="" bestd=""
    for b in $(gh_api "branches?per_page=100" | python3 -c "import json,sys;[print(x['name']) for x in json.load(sys.stdin)]"); do case "$b" in main|release/*) continue;; esac
      d=$(gh_api "commits/$b" | python3 -c "import json,sys;print(json.load(sys.stdin)['commit']['committer']['date'])" 2>/dev/null || true); [ -n "$d" ] || continue
      [[ "$d" > "$bestd" ]] && { best="$b"; bestd="$d"; }; done; br="$best"; [ -n "$br" ] || die "No work branch found."; fi
  ok "beta from $br"; rm -rf "$SRC" "$HOME"/.flavius-????; free_space
  local gauth; gauth="Authorization: Basic $(printf 'x-access-token:%s' "$GH_TOKEN" | base64 -w0)"
  git -c http.extraHeader="$gauth" clone -q --depth 1 --filter=blob:none --sparse --branch "$br" "https://github.com/$REPO.git" "$SRC" || die "git clone failed"
  git -C "$SRC" -c http.extraHeader="$gauth" sparse-checkout set assets tools/deploy || die "git sparse checkout failed (disk full? run: bash flavius.sh clean)"
  ok "fetched $(git -C "$SRC" log -1 --format='%h · %cd' --date=format:'%Y-%m-%d %H:%M')"
  if [ -z "${FLAVIUS_BETA_OK:-}" ] && fsh_newer "$SRC/tools/deploy/flavius.sh"; then cp "$SRC/tools/deploy/flavius.sh" "$0"; ok "flavius.sh updated — continuing with the new one"; FLAVIUS_BETA_OK=1 exec bash "$0" beta "$br"; fi
  say "Beta: page + assets → play-beta/ (the live game, the server and the site are not touched)"
  run aws s3 sync "$SRC/assets" "s3://$BUCKET/play-beta/assets/" --only-show-errors
  put "$SRC/flavius-arena.html" "play-beta/index.html"; put "$SRC/version.json" "play-beta/version.json"
  run aws s3 cp "s3://$BUCKET/play/online.json" "s3://$BUCKET/play-beta/online.json" --cache-control no-cache --only-show-errors || true
  clear_cdn "/play-beta/*"; rm -rf "$SRC"
  local dom; dom=$(aws cloudfront get-distribution --id "$DIST" --query Distribution.DomainName --output text 2>/dev/null || echo "?")
  say "Beta ready:  https://$dom/play-beta/index.html"
  local code; code=$(curl -s -L -m 20 -o /dev/null -w '%{http_code}' "https://$dom/play-beta/index.html?x=$RANDOM" || true)
  [ "$code" = 200 ] && ok "it answers (200)" || printf '\033[1;31m✗ the beta address answers %s — send Claude this line\033[0m\n' "$code"
  echo "  · its own saves (a different address): to try your careers there, Saves → Backups → Export on the live game, Import on the beta"
  echo "  · Online sign-in only works on flaviusrule.com — test online on the live game"
  echo "  · when it is good, tell Claude: the release branch is made, then  bash flavius.sh release"; }

# one command per release: the newest server zip, game zip, site zip and privacy.html found here, in the safe order
cmd_release(){ local here; here=$(pwd)
  local srv gam dl sit pri; srv=$(ls -t "$here"/flavius-server-*.zip 2>/dev/null | head -1 || true); gam=$(ls -t "$here"/flavius-site-update-*.zip 2>/dev/null | head -1 || true)
  dl=$(ls -t "$here"/flavius-download-*.zip 2>/dev/null | head -1 || true)
  # the game zip carries the newest flavius.sh: when it differs from this one, swap it in and run again (so the steps never change)
  if [ -n "$gam" ] && [ -z "${FLAVIUS_UPDATED:-}" ] && unzip -l "$gam" flavius.sh >/dev/null 2>&1; then
    local t; t=$(mktemp); unzip -p "$gam" flavius.sh > "$t"
    if fsh_newer "$t"; then cp "$t" "$0"; rm -f "$t"; ok "flavius.sh updated from the game zip — continuing with the new one"; FLAVIUS_UPDATED=1 exec bash "$0" release; fi; rm -f "$t"; fi
  sit=$(ls -t "$here"/flavius-site-v*.zip 2>/dev/null | head -1 || true)
  pri=""; [ -f "$here/privacy.html" ] && pri="$here/privacy.html"
  # no zips here = a GitHub release; a privacy.html lying here never blocks it (it goes up after, then is filed away)
  if [ -z "$srv$gam$sit" ]; then cmd_gitrelease "${1:-}"; if [ -n "$pri" ] && [ "${DRY:-}" != 1 ]; then cd "$here"; cmd_page "$pri"; mkdir -p "$HOME/flavius-done"; mv -f "$pri" "$HOME/flavius-done/"; fi; return; fi
  say "Release plan"; echo "  1 server   : ${srv:-(none uploaded — skipped)}"; echo "  2 game     : ${gam:-(none uploaded — skipped)}"; echo "  3 download : ${dl:-$( [ -n "$gam" ] && unzip -l "$gam" tools/mkshare.py >/dev/null 2>&1 && echo "built here from the game zip" || echo "(none uploaded — skipped)")}"; echo "  4 site     : ${sit:-(none uploaded — skipped)}"; echo "  5 page     : ${pri:-(none uploaded — skipped)}"
  if [ "${DRY:-}" != 1 ]; then read -r -p "Go? [y/N] " ok; case "$ok" in y|Y|yes) ;; *) die "Stopped — nothing changed.";; esac; fi
  [ -n "$srv" ] && { cmd_server "$srv"; cd "$here"; }
  [ -n "$gam" ] && { cmd_game "$gam"; cd "$here"; }
  if [ -n "$dl" ]; then cmd_download "$dl"; cd "$here"; elif [ -n "$gam" ] && unzip -l "$gam" tools/mkshare.py >/dev/null 2>&1; then dl_from_game "$gam"; cd "$here"; fi
  [ -n "$sit" ] && { cmd_site "$sit"; cd "$here"; }
  [ -n "$pri" ] && { cmd_page "$pri"; cd "$here"; }
  # file the zips that went out, so the next release only sees new ones (kept in ~/flavius-done, the last 3 releases)
  if [ "${DRY:-}" != 1 ]; then mkdir -p "$HOME/flavius-done"; for f in $srv $gam $dl $sit $pri; do [ -n "$f" ] && mv -f "$f" "$HOME/flavius-done/"; done
    ls -t "$HOME"/flavius-done/*.zip 2>/dev/null | tail -n +13 | xargs -r rm -f; fi
  cmd_status; }

CMD="${1:-}"; shift || true
case "$CMD" in
  release) cmd_release "$@";; game) cmd_game "$@";; download) cmd_download "$@";; site) cmd_site "$@";; page) cmd_page "$@";; online) cmd_online "$@";; login) cmd_login;; server) cmd_server "$@";; status) cmd_status;; quota) lambda_quota;; beta) cmd_beta "$@";; update) cmd_update;; betaurl) printf 'https://%s/play-beta/index.html\n' "$(aws cloudfront get-distribution --id "$DIST" --query Distribution.DomainName --output text)";; clean) cmd_clean;;
  *) sed -n '2,/^set -e/p' "$0" | grep '^#' | sed 's/^# \{0,1\}//';;
esac
