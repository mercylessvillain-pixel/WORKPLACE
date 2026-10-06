# Workbench — platform build report

Date: 2026-10-02 · Branch: `arena/01a0f680-careofuniverse`

This report covers turning a single-product codebase (an AI customer-service SaaS) into a
unified online-tools platform in which that product is one tool among many. The earlier
product's own report is kept at
[docs/report-ai-customer-service.md](docs/report-ai-customer-service.md); nothing in it was
invalidated — every one of its tests still passes.

Nothing below is claimed unless it was built *and* exercised by a test or a real run in a
browser.

---

## 1. Headline

| | |
| --- | --- |
| Tools working today | **96** across all 9 categories |
| Tools on the roadmap | **0** — every entry in the catalogue opens a working tool |
| Tools that run entirely in the browser | 81 |
| Tools that need the server | 15 (11 AI, Meeting Transcription, PDF text extraction, AI Customer Service, Video Downloader) |
| Tools that need credentials to work | 12 (the 11 AI tools and Meeting Transcription; the Video Downloader needs `VIMEO_ACCESS_TOKEN` only for Vimeo downloads, and works without it everywhere else) |
| Source files / lines in `src/` | 624 files · ~95,400 lines |
| Pages · API route handlers | 75 · 158 |
| Automated tests | 1,525 Vitest (90 files) + 67 Playwright (9 specs) |

---

## 2. Command results (actual output, this build)

| Command | Result |
| --- | --- |
| `npm install` | ✅ no errors |
| `npm run lint` | ✅ `✔ No ESLint warnings or errors` |
| `npm run typecheck` | ✅ `tsc --noEmit` — exit 0, includes tests and E2E specs |
| `npm test` | ✅ `Test Files 90 passed (90) · Tests 1525 passed (1525)` in 371 s |
| `npm run build` | ✅ `✓ Compiled successfully` · `✓ Generating static pages (228/228)` in 2 m 05 s, with the §70 quality-ladder guard running first from `prebuild` |
| `npm run e2e` | ✅ `66 passed (1.8m)` — Chromium against a production build. Run in CI, not on this machine: the sandbox cannot download a browser, so the output is quoted from run [37242404127](https://github.com/notryuzakiii67-tech/CareOfUniverse/actions/runs/37242404127) rather than reproduced here |

The Playwright run is nine specs: `tools`, `platform`, `mobile`, `video-downloader`,
`journey`, `smoke`, `api`, `isolation` and `widget`. `platform.spec.ts` is deliberately
unforgiving about the newest work — it rasterises a real two-page PDF with PDF.js and
checks the resulting bitmap is a real image, and it records a WebM clip inside the
browser, feeds it to Video → GIF and downloads the encoded GIF. `mobile.spec.ts` runs
sixteen of its tests at a phone viewport.

---

## 3. Tools implemented

The catalogue was built in this round, each tool with its engine unit-tested and its UI
driven by the shared tool shell. Later rounds added to it rather than replacing it, and
the counts below are **the catalogue as it stands today (96 tools)**; the entries marked †
arrived in a later round and have their own reports in `docs/`.

### Fully implemented and tested

| Category | Tools |
| --- | --- |
| **Image & Creator** (10) | Compressor, Resizer, Cropper, Rotator & Flipper, Converter (PNG/JPEG/WebP), Watermark, Blur & Pixelate, Metadata, Social Media Resizer, Colour Picker & Palette |
| **PDF & Documents** (16) | Merge, Split, Extract Pages, Delete Pages, Reorder Pages, Rotate, Add Page Numbers, Watermark, Metadata, Images → PDF, Extract Text, PDF → Images, Compress PDF, PDF OCR †, Protect PDF †, Word → PDF † |
| **Files & Converters** (6) | File Hash & Checksum, Create ZIP, Open ZIP, File Inspector, CSV Tools, File Splitter & Joiner |
| **Developer** (16) | JSON, YAML ⇄ JSON, XML, HTML, CSS and SQL formatters; Regex Tester, JWT Decoder, Base64, URL Encoder & Parser, Hash Generator, UUID Generator, Timestamp Converter, Diff Checker, Markdown Preview, Cron Helper |
| **Utilities** (14) | Unit Converter, Time Zone Converter, Date Calculator, Age Calculator, Percentage Calculator, Password Generator, Random Generator, QR Code Generator, Colour Converter, Word & Character Counter, Case Converter, Text Cleaner, Placeholder Text, Number Base Converter |
| **Audio** (8) | Cutter, Joiner, Converter, Volume & Normalise, Speed & Pitch, Voice Recorder, Silence Remover, Waveform Viewer — decoding through the browser's own audio engine, MP3 written on the device with a pure-JS LAME encoder, WAV written byte by byte |
| **Video** (9) | Cutter, Compressor, Converter, Resizer, Video → GIF, Extract Audio, Screen Recorder, Subtitles, Video Downloader † — see the note below on what browser re-encoding can and cannot do, and [`docs/video-downloader.md`](docs/video-downloader.md) for the downloader |
| **Business** (6) | AI Customer Service (preserved, below), Meeting Transcription †, and the Invoice, Receipt and Quotation generators (one engine, three vocabularies: `DOCUMENT_LABELS` drives every heading, number prefix and date label) plus the Business Card Creator, which lays a card out at its real trim size with bleed, crop marks and an optional QR code |

### Implemented, but inert without credentials

| Tool | What is missing | What happens without it |
| --- | --- | --- |
| AI Summariser, Rewriter, Translator, Grammar & Spelling, Email Writer, Titles/Descriptions/Hashtags, **AI Chat**, **Document Q&A**, **Speech to Text** †, **Text to Speech** †, **Image Generation** † (eleven in all) | `GEMINI_API_KEY` or `OPENAI_API_KEY` | The page says "AI tools are not switched on here", the run button is disabled, and `POST /api/toolbox/ai` returns `503 not_configured`. No text is ever invented. Verified by test and by a live request. |

AI Chat holds the conversation in the browser (local storage) and sends the last 24 turns
with each question; the server keeps nothing, because the tool is anonymous. Document Q&A
extracts the text first — PDFs on the server, plain text in the tab — and defaults to
*grounded* answering, where the model is told it may answer only from the document and must
say "The document does not say" when the fact is absent.

The code path behind them is the production provider router (Gemini → OpenAI failover,
circuit breaker, classified errors) already used by the customer-service product — not a
second, simpler implementation.

### Preserved from the previous build

**AI Customer Service** is now `/tools/business/ai-customer-service`, with its whole
product intact: onboarding, business profile, AI employee, knowledge pipeline with pgvector
retrieval, widget, WhatsApp/SMS/Slack/email channels, inbox and human handoff, analytics,
CSAT, billing, admin, public API and webhooks. Its 30-odd integration suites and 15
Playwright tests still pass unchanged, including cross-business isolation.

### How video is done, and what it costs

There is no copy of FFmpeg here. Video is re-encoded by the browser itself: the clip is
played through a canvas and `MediaRecorder` encodes the canvas stream together with the
original audio (`src/features/video/transcode.ts`). The honest consequences are stated on
every page before anything starts:

* it runs at playback speed — a five-minute clip takes about five minutes;
* the output is WebM (VP9/VP8), because that is what browsers can write. The converter
  lists the formats read from *your* `MediaRecorder`, so it never offers an MP4 it cannot
  produce;
* the picture is re-encoded, so quality is lost, as with any re-encode;
* a browser without `MediaRecorder` or `canvas.captureStream` gets a plain refusal, not a
  spinner that never finishes.

In exchange the file never leaves the device. The GIF encoder is our own GIF89a writer
(variable-width LZW, median-cut palette taken from the real frames) in
`src/features/video/video.ts`, unit-tested down to the file header and verified end to end
in a browser.

### The last seven: built in this round

Nothing is left on the roadmap. The seven entries that previously said "not built yet" are
now real tools, and each was finished on its own terms rather than by lowering the bar.

| Tool | How it actually works | Verified by |
| --- | --- | --- |
| **PDF OCR** | Tesseract as WebAssembly inside the tab. The worker, all three WebAssembly cores and the English language data are served from this origin (`public/ocr`, copied out of `node_modules` by `npm run ocr:assets`, which `prebuild` runs). Pages are rasterised at 300 dpi one at a time through the existing PDF.js renderer, so a long document does not exhaust the tab. Confidence is reported with plain-language advice. | Playwright reads the words `INVOICE` and `1250` back off a PDF rasterised in the browser; unit tests cover the asset paths, page joining and the confidence wording |
| **Protect PDF** | Real AES-256 (revision 6) encryption via `@cantoo/pdf-lib`, a maintained fork of pdf-lib that can write the encryption dictionary. Also removes a password you know, by copying the pages into a fresh document. Permission flags are offered but labelled honestly as instructions a reader may ignore. | 10 unit tests, including that the file contains `/Encrypt` and `AESV3`, that loading without the password fails and with it succeeds, and a Playwright test where pdf-lib cannot open the downloaded file |
| **Word → PDF** | Mammoth reads the .docx XML; a layout pass in `src/features/files/docx.ts` wraps the runs onto A4 or Letter pages with bold/italic, headings, ordered and unordered lists and simple tables. Characters outside WinAnsi are replaced rather than throwing mid-document. | 9 unit tests built on .docx files assembled with JSZip; a Playwright test converts a 13-paragraph document and checks the download begins `%PDF-` |
| **Speech to Text** | Server route `POST /api/toolbox/transcribe`: the recording is sent to Gemini as an inline audio part, with OpenAI Whisper as the fallback. Optional speaker labels and a context hint for names. The browser can also record straight from the microphone. | 14 unit tests against a stubbed provider: request shape, fallback, refusal handling, key-in-header (never in the URL); Playwright asserts the honest unconfigured state |
| **Text to Speech** | Server route `POST /api/toolbox/speech`: Gemini's TTS model returns raw 16-bit PCM, which we wrap in a WAV header so any browser can play it; OpenAI's speech endpoint is the fallback and returns MP3. Five voices, mapped onto the nearest OpenAI equivalent. | Unit tests check the WAV header byte by byte, the voice passed to each provider and the sample-rate parsing |
| **Image Generation** | Server route `POST /api/toolbox/image`: Gemini's image model, falling back to `gpt-image-1`. The aspect ratio is passed as a hint to Gemini and as a pixel size to OpenAI. | Unit tests check both request shapes and that "no picture returned" is surfaced as a failure rather than an empty page |
| **Meeting Transcription** | Three real calls in sequence — transcribe (with speaker labels), summarise, then a grounded question that extracts decisions, owners and deadlines — and a Markdown download of the lot. If the transcript exceeds the writing endpoint's limit the summary says so instead of quietly covering only the opening. | Shares the transcription tests; the chained AI calls reuse the already-tested `/api/toolbox/ai` tasks |

Four of these (the three AI media tools and Meeting Transcription) call paid provider
endpoints, which cannot be exercised from this repository without credentials. Their tests
stub `fetch` and assert the request we build and the response we decode; the live round
trip is listed as a known limitation below rather than claimed as verified.

---

## 4. Platform features

| Feature | State |
| --- | --- |
| Global search (header + homepage + `/search?q=`) | Built. Matches names, descriptions, categories and colloquial keywords; full keyboard support; tested in a real browser |
| Category navigation | Built. A dedicated category bar on desktop, a disclosure menu on mobile, generated from the registry |
| Category and tool pages | Built. `/tools`, `/tools/{category}`, `/tools/{category}/{tool}`, all registry-driven |
| Most used tools | Built, and measured rather than asserted. Every tool page records one anonymous counter row (slug and day — no user, no address, no session), and the homepage orders its first row by the last 30 days. Below 25 recorded opens the heading changes to "A good place to start" and says the list is curated, because claiming otherwise would be a statistic we had not earned |
| Saved work has its own page | Built at `/projects`, linked from the footer and the mobile menu, grouped by tool. Without it a draft was only findable by remembering which tool made it |
| Saved work (projects) | Built for the five tools whose input is text you typed — invoice, receipt, quotation, business card, subtitle cues. Owner-scoped on every query, capped at 25 per tool, and a draft containing an embedded file is refused outright so "your files stay on your device" stays literally true. Signed out the panel explains what an account adds instead of pretending to save |
| Job records and quotas for the paid-for tools | Built. Every transcription, speech and image run opens a `tool_jobs` row (metadata only — byte counts, provider, model, duration, error; never the content), enforces a daily allowance and a three-at-once cap, honours an `Idempotency-Key` so a double submit cannot bill twice, and returns the remaining allowance to the UI. The maintenance cron closes rows whose serverless invocation was killed |
| Popular tools, related tools | Built. Related suggestions appear under every tool, and a test proves no tool is left stranded with nothing pointing at it. The promised chains are walkable: scanned PDF → OCR → summarise; video → extract audio → speech to text → subtitles; Word → PDF → protect; recording → transcript → meeting notes |
| Saved tools, recently used | Built. `localStorage` first, so no account is needed; signed in, both lists are mirrored to `user_tools` (slug + timestamp only) and merged as a union so nothing is lost between devices |
| Pricing and Help | Built as public pages (`/pricing`, `/help`). Pricing says plainly that the toolbox is free and that paid plans exist only for AI Customer Service, and shows "payments are not switched on here" when Stripe is unconfigured |
| Accounts, profile, preferences, billing, privacy, terms | Preserved from the previous build and reachable from the platform header and footer |
| Sitemap and robots | Built, generated from the registry so they cannot drift |
| Light and dark mode | Built, one token set, no flash on load |

---

## 5. Architecture

* **Engines are pure TypeScript** in `src/features/{image,pdf,files,developer,utilities,ai,business,audio,video}/`
  with no React, which is why they are unit-testable directly. Components are thin shells
  over them. No module does two tools' jobs.
* **One registry** (`src/lib/tools/registry.ts`) feeds navigation, search, category pages,
  related tools, the sitemap and all counts. A test fails the build if a registered tool has
  no component.
* **Per-tool code splitting** via a `next/dynamic` map, so opening a text tool does not
  download the PDF or image engines.
* **One shared pipeline** for every tool: validate → process → progress → errors → validate
  output → download → cleanup → telemetry, implemented once in `src/components/tools/ui.tsx`
  and `tool-shell.tsx`.
* **Heavy work stays off the server.** 81 of 96 tools run in the browser, so there are no
  long serverless jobs to orchestrate; the server endpoints are bounded, rate-limited and
  leave no temporary files. No queue was introduced, because none is needed for work that
  finishes in seconds — adding one would have been architecture for its own sake.
* **One door for every file that reaches the server.** `src/lib/files/pipeline.ts` runs the
  same sequence for transcription, PDF text extraction, knowledge uploads and widget
  attachments: declared length → actual size → extension allowlist → declared type →
  magic-byte detection → category and name agreement → bounded processing. Before it,
  three of the four endpoints trusted the `Content-Type` the caller attached, so a Windows
  executable named `interview.mp3` would have been handed to the AI provider. Executables
  and scripts are refused under any name, and a file whose bytes disagree with its
  extension is refused with an explanation rather than silently mangled. The signature
  table is shared with the File Inspector tool, because two copies of a security check
  eventually disagree.
* **The work that does reach a provider is tracked as a job.** `src/lib/tools/jobs.ts` opens
  a row before the call and closes it after: `processing → completed | failed | cancelled`,
  with a daily allowance per caller, a cap of three at once, `Idempotency-Key` support so a
  retried request cannot run twice, and a reaper in the maintenance cron for rows whose
  invocation was killed mid-flight. The caller is a salted hash of the address, or the user
  id when signed in, so a quota can be enforced without keeping a log of who used what. The
  row holds byte counts and timings — never the audio, text or image itself.

---

## 6. AI providers

| | |
| --- | --- |
| Primary | Google Gemini (`GEMINI_API_KEY`, default `gemini-2.0-flash`) |
| Fallback | OpenAI (`OPENAI_API_KEY`) |
| Router (text) | `src/lib/ai/router.ts` — classified failures, failover only when it can help, per-provider circuit breaker, health visible on the Developer page |
| Media (audio and images) | `src/lib/ai/media.ts` — transcription (Gemini inline audio → OpenAI `whisper-1`), speech (`gemini-2.5-flash-preview-tts` → OpenAI `gpt-4o-mini-tts`) and image generation (`gemini-2.5-flash-image-preview` → `gpt-image-1`). Same rules as the text router: Gemini first, OpenAI as fallback, and no retry after a content-policy refusal because the second provider would refuse too |
| Key exposure | Server only. No `NEXT_PUBLIC_` secret exists; the browser posts to `/api/toolbox/ai`, `/api/toolbox/transcribe`, `/api/toolbox/speech` or `/api/toolbox/image`. A unit test asserts the Gemini key travels in the `x-goog-api-key` header and never in a URL |
| Unconfigured | `GET` on any of those four endpoints → `{"ok":true,"available":false}`; `POST` → `503 not_configured`; the UI replaces the whole tool with an explanation of which key an administrator must add |

Verified live in this session with no keys set: the GET and POST responses above are real
output from the running build, not an expectation.

---

## 7. Storage, database, Supabase, Stripe, Vercel

| Area | State |
| --- | --- |
| **Storage** | S3-compatible object storage (`S3_*`) with a PostgreSQL fallback for small originals. The tool platform does not use it at all — browser tools never upload |
| **Database** | PostgreSQL + `pgvector` via Drizzle, 20 SQL migrations. The tools themselves still process nothing through a table. `0018_user_tools.sql` lets a signed-in person's saved and recent lists follow them between devices (slug + timestamps). `0019_tool_platform.sql` adds three narrow tables: `tool_usage` (slug, day, count — no user, address or session, so it can order a list but cannot profile anyone), `tool_jobs` (run metadata and quotas, never content) and `tool_projects` (the typed text behind a saved invoice or card, owner-scoped) |
| **Local development** | Bundled PGlite (`DATABASE_URL=""`) with pgvector, no Docker |
| **Supabase** | Supported as the Postgres host (pooled URL for the app, direct URL for migrations). Deliberately *not* used for Auth, Realtime, Storage SDK or Edge Functions — those are already implemented here and the lock-in would buy nothing |
| **Stripe** | Unchanged from the previous build: plans, checkout, portal, dunning, invoices, soft limits. Not configured → the billing page says so instead of faking a checkout |
| **Vercel** | Target platform. No long-lived processes, no filesystem writes, no custom WebSocket server, SSE for streaming, crons in `vercel.json` |

---

## 8. Test results

```
Vitest      Test Files  90 passed (90)   Tests  1525 passed (1525)   371 s
Playwright  67 passed (1.8m)             9 specs, Chromium, production build (CI)
```

Both jobs are green on every push: `.github/workflows/ci.yml` runs lint, typecheck and
Vitest in one job and the build plus Playwright in another, on a pinned `ubuntu-24.04`.

The suites added after this round have their own reports — the platform extension in
[`docs/report-platform-extension.md`](docs/report-platform-extension.md) and the video
downloader's 465 tests in
[`docs/report-video-downloader.md`](docs/report-video-downloader.md).

New in this round:

| Suite | Tests | What it proves |
| --- | --- | --- |
| `unit.tools-registry` | 18 | Unique slugs, valid categories, every ready tool has a component, search ranking, related-tool rules |
| `unit.tools-utilities` | — | Unit/date/number/random/text/colour maths including leap years, DST and rounding |
| `unit.tools-developer` | — | Six formatters and their minifiers, encoding round trips, diff, regex, cron |
| `unit.tools-pdf` | — | Merge/split/extract/rotate/number/watermark/metadata/images→PDF, page-range parsing, size caps |
| `unit.tools-files` | 16 | ZIP round trips, path-traversal entry names, magic-byte identification of 27 formats, hashing |
| `unit.tools-ai` | 15 | Request validation, input caps, per-task prompt construction, honest unconfigured behaviour |
| `unit.tools-invoice` | — | Totals, discount, tax, rounding, currency formatting, real PDF bytes |
| `unit.tools-audio` / `unit.tools-csv` | — | Trimming, joining, resampling, gain, fades, silence detection, WAV round trips; CSV parsing with quotes, delimiters and ragged rows |
| `unit.tools-video` | 24 | Fitting and even-number rounding, centre cropping to an aspect ratio, bitrate and size estimates, SubRip/WebVTT parsing and round trips, cue shifting, GIF frame planning, median-cut palettes, and a byte-level check of the GIF89a file we write |
| `unit.tools-business-card` | 12 | Hex parsing, readable ink on an accent colour, page geometry with bleed and crop marks, a two-page card PDF at the right size, and per-kind invoice/receipt/quotation documents |
| `integration.tool-library` | 7 | Saved and recent tools against a real database: ordering, the 12-item cap, unknown slugs dropped, union merge, independent clears, and **one account's list never leaking into another's** |
| `unit.tools-pdf-protect` | 10 | AES-256 encryption written and read back, the `/Encrypt` dictionary present, wrong passwords rejected without touching the file, already-protected files refused with advice, password strength rated honestly |
| `unit.tools-docx` | 9 | Real .docx files assembled with JSZip: headings, bold and italic runs, numbered and bulleted lists, tables with a header row, old .doc refused with instructions, A4 and Letter geometry, characters the standard fonts cannot encode |
| `unit.ai-media` | 14 | Transcription, speech and image requests against a stubbed provider: key in the header and never the URL, Gemini → OpenAI fallback, no pointless retry after a content refusal, a rejected key reported as `not_configured`, raw PCM wrapped into a valid WAV |
| `unit.tools-workflows` | 21 | Every tool is pointed at by at least one other tool, the four promised chains (scan → OCR → summary; cut → extract audio → speech to text → subtitles; Word → PDF → protect; record → transcribe → meeting notes) are walkable through related links, and twelve colloquial searches ("ocr", "encrypt pdf", "docx to pdf", "read aloud", "meeting minutes"…) each find the right tool |
| `unit.tools-ocr` | 6 | Engine assets served from this origin rather than a CDN, 300 dpi rasterising, page markers, and confidence wording that never flatters a bad scan |
| `e2e/tools.spec.ts` | 16 | Real browser: homepage, search → tool, a category page with no roadmap section left, password generation, case conversion, ZIP download, the misnamed-PNG case, the AI "not configured" state, a .docx converted to a real PDF, a protected PDF that pdf-lib cannot open without the password, OCR reading text off a page it rasterised, saved tools, history, the business entry point, invoice totals + PDF download |
| `e2e/platform.spec.ts` | 7 | Pricing and Help; PDF → Images genuinely rasterising a two-page PDF (checked via `naturalWidth` on the produced bitmap); the video cutter and converter (the format list comes from the browser, not a hard-coded string); subtitles loaded, edited and exported; and a GIF encoded end to end from a clip the browser records itself |

### The three required journeys

1. **Anonymous visitor uses a tool and downloads the result** — ✅ Playwright: lands on the
   homepage, searches, opens Create ZIP, adds two real files, downloads a real archive; also
   proven for the invoice PDF and the password generator.
2. **Creator-style session** — ✅ Playwright: saves a tool to *Saved tools*, it appears on
   `/favourites`, clearing really clears it; using a tool records it in *Recently used*; the
   AI tool states honestly that it is unavailable rather than producing text.
3. **Business journey** — ✅ Playwright (`journey`, `widget`, `isolation` specs): sign up →
   create a business → create the AI employee → add knowledge → go live → a customer chats
   through the widget → asks for a person → the team sees it, takes over, replies, resolves →
   the customer rates the conversation. Cross-business isolation is asserted in the same run.

---

## 9. Security checks

| Check | Result |
| --- | --- |
| Secrets in the client bundle | None. No `NEXT_PUBLIC_` secret exists; provider keys are read in route handlers only |
| Upload limits | 100 MB PDFs, 200 MB archives, 10 MB server extraction; enforced before reading the file |
| File type trust | Extension, MIME *and* magic bytes, now through one shared server intake (`src/lib/files/pipeline.ts`) used by all four endpoints that accept a file. Executables and scripts are refused under any name; bytes that disagree with the extension are refused with an explanation. 23 tests drive it from the attacker's side — a Windows binary named `interview.mp3`, an ELF named `screenshot.png`, a PDF claiming to be audio |
| Archive safety | Entry names sanitised; `../` and absolute paths cannot escape |
| Rate limiting | `/api/toolbox/ai`, `/api/toolbox/transcribe`, `/api/toolbox/speech` and `/api/toolbox/image` share the 20/10 min AI bucket; `/api/toolbox/pdf-text` 30/10 min; `/api/toolbox/library` 120/10 min — per IP (per user where signed in), overridable per deployment |
| Media upload limits | Transcription refuses anything over 25 MB, checks `content-length` before reading the body, allows only an explicit list of extensions, and verifies the audio signature in the bytes before the provider is called |
| Processing timeouts | Transcription (280 s) and PDF extraction (45 s) are wrapped in `withTimeout`, so a stuck step returns an explanation instead of dying with the invocation |
| Virus scanning | **Not configured, and not simulated.** No AV engine runs here. The intake refuses executables and type-mismatched files, which is what it can honestly claim; a real scanner would plug into `acceptUpload` between validation and processing |
| Business isolation | Server-resolved scope, never a client-supplied ID; integration + E2E tests |
| CSRF / SSRF / encryption at rest / hashed API keys | Unchanged and still tested (see the product report) |
| Personal data in the new table | `user_tools` holds a user id, a tool slug and timestamps. No file, no input, no output, and unknown slugs are discarded on the way in |
| Account isolation | `integration.tool-library` asserts that one account can neither read nor clear another's list; `integration.tool-platform` does the same for saved work and for job records, which are scoped to a hashed caller |
| Dependency surface | Tools added 11 runtime dependencies (`pdf-lib`, `jszip`, `qrcode`, `sql-formatter`, `yaml`, `@breezystack/lamejs`, `pdfjs-dist`, and for this round `tesseract.js`, `@tesseract.js-data/eng`, `@cantoo/pdf-lib`, `mammoth`); no native modules and no binaries — the OCR engine is WebAssembly served from our own origin. Video, GIF and card rendering needed no new dependency at all |
| OCR assets | Copied from `node_modules` into `public/ocr` at build time by `scripts/copy-ocr-assets.ts` (wired to `prebuild`), kept out of Git, and served same-origin so no third party learns which documents are being read |

---

## 10. Known limitations

1. **Video re-encoding runs at playback speed and outputs WebM.** That is the honest limit
   of what a browser can do without shipping FFmpeg-WebAssembly; every video tool says so
   before you start, and a browser that cannot do it at all refuses instead of spinning.
   Long films are better handled by a desktop encoder, and the pages say that too.
2. **Screen recording is desktop-only in practice.** `getDisplayMedia` does not exist in
   most mobile browsers; the tool detects this and explains it rather than failing silently.
3. **OCR is English only, and reads printed text, not handwriting.** The language pack is
   `eng` (about 3 MB); other languages need their data file added to `public/ocr` and the
   worker told about them. The tool reports its confidence and says plainly when a scan is
   too poor to trust.
4. **The OCR engine is about 7 MB on first use** in each browser, served from this origin.
   Vercel will serve it from the edge cache, but the first visitor in a region pays for it.
5. **The three AI media tools and Meeting Transcription have not been run against the live
   provider APIs** from this repository, because that needs paid credentials. The
   integrations are real and fully written — request building, fallback, error mapping and
   response decoding are unit-tested against a stubbed provider — but the round trip to
   Google or OpenAI is unverified here. Model names (`gemini-2.5-flash-preview-tts`,
   `gemini-2.5-flash-image-preview`, `gpt-image-1`, `whisper-1`) are the current ones and
   are worth re-checking at deployment.
6. **Transcription is capped at 25 MB**, roughly 25 minutes of speech: OpenAI's own hard
   limit, and as much as is sensible to hold in a serverless request. Longer recordings must
   be split first, which the File Splitter and Audio Cutter can do.
7. **Word → PDF rebuilds the document, it does not photograph it.** Text, headings, lists,
   tables and emphasis come across; Word's fonts, columns, headers, footers, page breaks and
   images do not. The page says so before you convert, and points at Word's own Print to PDF
   when fidelity matters.
8. **PDF permission flags are advisory.** The open password is genuine AES-256 encryption;
   the "may print", "may copy" flags are instructions a reader may ignore, and the tool says
   this in as many words.
9. **Document Q&A caps the document at 20,000 characters.** A longer file is refused with an
   explanation instead of being silently truncated, which would answer from half the facts
   without saying so.
10. **The "most used" ordering needs traffic before it means anything.** Until 25 opens have
    been recorded the homepage says so and shows a curated starting selection; the wording
    changes only once the measurement exists.
11. **Daily allowances for the provider-backed tools are per caller, not per seat.** An
    anonymous caller is identified by a salted hash of their address, so a shared office
    address shares an allowance. Signing in gives each account its own, which is the honest
    trade for not tracking people more closely than that.
12. **Browser tools are limited by device memory.** Very large images, long audio and 2 GB
    videos can exhaust a phone's tab; the tools report the failure rather than hanging.
13. **AI tools do nothing without a key**, by design.
14. **Legal pages are templates** and say so in a banner; a lawyer must review them.
15. **i18n is prepared, not delivered.** Copy is English and lives in components; the widget
    is already translated into four languages, but the platform shell is not.
16. **Tool counts in the UI are computed from the registry** — the search box says
    "Search 96 tools" because there are 96, and it will say something else the day there are
    more. No marketing number is hard-coded anywhere, and there are no invented statistics,
    testimonials or reviews on the site.
17. **Playwright needs a Chromium binary.** The sandbox used for this build cannot reach
    the Playwright CDN, so the browser suite is run by CI, which installs Chromium itself;
    locally, `E2E_CHROMIUM_PATH` points the config at any Chromium already on the machine.
    On a normal machine `npx playwright install chromium` then `npm run e2e` is all that is
    needed.

---

## 11. Recommended next steps

1. **Run the four provider-backed media tools against live keys** in a staging deployment
   and confirm the model names, then record the real latency and cost per minute of audio
   and per image on the pricing page.
2. **More OCR languages.** The loader already takes a language code; adding the data files
   for the languages your users actually have is a small, high-value change.
3. **A faster video path where the browser offers one** (`WebCodecs` where available), which
   would cut encoding below playback speed without giving up the privacy guarantee.
4. **Named workflows** as a first-class feature: chain two or three tools and keep the file
   between them, instead of relying on the user to re-upload.
5. **Server-side processing as an opt-in** for files too large for the device, reusing the
   existing storage layer and the job states already defined for the product.
6. **Measure what people actually open** (privacy-preserving counts only) so "popular tools"
   reflects reality instead of an editorial guess.
