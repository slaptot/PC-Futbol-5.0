# Genera data/precache.json: lista de imágenes y fuentes pequeñas que se descargan en segundo plano tras
# arrancar (y que el service worker guarda en caché) para que las pantallas se pinten al instante.
# Las fotos grandes de jugadores (img/fotobig, 25 MB) quedan fuera: se precargan por plantilla al entrar en ella.
#   python3 tools/build_precache.py
import os,json
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
DIRS=['img/ui','fonts','img/sorteo','img/cam','img/band','img/bandbig','img/ridi','img/nano','img/esc','img/escbig','img/foto','img/campo','img/entr','img/arb']
urls=[]; total=0
for d in DIRS:
    for f in sorted(os.listdir(os.path.join(ROOT,d))):
        p=os.path.join(ROOT,d,f)
        if f.startswith('.') or not os.path.isfile(p): continue
        urls.append(d+'/'+f); total+=os.path.getsize(p)
json.dump(urls,open(os.path.join(ROOT,'data/precache.json'),'w'),separators=(',',':'))
print(len(urls),'archivos,',round(total/1e6,1),'MB')
