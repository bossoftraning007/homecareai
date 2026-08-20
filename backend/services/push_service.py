import os
import json
from webpush import webpush

VAPID_PUBLIC_KEY = os.getenv("VAPID_PUBLIC_KEY", "")
VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY", "")

subscription_store = {}


def send_notification_to_user(subscription_info: dict, title: str, body: str, icon: str = None, data: dict = None):
    if not VAPID_PRIVATE_KEY:
        return False

    payload = json.dumps({
        'title': title,
        'body': body,
        'icon': icon or '/logo.svg',
        'data': data or {},
    })

    try:
        webpush(
            subscription_info=subscription_info,
            data=payload,
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_public_key=VAPID_PUBLIC_KEY,
        )
        return True
    except Exception as e:
        print(f'Push notification failed: {e}')
        return False
