# AI Development Guide

<!-- MarkdownTOC autolink="true" -->

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Core Principles](#core-principles)
- [When to Use AI](#when-to-use-ai)
- [AI-Powered Workflow](#ai-powered-workflow)
- [Code Review Checklist for AI-Assisted PRs](#code-review-checklist-for-ai-assisted-prs)

<!-- /MarkdownTOC -->

## Overview

This guide establishes the standards, workflow, and best practices for using AI tools to accelerate development in Cuttle.

Technical automation rules for AI agents are maintained separately in [`AGENTS.md`](../AGENTS.md). That file is designed for agent consumption only.

## Getting Started

The most effective way to use an AI assistant in this project is to start by providing it with the context from [`GEMINI.md`](../GEMINI.md) or [`CLAUDE.md`](../CLAUDE.md). These files point the agent to our technical standards in [`AGENTS.md`](../AGENTS.md), which teaches it our discovery patterns and conventions.

## Core Principles

-   **Analyze Before Building**: Study existing code patterns before writing new code. Follow established standards. Propose new patterns only when they offer clear advantages.
-   **Be Incremental**: Make small, verifiable changes. This aligns with the project's development and code review processes.
-   **Maintain Oversight**: You are responsible for all code. Review, understand, and validate all AI-generated output.

## When to Use AI

**Effective for**:
-   **Discovery Tasks**: Pattern analysis, architecture mapping, finding similar implementations.
-   **Boilerplate**: Component scaffolding, test templates, model definitions.
-   **Test Generation**: Unit tests, test case identification.
-   **Refactoring Guidance**: Modernization paths, pattern migrations.

**Manual development for**: Complex business logic, security-critical code, performance algorithms. Use AI for research and suggestions, but maintain direct control over implementation decisions.

## AI-Powered Workflow

Integrate AI into the development workflow using a **discover-plan-execute** pattern.

### 1. Discovery Phase (Research and Planning)
Start every task with discovery to ensure the AI follows existing patterns.

-   **Pattern Discovery**: "Search the codebase for components similar to {component-type}, analyze 3-5 examples, and identify the common pattern."
-   **Architecture Mapping**: "Find all files related to {feature}, explain how they interact, and identify dependencies."

### 2. Planning Phase
After discovery, request a plan before any code changes.

-   **Plan First**: Use a prompt that requires the agent to outline the scope, impacted files, and validation steps before changing code. Wait for your approval.

### 3. Execution Phase (Implementation)
Only after plan approval, proceed with implementation.

-   **Incremental Changes**: Implement one component at a time, validate, then continue.
-   **Real-time Validation**: Test as you go. Run `npm run lint:fix` and `npm run test:unit` often.

## Code Review Checklist for AI-Assisted PRs

When reviewing AI-assisted Pull Requests, check for:

1.  **Pattern Consistency**: Does the code match existing patterns and conventions?
2.  **No "Magic" Code**: Ensure you understand every line of generated code and can explain its purpose.
3.  **Correctness**: Does the code correctly solve the problem without introducing new bugs or edge cases?
4.  **Simplicity**: Is the solution over-engineered? Simplify verbose AI-generated code.
5.  **No Deprecated Patterns**: Verify the AI didn't introduce outdated syntax or deprecated library methods.
6.  **Security Compliance**: Ensure no hardcoded secrets or client-side exposure of server-only information.
7.  **Test Coverage**: If tests were generated, verify they actually test the intended behavior.
8.  **Agent Hallucination Patterns**: Watch for common AI mistakes like non-existent dependencies, incorrect API signatures, or misunderstood business logic.
