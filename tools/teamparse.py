import struct,glob,os,sys,json
def dec(bs): return ''.join(chr(c^0x61) for c in bs)
class R:
    def __init__(s,b,p=0): s.b=b; s.p=p
    def u8(s): v=s.b[s.p]; s.p+=1; return v
    def u16(s): v=struct.unpack('<H',s.b[s.p:s.p+2])[0]; s.p+=2; return v
    def u32(s): v=struct.unpack('<I',s.b[s.p:s.p+4])[0]; s.p+=4; return v
    def s(s_):
        n=s_.u16(); v=dec(s_.b[s_.p:s_.p+n]); s_.p+=n; return v
    def raw(s,n): v=s.b[s.p:s.p+n]; s.p+=n; return v
def player(r,long):
    m=r.u8(); assert m==1,('marker',m,r.p)
    d=dict(id=r.u16(),dorsal=r.u8(),name=r.s(),full=r.s())
    d['f1']=r.u8(); d['f2']=r.u8()
    d['roles']=list(r.raw(6))
    d['country']=r.u8(); d['c2']=r.u8(); d['f3']=r.u8(); d['f4']=r.u8()
    d['day']=r.u8(); d['month']=r.u8(); d['year']=r.u16()
    d['height']=r.u8(); d['weight']=r.u8()
    if long:
        d['nat']=r.u8()
        d['birthplace']=r.s(); d['prevclub']=r.s(); d['intl']=r.s()
        d['texts']=[r.s() for _ in range(6)]
        d['career']=r.s()
    d['attrs']=list(r.raw(10))
    return d
def team(b):
    r=R(b,0x24); t={}
    t['h1']=r.u16(); t['h2']=r.u16(); t['flag']=r.u16()
    t['name']=r.s(); t['stadium']=r.s(); t['nat']=r.u8(); t['full']=r.s()
    t['capacity']=r.u32()
    if t['h2']>=510: t['seats']=r.u32()
    t['width']=r.u16(); t['length']=r.u16(); t['founded']=r.u16()
    long = t['flag']==0
    t['long']=long
    if long:
        t['members']=r.u32(); t['president']=r.s(); t['n1']=r.u32(); t['n2']=r.u32()
        t['sponsor']=r.s(); t['kit']=r.s(); t['n3']=r.u16(); t['n4']=r.u16()
        blk=b.find(b'\x42\x00\x2a\x00\x42\x00\x00\x00\x58\x00',r.p)
        gap=blk-r.p
        if gap==84:
            t['positions']=list(r.raw(11)); t['seasons']=r.u8(); t['hist']=[r.u16() for _ in range(6)]
            t['series']=list(r.raw(44)); t['b16']=list(r.raw(16))
        elif gap==118:
            r.u8(); t['positions']=[r.u16() for _ in range(10)]; t['seasons']=r.u8(); t['hist']=[r.u16() for _ in range(6)]
            t['series']=list(r.raw(44)); t['b16']=list(r.raw(40))
        else:
            t['positions']=[]; t['seasons']=0; t['hist']=None; t['series']=[]; t['b16']=list(r.raw(gap))
        t['variant']=gap
    else:
        t['u2']=r.u16()
    assert b[r.p:r.p+4]==b'\x42\x00\x2a\x00',('block',hex(r.p),t['name'])
    t['block']=[r.u16() for _ in range(87)]
    t['pre']=list(r.raw(8))
    t['coach_id']=r.u16(); t['coach']=r.s()
    if long:
        t['coach_full']=r.s(); t['coach_texts']=[r.s() for _ in range(5)]
        t['coach_career']=r.s(); t['coach_u8']=r.u8(); t['coach_playercareer']=r.s(); t['coach_quotes']=r.s() if t['coach_u8'] else ''
    t['coach2']=[]
    while r.p<len(b) and b[r.p]==2:
        r.u8(); c={'id':r.u16(),'name':r.s()}
        if long:
            c['full']=r.s(); c['texts']=[r.s() for _ in range(5)]; c['career']=r.s(); c['u8']=r.u8(); c['playercareer']=r.s(); c['quotes']=r.s() if c['u8'] else ''
        t['coach2'].append(c)
    t['players']=[]
    while r.p<len(b) and b[r.p]==1:
        t['players'].append(player(r,long))
    t['end']=r.p; t['rest']=b[r.p:r.p+64].hex(' '); t['len']=len(b)
    return t
if __name__=='__main__':
    out={}
    bad=0
    for f in sorted(glob.glob('x/EQUIPOS/*.DBC')):
        b=open(f,'rb').read(); tid=int(os.path.basename(f)[4:8])
        try:
            t=team(b); t['id']=tid; out[tid]=t
            np=len(t['players']); ok= 12<=np<=40 and all(1<=a<=99 for p in t['players'] for a in p['attrs'])
            if not ok or t['end']!=t['len']: bad+=1; print(tid,t['name'],'players',np,'end',t['end'],'len',t['len'],'rest',t['rest'][:40])
        except Exception as e:
            bad+=1; print(tid,'ERR',repr(e))
    print('teams',len(out),'bad',bad)
    json.dump(out,open('teams_raw.json','w'),ensure_ascii=False)
