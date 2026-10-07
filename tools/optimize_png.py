# Optimiza sin pérdida todos los PNG de img/ con oxipng (pip install pyoxipng): recorta paletas, quita metadatos
# y recomprime. Comprueba píxel a píxel que la imagen decodificada es idéntica antes de sustituir el archivo.
#   python3 tools/optimize_png.py [--backup DIR] [--level N] [carpetas...]
import os,sys,io
import oxipng
from PIL import Image
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
args=sys.argv[1:]; backup=None; level=3
while args and args[0].startswith('--'):
    if args[0]=='--backup': backup=args[1]
    elif args[0]=='--level': level=int(args[1])
    args=args[2:]
dirs=args or ['img']
tot_in=tot_out=n=skipped=0
for d in dirs:
    for root,_,files in os.walk(os.path.join(ROOT,d)):
        for f in sorted(files):
            if not f.lower().endswith('.png'): continue
            p=os.path.join(root,f); data=open(p,'rb').read()
            try: out=oxipng.optimize_from_memory(data,level=level,strip=oxipng.StripChunks.safe())
            except Exception as e: print('ERROR',p,e); skipped+=1; continue
            if len(out)>=len(data): tot_in+=len(data); tot_out+=len(data); continue
            a=Image.open(io.BytesIO(data)).convert('RGBA'); b=Image.open(io.BytesIO(out)).convert('RGBA')
            if a.size!=b.size or a.tobytes()!=b.tobytes(): print('DISTINTA, no se toca',p); skipped+=1; tot_in+=len(data); tot_out+=len(data); continue
            if backup:
                bp=os.path.join(backup,os.path.relpath(p,ROOT)); os.makedirs(os.path.dirname(bp),exist_ok=True)
                if not os.path.exists(bp): open(bp,'wb').write(data)
            open(p,'wb').write(out); tot_in+=len(data); tot_out+=len(out); n+=1
            if n%500==0: print(n,'optimizadas…',round(tot_in/1e6,1),'->',round(tot_out/1e6,1),'MB',flush=True)
print('optimizadas',n,'· sin cambio/omitidas',skipped,'·',round(tot_in/1e6,2),'MB ->',round(tot_out/1e6,2),'MB (%d %%)'%round(100*(1-tot_out/max(1,tot_in))))
