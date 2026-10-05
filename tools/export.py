import json,os,glob,struct,shutil,sys
from teamparse import team,dec
G="/Users/albertomunozfuertes/Downloads/PC F｣tbol 5.0"
W=os.path.join(G,'pcfutbol-web'); D=os.path.join(W,'data'); I=os.path.join(W,'img')
for d in [D,I]: os.makedirs(d,exist_ok=True)
# ---- calendar
def cal(f,n):
    b=open(os.path.join(G,'DBDAT',f),'rb').read(); per=n*6
    return [[list(struct.unpack('<HHBB',b[j*per+i:j*per+i+6])) for i in range(0,per,6)] for j in range(len(b)//per)]
cal1=cal('JORNAD1M.DBC',11); cal2=cal('JORNAD2M.DBC',10)
div1=sorted({m[0] for j in cal1 for m in j}); div2=sorted({m[0] for j in cal2 for m in j})
json.dump({'div1':cal1,'div2':cal2},open(os.path.join(D,'calendar.json'),'w'))
# ---- teams
teams={}; bios={}
ROLE_DEM={1:'POR',2:'DEF',3:'DEF',4:'DEF',5:'DEF',6:'DEF',7:'MED',8:'MED',10:'MED',11:'MED',15:'MED',12:'DEL',13:'DEL',14:'DEL',16:'DEL',17:'DEL',18:'MED',9:'DEL'}
for f in sorted(glob.glob('x/EQUIPOS/*.DBC')):
    tid=int(os.path.basename(f)[4:8]); t=team(open(f,'rb').read())
    div = 1 if tid in div1 else 2 if tid in div2 else 0
    o=dict(id=tid,name=t['name'],full=t['full'],stadium=t['stadium'],nat=t['nat'],capacity=t['capacity'],width=t['width'],length=t['length'],founded=t['founded'],div=div,long=t['long'],
           coach=dict(id=t['coach_id'],name=t['coach'],full=t.get('coach_full','')),coach2=[dict(id=c['id'],name=c['name'],full=c.get('full','')) for c in t['coach2']],block=t['block'],pre=t['pre'],h1=t['h1'],h2=t['h2'])
    if t['long']:
        o.update(members=t['members'],president=t['president'],sponsor=t['sponsor'],kit=t['kit'],positions=t['positions'],seasons=t['seasons'],hist=t['hist'],series=t['series'],b16=t['b16'],n1=t['n1'],n2=t['n2'],n3=t['n3'],n4=t['n4'])
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
    o['players']=ps
    teams[tid]=o
json.dump(teams,open(os.path.join(D,'teams.json'),'w'),ensure_ascii=False,separators=(',',':'))
os.makedirs(os.path.join(D,'bio'),exist_ok=True)
for tid,b in bios.items(): json.dump(b,open(os.path.join(D,'bio','%d.json'%tid),'w'),ensure_ascii=False,separators=(',',':'))
print('teams',len(teams),'div1',div1,'div2',div2)
# ---- referees
b=open(os.path.join(G,'DBDAT','ARBITROS.DBC'),'rb').read(); p=0x33; refs=[]
def rs():
    global p
    k=struct.unpack('<H',b[p:p+2])[0]; v=dec(b[p+2:p+2+k]); p+=2+k; return v
while p<len(b)-4:
    a,rid=struct.unpack('<HH',b[p:p+4]); p+=4
    name=rs(); cat=b[p]; p+=1; place=rs(); d_,m_,y_=struct.unpack('<BBH',b[p:p+4]); p+=4
    prof=rs(); intl=rs(); x=struct.unpack('<H',b[p:p+2])[0]; p+=2; dem=rs()
    refs.append(dict(id=rid,name=name,cat=cat,place=place,birth=[d_,m_,y_],prof=prof,intl=intl,x=x,dem=dem))
json.dump(refs,open(os.path.join(D,'referees.json'),'w'),ensure_ascii=False)
print('refs',len(refs),refs[0])
# ---- liga history
b=open(os.path.join(G,'DBDAT','LIGA.DBC'),'rb').read(); p=0x31
cnt=struct.unpack('<H',b[p:p+2])[0]; p+=2; seasons=[]
for s in range(cnt):
    year,nt=struct.unpack('<HH',b[p:p+4]); p+=4; rows=[]
    for t_ in range(nt):
        n=struct.unpack('<H',b[p:p+2])[0]; name=dec(b[p+2:p+2+n]); p+=2+n
        st=list(struct.unpack('<5H',b[p:p+10])); p+=10; rows.append([name]+st)
    seasons.append(dict(year=year,table=rows))
n=struct.unpack('<H',b[p:p+2])[0]; p+=2; champs=[]
for i in range(n):
    k=struct.unpack('<H',b[p:p+2])[0]; name=dec(b[p+2:p+2+k]); p+=2+k; c=struct.unpack('<H',b[p:p+2])[0]; p+=2; champs.append([name,c])
json.dump(dict(seasons=seasons,champions=champs),open(os.path.join(D,'liga_history.json'),'w'),ensure_ascii=False)
print('liga seasons',len(seasons),'champs',champs)
# ---- images
def cp(src,dst):
    os.makedirs(os.path.dirname(dst),exist_ok=True); shutil.copyfile(src,dst)
def copyset(srcdir,dstdir,prefix_len=4,digits=4):
    n=0
    for f in glob.glob(os.path.join(srcdir,'*.png')):
        base=os.path.basename(f); num=int(base[prefix_len:prefix_len+digits]); cp(f,os.path.join(I,dstdir,'%d.png'%num)); n+=1
    return n
print('esc',copyset('png/MINIESC','esc'),'nano',copyset('png/NANOESC','nano'),'ridi',copyset('png/RIDIESC','ridi'),'escbig',copyset('png/BIGESC','escbig'),
      'cam',copyset('png/CAMISAS','cam'),'band',copyset('png/MINIBAND','band'),'bandbig',copyset('png/BANDERAS','bandbig'),'foto',copyset('png/MINIFOTO','foto'),
      'campo',copyset('png/BIGCAMP','campo'),'entr',copyset('png/BIGENTR','entr'),'arb',copyset('png/BIGARBIT','arb'))
n=0
for f in glob.glob('png/bigfoto/*/*.png'):
    num=int(os.path.basename(f)[4:8]); cp(f,os.path.join(I,'fotobig','%d.png'%num)); n+=1
print('fotobig',n)
for i in range(9): cp('png/RECURSOS/FONDO%d.BMP.png'%i,os.path.join(I,'ui','fondo%d.png'%i))
for name in ['BARRA0','BARRA1','BARRAPOPUP','BASE_DATOS','INFOFUTBOL']: cp('png/RECURSOS/%s.BMP.png'%name,os.path.join(I,'ui',name.lower()+'.png'))
for f in glob.glob('png/RC_DBASE/*.png')+glob.glob('png/RECURSOS/ICONOS/*.png')+glob.glob('png/IMG/*.png')+glob.glob('png/BMP/*.png')+glob.glob('png/DAT/*.png'):
    base=os.path.basename(f).replace('.BMP.png','').replace('.BM.png','').replace('.B.png','').replace('..png','').replace('.png','')
    base=base.strip().lower().replace(' ','_').replace('(','').replace(')','').replace('.','')
    cp(f,os.path.join(I,'ui',base+'.png'))
print('ui',len(os.listdir(os.path.join(I,'ui'))))
