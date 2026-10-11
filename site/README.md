# flaviusrule.com — the public site pages

Everything here is uploaded by `bash flavius.sh release` (tools/deploy/flavius.sh, cmd_gitrelease) when its contents changed
since the last site deploy (SITE_HASH in ~/.flavius.conf). `play/` (the game) and `FlaviusSiteMedia/` live only on S3 and are never touched.
`REMOVED.txt` lists pages to delete from the bucket (one path per line). No AWS policy files or secrets belong in this folder.
