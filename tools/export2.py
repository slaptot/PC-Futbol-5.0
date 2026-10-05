# Exporta los datos de la Edición de Oro (temporada 96-97 completa, España + Inglaterra + Italia)
import json,os,glob,struct,shutil,sys,collections
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from teamparse import team,dec
from jorn import parse as parse_jorn
G="/Users/albertomunozfuertes/Downloads/PC F｣tbol 5.0"
O="/Users/albertomunozfuertes/Downloads/aaaa_PC F£tbol 5.0 Edici¢n de Oro/DBDAT"
W=os.path.join(G,'pcfutbol-web'); D=os.path.join(W,'data'); I=os.path.join(W,'img')
X='x/oro'; PNG='png/oro'
os.makedirs(os.path.join(D,'bio'),exist_ok=True); os.makedirs(os.path.join(D,'cronicas'),exist_ok=True)
ROLE_DEM={1:'POR',2:'DEF',3:'DEF',4:'DEF',5:'DEF',6:'DEF',7:'MED',8:'MED',10:'MED',11:'MED',15:'MED',18:'MED',12:'DEL',13:'DEL',14:'DEL',16:'DEL',17:'DEL',9:'DEL'}
# ---------- calendarios ----------
def cal_esp(f,n):
    b=open(os.path.join(O,f),'rb').read(); per=n*6; rounds=[]
    for j in range(len(b)//per):
        rounds.append([list(struct.unpack('<HHBB',b[j*per+i:j*per+i+6])) for i in range(0,per,6)])
    return rounds
def cal_dated(f,per_round):
    b=open(os.path.join(O,f),'rb').read(); ms=[struct.unpack('<BBHHHBB',b[i:i+10]) for i in range(0,len(b),10)]
    rounds=[]; used=[]
    for m in ms:
        r=0
        while r<len(rounds) and (len(rounds[r])>=per_round or m[3] in used[r] or m[4] in used[r]): r+=1
        if r==len(rounds): rounds.append([]); used.append(set())
        rounds[r].append([m[3],m[4],(None if m[5]==255 else m[5]),(None if m[6]==255 else m[6]),[m[0],m[1],m[2]]]); used[r].add(m[3]); used[r].add(m[4])
    return rounds
LEAGUES={
 'ESP1':dict(name='1ª División',long='Liga Española · 1ª División',country=22,rounds=cal_esp('JORNAD1M.DBC',11)),
 'ESP2':dict(name='2ª División',long='Liga Española · 2ª División',country=22,rounds=cal_esp('JORNAD2M.DBC',10)),
 'ENG1':dict(name='Premier League',long='Premier League',country=30,rounds=cal_dated('PREMIER.DBC',10)),
 'ENG2':dict(name='First Division',long='First Division (Inglaterra)',country=30,rounds=cal_dated('FIRST.DBC',12)),
 'ITA1':dict(name='Serie A',long='Serie A (Italia)',country=36,rounds=cal_dated('SERIEA.DBC',9)),
 'ITA2':dict(name='Serie B',long='Serie B (Italia)',country=36,rounds=cal_dated('SERIEB.DBC',10)),
}
# fechas de las jornadas españolas desde las crónicas
json.dump(LEAGUES,open(os.path.join(D,'leagues.json'),'w'),ensure_ascii=False,separators=(',',':'))
league_of={}
for k,L in LEAGUES.items():
    for r in L['rounds']:
        for m in r: league_of[m[0]]=k; league_of[m[1]]=k
print({k:len(v['rounds']) for k,v in LEAGUES.items()})
# ---------- equipos ----------
teams={}; bios={}; src={}
def load(dirname,tag):
    for f in sorted(glob.glob(os.path.join(X,dirname,'*.DBC'))):
        tid=int(os.path.basename(f)[4:8]); t=team(open(f,'rb').read())
        if tid in teams and not (t['long'] and not teams[tid]['long']): continue
        teams[tid]=t; src[tid]=tag
load('Eq022022.pkf','ESP'); load('Eq030022.pkf','ENG'); load('Eq036022.pkf','ITA')
out={}
for tid,t in teams.items():
    lg=league_of.get(tid)
    div = 1 if lg=='ESP1' else 2 if lg=='ESP2' else 0
    o=dict(id=tid,name=t['name'],full=t['full'],stadium=t['stadium'],nat=t['nat'],capacity=t['capacity'],width=t['width'],length=t['length'],founded=t['founded'],div=div,league=lg,long=t['long'],
           coach=dict(id=t['coach_id'],name=t['coach'],full=t.get('coach_full','')),coach2=[dict(id=c['id'],name=c['name'],full=c.get('full','')) for c in t['coach2']],block=t['block'],src=src[tid])
    if t['long']:
        pos=t['positions']; pos=[(p&0xff) if p>255 else p for p in pos]
        o.update(members=t['members'],president=t['president'],sponsor=t['sponsor'],kit=t['kit'],positions=pos,seasons=t['seasons'],hist=t['hist'],series=t['series'])
        bios[tid]={'coach':dict(texts=t['coach_texts'],career=t['coach_career'],playercareer=t['coach_playercareer'],quotes=t['coach_quotes']),'players':{}}
    ps=[]
    for i,p in enumerate(t['players']):
        q=dict(id=p['id'],dorsal=p['dorsal'],name=p['name'],full=p['full'],roles=[r for r in p['roles'] if r],country=p['country'],c2=p['c2'],f1=p['f1'],f2=p['f2'],f3=p['f3'],f4=p['f4'],
               birth=[p['day'],p['month'],p['year']],height=p['height'],weight=p['weight'],attrs=p['attrs'])
        q['dem']=ROLE_DEM.get(q['roles'][0] if q['roles'] else 0,'MED')
        if t['long']:
            q.update(birthplace=p['birthplace'],prevclub=p['prevclub'],intl=p['intl'])
            bios[tid]['players'][str(i)]=dict(texts=p['texts'],career=p['career'])
        ps.append(q)
    o['players']=ps; out[tid]=o
json.dump(out,open(os.path.join(D,'teams.json'),'w'),ensure_ascii=False,separators=(',',':'))
for tid,b in bios.items(): json.dump(b,open(os.path.join(D,'bio','%d.json'%tid),'w'),ensure_ascii=False,separators=(',',':'))
print('teams',len(out),'long',sum(1 for t in out.values() if t['long']),'players',sum(len(t['players']) for t in out.values()),collections.Counter(t['league'] for t in out.values()))
# ---------- crónicas ----------
def paragraphs(qs):
    txt=''.join(qs); parts=[p.strip() for p in txt.split('\\') if p.strip()]
    return parts
CODE={33:'gol',34:'pp',35:'penalti'}
ncr=0
for lg,prefix,nj in (('ESP1','JORN1',42),('ESP2','JORN2',38)):
    for j in range(1,nj+1):
        ms,p,n=parse_jorn(os.path.join(O,'%s%02d.DBC'%(prefix,j)))
        outm=[]
        for m in ms:
            def sidedata(sd,sname):
                goals=[dict(side=sname,pid=e[1],min=e[2],type=CODE[e[0]]) for e in sd['events'] if e[0] in CODE]
                cards=[dict(side=sname,pid=e[1],type=e[2]) for e in sd['events'] if e[0]==67 and e[2] in (1,2,3)]
                return dict(lineup=[[a,(None if b==0xffff else b),c] for a,b,c in sd['lineup']],goals=goals,cards=cards,quotes=paragraphs(sd['quotes']))
            H=sidedata(m['home_side'],'H'); A=sidedata(m['away_side'],'A')
            text=''.join(m['text']); text='' if text.strip() in ('X','') else text
            outm.append(dict(home=m['home'],away=m['away'],gh=m['gh'],ga=m['ga'],date=list(m['date']),ref=m['ref'],att=m['att'],pitch=m['pitch'],weather=m['weather'],time=m['time'],text=text,
                             goals=sorted(H['goals']+A['goals'],key=lambda g:g['min']),cards=H['cards']+A['cards'],lineup={'H':H['lineup'],'A':A['lineup']},quotes={'H':H['quotes'],'A':A['quotes']}))
        json.dump(outm,open(os.path.join(D,'cronicas','%s-%d.json'%(lg,j)),'w'),ensure_ascii=False,separators=(',',':')); ncr+=len(outm)
print('cronicas',ncr)
# ---------- árbitros ----------
b=open(os.path.join(O,'ARBITROS.DBC'),'rb').read(); p=0x33; refs=[]
def rs():
    global p
    k=struct.unpack('<H',b[p:p+2])[0]; v=dec(b[p+2:p+2+k]); p+=2+k; return v
while p<len(b)-4:
    a,rid=struct.unpack('<HH',b[p:p+4]); p+=4
    name=rs(); cat=b[p]; p+=1; place=rs(); d_,m_,y_=struct.unpack('<BBH',b[p:p+4]); p+=4
    prof=rs(); intl=rs(); x=struct.unpack('<H',b[p:p+2])[0]; p+=2; dem=rs()
    refs.append(dict(id=rid,name=name,cat=cat,place=place,birth=[d_,m_,y_],prof=prof,intl=intl,x=x,dem=dem))
json.dump(refs,open(os.path.join(D,'referees.json'),'w'),ensure_ascii=False); print('refs',len(refs))
# ---------- imágenes ----------
def cp(s_,d_):
    os.makedirs(os.path.dirname(d_),exist_ok=True); shutil.copyfile(s_,d_)
def copyset(srcdir,dstdir):
    n=0
    for f in glob.glob(os.path.join(srcdir,'*.png')):
        num=int(os.path.basename(f)[4:8]); cp(f,os.path.join(I,dstdir,'%d.png'%num)); n+=1
    return n
print('esc',copyset(PNG+'/MINIESC','esc'),'nano',copyset(PNG+'/NANOESC','nano'),'ridi',copyset(PNG+'/RIDIESC','ridi'),'escbig',copyset(PNG+'/BIGESC','escbig'),
      'cam',copyset(PNG+'/CAMISAS','cam'),'band',copyset(PNG+'/MINIBAND','band'),'bandbig',copyset(PNG+'/BANDERAS','bandbig'),'foto',copyset(PNG+'/MINIFOTO','foto'),
      'campo',copyset(PNG+'/BIGCAMP','campo'),'entr',copyset(PNG+'/BIGENTR','entr'))
n=0
for f in glob.glob(PNG+'/bigfoto/*/*.png'):
    num=int(os.path.basename(f)[4:8]); cp(f,os.path.join(I,'fotobig','%d.png'%num)); n+=1
print('fotobig',n)
