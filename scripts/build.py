#!/usr/bin/env python3
"""
Zero-dependency bundler that concatenates the modular ES6 source tree
into dist/bundle.js so the game runs both via HTTP ES modules and direct
file:// protocol opening.
"""

import os
import re

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODULE_ORDER = [
    "src/config/constants.js",
    "src/config/palette.js",
    "src/graphics/PixelFont.js",
    "src/core/SaveManager.js",
    "src/core/InputManager.js",
    "src/core/Camera.js",
    "src/core/PhysicsBody.js",
    "src/core/ParticleSystem.js",
    "src/audio/SoundEngine.js",
    "src/graphics/BackgroundRenderer.js",
    "src/graphics/SpriteRenderer.js",
    "src/entities/Enemy.js",
    "src/entities/Boss.js",
    "src/entities/Player.js",
    "src/world/stages.js",
    "src/world/LevelManager.js",
    "src/ui/HUDRenderer.js",
    "src/core/Game.js",
    "src/main.js",
]


def strip_module_syntax(code: str) -> str:
    s = re.sub(
        r'^\s*import\s+[\s\S]*?from\s+["\'][^"\']+["\'];?\s*$',
        "",
        code,
        flags=re.MULTILINE,
    )
    s = re.sub(r"^\s*export\s+default\s+", "", s, flags=re.MULTILINE)
    s = re.sub(
        r"^\s*export\s+(const|let|var|function|class)\s+",
        r"\1 ",
        s,
        flags=re.MULTILINE,
    )
    return s.strip()


def build() -> None:
    chunks = [
        "/**",
        " * Celestial Blade - Compiled Standalone Bundle",
        " * Auto-generated from src/ ES6 modules.",
        " */",
        "(() => {",
        '  "use strict";',
    ]

    for rel_path in MODULE_ORDER:
        full_path = os.path.join(ROOT_DIR, rel_path)
        with open(full_path, "r", encoding="utf-8") as f:
            raw = f.read()
        transformed = strip_module_syntax(raw)
        indented = "\n  ".join(transformed.splitlines())
        chunks.append(f"\n  // --- Module: {rel_path} ---\n  {indented}")

    chunks.append("})();\n")

    dist_dir = os.path.join(ROOT_DIR, "dist")
    os.makedirs(dist_dir, exist_ok=True)
    out_file = os.path.join(dist_dir, "bundle.js")
    with open(out_file, "w", encoding="utf-8") as f:
        f.write("\n".join(chunks))

    print(f"Built dist/bundle.js ({os.path.getsize(out_file)} bytes)")


if __name__ == "__main__":
    build()
