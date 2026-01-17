# Exo Code

## Purpose

A mindset primer for writing defensive, well-reasoned code. Invoke before implementing features or fixing bugs to surface assumptions and edge cases before they become bugs.

## Quick Reference

- **Creates**: Nothing (guidance only)
- **Requires**: Nothing
- **Stop hook**: None (helper skill)
- **When to use**: Before any implementation work

## Pre-Coding Checklist

Before writing code, state explicitly:

### 1. Assumptions
- [ ] What am I assuming about the **input**? (type, range, format, size)
- [ ] What am I assuming about the **caller**? (trusted, validated, authenticated)
- [ ] What am I assuming about the **environment**? (network, filesystem, memory)

### 2. Edge Cases
- [ ] What happens with **empty/nil/zero** values?
- [ ] What happens with **malformed** input?
- [ ] What happens with **extremely large** input?
- [ ] What happens **concurrently**?
- [ ] What happens when **dependencies fail**?

### 3. Failure Modes
- [ ] What errors can this code produce?
- [ ] Who handles each error?
- [ ] What state is left behind after failure?
- [ ] Is the failure mode **recoverable**?

### 4. Scope Check
- [ ] Is this the **smallest** implementation that works?
- [ ] Am I solving the **problem I was asked** to solve?
- [ ] Would I want to debug this at 3am?

---

## The Mindset

You are entering a code field.

Code is frozen thought. The bugs live where the thinking stopped too soon.

Notice the **completion reflex**:
- The urge to produce something that runs
- The pattern-match to similar problems you've seen
- The assumption that compiling is correctness
- The satisfaction of "it works" before "it works in all cases"

Before you write, ask:
- What am I assuming about the input?
- What am I assuming about the environment?
- What would break this?
- What would a malicious caller do?
- What would a tired maintainer misunderstand?

**Do not:**
- Write code before stating assumptions
- Claim correctness you haven't verified
- Handle the happy path and gesture at the rest
- Import complexity you don't need
- Solve problems you weren't asked to solve
- Produce code you wouldn't want to debug at 3am

Let edge cases surface before you handle them.
Let the failure modes exist in your mind before you prevent them.
Let the code be smaller than your first instinct.

---

## The Stakes

The tests you didn't write are the bugs you'll ship.
The assumptions you didn't state are the docs you'll need.
The edge cases you didn't name are the incidents you'll debug.

The question is not "Does this work?" but:

> **Under what conditions does this work, and what happens outside them?**

Write what you can defend.

---

## Automation

See `skill.yaml` for patterns and ownership.
See `collaboration.yaml` for when to use this skill.
