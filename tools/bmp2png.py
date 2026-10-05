import struct,sys,os
from PIL import Image
def loadpal(p):
    d=open(p,'rb').read()
    i=d.find(b'data')+8+4
    pal=[]
    for k in range(256):
        r,g,b,f=d[i+4*k:i+4*k+4]; pal+= [r,g,b]
    return pal
def conv(path,out,pal):
    b=open(path,'rb').read()
    if len(b)<54 or b[:2] not in (b'BM',b'DM'): return None
    bfsize,res,off=struct.unpack('<III',b[2:14])
    hs=struct.unpack('<I',b[14:18])[0]
    if hs==12:
        w,h,pl,bpp=struct.unpack('<HHHH',b[18:26]); comp=0
        if bpp!=8: return ('skip bpp',bpp)
        stride=(w+3)&~3; data=b[off:off+stride*h]
        if len(data)<stride*h: return ('short',len(data),stride*h)
        im=Image.frombytes('P',(w,h),data,'raw','P',stride,-1); im.putpalette(pal)
        os.makedirs(os.path.dirname(out),exist_ok=True); im.save(out); return (w,h,'core')
    w,h,pl,bpp,comp=struct.unpack('<iihhI',b[18:34])
    if bpp!=8: return ('skip bpp',bpp)
    stride=(w+3)&~3
    haspal = len(b)>=off+stride*abs(h) and off>=1078
    if haspal:
        pl=b[54:54+1024]; palette=[]
        for k in range(256): palette+=[pl[4*k+2],pl[4*k+1],pl[4*k]]
        data=b[off:off+stride*abs(h)]
    else:
        palette=pal; data=b[54:54+stride*abs(h)]
    if len(data)<stride*abs(h): return ('short',len(data),stride*abs(h))
    im=Image.frombytes('P',(w,abs(h)),data,'raw','P',stride,-1 if h>0 else 1)
    im.putpalette(palette)
    os.makedirs(os.path.dirname(out),exist_ok=True)
    im.save(out); return (w,h,'pal' if haspal else 'nopal')
if __name__=='__main__':
    palfile=sys.argv[1]; src=sys.argv[2]; dst=sys.argv[3]
    pal=loadpal(palfile); n=0
    for root,ds,fs in os.walk(src):
        for f in fs:
            p=os.path.join(root,f)
            try: r=conv(p,os.path.join(dst,os.path.relpath(p,src))+'.png',pal)
            except Exception as e: print(p,'ERR',e); continue
            if r and r[0] in ('skip bpp','short'): print(p,r)
            if r: n+=1
    print(src,'converted',n)
