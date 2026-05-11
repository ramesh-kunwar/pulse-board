# Pulse Board — API Design Contract

## Table of Contents

- [Base URL & Auth](#base-url--auth)
- [Status Code Reference](#status-code-reference)
- [Polls](#polls)
- [Responses](#responses)
- [Poll Lifecycle](#poll-lifecycle)
- [Analytics](#analytics)
- [Decision Log](#decision-log)

---

## Base URL & Auth

```
Base URL: /api
Auth: JWT Bearer token → Authorization: Bearer <token>
```

- Endpoints marked **Creator only** require the caller's JWT `userId` to match `polls.creator_id` in the database.
- Endpoints marked **Public** require no token.
- Endpoints marked **Auth required** need a valid JWT but any authenticated user qualifies.

---

## Status Code Reference

| Code | Meaning              | When Used in Pulse Board                                                   |
| ---- | -------------------- | -------------------------------------------------------------------------- |
| 200  | OK                   | Successful GET, DELETE                                                     |
| 201  | Created              | Successful POST that creates a resource                                    |
| 400  | Bad Request          | Missing or malformed fields                                                |
| 401  | Unauthorized         | No token / invalid token                                                   |
| 403  | Forbidden            | Authenticated but not allowed to perform this action                       |
| 404  | Not Found            | Resource doesn't exist — also returned when hiding existence for security  |
| 409  | Conflict             | Duplicate response submission                                              |
| 410  | Gone                 | Poll has expired                                                           |
| 422  | Unprocessable Entity | Valid format but violates a business rule (e.g. publishing an ACTIVE poll) |

---

## Polls

### `POST /api/polls`

Create a new poll with questions and options.

|             |                                   |
| ----------- | --------------------------------- |
| **Auth**    | Required (any authenticated user) |
| **Success** | `201 Created`                     |

**Request Body**

```json
{
  "title": "string — required",
  "isAnonymous": "boolean — required",
  "expiresAt": "ISO 8601 timestamp — optional",
  "questions": [
    {
      "question_text": "string — required",
      "isMandatory": "boolean — required",
      "order": "number — required",
      "options": [
        { "option_text": "string — required", "order": "number — required" }
      ]
    }
  ]
}
```

**Response**

```json
{
  "id": "uuid",
  "title": "string",
  "status": "ACTIVE",
  "isAnonymous": "boolean",
  "expiresAt": "timestamp | null",
  "createdAt": "timestamp",
  "questions": [
    {
      "id": "uuid",
      "question_text": "string",
      "isMandatory": "boolean",
      "order": "number",
      "options": [{ "id": "uuid", "option_text": "string", "order": "number" }]
    }
  ]
}
```

> `creator_id` is extracted from JWT on the server — never sent in request body.
> Poll status is always `ACTIVE` immediately on creation. No draft state.

---

### `GET /api/polls`

Get all polls created by the logged-in user. Used for the creator dashboard.

|             |          |
| ----------- | -------- |
| **Auth**    | Required |
| **Success** | `200 OK` |

**Response**

```json
[
  {
    "id": "uuid",
    "title": "string",
    "status": "ACTIVE | CLOSED | PUBLISHED",
    "isAnonymous": "boolean",
    "expiresAt": "timestamp | null",
    "createdAt": "timestamp",
    "_count": { "responses": "number" }
  }
]
```

> Returns summary only — no questions or options. Full detail is fetched via `GET /api/polls/:id`.

---

### `GET /api/polls/:id`

Get a single poll. Response shape varies based on who is calling and the poll's current status.

|             |                                                                |
| ----------- | -------------------------------------------------------------- |
| **Auth**    | Optional (public endpoint — behavior changes if authenticated) |
| **Success** | `200 OK`                                                       |

**Decision Tree**

```
if caller is the creator (JWT userId === polls.creator_id):
  status = ACTIVE    → poll details + questions + options + live response count
  status = CLOSED    → poll details + questions + options + full analytics
  status = PUBLISHED → poll details + questions + options + full analytics

if caller is NOT the creator (or unauthenticated):
  status = ACTIVE    → poll details + questions + options  (respondent form view)
  status = CLOSED    → 403 Forbidden  (results not public yet)
  status = PUBLISHED → poll details + aggregated results  (public results view)
```

**Error Responses**

| Scenario                              | Code            |
| ------------------------------------- | --------------- |
| Poll ID not found                     | `404 Not Found` |
| Poll is CLOSED, caller is not creator | `403 Forbidden` |

---

### `DELETE /api/polls/:id`

Permanently delete a poll and all associated data.

|             |                         |
| ----------- | ----------------------- |
| **Auth**    | Required (creator only) |
| **Success** | `200 OK`                |

**Error Responses**

| Scenario                          | Code            |
| --------------------------------- | --------------- |
| Poll not found                    | `404 Not Found` |
| Authenticated but not the creator | `404 Not Found` |

> Returns `404` even when poll exists but caller doesn't own it — never confirm resource existence to non-owners.
> CASCADE delete in DB handles questions, options, responses, and response_answers automatically.

---

## Responses

### `POST /api/polls/:id/responses`

Submit a response to a poll.

|             |                                                                 |
| ----------- | --------------------------------------------------------------- |
| **Auth**    | Optional for anonymous polls. Required for non-anonymous polls. |
| **Success** | `201 Created`                                                   |

**Request Body**

```json
{
  "answers": [
    {
      "question_id": "uuid — required",
      "option_id": "uuid — required"
    }
  ]
}
```

**Response**

```json
{
  "id": "uuid",
  "poll_id": "uuid",
  "createdAt": "timestamp"
}
```

**Error Responses**

| Scenario                                 | Code                       |
| ---------------------------------------- | -------------------------- |
| Poll not found                           | `404 Not Found`            |
| Poll has expired                         | `410 Gone`                 |
| Poll is CLOSED or PUBLISHED              | `403 Forbidden`            |
| Non-anonymous poll, no token provided    | `401 Unauthorized`         |
| Authenticated user submitting twice      | `409 Conflict`             |
| Mandatory question not answered          | `422 Unprocessable Entity` |
| Option ID doesn't belong to the question | `422 Unprocessable Entity` |

> `submittedBy` is extracted from JWT if present. If poll is anonymous, `submittedBy` is stored as `null`.
> Duplicate prevention for anonymous polls is best-effort via IP rate limiting — accepted limitation.

---

## Poll Lifecycle

### `POST /api/polls/:id/close`

Close a poll. Prevents further response submissions.

|                  |                         |
| ---------------- | ----------------------- |
| **Auth**         | Required (creator only) |
| **Success**      | `200 OK`                |
| **Request Body** | None                    |

**Response**

```json
{
  "id": "uuid",
  "status": "CLOSED"
}
```

**Error Responses**

| Scenario                            | Code                       |
| ----------------------------------- | -------------------------- |
| Poll not found                      | `404 Not Found`            |
| Caller is not the creator           | `404 Not Found`            |
| Poll is already CLOSED or PUBLISHED | `422 Unprocessable Entity` |

---

### `POST /api/polls/:id/publish`

Publish a poll. Makes aggregated results publicly visible at the same poll link.

|                  |                         |
| ---------------- | ----------------------- |
| **Auth**         | Required (creator only) |
| **Success**      | `200 OK`                |
| **Request Body** | None                    |

**Response**

```json
{
  "id": "uuid",
  "status": "PUBLISHED"
}
```

**Error Responses**

| Scenario                              | Code                       |
| ------------------------------------- | -------------------------- |
| Poll not found                        | `404 Not Found`            |
| Caller is not the creator             | `404 Not Found`            |
| Poll is ACTIVE (must be CLOSED first) | `422 Unprocessable Entity` |
| Poll is already PUBLISHED             | `422 Unprocessable Entity` |

> Status transition is strictly: `ACTIVE → CLOSED → PUBLISHED`. No skipping steps.

---

## Analytics

### `GET /api/polls/:id/analytics`

Get aggregated analytics for a poll.

|             |                         |
| ----------- | ----------------------- |
| **Auth**    | Required (creator only) |
| **Success** | `200 OK`                |

**Response**

```json
{
  "pollId": "uuid",
  "totalResponses": "number",
  "questions": [
    {
      "questionId": "uuid",
      "question_text": "string",
      "totalAnswers": "number",
      "options": [
        {
          "optionId": "uuid",
          "option_text": "string",
          "count": "number",
          "percentage": "number"
        }
      ]
    }
  ]
}
```

**Error Responses**

| Scenario                  | Code            |
| ------------------------- | --------------- |
| Poll not found            | `404 Not Found` |
| Caller is not the creator | `404 Not Found` |

> `percentage` is computed as `(count / totalAnswers) * 100` per question, not per total responses.
> Analytics are computed on every request — no caching for hackathon scope.

---

## Decision Log

Key design decisions made during Phase 2 and the reasoning behind them.

| Decision              | Chosen Approach                        | Reason                                                                     |
| --------------------- | -------------------------------------- | -------------------------------------------------------------------------- |
| Close vs Publish      | Two separate endpoints                 | Different actions, different validations, prevents accidental auto-publish |
| Status transitions    | ACTIVE → CLOSED → PUBLISHED only       | Enforced in service layer, not just DB enum                                |
| Edit poll             | Not supported                          | Editing after responses creates data integrity issues                      |
| Browse all polls      | Not supported for respondents          | Respondents always access polls via shared link                            |
| `GET /api/polls/:id`  | Single endpoint, three response shapes | Poll URL never changes — backend decides view based on status + caller     |
| Non-owner DELETE      | Returns 404 not 403                    | Never confirm resource existence to non-owners (security)                  |
| `submittedBy` source  | Extracted from JWT server-side         | Never trust client to send their own user ID                               |
| Anonymous duplicates  | Best-effort IP rate limiting           | No perfect solution — accepted limitation                                  |
| Analytics computation | On-request, no cache                   | Sufficient for hackathon scale                                             |
