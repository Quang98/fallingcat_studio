import urllib.request
import json
import os
import re

# Tạo thư mục lưu logo
os.makedirs("logothumbnail", exist_ok=True)

games = [
    {
        "name": "Arcane Hunter: Soul Survivor",
        "link_ios": "https://apps.apple.com/vn/app/arcane-hunter-soul-survivor/id6740374474",
        "link_android": "https://play.google.com/store/apps/details?id=com.itcgamestudio.arcane.hunter.soul.survivor.monster.action.shooter.rpg",
        "filename": "Logo_ArcaneHunter.png"
    },
    {
        "name": "Vampire Hunter: Legends Rising",
        "link_ios": "https://apps.apple.com/vn/app/vampire-hunter-legends-rising/id6503144798",
        "link_android": "https://play.google.com/store/apps/details?id=com.itcgamestudio.vampirehunter.legends.rising",
        "filename": "Logo_VampireHunter.png"
    },
    {
        "name": "My Tiny Shop: Relaxing Decor",
        "link_ios": "https://apps.apple.com/vn/app/my-tiny-shop-relaxing-decor/id6755370982",
        "link_android": "https://play.google.com/store/apps/details?id=com.itcgamestudio.roomdecor.simulation",
        "filename": "Logo_MyTinyShop.png"
    },
    {
        "name": "ChocoBento Puzzle",
        "link_ios": "https://apps.apple.com/vn/app/chocobento-puzzle/id6755371072",
        "link_android": "https://play.google.com/store/apps/details?id=com.itcgamestudio.chocobento.puzzle",
        "filename": "Logo_ChocoBento.png"
    },
    {
        "name": "Backpack Apocalypse",
        "link_ios": "",
        "link_android": "https://play.google.com/store/apps/details?id=com.itcgamestudio.backpack.apocalypse",
        "filename": "Logo_BackpackApocalypse.png"
    },
    {
        "name": "Windy Memories",
        "link_ios": "",
        "link_android": "https://play.google.com/store/apps/details?id=com.itcgamestudio.windy.memories",
        "filename": "Logo_WindyMemories.png"
    },
    {
        "name": "Doom Strider",
        "link_ios": "https://apps.apple.com/vn/app/doomstrider-battlebag-heroes/id6740755923",
        "link_android": "",
        "filename": "Logo_DoomStrider.png"
    },
    {
        "name": "Dango Sort - Color Match Puzzle",
        "link_ios": "https://apps.apple.com/vn/app/dango-sort-color-puzzle-game/id6615064806",
        "link_android": "",
        "filename": "Logo_DangoSort.png"
    },
    {
        "name": "Zombie Hunt 3D: Run & Shooting",
        "link_ios": "https://apps.apple.com/vn/app/zombie-hunt-3d-run-shooting/id6479971957",
        "link_android": "",
        "filename": "Logo_ZombieHunt.png"
    },
    {
        "name": "Space Astro Cat: Brick Breaker",
        "link_ios": "https://apps.apple.com/vn/app/space-astro-cat-brick-breaker/id6504403514",
        "link_android": "",
        "filename": "Logo_SpaceAstroCat.png"
    },
    {
        "name": "Cat Screw Puzzle: Nuts & Bolts",
        "link_ios": "https://apps.apple.com/vn/app/cat-screw-puzzle-nuts-bolts/id6480040525",
        "link_android": "",
        "filename": "Logo_CatScrewPuzzle.png"
    },
    {
        "name": "My Perfect Sushi: Drop & Merge",
        "link_ios": "https://apps.apple.com/vn/app/my-perfect-sushi-drop-merge/id6479974597",
        "link_android": "",
        "filename": "Logo_MyPerfectSushi.png"
    },
]

def extract_ios_id(url):
    match = re.search(r'/id(\d+)', url)
    return match.group(1) if match else None

def download_ios_icon(app_id, filename):
    api_url = f"https://itunes.apple.com/lookup?id={app_id}"
    req = urllib.request.Request(api_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=10) as r:
        data = json.loads(r.read())
    if data["resultCount"] == 0:
        print(f"  ❌ Không tìm thấy app id={app_id}")
        return False
    icon_url = data["results"][0].get("artworkUrl512") or data["results"][0].get("artworkUrl100")
    if not icon_url:
        print(f"  ❌ Không có URL icon")
        return False
    req2 = urllib.request.Request(icon_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req2, timeout=10) as r:
        with open(f"logothumbnail/{filename}", "wb") as f:
            f.write(r.read())
    print(f"  ✅ Đã tải: logothumbnail/{filename}")
    return True

def download_android_icon(package_id, filename):
    # Google Play không có API công khai, dùng icon CDN không chính thức
    icon_url = f"https://play-lh.googleusercontent.com/a/app-icon?id={package_id}&hl=vi"
    # Fallback: scrape trang Play Store
    store_url = f"https://play.google.com/store/apps/details?id={package_id}&hl=vi"
    req = urllib.request.Request(store_url, headers={
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    })
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            html = r.read().decode("utf-8", errors="ignore")
        # Tìm URL icon trong HTML
        match = re.search(r'"(https://play-lh\.googleusercontent\.com/[^"]+)".*?role="img"', html)
        if not match:
            match = re.search(r'src="(https://play-lh\.googleusercontent\.com/[^"]+)"', html)
        if match:
            img_url = match.group(1).replace("\\u003d", "=").replace("\\u0026", "&")
            # Lấy ảnh lớn nhất
            img_url = re.sub(r'=w\d+-h\d+', '=w512-h512', img_url)
            req2 = urllib.request.Request(img_url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req2, timeout=10) as r:
                with open(f"logothumbnail/{filename}", "wb") as f:
                    f.write(r.read())
            print(f"  ✅ Đã tải: logothumbnail/{filename}")
            return True
        else:
            print(f"  ❌ Không tìm thấy icon trong trang Play Store")
            return False
    except Exception as e:
        print(f"  ❌ Lỗi: {e}")
        return False

print("=" * 50)
print("Bắt đầu tải logo các game...")
print("=" * 50)

for game in games:
    print(f"\n🎮 {game['name']}")
    filepath = f"logothumbnail/{game['filename']}"

    # Nếu file đã tồn tại thì bỏ qua
    if os.path.exists(filepath):
        print(f"  ⏭️  Đã có sẵn, bỏ qua")
        continue

    # Ưu tiên tải từ iOS (chất lượng cao hơn, API dễ hơn)
    if game["link_ios"]:
        app_id = extract_ios_id(game["link_ios"])
        if app_id:
            print(f"  📱 Tải từ App Store (id={app_id})...")
            if download_ios_icon(app_id, game["filename"]):
                continue

    # Fallback: tải từ Android
    if game["link_android"]:
        pkg = re.search(r'id=([^&]+)', game["link_android"])
        if pkg:
            print(f"  🤖 Tải từ Google Play ({pkg.group(1)})...")
            download_android_icon(pkg.group(1), game["filename"])

print("\n" + "=" * 50)
print("Hoàn tất! Kiểm tra thư mục logothumbnail/")
print("=" * 50)
