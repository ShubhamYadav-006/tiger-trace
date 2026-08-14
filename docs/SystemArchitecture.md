# TigerTrace — System Architecture

## 1. Architecture Goal

Build an offline-first system that converts raw camera-trap data into individual-tiger intelligence and actionable movement alerts.

---

# 2. High-Level Architecture

                    FOREST STAFF
                         │
                         ▼
                ┌─────────────────┐
                │ React Dashboard │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ Node / Express  │
                │     Backend     │
                └───────┬─────────┘
                        │
        ┌───────────────┼────────────────┐
        │               │                │
        ▼               ▼                ▼
 PostgreSQL       Python ML         Local Storage
 + Prisma          Pipeline
                        │
                        ▼
               Camera-Trap AI
                        │
                 ┌──────┴──────┐
                 ▼             ▼
              Detection     Classification
                               │
                               ▼
                             TIGER
                               │
                               ▼
                         Tiger Re-ID
                               │
                         ┌─────┼─────┐
                         ▼     ▼     ▼
                       Known Review New
                         │     │     │
                         └─────┼─────┘
                               ▼
                        Tiger Database
                               │
                               ▼
                     Spatial Intelligence
                               │
                               ▼
                       Deviation Engine
                               │
                               ▼
                         Alert Engine
                               │
                               ▼
                      React Dashboard
