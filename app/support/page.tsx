'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { MobileMenu } from '@/components/mobile-menu'
import { HelpCircle, MessageSquare, Clock, CheckCircle2, AlertCircle, Send, Plus, ChevronDown, ChevronUp, ArrowLeft, ArrowLeftRight, UserCircle, ClipboardList } from 'lucide-react'

interface Ticket {
  id: string
  subject: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  category: string
  createdAt: any
  updatedAt: any
}

interface Reply {
  id: string
  ticketId: string
  message: string
  isAdmin: boolean
  createdAt: any
  adminName?: string
}

export default function SupportPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  
  // New ticket form
  const [showNewForm, setShowNewForm] = useState(false)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('general')
  
  // Reply form
  const [replyMessage, setReplyMessage] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)

      // Load user's tickets
      const ticketsQuery = query(
        collection(db, 'supportTickets'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      )
      
      const unsubscribeTickets = onSnapshot(ticketsQuery, (snapshot) => {
        const ticketList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Ticket[]
        setTickets(ticketList)
        setLoading(false)
      })

      return () => unsubscribeTickets()
    })

    return () => unsubscribe()
  }, [router])

  // Load replies when ticket selected
  useEffect(() => {
    if (!selectedTicket) {
      setReplies([])
      return
    }

    const repliesQuery = query(
      collection(db, 'supportTickets', selectedTicket.id, 'replies'),
      orderBy('createdAt', 'asc')
    )
    
    const unsubscribeReplies = onSnapshot(repliesQuery, (snapshot) => {
      const replyList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Reply[]
      setReplies(replyList)
    })

    return () => unsubscribeReplies()
  }, [selectedTicket])

  const generateTicketId = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000)
    return `DTP${randomNum}`
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !subject.trim() || !description.trim()) return

    setSubmitting(true)
    try {
      const ticketId = generateTicketId()
      await setDoc(doc(db, 'supportTickets', ticketId), {
        userId: user.uid,
        userEmail: user.email,
        subject: subject.trim(),
        description: description.trim(),
        category,
        status: 'open',
        priority: 'medium',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
      
      setSubject('')
      setDescription('')
      setCategory('general')
      setShowNewForm(false)
      alert(`Ticket ${ticketId} created successfully!`)
    } catch (error) {
      console.error('Error creating ticket:', error)
      alert('Failed to create ticket')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedTicket || !replyMessage.trim()) return

    setSubmitting(true)
    try {
      await addDoc(collection(db, 'supportTickets', selectedTicket.id, 'replies'), {
        ticketId: selectedTicket.id,
        userId: user.uid,
        message: replyMessage.trim(),
        isAdmin: false,
        createdAt: serverTimestamp()
      })
      
      // Update ticket status to open if it was resolved
      if (selectedTicket.status === 'resolved' || selectedTicket.status === 'closed') {
        // This would need to be done via cloud function or direct update if allowed
      }
      
      setReplyMessage('')
    } catch (error) {
      console.error('Error sending reply:', error)
      alert('Failed to send reply')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'open':
        return { icon: AlertCircle, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Open' }
      case 'in_progress':
        return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'In Progress' }
      case 'resolved':
        return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100', label: 'Resolved' }
      case 'closed':
        return { icon: CheckCircle2, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Closed' }
      default:
        return { icon: AlertCircle, color: 'text-gray-600', bg: 'bg-gray-100', label: status }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 md:pb-0 transition-colors duration-300">
      <Navbar />
      <div className="flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className="flex-1 p-3 md:p-6 w-full">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex items-center gap-2 md:gap-3">
                <MobileMenu />
                <div>
                  <h1 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                    Support
                  </h1>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-0.5 md:mt-1 hidden sm:block">Get help with your account</p>
                </div>
              </div>
              <Button 
                className="bg-primary hover:bg-primary/90 text-sm md:text-base px-3 md:px-4"
                onClick={() => {
                  setShowNewForm(!showNewForm)
                  setSelectedTicket(null)
                }}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1 md:mr-2" />
                <span className="hidden sm:inline">New Ticket</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>

            {/* New Ticket Form */}
            {showNewForm && (
              <Card className="mb-4 md:mb-6 border-0 shadow-sm dark:bg-[#1E293B] dark:border-gray-700">
                <CardContent className="p-3 md:p-6">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <h3 className="font-semibold text-sm md:text-base text-gray-900 dark:text-white">Create New Ticket</h3>
                    <button 
                      onClick={() => setShowNewForm(false)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>
                  </div>
                  <form onSubmit={handleCreateTicket} className="space-y-3 md:space-y-4">
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                      <Input
                        placeholder="Brief description of your issue"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="withdrawal">Withdrawal Issue</option>
                        <option value="task">Task Problem</option>
                        <option value="account">Account Issue</option>
                        <option value="technical">Technical Support</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                      <textarea
                        placeholder="Please provide detailed information about your issue..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm min-h-[80px] md:min-h-[120px] resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        required
                      />
                    </div>
                    <div className="flex gap-2 md:gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1 dark:border-gray-700 dark:text-gray-300 text-sm"
                        onClick={() => setShowNewForm(false)}
                        size="sm"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1 bg-primary hover:bg-primary/90 text-sm"
                        disabled={submitting}
                        size="sm"
                      >
                        {submitting ? 'Creating...' : 'Create'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Ticket Detail View */}
            {selectedTicket ? (
              <div className="space-y-4">
                {(() => {
                  const config = getStatusConfig(selectedTicket.status)
                  
                  const statusTheme = {
                    open: { 
                      gradient: 'from-blue-500/10 to-blue-600/20',
                      accent: 'bg-blue-500',
                      badgeBg: 'bg-blue-500/20',
                      badgeText: 'text-blue-400',
                      border: 'border-blue-500/30',
                      shadow: 'shadow-blue-500/20',
                      glow: 'shadow-[0_0_30px_-5px_rgba(59,130,246,0.3)]'
                    },
                    in_progress: { 
                      gradient: 'from-yellow-500/10 to-yellow-600/20',
                      accent: 'bg-yellow-500',
                      badgeBg: 'bg-yellow-500/20',
                      badgeText: 'text-yellow-400',
                      border: 'border-yellow-500/30',
                      shadow: 'shadow-yellow-500/20',
                      glow: 'shadow-[0_0_30px_-5px_rgba(234,179,8,0.3)]'
                    },
                    resolved: { 
                      gradient: 'from-green-500/10 to-green-600/20',
                      accent: 'bg-green-500',
                      badgeBg: 'bg-green-500/20',
                      badgeText: 'text-green-400',
                      border: 'border-green-500/30',
                      shadow: 'shadow-green-500/20',
                      glow: 'shadow-[0_0_30px_-5px_rgba(34,197,94,0.3)]'
                    },
                    closed: { 
                      gradient: 'from-gray-500/10 to-gray-600/20',
                      accent: 'bg-gray-500',
                      badgeBg: 'bg-gray-500/20',
                      badgeText: 'text-gray-400',
                      border: 'border-gray-500/30',
                      shadow: 'shadow-gray-500/20',
                      glow: 'shadow-[0_0_30px_-5px_rgba(107,114,128,0.3)]'
                    },
                  }
                  const theme = statusTheme[selectedTicket.status] || statusTheme.closed
                  const Icon = config.icon
                  
                  return (
                    <>
                      {/* Main Ticket Card */}
                      <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.gradient} ${theme.border} border backdrop-blur-md ${theme.glow} shadow-lg`}>
                        {/* Header */}
                        <div className="p-4 md:p-6">
                          {/* Back Button */}
                          <button
                            onClick={() => setSelectedTicket(null)}
                            className="group flex items-center gap-2 text-sm text-gray-400 hover:text-primary transition-colors mb-4"
                          >
                            <div className="w-8 h-8 rounded-full bg-white/10 dark:bg-gray-800/50 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                              <ArrowLeft className="w-4 h-4" />
                            </div>
                            <span>Back to tickets</span>
                          </button>
                          
                          {/* Title & ID */}
                          <div className="mb-4">
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2">
                              {selectedTicket.subject}
                            </h2>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-mono">#{selectedTicket.id.slice(-8)}</span>
                              <span>•</span>
                              <span className="capitalize">{selectedTicket.category.replace('-', ' ')}</span>
                            </div>
                          </div>
                          
                          {/* Status Badge */}
                          <div className="flex flex-wrap items-center gap-3">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${theme.badgeBg} border border-white/10 backdrop-blur-sm`}>
                              <span className={`w-2 h-2 rounded-full ${theme.accent} ${selectedTicket.status !== 'closed' && selectedTicket.status !== 'resolved' ? 'animate-pulse' : ''}`} />
                              <Icon className={`w-4 h-4 ${theme.badgeText}`} />
                              <span className={`text-sm font-semibold ${theme.badgeText}`}>
                                {config.label}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1.5 text-sm text-gray-400 dark:text-gray-500">
                              <Clock className="w-4 h-4" />
                              <span>{selectedTicket.createdAt?.toDate?.()?.toLocaleDateString('en-IN', { 
                                day: 'numeric', 
                                month: 'long',
                                year: 'numeric'
                              }) || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                        
                        {/* Original Message */}
                        <div className="px-4 md:px-6 pb-4 md:pb-6">
                          <div className="bg-white/50 dark:bg-gray-900/50 rounded-xl p-4 border border-white/20 dark:border-gray-700/50 backdrop-blur-sm">
                            <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                              {selectedTicket.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Replies Section */}
                      {replies.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1">
                            Conversation
                          </h4>
                          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                            {replies.map((reply) => (
                              <div 
                                key={reply.id}
                                className={`rounded-xl p-4 border backdrop-blur-sm ${
                                  reply.isAdmin 
                                    ? 'bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 dark:bg-blue-900/20' 
                                    : 'bg-white/50 dark:bg-gray-800/50 border-white/20 dark:border-gray-700/50'
                                }`}
                              >
                                <div className="flex items-center gap-3 mb-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                    reply.isAdmin 
                                      ? 'bg-blue-500 text-white' 
                                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                  }`}>
                                    {reply.isAdmin ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-sm font-bold">Y</span>}
                                  </div>
                                  <div>
                                    <p className={`text-sm font-semibold ${
                                      reply.isAdmin ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                                    }`}>
                                      {reply.isAdmin ? (reply.adminName || 'Support Team') : 'You'}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                      {reply.createdAt?.toDate?.()?.toLocaleString('en-IN', {
                                        day: 'numeric',
                                        month: 'short',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      }) || 'N/A'}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 pl-11">
                                  {reply.message}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Reply Form */}
                      {selectedTicket.status !== 'closed' && (
                        <div className="bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-800/30 dark:to-gray-900/30 rounded-2xl p-4 border border-white/20 dark:border-gray-700/50 backdrop-blur-sm">
                          <form onSubmit={handleSendReply}>
                            <div className="flex gap-3">
                              <Input
                                placeholder="Type your message..."
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                                className="flex-1 bg-white/80 dark:bg-gray-800/80 border-white/50 dark:border-gray-700/50 backdrop-blur-sm text-sm"
                              />
                              <Button 
                                type="submit" 
                                className="bg-primary hover:bg-primary/90 px-4 rounded-xl"
                                disabled={submitting || !replyMessage.trim()}
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            </div>
                          </form>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
            ) : (
              /* Tickets List */
              <div className="space-y-2 md:space-y-3">
                {tickets.length === 0 ? (
                  <Card className="border-0 shadow-sm dark:bg-[#1E293B] dark:border-gray-700">
                    <CardContent className="p-6 md:p-8 text-center">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                        <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <h3 className="font-medium text-sm md:text-base text-gray-900 dark:text-white mb-1">No tickets yet</h3>
                      <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-3 md:mb-4">Create a ticket if you need help</p>
                      <Button 
                        className="bg-primary hover:bg-primary/90 text-sm"
                        onClick={() => setShowNewForm(true)}
                        size="sm"
                      >
                        <Plus className="w-4 h-4 mr-1 md:mr-2" />
                        Create Ticket
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  tickets.map((ticket) => {
                    const config = getStatusConfig(ticket.status)
                    
                    const statusTheme = {
                      open: { 
                        gradient: 'from-blue-500/5 to-blue-600/10',
                        accent: 'bg-blue-500',
                        badgeBg: 'bg-blue-500/15',
                        badgeText: 'text-blue-400',
                        border: 'border-blue-500/20',
                        shadow: 'shadow-blue-500/10'
                      },
                      in_progress: { 
                        gradient: 'from-yellow-500/5 to-yellow-600/10',
                        accent: 'bg-yellow-500',
                        badgeBg: 'bg-yellow-500/15',
                        badgeText: 'text-yellow-400',
                        border: 'border-yellow-500/20',
                        shadow: 'shadow-yellow-500/10'
                      },
                      resolved: { 
                        gradient: 'from-green-500/5 to-green-600/10',
                        accent: 'bg-green-500',
                        badgeBg: 'bg-green-500/15',
                        badgeText: 'text-green-400',
                        border: 'border-green-500/20',
                        shadow: 'shadow-green-500/10'
                      },
                      closed: { 
                        gradient: 'from-gray-500/5 to-gray-600/10',
                        accent: 'bg-gray-500',
                        badgeBg: 'bg-gray-500/15',
                        badgeText: 'text-gray-400',
                        border: 'border-gray-500/20',
                        shadow: 'shadow-gray-500/10'
                      },
                    }
                    const theme = statusTheme[ticket.status] || statusTheme.closed
                    
                    return (
                      <div
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`group relative overflow-hidden rounded-xl bg-gradient-to-br ${theme.gradient} ${theme.border} border backdrop-blur-sm cursor-pointer transition-all duration-300 hover:shadow-lg ${theme.shadow} hover:-translate-y-0.5 active:translate-y-0 dark:bg-[#1E293B]/40`}
                      >
                        {/* Glow effect on hover */}
                        <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r ${theme.gradient} blur-xl`} />
                        
                        <div className="relative p-4">
                          {/* Top Row: ID + Status */}
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-medium text-gray-400 font-mono tracking-wide uppercase">
                              #{ticket.id.slice(-8)}
                            </span>
                            
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${theme.badgeBg} backdrop-blur-sm border border-white/10`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${theme.accent} animate-pulse`} />
                              <span className={`text-[11px] font-semibold ${theme.badgeText}`}>
                                {config.label}
                              </span>
                            </div>
                          </div>
                          
                          {/* Subject */}
                          <h4 className="font-bold text-base text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                            {ticket.subject}
                          </h4>
                          
                          {/* Description Preview */}
                          <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mb-4 leading-relaxed">
                            {ticket.description}
                          </p>
                          
                          {/* Bottom Row */}
                          <div className="flex items-center justify-between pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
                            <div className="flex items-center gap-2">
                              {/* Category Tag */}
                              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize font-medium">
                                {ticket.category.replace('-', ' ')}
                              </span>
                            </div>
                            
                            {/* Date + Arrow */}
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-gray-400 dark:text-gray-500">
                                {ticket.createdAt?.toDate?.()?.toLocaleDateString('en-IN', { 
                                  day: 'numeric', 
                                  month: 'short'
                                }) || 'N/A'}
                              </span>
                              
                              <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                                <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-white -rotate-90 transition-colors" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {/* FAQ Section */}
            {!selectedTicket && !showNewForm && (
              <Card className="mt-4 md:mt-6 border-0 shadow-sm dark:bg-[#1E293B] dark:border-gray-700">
                <CardContent className="p-3 md:p-6">
                  <h3 className="font-semibold mb-3 md:mb-4 text-sm md:text-base text-gray-900 dark:text-white">Frequently Asked Questions</h3>
                  <div className="space-y-2 md:space-y-3">
                    <details className="p-2.5 md:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg group">
                      <summary className="font-medium text-xs md:text-sm mb-1 cursor-pointer list-none flex justify-between items-center text-gray-900 dark:text-white">
                        How long does withdrawal take?
                        <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                      </summary>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Withdrawals are typically processed within 24-48 hours after approval.</p>
                    </details>
                    <details className="p-2.5 md:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg group">
                      <summary className="font-medium text-xs md:text-sm mb-1 cursor-pointer list-none flex justify-between items-center text-gray-900 dark:text-white">
                        Why was my task rejected?
                        <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                      </summary>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Tasks may be rejected if proof is insufficient or task requirements weren&apos;t met.</p>
                    </details>
                    <details className="p-2.5 md:p-3 bg-gray-50 dark:bg-gray-800 rounded-lg group">
                      <summary className="font-medium text-xs md:text-sm mb-1 cursor-pointer list-none flex justify-between items-center text-gray-900 dark:text-white">
                        How do I earn more?
                        <ChevronDown className="w-4 h-4 transition-transform group-open:rotate-180" />
                      </summary>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Complete more tasks, maintain your daily streak, and refer friends!</p>
                    </details>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}
