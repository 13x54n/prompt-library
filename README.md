# Prompt Library Guide

This document explains how backend services and the frontend are integrated today, including authentication, prompt workflows, notifications, and key product features.

## 1) System Overview

The app is split into a Next.js frontend and three Node.js backend microservices:

- `frontend` (Next.js App Router)
- `backend/services/auth-service` (user identity, profile, follow graph)
- `backend/services/prompt-service` (prompts, discussions, pull requests, upvotes, forks)
- `backend/services/notification-service` (notification API + async event consumer)

Shared infrastructure:

- Firebase Auth (client sign-in + server-side ID token verification)
- MongoDB (primary datastore for each service domain)
- RabbitMQ (domain event bus from auth/prompt services to notification service)

## 2) Runtime Topology

- Frontend calls backend services directly via service-specific base URLs in `frontend/lib/api.ts` and `frontend/lib/auth.ts`.
- Authenticated frontend requests include `Authorization: Bearer <firebase-id-token>`.
- `auth-service` and `prompt-service` publish domain events to RabbitMQ exchange `domain.events`.
- `notification-service` consumes those events and writes user-facing notifications.

## 3) Frontend -> Service Base URLs

Configured by env vars with localhost fallbacks:

- `NEXT_PUBLIC_AUTH_SERVICE_URL` -> default `http://localhost:5001`
- `NEXT_PUBLIC_PROMPT_SERVICE_URL` -> default `http://localhost:5002`
- `NEXT_PUBLIC_NOTIFICATION_SERVICE_URL` -> default `http://localhost:5003`

## 4) Authentication Integration

### 4.1 Sign-in lifecycle

1. User signs in through Firebase in frontend (`signInWithGoogle`).
2. Frontend obtains Firebase ID token from authenticated user.
3. Frontend calls `POST /api/auth/record-login` on auth-service with Bearer token.
4. Auth-service verifies token with Firebase Admin, resolves canonical `uid/email`, upserts user document, and auto-generates username when needed.
5. Frontend fetches backend profile via `GET /api/auth/me`.
6. `AuthProvider` builds `currentUser` from backend profile data (backend is source of truth for profile fields).

### 4.2 Token verification pattern

Protected routes in services use middleware that:

- extracts Bearer token
- verifies with Firebase Admin
- attaches `req.uid`
- returns `401` for missing/invalid token
- returns `503` when server auth credentials are not configured

Prompt service also supports optional auth for read routes where personalization is useful (for example upvote status and PR permissions).

### 4.3 Profile and username synchronization

- Profile updates: `PATCH /api/auth/me`
- Username availability check: `GET /api/auth/check-username`
- After username change, auth-service best-effort calls prompt-service:
  - `POST /api/prompts/sync-username`
  - Keeps authored prompt/discussion/PR history discoverable by updated username.

## 5) Auth Service Responsibilities

Primary areas:

- current user profile (`/api/auth/me`)
- login recording (`/api/auth/record-login`)
- username availability + updates
- public profile lookup (`/api/users/profile/:identifier`)
- follow graph (`follow`, `unfollow`, `followers`, `following`, `follow-status`, `me/following-uids`)
- user search (`/api/users/search`)

Event publishing:

- `user.followed` published on successful follow action.

## 6) Prompt Service Responsibilities

### 6.1 Prompt domain

- list/search prompts (`GET /api/prompts`)
- get prompt by id (`GET /api/prompts/:id`) and increments views
- create/update/delete prompt (auth + ownership checks)
- fork prompt (`POST /api/prompts/:id/fork`)
- toggle upvote (`POST /api/prompts/:id/upvote`)
- upvote status (`GET /api/prompts/:id/upvote-status`)
- contributors summary (`GET /api/prompts/:id/contributors`)
- activity feeds (`/api/prompts/activity/:username`, `/api/prompts/activity/by-uid/:uid`)
- global discussion search (`/api/prompts/search-discussions`)

### 6.2 Discussions

Mounted under `/:id/discussions`:

- list questions + answers
- create question (auth)
- create answer (auth)
- accept answer (prompt owner only)
- vote question/answer (auth toggle behavior)

### 6.3 Pull requests for prompts

Mounted under `/:id/pull-requests`:

- list PRs
- create PR (auth)
- get PR detail
- PR comments/discussions (auth for write)
- merge PR (prompt owner only)
- close PR (prompt owner or PR author)

When merged, proposed prompt fields (`proposedPrimaryPrompt`, `proposedGuide`, `proposedTags`) are applied to the target prompt.

### 6.4 Prompt-service events

Prompt service emits:

- `prompt.upvoted`
- `prompt.forked`
- `discussion.question.created`
- `discussion.answer.created`
- `pr.created`
- `pr.commented`
- `pr.merged`

## 7) Notification Service Responsibilities

### 7.1 API

Authenticated notification endpoints:

- list notifications with cursor pagination (`GET /api/notifications`)
- unread count (`GET /api/notifications/unread-count`)
- mark one read (`POST /api/notifications/:id/read`)
- mark all read (`POST /api/notifications/read-all`)
- archive one (`POST /api/notifications/:id/archive`)
- archive all (`POST /api/notifications/archive-all`)

### 7.2 Event consumer pipeline

1. Subscribes to RabbitMQ exchange `domain.events`.
2. Consumes routing key pattern from env (default `#`).
3. Validates event envelope (`eventId`, `eventType`, `payload`).
4. Maps event to one or multiple notification records.
5. Writes notifications to MongoDB.
6. Retries transient failures via retry queue and dead-letters unrecoverable events.

### 7.3 Event-to-notification mapping

Mapped event types:

- `prompt.forked` -> `prompt_forked`
- `prompt.upvoted` -> `prompt_upvoted`
- `discussion.question.created` -> `discussion_question_on_my_prompt`
- `discussion.answer.created` -> `discussion_answered` / `discussion_replied`
- `pr.created` -> `pr_created`
- `pr.commented` -> `pr_commented`
- `pr.merged` -> `pr_merged`
- `user.followed` -> `user_followed`

Mapper avoids self-notifications by comparing `actorUid` and recipient UID.

## 8) Domain Event Contract

Published events use a consistent envelope:

- `eventId` (UUID)
- `eventType` (topic key, e.g. `pr.created`)
- `occurredAt` (ISO timestamp)
- `payload` (event-specific body)

Exchange:

- name: `domain.events`
- type: `topic`
- durable publishing with confirm channels in publishers

## 9) Frontend Feature Integration Map

### 9.1 App routes (high level)

- `/` -> prompt feed and exploration
- `/login` -> Firebase sign-in
- `/prompts/new` -> create prompt
- `/prompts/[id]` -> prompt detail, upvote/fork/edit/discussions/PR sidebar
- `/prompts/[id]/pull-requests` -> pull request page
- `/profile/[username]` -> profile + contribution activity
- `/profile/edit` -> profile editing and username updates
- `/notifications` -> full notifications center
- `/requests` and `/requests/new` -> request flow pages

### 9.2 Data access layer

- `frontend/lib/auth.ts` handles Firebase session + auth-service profile sync.
- `frontend/components/auth-provider.tsx` keeps unified client auth state.
- `frontend/lib/api.ts` centralizes all calls to:
  - auth-service user/profile/follow endpoints
  - prompt-service prompt/discussion/PR endpoints
  - notification-service notification endpoints

### 9.3 Prompt detail page integration

The prompt page composes:

- prompt core data
- discussion data
- pull request summaries
- contributor data + profile hydration

using parallel fetches before rendering.

## 10) Ownership and Authorization Rules

Examples of enforced rules:

- only authenticated users can create/update domain content
- only prompt owner can:
  - edit/delete prompt
  - accept discussion answers
  - merge pull requests
- prompt owner or PR author can close PR
- users cannot fork their own prompts
- users cannot follow themselves

## 11) Local Development Notes

### 11.1 Required services

- MongoDB
- RabbitMQ (needed for async notification flow)
- Firebase Admin credentials for backend token verification

### 11.2 Start order recommendation

1. Start MongoDB and RabbitMQ
2. Start backend services:
   - auth-service (`5001`)
   - prompt-service (`5002`)
   - notification-service (`5003`)
3. Start frontend (`3000`)

## 12) Health and Observability

Health endpoints:

- `auth-service` -> `GET /health`
- `prompt-service` -> `GET /health`
- `notification-service` -> `GET /health`

Each service logs request traffic (`morgan`) and startup/runtime failures to console.

## 13) Security Model Summary

- Firebase ID token is the primary auth artifact.
- Backend trust is based on server-side token verification, not user-submitted UID/email.
- CORS is environment-aware and origin-restricted in production.
- Basic rate limiting is enabled in each service.
- Notification writes are server-side only and recipient-filtered at query/update time.

## 14) Recent Behavior Updates

### 14.1 Unlisted prompt visibility (owner-safe private behavior)

- `visibility: "unlisted"` prompts are hidden from non-owners across listing and profile/activity queries.
- Owners can still access their own unlisted prompts from direct prompt routes and profile views.
- Frontend server-rendered prompt/profile pages forward auth context so owner-only visibility checks work correctly during SSR.
- Prompt owners can change visibility in the prompt edit flow (`public <-> unlisted`).
- Prompt owners can delete prompts regardless of visibility (`public` or `unlisted`), matching repository-style ownership behavior.

### 14.2 Discussion vote affordance

- Discussion voting is available per question, answer, and reply.
- UI now uses explicit text actions (`Upvote (...)`) adjacent to discussion actions (such as `Reply`) instead of icon-only affordance, to reduce ambiguity.

### 14.3 Notification unread count sync

- Bell badge unread count now updates instantly without page refresh when notifications are:
  - opened/marked read
  - marked all read
  - archived individually
  - archived in bulk
- Implemented via lightweight client event sync between notifications center and header bell dropdown.

## 15) Current Limitations / TODO Candidates

- No centralized API gateway/BFF layer (frontend calls services directly).
- Event schemas are implicit in code, not versioned externally.
- Cross-service workflows are best-effort in some places (for example username sync call from auth-service to prompt-service).
- Service-specific READMEs are intentionally concise; this guide is the canonical integration reference.
