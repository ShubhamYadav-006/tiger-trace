# TigerTrace — Technical Decisions

## 1. Purpose

This document defines the technical decisions required to implement TigerTrace according to the Forest & Wildlife problem statement.

The goal is to select practical, offline-capable and CPU-friendly approaches while satisfying all required outputs.

---

# 2. Design Principles

1. Offline-first operation.
2. No dedicated GPU dependency.
3. Reuse proven computer-vision components wherever possible.
4. Do not train large models from scratch.
5. Keep uncertain AI decisions available for human review.
6. Never permanently delete images based only on AI classification.
7. Keep all important decisions auditable.
8. Prefer explainable algorithms for movement and alert generation.
9. Do not represent public or simulated data as actual Pench data.
10. Every technical choice must support a requirement from the problem statement.

---

# 3. Camera-Trap Image Detection

## Decision

Use an existing camera-trap object-detection model instead of building a blank-image detector from scratch.

## Candidate

MegaDetector.

MegaDetector is designed for camera-trap imagery and detects animals, people and vehicles.

## Proposed Pipeline

Raw Image
    ↓
MegaDetector
    ↓
Animal / Person / Vehicle / Empty
    ↓
Further processing for relevant images

## Reason

- Designed specifically for camera-trap data.
- Avoids unnecessary model training.
- Suitable for local/offline inference.
- Can provide object locations.
- Helps identify blank images and human-containing images.

## Important

MegaDetector does NOT identify the individual tiger.

It is only a detection stage.

---

# 4. Species Identification

## Decision

Evaluate an existing camera-trap species-classification model rather than training a tiger classifier from scratch.

## Candidate

SpeciesNet.

## Proposed Pipeline

Animal Detection
    ↓
Species Classification
    ↓
Tiger?
    ↓
YES → Individual Tiger Re-ID

## Reason

This separates:

- object detection
- species classification
- individual identification

and prevents us from building unnecessary models.

## Final Decision

The exact model/version will be locked after testing on the available dataset.

---

# 5. Blank Image Handling

## Decision

Use confidence-aware classification and quarantine.

## Required Flow

AI predicts blank
    ↓
Confidence evaluation
    ↓
Quarantine
    ↓
Human can restore/delete later

## Reason

The problem statement specifically requires safe and reversible deletion and gives special importance to false negatives.

No direct permanent deletion should occur automatically.

---

# 6. Individual Tiger Re-Identification

## Decision

Use an embedding/similarity-based individual re-identification pipeline.

## Proposed Pipeline

Tiger Image
    ↓
Tiger Detection
    ↓
Flank / usable body region
    ↓
Feature Extraction
    ↓
Embedding
    ↓
Similarity Search
    ↓
Candidate Tigers
    ↓
Known / Review / New

## Why

Individual tiger recognition is a re-identification problem.

Existing research and datasets such as ATRW demonstrate the use of individual identity and visual features for tiger re-identification.

ATRW contains 92 individual Amur tigers and more than 8,000 video clips.

However:

ATRW ≠ Pench dataset.

It will be used only for research/prototype validation if appropriate.

---

# 7. Re-ID Decision Logic

The system must support three outcomes.

## Known Individual

Strong and unambiguous match.

→ Automatically assign existing Tiger ID.

## Ambiguous

Multiple candidates are close or confidence is insufficient.

→ Human Review.

## New Individual

No reliable existing match.

→ Create new individual candidate.

---

# 8. Re-ID Thresholds

Thresholds must NOT be hardcoded before validation.

The final thresholds will be selected after testing.

The system should expose configurable values for:

- automatic-match threshold
- human-review threshold
- new-individual threshold

---

# 9. Human Review

Human review is mandatory for ambiguous identification.

The review screen should show:

- Original tiger image
- Flank/feature crop
- Top candidate tigers
- Reference images
- Similarity/confidence
- Camera station
- Timestamp

Reviewer actions:

- Confirm candidate
- Select another candidate
- Reject candidates
- Create new tiger

All decisions must be stored.

---

# 10. Spatial Analysis

## Decision

Calculate:

- Capture locations
- Activity centroid
- Estimated occupied/activity area
- Individual overlap

The exact area-estimation method will be selected after validation.

Possible methods:

- Minimum Convex Polygon
- Kernel Density Estimation
- Other appropriate spatial methods

For the MVP, prefer a method that is:

- explainable
- computationally practical
- suitable for available observations

---

# 11. Terminology

Unless the chosen methodology supports a formal home-range estimate, the UI should prefer:

"Estimated Occupied Area"

or

"Activity Area"

rather than making an unsupported scientific claim of exact home range.

---

# 12. Survey Effort

## Decision

Survey effort must be explicitly stored.

The system must not interpret non-detection as disappearance without considering whether the camera was actually active.

Survey information should include:

- Station
- Survey/run
- Deployment period
- Active days
- Camera status

---

# 13. Movement Deviation

## Decision

Use a deterministic/statistical rules engine rather than an LLM.

Required deviations:

1. Range/centroid shift
2. First capture at unused station
3. Movement toward buffer/village stations
4. Prolonged absence

The engine must consider survey effort.

---

# 14. Explainable Alerts

Every alert must contain:

- Alert type
- Tiger ID
- What changed
- Previous state
- Current state
- Supporting evidence
- Survey-effort status
- Confidence
- Severity where applicable

The alert engine should be deterministic and explainable.

---

# 15. Offline Architecture

Core processing must work without internet.

Required local components:

- Frontend
- Backend
- ML inference
- Database
- Image storage
- Map data

No cloud AI API should be required for core processing.

---

# 16. ML Runtime

## Development

Python + PyTorch/OpenCV.

## Production

Evaluate ONNX Runtime where it improves CPU inference.

Do not force ONNX conversion unless benchmarking demonstrates a benefit.

---

# 17. Image Storage

Actual image files remain on local filesystem.

PostgreSQL stores:

- file path
- metadata
- classification
- relationships
- confidence
- review information

Do not store thousands of large image binaries directly inside PostgreSQL.

---

# 18. Map

Use:

- Leaflet
- React-Leaflet

Map data required for offline operation must be stored locally.

Do not depend on online map tiles during field processing.

---

# 19. Database

Use:

- PostgreSQL
- Prisma

Reason:

- Persistent relational data
- Strong relationships between tigers, captures, images and stations
- Queryable historical data
- Suitable for movement/alert relationships

---

# 20. Final Technology Direction

Frontend:
React + TypeScript + Vite + Tailwind CSS

Backend:
Node.js + Express + TypeScript

Database:
PostgreSQL + Prisma

ML:
Python + PyTorch + OpenCV + NumPy

Inference:
ONNX Runtime where beneficial

Maps:
Leaflet + React-Leaflet

Storage:
Local filesystem

---

# 21. Dataset Decision

Priority:

1. Organizer-provided/authorized Pench dataset
2. Public camera-trap dataset
3. Public tiger re-identification dataset
4. Indian tiger dataset where permitted
5. Controlled/simulated metadata for movement demonstration

Public/simulated data must never be presented as actual Pench data.

---

# 22. Performance Decision

Benchmark progressively:

100 images
→ 1,000 images
→ 5,000 images
→ larger batches

Measure:

- processing time
- images/minute
- CPU usage
- RAM
- storage
- errors

---

# 23. Final Technical Principle

Reuse existing AI for:

Detection → Species

Build our main intelligence around:

Individual Identity → Persistent History → Spatial Intelligence → Deviation → Explainable Alert