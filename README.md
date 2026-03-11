# YouthChallenge

A social platform where young people set personal goals, join community challenges, track their progress, and push each other forward through competition and rewards.

---

## Table of Contents

- [What is YouthChallenge?](#what-is-youthchallenge)
- [Actors](#actors)
- [Core Modules](#core-modules)
- [XP & Leveling](#xp--leveling)
- [Badges](#badges)
- [Tech Stack](#tech-stack)

---

## What is YouthChallenge?

YouthChallenge is a JEE project built under the theme **"Applications sociales et interactives pour les jeunes"**.

Young users create personal goals (study, fitness, creativity...), join public or group challenges, submit daily progress, earn XP and badges, and compete on leaderboards with friends. Everything happens in one place — goal tracking, social interaction, and gamification combined.

---

## Actors

### Principal Actors
These actors directly interact with the system and trigger its core use cases.

| Actor | Role |
|---|---|
| **Youth User** | Registers, creates goals, joins challenges, submits progress, earns badges, interacts with the social feed |
| **Challenge Creator** | Any registered user who creates and manages a public or group challenge |

### Secondary Actors
These actors support the system but do not initiate the main use cases.

| Actor | Role |
|---|---|
| **Moderator** | Reviews reported content, validates or removes community challenges |
| **Admin** | Manages users, roles, platform settings, and overall data |
| **Email System** | Sends reminders and notifications (Spring Mail, triggered by the backend) |
| **Google OAuth** | Handles third-party authentication (external system) |

---

## Core Modules

### Authentication & Profile
- Register / Login with JWT + Spring Security
- Google OAuth2 login
- Profile page: avatar, bio, current level, XP, badge showcase
- Profiles are visible to friends

### Goals
Users track personal goals privately.

- Set a goal: title, category, target value, deadline, visibility
- Check in daily or weekly with progress updates
- Streak counter and progress bar
- Completing a goal rewards XP and can unlock a badge

### Challenges
Group or public challenges other users can join.

**Types:**
- **Fixed duration** — e.g. 30-day push-up challenge
- **Milestone-based** — e.g. read 5 books this month
- **Competitive** — e.g. most km run this week

**Lifecycle:**
```
Draft → Open → Active → Completed → Archived
```

Users join before the start date, submit daily proof (text, number, photo), and get ranked automatically.

### Leaderboards
- Global — top users by total XP
- Friends — rank within your friend group
- Challenge — live ranking inside an active challenge
- Weekly leaderboard resets every Monday

### Friends & Groups
- Send and accept friend requests
- Create private groups (classmates, friend circles)
- Groups have their own challenges and leaderboard

### Social Feed
Scrollable feed of friend activity: goals completed, badges earned, challenge results. Users can like and comment.

### Notifications
In-app (WebSocket) and email alerts for: challenge starting, friend overtook you on leaderboard, badge unlocked, daily check-in reminder.

---

## XP & Leveling

| Action | XP |
|---|---|
| Daily check-in | +10 |
| Complete a goal | +100 |
| Complete a challenge | +200 |
| 7-day streak | +50 |
| 1st place in a challenge | +300 |

**Levels:** `Beginner` → `Explorer` → `Achiever` → `Champion` → `Legend`

---

## Badges

| Badge | Condition |
|---|---|
| On Fire | 7-day streak |
| Bookworm | 3 reading goals completed |
| Winner | Finish #1 in a challenge |
| Social Butterfly | 10+ friends |
| Unstoppable | 10 challenges completed |
| First Step | First goal completed |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3, Spring MVC |
| Security | Spring Security, JWT, OAuth2 (Google) |
| Database | MySQL 8, Spring Data JPA, Hibernate |
| Real-time | Spring WebSocket (STOMP) |
| Scheduling | Spring `@Scheduled` |
| Email | Spring Mail |
| Mapping | MapStruct |
| Frontend | React, Tailwind CSS |
| Build | Maven |

---

JEE project — *"Applications sociales et interactives pour les jeunes"*
