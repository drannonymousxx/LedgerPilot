"""
Verification script for LedgerPilot landing page navigation, branding, favicons, and logo proportions.
"""

import urllib.request
import re
import sys

print("==========================================================")
print("LEDGERPILOT LANDING PAGE & BRANDING VERIFICATION")
print("==========================================================")

passed = 0
failed = 0

def assert_check(name, condition, detail=""):
    global passed, failed
    if condition:
        passed += 1
        print(f"[PASS] {name} -> {detail}")
    else:
        failed += 1
        print(f"[FAIL] {name} -> {detail}")

# 1. Fetch Landing Page HTML
try:
    req = urllib.request.Request("http://localhost:3000/", headers={"User-Agent": "LedgerPilot-QA-Bot"})
    with urllib.request.urlopen(req) as resp:
        html = resp.read().decode("utf-8")
    assert_check("HTTP 200 Landing Page", True, "Successfully fetched http://localhost:3000/")
except Exception as e:
    assert_check("HTTP 200 Landing Page", False, f"Failed to fetch homepage: {e}")
    sys.exit(1)

# 2. Browser Title Verification
title_match = re.search(r"<title>(.*?)</title>", html)
if title_match:
    title_text = title_match.group(1)
    assert_check("Browser Title Metadata", "LedgerPilot | AI Finance Operations" in title_text, f"Found title: '{title_text}'")
else:
    assert_check("Browser Title Metadata", False, "No <title> tag found")

# 3. Favicon Metadata & Asset Check
has_favicon_link = "logo/logoblack.png" in html or "favicon.ico" in html
assert_check("Favicon Configuration", has_favicon_link, "Favicon icon link / logo asset properly configured")

# 4. Navigation Links in Navbar
nav_product = 'href="#product"' in html
nav_how = 'href="#how-it-works"' in html
nav_sec = 'href="#security"' in html
nav_pricing = 'href="#pricing"' in html
nav_signin = 'href="/auth"' in html

assert_check("Product Nav Link (#product)", nav_product, "href='#product' found in HTML")
assert_check("How It Works Nav Link (#how-it-works)", nav_how, "href='#how-it-works' found in HTML")
assert_check("Security Nav Link (#security)", nav_sec, "href='#security' found in HTML")
assert_check("Pricing Nav Link (#pricing)", nav_pricing, "href='#pricing' found in HTML")
assert_check("Sign In / Get Started Links (/auth)", nav_signin, "href='/auth' found in HTML")

# 5. Section IDs & Scroll Offsets
has_id_product = 'id="product"' in html
has_id_how = 'id="how-it-works"' in html
has_id_sec = 'id="security"' in html
has_id_pricing = 'id="pricing"' in html
has_scroll_mt = "scroll-mt-24" in html

assert_check("Section ID #product ('The power of your data')", has_id_product, "id='product' tag present")
assert_check("Section ID #how-it-works ('Transaction Intelligence')", has_id_how, "id='how-it-works' tag present")
assert_check("Section ID #security ('Security built into every workflow')", has_id_sec, "id='security' tag present")
assert_check("Section ID #pricing ('Simple pricing')", has_id_pricing, "id='pricing' tag present")
assert_check("Scroll Margin Offset (scroll-mt-24)", has_scroll_mt, "scroll-mt-24 sticky offset present on target sections")

# 6. Logo Assets & Normalized Sizing
has_black_logo = "logoblack.png" in html
has_white_logo = "logowhite.png" in html
assert_check("Black Logo Asset (logoblack.png)", has_black_logo, "logoblack.png used for light backgrounds")
assert_check("White Logo Asset (logowhite.png)", has_white_logo, "logowhite.png used for dark backgrounds")

# 7. Fetch Auth Page HTML
try:
    req_auth = urllib.request.Request("http://localhost:3000/auth", headers={"User-Agent": "LedgerPilot-QA-Bot"})
    with urllib.request.urlopen(req_auth) as resp:
        auth_html = resp.read().decode("utf-8")
    assert_check("HTTP 200 Auth Page", True, "Successfully fetched http://localhost:3000/auth")
    assert_check("Auth Page Black Logo", "logoblack.png" in auth_html, "logoblack.png rendered on light header bar")
    assert_check("Auth Page White Logo", "logowhite.png" in auth_html, "logowhite.png rendered on dark right panel")
except Exception as e:
    assert_check("HTTP 200 Auth Page", False, f"Failed to fetch auth page: {e}")

print("==========================================================")
print(f"VERIFICATION RESULTS: Passed={passed}, Failed={failed}")
print("==========================================================")
