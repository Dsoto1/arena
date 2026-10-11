#!/usr/bin/env python3
"""perf100 audit: an INSTRUMENTED copy of the built page (same build order as build.sh) with performance.mark('M>file')
before each src file, so boot.js can time every module's top-level (load-time) work. Writes <root>/.perf100-boot.html
(beside assets/ so art loads; delete it after). Run from anywhere: python3 tools/plans/perf100/mkboot.py"""
import os, re
R = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
b = open(os.path.join(R, 'build.sh')).read()
files = re.findall(r'(src/[^\s;]+\.js)', b.split('\n')[2])
out = [open(os.path.join(R, 'src/01-head.html')).read(), '<script>\n']
for f in files:
    out.append('\n;performance.mark("M>%s");\n' % f[4:])
    out.append(open(os.path.join(R, f)).read())
out.append('\n;performance.mark("M>END");\n</script>\n')
open(os.path.join(R, '.perf100-boot.html'), 'w').write(''.join(out))
print(len(files), 'modules')
