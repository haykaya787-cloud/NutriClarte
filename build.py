"""Assemble the single-file site: src/app.html + src/i18n.js + src/app.js + logo.png."""
import base64, hashlib, pathlib, re
root = pathlib.Path(__file__).parent
logo = "data:image/png;base64," + base64.b64encode((root / "logo.png").read_bytes()).decode()
html = (root / "src/app.html").read_text()
html = html.replace("__LOGO__", logo)
html = html.replace("__I18N__", (root / "src/i18n.js").read_text())
html = html.replace("__APP__", (root / "src/app.js").read_text())
(root / "dist").mkdir(exist_ok=True)
(root / "dist/nutriclarte.html").write_text(html)  # artifact body (skeleton added at publish)
script = re.search(r"<script>(.*?)</script>", html, re.S).group(1)
sha = base64.b64encode(hashlib.sha256(script.encode()).digest()).decode()
# Content-Security-Policy: only this page's own script (pinned by hash), no third-party hosts.
# style-src keeps 'unsafe-inline' because the UI sets per-element CSS variables (style="--rc:...").
# When the contact form gets a real endpoint, add its origin to connect-src (and form-action if it posts directly).
csp = ("default-src 'self'; script-src 'sha256-" + sha + "'; style-src 'self' 'unsafe-inline'; "
       "img-src 'self' data:; font-src 'self'; connect-src 'self'; form-action 'self'; "
       "base-uri 'none'; object-src 'none'; frame-src 'none'; manifest-src 'self'; upgrade-insecure-requests")
full = ('<!doctype html>\n<html lang="fr-CA">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
        '<meta http-equiv="Content-Security-Policy" content="' + csp + '">\n'
        '<meta name="referrer" content="strict-origin-when-cross-origin">\n'
        '<link rel="icon" href="logo.png">\n'
        + html.replace("<style>", "<style>\nbody{margin:0}img{max-width:100%}[hidden]{display:none!important}", 1)
              .replace("\n<header", "\n</head>\n<body>\n<header", 1)
        + "\n</body>\n</html>\n")
(root / "index.html").write_text(full)
print("built", len(html) // 1024, "KB")
