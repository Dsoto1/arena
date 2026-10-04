"""mid2json — a tiny standard-MIDI reader: tracks → {name, ch, notes:[[beat, midi, beats, vel],…]} + tempo, meter, markers.
   Usage: python3 mid2json.py in.mid out.json"""
import sys,json,struct
def vlq(b,i):
    v=0
    while True:
        c=b[i];i+=1;v=(v<<7)|(c&0x7f)
        if c<0x80:return v,i
d=open(sys.argv[1],'rb').read()
assert d[:4]==b'MThd';fmt,ntr,div=struct.unpack('>HHH',d[8:14]);i=14
out={'div':div,'tempo':[],'meter':None,'markers':[],'tracks':[]}
for t in range(ntr):
    assert d[i:i+4]==b'MTrk',d[i:i+4];ln=struct.unpack('>I',d[i+4:i+8])[0];j=i+8;end=j+ln;i=end
    tick=0;run=None;name='';on={};notes=[];chs=set()
    while j<end:
        dt,j=vlq(d,j);tick+=dt;st=d[j]
        if st==0xff:
            typ=d[j+1];ln2,k=vlq(d,j+2);data=d[k:k+ln2];j=k+ln2
            if typ==3:name=data.decode('latin1')
            elif typ==0x51:out['tempo'].append([tick/div,60e6/int.from_bytes(data,'big')])
            elif typ==0x58:out['meter']=[data[0],2**data[1]]
            elif typ==6:out['markers'].append([tick/div,data.decode('latin1')])
            continue
        if st in (0xf0,0xf7):ln2,k=vlq(d,j+1);j=k+ln2;continue
        if st&0x80:run=st;j+=1
        typ=run&0xf0;ch=run&0x0f
        if typ in (0x80,0x90,0xa0,0xb0,0xe0):a,b=d[j],d[j+1];j+=2
        else:a=d[j];b=0;j+=1
        if typ==0x90 and b>0:on.setdefault((ch,a),[]).append((tick,b));chs.add(ch)
        elif typ==0x80 or (typ==0x90 and b==0):
            s=on.get((ch,a))
            if s:t0,v=s.pop(0);notes.append([round(t0/div,4),a,round((tick-t0)/div,4),v])
    if notes:out['tracks'].append({'name':name,'ch':sorted(chs)[0] if chs else 0,'notes':sorted(notes)})
json.dump(out,open(sys.argv[2],'w'),separators=(',',':'))
print('tempo',out['tempo'],'meter',out['meter'],'markers',out['markers'])
for tr in out['tracks']:
    ns=tr['notes'];print(tr['name'],'ch',tr['ch'],len(ns),'notes, end beat',max(n[0]+n[2] for n in ns),'range',min(n[1] for n in ns),max(n[1] for n in ns))
