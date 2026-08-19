import os
import subprocess
import webbrowser
import threading
import datetime
import random
import requests
import streamlit as st
from openai import OpenAI
import pyttsx3

# Page configuration
st.set_page_config(page_title="TRUE ADAM • Core OS", page_icon="⚡", layout="wide")

# --- CLEAN MODERN CSS ---
st.markdown("""
    <style>
    .stApp {
        background-color: #03050a;
        background-image: radial-gradient(circle at 50% 30%, #0d1b2a 0%, #03050a 80%);
        color: #e0f2fe;
        font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }
    [data-testid="stSidebar"] {
        background-color: #050b14;
        border-right: 1px solid #0284c7;
    }
    h1 {
        text-align: center;
        letter-spacing: 3px;
        font-weight: 800;
        color: #38bdf8;
        margin-bottom: 0px;
    }
    .subtitle {
        text-align: center;
        color: #7dd3fc;
        font-size: 0.9rem;
        letter-spacing: 1px;
        margin-bottom: 20px;
    }
    .stChatMessage {
        background-color: #07111e !important;
        border: 1px solid #0369a1 !important;
        border-radius: 8px !important;
        color: #bae6fd !important;
    }
    </style>
""", unsafe_allow_html=True)

# --- CLIENT SETUP WITH PLACEHOLDER ---
# Friend: Replace "YOUR_GROQ_API_KEY_HERE" with your actual Groq API key!
client = OpenAI(
    api_key="YOUR_GROQ_API_KEY_HERE",
    base_url="https://api.groq.com/openai/v1"
)
model = 'openai/gpt-oss-20b'

# Initialize private session history (isolated per user)
if "messages" not in st.session_state:
    st.session_state.messages = []

def speak_text(text):
    def run_speech():
        try:
            engine = pyttsx3.init()
            engine.say(text)
            engine.runAndWait()
        except Exception:
            pass
    t = threading.Thread(target=run_speech, daemon=True)
    t.start()

def get_weather():
    try:
        res = requests.get("https://wttr.in/?format=%C+%t", timeout=3)
        if res.status_code == 200:
            return res.text.strip()
    except Exception:
        pass
    return "Unavailable"

# --- SMART UNIVERSAL WEBSITE & APP ROUTER ---
def handle_website_and_apps(prompt):
    p_lower = prompt.lower().strip()
    
    if "open" in p_lower:
        target = p_lower.replace("open", "").replace("the", "").replace("please", "").strip()
        
        shortcuts = {
            "google docs": "https://docs.google.com",
            "docs": "https://docs.google.com",
            "youtube": "https://www.youtube.com",
            "google": "https://www.google.com",
            "github": "https://www.github.com",
            "reddit": "https://www.reddit.com",
            "chatgpt": "https://chatgpt.com",
            "twitter": "https://www.twitter.com",
            "x": "https://www.x.com",
            "netflix": "https://www.netflix.com",
            "twitch": "https://www.twitch.tv",
            "spotify": "https://open.spotify.com",
            "gmail": "https://mail.google.com",
            "wikipedia": "https://www.wikipedia.org",
            "britannica": "https://www.britannica.com",
            "amazon": "https://www.amazon.com",
            "stackoverflow": "https://stackoverflow.com",
            "github": "https://github.com"
        }
        
        if target in shortcuts:
            webbrowser.open(shortcuts[target])
            return f"Opening {target.title()}. Locked in, W."
        
        elif "notepad" in target:
            subprocess.Popen(["notepad.exe"])
            return "Notepad online. Drop your lore."
        elif "calculator" in target or "calc" in target:
            subprocess.Popen(["calc.exe"])
            return "Calculator launched."
            
        elif target:
            clean_target = target.replace(" ", "")
            if "." not in clean_target:
                url = f"https://www.google.com/search?q={target}"
                webbrowser.open(url)
                return f"Couldn't guess the exact URL, so I pulled up a Google search for '{target}', bestie."
            else:
                url = f"https://{clean_target}"
                webbrowser.open(url)
                return f"Opening '{target}' for you, bestie."
            
    return None

def process_prompt(prompt):
    if not prompt.strip():
        return
    st.session_state.messages.append({"role": "user", "content": prompt})
    
    clean_prompt = prompt.lower()
    if clean_prompt.startswith("hey adam") or clean_prompt.startswith("adam"):
        prompt = prompt.replace("hey adam", "").replace("adam", "").strip()

    site_reply = handle_website_and_apps(prompt)
    if site_reply:
        ai_reply = f"🌐 **[System Action]:** {site_reply}"
        st.session_state.messages.append({"role": "assistant", "content": ai_reply})
        speak_text("Locked in.")
        return

    try:
        system_prompt = {
            "role": "system",
            "content": (
                "You are True Adam, an advanced local AI operating core. "
                "When asked to research a topic, write out a comprehensive, clean, beautifully formatted markdown report. "
                "You talk using modern internet slang, brainrot, and high-energy confidence (e.g., cooked, locked in, sigma, W, aura, bet, valid)."
            )
        }
        api_messages = [system_prompt] + [{"role": m["role"], "content": m["content"]} for m in st.session_state.messages[-10:]]
        response = client.chat.completions.create(
            model=model,
            messages=api_messages,
            max_tokens=1500,
            temperature=0.85,
        )
        ai_reply = response.choices[0].message.content
    except Exception as e:
        ai_reply = f"System error: {e}"

    st.session_state.messages.append({"role": "assistant", "content": ai_reply})
    speak_text("Locked in, check the screen.")

# --- UI RENDER ---
st.title("TRUE ADAM")
st.markdown('<p class="subtitle">LOCAL CORE • AUTONOMOUS OS ASSISTANT</p>', unsafe_allow_html=True)

# --- SIDEBAR CONTROLS ---
with st.sidebar:
    st.header("⚡ Core Controls")
    
    if st.button("🛑 Stop Speaking", use_container_width=True, type="primary"):
        try:
            pyttsx3.init().stop()
            st.toast("Adam's voice cut off.")
        except Exception:
            pass

    st.markdown("---")
    st.header("🎙️ Voice Input")
    audio_file = st.audio_input("Record voice command")
    if audio_file is not None:
        st.info("Audio recorded! (Microphone data captured via browser).")

    st.markdown("---")
    st.header("🧹 History Management")
    if st.button("🗑️ Clear Chat History", use_container_width=True):
        st.session_state.messages = []
        st.toast("Chat history cleared.")
        st.rerun()

    st.markdown("---")
    st.header("🌤️ Diagnostics")
    st.markdown(f"**Vibe / Weather:** {get_weather()}")

    st.markdown("---")
    st.header("📝 Quick Notes")
    note_input = st.text_area("Jot down quick thoughts:")
    if st.button("Save Note to Desktop", use_container_width=True):
        if note_input.strip():
            try:
                desktop_path = os.path.join(os.path.expanduser("~"), "Desktop")
                notes_file = os.path.join(desktop_path, "adam_notes.txt")
                timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                with open(notes_file, "a", encoding="utf-8") as f:
                    f.write(f"[{timestamp}] {note_input.strip()}\n---\n")
                st.success("Saved to desktop!")
            except Exception as e:
                st.error(f"Error: {e}")

# --- CHAT STREAM CONTAINER ---
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# --- INPUT COMMAND DOCK ---
if prompt := st.chat_input("Type your command or query here..."):
    process_prompt(prompt)
    st.rerun()
