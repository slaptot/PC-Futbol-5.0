# Quita el fondo negro de los escudos: el color exacto del fondo (el de las esquinas, negro puro) conectado con
# el borde de la imagen pasa a transparente. El negro del dibujo (bordes, murciélagos, letras) es otro tono y se conserva. Uso:
#   python3 tools/esc_alpha.py [--out DIR] [--dirs esc,escbig,nano,ridi] [id ...]   (sin ids: todas las imágenes de esas carpetas)
import os,sys
from PIL import Image
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
def clear_bg(im):
    # el fondo es el color exacto de las esquinas (en los BMP del juego, el índice 0 = negro puro);
    # el negro del dibujo usa otros índices (p. ej. 22,22,22) y no se toca
    im=im.convert('RGBA'); w,h=im.size; px=im.load()
    from collections import Counter
    bg=Counter(px[x,y][:3] for x,y in ((0,0),(w-1,0),(0,h-1),(w-1,h-1))).most_common(1)[0][0]
    if max(bg)>24: return im,0   # la esquina no es negra: no hay fondo que quitar
    seen=bytearray(w*h); stack=[]
    def dark(x,y): return px[x,y][:3]==bg
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
    args=sys.argv[1:]; out=None; dirs=('esc','escbig')
    while args and args[0] in ('--out','--dirs'):
        if args[0]=='--out': out=args[1]
        else: dirs=tuple(args[1].split(','))
        args=args[2:]
    ids=args or sorted({f[:-4] for d in dirs for f in os.listdir(os.path.join(ROOT,'img',d)) if f.endswith('.png')},key=lambda s:int(s) if s.isdigit() else 0)
    for d in dirs:
        for i in ids:
            p=os.path.join(ROOT,'img',d,str(i)+'.png')
            if not os.path.exists(p): continue
            im,n=clear_bg(Image.open(p))
            dst=os.path.join(out,d,str(i)+'.png') if out else p
            os.makedirs(os.path.dirname(dst),exist_ok=True); im.save(dst,optimize=True)
            print(d,i,'transparentes:',n)
