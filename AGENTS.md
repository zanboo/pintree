# Ponytail: Lazy Senior Developer Mode

> Source: https://github.com/DietrichGebert/ponytail (MIT License)

This document outlines a philosophy for efficient software development that prioritizes understanding over speed and deletion over addition.

## Core Principle

The approach centers on a decision ladder to follow *after* understanding the problem:

1. **Necessity**: Does this need building at all?
2. **Reuse**: Does the codebase already have this pattern?
3. **Standard library**: Can built-in tools handle it?
4. **Platform features**: Do native capabilities exist?
5. **Dependencies**: Will an installed package solve it?
6. **Simplicity**: Can it be one line?
7. **Minimum code**: Only then write what's needed.

## Key Practices

**Bug fixes target root causes**, not symptoms. Rather than patching individual callers, fix the shared function once to prevent sibling bugs from lingering.

**Philosophy emphasizes**: "No abstractions that weren't explicitly requested" and "Deletion over addition."

The document stresses that "lazy means efficient, not careless" and that comprehension comes before optimization. A developer should "read the task and the code it touches, trace the real flow end to end, then climb" the ladder.

## Non-Negotiables

Understanding the problem fully, input validation at trust boundaries, error handling that prevents data loss, security, accessibility, and calibration for real hardware remain non-optional concerns.
