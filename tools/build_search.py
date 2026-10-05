# Construye data/search.json: documentos [tipo, ref, título, texto] para el buscador global
import json,os,glob,sys
D=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','data')
teams=json.load(open(os.path.join(D,'teams.json')))
leagues=json.load(open(os.path.join(D,'leagues.json')))
docs=[]
ROLES={1:'Portero',2:'Lateral derecho',3:'Lateral izquierdo',4:'Líbero',5:'Central izquierdo',6:'Central derecho',7:'Centrocampista derecha',8:'Interior derecho',9:'Delantero centro',10:'Medio centro organizador',11:'Centrocampista izquierda',12:'Extremo derecho',13:'Media punta por el centro',14:'Extremo izquierdo',15:'Medio centro defensivo',16:'Media punta derecha',17:'Media punta izquierda',18:'Interior izquierdo'}
for tid,t in teams.items():
    tid=int(tid)
    bio=None
    bp=os.path.join(D,'bio','%d.json'%tid)
    if os.path.exists(bp): bio=json.load(open(bp))
    parts=[t['full'],'Estadio '+t['stadium'],'Fundado en %s'%t['founded']]
    if t.get('president'): parts.append('Presidente '+t['president'])
    if t.get('sponsor'): parts.append('Patrocinador '+t['sponsor']+' '+t.get('kit',''))
    parts.append('Entrenador '+(t['coach'].get('full') or t['coach']['name']))
    lgn={'ESP1':'1ª División','ESP2':'2ª División','ENG1':'Premier League','ENG2':'First Division','ITA1':'Serie A','ITA2':'Serie B'}.get(t.get('league'),'')
    docs.append(['team',tid,t['name'],' · '.join(parts),lgn])
    if bio:
        c=bio['coach']; docs.append(['coach',tid,'Entrenador: '+(t['coach'].get('full') or t['coach']['name']),'\n'.join(c['texts']+[c['career'],c['playercareer'],c['quotes']]),t['name']])
    for i,p in enumerate(t['players']):
        txt=[p['full'] or p['name'],', '.join(ROLES.get(r,'') for r in p['roles'])]
        if p.get('birthplace'): txt.append('Nacido en '+p['birthplace'])
        if p.get('prevclub'): txt.append('Procedente de '+p['prevclub'])
        if bio and str(i) in bio['players']:
            pb=bio['players'][str(i)]; txt+= [x for x in pb['texts'] if x and x!='x']+([pb['career']] if 'ND,ND' not in pb['career'] else [])
        docs.append(['player',[tid,i],p['name'],'\n'.join(txt),t['name']+(' · '+lgn if lgn else '')])
tn={int(k):v['name'] for k,v in teams.items()}
for lg in ['ESP1','ESP2']:
    for j in range(1,len(leagues[lg]['rounds'])+1):
        fp=os.path.join(D,'cronicas','%s-%d.json'%(lg,j))
        if not os.path.exists(fp): continue
        for mi,m in enumerate(json.load(open(fp))):
            txt=[m['text']]+[q.lstrip('$') for q in m['quotes']['H']+m['quotes']['A'] if q and q!='X']
            if m['ref'] and m['ref']!='X': txt.append('Árbitro '+m['ref'])
            if not any(x.strip() for x in txt): continue
            docs.append(['cronica',[lg,j,mi],'%s %d-%d %s'%(tn.get(m['home'],'?'),m['gh'],m['ga'],tn.get(m['away'],'?')),'\n'.join(txt),('1ª División' if lg=='ESP1' else '2ª División')+' · Jornada %d'%j+(' · %d/%d/%d'%tuple(m['date']) if m.get('date') else '')])
for i,r in enumerate(json.load(open(os.path.join(D,'referees.json')))):
    docs.append(['ref',i,r['name'],' · '.join([r['dem'],r['place'],r['prof'],'Internacional '+r['intl']]),'Colegio '+r['dem']])
cups=json.load(open(os.path.join(D,'cups.json')))
NAMES={'COPAREY':'Copa del Rey','CE':'Copa de Europa','RECOPA':'Recopa','UEFA':'UEFA','SCESPANA':'Supercopa de España','SCEUROPA':'Supercopa de Europa','SCINTERC':'Intercontinental'}
for k,c in cups.items():
    for i,e in enumerate(c['editions']):
        txt=[e['winner']+' campeón, '+e['runner']+' finalista']
        if 'text' in e: txt.append(e['text'])
        if 'place' in e: txt.append(e['place'])
        for l in e.get('legs',[]): txt+= [l['stadium'],l['date'],'Árbitro '+l['ref']]+l['lineups']
        docs.append(['cup',[k,i],'%s - %s'%(e['winner'],e['runner']),'\n'.join(txt),'%s %s'%(NAMES[k],e['year'])])
liga=json.load(open(os.path.join(D,'liga_history.json')))
for i,se in enumerate(liga['seasons']):
    docs.append(['liga',i,'Campeón: '+(se['table'][0][0] if se['table'] else ''),'Clasificación: '+', '.join('%d %s'%(n+1,r[0]) for n,r in enumerate(se['table'])),'Liga %d-%s'%(se['year'],str(se['year']+1)[2:])])
json.dump(docs,open(os.path.join(D,'search.json'),'w'),ensure_ascii=False,separators=(',',':'))
print('docs',len(docs),'size',os.path.getsize(os.path.join(D,'search.json')))
