1️⃣ UI / Design System
Color Theme
Purpose	Color
Primary	#123ef1ff
Background	#FFFFFF
Dark text	#000000
Error	#FF3B30
Success	#22C55E
Card background	#F6F8FF
Typography

Heading → Inter / Poppins Bold

Body → Inter Regular

UI Style

Rounded cards

Fintech dashboard style

Clean white layout

2️⃣ Website Structure

Main Pages:

Landing Page

Login

Signup

User Dashboard

Task Page

Wallet Page

Withdraw Page

Referral Page

Rewards Page

Leaderboard

Contest Page

Profile Page

Notifications

Support

Admin Panel (Separate Project)

Admin Login

Dashboard

User Management

Task Management

Affiliate Link Management

Withdraw Management

Earnings Analytics

3️⃣ Landing Page (Public)
Sections

Hero Section

Title: Earn Money Online

CTA: Signup / Start Earning

How it Works

Signup

Complete Tasks

Earn Money

Withdraw

Features

Instant Withdraw

Daily Bonus

Referral Program

Stats Section

Total users

Total payout

Tasks completed

Footer

Privacy policy

Terms

Contact

4️⃣ Signup Screen

Fields

Full Name

Gmail

Password

Confirm password

Referral code (optional)

Auto Generated

User Signup ke baad:

Generate:

UserID = EARN + random 6 digit
Example: EARN548291
Firebase Document
users
   uid
      userId
      name
      email
      walletBalance
      referralCode
      referredBy
      level
      createdAt
5️⃣ Login Screen

Fields

Email

Password

Features

Forgot password

Google login (optional)

6️⃣ User Dashboard

Fintech style dashboard.

Sections

Top Card

Wallet Balance

Example

₹320.50

Buttons

Withdraw

Add Task

Quick Stats

Total Earned
Tasks Completed
Referral Earnings

Activity Feed

Latest earnings

Example

+ ₹10 App Install
+ ₹5 Daily Bonus
+ ₹20 Referral
7️⃣ Task Page

User yaha tasks complete karega.

Task Card

Task name
Reward
Time
Button: Start Task

Example

Install App
Reward: ₹15
Time: 2 min
Task Flow

User clicks task

Step:

1 Click affiliate link
2 Complete action
3 Submit proof

Proof types

Screenshot

Username

Email

Admin verify karega.

8️⃣ Wallet System

Wallet screen.

Sections

Balance card

Example

Available Balance
₹120
Wallet Activity

Transaction list

+ ₹10 Task reward
+ ₹5 Daily bonus
- ₹100 Withdrawal
Firebase Wallet Structure
transactions
   id
      userId
      type
      amount
      status
      createdAt

Types

task

referral

bonus

withdrawal

9️⃣ Withdraw Page
Withdrawal Methods

Add:

UPI
Paytm
PayPal
Bank Transfer

Withdraw Form

Fields

Method

Amount

Account details

Rules

Minimum withdraw

₹100

Status

Pending

Approved

Rejected

🔟 Referral Page

User ko referral system milega.

Referral Card
Your referral code

JIYA123
Referral Reward

Invite friend

Earn ₹20

Referral Level System

Example

Level 1 → 5%

Level 10 → 10% (max)

Example

Friend earns ₹100

You earn

₹10

1️⃣1️⃣ Rewards Page

Add gamification.

Features

Daily login bonus

Example

Day 1 → ₹2
Day 7 → ₹10

1️⃣2️⃣ Spin Wheel

User daily spin karega.

Rewards

₹2
₹5
₹10
Better luck

1️⃣3️⃣ Scratch Card

Task complete ke baad

Scratch reward.

1️⃣4️⃣ Leaderboard

Top earners show karo.

Example

1 Rahul ₹5000
2 Aman ₹4300
3 Raju ₹3200

1️⃣5️⃣ Contest Page

Weekly earning contest.

Example

Top 10 winners.

Reward pool

₹5000

1️⃣6️⃣ Profile Page

User info.

Fields

Name

Email

User ID

Referral code

Level

1️⃣7️⃣ Notifications

Example

New task available
Withdraw approved
Referral joined

1️⃣8️⃣ Admin Panel (Separate Project)

Admin panel React + Firebase.

Admin Dashboard

Show stats

Total users
Total payout
Total earnings
Pending withdrawals

User Management

Admin dekh sakta hai

UserID
Email
Wallet balance
Tasks completed
Referral count

Example

UserID: EARN548291
Email: user@gmail.com
Balance: ₹120
Tasks: 12

Admin options

Ban user

Edit wallet

View activity

Task Management

Admin create karega tasks.

Fields

Task name
Description
Reward
Affiliate link
Proof required

Affiliate Link Management

Admin add karega

Offer Name
Affiliate Link
Reward
Limit

Example

CPAGrip offers.

Withdraw Management

Admin approve karega.

Show

UserID
Email
Amount
Method

Actions

Approve
Reject

Earnings Dashboard

Show

Daily revenue
Affiliate earnings
User payouts

Tech Stack

Frontend

React
Next.js

Backend

Firebase Auth
Node.js (Cloud Functions)

Database

Firestore

Hosting

Vercel

Firestore Database Structure
users
tasks
transactions
withdrawals
referrals
leaderboard
contest
notifications
Viral Growth System

Add

Refer & Earn
Spin wheel
Daily bonus
Scratch card
Leaderboard

Ye features user ko addicted banate hai.

Security System

Important.

Add

Firebase Auth

Rate limit

Anti fake accounts

Device tracking