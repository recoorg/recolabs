import os
from PIL import Image, ImageDraw, ImageFont

# Dimension standard for Twitter Summary Large Image and Open Graph
WIDTH, HEIGHT = 1200, 630

# Reco Labs Color Palette
BG_COLOR = (12, 12, 14)       # Deep slate zinc
CARD_BG = (20, 20, 24)        # Card backdrop
BORDER_COLOR = (39, 39, 42)   # Subtle border zinc-800
ACCENT_ORANGE = (250, 93, 0)  # #FA5D00
TEXT_WHITE = (250, 250, 250)  # Pure off-white
TEXT_MUTED = (161, 161, 170)  # Zinc-400
TEXT_DIM = (113, 113, 122)    # Zinc-500
GRID_DOT = (28, 28, 33)

# Fonts
FONT_TITLE_PATH = "C:/Windows/Fonts/bahnschrift.ttf"
FONT_MONO_PATH = "C:/Windows/Fonts/consola.ttf"
FONT_SANS_PATH = "C:/Windows/Fonts/segoeui.ttf"

font_logo = ImageFont.truetype(FONT_TITLE_PATH, 28)
font_badge = ImageFont.truetype(FONT_MONO_PATH, 16)
font_title = ImageFont.truetype(FONT_TITLE_PATH, 54)
font_subtitle = ImageFont.truetype(FONT_SANS_PATH, 24)
font_footer = ImageFont.truetype(FONT_MONO_PATH, 18)

favicon_path = "public/favicon.png"
favicon_img = None
if os.path.exists(favicon_path):
    favicon_img = Image.open(favicon_path).convert("RGBA").resize((48, 48), Image.Resampling.LANCZOS)

pages = [
    {
        "filename": "twitter-image.png",
        "eyebrow": "// GLOBAL BUILDER GUILD",
        "title": "Reco Labs",
        "subtitle": "The Skill Exchange for curious Mind. A collective of young hackers shipping software & hardware.",
        "badge": "recolabs.in",
        "stat": "Global Network"
    },
    {
        "filename": "twitter-home.png",
        "eyebrow": "// GLOBAL BUILDER GUILD",
        "title": "Reco Labs",
        "subtitle": "The Skill Exchange for curious Mind. A collective of young hackers shipping software & hardware.",
        "badge": "recolabs.in",
        "stat": "Global Network"
    },
    {
        "filename": "twitter-projects.png",
        "eyebrow": "// CURATED CATALOGUE",
        "title": "Projects | Reco Labs",
        "subtitle": "190+ hand-picked design systems, open source tools, terminal utilities, and engineering rigs.",
        "badge": "190+ Projects",
        "stat": "Curated Daily"
    },
    {
        "filename": "twitter-network.png",
        "eyebrow": "// FOUNDER & BUILDER NETWORK",
        "title": "Network | Reco Labs",
        "subtitle": "Showcase your startup, launch projects, discover co-founders, and connect with credible builders.",
        "badge": "Builder Profiles",
        "stat": "Peer Showcase"
    },
    {
        "filename": "twitter-about.png",
        "eyebrow": "// STORY & COLLECTIVE",
        "title": "About | Reco Labs",
        "subtitle": "From high school experiment to global guild. Founded by Aditya Raj & Tanish to empower young makers.",
        "badge": "Origin Story",
        "stat": "The Guild"
    },
    {
        "filename": "twitter-jobs.png",
        "eyebrow": "// OPPORTUNITIES",
        "title": "Jobs | Reco Labs",
        "subtitle": "Work with fast-moving startups and developer tool founders. Internships, gigs, and full-time roles.",
        "badge": "Hiring Board",
        "stat": "High-Velocity"
    },
    {
        "filename": "twitter-hackathons.png",
        "eyebrow": "// BUILD SPRINT",
        "title": "Hackathons | Reco Labs",
        "subtitle": "Curated hackathons for high school hackers and collegiate builders. Ship projects, win grants, meet peers.",
        "badge": "Hackathons",
        "stat": "Active Sprints"
    },
    {
        "filename": "twitter-sponsors.png",
        "eyebrow": "// PARTNERSHIPS",
        "title": "Sponsors | Reco Labs",
        "subtitle": "Support the next generation of builders. Transparent community sponsorship and founder visibility.",
        "badge": "Sponsorship",
        "stat": "Partner With Us"
    },
]

def render_card(data):
    im = Image.new("RGBA", (WIDTH, HEIGHT), color=BG_COLOR)
    draw = ImageDraw.Draw(im)

    # 1. Subtle dot grid background
    step = 40
    for x in range(0, WIDTH, step):
        for y in range(0, HEIGHT, step):
            draw.point((x, y), fill=GRID_DOT)

    # 2. Main sleek container frame
    margin = 48
    card_w = WIDTH - (margin * 2)
    card_h = HEIGHT - (margin * 2)
    draw.rounded_rectangle(
        [(margin, margin), (margin + card_w, margin + card_h)],
        radius=24,
        fill=CARD_BG,
        outline=BORDER_COLOR,
        width=2
    )

    # 3. Top accent hairline
    draw.line([(margin + 24, margin + 2), (margin + card_w - 24, margin + 2)], fill=ACCENT_ORANGE, width=3)

    # 4. Header: Favicon + Brand Name + Eyebrow Badge
    brand_x = margin + 40
    brand_y = margin + 40
    if favicon_img:
        im.paste(favicon_img, (brand_x, brand_y), favicon_img)
        brand_text_x = brand_x + 58
    else:
        brand_text_x = brand_x

    draw.text((brand_text_x, brand_y + 8), "Reco Labs", fill=TEXT_WHITE, font=font_logo)

    # Right badge
    badge_text = data["stat"]
    badge_w = len(badge_text) * 11 + 32
    badge_x = margin + card_w - 40 - badge_w
    badge_y = brand_y + 6
    draw.rounded_rectangle(
        [(badge_x, badge_y), (badge_x + badge_w, badge_y + 36)],
        radius=18,
        fill=(30, 30, 36),
        outline=BORDER_COLOR,
        width=1
    )
    # Orange pulse dot in badge
    draw.ellipse([(badge_x + 14, badge_y + 13), (badge_x + 22, badge_y + 21)], fill=ACCENT_ORANGE)
    draw.text((badge_x + 30, badge_y + 8), badge_text, fill=TEXT_WHITE, font=font_badge)

    # 5. Eyebrow Category
    eyebrow_y = margin + 140
    draw.text((margin + 40, eyebrow_y), data["eyebrow"], fill=ACCENT_ORANGE, font=font_badge)

    # 6. Main Title
    title_y = eyebrow_y + 36
    draw.text((margin + 40, title_y), data["title"], fill=TEXT_WHITE, font=font_title)

    # 7. Subtitle / Pitch
    sub_y = title_y + 85
    # Word wrap subtitle
    words = data["subtitle"].split()
    line1, line2 = "", ""
    for w in words:
        if len(line1) + len(w) + 1 <= 56:
            line1 = (line1 + " " + w).strip()
        else:
            line2 = (line2 + " " + w).strip()

    draw.text((margin + 40, sub_y), line1, fill=TEXT_MUTED, font=font_subtitle)
    if line2:
        draw.text((margin + 40, sub_y + 36), line2, fill=TEXT_MUTED, font=font_subtitle)

    # 8. Bottom Footer Bar inside card
    foot_y = margin + card_h - 70
    draw.line([(margin + 40, foot_y - 20), (margin + card_w - 40, foot_y - 20)], fill=BORDER_COLOR, width=1)
    
    draw.text((margin + 40, foot_y), "https://recolabs.in", fill=TEXT_WHITE, font=font_footer)
    draw.text((margin + 260, foot_y), "·", fill=TEXT_DIM, font=font_footer)
    draw.text((margin + 285, foot_y), "The Skill Exchange for curious Mind", fill=TEXT_DIM, font=font_footer)

    badge_right = data["badge"]
    draw.text((margin + card_w - 40 - (len(badge_right) * 11), foot_y), badge_right, fill=ACCENT_ORANGE, font=font_footer)

    # Save as high-performance PNG
    out_path = os.path.join("public", data["filename"])
    # Convert back to RGB for standard web image preview
    rgb_im = im.convert("RGB")
    rgb_im.save(out_path, format="PNG", optimize=True)
    size_kb = os.path.getsize(out_path) / 1024
    print(f"Generated {out_path} ({size_kb:.1f} KB)")

for p in pages:
    render_card(p)

# Also copy twitter-image.png to og-image.png for standard OpenGraph
og_path = os.path.join("public", "og-image.png")
im_og = Image.open(os.path.join("public", "twitter-image.png"))
im_og.save(og_path, format="PNG", optimize=True)
print(f"Generated {og_path}")
