# Vtrans — Vercel-ready version

## What changed from the original

1. **No more server-side microphone.** `sr.Microphone()` cannot work on a
   serverless platform — there's no hardware mic and no persistent process.
   Speech-to-text now happens **in the browser** using the built-in
   [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
   (`public/script.js`). The recognized text is sent to Flask, which still
   handles translation and text-to-speech exactly as before.
2. **`/tmp` for file writes.** Vercel functions can only write to `/tmp`,
   and each request gets a unique filename (`uuid4`) since concurrent
   requests are possible.
3. **Static assets live in `public/`**, not Flask's `static/` folder —
   this is required by Vercel's Python runtime. Templates reference them
   as plain root paths like `/style.css` and `/images/logo.png`.

## Before you deploy

- Copy your actual image files into `public/images/` (LOGO.png, name.png,
  background.mp4, etc.) — they weren't included here since only the code
  files were provided.
- Web Speech API works best in Chrome/Edge. It also requires HTTPS, which
  Vercel gives you automatically.

## Deploy steps

1. Push this folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import
   the repo.
3. Leave the framework preset as "Other" — Vercel will detect the Python
   runtime automatically via `requirements.txt` and `api/index.py`.
4. Click **Deploy**. You'll get a live URL like `yourapp.vercel.app`.
5. To attach your free domain: project **Settings → Domains → Add**, then
   point your domain's DNS (CNAME or nameservers, depending on your
   registrar) at Vercel as instructed on that screen.

## Local testing

```bash
pip install -r requirements.txt
cd api
python index.py
```

Then open `http://localhost:5000`. Note: Flask's `render_template` looks
for `templates/` relative to where it's run, and static files are served
from `public/` only when deployed on Vercel — for local testing you may
want to temporarily symlink or copy `public/` contents so the browser can
fetch `/style.css` etc. (Vercel's dev CLI, `vercel dev`, handles this
automatically and is the more accurate way to test locally.)
