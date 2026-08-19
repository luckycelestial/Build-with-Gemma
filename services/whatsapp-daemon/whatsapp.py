import os
import sys
import time
import json
import threading
import requests
from http.server import HTTPServer, BaseHTTPRequestHandler
from neonize.client import NewClient
from neonize.events import ConnectedEv, MessageEv, QREv
from neonize.utils.jid import JID, build_jid

# Reconfigure stdout/stderr to use utf-8 to prevent encoding crashes on Windows terminal
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

import queue

# Global State
whatsapp_state = {
    "connected": False,
    "phone": None,
    "qr": None
}

CLIENT_DB_PATH = os.path.join(os.path.dirname(__file__), "whatsapp_session.db")
client = NewClient(CLIENT_DB_PATH)

outbound_queue = queue.Queue()

def outbound_worker():
    while True:
        try:
            item = outbound_queue.get()
            if item is None:
                break
            target_jid_obj, text_body, raw_user = item
            attempt = 1
            max_attempts = 5
            while attempt <= max_attempts:
                try:
                    client.send_message(target_jid_obj, text_body)
                    print(f"\n📤 [OUTGOING WA MESSAGE SENT] To: {raw_user}@s.whatsapp.net | Text: '{text_body[:60]}...'")
                    break
                except Exception as send_err:
                    err_str = str(send_err)
                    if "doesn't contain a device JID" in err_str or "not logged in" in err_str.lower():
                        whatsapp_state["connected"] = False
                        print(f"❌ [OUTGOING WA ERROR] WhatsApp account is not linked yet ({err_str}). Please scan QR Code in Web UI!")
                        break
                    print(f"⚠️ [OUTGOING WA RETRY] Attempt {attempt}/{max_attempts} failed ({send_err}). Retrying in 2s...")
                    attempt += 1
                    time.sleep(2)
            
            # Pacing gap between sequential messages to prevent socket congestion / rate limits
            time.sleep(1.5)
            outbound_queue.task_done()
        except Exception as q_err:
            print(f"❌ [OUTBOUND QUEUE ERROR] {q_err}")

threading.Thread(target=outbound_worker, daemon=True).start()

def setup_client_events(cl):
    @cl.event(QREv)
    def on_qr(_: NewClient, qr_ev: QREv):
        if qr_ev.Codes:
            qr_str = qr_ev.Codes[0]
            whatsapp_state["qr"] = qr_str
            whatsapp_state["connected"] = False
            print(f"\n[QR CODE GENERATED] Fresh QR code ready for UI scanning.")

    @cl.event(ConnectedEv)
    def on_connected(c: NewClient, _: ConnectedEv):
        whatsapp_state["connected"] = True
        whatsapp_state["qr"] = None
        phone_number = "Active"
        try:
            if hasattr(c, "me") and c.me:
                if hasattr(c.me, "JID") and c.me.JID and hasattr(c.me.JID, "User") and c.me.JID.User:
                    phone_number = c.me.JID.User
                elif hasattr(c.me, "User") and c.me.User:
                    phone_number = c.me.User
            elif hasattr(c, "store") and c.store and hasattr(c.store, "ID") and c.store.ID:
                phone_number = getattr(c.store.ID, "User", "Active")
        except Exception as e:
            print(f"[WARN] Could not parse phone number: {e}")
        
        whatsapp_state["phone"] = phone_number
        print(f"\n🟢 [CONNECTED] WhatsApp session active for phone +{phone_number}")

    @cl.event(MessageEv)
    def on_message(_: NewClient, message: MessageEv):
        try:
            msg_body = message.Message
            if not msg_body:
                return

            text = None
            if msg_body.conversation:
                text = msg_body.conversation
            elif msg_body.extendedTextMessage and msg_body.extendedTextMessage.text:
                text = msg_body.extendedTextMessage.text

            if not text:
                return

            sender_jid = message.Info.MessageSource.Sender.User if message.Info and message.Info.MessageSource and message.Info.MessageSource.Sender else "Unknown"
            is_from_me = message.Info.MessageSource.IsFromMe if message.Info and message.Info.MessageSource else False
            chat_jid_obj = message.Info.MessageSource.Chat if message.Info and message.Info.MessageSource else None
            chat_user = chat_jid_obj.User if chat_jid_obj else sender_jid

            full_jid = f"{chat_user}@s.whatsapp.net"

            payload = {
                "from": full_jid,
                "sender": sender_jid,
                "chatJid": full_jid,
                "message": text,
                "text": text,
                "isFromMe": is_from_me,
                "timestamp": str(message.Info.Timestamp) if message.Info else str(int(time.time()))
            }

            print(f"\n📩 [INCOMING WA MESSAGE] From: {full_jid} | Text: '{text}'")

            # Forward to Next.js webhook endpoint
            try:
                res = requests.post("http://127.0.0.1:3000/api/whatsapp/receive", json=payload, timeout=5)
                print(f"   ↳ Webhook Response: {res.status_code} {res.json() if res.status_code == 200 else res.text}")
            except Exception as http_err:
                print(f"   ↳ [WARN] Failed to forward message to Next.js endpoint: {http_err}")

        except Exception as err:
            print(f"❌ [ERROR] Error handling incoming WhatsApp message: {err}")

class DaemonHTTPHandler(BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        # Mute verbose HTTP logging
        return

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        if self.path == "/status":
            try:
                if (hasattr(client, "is_logged_in") and client.is_logged_in) or (hasattr(client, "is_connected") and client.is_connected):
                    whatsapp_state["connected"] = True
                    whatsapp_state["qr"] = None
                    if not whatsapp_state["phone"] or whatsapp_state["phone"] == "Unknown":
                        if hasattr(client, "me") and client.me and hasattr(client.me, "JID") and client.me.JID:
                            whatsapp_state["phone"] = client.me.JID.User
                        else:
                            whatsapp_state["phone"] = "Active"
            except Exception as st_err:
                print(f"[WARN] Error inspecting client status in do_GET: {st_err}")

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps(whatsapp_state).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == "/send":
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data.decode("utf-8"))
                target_jid = data.get("jid") or data.get("to")
                message_text = data.get("message")

                if not target_jid or not message_text:
                    self.send_response(400)
                    self.send_header("Content-Type", "application/json")
                    self.send_header("Access-Control-Allow-Origin", "*")
                    self.end_headers()
                    self.wfile.write(json.dumps({"success": False, "error": "Missing jid or message"}).encode("utf-8"))
                    return

                # Clean JID format & ensure 10-digit numbers get 91 country code prefix
                raw_user = target_jid.split("@")[0].replace("+", "").replace(" ", "").replace("-", "").strip()
                if len(raw_user) == 10 and raw_user.isdigit():
                    raw_user = "91" + raw_user

                jid_obj = build_jid(raw_user, "s.whatsapp.net")

                outbound_queue.put((jid_obj, message_text, raw_user))
                print(f"📥 [OUTBOUND ENQUEUED] Target: {raw_user}@s.whatsapp.net | Queue size: {outbound_queue.qsize()}")

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True}).encode("utf-8"))
            except Exception as err:
                print(f"❌ [ERROR] Failed to send WhatsApp message: {err}")
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(err)}).encode("utf-8"))
        elif self.path in ("/disconnect", "/reset"):
            try:
                client.disconnect()
                whatsapp_state["connected"] = False
                whatsapp_state["phone"] = None
                whatsapp_state["qr"] = None
                
                # Delete session db files if exist
                for fpath in [CLIENT_DB_PATH, CLIENT_DB_PATH + "-wal", CLIENT_DB_PATH + "-shm", CLIENT_DB_PATH + "-journal"]:
                    if os.path.exists(fpath):
                        try:
                            os.remove(fpath)
                            print(f"🗑️ [DISCONNECTED] Deleted local session database file: {fpath}")
                        except Exception as del_err:
                            print(f"[WARN] Could not remove session db {fpath}: {del_err}")

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "status": whatsapp_state}).encode("utf-8"))
            except Exception as err:
                self.send_response(500)
                self.send_header("Content-Type", "application/json")
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(err)}).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

def run_http_server():
    server_address = ('', 5001)
    httpd = HTTPServer(server_address, DaemonHTTPHandler)
    print("🚀 [DAEMON SERVER] Daemon HTTP API listening on http://localhost:5001")
    httpd.serve_forever()

if __name__ == "__main__":
    setup_client_events(client)
    
    # Start HTTP API thread
    http_thread = threading.Thread(target=run_http_server, daemon=True)
    http_thread.start()

    print("⚡ [WHATSAPP CLIENT] Connecting client to WhatsApp Web...")
    try:
        client.connect()
    except KeyboardInterrupt:
        print("\n👋 Stopping WhatsApp daemon...")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Connection error: {e}")
