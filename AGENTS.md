# Cuttle Agent Instructions

<!-- MarkdownTOC autolink="true" -->

- [Primary Task](#primary-task)
- [Implementation Priority](#implementation-priority)
- [Discovery Strategy](#discovery-strategy)
- [Critical Safety Rules](#critical-safety-rules)
- [Finding Information](#finding-information)
- [Constraints and Escalation](#constraints-and-escalation)
- [Communication Patterns](#communication-patterns)
- [Final Verification](#final-verification)

<!-- /MarkdownTOC -->

This document provides technical instructions for AI agents working on Cuttle. For workflow and rationale, reference `docs/agentic-development.md`.

## Primary Task

Your primary task is to assist developers by writing high-quality, production-ready code that adheres to the standards defined in this document. You do this by **discovering existing patterns first**, then following them.

## Implementation Priority

In case of conflicting rules, the following hierarchy applies:
1.  **Security**: Adhere to Sails.js policies and authentication patterns.
2.  **Automated Checks**: All code changes must pass linting and testing.
3.  **Existing File Patterns**: Mimic the patterns in the specific file being edited.
4.  **Project-Wide Standards**: Adhere to standards documented in referenced files.
5.  **Modern Best Practices**: Apply current, industry-standard best practices for Vue and Sails.

## Discovery Strategy

**Always discover before you build.** Your workflow should be:

### 1. Research Before Code
- **Tool Selection**:
  - **Glob**: Find files by pattern (`src/components/**/*.vue`, `api/controllers/**/*.js`).
  - **search_file_content**: Search file contents for patterns (`defineStore`, `sails.helpers`).
  - **read_file**: Read complete files when you need full context.
- **Use Memory First**: Reference files you've already read rather than re-reading.

### 2. Pattern Discovery Hierarchy
1. **Existing Code**: Search the codebase for similar implementations.
2. **Documentation**: Check `docs/*.md` for standards and conventions.
3. **Configuration**: Review linting rules (`.eslintrc.js`, `.prettierrc`).

### 3. Discovery Examples
- **State Management**: Search `defineStore` in `src/stores` to find Pinia store patterns.
- **Backend Logic**: Search `sails.helpers` in `api/helpers` or controller actions in `api/controllers`.
- **Component Patterns**: Glob `src/components/**/*.vue` to find component structure.
- **Testing Patterns**: Glob `tests/e2e/**/*.spec.js` or `tests/unit/**/*.spec.js` to find test structure.

## Critical Safety Rules

- **Security**: Do not hardcode secrets. Use Sails.js configuration and policies correctly.
- **No Commits Without Request**: Only create commits when explicitly requested.
- **Validation**: Run `npm run lint` and `npm run test:unit` before finishing.
- **Constraint Reporting**: If you cannot research or validate, state this as a constraint.

## Finding Information

### State Management (Frontend)
- **Discovery**: Search for `defineStore` in `src/stores`.
- **Standards**: Follow existing patterns for state, getters, and actions.

### Frontend (Vue)
- **Discovery**: Glob `src/components` for shared, general-purpose components. Page-specific components are often located in `src/routes/[routeName]/components/`. Page entry points are in `src/routes/[routeName]/[RouteName]View.vue`.
- **UI Library**: Vuetify is used. See existing components for usage patterns.
- **Routing**: `src/router.js` defines routes and navigation guards.

### Backend (Sails.js)
- **Routes**: `config/routes.js` maps endpoints to controller actions.
- **Controllers**: `api/controllers/**/*.js` contain request handling logic.
- **Models**: `api/models/**/*.js` define the database schema and lifecycle callbacks.
- **Helpers**: `api/helpers/**/*.js` contain reusable business logic.
- **Policies**: `api/policies/**/*.js` are middleware for authentication and authorization.

### Testing
- **E2E**: Cypress tests are in `tests/e2e/specs`.
- **Unit**: Vitest tests are in `tests/unit/specs`.
- **Discovery**: Search for `.spec.js` files to find existing patterns.

### Dependencies
- **Policy**: Do not add, update, or remove dependencies without explicit approval.

## Constraints and Escalation

**Communicate when you're blocked or uncertain:**

- **Ambiguous Request**: Ask clarifying questions before proceeding.
- **Technical Limitation**: State clearly if you cannot research or access needed information.
- **Pattern Conflict**: Document inconsistencies and ask for direction.
- **Engineer Escalation**: If a decision requires new architecture or dependencies, escalate to the engineer.

## Communication Patterns

### Plan Before Execute
For non-trivial tasks, outline your approach:
```
1. Files I'll modify: {list}
2. Patterns I found: {summary}
3. Approach: {steps}
4. Validation: {how-to-test}

Proceed?
```

### Discovery Report
When researching:
```
Found {N} examples of {pattern}:
- {file:line} - {brief-description}
- {file:line} - {brief-description}

Common pattern: {summary}

Ready to implement following this pattern?
```

## Final Verification

Before completing any task, verify:
1.  **Discovery**: Confirm your implementation matches discovered patterns.
2.  **Security**: No secrets hardcoded; policies are correctly applied.
3.  **Pattern Consistency**: Changes align with existing file and project structures.
4.  **Automated Checks**: Run `npm run lint` and `npm run test:unit`.

---

**Remember**: You are a discovery system first, a code generator second. When in doubt, search, read, and ask questions before writing code.

