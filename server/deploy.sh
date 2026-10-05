#!/bin/sh
# Deploys (or updates) the Online Arena from AWS CloudShell. Run inside the server/ folder:
#   sh deploy.sh you@example.com                      first time, without Google (DevNames off: nobody can sign in yet)
#   GOOGLE_ID=xxx GOOGLE_SECRET=yyy sh deploy.sh you@example.com     with Google sign-in
# Optional: TESTERS='a@gmail.com,b@gmail.com' (online testers, see README), STACK (default flavius-arena), REGION (default us-east-1), BUDGET (default 10), AUTH_PREFIX, DEV=true (test stack only)
set -e
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
ACCT=$(aws sts get-caller-identity --query Account --output text)
BUCKET="flavius-arena-code-$ACCT-$REGION"
# a first deploy that failed leaves the stack in ROLLBACK_COMPLETE, which cannot be updated: clear it first
ST=$(aws cloudformation describe-stacks --region "$REGION" --stack-name "$STACK" --query "Stacks[0].StackStatus" --output text 2>/dev/null || true)
if [ "$ST" = "ROLLBACK_COMPLETE" ]; then echo "Clearing the failed first attempt…"; aws cloudformation delete-stack --region "$REGION" --stack-name "$STACK"; aws cloudformation wait stack-delete-complete --region "$REGION" --stack-name "$STACK"; ST=""; fi
aws s3api head-bucket --bucket "$BUCKET" 2>/dev/null || aws s3 mb "s3://$BUCKET" --region "$REGION"
aws cloudformation package --region "$REGION" --template-file template.yaml --s3-bucket "$BUCKET" --output-template-file packaged.yaml
# the Google secret: only sent when given; otherwise an existing stack keeps the one it already holds (CloudFormation keeps a
# parameter that is not overridden), so updates need no secret. A first deploy (no stack yet) still needs it.
GSEC=""; if [ -n "$GOOGLE_SECRET" ]; then GSEC="GoogleClientSecret=$GOOGLE_SECRET"; elif [ -z "$ST" ] || [ "$ST" = "None" ]; then GSEC="GoogleClientSecret=none"; fi
aws cloudformation deploy --region "$REGION" --template-file packaged.yaml --stack-name "$STACK" --capabilities CAPABILITY_IAM \
  --parameter-overrides AlertEmail="$EMAIL" MonthlyBudgetUSD="${BUDGET:-10}" GoogleClientId="${GOOGLE_ID:-none}" $GSEC \
    AuthDomainPrefix="${AUTH_PREFIX:-flaviusrule-arena}" DevNames="${DEV:-false}" CustomAuthDomain="$AUTH_DOMAIN" HostedZoneId="$ZONE" CustomAuthStage="$AUTH_STAGE" $TP
aws cloudformation describe-stacks --region "$REGION" --stack-name "$STACK" --query "Stacks[0].Outputs" --output table
if [ "$AUTH_DOMAIN" != none ] && [ "$AUTH_STAGE" = cert ]; then echo "Certificate for $AUTH_DOMAIN is made. In 15 minutes, run the same deploy again with AUTH_STAGE=live to add the sign-in address."; fi
