# TigerTrace

## Offline Camera Trap & Individual Tiger Movement Intelligence System

**Version:** 1.0
**Status:** Final PRD
**Basis:** Forest & Wildlife Hackathon Problem Statement

---

# 1. Product Overview

TigerTrace is an offline software system that processes raw camera-trap image folders and converts them into:

* A clean individual-tiger database
* Tiger-wise occupancy information
* Tiger movement information
* Actionable movement-deviation alerts

The system is designed for forest department staff working on ordinary field laptops without internet connectivity or a dedicated GPU.

---

# 2. Core System Flow

```text
Raw Camera-Trap Images
        ↓
Data Ingestion
        ↓
Blank Image Filtering
        ↓
Tiger Detection
        ↓
Individual Tiger Identification
        ↓
Human Review
        ↓
Individual Tiger Database
        ↓
Occupancy & Movement Analysis
        ↓
Deviation Detection
        ↓
Actionable Alerts
        ↓
Forest Staff Dashboard
```

---

# 3. Functional Requirements

## 3.1 Raw Camera-Trap Data Ingestion

The system must accept raw, unprocessed camera-trap image folders exactly as they come from field SD cards.

It must:

* Read images from raw folders.
* Extract available timestamps.
* Identify camera/station information.
* Extract GPS/location information where available.
* Handle inconsistent folder naming.
* Handle camera clock drift and reset timestamps.
* Handle or flag mixed-up SD-card data.

The system must not fail completely because of messy field data.

---

# 4. Blank Image Filtering

The system must automatically classify images as:

* Blank/false trigger
* Containing a subject

False triggers may include:

* Moving grass
* Heat shimmer
* Insects
* Rain
* Shifting light
* Empty frames

Blank images must be removed from the working dataset.

### Safe deletion

Images must **not** be permanently deleted immediately.

The system must use a:

* Quarantine, or
* Staged-delete

approach.

The system must allow incorrect classifications to be recovered.

### Required output

The system must report:

* Number of frames removed/quarantined.
* Storage space saved.
* Processing time saved.

---

# 5. Individual Tiger Identification

For every retained image containing a tiger, the system must:

1. Detect the tiger.
2. Isolate the flank where possible.
3. Extract the stripe pattern/features.
4. Compare it against the catalogue of known individuals.
5. Assign a known tiger ID when the match is sufficiently confident.
6. Send ambiguous matches to human review.
7. Enroll a genuinely new individual with a new ID.

The system must not silently guess when identification is uncertain.

---

# 6. Human Review

Ambiguous tiger identifications must be presented to a human reviewer.

The reviewer must be able to:

* Confirm a suggested tiger.
* Select another candidate.
* Reject the suggested matches.
* Create a new individual.

Human corrections must be recorded.

Automated decisions must remain auditable and correctable.

---

# 7. Persistent Individual Tiger Database

The system must maintain a persistent, queryable database of identified tigers.

Each tiger record must be linked with:

* Tiger ID
* Images
* Camera station
* Timestamp
* GPS/location
* Identification confidence
* Human review decision where applicable

The database must maintain the relationship between each individual tiger and all of its recorded captures.

---

# 8. Tiger-Wise Occupancy

After every processing run, the system must generate information for every individual tiger.

It must provide:

* Locations where the tiger was captured.
* Activity centroid.
* Estimated home-range/occupied area.
* Estimated area occupied.

The exact spatial estimation method will be selected during technical implementation based on the available data and validation.

---

# 9. Occupancy Map

The system must visualize occupancy information on a reserve map.

The map must show:

* Tiger capture locations.
* Individual tiger activity/occupied areas.
* Activity centroid.
* Overlap between individual tigers.

Overlap between individuals must be visible because territorial overlap can be a management signal.

---

# 10. Movement History

The system must maintain historical capture and movement information for every individual tiger.

Historical information must be used to compare the current processing run with previous runs.

---

# 11. Movement-Deviation Detection

The system must detect meaningful changes in an individual's established movement pattern.

At minimum, the system must detect:

### 11.1 Range/Centroid Shift

Detect when the tiger's range/centroid moves beyond the defined threshold.

The problem statement specifies:

* Approximately 15–20 sq km in the core.
* 5 km in the buffer region.

These thresholds must be implemented according to the final interpretation confirmed for the challenge.

### 11.2 New Station

Detect the first capture of an individual at a station that it has never previously used.

### 11.3 Buffer/Village Movement

Detect movement into or toward:

* Buffer stations.
* Village-adjacent stations.

### 11.4 Prolonged Absence

Detect when a previously regular individual stops appearing for a prolonged period.

---

# 12. Survey-Effort Correction

The system must distinguish genuine behavioural deviation from changes caused by uneven survey effort.

For example:

> A tiger appearing at a new station because a new camera was installed there must not automatically be treated as a movement deviation.

Similarly, lack of detection must not automatically mean that the tiger has disappeared.

Survey effort and camera availability must therefore be considered when generating movement alerts.

---

# 13. Explainable Alerts

Every generated alert must clearly state:

* What changed.
* Supporting evidence.
* Confidence level.

Example:

```text
RANGE SHIFT

Tiger: T-014

Previous activity:
Core area

Current activity:
New range

Evidence:
Capture locations and timestamps

Survey effort:
Adequate

Confidence:
High
```

Alerts must be actionable rather than simply generating large numbers of noisy notifications.

---

# 14. Human Privacy

Images containing humans must be handled with appropriate privacy safeguards.

The system must flag or appropriately handle such images without unnecessary exposure.

---

# 15. Offline Operation

The complete core system must work:

* Without internet connectivity.
* On an ordinary field laptop.
* Without a dedicated GPU.

Core processing, database operations, image storage and dashboard functionality must operate locally.

---

# 16. Processing Performance

The system must support practical batch processing of tens of thousands of images.

Performance must be considered for:

* Processing speed.
* CPU usage.
* Memory usage.
* Storage usage.
* Large image batches.

The implementation must avoid unnecessary processing and remain practical on constrained hardware.

---

# 17. Field Data Robustness

The system must handle or flag normal camera-trap data problems, including:

* Camera clock drift.
* Reset timestamps.
* Inconsistent folder names.
* Mixed-up SD cards.
* Missing or inconsistent metadata.

The system should identify problematic data rather than silently producing incorrect results.

---

# 18. User Interface

The interface must be usable by forest department staff who are not data scientists.

The system should provide access to the required functions:

### Processing

* Select raw camera-trap folder.
* Start processing.
* View processing progress.
* View processing summary.

### Tiger Database

* View individual tigers.
* View their captured images.
* View capture locations and history.

### Human Review

* Review ambiguous tiger matches.
* Confirm or correct identification.
* Create a new individual.

### Map

* View tiger locations.
* View occupied areas.
* View centroids.
* View overlap.

### Alerts

* View movement-deviation alerts.
* View evidence.
* View confidence.

---

# 19. Required Outputs

The completed system must produce the following outputs:

## 19.1 Clean Individual-Tiger Dataset

Processed images with blank images removed/quarantined.

## 19.2 Individual Tiger Database

A persistent database connecting:

```text
Tiger
 ↓
Images
 ↓
Camera Station
 ↓
Timestamp
 ↓
GPS
```

## 19.3 Occupancy Visualization

A reserve map showing:

* Capture locations.
* Occupied areas.
* Centroids.
* Overlap.

## 19.4 Movement Alerts

Alerts covering the required deviation categories with:

* Change.
* Evidence.
* Confidence.

## 19.5 Documentation

Documentation must cover:

* Setup.
* Model choices.
* Known limitations.

---

# 20. Auditability

Every automated decision must be traceable.

For important AI decisions, the system should retain:

* Prediction.
* Confidence.
* Related image.
* Processing run.
* Human correction/review where applicable.

---

# 21. Required Database Information

The database must support at least the following concepts:

```text
Tiger
Camera Station
Image
Capture
Processing Run
Alert
Review
Survey Effort
```

The exact database implementation is a technical design decision.

---

# 22. Required End-to-End Workflow

The final system must support this complete workflow:

```text
1. User selects raw camera-trap folder
              ↓
2. System reads and organizes image information
              ↓
3. Blank images are detected
              ↓
4. Blank images are safely quarantined
              ↓
5. Relevant images are retained
              ↓
6. Tiger images are detected
              ↓
7. Individual tiger is identified
              ↓
8. Uncertain identification goes to human review
              ↓
9. Tiger record is stored/updated
              ↓
10. Capture location and time are recorded
              ↓
11. Occupancy/movement information is generated
              ↓
12. Current run is compared with historical data
              ↓
13. Meaningful deviations are detected
              ↓
14. Explainable alert is generated
              ↓
15. Forest staff views the result
```

---

# 23. Non-Goals

The project will **not** include features that are outside the problem statement, including:

* Mobile application.
* Cloud-only architecture.
* Mandatory internet connectivity.
* Chatbot.
* Payment system.
* Custom LLM.
* Large deep-learning model trained from scratch.
* Unnecessary administrative features.
* Unrelated tourism or social features.

---

# 24. Success Criteria

The project will be considered successful if it demonstrates:

### Blank Detection

* Accurate blank detection.
* Low risk of losing meaningful images.
* Safe quarantine/recovery.
* Processing/storage savings.

### Tiger Identification

* Tiger detection.
* Individual identification.
* New-individual enrollment.
* Human review for ambiguous cases.

### Database

* Persistent tiger records.
* Image/station/time/GPS relationships.

### Occupancy

* Individual capture locations.
* Activity centroid.
* Estimated occupied area.
* Individual overlap.

### Movement Intelligence

* Range shift detection.
* New station detection.
* Buffer/village movement detection.
* Prolonged absence detection.
* Survey-effort-aware analysis.

### Alerts

* Actionable alerts.
* Supporting evidence.
* Confidence level.
* Low unnecessary noise.

### System

* Offline operation.
* CPU-only field hardware.
* Practical large-batch processing.
* Robustness to messy camera-trap data.
* Human-auditable decisions.
* Usable interface for forest staff.

---

# 25. Product Boundary

TigerTrace's responsibility ends at:

> **Turning camera-trap data into reliable individual-tiger records, spatial intelligence and actionable movement-deviation alerts.**

It does not attempt to replace forest officers or make final conservation decisions.

The system provides:

**Evidence → Analysis → Alert**

The final management decision remains with the responsible human authority.

---

# 26. Final Product Statement

> **TigerTrace is an offline camera-trap intelligence system that automatically filters raw camera-trap data, identifies individual tigers, builds a persistent tiger database, maps their occupancy and movement, and detects meaningful movement deviations through explainable alerts for forest department staff.**
