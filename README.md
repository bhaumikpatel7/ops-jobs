# CivicPath

A private, static Ontario provincial and municipal job application workspace.

Serve `dist/` over HTTP. All resume reading, coverage analysis, evidence-based draft preparation, Word/ZIP export and storage run in the browser. No accounts, employer integrations, model API keys or server-side resume processing are used. Listings are verified snapshots, not a live feed. Add postings manually from official employer portals. No application is submitted by this website.

Local resume rules retain the original resume and add a source-backed qualifications section. The editable keyword score is literal coverage with normalization, not an employer ATS score or eligibility decision. The user must verify all claims and application requirements.

Resume and draft text remain in memory unless the user enables remembering on the device. Other workspace metadata and profile fields use localStorage. Explicit backup export includes personal text. Downloads use native local ZIP/DOCX generation.

Runtime vendor libraries: Mammoth.js (BSD-2-Clause), PDF.js (Apache-2.0), bundled locally in dist/vendor with licences. Typography uses Google Fonts with system fallbacks.

## Run locally

Clone or download this repository, then run from its root directory:

```sh
python3 -m http.server 8080 --directory dist
```

Open http://localhost:8080 in a modern browser. There is no install step or build step; the runtime vendor libraries are included. Serve the files over HTTP instead of opening `index.html` directly, because the application uses JavaScript modules and a PDF worker.

## Host the site

Deploy the contents of `dist/` to a static host. This portable source package excludes the original Sites deployment identity. Configure your host's access controls if the site should be private; the static application does not include its own login system.

The curated job data is in `dist/jobs.js`; page behavior is in `dist/app.js`, resume and document tools are in `dist/engine.js`, and appearance is in `dist/styles.css`.

