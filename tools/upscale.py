# Ampliación de sprites sin desenfoque (Scale2x/Scale3x, "EPX"): conserva los bordes del dibujo original.
#   python3 tools/upscale.py origen.png destino.png [factor 2|3|4|6]
import sys
from PIL import Image
def scale2x(im):
    w,h=im.size; src=im.load(); out=Image.new('RGBA',(w*2,h*2)); dst=out.load()
    g=lambda x,y: src[max(0,min(w-1,x)),max(0,min(h-1,y))]
    for y in range(h):
        for x in range(w):
            P=g(x,y); A=g(x,y-1); B=g(x+1,y); C=g(x-1,y); D=g(x,y+1)
            e0=A if (C==A and C!=D and A!=B) else P; e1=A if (A==B and A!=C and B!=D) else P
            e2=D if (D==C and D!=B and C!=A) else P; e3=B if (B==D and B!=A and D!=C) else P
            dst[2*x,2*y]=e0; dst[2*x+1,2*y]=e1; dst[2*x,2*y+1]=e2; dst[2*x+1,2*y+1]=e3
    return out
def scale3x(im):
    w,h=im.size; src=im.load(); out=Image.new('RGBA',(w*3,h*3)); dst=out.load()
    g=lambda x,y: src[max(0,min(w-1,x)),max(0,min(h-1,y))]
    for y in range(h):
        for x in range(w):
            A=g(x-1,y-1);B=g(x,y-1);C=g(x+1,y-1);D=g(x-1,y);E=g(x,y);F=g(x+1,y);G=g(x-1,y+1);H=g(x,y+1);I=g(x+1,y+1)
            if B!=H and D!=F:
                e=[D if D==B else E, B if (D==B and E!=C) or (B==F and E!=A) else E, F if B==F else E,
                   D if (D==B and E!=G) or (D==H and E!=A) else E, E, F if (B==F and E!=I) or (H==F and E!=C) else E,
                   D if D==H else E, H if (D==H and E!=I) or (H==F and E!=G) else E, F if H==F else E]
            else: e=[E]*9
            for k in range(9): dst[3*x+k%3,3*y+k//3]=e[k]
    return out
if __name__=='__main__':
    src=Image.open(sys.argv[1]).convert('RGBA'); f=int(sys.argv[3]) if len(sys.argv)>3 else 3
    out={2:scale2x,3:scale3x,4:lambda i:scale2x(scale2x(i)),6:lambda i:scale2x(scale3x(i))}[f](src)
    out.save(sys.argv[2],optimize=True); print(src.size,'->',out.size)
