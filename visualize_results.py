"""
visualize_results.py
─────────────────────────────────────────────────────────
Picks images from the test dataset, sends them to the
/classify API, and generates a visual HTML report showing:
  - The original image
  - Predicted class + confidence
  - Correct / Wrong label
  - Bin color guidance

Run: python visualize_results.py
Then open: results/report.html
─────────────────────────────────────────────────────────
"""

import random
import base64
import requests
from pathlib import Path

API_URL   = "http://localhost:8000/classify"
TEST_DIR  = Path("data/processed/test")
OUT_DIR   = Path("results")
OUT_DIR.mkdir(exist_ok=True)
SAMPLES   = 4  # images per class

BIN_COLORS = {
    "plastic":  ("#FFD700", "#000"),   # yellow bg, black text
    "paper":    ("#1E90FF", "#fff"),   # blue
    "glass":    ("#32CD32", "#fff"),   # green
    "metal":    ("#888888", "#fff"),   # grey
    "organic":  ("#8B4513", "#fff"),   # brown
    "e-waste":  ("#DC143C", "#fff"),   # red
}

def img_to_b64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()

def classify(img_path):
    with open(img_path, "rb") as f:
        r = requests.post(API_URL, files={"file": (img_path.name, f, "image/jpeg")}, timeout=30)
    return r.json() if r.status_code == 200 else None

classes = sorted([d.name for d in TEST_DIR.iterdir() if d.is_dir()])

cards_html = []
total, correct = 0, 0

for cls in classes:
    cls_dir = TEST_DIR / cls
    images  = list(cls_dir.glob("*.jpg")) + list(cls_dir.glob("*.png"))
    if not images:
        continue

    samples = random.sample(images, min(SAMPLES, len(images)))
    for img_path in samples:
        result = classify(img_path)
        if not result:
            continue

        predicted  = result["predicted_class"]
        confidence = result["confidence"]
        is_correct = predicted == cls
        is_conf    = result["is_confident"]
        guidance   = result.get("guidance") or {}
        bin_color  = guidance.get("bin_color", "grey")
        bin_emoji  = guidance.get("bin_emoji", "⬜")

        total += 1
        if is_correct:
            correct += 1

        bg, fg = BIN_COLORS.get(predicted, ("#888", "#fff"))
        border = "#22c55e" if is_correct else "#ef4444"
        label  = "✅ Correct" if is_correct else f"❌ Wrong (is: {cls})"
        conf_pct = f"{confidence:.0%}"

        b64 = img_to_b64(img_path)
        ext = img_path.suffix.lstrip(".")

        card = f"""
        <div class="card" style="border: 3px solid {border};">
          <img src="data:image/{ext};base64,{b64}" alt="{cls}">
          <div class="label-tag" style="background:{bg}; color:{fg};">
            {bin_emoji} {predicted.upper()} — {conf_pct}
          </div>
          <div class="meta">
            <span class="verdict">{label}</span>
            <span class="true-class">True class: <b>{cls}</b></span>
            {"<span class='low-conf'>⚠️ Low confidence</span>" if not is_conf else ""}
          </div>
        </div>"""
        cards_html.append(card)
        print(f"  {'✅' if is_correct else '❌'}  [{cls:<10}] → {predicted:<10} | {conf_pct}")

accuracy = correct / total * 100 if total else 0
print(f"\n📊 {correct}/{total} correct ({accuracy:.1f}%)")

HTML = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Smart Recycling AI — Results</title>
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{
    font-family: 'Segoe UI', sans-serif;
    background: #0f172a;
    color: #e2e8f0;
    padding: 2rem;
  }}
  h1 {{ font-size: 2rem; margin-bottom: 0.5rem; }}
  .subtitle {{ color: #94a3b8; margin-bottom: 0.5rem; }}
  .stats {{
    display: inline-block;
    background: #1e293b;
    border-radius: 12px;
    padding: 1rem 2rem;
    margin-bottom: 2rem;
    font-size: 1.2rem;
  }}
  .stats span {{ color: #22c55e; font-weight: bold; font-size: 1.5rem; }}
  .grid {{
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1.2rem;
  }}
  .card {{
    background: #1e293b;
    border-radius: 14px;
    overflow: hidden;
    transition: transform 0.2s;
  }}
  .card:hover {{ transform: translateY(-4px); }}
  .card img {{
    width: 100%;
    height: 180px;
    object-fit: cover;
    display: block;
  }}
  .label-tag {{
    padding: 0.5rem 1rem;
    font-weight: 700;
    font-size: 0.95rem;
    letter-spacing: 0.05em;
  }}
  .meta {{
    padding: 0.6rem 1rem 0.8rem;
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    font-size: 0.85rem;
  }}
  .verdict {{ font-weight: 600; }}
  .true-class {{ color: #94a3b8; }}
  .low-conf {{ color: #f59e0b; }}
</style>
</head>
<body>
  <h1>🌿 Smart Recycling AI — Visual Results</h1>
  <p class="subtitle">EfficientNet-B2 | 94.92% trained accuracy | Testing on local dataset</p>
  <div class="stats">
    Accuracy on this sample: <span>{accuracy:.1f}%</span> &nbsp;({correct}/{total} correct)
  </div>
  <div class="grid">
    {"".join(cards_html)}
  </div>
</body>
</html>"""

report_path = OUT_DIR / "report.html"
report_path.write_text(HTML)
print(f"\n🌐 Report saved → {report_path.resolve()}")
print("   Open it in your browser!\n")

import webbrowser
webbrowser.open(str(report_path.resolve()))
