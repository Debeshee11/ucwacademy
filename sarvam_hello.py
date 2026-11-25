import os
from sarvamai import SarvamAI

# Read the key from the environment; fall back to a plain .env file in this folder.
if not os.environ.get("SARVAM_API_KEY") and os.path.exists(".env"):
    for line in open(".env"):
        k, _, v = line.strip().partition("=")
        if k == "SARVAM_API_KEY" and v:
            os.environ[k] = v.strip().strip('"').strip("'")

key = os.environ.get("SARVAM_API_KEY")
if not key:
    raise SystemExit("SARVAM_API_KEY is empty. Paste your key into .env and run again.")

client = SarvamAI(api_subscription_key=key)
reply = client.chat.completions(
    model="sarvam-105b-conversations",
    messages=[{"role": "user", "content": "Say hello in one short sentence."}],
)
print(reply.choices[0].message.content)
