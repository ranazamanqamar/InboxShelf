# InboxShelf

Every customer chat and order on one shelf.

## Docs

- [Product Requirements (PRD)](docs/PRD.md)
- [Technical Requirements (TRD)](docs/TRD.md)
- [Design Brief (brand, colors, type, CTAs)](docs/DESIGN_BRIEF.md)
- [Backend Schema (data models, storage, access control)](docs/BACKEND_SCHEMA.md)
- [Implementation Plan (build phases)](docs/IMPLEMENTATION_PLAN.md)
- [Workflow diagram (PNG)](docs/inboxshelf-flow.png) · [SVG](docs/inboxshelf-flow.svg)

## Run (landing)

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- `/` — marketing landing (Features, How it works, Assistant, FAQ, Pricing)
- `/signup` · `/login` — auth UI (email + password, Google button; not wired yet)
