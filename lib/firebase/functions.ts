import { getFunctions, httpsCallable, connectFunctionsEmulator } from 'firebase/functions'
import { app } from './firebaseConfig'

const functions = getFunctions(app)

// Use emulator in development
if (process.env.NODE_ENV === 'development') {
  connectFunctionsEmulator(functions, 'localhost', 5001)
}

// Wallet Functions
export const creditWallet = (data: { userId: string; amount: number; type: string; description?: string }) =>
  httpsCallable(functions, 'creditWallet')(data)

export const debitWallet = (data: { userId: string; amount: number; description?: string }) =>
  httpsCallable(functions, 'debitWallet')(data)

export const getWalletBalance = () =>
  httpsCallable(functions, 'getWalletBalance')({})

// Withdrawal Functions
export const submitWithdrawal = (data: { amount: number; method: string; accountDetails: string }) =>
  httpsCallable(functions, 'submitWithdrawal')(data)

export const approveWithdrawal = (data: { withdrawalId: string }) =>
  httpsCallable(functions, 'approveWithdrawal')(data)

export const rejectWithdrawal = (data: { withdrawalId: string; reason?: string }) =>
  httpsCallable(functions, 'rejectWithdrawal')(data)

// Referral Functions
export const generateReferralCode = () =>
  httpsCallable(functions, 'generateReferralCode')({})

export const processReferral = (data: { referralCode: string }) =>
  httpsCallable(functions, 'processReferral')(data)

// New Referral Commission System Functions
export const processSignupReferral = (data: { 
  referralCode: string
  userId: string
  userName: string
  userEmail: string 
}) =>
  httpsCallable(functions, 'processSignupReferral')(data)

export const getMyReferrals = (data?: { page?: number; limit?: number }) =>
  httpsCallable(functions, 'getMyReferrals')(data || {})

// Admin Referral Functions
export const getAdminReferralStats = () =>
  httpsCallable(functions, 'getAdminReferralStats')({})

export const getUserReferralChain = (data: { userId: string }) =>
  httpsCallable(functions, 'getUserReferralChain')(data)

export const manualCalculateCommissions = (data?: { date?: string }) =>
  httpsCallable(functions, 'manualCalculateCommissions')(data || {})

export const getReferralStats = () =>
  httpsCallable(functions, 'getReferralStats')({})

export const getReferrals = (data?: { limit?: number }) =>
  httpsCallable(functions, 'getReferrals')(data || {})

// Task Functions
export const submitTaskProof = (data: { taskId: string; proof: string; proofType?: string; hasFile?: boolean }) =>
  httpsCallable(functions, 'submitTaskProof')(data)

export const approveTaskSubmission = (data: { submissionId: string }) =>
  httpsCallable(functions, 'approveTaskSubmission')(data)

export const rejectTaskSubmission = (data: { submissionId: string; reason?: string }) =>
  httpsCallable(functions, 'rejectTaskSubmission')(data)

export const getUserTaskSubmissions = (data?: { status?: string; limit?: number }) =>
  httpsCallable(functions, 'getUserTaskSubmissions')(data || {})

export const getPendingSubmissions = (data?: { limit?: number }) =>
  httpsCallable(functions, 'getPendingSubmissions')(data || {})

// Rewards Functions
export const claimDailyBonus = () =>
  httpsCallable(functions, 'claimDailyBonus')({})

export const claimDailyBonusStreak = () =>
  httpsCallable(functions, 'claimDailyBonusStreak')({})

export const getDailyBonusStreak = () =>
  httpsCallable(functions, 'getDailyBonusStreak')({})

export const giveSignupBonus = (data: { ipAddress: string; deviceFingerprint: string }) =>
  httpsCallable(functions, 'giveSignupBonus')(data)

export const spinWheel = () =>
  httpsCallable(functions, 'spinWheel')({})

// Scratch Card Functions
export const getScratchCards = () =>
  httpsCallable(functions, 'getScratchCards')({})

export const scratchCard = (data: { cardId: string }) =>
  httpsCallable(functions, 'scratchCard')(data)

export const claimScratchCardReward = (data: { cardId: string; reward: number }) =>
  httpsCallable(functions, 'claimScratchCardReward')(data)

// Health Check
export const healthCheck = () =>
  httpsCallable(functions, 'healthCheck')({})
