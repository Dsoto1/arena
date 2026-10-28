#!/bin/sh
# Deploys (or updates) the Online Arena from AWS CloudShell. Run inside the server/ folder:
#   sh deploy.sh you@example.com                      first time, without Google (DevNames off: nobody can sign in yet)
#   GOOGLE_ID=xxx GOOGLE_SECRET=yyy sh deploy.sh you@example.com     with Google sign-in
# Optional: TESTERS='a@gmail.com,b@gmail.com' (online testers, see README), VERIFY_MODE=enforce|log|off (the Ranked check, docs/backend.md; left out = the stack keeps its setting — a new stack, and every stack's first v1.12 deploy, starts at enforce), STACK (default flavius-arena), REGION (default us-east-1), BUDGET (default 10), AUTH_PREFIX, DEV=true (test stack only)
set -e
export AWS_PAGER=""
# pasted values can carry invisible characters (a carriage return, a tab, a space): strip them all
clean(){ printf '%s' "$1" | tr -d '\r\n\t '; }
EMAIL=$(clean "$1"); [ -n "$EMAIL" ] || { echo "usage: sh deploy.sh you@example.com"; exit 1; }
[ -n "$GOOGLE_ID" ] && GOOGLE_ID=$(clean "$GOOGLE_ID"); [ -n "$GOOGLE_SECRET" ] && GOOGLE_SECRET=$(clean "$GOOGLE_SECRET")
echo "Alert e-mail: [$EMAIL]   Google client: [${GOOGLE_ID:-none}]"
case "$EMAIL" in *" "*|*googleusercontent*|*@*@*) echo "That e-mail looks mixed up: [$EMAIL]"; exit 1;; *@*.*) ;; *) echo "That is not an e-mail address: [$EMAIL]"; exit 1;; esac
# a Google client ID is digits-letters.apps.googleusercontent.com and nothing else (a pasted command once ended up in front of it)
if [ -n "$GOOGLE_ID" ] && ! printf '%s' "$GOOGLE_ID" | grep -Eq '^[0-9]+-[a-z0-9]+\.apps\.googleusercontent\.com$'; then echo "That is not a Google client ID: [$GOOGLE_ID]"; echo "Copy it with the copy button on Google Cloud → Credentials and try again."; exit 1; fi
if [ -n "$GOOGLE_SECRET" ] && ! printf '%s' "$GOOGLE_SECRET" | grep -Eq '^GOCSPX-[A-Za-z0-9_-]+$'; then echo "That does not look like a Google client secret (it starts with GOCSPX-). Try again."; exit 1; fi
STACK="${STACK:-flavius-arena}"; REGION="${REGION:-us-east-1}"
# the own sign-in address (e.g. AUTH_DOMAIN=login.flaviusrule.com) when the site's domain lives in Route 53; off unless asked for.
# It takes TWO deploys: AUTH_STAGE=cert (the default) makes and validates the certificate; 15+ minutes later AUTH_STAGE=live adds
# the sign-in domain and its DNS record (CloudFront cannot see a certificate issued seconds before).
AUTH_DOMAIN="${AUTH_DOMAIN:-none}"; AUTH_STAGE="${AUTH_STAGE:-cert}"; ZONE=none
case "$AUTH_STAGE" in cert|live) ;; *) echo "AUTH_STAGE is cert or live."; exit 1;; esac
if [ "$AUTH_DOMAIN" != none ]; then PARENT="${AUTH_DOMAIN#*.}"; ZONE=$(aws route53 list-hosted-zones-by-name --dns-name "$PARENT" --query "HostedZones[?Name=='$PARENT.'].Id | [0]" --output text 2>/dev/null | sed 's#/hostedzone/##'); case "$ZONE" in Z*) echo "Sign-in address: https://$AUTH_DOMAIN (Route 53 zone $ZONE)";; *) echo "No Route 53 zone for $PARENT — keeping the amazoncognito.com sign-in address."; AUTH_DOMAIN=none; ZONE=none;; esac; fi
# online testers: TESTERS='a@gmail.com,b@gmail.com' sets the list, TESTERS=none clears it; left out, the stack keeps the list it has
TP=""; if [ -n "${TESTERS+x}" ]; then TP="Testers=$(printf '%s' "$TESTERS" | tr -d '\r\n\t ')"; fi
# the Ranked check (v1.01 verifier, v1.12 enforce): VERIFY_MODE=log settles by agreement again at once (the rollback; the replay only logs), off stops
# the replays too, enforce turns the check back on; left out, the stack keeps its mode (stack parameter RankedCheck since v1.12, default enforce)
VP=""; if [ -n "${VERIFY_MODE:-}" ]; then case "$VERIFY_MODE" in log|off|enforce) VP="RankedCheck=$VERIFY_MODE";; *) echo "VERIFY_MODE is enforce, log or off."; exit 1;; esac; fi
# v1.12 (R5a): at most 3 replays at once — reserved concurrency 3 for the verifier, only when the account's Lambda limit leaves AWS its minimum of
# 100 unreserved (a new account has 10 in all: then none, with a note; flavius.sh asks AWS for a raise). Closed by the budget switch (0): left alone.
VR=""; VCC=$(aws lambda get-function-concurrency --region "$REGION" --function-name flavius-arena-verify --query ReservedConcurrentExecutions --output text 2>/dev/null || echo None)
if [ "$VCC" = "0" ]; then echo "The verifier is closed by the budget switch: its reserved concurrency stays as it is."
else UNRES=$(aws lambda get-account-settings --region "$REGION" --query AccountLimit.UnreservedConcurrentExecutions --output text 2>/dev/null || echo 0)
  case "$UNRES" in ''|*[!0-9]*) UNRES=0;; esac; HAVE=0; [ "$VCC" = "3" ] && HAVE=3
  if [ $((UNRES + HAVE - 3)) -ge 100 ]; then VR="VerifyReserve=3"; echo "Ranked check: at most 3 replays at once (reserved concurrency 3)."
  else VR="VerifyReserve=0"; echo "Note: this account's Lambda limit leaves $UNRES unreserved (AWS keeps 100) — the verifier runs without its own 3 for now (it still works; flavius.sh has asked AWS for a higher limit)."; fi; fi
ACCT=$(aws sts get-caller-identity --query Account --output text)
BUCKET="flavius-arena-code-$ACCT-$REGION"
# a first deploy that failed leaves the stack in ROLLBACK_COMPLETE, which cannot be updated: clear it first
ST=$(aws cloudformation describe-stacks --region "$REGION" --stack-name "$STACK" --query "Stacks[0].StackStatus" --output text 2>/dev/null || true)
# v1.14 fix: a deploy still running → wait; an update whose ROLLBACK failed (UPDATE_ROLLBACK_FAILED, e.g. a resource that reads something deleted
# by hand) cannot be updated → finish the rollback, skipping the resources that failed, then deploy
stwait(){ while :; do ST=$(aws cloudformation describe-stacks --region "$REGION" --stack-name "$STACK" --query "Stacks[0].StackStatus" --output text 2>/dev/null || true)
  case "$ST" in *_IN_PROGRESS) echo "The stack is busy ($ST) — waiting…"; sleep 20;; *) return 0;; esac; done; }
stwait
if [ "$ST" = "UPDATE_ROLLBACK_FAILED" ]; then
  SKIP=$(aws cloudformation describe-stack-resources --region "$REGION" --stack-name "$STACK" --query "StackResources[?ResourceStatus=='UPDATE_FAILED'].LogicalResourceId" --output text)
  echo "The last update could not be undone (UPDATE_ROLLBACK_FAILED). Finishing the rollback, skipping: ${SKIP:-nothing}"
  if [ -n "$SKIP" ] && [ "$SKIP" != None ]; then aws cloudformation continue-update-rollback --region "$REGION" --stack-name "$STACK" --resources-to-skip $SKIP
  else aws cloudformation continue-update-rollback --region "$REGION" --stack-name "$STACK"; fi
  stwait; echo "Stack now: $ST"; [ "$ST" = "UPDATE_ROLLBACK_COMPLETE" ] || { echo "The rollback did not finish ($ST). Send Claude this line."; exit 1; }
fi
if [ "$ST" = "ROLLBACK_COMPLETE" ]; then echo "Clearing the failed first attempt…"; aws cloudformation delete-stack --region "$REGION" --stack-name "$STACK"; aws cloudformation wait stack-delete-complete --region "$REGION" --stack-name "$STACK"; ST=""; fi
aws s3api head-bucket --bucket "$BUCKET" 2>/dev/null || aws s3 mb "s3://$BUCKET" --region "$REGION"
# v1.01 wave 2: the Ranked verifier's package (Code ./verify): the rules of THIS build (tools/node/mkbundle.js → verify/rules.js, ~9 MB, needs node)
# + the store / shared rules it reads. From a GitHub release (flavius.sh) the page and tools/node sit beside server/; a server-only zip has
# neither → the verifier deploys without rules and skips every match ('nobundle') until a release brings them.
if [ -f ../flavius-arena.html ] && [ -f ../tools/node/mkbundle.js ] && command -v node >/dev/null 2>&1; then node ../tools/node/mkbundle.js ../flavius-arena.html --out verify || { echo "Building the verifier's rules failed."; exit 1; }
else echo "No page / tools/node here (or no node): the Ranked verifier deploys without rules (it skips every match until a release brings them)."; rm -f verify/rules.js verify/rules.json; fi
cp src/store.js src/onlcore.js verify/
aws cloudformation package --region "$REGION" --template-file template.yaml --s3-bucket "$BUCKET" --output-template-file packaged.yaml
# the Google secret: only sent when given; otherwise an existing stack keeps the one it already holds (CloudFormation keeps a
# parameter that is not overridden), so updates need no secret. A first deploy (no stack yet) still needs it.
GSEC=""; if [ -n "$GOOGLE_SECRET" ]; then GSEC="GoogleClientSecret=$GOOGLE_SECRET"; elif [ -z "$ST" ] || [ "$ST" = "None" ]; then GSEC="GoogleClientSecret=none"; fi
aws cloudformation deploy --region "$REGION" --template-file packaged.yaml --stack-name "$STACK" --capabilities CAPABILITY_IAM --no-fail-on-empty-changeset \
  --parameter-overrides AlertEmail="$EMAIL" MonthlyBudgetUSD="${BUDGET:-10}" GoogleClientId="${GOOGLE_ID:-none}" $GSEC \
    AuthDomainPrefix="${AUTH_PREFIX:-flaviusrule-arena}" DevNames="${DEV:-false}" CustomAuthDomain="$AUTH_DOMAIN" HostedZoneId="$ZONE" CustomAuthStage="$AUTH_STAGE" $TP $VP $VR
aws cloudformation describe-stacks --region "$REGION" --stack-name "$STACK" --query "Stacks[0].Outputs" --output table
if [ "$AUTH_DOMAIN" != none ] && [ "$AUTH_STAGE" = cert ]; then echo "Certificate for $AUTH_DOMAIN is made. In 15 minutes, run the same deploy again with AUTH_STAGE=live to add the sign-in address."; fi
