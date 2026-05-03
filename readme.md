# cs4249-pg04

Group 04 project for **CS4249 — Phenomena and Theories of Human-Computer Interaction** (NUS).

This repo hosts a small web-based user study comparing two splitwise interface variants (**System A** and **System B**). Participants land on a launcher page, are routed to one of the two systems, and their interactions are logged and pushed to a Google Form for later analysis.

## Live site

The study is served via GitHub Pages:

- Launcher: https://zhengliang19.github.io/cs4249-pg04/main.html
- System A: https://zhengliang19.github.io/cs4249-pg04/SystemA.html
- System B: https://zhengliang19.github.io/cs4249-pg04/SystemB.html

## Files

|File                 |Purpose                                                                                                                                                                  |
|---------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|`main.html`          |Landing page where the participant picks System A or System B.                                                                                                           |
|`SystemA.html`       |First interface variant under evaluation.                                                                                                                                |
|`SystemB.html`       |Second interface variant under evaluation.                                                                                                                               |
|`logging.js`         |Client-side logging utilities included by the system pages.                                                                                                              |
|`test-loggingjs.html`|Standalone harness for sanity-checking that logging works.                                                                                                               |
|`googlesender.py`    |One-off Python script that scrapes a Google Form and emits a JS `sendNetworkLog(...)` function pointed at that form, used to ship logs cross-domain via an image request.|

## Running locally

Everything is static HTML/JS, so just open `main.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000/main.html
```

## Regenerating the log sender

If the backing Google Form changes, regenerate the submitter JS:

```bash
python3 googlesender.py "https://docs.google.com/forms/d/e/<FORM_ID>/viewform" > submit.js
```

Then drop the generated `sendNetworkLog(...)` function into `logging.js` (or include `submit.js` directly). The form should be built entirely with **short-answer text** questions, one per logged field.

## Notes

- Logs are sent by setting an `Image().src` to the form’s `formResponse` URL, which sidesteps CORS at the cost of being fire-and-forget — check the linked Google Form / Sheet to confirm entries arrived.
