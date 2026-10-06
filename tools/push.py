#!/usr/bin/env python3
"""Envía un aviso push a los jugadores suscritos.
Uso: python3 tools/push.py suscripciones.json "Título" "Texto del aviso" [url]
- suscripciones.json: lista JSON con las suscripciones que copian los jugadores desde "Avisos" (botón COPIAR SUSCRIPCIÓN).
- Necesita: pip install pywebpush, y la clave privada VAPID en ../pcfutbol-vapid-private.b64 (fuera del repositorio).
"""
import sys, json, os
try:
    from pywebpush import webpush, WebPushException
except ImportError:
    sys.exit('Instala pywebpush: pip install pywebpush')
if len(sys.argv)<4: sys.exit(__doc__)
subs=json.load(open(sys.argv[1])); title, body=sys.argv[2], sys.argv[3]; url=sys.argv[4] if len(sys.argv)>4 else None
priv=open(os.path.join(os.path.dirname(__file__),'..','..','pcfutbol-vapid-private.b64')).read().strip()
payload=json.dumps({'title':title,'body':body,'url':url})
ok=0
for s in (subs if isinstance(subs,list) else [subs]):
    try:
        webpush(subscription_info=s,data=payload,vapid_private_key=priv,vapid_claims={'sub':'mailto:alberto.munoz.fuertes@proton.me'}); ok+=1
    except WebPushException as e:
        print('Error:',e)
print('Enviados',ok,'de',len(subs))
