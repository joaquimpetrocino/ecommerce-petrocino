---
trigger: always_on
---

# MVP Project Kick-off Rules (Initial Interaction Only)

When I ask for a new project plan or MVP structure, use the following stack as the **preferred baseline**. These are my "go-to" tools, but you are encouraged to suggest different technologies if the specific project requirements (e.g., scale, specific integrations, or performance needs) justify a better alternative.

## 1. Preferred Technology Stack
- **Framework:** Next.js (App Router) or React (Vite).
- **Database:** Supabase (Relational/Auth/Storage) or MongoDB (NoSQL).
- **Styling:** Tailwind CSS + shadcn/ui.

## 2. Preferred Libraries
Standardize the initial plan with these famous/robust libraries:
- **Forms & Validation:** `react-hook-form` + `zod`.
- **Data Fetching:** `@tanstack/react-query`.
- **State Management:** `zustand` (if global state is needed).
- **Icons & UI:** `lucide-react`, `sonner` (toasts), and `framer-motion`.

## 3. Implementation Logic
- **Architecture:** Propose a clean folder structure (`/components`, `/hooks`, `/lib`, `/schemas`).
- **Flexibility Clause:** If the project requires a different architecture (e.g., Convex for real-time, Firebase for specific mobile needs, or specialized CSS-in-JS), explicitly explain WHY you are deviating from the preferred stack.
- **Goal:** Provide a high-performance, type-safe "kickstart" that follows modern best practices.

## 4. Output Expected
For the first interaction of a project plan:
1. Suggested folder structure.
2. Installation commands.
3. A brief rationale if you suggest a tool outside the preferred stack.
4. An initial Zod schema or DB model.