'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { getUserTickets, createTicket, SupportTicket } from '@/lib/firebase/support'
import { Navbar } from '@/components/navbar'
import { Sidebar } from '@/components/sidebar'
import { MobileBottomNav } from '@/components/mobile-bottom-nav'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageCircle, Plus, FileImage, ChevronDown, ChevronUp, Send, Clock, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'

export default function SupportPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null)
  const [replyMessage, setReplyMessage] = useState('')

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/login')
        return
      }
      setUser(currentUser)
      
      const userTickets = await getUserTickets()
      setTickets(userTickets)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !message.trim()) return

    setSubmitting(true)
    const result = await createTicket(subject, message, screenshot || undefined)
    
    if (result.success) {
      setSubject('')
      setMessage('')
      setScreenshot(null)
      setShowForm(false)
      
      // Refresh tickets
      const userTickets = await getUserTickets()
      setTickets(userTickets)
    }
    
    setSubmitting(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-700">Open</Badge>
      case 'in_progress':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">In Progress</Badge>
      case 'resolved':
        return <Badge variant="secondary" className="bg-green-100 text-green-700">Resolved</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScreenshot(e.target.files[0])
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Navbar />
      <div className="flex">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            {/* Mobile Header */}
            <div className="md:hidden mb-6">
              <h1 className="text-2xl font-bold text-black">Support</h1>
              <p className="text-gray-500">Get help with your account</p>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:flex justify-between items-center mb-8">
              <div>
                <h1 className="text-2xl font-bold text-black">Support Center</h1>
                <p className="text-gray-500">Create tickets and get help from our team</p>
              </div>
              <Button
                onClick={() => setShowForm(!showForm)}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                {showForm ? 'Cancel' : 'New Ticket'}
              </Button>
            </div>

            {/* Mobile New Ticket Button */}
            <div className="md:hidden mb-4">
              <Button
                onClick={() => setShowForm(!showForm)}
                className="w-full bg-primary hover:bg-primary/90 h-12 text-base"
              >
                <Plus className="w-5 h-5 mr-2" />
                {showForm ? 'Cancel' : 'Create New Ticket'}
              </Button>
            </div>

            {/* Create Ticket Form */}
            {showForm && (
              <Card className="mb-6">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Create New Ticket</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Subject</label>
                      <Input
                        placeholder="What's your issue about?"
                        value={subject}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
                        className="h-12"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Message</label>
                      <Textarea
                        placeholder="Describe your issue in detail..."
                        value={message}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
                        rows={4}
                        className="resize-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Screenshot (Optional)
                      </label>
                      <div className="flex items-center space-x-2">
                        <label className="flex items-center px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
                          <FileImage className="w-5 h-5 mr-2 text-gray-600" />
                          <span className="text-sm text-gray-700">
                            {screenshot ? screenshot.name : 'Choose file'}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                        {screenshot && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setScreenshot(null)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 h-12 text-base"
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : 'Submit Ticket'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Tickets List */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full grid grid-cols-4 mb-6 h-12">
                <TabsTrigger value="all" className="text-sm">All</TabsTrigger>
                <TabsTrigger value="open" className="text-sm">Open</TabsTrigger>
                <TabsTrigger value="in_progress" className="text-sm">Progress</TabsTrigger>
                <TabsTrigger value="resolved" className="text-sm">Resolved</TabsTrigger>
              </TabsList>

              {['all', 'open', 'in_progress', 'resolved'].map((status) => (
                <TabsContent key={status} value={status} className="mt-0">
                  <div className="space-y-4">
                    {tickets
                      .filter((ticket) => status === 'all' || ticket.status === status)
                      .map((ticket) => (
                        <Card key={ticket.id} className="overflow-hidden">
                          <div
                            className="p-4 cursor-pointer"
                            onClick={() => setExpandedTicket(
                              expandedTicket === ticket.id ? null : ticket.id as string
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0 mr-4">
                                <div className="flex items-center gap-2 mb-2">
                                  {getStatusBadge(ticket.status)}
                                  <span className="text-sm text-gray-500">
                                    {ticket.createdAt?.toDate && 
                                      format(ticket.createdAt.toDate(), 'MMM d, yyyy')
                                    }
                                  </span>
                                </div>
                                <h3 className="font-semibold text-lg truncate">{ticket.subject}</h3>
                                <p className="text-gray-600 text-sm line-clamp-2 mt-1">
                                  {ticket.message}
                                </p>
                              </div>
                              <div className="flex-shrink-0">
                                {expandedTicket === ticket.id ? (
                                  <ChevronUp className="w-5 h-5 text-gray-400" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Expanded Content */}
                          {expandedTicket === ticket.id && (
                            <div className="border-t bg-gray-50 p-4">
                              {ticket.screenshot && (
                                <div className="mb-4">
                                  <p className="text-sm font-medium mb-2">Screenshot:</p>
                                  <img
                                    src={ticket.screenshot}
                                    alt="Ticket screenshot"
                                    className="max-w-full rounded-lg border max-h-64 object-contain"
                                  />
                                </div>
                              )}

                              {/* Replies */}
                              {ticket.replies && ticket.replies.length > 0 && (
                                <div className="space-y-3 mb-4">
                                  <p className="text-sm font-medium">Conversation:</p>
                                  {ticket.replies.map((reply) => (
                                    <div
                                      key={reply.id}
                                      className={`p-3 rounded-lg ${
                                        reply.isAdmin
                                          ? 'bg-primary/10 ml-0 mr-8'
                                          : 'bg-white ml-8 mr-0 border'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs font-semibold ${
                                          reply.isAdmin ? 'text-primary' : 'text-gray-600'
                                        }`}>
                                          {reply.isAdmin ? 'Support Team' : 'You'}
                                        </span>
                                        <span className="text-xs text-gray-400">
                                          {reply.timestamp?.toDate && 
                                            format(reply.timestamp.toDate(), 'MMM d, h:mm a')
                                          }
                                        </span>
                                      </div>
                                      <p className="text-sm">{reply.message}</p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Reply Form - Only if not resolved */}
                              {ticket.status !== 'resolved' && (
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Type your reply..."
                                    value={replyMessage}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReplyMessage(e.target.value)}
                                    className="flex-1"
                                  />
                                  <Button size="icon" className="bg-primary hover:bg-primary/90">
                                    <Send className="w-4 h-4" />
                                  </Button>
                                </div>
                              )}

                              {ticket.status === 'resolved' && (
                                <div className="flex items-center gap-2 text-green-600">
                                  <CheckCircle className="w-5 h-5" />
                                  <span className="text-sm font-medium">This ticket has been resolved</span>
                                </div>
                              )}
                            </div>
                          )}
                        </Card>
                      ))}

                    {tickets.filter((ticket) => status === 'all' || ticket.status === status).length === 0 && (
                      <div className="text-center py-12">
                        <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No tickets found</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {status === 'all' ? 'Create a new ticket to get started' : `No ${status.replace('_', ' ')} tickets`}
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}
