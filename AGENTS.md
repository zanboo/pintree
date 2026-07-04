# Ponytail: Lazy Senior Developer Mode (adapted for this project)

> Source: https://github.com/DietrichGebert/ponytail (MIT License)
> This copy has been edited for this project — see "Adapted for this project" below for what was changed and why. When this file conflicts with `CLAUDE.md`, `CLAUDE.md` wins.

This document outlines a philosophy for efficient software development that prioritizes understanding over speed and deletion over addition.

## Core Principle

The approach centers on a decision ladder to follow *after* understanding the problem:

1. **Necessity**: Does this need building at all? — *for this project, anything already specified as a schema field or contract in `docs/design-v0.8.md` counts as already-decided; this check applies to code beyond what the spec asks for, not to re-litigating the spec itself.*
2. **Reuse**: Does the codebase already have this pattern?
3. **Standard library**: Can built-in tools handle it?
4. **Platform features**: Do native capabilities exist?
5. **Dependencies**: Will an installed package solve it? — *only if its license is MIT/Apache-2.0/BSD/ISC; AGPL/SSPL/BUSL are out regardless of how well it fits (see `CLAUDE.md`).*
6. **Simplicity**: Can it be one line?
7. **Minimum code**: Only then write what's needed.

## Key Practices

**Bug fixes target root causes**, not symptoms. Rather than patching individual callers, fix the shared function once to prevent sibling bugs from lingering.

The document stresses that "lazy means efficient, not careless" and that comprehension comes before optimization. A developer should "read the task and the code it touches, trace the real flow end to end, then climb" the ladder.

## Non-Negotiables

Understanding the problem fully, input validation at trust boundaries, error handling that prevents data loss, security, accessibility, and calibration for real hardware remain non-optional concerns.

## Adapted for this project

- **Removed**: the upstream line "No abstractions that weren't explicitly requested." Dropped outright rather than qualified, because this project's spec (`docs/design-v0.8.md`) is built the opposite way on purpose — it front-loads generalized abstractions (the five-dimension node tree, track/timeline/anchor, the token→slot→override chain, the widget-as-pure-function contract) *before* any single feature asks for them, and states explicitly that cheap-now capabilities should be added early rather than bolted on later (v0.8 core principle 5, "现补几近免费，晚补全量重构"). Keeping this line as-is would make the agent resist building spec-mandated structure on the grounds that "no single task asked for this yet."
- **Kept as-is**: "Deletion over addition," reuse/stdlib/platform-first ordering, root-cause bug fixing, and all of Non-Negotiables (accessibility and real-hardware calibration in particular directly match this project's own ARIA/60fps-on-mid-range-phone requirements — do not soften these).
- **Qualified**: ladder steps 1 and 5 above, so the ladder still applies to *how* you implement something without it being used to argue against building what the spec already decided.
