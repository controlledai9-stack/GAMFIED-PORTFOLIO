# Moonlit Sanctuary — A Gamified Portfolio

Aarya Ajay Singh's interactive AI and data science portfolio, created for AWS Student Builder Challenge: Build Your Tech Superpower.

**Live website:** https://production.dcr7c0z3fb6xm.amplifyapp.com/

## The journey

Collect three skill crystals → explore the village → cross floating platforms → discover six projects → face a two-phase Guardian → reach Contact and the résumé.

Every mini-game has a skip control. Progress is saved in the browser, with separate start-new and resume options. Project screenshots expand in place.

## Run locally

Requires Node.js. No dependency installation or build step is needed.

```sh
node serve.cjs
```

Open the localhost URL printed by the server. Alternatively, serve this directory using a static HTTP server. Use HTTP rather than opening index.html as a local file.

## Architecture

- HTML/CSS and vanilla JavaScript for the interface, routes, and transitions.
- Canvas 2D and code-driven sprite animation for parkour and combat.
- Web Audio for music and sound effects.
- Hash routes for chapters; localStorage for saved progress.
- `game.js`: crystal collection, movement, and collision.
- `index.html`: page structure, illustrated village, and parkour.
- `work.js`: scroll checkpoints and lightning frame sequence.
- `boss-engine.js`, `boss-animation.js`, `boss.js`: combat and rendering.
- `journey.js`, `progress-state.js`, `journey-progress.js`: intro, transitions, persistence, and skips.
- `portfolio-details.js`, `project-captures.js`, `contact.js`: project evidence and profile details.

## AWS hosting

Hosted through AWS Amplify Hosting, production branch, US East (N. Virginia). The deployed ZIP contains the contents of this static website at its root, with index.html directly accessible. No backend or database is required. Use Amplify's manual deployment workflow to upload a ZIP of the runtime files; exclude `.git` and local development files.

## Credits

Created with AI coding assistance and AI-generated illustrated environments and pixel character assets. Gameplay, collisions, animation, and transitions are implemented in code. See AUDIO-SOURCES.md for audio provenance. Third-party assets retain their respective rights; this repository does not grant a blanket license to those assets.

Project screenshot captions state which interfaces were run locally and which external AI services were not invoked. The Power BI project links to its repository rather than presenting an unverified screenshot.
