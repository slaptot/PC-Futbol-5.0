# Exporta data/names.json con las listas de nombres y apellidos del juego (DBDAT/NOMBRES.xx y APELLIDO.xx,
# 22 España, 30 Inglaterra, 36 Italia): formato DMLT, cadenas con longitud u16 y caracteres XOR 0x61.
# Son las listas que el juego original usaba para generar nombres (empleados, promanager).
#   python3 tools/names.py "/ruta/a/DBDAT"
import sys,os,struct,json
D=sys.argv[1] if len(sys.argv)>1 else '/Users/albertomunozfuertes/Downloads/aaaa_PC F£tbol 5.0 Edici¢n de Oro/DBDAT'
def parse(path):
    b=open(path,'rb').read(); assert b[:4]==b'DMLT',path
    size,count=struct.unpack('<II',b[4:12]); p=12; out=[]
    while p+2<=len(b) and len(out)<count:
        n=struct.unpack('<H',b[p:p+2])[0]; p+=2
        if n==0 or p+n>len(b): break
        out.append(bytes(c^0x61 for c in b[p:p+n]).decode('latin-1')); p+=n
    return out
res={}
for c in ('22','30','36'):
    res[c]={'n':parse(os.path.join(D,'NOMBRES.'+c)),'a':parse(os.path.join(D,'APELLIDO.'+c))}
    print(c,len(res[c]['n']),'nombres',len(res[c]['a']),'apellidos; ej:',res[c]['n'][:4],res[c]['a'][:4])
out=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','data','names.json')
json.dump(res,open(out,'w',encoding='utf-8'),ensure_ascii=False,separators=(',',':')); print('->',out)
