# 🏆 YouthChallenge

> A gamified social platform where youth set personal goals, join community challenges, track progress, and motivate each other through competition and rewards.

Think **Duolingo meets Strava meets Reddit** — but for any life goal.

---

## 📋 Table of Contents

- [Overview](#overview)
- [User Roles](#-user-roles)
- [Core Modules](#-core-modules)
- [XP & Leveling System](#-xp--leveling-system)
- [Badge System](#-badge-system)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Sprint Plan](#️-sprint-plan)
- [Getting Started](#-getting-started)

---

## Overview

YouthChallenge is a JEE project built with **Spring Boot** and **React**. Users can create personal goals, join community challenges, earn badges, climb leaderboards, and follow friends' progress through a social activity feed — all in one platform.

---

## 👥 User Roles

| Role | Description |
|---|---|
| **Youth User** | Creates goals, joins challenges, earns badges, interacts socially |
| **Challenge Creator** | Any user who creates a public challenge for others to join |
| **Moderator** | Reviews reported content, manages community challenges |
| **Admin** | Full platform management |

---

## 🗂️ Core Modules

### 🔐 Authentication & Profile
- Register / Login with **JWT + Spring Security**
- OAuth2 social login (Google)
- Profile: avatar, bio, level, XP points, badges showcase
- Public profile page visible to friends

### 🎯 Goals Module
Personal private goals tracked by the user themselves.

- Create a goal with: title, category (fitness, study, creativity…), target, deadline, visibility
- Daily / weekly check-in to log progress
- Progress bar + streak counter
- Goal completion triggers XP gain + possible badge unlock

### 🏅 Challenges Module
Public or group challenges that multiple users join.

**Challenge types:**
- **Fixed duration** — e.g. "Do 20 push-ups every day for 30 days"
- **Milestone-based** — e.g. "Read 5 books this month"
- **Competitive** — e.g. "Who runs the most km this week?"

**Challenge lifecycle:**
```
Draft → Open (accepting joins) → Active → Completed → Archived
```

- Anyone can create a challenge
- Users join before the start date
- Daily proof submission (text, photo, number)
- Automatic ranking during the challenge

### 📊 Leaderboards
- **Global leaderboard** — Top users by XP
- **Friends leaderboard** — Rank among your friend group
- **Challenge leaderboard** — Live ranking within an active challenge
- **Weekly reset** — Weekly XP leaderboard resets every Monday

### 👫 Friends & Groups
- Send / accept friend requests
- View friends' activity feed
- Create **private groups** (e.g. a school class or friend circle)
- Groups can have their own private challenges and leaderboard

### 📰 Social Feed
A scrollable activity feed showing:
- Friends completing goals
- New challenges created
- Badge unlocks
- Challenge results

Users can **like** and **comment** on feed items.

### 🔔 Notifications
- Challenge starting soon
- Friend joined your challenge
- You were overtaken on the leaderboard
- Badge unlocked
- Daily check-in reminder

Delivered via **in-app notifications (WebSocket)** + optional email (Spring Mail).

---

## 🧠 XP & Leveling System

| Action | XP Earned |
|---|---|
| Complete a daily check-in | +10 XP |
| Finish a personal goal | +100 XP |
| Complete a challenge | +200 XP |
| Finish a 7-day streak | +50 XP |
| First place in a challenge | +300 XP |

**Levels:** `Beginner` → `Explorer` → `Achiever` → `Champion` → `Legend`

---

## 🏆 Badge System

Badges are auto-unlocked based on user actions.

| Badge | Trigger |
|---|---|
| 🔥 On Fire | 7-day streak |
| 📚 Bookworm | Complete 3 reading goals |
| 🥇 Winner | Finish #1 in a challenge |
| 👥 Social Butterfly | Have 10+ friends |
| 💪 Unstoppable | Complete 10 challenges |
| 🌱 First Step | Complete your first goal |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3, Spring MVC, Spring Security |
| Auth | JWT, OAuth2 (Google) |
| Database | PostgreSQL + Spring Data JPA |
| Real-time | Spring WebSocket (STOMP) |
| Scheduling | Spring `@Scheduled` |
| Email | Spring Mail |
| Mapping | MapStruct |
| Frontend | React, Tailwind CSS |
| Build | Maven |

---

## 📁 Project Structure

### Backend
```
com.youthchallenge
├── auth/          # JWT, Spring Security, OAuth2
├── user/          # Profile, XP, level management
├── goal/          # Personal goals + check-ins
├── challenge/     # Challenge CRUD + lifecycle
├── badge/         # Badge engine + unlock logic
├── leaderboard/   # Ranking computation
├── social/        # Friends, groups, feed, likes
├── notification/  # WebSocket + email notifications
└── common/        # DTOs, exceptions, utils
```

### Frontend
```
src/
├── pages/
│   ├── Dashboard      # XP, active challenges, streak
│   ├── Goals          # My goals list + check-in
│   ├── Challenges     # Browse, join, create
│   ├── Leaderboard    # Global / friends / challenge
│   ├── Feed           # Social activity feed
│   ├── Profile        # Badges, stats, history
│   └── Groups         # Friend groups
├── components/
│   ├── BadgeCard
│   ├── ChallengeCard
│   ├── ProgressBar
│   ├── LeaderboardRow
│   └── FeedItem
└── hooks/
    ├── useWebSocket   # Live notifications
    └── useXP          # XP animation on gain
```

---

## 🗄️ Database Schema

```
User ──< UserBadge >── Badge
User ──< GoalCheckIn >── Goal
User ──< ChallengeParticipation >── Challenge
User ──< FriendRequest >── User
User ──< GroupMember >── Group
Group ──< Challenge
Challenge ──< ChallengeSubmission
User ──< FeedItem
FeedItem ──< Comment
FeedItem ──< Like
```

---

## 🗓️ Sprint Plan

| Week | Focus |
|---|---|
| 1 | Auth, user profiles, DB schema |
| 2 | Goals module + check-ins |
| 3 | Challenges module + lifecycle |
| 4 | XP system + badge engine |
| 5 | Leaderboards + friends system |
| 6 | Social feed + likes/comments |
| 7 | WebSocket notifications + groups |
| 8 | UI polish, testing, demo prep |

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL 15+
- Maven 3.8+

### Backend
```bash
# Clone the repository
git clone https://github.com/your-username/youthchallenge.git
cd youthchallenge/backend

# Configure your database in application.properties
spring.datasource.url=jdbc:postgresql://localhost:5432/youthchallenge
spring.datasource.username=your_user
spring.datasource.password=your_password

# Run the application
mvn spring-boot:run
```

### Frontend
```bash
cd youthchallenge/frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## 🎓 Academic Context

This project was developed as part of a **JEE (Java Enterprise Edition)** course under the theme *"Applications sociales et interactives pour les jeunes"*.

It demonstrates:
- WebSocket for live leaderboard updates
- Scheduled jobs (`@Scheduled`) for streak resets and weekly rankings
- Event-driven badge engine using Spring Application Events
- Role-based access control via Spring Security
- Complex JPA relationships (many-to-many, self-referential for friends)
- Clean layered architecture (Controller → Service → Repository)

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
