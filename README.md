# YouthChallenge

A social platform where young people set personal goals, join community challenges, track their progress, and push each other forward through competition and rewards.

## Team Members

* **Louai Idrissi** ([louaiidrissi@gmail.com](mailto:louaiidrissi@gmail.com))
* **Saad Hadda** ([saadhd0036@gmail.com](mailto:saadhd0036@gmail.com))
* **Zakaria Jazouli (Ziko145)** ([jazoulizaka@gmail.com](mailto:jazoulizaka@gmail.com))

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Actors](#2-actors)
3. [Core Modules & Gamification](#3-core-modules--gamification)
   - [Authentication & Profile](#authentication--profile)
   - [Goals](#goals)
   - [Challenges](#challenges)
   - [Leaderboards](#leaderboards)
   - [Friends & Communities](#friends--communities)
   - [Social Feed](#social-feed)
   - [Notifications](#notifications)
   - [XP & Leveling System](#xp--leveling-system)
   - [Badges Engine](#badges-engine)
4. [Technology Choices](#4-technology-choices)
5. [Architecture](#5-architecture)
   - [Layered Architecture](#layered-architecture)
   - [Real-Time Pipeline](#real-time-pipeline)
   - [Decoupled Events](#decoupled-events)
6. [Setup Instructions](#6-setup-instructions)
   - [Prerequisites](#prerequisites)
   - [Database Setup](#database-setup)
   - [Backend Execution](#backend-execution)
   - [Frontend Execution](#frontend-execution)
   - [Docker & Kubernetes](#docker--kubernetes)
7. [Challenges Faced](#7-challenges-faced)
8. [Conclusion](#8-conclusion)

---

## 1. Introduction

**YouthChallenge** is a gamified social application developed for the JEE/Spring Boot course under the theme *"Applications sociales et interactives pour les jeunes"*. 

The application helps young users stay motivated and build habits by combining private goal tracking, public community challenges, and gamification elements (experience points, leveling tiers, and custom badge triggers).

---

## 2. Actors

* **Youth User**: Registers, logs progress on goals, joins challenges, interacts with friends on the feed, and earns XP/badges.
* **Challenge Creator**: Creates and manages challenges (sets rules, timelines, and milestones).
* **Moderator / Admin**: Moderates community content, manages users, and configures platform settings.
* **Email System**: Sends check-in reminders and event alerts via Spring Mail.
* **Google OAuth**: External provider for secure Single Sign-On (SSO).

---

## 3. Core Modules & Gamification

### Authentication & Profile
* Secure credentials sign-in using JWT (Spring Security) + Google OAuth2 login.
* Profile page showcasing XP, level, bio, and earned badges.

### Goals
* Private goal tracking (categories: fitness, study, creativity, etc.) with custom target values and deadlines.
* Daily check-ins, streak counts, and progress tracking bars.

### Challenges
* Public and community challenges (`Fixed Duration`, `Milestone-based`, and `Competitive`).
* Lifecycle states: `Draft` &rarr; `Open` &rarr; `Active` &rarr; `Completed` &rarr; `Archived`.
* Performance ranks are calculated automatically based on daily submissions.

### Leaderboards
* **Global**: Top 50 users based on total XP.
* **Friends**: Rankings within the user's social network.
* **Challenge**: Real-time ranks within active challenges.

### Friends & Communities
* Friend request systems to connect with other users.
* Custom user communities (classmates, circles) featuring local leaderboards and challenges.

### Social Feed
* Real-time chronological feed displaying achievements (completed goals, challenges won, badges earned) with likes and comments.

### Notifications
* Real-time in-app alerts via WebSockets (STOMP) and email reminders for check-ins.

### XP & Leveling System
Activities reward Experience Points (XP) mapped to progression levels:
* **Daily Check-in**: +10 XP  (7-day streak bonus: +50 XP)
* **Goal Completion**: +100 XP
* **Challenge Completion**: +200 XP (1st place bonus: +300 XP)

*Tiers:* **Beginner** (0 XP) &rarr; **Explorer** (500 XP) &rarr; **Achiever** (1500 XP) &rarr; **Champion** (3500 XP) &rarr; **Legend** (7000+ XP).

### Badges Engine
Evaluates milestones asynchronously to grant profile badges:
* `FIRST_STEP`: Completing the first goal.
* `ON_FIRE`: Maintaining a 7-day streak on any goal.
* `BOOKWORM`: Completing 3 goals in the `STUDY` category.
* `WINNER`: Taking 1st place in a challenge.
* `UNSTOPPABLE`: Completing 10 challenges.
* `SOCIAL_BUTTERFLY`: Connecting with 10 accepted friends.

---

## 4. Technology Choices

* **Backend**: **Spring Boot 3** (REST API endpoints), **Spring Security + JWT** (stateless authorization), and **Spring Data JPA/Hibernate** (MySQL persistent mapping).
* **Real-time & Events**: **Spring WebSockets (STOMP)** for instant feed updates and **Spring Application Events** to process badges asynchronously.
* **Frontend**: **React 18** (Vite build system, React Context for state, and Tailwind CSS for responsive styling).

---

## 5. Architecture

### Layered Architecture
Decoupled domain packages (`auth`, `user`, `goal`, `challenge`, `badge`, `social`, etc.) adhering to the traditional layered pattern:
`Controller (API Routing) -> DTO/MapStruct (Mapping) -> Service (Business Logic) -> Repository (JPA/DB)`.

### Real-Time Pipeline
Client establishes a connection to `/ws` using STOMP protocol. The backend broadcasts updates via `SimpMessagingTemplate` directly to subscribed users.

### Decoupled Events
Services communicate asynchronously using Spring Events to prevent performance bottlenecks. For example:
`GoalService` &rarr; Publishes `GoalCompletedEvent` &rarr; Handled by `BadgeEvaluator` & `NotificationService`.

---

## 6. Setup Instructions

### Prerequisites
* JDK 17+
* Node.js v18+
* Maven 3.8+ (or `./mvnw`)
* MySQL Server 8.x

### Database Setup
```sql
CREATE DATABASE youthchallenge CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Backend Execution
1. Configure credentials in `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/youthchallenge?createDatabaseIfNotExist=true
   spring.datasource.username=root
   spring.datasource.password=your_mysql_password
   jwt.secret=YourSuperSecretKeyAtLeast256BitsLong
   ```
2. Build and run:
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```
   *Backend launches on `http://localhost:9696`.*

### Frontend Execution
1. Create a `frontend/.env` file:
   ```env
   VITE_API_URL=http://localhost:9696/api/v1
   VITE_WS_URL=ws://localhost:9696/ws
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   ```
2. Install dependencies and run:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *Frontend launches on `http://localhost:5173`.*

### Docker & Kubernetes
* **Docker Compose**: Spin up all services using `docker-compose up --build` from the root directory.
* **Kubernetes**: Apply configurations from the `/k8s` directory: `kubectl apply -f k8s/`.

---

## 7. Challenges Faced

1. **Stateful WebSocket Authentication**: Overcame stateless WebSocket handshake restrictions by passing JWTs in the initial connection STOMP headers and validating credentials using custom channel interceptors.
2. **Transactional Event Boundaries**: Decoupled core goal completions from secondary badging rewards using `@TransactionalEventListener` to prevent badge exceptions from rolling back completed goals.
3. **Database-Level Performance**: Optimized challenge rankings by moving expensive sorting from JVM memory to database-level native SQL aggregate queries using composite indexes.
4. **Infrastructure Orchestration**: Used Terraform and EKS manifests to automate deployment configurations (injecting Secrets, ConfigMaps, and RDS parameters).

---

## 8. Conclusion

**YouthChallenge** demonstrates a modular, scalable Spring Boot and React application implementing JEE design principles. By separating concerns through event-driven messaging, leveraging real-time WebSockets, and providing a clean, containerized setup, the application delivers a premium, highly responsive user experience.
