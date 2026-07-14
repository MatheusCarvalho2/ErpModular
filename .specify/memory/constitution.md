<!--
Sync Impact Report:
- Version change: (template placeholders) → 1.0.0
- Modified principles: [PRINCIPLE_*] → Automated Testing, Seed When Needed,
  Internationalization (i18n), Spec-Driven Delivery, Simplicity
- Added sections: Quality Gates; Governance (concrete)
- Removed sections: none (replaced template placeholders)
- Templates requiring updates:
  - .specify/templates/plan-template.md ✅
  - .specify/templates/spec-template.md ✅
  - .specify/templates/tasks-template.md ✅
  - .cursor/rules/erp-modular-principles.mdc ✅ (agent guidance)
  - specs/002-automated-tests-seed/spec.md ✅ (aligned)
  - README.md ⚠ pending (optional one-liner pointing to constitution)
- Follow-up TODOs: none
-->

# ErpModular Constitution

## Core Principles

### I. Automated Testing (Whenever Possible)

Every feature that exposes observable behavior MUST ship with automated
tests covering its critical paths. Prefer end-to-end or integration checks
for user journeys; add focused unit checks for non-trivial pure logic.

If automated coverage is genuinely impractical (purely visual polish with
no assertable outcome, one-off docs, or exploratory spikes), the feature
spec or tasks MUST document the exception and a manual verification step.
Absence of tests without a documented exception is a compliance failure.

**Rationale**: Regressions at the ERP entry point and future modules must
be caught without relying on tribal knowledge or ad-hoc checklists.

### II. Seed When Necessary

Whenever a feature requires predictable data to develop, demo, or test
(users, companies, memberships, domain fixtures), the project MUST provide
or extend an idempotent seed that creates those fixtures and documents
credentials/purpose in Portuguese (pt-BR).

Seed only what is necessary for the feature's scenarios. Do not invent
unrelated domain data. Re-running seed MUST NOT duplicate managed fixtures.

**Rationale**: Manual UI setup blocks automation and slows onboarding;
shared fixtures keep local and automated runs aligned.

### III. Internationalization (i18n)

All user-facing copy (labels, buttons, errors, empty states, navigation,
emails rendered as product UI) MUST go through the project's i18n
mechanism. Hard-coded user-facing strings in components or pages are not
allowed once i18n is in place for that surface.

The active locale for now is Portuguese (Brazil) only (`pt-BR`).
Infrastructure MAY be ready for additional locales later, but shipping
other languages is out of scope until explicitly specified.

Documentation aimed at the development team (README, specs, seed
credentials tables) is written in pt-BR and does not require the runtime
i18n layer.

**Rationale**: Centralized messages keep the product consistent and avoid
costly string hunting when locales expand.

### IV. Spec-Driven Delivery

Meaningful product work proceeds through Spec Kit artifacts (specify →
plan → tasks → implement). Plans MUST pass the Constitution Check gates
before research/design proceed. Tasks MUST reflect testing, seed, and
i18n obligations for the feature.

**Rationale**: Shared specs keep scope testable and prevent silent drift
from project rules.

### V. Simplicity

Prefer the smallest design that satisfies the spec and these principles.
Do not add abstractions, locales, seed fixtures, or test layers that are
not required by current user stories. Complexity MUST be justified in the
plan's Complexity Tracking table when it conflicts with a gate.

**Rationale**: A modular ERP grows faster when each increment stays lean.

## Quality Gates

Before merging or marking a feature done:

1. **Tests**: Critical acceptance scenarios have automated coverage, or a
   documented exception exists.
2. **Seed**: If the feature needs fixtures, seed is updated, idempotent,
   and documented.
3. **i18n**: New or changed user-facing strings use the i18n layer; only
   `pt-BR` is required to be complete.
4. **Quickstart**: A developer can follow documented steps to migrate,
   seed (if needed), run the app, and run the automated suite for the
   feature's critical paths.

## Development Workflow

1. Specify behavior and acceptance scenarios (include testability).
2. Plan with Constitution Check gates explicit (pass/fail).
3. Generate tasks: include test tasks by default; include seed tasks when
   fixtures are required; include i18n tasks for user-facing copy.
4. Implement with seed → tests verifying critical paths.
5. Validate quickstart and leave documentation consistent with fixtures
   and commands.

## Governance

This constitution supersedes informal conventions when they conflict.
Amendments require updating `.specify/memory/constitution.md`, bumping
`CONSTITUTION_VERSION` (MAJOR for removals/incompatible redefinitions;
MINOR for new or materially expanded principles; PATCH for clarifications),
setting **Last Amended** to the change date, and syncing dependent
templates/rules in the same change set.

Reviews and Spec Kit plans MUST verify compliance with Principles I–III
at minimum. Justified deviations go in Complexity Tracking with a simpler
alternative considered and rejected.

**Version**: 1.0.0 | **Ratified**: 2026-07-14 | **Last Amended**: 2026-07-14
