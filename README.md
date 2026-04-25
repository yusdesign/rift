# rift
RIFT is for Resolutive Intuition Fixed Point formal method

Here's the content converted to well-structured Markdown:

# 📐 Resolutive Coinduction Method: Complete Documentation

## Table of Contents

1. [Foundations](#foundations)
2. [Parametric Guardedness](#parametric-guardedness)
3. [Computational Interpretation](#computational-interpretation)
4. [Implementation Architecture](#implementation-architecture)
5. [Method Tree](#method-tree)
6. [Quick Reference](#quick-reference)

---

## Foundations

### Core Principle

The Resolutive Coinduction Method treats infinite streams as coinductive data where:

```

νX.F(X) — Greatest Fixed Point

```

A stream is defined by its seed S and a step function:

```javascript
const stream = {
    seed: initialValue,
    step: (s) => [value, nextSeed]
};
```

## Key Insight

Different guardedness parameters produce different productivity inferences for the same stream definition:

Stream | Strict | Moderate | Lax | Minimal  
powersOf2 | ✗ (50) | ✓ (80) | ✓ (75) | ✓ (60)  
squareWave | ✗ (50) | ✓ (80) | ✓ (75) | ✓ (60)  

The score threshold determines productivity:

· Strict (80): Requires thunk () => wrapper  
· Moderate (60): Accepts any lambda =>  
· Lax (40): Any tail call allowed  
· Minimal (20): Bounded exploration only  

---

## Parametric Guardedness

Guard Levels

Level | Threshold Requirements | Use Case
🔒 Strict | 80 () => stream() wrapper | Total functions, always productive  
⚖️ Moderate | 60 => expression | Lazy evaluation, standard corecursion  
🌀 Lax | 40 Any tail call | Process calculi, possibly productive  
🔓 Minimal | 20 Bounded steps | Debugging, finite exploration  

## Scoring System

Each stream receives a score based on:

· Array return (+25): return [value, next]  
· Guard type (+10-45): Thunk > Lambda > Tail call  
· Value production (+25): Value before recursion  
· Runtime simulation (+0-15): Actual step execution  

```javascript
// Example: powersOf2 scores
// - Array return: +25
// - Lambda guard (n) =>: +30 (Moderate)
// - Value production: +25
// Total: 80 → ✓ Productive
```

---

## Computational Interpretation

*Curry–Howard Correspondence*

Logic | Computation  
νX.F(X) (coinductive type) | Stream data structure  
Step function | Producer of values  
Guardedness proof | Productivity certificate  
Bisimulation | Seed equality witness  

## Monadic Structure

The resolutive pattern forms a state monad:

```
M(A) = S → A × T(S) × S
```

Where:  

· S is the seed type (bisimulation witness)  
· A is the value type  
· T(S) is the thunked continuation  

## Guarded Operators

Operators preserve productivity when applied to guarded streams:

Operator | Description | Productivity  
map(f) | Transform values | Preserved if source guarded  
zip(s2) | Pair values | Preserved if both guarded  
filter(p) | Select values | May need thunk for safety  
take(n) | Finite prefix | Always productive  
interleave(s2) | Merge streams | Preserved if both guarded  
scale(k) | Multiply values | Preserved if source guarded  

---

## Implementation Architecture

#### Directory Structure

```
docs/
├── index.html              # Main application
├── guardo.html            # Backup/alternative
└── oeis/                  # OEIS data (optional)
    ├── oeis_index_min.json
    ├── oeis_manifest.json
    └── oeis_chunks/
        └── chunk_*.json
```

## Core Classes

```javascript
class ResStream {
    constructor(name, seed, stepFn)  // Core stream
    take(n)                          // Finite prefix
    map(f) / zip(s2) / filter(p)     // Guarded operators
}

class ParametricGuardednessChecker {
    setLevel(level)                  // STRICT/MODERATE/LAX/MINIMAL
    checkStream(stream)              // Returns {productive, score}
    compareLevels(stream)            // All levels at once
}

class StaticOEISLoader {
    loadIndex()                      // Load sequence index
    loadSequence(id)                 // Fetch by ID
    search(query)                    // Find sequences
}
```

## Waveform Visualization

Canvas-based rendering with:

· Real-time plotting of stream values
· Color-coded comparison (blue vs green)
· Step slider for time-travel exploration

---

## Method Tree

```
📐 Resolutive Coinduction Method
│
├── Layer 1: Foundations
│   ├── νX.F(X) — Greatest Fixed Point
│   ├── μX.F(X) — Least Fixed Point (dual)
│   └── Seed as bisimulation witness
│
├── Layer 2: Parametric Guardedness
│   ├── Strict (80) — Thunk-wrapped recursion
│   ├── Moderate (60) — Lambda guard
│   ├── Lax (40) — Any tail call
│   └── Minimal (20) — Bounded exploration
│
├── Layer 3: Computational Interpretation
│   ├── Curry–Howard: Corecursion as program
│   ├── Monad: S → A × T(S) × S
│   └── Seed equality = bisimulation
│
├── Layer 4: Guarded Operators
│   ├── map, zip, filter, interleave, scale, take
│   └── Productivity preservation proofs
│
├── Layer 5: Implementation
│   ├── Waveform visualization (Canvas)
│   ├── OEIS integration (static JSON + LFS)
│   ├── Certificate export (JSON/Agda)
│   └── Interactive bisimulation checking
│
└── Layer 6: Applications
    ├── Stream equivalence
    ├── Process calculus bisimulations
    ├── Liveness properties
    └── Guarded recursive types
```

---

## Quick Reference

Try These Streams in the Explorer

```javascript
// Powers of 2 (geometric growth)
const powersOf2 = {
    seed: 1,
    step: (n) => [n, n * 2]
};

// Square wave (periodic 0,1)
const squareWave = {
    seed: 0,
    step: (n) => [n % 2, n + 1]
};

// Fibonacci (classic)
const fibonacci = {
    seed: [0, 1],
    step: ([a, b]) => [a, [b, a + b]]
};

// Triangle wave (sawtooth)
const triangleWave = {
    seed: { pos: 0, dir: 1 },
    step: (s) => {
        let val = s.pos;
        let newPos = s.pos + s.dir;
        let newDir = s.dir;
        if (newPos >= 10) { newPos = 8; newDir = -1; }
        if (newPos <= 0) { newPos = 1; newDir = 1; }
        return [val, { pos: newPos, dir: newDir }];
    }
};
```

OEIS Sequences Available

ID | Name | First Terms
A000027 | Natural numbers | 1,2,3,4,5...  
A000045 | Fibonacci | 0,1,1,2,3,5,8...  
A000079 | Powers of 2 | 1,2,4,8,16,32...  
A000142 | Factorials | 1,1,2,6,24...  
A000217 | Triangular | 0,1,3,6,10,15...  
A000290 | Squares | 0,1,4,9,16...  
A000040 | Primes | 2,3,5,7,11...  

Keyboard Shortcuts

Action | Shortcut  
Run streams | Ctrl+Enter  
Compare streams | Ctrl+Shift+C  
Clear all | Ctrl+Shift+X  
Load example | Ctrl+Shift+E  

---

## Next Steps & Roadmap

Status Feature Description
✅ Parametric Guardedness 4-level productivity checking
✅ Waveform Visualization Canvas-based stream plotting
✅ Guarded Operators map, zip, filter, interleave, scale
✅ OEIS Integration Static JSON + fallback built-ins
✅ Git LFS Large file support for OEIS data
🔜 Coq/Agda Export Formal proof generation
🔜 ML Inference Automatic bisimulation discovery
🔜 Temporal Logic □ (always), ◇ (eventually) operators
🔜 Vercel Backend Live OEIS fetching service

---

## Citation

If you use this method in research, please cite:

```bibtex
@misc{resolutive2026,
    title = {Resolutive Coinduction Method},
    author = {Resolutive Explorer Contributors},
    year = {2026},
    url = {https://yusdesign.github.io/rift/}
}
```

---

Live Demo: https://yusdesign.github.io/rift/

The tool demonstrates that different guardedness parameters produce different productivity inferences — a key insight for reasoning about infinite data structures in constructive type theory
