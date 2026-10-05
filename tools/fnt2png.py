import struct,sys,os,json
from PIL import Image
def parse_fnt(path):
    d=open(path,'rb').read()
    ver=struct.unpack('<H',d[0:2])[0]
    pixheight=struct.unpack('<H',d[0x58:0x5a])[0]
    first=d[0x5f]; last=d[0x60]; default=d[0x61]; brk=d[0x62]
    widthbytes=struct.unpack('<H',d[0x63:0x65])[0]
    face_off=struct.unpack('<I',d[0x69:0x6d])[0]
    face=d[face_off:d.find(b'\0',face_off)].decode('latin-1')
    ascent=struct.unpack('<H',d[0x4a:0x4c])[0]
    glyphs={}
    n=last-first+1
    p=0x76 if ver==0x200 else 0x94
    esz=4 if ver==0x200 else 6
    for i in range(n+1):
        if ver==0x200:
            w,off=struct.unpack('<HH',d[p+i*4:p+i*4+4])
        else:
            w,off=struct.unpack('<HI',d[p+i*6:p+i*6+6])
        if i<n: glyphs[first+i]=(w,off)
    return dict(ver=ver,height=pixheight,first=first,last=last,face=face,ascent=ascent,glyphs=glyphs,data=d)
def render(f):
    d=f['data']; h=f['height']
    # columns of bytes: for each glyph, width w; bitmap stored column-major by byte columns: ceil(w/8) columns each of h bytes
    total=sum(w for w,o in f['glyphs'].values())+len(f['glyphs'])
    im=Image.new('L',(total,h),0)
    px=im.load(); x=0; metrics={}
    for code,(w,off) in sorted(f['glyphs'].items()):
        cols=(w+7)//8
        for c in range(cols):
            for y in range(h):
                byte=d[off+c*h+y]
                for bit in range(8):
                    xx=c*8+bit
                    if xx<w and byte&(0x80>>bit): px[x+xx,y]=255
        metrics[code]=[x,w]; x+=w+1
    return im,metrics
if __name__=='__main__':
    out=sys.argv[1]; os.makedirs(out,exist_ok=True)
    for path in sys.argv[2:]:
        try:
            f=parse_fnt(path); im,m=render(f)
            name=os.path.basename(path).replace('.FNT','')
            im.save(os.path.join(out,name+'.png'))
            json.dump(dict(face=f['face'],height=f['height'],ascent=f['ascent'],glyphs=m),open(os.path.join(out,name+'.json'),'w'))
            print(name,f['face'],'h',f['height'],'ver',hex(f['ver']),'n',len(m))
        except Exception as e: print(path,'ERR',e)
