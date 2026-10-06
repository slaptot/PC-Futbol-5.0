# Quita el fondo negro de los escudos: el negro conectado con el borde de la imagen pasa a transparente
# (el negro interior del dibujo se conserva). Uso:
#   python3 tools/esc_alpha.py [--out DIR] [id ...]     (sin ids: todos los escudos de img/esc e img/escbig)
import os,sys
from PIL import Image
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
def clear_bg(im,thr=24):
    im=im.convert('RGBA'); w,h=im.size; px=im.load()
    seen=bytearray(w*h); stack=[]
    def dark(x,y): r,g,b,a=px[x,y]; return r<=thr and g<=thr and b<=thr
    for x in range(w):
        for y in (0,h-1):
            if dark(x,y): stack.append((x,y))
    for y in range(h):
        for x in (0,w-1):
            if dark(x,y): stack.append((x,y))
    n=0
    while stack:
        x,y=stack.pop(); i=y*w+x
        if seen[i]: continue
        seen[i]=1; px[x,y]=(0,0,0,0); n+=1
        for dx,dy in ((1,0),(-1,0),(0,1),(0,-1)):
            nx,ny=x+dx,y+dy
            if 0<=nx<w and 0<=ny<h and not seen[ny*w+nx] and dark(nx,ny): stack.append((nx,ny))
    return im,n
if __name__=='__main__':
    args=sys.argv[1:]; out=None
    if args and args[0]=='--out': out=args[1]; args=args[2:]
    ids=args or sorted({f[:-4] for d in ('esc','escbig') for f in os.listdir(os.path.join(ROOT,'img',d)) if f.endswith('.png')},key=lambda s:int(s) if s.isdigit() else 0)
    for d in ('esc','escbig'):
        for i in ids:
            p=os.path.join(ROOT,'img',d,str(i)+'.png')
            if not os.path.exists(p): continue
            im,n=clear_bg(Image.open(p))
            dst=os.path.join(out,d,str(i)+'.png') if out else p
            os.makedirs(os.path.dirname(dst),exist_ok=True); im.save(dst,optimize=True)
            print(d,i,'transparentes:',n)
