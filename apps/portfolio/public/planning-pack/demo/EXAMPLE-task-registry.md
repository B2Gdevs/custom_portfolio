---
title: Example — task registry
---

> **Demo only.** Replace phases and ids with your project’s real plan.

# Task Registry (example)

## Phase `example-01`

| Id | Status | Goal | Depends | Verify |
| --- | --- | --- | --- | --- |
| `example-01-01` | `planned` | scaffold repo and docs layout | `-` | build passes |
| `example-01-02` | `planned` | define first vertical slice | `example-01-01` | planning docs updated |

## Phase `example-02`

| Id | Status | Goal | Depends | Verify |
| --- | --- | --- | --- | --- |
| `example-02-01` | `planned` | ship slice to staging | `example-01-02` | manual QA |
