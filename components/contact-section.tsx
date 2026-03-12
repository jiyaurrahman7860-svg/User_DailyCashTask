'use client'

import { useState } from 'react'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // Save to Firestore
      await addDoc(collection(db, 'contactMessages'), {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        status: 'new',
        createdAt: new Date().toISOString(),
        source: 'landing_page'
      })
      
      toast.success('Message sent successfully!')
      setSubmitted(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setLoading(false)
    }
    
    // Reset after 5 seconds
    setTimeout(() => setSubmitted(false), 5000)
  }

  return (
    <section id="contact" className="py-16 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Contact Us</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Have questions? We're here to help. Reach out to our support team for assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="space-y-4">
            <Card className="dark:bg-[#1E293B] dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">Email Support</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">For general inquiries</p>
                    <a href="mailto:support@dailytaskpay.com" className="text-primary font-medium">
                      support@dailytaskpay.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-[#1E293B] dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">Response Time</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">We typically respond within</p>
                    <p className="text-primary font-medium">24-48 hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-[#1E293B] dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1 text-gray-900 dark:text-white">Office Hours</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">Monday - Friday</p>
                    <p className="text-primary font-medium">9:00 AM - 6:00 PM IST</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="dark:bg-[#1E293B] dark:border-gray-700">
              <CardContent className="p-6 md:p-8">
                {submitted ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Message Sent!</h3>
                    <p className="text-gray-600 dark:text-gray-300">We'll get back to you within 24-48 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Your Name</label>
                        <Input
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="h-12 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Email Address</label>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="h-12 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Subject</label>
                      <Input
                        placeholder="How can we help you?"
                        value={formData.subject}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        className="h-12 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Message</label>
                      <Textarea
                        placeholder="Describe your issue or question in detail..."
                        value={formData.message}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => 
                          setFormData({ ...formData, message: e.target.value })
                        }
                        rows={5}
                        className="resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 h-12 text-base"
                      disabled={loading}
                    >
                      {loading ? (
                        'Sending...'
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
