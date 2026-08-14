# TigerTrace — Database Design

## 1. Database Technology

**Database:** PostgreSQL  
**ORM:** Prisma

The database stores metadata, relationships, processing results, tiger records, capture history, survey effort, reviews, and alerts.

Actual camera-trap image files will remain in local filesystem storage. Large image binaries will not be stored directly inside PostgreSQL.

---

# 2. Core Entities

The core database entities are:

- `Tiger`
- `CameraStation`
- `Image`
- `Capture`
- `ProcessingRun`
- `Review`
- `SurveyEffort`
- `Alert`

---

# 3. Entity Relationship Overview

```text
ProcessingRun
     │
     ├───────────────┐
     │               │
     ▼               ▼
   Image          SurveyEffort
     │
     ▼
  Capture
     │
     ▼
   Tiger
     │
     ├──────────────► Alert
     │
     └──────────────► Review

CameraStation
     │
     ├──────────────► Image
     ├──────────────► Capture
     └──────────────► SurveyEffort