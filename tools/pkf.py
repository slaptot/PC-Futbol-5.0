import struct,sys,os
KEY=[(i*i-34*i)&0xff for i in range(26)]
def decname(n):
    out=''
    for i in range(1,len(n)):
        c=n[i]^KEY[i]
        if c==0: break
        out+=chr(c)
    return out
def parse(path):
    d=open(path,'rb').read()
    p=0; dirs={}
    while d[p]==1:
        name=decname(d[p:p+21]); did,parent=struct.unpack('<II',d[p+21:p+29]); dirs[did]=(name,parent); p+=29
    while d[p]==0: p+=1
    assert d[p]==4
    off=struct.unpack('<I',d[p+1:p+5])[0]
    while d[off]==4: off=struct.unpack('<I',d[off+1:off+5])[0]
    ents=[]
    while True:
        n=0
        while n<32 and off+38<=len(d) and d[off]==2:
            name=decname(d[off:off+26]); o,s,f=struct.unpack('<III',d[off+26:off+38])
            ents.append((name,o,s,f)); off+=38; n+=1
        if n<32 or off+5>len(d) or d[off]!=4: break
        nxt=struct.unpack('<I',d[off+1:off+5])[0]
        if nxt==0 or nxt>=len(d) or d[nxt]!=2: break
        off=nxt
    return d,dirs,ents
def dirpath(dirs,i):
    parts=[]
    while i in dirs and dirs[i][1]!=0:
        parts.append(dirs[i][0]); i=dirs[i][1]
    return '/'.join(reversed(parts))
def entries(path):
    d,dirs,ents=parse(path)
    return d,[(n,o,s) for n,o,s,f in ents]
def extract(path,outdir):
    d,dirs,ents=parse(path)
    for n,o,s,f in ents:
        sub=dirpath(dirs,f)
        dd=os.path.join(outdir,sub); os.makedirs(dd,exist_ok=True)
        open(os.path.join(dd,n),'wb').write(d[o:o+s])
    return dirs,ents
if __name__=='__main__':
    out=sys.argv[1]
    for path in sys.argv[2:]:
        dirs,ents=extract(path,os.path.join(out,os.path.basename(path).replace('.PKF','')))
        print(path,'dirs',{k:v for k,v in dirs.items()},'entries',len(ents))
