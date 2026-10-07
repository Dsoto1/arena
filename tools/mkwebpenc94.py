#!/usr/bin/env python3
"""Repackage the @jsquash/webp encoder (ES module + .wasm) as assets/webpenc94.js, a plain script for 226-v94onltok.
Usage: npm pack @jsquash/webp && tar xzf jsquash-webp-*.tgz && python3 tools/mkwebpenc94.py package"""
import sys,base64,json
P=sys.argv[1]
js=open(P+'/codec/enc/webp_enc.js').read()
ver=json.load(open(P+'/package.json'))['version']
for old,new in [('if(import.meta.url===undefined){import.meta.url="https://localhost"}',''),
                ('import.meta.url','((typeof document!="undefined"&&document.currentScript&&document.currentScript.src)||location.href)'),
                ('export default Module;','window.WEBPENC94=Module;')]:
    assert old in js,old
    js=js.replace(old,new)
assert 'import.meta' not in js and 'export ' not in js.split('\n')[-2]
wasm=base64.b64encode(open(P+'/codec/enc/webp_enc.wasm','rb').read()).decode()
head=f"""/* webpenc94.js — WebP encoder for browsers whose canvas cannot make WebP (Safari), loaded on demand by 226-v94onltok.
   libwebp (Google, BSD licence) compiled to WebAssembly by the Squoosh / jSquash project (@jsquash/webp {ver}, Apache-2.0,
   https://github.com/jamsinclair/jSquash). Built by tools/mkwebpenc94.py: the module glue sets window.WEBPENC94 and the
   wasm binary is inlined as base64 (window.WEBPENC94_WASM) so it loads from file:// and data: URLs too. Do not edit. */
"""
open('assets/webpenc94.js','w').write(head+js+'\nwindow.WEBPENC94_WASM="'+wasm+'";\n')
print('assets/webpenc94.js', len(head+js)+len(wasm))
