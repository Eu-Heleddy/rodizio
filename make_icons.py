"""Gera os ícones do app Android a partir de icon.png (roda no GitHub Actions)."""
import glob, os, shutil
from PIL import Image

RES = "android/app/src/main/res"
src = Image.open("icon.png").convert("RGBA")
legacy = {"mdpi": 48, "hdpi": 72, "xhdpi": 96, "xxhdpi": 144, "xxxhdpi": 192}
fg = {"mdpi": 108, "hdpi": 162, "xhdpi": 216, "xxhdpi": 324, "xxxhdpi": 432}

for d in glob.glob(f"{RES}/mipmap-*"):
    shutil.rmtree(d)

for dens, size in legacy.items():
    out = f"{RES}/mipmap-{dens}"
    os.makedirs(out, exist_ok=True)
    img = src.resize((size, size), Image.LANCZOS)
    img.save(f"{out}/ic_launcher.png")
    img.save(f"{out}/ic_launcher_round.png")
    big = fg[dens]
    canvas = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    inner = int(big * 0.74)
    canvas.paste(src.resize((inner, inner), Image.LANCZOS), ((big - inner) // 2, (big - inner) // 2))
    canvas.save(f"{out}/ic_fg.png")

os.makedirs(f"{RES}/mipmap-anydpi-v26", exist_ok=True)
xml = """<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_fg"/>
</adaptive-icon>
"""
for n in ("ic_launcher.xml", "ic_launcher_round.xml"):
    open(f"{RES}/mipmap-anydpi-v26/{n}", "w").write(xml)

open(f"{RES}/values/ic_launcher_background.xml", "w").write(
    '<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#C00000</color>\n</resources>\n')
print("Ícones gerados.")
