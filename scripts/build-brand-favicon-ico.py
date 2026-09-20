#!/usr/bin/env python3

from pathlib import Path
from PIL import Image

root = Path.cwd()
source = Image.open(root / "public/favicon-96x96.png").convert("RGBA")
source.save(root / "public/favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
print("Generated public/favicon.ico with 16, 32, and 48 pixel frames.")
