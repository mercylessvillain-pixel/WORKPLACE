# Workbench

**Everything you need, in one place.**

Workbench is one professional home for the small jobs people do all day: shrink an image,
merge a PDF, tidy some JSON, convert units, zip a folder, write an invoice, run a document
through an AI. Sixty-three tools today, one search box, one design, no sign-up for most of
them.

Two things make it different from the usual pile of ad-funded tool sites:

* **Most tools never upload your file.** Images, PDFs, archives, hashes, text and code are
  processed by your own browser. The file does not leave the device, and the tool still
  works with the network off.
* **Nothing is faked.** Every button does the real work. Where a tool needs something that
  is not configured on this installation — an AI provider key, for example — it says so and
  stops. There is no fake progress bar, no simulated upload, no invented output.

---

## Contents

- [The tools](#the-tools)
- [Quick start](#quick-start)
- [How a tool is built](#how-a-tool-is-built)
- [Where work happens: browser or server](#where-work-happens-browser-or-server)
- [AI tools](#ai-tools)
- [AI Customer Service](#ai-customer-service)
- [For students: Study Forge](#for-students-study-forge)
- [Sharing and teams](#sharing-and-teams)
- [Analytics](#analytics)
- [Limits, usage and the API](#limits-usage-and-the-api)
- [Sending email](#sending-email)
- [Being told what happened](#being-told-what-happened)
- [Automation](#automation)
- [Your files and projects](#your-files-and-projects)
- [Apps you assemble yourself](#apps-you-assemble-yourself)
- [Finding things](#finding-things)
- [Saved tools and history](#saved-tools-and-history)
- [Project layout](#project-layout)
- [Design system and accessibility](#design-system-and-accessibility)
- [Environment variables](#environment-variables)
- [Scripts](#scripts)
- [Testing](#testing)
- [Deploying to Vercel](#deploying-to-vercel)
- [Security](#security)
- [Adding a tool](#adding-a-tool)

---

## The tools

| Category | Tools | Runs on device / on the server |
| --- | --- | --- |
| **Image & Creator** | 10 | 10 / 0 |
| **PDF & Documents** | 16 | 15 / 1 |
| **Files & Converters** | 6 | 6 / 0 |
| **Developer** | 16 | 16 / 0 |
| **Utilities** | 14 | 14 / 0 |
| **AI** | 11 | 0 / 11 |
| **Business** | 6 | 4 / 2 |
| **Audio** | 8 | 8 / 0 |
| **Video** | 9 | 8 / 1 |
| **Total** | **96** | **81 / 15** |

Nothing in the catalogue is a placeholder: every entry opens a tool that does the work.

<details>
<summary><strong>Every tool that works today</strong></summary>

**Image & Creator** — Image Compressor · Image Resizer · Image Cropper · Image Rotator &
Flipper · Image Converter · Image Watermark · Blur & Pixelate · Image Metadata · Social
Media Resizer · Colour Picker & Palette

**PDF & Documents** — Merge PDF · Split PDF · Extract PDF Pages · Delete PDF Pages ·
Reorder PDF Pages · Rotate PDF · Add Page Numbers · PDF Watermark · PDF Metadata · Images
to PDF · Extract PDF Text · PDF to Images · Compress PDF · PDF OCR · Protect PDF · Word to
PDF

**Files & Converters** — File Hash & Checksum · Create ZIP · Open ZIP · File Inspector ·
CSV Tools · File Splitter & Joiner

**Developer** — JSON Formatter · YAML ⇄ JSON · XML Formatter · HTML Formatter · CSS
Formatter · SQL Formatter · Regex Tester · JWT Decoder · Base64 Encoder & Decoder · URL
Encoder & Parser · Hash Generator · UUID Generator · Timestamp Converter · Diff Checker ·
Markdown Preview · Cron Expression Helper

**Utilities** — Unit Converter · Time Zone Converter · Date Calculator · Age Calculator ·
Percentage Calculator · Password Generator · Random Generator · QR Code Generator · Colour
Converter · Word & Character Counter · Case Converter · Text Cleaner · Placeholder Text ·
Number Base Converter

**AI** (needs a provider key) — Summariser · Rewriter · Translator · Grammar & Spelling ·
Email Writer · Titles, Descriptions & Hashtags · AI Chat · Document Q&A · Speech to Text ·
Text to Speech · Image Generation

**Business** — AI Customer Service · Invoice Generator · Receipt Generator · Quotation
Generator · Business Card Creator · Meeting Transcription

**Audio** — Audio Cutter · Audio Joiner · Audio Converter · Volume & Normalise · Speed &
Pitch · Voice Recorder · Silence Remover · Waveform Viewer

**Video** — Video Cutter · Video Compressor · Video Converter · Video to GIF · Extract
Audio · Video Resizer · Screen Recorder · Subtitles

</details>

### Reading, protecting and converting documents

**PDF OCR** runs Tesseract as WebAssembly in the tab. The engine, its core and the English
language data are served from this site (`public/ocr`, filled from `node_modules` by
`npm run ocr:assets`, which `prebuild` runs for you), so a scanned document is never
uploaded and the tool still works on a network that blocks public CDNs. It costs about
7 MB of downloads the first time a browser uses it, and a second or two a page.

**Protect PDF** writes real AES-256 encryption through `@cantoo/pdf-lib`, a maintained fork
of pdf-lib that can produce the encryption dictionary. It also removes a password you
already know. The tool is explicit that the open password is genuine encryption while the
permission flags are only instructions a reader may choose to obey.

**Word to PDF** reads the .docx with Mammoth and lays the result out with pdf-lib. Text,
headings, lists, tables, bold and italic survive; Word's fonts, columns, headers, footers
and page breaks do not — and the page says so before you convert.

### A word about video

Video is re-encoded by the browser itself (`MediaRecorder` plus a canvas), not by a copy of
FFmpeg. That buys real privacy — the file never leaves the device — at a price every video
tool states before you start: encoding runs at playback speed, and the output is WebM. The
GIF encoder in `src/features/video/video.ts` is ours, written directly against the GIF89a
specification, with a median-cut palette taken from your actual frames.

### The video downloader

`/tools/video/video-downloader` is the one video tool that runs on the server, because
reading a stranger's address is not something a browser is allowed to do. It takes one
address, works out which provider it belongs to, asks that provider what it genuinely
offers, and lists only what came back. Everything it shows can be traced to a source: each
piece of metadata carries where it came from, resolution and frame rate are separate facts
rather than one guess, and anything the source did not state is shown as unknown instead of
being filled in with a plausible number.

What it will not do is as much a part of the feature as what it will. There is no DRM
bypass, no cookie or login-token extraction, no CAPTCHA evasion and no signature
deciphering. Media that is private, or that a provider does not permit downloading, gets an
honest refusal naming which of those it is. YouTube links therefore show details and no
download; Vimeo downloads work only with `VIMEO_ACCESS_TOKEN` set, and only for videos that
account is genuinely allowed to download; ordinary direct links work when the server
serving them says they do.

Finished files land in your library like anything else, with the usual project filing and
hand-offs to the other tools. `/downloads` keeps the history, including the attempts that
failed and the ones you stopped. The long version — the pipeline, the capability matrix, the
nineteen named failures and every decision behind them — is in
[`docs/video-downloader.md`](docs/video-downloader.md).

---

## Quick start

Requirements: Node.js 20+.

```bash
npm install
cp .env.example .env.local      # works as-is for local development
npm run db:migrate              # creates the schema
npm run dev                     # http://localhost:3000
```

With `DATABASE_URL` empty the app runs on a bundled PostgreSQL build
([PGlite](https://pglite.dev)) stored in `.data/pglite`, including `pgvector`. No Docker and
no external service is needed: open the homepage and every on-device tool works
immediately. The database is only needed for accounts and for the AI customer-service
product.

---

## How a tool is built

Every tool follows the same eight steps, so they behave the same way and a bug fixed in one
place is fixed everywhere (`src/components/tools/ui.tsx`, `tool-shell.tsx`):

```
input validation → processing → progress → error handling →
output validation → download → cleanup → telemetry
```

* **Input validation** happens before any work: size caps (100 MB for PDFs, 200 MB for
  archives), a MIME allow-list, an extension check and a magic-byte sniff of the real
  content. A `.png` that is actually a ZIP is caught and named.
* **Progress** is read from the actual work — files completed, pages written, bytes hashed.
  No tool animates a bar that is not measuring something.
* **Errors** are shown in the tool's own words ("this PDF is password-protected"), never a
  stack trace or a silent failure.
* **Output validation** re-checks what was produced (a non-empty PDF that really parses, an
  archive that really opens) before a download button appears.
* **Cleanup** revokes every object URL and drops buffers when the tool unmounts, so a long
  session does not leak memory.
* **Telemetry** is deliberately tiny: the name of the tool you opened, stored in your own
  browser for the *Recently used* list. No file names, no contents, no analytics service.

Each tool is a separately code-split client component (`src/components/tools/tool-runtime.tsx`
maps slugs to `next/dynamic` imports), so opening the Case Converter does not download the
PDF engine.

---

## Where work happens: browser or server

| Runtime | Used by | Why |
| --- | --- | --- |
| **Browser** | 81 tools — images, PDFs, audio, video, archives, hashing, text, code, calculators, business documents | Privacy, speed and no upload limits. The file never leaves the device. |
| **Server** | 15 tools — the 11 AI tools, Meeting Transcription, PDF text extraction, the AI customer-service product and the Video Downloader | They need a provider key, a library that cannot run in a browser, or — in the downloader's case — the ability to fetch a stranger's address, which a browser is not allowed to do. |

Server tools are ordinary serverless handlers with hard limits: a request body cap, a
timeout, rate limiting (`src/lib/security/rate-limit.ts`) and no temporary files left
behind. There is no background queue to go wrong, because nothing here needs one — the
server endpoints finish in seconds or fail honestly.

The category badge on every tool card says which one it is, and a tool page states it again
above the controls.

---

## AI tools

The eight AI tools (and the AI customer-service product) go through one provider router,
`src/lib/ai/router.ts`:

* **Gemini first, OpenAI as the fallback.** Failures are classified before anything is
  retried; a safety refusal is never laundered through a second model.
* **Keys are read on the server only.** No `NEXT_PUBLIC_` secret exists, and the browser
  never talks to a provider directly. The tool posts to `/api/toolbox/ai`.
* **No key, no pretending.** `GET /api/toolbox/ai` answers `{"available": false}`, the tool
  page shows "AI tools are not switched on here" with a disabled button, and a `POST`
  returns `503 not_configured`. Nothing is invented to fill the gap.

Set `GEMINI_API_KEY` or `OPENAI_API_KEY` and the same pages become usable with no other
change.

---

## AI Customer Service

The largest tool on the platform is a complete product in its own right: an AI
customer-service employee that learns a business from its own documents, answers customers
on a website widget, WhatsApp, SMS, Slack or email, and hands over to a person the moment
one is needed. It lives at **Business → AI Customer Service**
(`/tools/business/ai-customer-service`) and keeps its own account area, onboarding,
dashboard, inbox, analytics and billing.

It is documented separately, in full: **[docs/ai-customer-service.md](docs/ai-customer-service.md)**.

Each business's data is resolved on the server from the signed-in session — never from an
ID sent by the browser — and one business can never read another's conversations, knowledge
or customers. That rule has its own test suite (`tests/integration.isolation.test.ts`,
`e2e/isolation.spec.ts`).

---

## Sharing and teams

Everything in your library is private. There is no "make public" switch; instead you create a
**share**, which is a separate thing you can withdraw. Two kinds, both read-only:

- **a link** — anyone who has it can open the file or project. The secret lives only in the URL;
  we store a hash of it, so nobody reading the database can open your file.
- **a person** — someone with an account here, who then sees it under **Shared**.

Either kind can be set to view-only or to allow downloading, can be given an expiry date, and
shows you how many times it has been opened. Withdrawing takes effect immediately, because
access was never a property of the file itself. A share names exactly one thing: a link to one
file cannot be pointed at another, and a shared project exposes only the files inside it.

Teams work the same way round. **Dashboard → Settings → Team** invites someone by email even if
they have never used the platform — the invitation walks them through creating an account. An
invitation expires after seven days, can only be accepted by the address it was sent to, works
once, and can be withdrawn before it is used. If no email provider is configured, the invitation
is still created and the link is shown to you to pass on; nothing claims to have sent a message
it could not send.

**Seven roles**, picked by what somebody actually does rather than by rank:

| Role | What they may do |
| --- | --- |
| **Owner** | Everything, including billing and closing the business |
| **Admin** | Everything except billing and closing the business |
| **Manager** | Conversations, customers, documents (including deleting them), knowledge, analytics |
| **Staff** | Conversations, customers, and drawing up documents |
| **Support agent** | Read conversations and reply to customers |
| **Editor** | Knowledge and documents. Does not see customer conversations |
| **Viewer** | Reads the dashboard and the numbers. Changes nothing |

A role is checked on the server for every action, and the same check decides whether the button
is drawn at all — a viewer sees a page without a "New document" button rather than one that
refuses. "Support agent" is what used to be called "team member"; the rename carried every
existing member's access with it and promoted nobody.

---

## Sending email

Email used to work only if whoever owned the deployment had set `RESEND_API_KEY`
and `EMAIL_FROM`. For everyone else "email is not configured" was a dead end: the
message was honest, but the fix was a redeploy they could not perform.

**Dashboard → Connect → Email → Sending** now lets a business paste its own
provider key and sending address. Saving is not connecting: the credentials are
stored encrypted and marked *not tested*, and only a real message sent to the
address of the person who clicked **Send a test message** promotes them to
working. If the provider refuses, its own words are shown; if it cannot be
reached, that is reported as the network's problem rather than ours. Changing
the key makes you prove it again.

Once connected, invitations, handoff alerts, email replies to customers and
automation steps all send through that provider, from that address. The
deployment's own credentials remain the fallback, so existing installations
behave exactly as before. When nothing is connected anywhere, every feature
that would have sent mail still says so instead of pretending.

---

## Documents

**Dashboard → Documents** is where paperwork lives. Eight kinds: invoice,
quotation, receipt and purchase order, which have line items and a total;
proposal, letter, report and certificate, which have headed sections and a
signature.

Writing one numbers it (`INV-0001`, per business, per type), renders a PDF
and files it in your library — so it is in Files, in search, and shareable
like anything else. The total is worked out on the server from the lines you
typed; the figure in the composer is a preview of the same sum, not a number
anything trusts.

Open a document from the list to read it back, change it and save: the same
form that wrote it, filled in from what was stored. Saving re-renders the
PDF, sends the superseded one to the trash and keeps the number, so an
invoice you have already sent still produces the document you sent. Removing
a document is an owner, admin or manager decision — the `documents.delete`
permission — and the PDF goes to the trash rather than being destroyed,
because it is in somebody's library.

For a proposal, letter or report you can ask the AI for a first draft of the
*words*. It will not invent a price, a quantity or a date you did not give
it — where a figure is needed and missing it leaves a bracketed placeholder
for you to fill in. Everything it writes is yours to edit before anything is
saved, and with no AI provider configured the rest of the page works exactly
as before.

---

## Sales, without the AI putting words in anyone's mouth

Open a customer and the **Sales** panel can read their real conversations and
tell you what it thinks: how warm they are, what they want, a budget, a
company, a timeline, a next step.

None of that becomes part of the customer record. It sits in a dashed box
headed *The AI's guesses · not on the record*, with **Confirm** and **Wrong**
beside each line. Confirming is what writes — a company, budget, timeline or
next step is appended to the customer's notes with the date, so the record
always shows where the line came from. An interest reading is an opinion and
writes nothing. Anything the conversation never mentioned is dropped rather
than stored as a blank fact, and reading again replaces the guesses while
leaving everything you already confirmed alone.

The pipeline status — New, Qualified, Not a fit, Customer — moves only when a
person moves it. No model and no automation can advance a lead. The customers
list filters by status with real counts.

With no AI provider configured the panel says a provider is required. It does
not produce a reading.

---

## Analytics

**Dashboard → Analytics** covers two things. How the AI is handling customers —
conversations, resolution, ratings, reply times, where conversations come from,
what it could not answer — and what the business as a whole did: automation runs
and the workflows worth looking at, AI requests and tokens by provider, who has
been active, and what reached your connected systems.

Pick 7, 30 or 90 days and every number on the page moves with it. **Export as
CSV** gives you the same figures as a file, built from the same object the page
renders so the two cannot disagree.

Some deliberate omissions. A success rate over zero runs is shown as "—", not
0%. Builder test runs are not counted as business activity. Tokens are shown but
never converted into money, because the price depends on your own agreement with
the provider. And your files and projects are not in here at all: they belong to
the person who made them, so they stay out of a report an admin can read.

---

## Limits, usage and the API

**Dashboard → Usage** shows what this business has used against what it is
allowed: conversations this period, knowledge sources, team members and API
requests. Every number is counted from the database when the page loads, so it
is the same count the limits themselves check — a progress bar that disagreed
with the gate would be worse than no progress bar.

The plan numbers used to be advertised on the pricing page without anything
enforcing them. They are enforced now, in one place
(`src/lib/billing/entitlements.ts`), and each refusal says which plan, which
limit and what to do about it:

| Limit | Checked when |
| --- | --- |
| Conversations a month | a conversation starts |
| Knowledge sources | a source is added |
| Team members | somebody is added **or invited** — a pending invitation is a promised seat |
| API requests a month | any `/api/v1/*` call, answered `429` when it is gone |

A platform administrator can give one business different numbers (this is the
mechanism behind "custom limits" on Enterprise). An override is per limit, and
clearing one puts that limit back on the plan's number. A missing, null or
negative override falls back to the plan rather than becoming an accidental
free pass.

### What the API did

Every call made with one of your keys is recorded: method, path, status code,
how long it took, and which key made it. Never the request body, and never the
query string — a diagnostic log should not become a second copy of your
customer data. Records are kept for 30 days and then swept. You can see the
last 15 on **Developer** and the full picture on **Usage**, grouped by key and
by endpoint, with identifiers in paths collapsed to `:id` so one busy endpoint
does not read as a thousand quiet ones.

Client libraries are generated from the same route list the docs use:
`/api/v1/sdk` for JavaScript and `/api/v1/sdk/python` for Python. Both cover
exactly the four endpoints that exist, and nothing that does not.

---

## Being told what happened

**Dashboard → Notifications** (`/dashboard/notifications`) is the record of things that
happened while you were elsewhere: a customer asking for a person, an automation that failed,
somebody joining your team. The count beside it in the sidebar is what *you* have not read.

Read state belongs to a person, not to a business. If the owner reads something, it does not
vanish from everyone else's list — a team where one person dismissing a notice hides it from
the rest is a team that misses things. Each person also chooses which of the four kinds they
want (conversations, automation, team, plan and billing), per business, and that choice applies
both to what arrives and to what is already there. When nobody in a business wants a kind of
notice, it is not recorded at all rather than piling up unseen.

Repeat notices about the same thing collapse into one, so an automation failing all afternoon
produces a single entry per hour rather than a hundred. Notifications older than ninety days are
cleared by the nightly retention job.

---

## Automation

**Dashboard → Automation** (`/dashboard/automation`) lets a business react to what happens
in it: when a customer asks for a person, when a conversation is rated, when knowledge
changes. A workflow is *when this happens → if these things are true → do these, in order*.

The actions are an allowlist of six things the platform already knows how to do: send to a
connected system through the existing signed webhooks, email someone on the team, post to
Slack, ask the AI to pull named details out of the message, add a note to the customer, or
write a line in the run log. There is no scripting and no arbitrary HTTP, which is the
whole point — a workflow is configuration, not code.

Some design decisions worth knowing:

- **A workflow cannot loop.** Steps are an ordered list with no jumps, capped at twelve,
  inside a 25-second budget and a per-workflow hourly run limit.
- **The same event never runs it twice.** Runs are claimed against a unique
  `(workflow, idempotency key)` index, so a replayed delivery is recorded as a replay.
- **AI output is validated.** The "pull out details" action builds a schema from the fields
  you named; anything that does not match that shape fails the step rather than flowing on,
  and a detail the AI cannot find comes back empty instead of invented.
- **Later steps can use earlier results**, for example `{{ step1.order_number }}`.
- **Nothing is faked.** If email or Slack is not configured, the run log says
  *not configured* and tells you what is missing — it never reports a delivery that did not
  happen.

Every run keeps a per-step log — what ran, what it did, how many attempts, how long — and
the page shows recent activity across every workflow.

---

## For students: Study Forge

`/students` is a section of its own, for people studying rather than running a business.
Study Forge is the flagship: you give it your own material and it gives you a paper, marks
it, and keeps the result.

**Material in.** Type or paste it, choose a PDF, or photograph a page.

A PDF is shown to you first, page by page, before anything is saved. Pick a page range —
"pages 12 to 18" — and only those pages are read, on the server, through the same extractor
the knowledge base uses. Or drag a box around part of a page and only that part is used: the
words come from the PDF's own text layer, so the selection is exact rather than
approximate. A page that turns out to be a scan has no text layer; that is said on the page,
and the area you picked is recognised in your browser tab instead. The PDF is kept in your
files, so next week's chapter needs no second upload, and each piece of material shows where
it came from ("Page 12, selected area").

A photograph is read by Tesseract **in your browser tab** — the picture is never uploaded,
only the recognised text, because this installation has no server-side vision model and
pretending otherwise would be a lie.

**A paper out.** Choose how many multiple-choice (1 mark), short-answer (2 marks) and
creative questions (parts a–d worth 1+2+3+4 = 10 marks), the difficulty, the language and
any extra instruction. The AI writes the questions *and* the answer key together, and both
are stored; the key is never sent to the browser until the paper has been marked.

**Marking.** Multiple choice is marked by comparing integers against that stored key — no
model is asked, so the same answer always gets the same mark. Only free-response answers go
to the AI, in one batched call, and every mark it returns is clamped to what the question is
worth and rounded to the nearest half mark. If the AI is unavailable, those answers come back
labelled *not marked* rather than zero, and they are left out of your topic statistics so an
outage cannot invent a weakness.

**Everything else is counted, not estimated.** History is your real attempts; weak topics
need at least three answered questions on a topic before the label is applied; the planner's
progress is the sessions you ticked; flashcards use a Leitner schedule (1, 2, 4, 9, 21 days)
and the "due" count is a query against those dates. There are no streaks, no fake progress
rings and no invented averages — an empty dashboard says it is empty.

**Asking, summarising, and homework.** The assistant answers questions about one piece of
your material and shows *which paragraph* each answer rested on — the material is split into
numbered segments, the model must cite those numbers, and any number it invents is dropped
before you see it. An answer that cannot cite anything is labelled unsupported. The
summariser works the same way. The homework helper deliberately stops short of doing the
work: it gives the method, the steps and a **parallel** worked example with different
numbers, and says so on the page.

**Practice that is earned.** "Practise a weak topic" is built from topics you have really
lost marks on, using the same material those questions came from. With no history it says
there is nothing to practise rather than inventing a weakness.

Material, quizzes, attempts, notes, decks, threads and plans are all keyed to your user id
and every query filters on it, so nothing of yours is reachable from another account.

---

## Apps you assemble yourself

**/apps** is a builder for small apps made out of parts of this platform. Put a
few modules in a row and you have something you can run again tomorrow without
setting it up each time:

| Module | What it does |
| --- | --- |
| Ask for some text | The app starts by asking whoever runs it to paste something |
| Read one of your files | Starts from a file in your library and reads its text |
| Summarise, rewrite, translate, fix grammar | The same AI writing tasks the AI tools offer |
| Pull out named details | Asks the AI for the fields you name and checks the answer against that shape |
| Lay it out with a template | `{{text}}` is the current text, `{{field}}` is anything that was pulled out |
| Save the result to your files | Writes a real document into your library |
| Add that file to a project | By reference, like everything else in projects |
| Turn it into a practice paper | Saves the text as study material and writes a marked paper from it in Study Forge |

The last one is the join between the two halves of the platform: read a PDF,
tidy it up with the AI, and get a paper you can sit — three parts that used to
be reachable only one at a time. It uses Study Forge's own services, so the
material and the paper are real rows in your own account, marked the same way
as anything else, and the run links straight to the paper.

That list is the whole feature. There is no script box, no custom step and no
expression language, because any one of those would turn "it cannot run
arbitrary code" from a property into a claim. The server matches each saved
step against the same registry and refuses anything it does not recognise, so
editing the database by hand does not buy you a new capability either.

Runs are kept whole. A step that failed says why, and the steps after it say
they never ran rather than quietly disappearing. With no provider key the AI
steps stop with *configuration required* instead of producing something that
looks like an answer. The record keeps how many characters you typed, not what
you typed.

---

## Your files and projects

`/files` is one private library behind the whole platform: what you upload, what the tools
generate for you, and what Study Forge reads. Folders, recent, favourites, generated and
trash are views over the same rows — deleting moves to trash first. Binaries live in the
configured object storage, never in Git and never twice.

`/projects` groups work. A project item is a *reference* to a file, quiz or note, so
deleting a project never deletes the thing it pointed at. A study project is the same table
with `kind = "study"`, which is why a quiz generated into one shows up on its page.

---

## Finding things

* **One search box, everywhere** — in the header on every page and in the middle of the
  homepage. It searches tool names, descriptions, categories and the words people actually
  use ("shrink", "squash", "make smaller"), ranks working tools above roadmap entries, and
  is fully keyboard-operable (arrow keys, Enter, Escape).
* **`/search?q=…`** is a real page, so a search can be linked or bookmarked. Signed in, it
  also searches **your own things** — files, projects, study quizzes and notes, the apps you
  built, and your business's customers, knowledge and automation. Every one of those queries
  carries its own ownership or business condition, so a result can only appear because you
  already had the right to the row it came from. Automation is shown to an owner or admin
  only; an agent sees the customers they work with and is *told* that automation was not
  searched rather than being shown a short list with no explanation.
* **Related tools** appear under every tool, drawn from the registry, so finishing one job
  suggests the obvious next one: merge a PDF → add page numbers → extract the text →
  summarise it.
* The whole catalogue lives in one file, `src/lib/tools/registry.ts`. Navigation, search,
  category pages, related tools, the sitemap and the tool counts all read from it, so they
  cannot disagree with each other.

---

## Processing history

Most tools here never send anything anywhere: the work happens in your browser.
A few cannot — transcription, speech and image generation need a provider — and
those run as server jobs with a status.

**/activity** is that record: what ran, when, how long it took, how many bytes
went in and came out, which provider answered, and the reason anything failed.
A job that is still going can be stopped from here, and the bar next to it moves
without claiming a percentage, because a provider does not report how far through
it is and inventing a number would be a guess dressed up as progress. The page
polls only while something is actually running.

"Run it again" reopens the tool rather than silently repeating the work: the
files you sent are not kept after a job finishes, so there is nothing to re-run
from, and pretending otherwise would be the kind of fake button this project
does not ship.

---

## Saved tools and history

**Saved tools** (`/favourites`) and **Recently used** (`/history`) are kept in your
browser's `localStorage`. No account is needed, nothing is uploaded, and clearing them
really clears them.

When you *are* signed in, both lists are also mirrored to your account (`user_tools`) so
they follow you to another device. The mirror holds a tool slug and a timestamp and nothing
else — never a file, a field or anything you typed. The merge is a union, so a tool saved on
a phone is not lost because a laptop has not seen it yet, and a failed mirror never breaks
the local list.

---

## Project layout

```
src/
  app/
    (tools)/              the platform: home, /tools, categories, tool pages,
                          search, saved, history, legal, API docs
    (auth)/               sign up, sign in, password reset
    (dashboard)/          AI customer-service dashboard
    onboarding/           business → AI → go live
    embed/[publicId]/     the customer-service widget (iframe document)
    admin/                platform admin (ADMIN_EMAILS only)
    api/toolbox/          the tool endpoints (ai, pdf-text, library)
    api/                  everything else, including /api/v1 public API
    sitemap.ts robots.ts  generated from the tool registry
  features/
    image/                canvas pipelines + 10 tool components
    pdf/                  pdf-lib engine + 11 tool components
    files/                zip, magic-byte inspection, hashing
    developer/            formatters, encoding, diff, regex, cron, markdown
    utilities/            units, dates, numbers, random, text, colour
    ai/                   prompt building, request schema, AI tool components
    business/             invoice engine and the customer-service entry point
  components/
    tools/                registry-driven UI: search, nav, grids, tool shell,
                          the shared tool controls (ui.tsx)
    ui/                   the design system
  lib/
    tools/                registry, search, client storage, API client,
                          usage counts, job records, saved work
    files/                one upload intake for every endpoint that takes a
                          file: size, extension, declared type, magic bytes
    ai/ auth/ db/ storage/ security/ knowledge/ rag/ billing/ …
drizzle/                  SQL migrations
tests/                    90 Vitest files
e2e/                      9 Playwright specs
docs/                     the AI customer-service manual and its build report
```

Engines are pure functions with no React in them (`src/features/*/*.ts`), which is why they
can be unit-tested directly; the components are thin shells around them. There is no
"everything" module: no file does two tools' jobs.

---

## Design system and accessibility

One set of tokens in `src/app/globals.css` (Tailwind 4 `@theme`) defines colour, radius and
elevation for light and dark mode; `src/components/ui` and `src/components/tools/ui.tsx`
build everything from them. The result is deliberately plain: a lot of white space, one
accent colour, no gradient soup.

* Keyboard first — a skip link, visible focus rings, real `<button>`/`<label>` elements, the
  search combobox implementing the ARIA listbox pattern.
* Live regions for results and errors, so a screen reader hears that a job finished.
* Mobile is a different layout, not a squeezed one: a full-width search row, a disclosure
  menu for the categories, large tap targets and single-column tool panels.
* Copy is written in English and kept in the components rather than scattered through
  helpers, so translating later is a mechanical job.

---

## Environment variables

See [`.env.example`](./.env.example) for the full annotated list. The tool platform itself
needs **nothing**. These matter once you want accounts and the customer-service product:

| Variable | Why |
| --- | --- |
| `DATABASE_URL` | PostgreSQL with `pgvector` (Neon, Supabase, RDS …). Empty = bundled PGlite |
| `AUTH_SECRET` | signs sessions and API-key hashes |
| `ENCRYPTION_KEY` | encrypts third-party credentials at rest (AES-256-GCM) |
| `NEXT_PUBLIC_APP_URL` | used in widget snippets, emails and the sitemap |
| `GEMINI_API_KEY` / `OPENAI_API_KEY` | switches the AI tools on |

Everything else is optional and degrades honestly: no S3 → uploads stay in the database; no
Resend → the UI says email is not configured; no Stripe → billing says "not configured"
instead of showing a fake checkout.

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | development server |
| `npm run build` / `npm start` | production build and server |
| `npm run lint` | ESLint (Next.js config) |
| `npm run typecheck` | `tsc --noEmit`, including the tests |
| `npm test` | Vitest unit + integration suite |
| `npm run e2e` | Playwright against a real production build |

### Running the browser tests where Playwright cannot download a browser

`npx playwright install` needs `cdn.playwright.dev`. On a machine that cannot
reach it, point the suite at any local Chromium instead — the config reads
`E2E_CHROMIUM_PATH`:

```bash
npm run build
E2E_CHROMIUM_PATH=/path/to/chromium npm run e2e
```

Everything else — the production server, the throwaway database, the
migrations — is already self-contained.

### What runs on every push

`.github/workflows/ci.yml` runs two jobs against PGlite, with no secrets
and no external services:

| Job | Does |
| --- | --- |
| **Lint, types and tests** | `npm run lint`, `npm run typecheck`, `npm test` |
| **End-to-end** | `npm run build` — which runs the §70 quality-ladder guard from `prebuild` — then installs Chromium and runs the 67 Playwright tests, keeping the HTML report as an artifact when something fails |

The runner is pinned to `ubuntu-24.04` rather than `ubuntu-latest`: that
label moves to Ubuntu 26 in October 2026, and an operating-system change
underneath a browser suite is worth making on purpose rather than
inheriting overnight.
| `npm run db:migrate` | apply SQL migrations (safe to re-run) |
| `npm run db:seed` | create the customer-service demo business |
| `npm run check` | pre-flight: database, pgvector, migrations, storage, email, AI, secrets |

---

## Testing

```bash
npm test     # 1,525 tests in 90 files
npm run e2e  # 67 Playwright tests in a real browser, 17 of them at a phone viewport
```

The Vitest suite runs against its own throwaway PostgreSQL instance in a temp directory,
with no provider keys and no network, so it is deterministic.

| File | Covers |
| --- | --- |
| `tests/unit.tools-registry.test.ts` | the catalogue itself: unique slugs, valid categories, every ready tool has a component, search ranking, related tools |
| `tests/unit.tools-utilities.test.ts` | unit/date/number/random/text/colour maths, including leap years, DST boundaries and rounding |
| `tests/unit.tools-developer.test.ts` | JSON/YAML/XML/HTML/CSS/SQL formatting and minifying, encoding round trips, diff, regex, cron |
| `tests/unit.tools-pdf.test.ts` | merge, split, extract, rotate, page numbers, watermark, metadata, images → PDF, page-range parsing, size caps |
| `tests/unit.tools-files.test.ts` | zip round trips, path-traversal names, magic-byte identification of 27 formats, hashing |
| `tests/unit.tools-ai.test.ts` | request validation, input caps, prompt construction per task, honest unconfigured behaviour |
| `tests/unit.tools-invoice.test.ts` | line totals, discounts, tax, rounding, currency formatting, real PDF output |
| `e2e/mobile.spec.ts` | the same site at 390×844 with touch: thirteen pages that must not scroll sideways, the collapsed menu actually being tappable, a tool being usable with a thumb, and the dashboard fitting the screen |
| `e2e/tools.spec.ts` | a real browser: search → tool, password generation, zipping files, the misnamed-PNG case, the AI "not configured" state, a .docx really converted to PDF, a protected PDF a library cannot open without the password, OCR reading text off a rasterised page, saved tools, history, invoice totals and PDF download |
| `tests/integration.study-forge.test.ts` | Study Forge: material privacy, generation shape and mark totals, deterministic MCQ marking, AI marks clamped to the question's worth, creative sub-part arithmetic, honest degradation when the provider is down, the whole upload → generate → answer → submit → grade → reopen journey, cross-account refusal, double submission, the weak-topic threshold, bank isolation and planner completion |
| `tests/study-region.test.ts` | page and region selection: a drag clamped to the page whatever order the corners came in, a click clearing rather than selecting, a word half inside the box kept and one merely grazed dropped, words returned in reading order, and page ranges clamped to a document that really has those pages |
| `tests/integration.study-sources.test.ts` | material from part of a real PDF: pages extracted individually, a range yielding only those pages, a range of near-blank pages refused with nothing left behind, another account refused a PDF from someone else's library, an impossible region dropped rather than stored, and the listed shape matching what the page reads |
| `tests/integration.study-assistant.test.ts` | the assistant, summariser and homework helper: paragraph segmentation, citations resolved back to real material, fabricated citations dropped, an uncited answer treated as unsupported, thread isolation, and help that teaches rather than answers |
| `tests/integration.invitations.test.ts` | invitations: hashed tokens, single use, expiry, withdrawal, a forwarded link refused for the wrong account, re-invitation replacing the old link, and cross-business isolation |
| `tests/integration.sharing.test.ts` | sharing: nothing visible until it is shared, link and person shares, immediate withdrawal, view-only refusing the bytes, one share being unusable to reach another file, and a shared project exposing only its own files |
| `tests/integration.message-feedback-route.test.ts` | the team's side of answer feedback: flagging an answer that went wrong, marking one reviewed without deleting the rating, refusing to overwrite what a customer said, refusing another business's conversation, and refusing somebody who may only look |
| `tests/integration.jobs-route.test.ts` | the processing history endpoint: a caller's own runs listed with the day's allowance, the reason a run failed kept, one caller never shown another's runs, two accounts on one address kept apart, a running job stopped, a stranger refused the stop and the run left untouched, and a stop with no id asking which one |
| `tests/integration.mini-apps.test.ts` | mini-apps: a module id outside the allowlist refused, an app that starts in the wrong order refused, the step cap, a run that really writes a file and attaches it to a project, a failed step recorded with the rest marked as never run, an app pointed at somebody else's file or project getting nowhere, the run log keeping the length of what was typed rather than the text, and the study chain — notes becoming a real paper in the runner's own history, filed into their project, refused another person's project without writing anything, and reporting *not configured* rather than inventing a paper |
| `tests/integration.permissions.test.ts` | the seven roles: the matrix only grants permissions that exist, owner-only things stay owner-only, each role gets exactly what its description promises, an unknown role is refused, a member of another business is no member, and a row written before support agents were renamed keeps the access it had |
| `tests/integration.documents.test.ts` | the document centre: numbering per business and per type, totals computed from the line items and never taken from the caller, the PDF filed as a real file, editing re-rendering and trashing exactly one old copy, deletion trashing rather than destroying, full cross-business isolation including search, and AI drafting that writes prose, saves nothing and refuses a reply in the wrong shape |
| `tests/integration.sales.test.ts` | AI lead qualification: a reading stays off the customer record until a person confirms it, confirming writes one dated and traceable note, unmentioned fields are dropped instead of stored blank, re-reading supersedes pending guesses but keeps confirmed ones, a silent customer is refused rather than guessed at, a missing provider fails loudly, and no business can touch another's leads |
| `tests/integration.search.test.ts` | unified search: tools found signed out with the rest honestly listed as not searched, a person's own files/projects/notes/apps found, another person's work and another business's customers never returned, automation shown to an owner but withheld from an agent with a reason, a LIKE wildcard escaped rather than matching everything, and trashed files dropped |
| `tests/integration.entitlements.test.ts` | plan limits and the API log: overrides that raise, clear and refuse nonsense, every advertised limit refusing something, a pending invitation counting as a seat but a re-invitation not, 429 rather than 403 when the API allowance is gone, query strings kept out of the log, routes grouped by pattern, pruning, and one business never seeing another's calls |
| `tests/integration.business-analytics.test.ts` | business analytics: a null success rate rather than 0% when nothing ran, the period actually excluding older rows, builder test runs left out, per-provider AI totals, one business never counting another's work, and a CSV export whose columns survive a workflow named with a comma and a quote |
| `tests/integration.email-sending.test.ts` | email a business connects itself: credentials saved but not trusted until a real message has gone out, the provider's own words kept when it refuses, an unreachable provider blamed on the network rather than us, re-verification forced when the key changes, the key never readable back, and one business never sending through another's provider |
| `tests/integration.notifications.test.ts` | notifications: delivery to the whole business, read state that belongs to one person rather than the business, preferences honoured both when written and when listed, an uncategorised type still delivered, deduplication, per-business separation of preferences, and a notification id from another business refused with a 404 |
| `tests/integration.workflows.test.ts` | automation: the action allowlist, the step cap, loops being inexpressible, condition and placeholder evaluation, cross-business isolation, draft protection, hourly run limits, idempotent replay of the same event, honest "not configured" for email and unconnected webhooks, AI output validated against the requested shape, and a real conversation driving a run |
| `tests/integration.workflow-routes.test.ts` | the automation HTTP edge: no session, invalid definitions rejected, cross-site writes refused, and 404 rather than another business's workflow |
| `tests/integration.study-routes.test.ts` | the HTTP edge: 401 with no session, ownership resolved from the session and not from the request body, 404 (not 403) across accounts, private download headers, input validation |
| `tests/downloader-*.test.ts` + `tests/integration.downloader.test.ts` | the video downloader, 465 tests: URL safety and SSRF, the provider adapters and their capability matrix, resolution and frame rate read out of real container bytes, HLS and DASH manifests, WebVTT subtitle assembly, the transfer engine with resume and bounded retries, job states, the HTTP edge, and the rule that no quality may be offered that the source never stated (see [docs/report-video-downloader.md](docs/report-video-downloader.md)) |
| `tests/unit.docs-counts.test.ts` | the numbers written in this README and in REPORT.md, derived from the registry so that prose cannot quietly fall behind the catalogue |
| `tests/downloader-limits.test.ts` | the ten deliberate limits: that each names a real error code, that none is dressed up as temporary, that no adapter advertises a capability the list denies, and that the interface renders all ten before anything is analysed |
| `tests/unit.pricing-truth.test.ts` | one price in one place: no page may write a price of its own, the product page's plan cards are built from the limits the server enforces, and nothing finite is called unlimited |
| `tests/integration.*` and the other `e2e/*.spec.ts` | the AI customer-service product — journey, isolation, widget, API, billing, privacy and the rest (listed in [docs/ai-customer-service.md](docs/ai-customer-service.md)) |

---

## Deploying to Vercel

1. Create a PostgreSQL database with `pgvector` (Neon and Supabase both work; see
   [docs/ai-customer-service.md](docs/ai-customer-service.md) for a step-by-step Supabase
   walkthrough).
2. Import the repository into Vercel.
3. Set `DATABASE_URL`, `AUTH_SECRET`, `ENCRYPTION_KEY`, `NEXT_PUBLIC_APP_URL`, plus any
   provider keys you want.
4. Run the migrations once against the production database:
   ```bash
   DATABASE_URL="postgresql://…" npm run db:migrate
   ```
5. Optional: set `CRON_SECRET` so the scheduled jobs in `vercel.json` can run.

The app is built for serverless: no long-lived processes, no local filesystem writes, no
custom WebSocket server, and uploads go to S3-compatible storage. The on-device tools add
no server cost at all.

---

## Security

- Most tools never transmit the file, which removes the risk rather than managing it.
- Uploads to the two server tools are size-capped, MIME-checked, extension-checked and
  content-sniffed, and rate-limited per IP.
- Provider keys are server-only; no secret is exposed through a `NEXT_PUBLIC_` variable.
- Sessions are HTTP-only, `SameSite=Lax`, signed, rotating cookies; passwords use scrypt.
- Every business query is scoped server-side — an ID from the client is never trusted.
- State-changing dashboard requests require a same-origin check (CSRF).
- Website imports and business-defined actions refuse private, loopback, link-local and
  metadata addresses (SSRF), with redirects re-checked.
- Third-party credentials are encrypted with AES-256-GCM; API keys are stored hashed.
- Archive extraction sanitises entry names, so a crafted ZIP cannot write outside its
  folder.

---

## Adding a tool

1. Write the engine as pure functions in `src/features/{area}/` and unit-test it.
2. Add the component in `src/features/{area}/components/{slug}.tsx`, built from the shared
   controls in `src/components/tools/ui.tsx`.
3. Register it in `src/lib/tools/registry.ts` — name, description, keywords, runtime,
   status — and add the dynamic import to `src/components/tools/tool-runtime.tsx`.

Navigation, search, the category page, related tools, the sitemap and the counts all pick it
up from the registry. `tests/unit.tools-registry.test.ts` fails if a registered tool has no
component, so a tool can never be advertised before it exists.
