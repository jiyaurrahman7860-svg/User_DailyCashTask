# User Panel Deployment Guide

## Project Information
- **Project Name:** DailyTaskPay User Panel
- **Framework:** Next.js 16 (App Router)
- **Port:** 3000 (local development)

## Files Required for Deployment

### Source Files
```
User_DailyTaskPay/
├── app/                    # Next.js App Router pages
│   ├── about/
│   ├── admin/
│   ├── banned/
│   ├── dashboard/
│   ├── earn/
│   ├── globals.css
│   ├── layout.tsx
│   ├── login/
│   ├── notification/
│   ├── page.tsx
│   ├── profile/
│   ├── refer-earn/
│   ├── spin/
│   ├── support/
│   ├── tasks/
│   ├── transactions/
│   ├── wallet/
│   ├── withdraw/
│   └── [other routes]
├── components/             # React components
│   ├── ui/
│   ├── AnnouncementBanner.tsx
│   ├── ClientWrapper.tsx
│   ├── DashboardLayout.tsx
│   ├── navbar.tsx
│   ├── sidebar.tsx
│   └── [other components]
├── contexts/               # React contexts
│   └── ScrollRefreshContext.tsx
├── hooks/                  # Custom hooks
├── lib/                    # Utilities
├── public/                 # Static assets
├── middleware.ts           # Next.js middleware
├── firebaseConfig.js       # Firebase config
├── next.config.js
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── next-env.d.ts
```

## Environment Variables Required

Create `.env.local` file with these variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Admin Credentials (for user-admin panel access)
ADMIN_EMAIL=admin@dailytaskpay.com
ADMIN_PASSWORD=your_admin_password
```

### How to Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: **dailytaskpay-73fac**
3. Click **Project Settings** (gear icon)
4. Go to **General** tab
5. Scroll to **Your apps** section
6. Click **Web app** (</> icon)
7. Copy the configuration values

## Deployment Steps

### Option 1: Deploy to Vercel (Recommended)

#### Step 1: Prepare Environment
```bash
cd User_DailyTaskPay
npm install
```

#### Step 2: Build Locally (Optional Test)
```bash
npm run build
```

#### Step 3: Deploy to Vercel
```bash
# Install Vercel CLI if not installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Or for production
vercel --prod
```

#### Step 4: Add Environment Variables in Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Add all variables from `.env.local`
5. Redeploy if needed

### Option 2: Deploy via Vercel Dashboard

1. Push code to GitHub/GitLab/Bitbucket
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click **Add New Project**
4. Import your repository
5. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** `User_DailyTaskPay`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
6. Add Environment Variables
7. Click **Deploy**

## Post-Deployment Checks

- [ ] Homepage loads correctly
- [ ] Login/Signup working
- [ ] Dashboard loads user data
- [ ] Tasks page functional
- [ ] Wallet & Withdrawal working
- [ ] Refer & Earn page working
- [ ] Spin wheel functional
- [ ] Mobile responsive

## Important Notes

- **Firebase Auth:** Ensure Firebase Authentication is enabled in console
- **Firestore Rules:** Update security rules for production
- **Admin Access:** Set ADMIN_EMAIL and ADMIN_PASSWORD for user-admin panel
- **CORS:** Configure if API calls fail after deployment

## Troubleshooting

### Build Errors
```bash
# Clear cache and rebuild
rm -rf .next
rm -rf node_modules
npm install
npm run build
```

### Firebase Connection Issues
- Check if environment variables are correctly set
- Verify Firebase project permissions
- Check browser console for CORS errors

### Middleware Issues
- Ensure `middleware.ts` handles auth correctly
- Check Vercel functions timeout settings

## Support

For issues contact: [Your Support Email]
