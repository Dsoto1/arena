#!/bin/sh
# Deploys (or updates) the Online Arena from AWS CloudShell. Run inside the server/ folder:
#   sh deploy.sh you@example.com                      first time, without Google (DevNames off: nobody can sign in yet)
#   GOOGLE_ID=xxx GOOGLE_SECRET=yyy sh deploy.sh you@example.com     with Google sign-in
# Optional: STACK (default flavius-arena), REGION (default us-east-1), BUDGET (default 10), AUTH_PREFIX, DEV=true (test stack only)
set -e
EMAIL="$1"; [ -n "$EMAIL" ] || { echo "usage: sh deploy.sh you@example.com"; exit 1; }
STACK="${STACK:-flavius-arena}"; REGION="${REGION:-us-east-1}"
ACCT=$(aws sts get-caller-identity --query Account --output text)
BUCKET="flavius-arena-code-$ACCT-$REGION"
# a first deploy that failed leaves the stack in ROLLBACK_COMPLETE, which cannot be updated: clear it first
ST=$(aws cloudformation describe-stacks --region "$REGION" --stack-name "$STACK" --query "Stacks[0].StackStatus" --output text 2>/dev/null || true)
if [ "$ST" = "ROLLBACK_COMPLETE" ]; then echo "Clearing the failed first attempt…"; aws cloudformation delete-stack --region "$REGION" --stack-name "$STACK"; aws cloudformation wait stack-delete-complete --region "$REGION" --stack-name "$STACK"; fi
aws s3api head-bucket --bucket "$BUCKET" 2>/dev/null || aws s3 mb "s3://$BUCKET" --region "$REGION"
aws cloudformation package --region "$REGION" --template-file template.yaml --s3-bucket "$BUCKET" --output-template-file packaged.yaml
aws cloudformation deploy --region "$REGION" --template-file packaged.yaml --stack-name "$STACK" --capabilities CAPABILITY_IAM \
  --parameter-overrides AlertEmail="$EMAIL" MonthlyBudgetUSD="${BUDGET:-10}" GoogleClientId="${GOOGLE_ID:-none}" GoogleClientSecret="${GOOGLE_SECRET:-none}" \
    AuthDomainPrefix="${AUTH_PREFIX:-flaviusrule-arena}" DevNames="${DEV:-false}"
aws cloudformation describe-stacks --region "$REGION" --stack-name "$STACK" --query "Stacks[0].Outputs" --output table
