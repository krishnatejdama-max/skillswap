import os, base64, json
from dotenv import load_dotenv

load_dotenv()
key = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')
if not key:
    print('ERROR: SUPABASE_SERVICE_ROLE_KEY is not set in .env')
else:
    try:
        payload = key.split('.')[1]
        pad = 4 - len(payload) % 4
        decoded = json.loads(base64.urlsafe_b64decode(payload + '=' * pad))
        print('role:', decoded.get('role'))
    except Exception as e:
        print('Could not decode key:', e)
