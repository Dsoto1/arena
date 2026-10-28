
- **v1.14a** Behind the scenes (tools/plans/v114a/NOTES.md, two dashboard-session notes, his recs; no beta; deploy tooling + stack only):
  flavius.sh looks up the CloudFront distribution (alias flaviusrule.com), the Cognito pool (stack output UserPoolId) and the Google client
  (stack parameter GoogleClientId; a deploy refuses to run without it) at run time — no AWS ids in the public repo; tools/idscan.js in
  release.sh fails on account ARNs / pool / OAuth client / CloudFront ids in any tracked file (docs scrubbed, history kept); `bash flavius.sh
  audit` (read-only: the two flavius-arena-Table-* tables, the FR-Site resources); template SwitchLogs (the switch's logs 7 days, the old
  never-expiring group handed over by the deploy). FSH_VER 15. Full run green (eef8d64) + a smart run for the audit/log commit.
