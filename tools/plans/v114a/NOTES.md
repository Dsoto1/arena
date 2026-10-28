# v1.14a — no AWS identifiers in the public repo (his note from the dashboard session, 2026-10-28; a FIX, deploy tooling only)
Answers 2026-10-28 (his "ill take ur recs"; v1.14 deploy went through):
- (1a) flavius.sh looks the IDs up at run time, nothing asked: DIST = the CloudFront distribution whose alias is flaviusrule.com; POOL = the
  stack's UserPoolId output; GOOGLE_ID = the stack's current GoogleClientId parameter (so a deploy can never change it — ToshiroPlay's
  Cognito stays untouched). REPLACES the hardcoded DIST/POOL/GOOGLE_ID (flavius.sh since the server was built). FSH_VER 14.
- (2a) docs/modules.md + docs/decisions.md: the values replaced by where to find them.
- (3a) release.sh hygiene: every tracked text file; fails on ARNs with a 12-digit account, Cognito pool ids, Google OAuth client ids,
  CloudFront distribution ids (generic ARNs like arn:aws:iam::aws:policy/… pass).
- (4a) its own release v1.14a, no beta (no game change besides the badge + milestone).
- Git history is NOT rewritten (his note 2): the old values stay in history; they are identifiers, not credentials.

## Second note from the dashboard session (2026-10-28; fixes) — answers 1a 2a 3a 4a
- (1a) the budget saw $0: no cost allocation tag was active yet (billing lists a key only hours after tagging). He activates `app`, `AppName`,
  `Project` today. `status` already reports "budget counts" (Active or not). A check-in in this session tomorrow 12:45 ET asks him for the lines.
- (2a) a READ-ONLY `bash flavius.sh audit`: both `flavius-arena-Table-…` tables (created, items, size, tags, which one the stack owns) and the
  FR-Site resources (rule onceWeek state + last runs, SNS FR-Updates subscribers, the CodeConnections' status, FR-Git-role last used). Nothing
  deleted; he pastes the output, the lead advises, he decides. (Nothing in this repo creates FR-Site.)
- (3a) the switch's log group in the template: `/aws/lambda/flavius-arena-switch`, 7 days, tagged; the existing never-expiring group (made by
  Lambda) is deleted by the server deploy just before the stack recreates it (only while the stack does not own it yet).
- (4a) ships in v1.14a (not released yet).
