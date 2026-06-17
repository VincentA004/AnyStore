# Anystore Vision

## Product Idea

Anystore is a casual AI storage/search app for everyday digital clutter.

The goal is not to become an enterprise knowledge base. The goal is to make a simple place where someone can drop random files, screenshots, receipts, notes, forms, warranties, leases, PDFs, and images, then find them later by asking naturally.

Core promise:

> Drop anything. Find it later by asking like a person.

Good examples:

- "Find my apartment lease renewal."
- "Where is that Target receipt for kitchen stuff?"
- "Show me the screenshot with the blue sneakers."
- "When does my AirPods warranty expire?"
- "Find the tax form I uploaded last month."
- "What did I save about my car insurance?"

This should feel closer to a smarter iCloud/Drive junk drawer than a formal document intelligence tool.

## Tone Shift

The current frontend has strong Fynopsis/data-room language. For Anystore, the UX should feel lighter, personal, and less knowledge-work focused.

Replace:

- "Dataroom" with "Anystore", "Library", "Stash", or "Space"
- "Documents" with "Stuff" or "Files"
- "Manage Documents" with "Add Stuff"
- "Upload File" with "Drop something in"
- "Query your documents" with "Ask about anything you saved"
- "Citations" with "Found in"
- "Question Bank", "Checklist Bank", "Diligence", "Issues" with simpler personal storage concepts

Avoid:

- RAG
- Agents
- Diligence
- Enterprise search
- Knowledge base
- Data room
- Workflow automation

Prefer:

- Find
- Drop
- Saved
- Recent
- Receipts
- Screenshots
- Forms
- Notes
- Warranties
- Personal

## MVP UX

The MVP should have three main surfaces.

### 1. Home / Library

This should be the default internal screen.

Expected elements:

- Big search bar: "Find anything you saved..."
- Drag/drop upload entry point
- Recent uploads
- Simple file list or grid
- Category chips such as Receipts, Screenshots, Forms, Notes, Warranties
- Lightweight metadata like tags, date, and source

### 2. Ask

This is the natural-language search experience.

Expected behavior:

- User asks a casual question
- App retrieves relevant files
- Answer appears with source references
- Matching files are shown first, answer second
- User can open the original item

Important: chat should not be the whole product. The app should still feel like a searchable library.

### 3. Item Detail

When opening a file/item:

- Show preview when possible
- Show summary
- Show detected tags
- Show relevant dates/entities
- Show "why this matched" when opened from search
- Provide original file access

## Current Frontend Reuse

The existing Fynopsis frontend is reusable because it already has:

- A protected app shell
- Sidebar navigation
- Dataroom/dashboard card view
- Library table
- Folder tree
- Upload overlay
- File search input
- Right-side query panel
- Tags and document summaries

The key conversion is product language and information architecture, not a total rebuild.

Useful existing routes after local demo bypass:

```txt
/dashboard
/dataroom/anystore/home
```

Useful existing components:

```txt
src/app/pages/Dashboard.tsx
src/app/pages/DataroomPage.tsx
src/components/tabs/library/table/Files.tsx
src/components/tabs/library/table/UltraTable.tsx
src/components/tabs/library/table/DragDrop.tsx
src/components/tabs/library/querying/DetailsSection.tsx
```

## Frontend Conversion Plan

### Phase 1: Rename And Simplify

Scope:

- Rename "Your Datarooms" to "Your Libraries" or "Your Anystore"
- Rename "Add Dataroom" to "New Stash" or remove for single-user MVP
- Rename "Manage Documents" to "Add Stuff"
- Rename "Search files across project..." to "Find anything you saved..."
- Rename "Query your documents..." to "Ask about your stuff..."
- Hide/remove Question Bank and Checklist Bank from dashboard
- Hide/remove Diligence, Issues, Users, Activity for the casual version

Goal:

Make the app stop feeling like Fynopsis without changing backend behavior yet.

### Phase 2: Make Upload Primary

Scope:

- Put upload/drop affordance on the first screen
- Keep the existing drag/drop modal
- Change modal title from "File Uploading:" to "Drop Stuff In"
- Keep supported file type validation
- Keep ZIP support if it remains reliable
- Make Microsoft import optional, not visually dominant

Goal:

The user should understand in five seconds that they can throw files into the app.

### Phase 3: Make Search The Product

Scope:

- Make natural search prominent
- Show matching files clearly
- Keep source-backed answer panel
- Rename source/citation language to "Found in"
- Add empty states with casual prompts:
  - "Find my receipt from last month"
  - "What warranty expires soon?"
  - "Show screenshots about gift ideas"

Goal:

Search should feel like remembering, not querying.

### Phase 4: Add Personal Categories

Scope:

- Auto tags/categories:
  - Receipt
  - Screenshot
  - Form
  - Warranty
  - Lease
  - Note
  - Image
  - PDF
- Category filters
- Recent uploads
- Favorites/saved items

Goal:

Give users structure without forcing them to organize folders manually.

## Simple Backend Architecture

For v1, keep the backend as managed and boring as possible.

Recommended shape:

```txt
Vercel frontend
  -> Supabase Auth + Postgres metadata
  -> Azure Function API
    -> Microsoft Foundry Agent / file_search
    -> Azure Blob Storage
    -> Azure AI Search-backed vector store
```

The frontend should never call Foundry directly. It should call the backend API.

Reasons:

- Keep Foundry/Azure credentials server-side
- Enforce tenant ownership
- Hide vector store IDs
- Control cost and usage
- Centralize upload/query/delete logic

## Multi-Tenant Model

For the first public/beta version, support roughly 100 users with simple workspace isolation.

Use one workspace per user by default, but model it as a workspace so sharing can be added later.

Basic tables:

```txt
profiles
- id
- email
- name

workspaces
- id
- owner_id
- name
- azure_vector_store_id
- created_at

workspace_members
- workspace_id
- user_id
- role

documents
- id
- workspace_id
- azure_file_id
- filename
- content_type
- size_bytes
- status
- created_at

queries
- id
- workspace_id
- user_id
- question
- answer
- created_at
```

Recommended isolation:

```txt
one Foundry/vector store per workspace
```

For v1, every user can get one private workspace named "My Anystore".

## Backend API

Minimal API routes:

```txt
GET    /me
GET    /workspaces
POST   /documents/upload
GET    /documents
DELETE /documents/:id
POST   /query
GET    /queries
```

Simple upload flow:

```txt
Frontend uploads file
  -> Azure Function verifies Supabase JWT
  -> backend resolves workspace
  -> backend stores file / sends file to Foundry vector store
  -> backend saves document metadata in Supabase
  -> frontend shows indexing status
```

Simple query flow:

```txt
Frontend sends question + workspace_id
  -> Azure Function verifies membership
  -> backend looks up azure_vector_store_id
  -> backend calls Foundry agent/file_search
  -> backend returns answer + source file references
```

Do not trust vector store IDs from the frontend.

## Beta Limits

Put limits in from day one to control cost.

Suggested beta limits:

```txt
1 workspace per user
100 files per workspace
25 MB per file
500 MB total storage
50 questions per day
```

These can be increased later.

## What To Avoid In V1

Avoid building:

- Custom vector database logic
- Custom chunking system
- Custom OCR/parsing pipeline
- Complex agent orchestration
- Team admin panels
- Billing
- Enterprise permissions
- Drive/iCloud connectors
- Complex extraction templates

Use managed services first. Build product taste and retrieval UX first.

## Immediate Next Steps

1. Keep the local demo bypass so internals stay visible during redesign.
2. Rename visible Fynopsis/dataroom language to Anystore language.
3. Strip dashboard tabs down to the personal-library flow.
4. Make `/dataroom/anystore/home` feel like the real app first screen.
5. Replace the current table-first layout with search/upload/recent as the primary experience.
6. Keep the old table as a secondary "All Files" view.
7. Wire the real backend only after the frontend direction feels right.

