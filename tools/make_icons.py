# Genera el icono de la app (img/icon-*.png) y las imágenes de arranque de iOS (img/splash/*.png)
# a partir del logotipo del menú original (img/ui/fondo7.png). Necesita Pillow:
#   python3 tools/make_icons.py
import os,sys
from PIL import Image, ImageFilter, ImageDraw, ImageEnhance
ROOT=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..')
src=Image.open(os.path.join(ROOT,'img/ui/fondo7.png')).convert('RGB')
src=src.copy()
# tapar los restos de los textos del menú (IN de INSTRUCCIONES, P de ProQuinielas) con fondo vecino
src.paste(src.crop((300,138,330,180)),(326,138)); src.paste(src.crop((296,352,330,380)),(326,352))
logo=src.crop((0,22,352,374))                      # "PC FUTBOL" + "5.0" sin los textos del menú
S=1024
bg=logo.resize((S,S),Image.LANCZOS).filter(ImageFilter.GaussianBlur(28))
bg=ImageEnhance.Brightness(bg).enhance(0.55)      # fondo: el mismo logo desenfocado y oscurecido
fg=logo.resize((int(S*0.84),int(S*0.84)),Image.LANCZOS)
# sombra suave bajo el logotipo y borde fino
icon=bg.copy(); d=ImageDraw.Draw(icon)
off=(S-fg.width)//2
sh=Image.new('RGBA',(S,S),(0,0,0,0)); ImageDraw.Draw(sh).rounded_rectangle((off+6,off+10,off+fg.width+6,off+fg.height+10),36,fill=(0,0,0,170))
sh=sh.filter(ImageFilter.GaussianBlur(18)); icon=Image.alpha_composite(icon.convert('RGBA'),sh)
m=Image.new('L',fg.size,0); ImageDraw.Draw(m).rounded_rectangle((0,0,fg.width-1,fg.height-1),36,fill=255)
icon.paste(fg,(off,off),m)
ImageDraw.Draw(icon).rounded_rectangle((off,off,off+fg.width-1,off+fg.height-1),36,outline=(214,196,120,220),width=4)
icon=icon.convert('RGB')
for n in (512,192):
    icon.resize((n,n),Image.LANCZOS).save(os.path.join(ROOT,'img/icon-%d.png'%n),optimize=True)
icon.resize((180,180),Image.LANCZOS).save(os.path.join(ROOT,'img/apple-touch-icon.png'),optimize=True)
# imágenes de arranque de iOS: icono redondeado centrado sobre el verde del splash (#0a3a0a)
SIZES=[(1125,2436),(1170,2532),(1179,2556),(1284,2778),(1290,2796),(828,1792),(750,1334),(1242,2208),(1242,2688),(1536,2048),(1668,2388),(2048,2732)]
os.makedirs(os.path.join(ROOT,'img/splash'),exist_ok=True)
for w,hh in SIZES:
    im=Image.new('RGB',(w,hh),'#0a3a0a'); n=int(w*0.42); ic=icon.resize((n,n),Image.LANCZOS)
    mk=Image.new('L',(n,n),0); ImageDraw.Draw(mk).rounded_rectangle((0,0,n-1,n-1),n//5,fill=255)
    shd=Image.new('RGBA',(w,hh),(0,0,0,0)); ImageDraw.Draw(shd).rounded_rectangle(((w-n)//2+8,(hh-n)//2+16,(w+n)//2+8,(hh+n)//2+16),n//5,fill=(0,0,0,150))
    im=Image.alpha_composite(im.convert('RGBA'),shd.filter(ImageFilter.GaussianBlur(n//24))).convert('RGB')
    im.paste(ic,((w-n)//2,(hh-n)//2),mk); im.save(os.path.join(ROOT,'img/splash/%dx%d.png'%(w,hh)),optimize=True)
print('ok')
