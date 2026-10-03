#!/bin/bash
# flavius.sh — one helper for every Flavius Rule deployment, run in AWS CloudShell (us-east-1).
#
#   bash flavius.sh game   flavius-site-update-v0.80.zip   the game: play/assets (if any) → play/index.html → play/version.json
#   bash flavius.sh site   flavius-site-v0.78.zip          the whole website (never touches play/ or FlaviusSiteMedia/)
#   bash flavius.sh page   privacy.html                    one file at the site root (or: page file.css some/folder/file.css)
#   bash flavius.sh server flavius-server-8.zip            the online server (asks for the Google client secret, hidden)
#   bash flavius.sh online online.json                     play/online.json (the game's server settings)
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
  put "$p/version.json" "play/version.json"
  [ -f "$p/online.json" ] && printf '   (play/online.json in the zip was NOT uploaded — use: bash flavius.sh online …)\n'
  clear_cdn "/play/" "/play/index.html" "/play/version.json"
  [ "${DRY:-}" = 1 ] || { local live; live=$(curl -s "$SITE/play/version.json?x=$RANDOM" | sed -n 's/.*"v" *: *"\([^"]*\)".*/\1/p'); [ "$live" = "$v" ] && ok "live: v$live" || printf '   live version reads "%s" — give it a minute and run: bash flavius.sh status\n' "$live"; }
  rm -rf "$d"; }

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
  [ "${DRY:-}" = 1 ] || cd "$HOME/server"; AUTH_DOMAIN="${AUTH_DOMAIN:-none}" GOOGLE_ID="$GOOGLE_ID" GOOGLE_SECRET="$sec" run sh deploy.sh "$email"
  unset sec; [ "${DRY:-}" = 1 ] || cmd_status; }

cmd_status(){ say "What is live"
  printf '  game version   : %s\n' "$(curl -s "$SITE/play/version.json?x=$RANDOM" | tr -d '\n')"
  printf '  online.json    : %s\n' "$(curl -s "$SITE/play/online.json?x=$RANDOM" | tr -d '\n' | cut -c1-140)"
  printf '  server stack   : %s\n' "$(aws cloudformation describe-stacks --stack-name "$STACK" --query 'Stacks[0].StackStatus' --output text 2>/dev/null || echo '?')"
  local fn; fn=$(aws cloudformation describe-stack-resources --stack-name "$STACK" --logical-resource-id Fn --query 'StackResources[0].PhysicalResourceId' --output text 2>/dev/null || true)
  [ -n "$fn" ] && printf '  server updated : %s\n' "$(aws lambda get-function --function-name "$fn" --query Configuration.LastModified --output text 2>/dev/null)"
  local cid; cid=$(aws cognito-idp describe-identity-provider --user-pool-id "$POOL" --provider-name Google --query IdentityProvider.ProviderDetails.client_id --output text 2>/dev/null || echo '?')
  [ "$cid" = "$GOOGLE_ID" ] && printf '  google client  : ✓ correct\n' || printf '  google client  : ✗ "%s"\n' "$cid"
  printf '  sign-in domain : %s\n' "$(aws cognito-idp describe-user-pool --user-pool-id "$POOL" --query 'UserPool.[Domain,CustomDomain]' --output text 2>/dev/null)"
  printf '  styles.css     : %s bytes on the site\n' "$(curl -s "$SITE/styles.css?x=$RANDOM" | wc -c | tr -d ' ')"; }

CMD="${1:-}"; shift || true
case "$CMD" in
  game) cmd_game "$@";; site) cmd_site "$@";; page) cmd_page "$@";; online) cmd_online "$@";; server) cmd_server "$@";; status) cmd_status;;
  *) sed -n '2,15p' "$0" | sed 's/^# \{0,1\}//';;
esac
