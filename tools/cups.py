import struct,os,json,sys
O="/Users/albertomunozfuertes/Downloads/aaaa_PC F£tbol 5.0 Edici¢n de Oro/DBDAT"
def dec(bs): return ''.join(chr(c^0x61) for c in bs)
class R:
    def __init__(s,b,p): s.b=b; s.p=p
    def u16(s): v=struct.unpack('<H',s.b[s.p:s.p+2])[0]; s.p+=2; return v
    def u32(s): v=struct.unpack('<I',s.b[s.p:s.p+4])[0]; s.p+=4; return v
    def s(s_):
        n=s_.u16(); v=dec(s_.b[s_.p:s_.p+n]); s_.p+=n; return v
def champions(r):
    n=r.u16(); out=[]
    for i in range(n): name=r.s(); c=r.u16(); out.append([name,c])
    return out
def coparey(fn):
    b=open(os.path.join(O,fn),'rb').read(); r=R(b,0x31); n=r.u16(); eds=[]
    for i in range(n):
        year=r.u16(); x=r.u32(); w=r.s(); l=r.s(); gh=r.u16(); ga=r.u16(); txt=r.s()
        eds.append(dict(year=year,winner=w,runner=l,gh=gh,ga=ga,text=txt))
    ch=champions(r); assert r.p==len(b),(fn,r.p,len(b))
    return dict(editions=eds,champions=ch)
def supercopa(fn):
    b=open(os.path.join(O,fn),'rb').read(); r=R(b,0x31); n=r.u16(); eds=[]
    for i in range(n):
        year=r.u16(); w=r.s(); l=r.s(); legs=[]
        for k in range(2):
            gh=r.u16(); ga=r.u16(); st=r.s(); dt=r.s(); ref=r.s(); att=r.u32(); t1=r.s(); t2=r.s()
            if st!='VUELTA': legs.append(dict(gh=gh,ga=ga,stadium=st,date=dt,ref=ref,att=att,lineups=[t1,t2]))
        eds.append(dict(year=year,winner=w,runner=l,legs=legs))
    ch=champions(r) if r.p<len(b) else []
    return dict(editions=eds,champions=ch,end=(r.p,len(b)))
def europa(fn,kind):
    b=open(os.path.join(O,fn),'rb').read(); r=R(b,0x31); n=r.u16(); rank=[]
    for i in range(n):
        name=r.s(); st=[r.u16() for _ in range(7)]; rank.append([name]+st)
    n=r.u16(); eds=[]
    for i in range(n):
        year=r.u16(); typ=r.u16(); w=r.s(); l=r.s()
        if kind=='CE':
            gh=r.u16(); ga=r.u16(); place=r.s(); txt=r.s(); eds.append(dict(year=year,type=typ,winner=w,runner=l,gh=gh,ga=ga,place=place,text=txt))
        else:
            sc=[r.u16() for _ in range(4)]; eds.append(dict(year=year,type=typ,winner=w,runner=l,s=sc))
    ch=champions(r) if r.p<len(b) else []
    return dict(ranking=rank,editions=eds,champions=ch,end=(r.p,len(b)))
if __name__=='__main__':
    out={'COPAREY':coparey('C1022022.DBC'),'CE':europa('C2022022.DBC','CE'),'RECOPA':europa('C3022022.DBC','RECOPA'),'UEFA':europa('C4022022.DBC','UEFA'),
         'SCINTERC':supercopa('C5022022.DBC'),'SCEUROPA':supercopa('C6022022.DBC'),'SCESPANA':supercopa('C7022022.DBC')}
    for k,v in out.items(): print(k,len(v['editions']),'champions',v.get('champions')[:4],'end',v.get('end'))
    print(out['CE']['editions'][0],out['CE']['editions'][-1]); print(out['RECOPA']['editions'][-1],out['UEFA']['editions'][-1])
    for v in out.values(): v.pop('end',None)
    D="/Users/albertomunozfuertes/Downloads/PC F｣tbol 5.0/pcfutbol-web/data"
    json.dump(out,open(os.path.join(D,'cups.json'),'w'),ensure_ascii=False,separators=(',',':'))
    print('written')
