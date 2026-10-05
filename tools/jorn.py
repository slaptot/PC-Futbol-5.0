import struct,sys,os,glob
def dec(bs): return bytes(c^0x61 for c in bs).decode('cp437')
def printable(bs): return all((c^0x61)>=32 or (c^0x61) in (9,10,13) for c in bs)
class R:
    def __init__(s,b): s.b=b; s.p=0
    def u8(s): v=s.b[s.p]; s.p+=1; return v
    def u16(s): v=struct.unpack('<H',s.b[s.p:s.p+2])[0]; s.p+=2; return v
    def u32(s): v=struct.unpack('<I',s.b[s.p:s.p+4])[0]; s.p+=4; return v
    def s(s_):
        n=s_.u16(); v=dec(s_.b[s_.p:s_.p+n]); s_.p+=n; return v
    def peek16(s): return struct.unpack('<H',s.b[s.p:s.p+2])[0] if s.p+2<=len(s.b) else 0
def lines(r):
    nfull=r.u8(); out=[]
    for i in range(nfull+1): out.append(r.s())
    return out
def textlines(r):
    # strings while plausible
    out=[]
    while r.p+2<=len(r.b):
        n=r.peek16()
        if n==0 or n>120: break
        s=r.b[r.p+2:r.p+2+n]
        if not printable(s): break
        out.append(r.s())
    return out
def side(r):
    n0=r.u16(); lineup=[]
    for i in range(12):
        a,b_,c=struct.unpack('<HHH',r.b[r.p:r.p+6]); r.p+=6
        if a!=0xffff: lineup.append((a,b_,c))
    events=[]
    while True:
        a=r.u16()
        if a==0x63: break
        b_=r.u16(); c=r.u16(); events.append((a,b_,c))
        if len(events)>60: raise Exception('events overflow')
    nq=r.u8(); quotes=[r.s() for _ in range(nq+1)]
    return dict(n0=n0,lineup=lineup,events=events,quotes=quotes)
def parse(path):
    b=open(path,'rb').read(); r=R(b); ms=[]
    j=r.u16()
    while r.p<len(b)-10:
        hm,aw,gh,ga,x,d,mo,y=struct.unpack('<HHBBBBBB',b[r.p:r.p+10]); r.p+=10
        ref=r.s(); att=r.u32(); pitch=r.s(); wea=r.s(); tim=r.s()
        txt=lines(r)
        H=side(r); A=side(r)
        ms.append(dict(j=j,home=hm,away=aw,gh=gh,ga=ga,x=x,date=(d,mo,1900+y),ref=ref,att=att,pitch=pitch,weather=wea,time=tim,text=txt,home_side=H,away_side=A))
    return ms,r.p,len(b)
if __name__=='__main__':
    for f in sys.argv[1:]:
        try:
            ms,p,n=parse(f)
            print(os.path.basename(f),'matches',len(ms),'end',p,n, [(m['home'],m['away'],m['gh'],m['ga']) for m in ms][:11])
        except Exception as e:
            print(os.path.basename(f),'ERR',repr(e))
