import sys,os,struct
from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fnt2png import parse_fnt
def glyph_rows(d,w,h,off):
    cols=(w+7)//8; rows=[]
    for y in range(h):
        bits=[]
        for c in range(cols):
            byte=d[off+c*h+y]
            for bit in range(8):
                xx=c*8+bit
                if xx<w: bits.append(1 if byte&(0x80>>bit) else 0)
        rows.append(bits)
    return rows
def build(path,out,family):
    f=parse_fnt(path); d=f['data']; h=f['height']; asc=f['ascent']
    K=8; upm=h*K
    names=['.notdef','space']+['g%d'%c for c in range(33,256)]
    glyphs={}; adv={}; cmap={}
    pen=TTGlyphPen(None); glyphs['.notdef']=pen.glyph(); adv['.notdef']=max(1,h//2)*K
    for code in range(32,256):
        w,off=f['glyphs'].get(code,(0,0))
        name='space' if code==32 else 'g%d'%code
        pen=TTGlyphPen(None)
        if w and code!=32:
            rows=glyph_rows(d,w,h,off)
            for y,bits in enumerate(rows):
                x=0
                while x<w:
                    if bits[x]:
                        x0=x
                        while x<w and bits[x]: x+=1
                        yt=asc-y; yb=asc-y-1
                        pen.moveTo((x0*K,yb*K)); pen.lineTo((x0*K,yt*K)); pen.lineTo((x*K,yt*K)); pen.lineTo((x*K,yb*K)); pen.closePath()
                    else: x+=1
        glyphs[name]=pen.glyph(); adv[name]=w*K if w else 0
        cmap[code]=name
        # map cp1252 code to unicode
    uni={}
    for code,name in cmap.items():
        try: u=ord(bytes([code]).decode('cp1252'))
        except Exception: continue
        uni[u]=name
    fb=FontBuilder(upm,isTTF=True)
    fb.setupGlyphOrder(list(glyphs.keys()))
    fb.setupCharacterMap(uni)
    fb.setupGlyf(glyphs)
    fb.setupHorizontalMetrics({n:(adv[n],0) for n in glyphs})
    fb.setupHorizontalHeader(ascent=asc*K,descent=-(h-asc)*K)
    fb.setupNameTable(dict(familyName=family,styleName='Regular'))
    fb.setupOS2(sTypoAscender=asc*K,sTypoDescender=-(h-asc)*K,usWinAscent=asc*K,usWinDescent=(h-asc)*K)
    fb.setupPost()
    fb.save(out)
    return h,asc
if __name__=='__main__':
    out=sys.argv[1]; os.makedirs(out,exist_ok=True)
    for p in sys.argv[2:]:
        name=os.path.basename(p).replace('.FNT','').lower()
        h,a=build(p,os.path.join(out,name+'.ttf'),'PCF '+name)
        print(name,h,a)
