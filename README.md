# Portfolio

Personal portfolio of **Lại Đức Thanh Tùng** — Developer.

Built with plain HTML, CSS and JavaScript. No build step, no dependencies.

## Run locally

Open `index.html` directly in a browser, or serve the folder:

```powershell
cd portfolio
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Pages

- `index.html` — Home and Projects views (`#about` / `#projects`). Switching views does not reload the page, so background music keeps playing.
- `projects.html` — shortcut that redirects to `index.html#projects`.
- `style.css` — layout, colors and responsive styles.
- `script.js` — project data, hash routing, contact modal and music control.

## Music

`assets/music.mp3` plays in a loop. Press **Space** to toggle it (a hint is shown under the intro). The audio element stays alive when switching between Home and Projects.

## Images

- `image/avatar.jpg` — profile photo
- `image/bg.jpg` — background photo

This repository is private.
