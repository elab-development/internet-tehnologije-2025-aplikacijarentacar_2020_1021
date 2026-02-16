import requests
import os

bot_token = os.getenv("TELEGRAM_BOT_API_TOKEN")
chat_id = os.getenv("TELEGRAM_BOT_CHAT_ID")


class NotificationService:
    @staticmethod
    def send_telegram_message(message: str):

        print(bot_token)
        print(chat_id)
        if not bot_token or not chat_id:
            return

        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": message,
            "parse_mode": "Markdown"
        }
        try:
            requests.post(url, json=payload)
        except Exception as e:
            return {
                "success": False,
                "message": f"There was an error while sending message: {e}"
            }