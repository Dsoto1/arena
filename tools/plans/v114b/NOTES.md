# v1.14b — Flavius's cost tag = AppName=FlaviusRule

His note (2026-10-29, Control Center Cost Control screenshot: Flavius Rule $0.00 under AppName=FlaviusRule, everything "Shared / Unallocated"):
"have the stack use tags for flavius … we will now use AppName: FlaviusRule".

His answers:
1. a) REPLACE app=flavius with AppName=FlaviusRule everywhere (stack resources, site bucket + CloudFront, budget filter, status, manifest);
   the old key removed. (Replaces v1.14 7a's tag.)
2. a) Ship now as v1.14b: template + flavius.sh FSH_VER 18 + docs; no beta (no game change); `bash flavius.sh release`, then `bash flavius.sh budget`.
