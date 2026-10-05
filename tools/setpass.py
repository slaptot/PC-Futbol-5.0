#!/usr/bin/env python3
"""Cambia la contraseña de acceso de la web publicada: python3 tools/setpass.py <contraseña>"""
import hashlib, re, sys, os
if len(sys.argv)<2: sys.exit('Uso: python3 tools/setpass.py <contraseña>')
p=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','js','auth.js')
s=open(p,encoding='utf-8').read()
salt=re.search(r"AUTH_SALT='([^']*)'",s).group(1)
h=hashlib.sha256((salt+':'+sys.argv[1]).encode()).hexdigest()
s=re.sub(r"AUTH_HASH='[0-9a-f]*'","AUTH_HASH='%s'"%h,s)
open(p,'w',encoding='utf-8').write(s)
print('Contraseña actualizada. Haz commit y push de js/auth.js.')
