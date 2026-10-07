# Manual API tests (FastAPI `/docs`)

Use this checklist in **Swagger UI** while the API is running.

## Setup

1. From `backend/`:

   ```powershell
   .venv\Scripts\uvicorn app.main:app --reload --port 8000
   ```

2. Open **http://127.0.0.1:8000/docs**

3. Expand the **forms** tag. Each test below maps to one operation in Swagger: **Try it out** → fill parameters/body → **Execute** → compare **Code** and **Response body** to the expected result.

4. Keep a note of `id` from **POST /api/forms** (create). Replace `{form_id}` in steps with that number.

---

## A. Happy path (run in order)

| Step | Operation in `/docs` | Input | Expected |
|------|----------------------|-------|----------|
| A1 | `POST /api/forms` | Body: `{"title": "Manual test form"}` | **201**. `status` is `draft`, `questions` is `[]`, `response_count` is `0`, `slug` is `manual-test-form` (or `manual-test-form-2` if slug taken). |
| A2 | `GET /api/forms` | (none) | **200**. List includes the form from A1, ordered by `updated_at` (newest first). |
| A3 | `GET /api/forms/{form_id}` | `form_id` = id from A1 | **200**. Same title, full fields including `theme_color` `#4FB0AE`, thank-you defaults. |
| A4 | `PATCH /api/forms/{form_id}` | Body: `{"title": "Renamed form"}` | **200**. `title` updated; **`slug` unchanged** from A1. |
| A5 | `PATCH /api/forms/{form_id}` | Body: `{"theme_color": "#FF5500", "thank_you_title": "Thanks!", "thank_you_message": "We got your answers."}` | **200**. Theme and thank-you fields updated. |
| A6 | `POST /api/forms/{form_id}/duplicate` | `form_id` from A1 | **201**. New `id`, title `Renamed form (copy)`, `status` `draft`, `response_count` `0`, new `slug`. |
| A7 | `GET /api/forms/{form_id}` | Original id from A1 | **200**. Original `slug` still the same as after A1. |
| A8 | `DELETE /api/forms/{form_id}` | Duplicate id from A6 | **204**. Empty body. |
| A9 | `DELETE /api/forms/{form_id}` | Original id from A1 | **204**. Empty body. |
| A10 | `GET /api/forms/{form_id}` | Deleted id | **404**. `{"detail":"Form not found"}` |

---

## B. Validation and error cases

Run these as separate tries. Failed writes must **not** create or change forms (re-check with `GET /api/forms` if unsure).

| Step | Operation | Input | Expected |
|------|-----------|-------|----------|
| B1 | `POST /api/forms` | `{"title": "   "}` | **422** (title empty after strip). |
| B2 | `POST /api/forms` | `{"title": "<201 character string>"}` | **422** (title too long). Tip: paste 201× `a`. |
| B3 | `POST /api/forms` | `{"title": "OK", "extra": true}` | **422** (extra field forbidden). |
| B4 | `PATCH /api/forms/{form_id}` | `{}` on an existing form | **422**. `detail`: `No fields to update`. |
| B5 | `PATCH /api/forms/{form_id}` | `{"theme_color": "not-a-hex"}` | **422**. `detail`: `Invalid theme color`. |
| B6 | `GET /api/forms/{form_id}` | `form_id` = `999999` | **404**. `Form not found`. |
| B7 | `DELETE /api/forms/{form_id}` | `form_id` = `999999` | **404**. `Form not found`. |
| B8 | `POST /api/forms/{form_id}/duplicate` | `form_id` = `999999` | **404**. `Form not found`. |

---

## C. Slug behavior (create two forms)

| Step | Operation | Input | Expected |
|------|-----------|-------|----------|
| C1 | `POST /api/forms` | `{"title": "Hello World!!"}` | **201**. `slug` = `hello-world`. |
| C2 | `POST /api/forms` | `{"title": "Hello World!!"}` again | **201**. `slug` = `hello-world-2` (or next free suffix). |
| C3 | `PATCH` first form | `{"title": "Totally different title"}` | **200**. `slug` still `hello-world` (rename does not change slug). |

Clean up with **DELETE** if you like.

---

## D. Duplicate with questions (after Phase 4)

When question routes exist:

1. Create a form (A1).
2. Add questions via `POST /api/forms/{form_id}/questions`.
3. **Duplicate** the form.
4. **GET** the copy: same number of questions and configs, new question `id`s, `response_count` `0`.

Until Phase 4 is implemented, skip section D.

---

## Quick reference: status codes

| Code | Meaning in this API |
|------|---------------------|
| 200 | OK (GET, PATCH) |
| 201 | Created (POST form, POST duplicate) |
| 204 | Deleted (DELETE, no body) |
| 404 | Form not found |
| 409 | Could not generate unique slug (rare) |
| 422 | Invalid body or business rule (`detail` string or Pydantic errors) |

---

## Optional: raw JSON bodies for Swagger

Copy into the request body editor:

**Create**

```json
{"title": "Manual test form"}
```

**Patch title**

```json
{"title": "Renamed form"}
```

**Patch design / thank-you**

```json
{
  "theme_color": "#FF5500",
  "thank_you_title": "Thanks!",
  "thank_you_message": "We got your answers."
}
```

**Invalid (extra field)**

```json
{"title": "OK", "extra": true}
```

**Invalid (empty patch)**

```json
{}
```
