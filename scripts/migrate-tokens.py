#!/usr/bin/env python3
"""Bulk migrate hardcoded hex/size tokens to semantic Tailwind classes."""
import re
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "src"

SKIP_FILES = {
    "styles/theme.css",
    "styles/fonts.css",
    "styles/tailwind.css",
    "app/theme/palette.ts",
}

SKIP_DIRS = {"app/components/ui"}

def norm_hex(h):
    h = h.lower()
    if len(h) == 3:
        h = "".join(c * 2 for c in h)
    return h

# hex -> token name (without prefix)
BG_MAP = {
    "f7f8fa": "background", "f8fafc": "muted", "f1f5f9": "secondary",
    "fafbfc": "surface-subtle", "fafafa": "sidebar", "ffffff": "card", "fff": "card",
    "2463eb": "primary", "2563eb": "primary", "1f69b3": "primary",
    "1d4ed8": "primary-hover", "eff6ff": "primary-subtle", "dbeafe": "sidebar-accent",
    "e2e8f0": "muted", "fee2e2": "destructive-subtle", "fef2f2": "destructive-subtle",
    "dcfce7": "success-subtle", "fef3c7": "warning-subtle", "e0f2fe": "info-subtle",
    "f0fdf4": "success-subtle", "f5f3ff": "chart-3/10", "fafbff": "primary-subtle",
    "10b981": "success", "ef4444": "destructive", "f97316": "warning-strong",
    "f59e0b": "warning", "0ea5e9": "info", "8b5cf6": "chart-3", "3b82f6": "chart-2",
    "0f172a": "foreground-emphasis", "1e293b": "foreground", "64748b": "muted-foreground",
    "94a3b8": "text-subtle", "475569": "secondary-foreground", "334155": "secondary-foreground",
    "cbd5e1": "border-muted", "bfdbfe": "primary-subtle", "fecaca": "destructive-subtle",
    "fff7ed": "warning-subtle", "ecfdf5": "success-subtle", "f0f9ff": "info-subtle",
    "ffedd5": "warning-subtle", "fce7f3": "chart-4/10", "fef08a": "warning-subtle",
}

TEXT_MAP = {
    "1e293b": "foreground", "0f172a": "foreground-emphasis",
    "64748b": "muted-foreground", "94a3b8": "text-subtle",
    "475569": "secondary-foreground", "334155": "secondary-foreground",
    "cbd5e1": "border-muted", "2463eb": "primary", "2563eb": "primary", "1f69b3": "primary",
    "1d4ed8": "primary-text", "1e40af": "primary", "3b82f6": "chart-2",
    "10b981": "success", "059669": "success-text", "166534": "success-text",
    "ef4444": "destructive", "dc2626": "destructive-text", "b91c1c": "destructive-text",
    "f59e0b": "warning", "f97316": "warning-strong", "ea580c": "warning-strong",
    "c2410c": "warning-text", "b45309": "warning-text", "d97706": "warning-text",
    "0ea5e9": "info", "0284c7": "info", "8b5cf6": "chart-3", "ec4899": "chart-4",
    "ffffff": "primary-foreground", "fff": "primary-foreground",
    "60a5fa": "chart-2", "93c5fd": "chart-2", "6366f1": "chart-3",
    "eab308": "warning", "fbbf24": "warning", "facc15": "warning",
    "15803d": "success-text", "16a34a": "success", "a855f7": "chart-3",
    "1e3a8a": "primary", "0d9488": "primary", "22c55e": "success",
    "f87171": "destructive", "fdba74": "warning-strong",
}

BORDER_MAP = {
    "e2e8f0": "border", "cbd5e1": "border-muted", "f1f5f9": "sidebar-border",
    "2463eb": "primary", "2563eb": "primary", "1f69b3": "primary",
    "1d4ed8": "primary-hover", "bfdbfe": "primary", "fecaca": "destructive",
    "fee2e2": "destructive-subtle", "dbeafe": "sidebar-accent",
    "94a3b8": "border-muted", "64748b": "border-muted",
    "10b981": "success", "ef4444": "destructive", "f59e0b": "warning",
    "8b5cf6": "chart-3", "334155": "border-muted",
}

RING_MAP = {**{k: "ring" for k in ["2463eb", "2563eb", "1f69b3"]}, "cbd5e1": "border-muted"}

DIVIDE_MAP = {"e2e8f0": "border", "f1f5f9": "border"}

FILL_STROKE_MAP = {**BG_MAP, **TEXT_MAP}

SIZE_MAP = {
    "10px": "text-xs", "11px": "text-xs", "12px": "text-xs",
    "13px": "text-sm", "14px": "text-sm", "15px": "text-base",
    "16px": "text-base", "17px": "text-base", "18px": "text-lg",
    "20px": "text-xl", "22px": "text-xl", "24px": "text-2xl",
    "26px": "text-2xl", "28px": "text-3xl", "30px": "text-3xl",
    "32px": "text-3xl", "36px": "text-4xl", "38px": "text-4xl",
}

ROUNDED_MAP = {
    "4px": "rounded-xs", "8px": "rounded-md", "10px": "rounded-md",
    "12px": "rounded-md", "16px": "rounded-lg", "9999px": "rounded-full",
    "2px": "rounded-sm",
}

PREFIXES = r"(?:(?:hover|focus|focus-within|focus-visible|active|disabled|group-hover|peer-focus):)*"

def replace_color_util(content, prop, hex_val, opacity=""):
    h = norm_hex(hex_val)
    if prop in ("bg", "from", "to", "via"):
        token = BG_MAP.get(h, h)
    elif prop == "text":
        token = TEXT_MAP.get(h, h)
    elif prop in ("border", "outline", "decoration"):
        token = BORDER_MAP.get(h, h)
    elif prop == "ring":
        token = RING_MAP.get(h, "ring")
    elif prop == "divide":
        token = DIVIDE_MAP.get(h, "border")
    elif prop in ("fill", "stroke"):
        token = FILL_STROKE_MAP.get(h, h)
    else:
        token = BG_MAP.get(h) or TEXT_MAP.get(h) or h

    if token == h or not token.replace("/", "").replace("-", "").isalnum():
        return None  # keep original if unknown

    op = opacity or ""
    return f"{prop}-{token}{op}"


def migrate_content(text):
    # Color utilities: prefix-[#hex] or prefix-[#hex]/opacity
    def color_repl(m):
        prefix_chain = m.group(1) or ""
        prop = m.group(2)
        hex_val = m.group(3)
        opacity = m.group(4) or ""
        replacement = replace_color_util(text, prop, hex_val, opacity)
        if replacement:
            return f"{prefix_chain}{replacement}"
        return m.group(0)

    text = re.sub(
        rf"((?:hover:|focus:|focus-within:|focus-visible:|active:|disabled:|group-hover:|peer-focus:)*)"
        rf"(bg|text|border|ring|divide|fill|stroke|from|to|via|outline|decoration)-\[#([0-9a-fA-F]{{3,8}})\](?:/(\d+))?",
        color_repl,
        text,
        flags=re.I,
    )

    # shadow-[#2463eb] -> shadow-primary
    text = re.sub(r"shadow-\[#2463eb\](/\d+)?", r"shadow-primary\1", text, flags=re.I)
    text = re.sub(
        r"shadow-\[0_8px_32px_rgba\(36,99,235,0\.12\)\]",
        "shadow-primary",
        text,
    )

    # Text sizes
    for px, tw in SIZE_MAP.items():
        text = text.replace(f"text-[{px}]", tw)

    # Rounded arbitrary
    for px, tw in ROUNDED_MAP.items():
        text = text.replace(f"rounded-[{px}]", tw)

    # Common combos
    text = text.replace("bg-white", "bg-card")
    text = text.replace("divide-[#e2e8f0]", "divide-border")
    text = text.replace("divide-y divide-[#e2e8f0]", "divide-y divide-border")

    # Legacy blues in non-bracket contexts (stroke/fill attributes)
    text = re.sub(r'#1f69b3', 'var(--primary)', text, flags=re.I)
    text = re.sub(r'#2563eb', 'var(--primary)', text, flags=re.I)

    return text


def should_process(rel):
    if rel in SKIP_FILES:
        return False
    parts = Path(rel).parts
    if len(parts) >= 3 and parts[0] == "app" and parts[1] == "components" and parts[2] == "ui":
        return False
    return rel.endswith((".tsx", ".ts", ".css")) and "theme.css" not in rel


def main():
    changed = []
    for path in sorted(ROOT.rglob("*")):
        if not path.is_file():
            continue
        rel = str(path.relative_to(ROOT))
        if not should_process(rel):
            continue
        original = path.read_text(encoding="utf-8")
        migrated = migrate_content(original)
        if migrated != original:
            path.write_text(migrated, encoding="utf-8")
            changed.append(rel)
    print(f"Migrated {len(changed)} files")
    for c in changed:
        print(f"  {c}")


if __name__ == "__main__":
    main()
