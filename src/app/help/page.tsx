'use client';

import { MainLayout } from '@/components/layout';
import { Button, Card, CardDescription, CardHeader, CardTitle, Input, TabPanel, Tabs } from '@/components/ui';
import
  {
    Book,
    ChevronRight,
    ExternalLink,
    FileText,
    HelpCircle,
    Mail,
    MessageCircle,
    Phone,
    Search,
    Video,
  } from 'lucide-react';
import { useState } from 'react';

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState('getting-started');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = [
    { id: 'getting-started', label: 'Getting Started', icon: Book },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'tutorials', label: 'Tutorials', icon: Video },
    { id: 'documentation', label: 'Documentation', icon: FileText },
    { id: 'support', label: 'Support', icon: MessageCircle },
  ];

  const quickLinks = [
    { title: 'How to add a new vehicle', category: 'Fleet Management' },
    { title: 'Creating an inspection', category: 'Inspections' },
    { title: 'Opening a job card', category: 'Job Cards' },
    { title: 'Managing tyre inventory', category: 'Tyres' },
    { title: 'Generating reports', category: 'Reports' },
    { title: 'Setting up maintenance schedules', category: 'Maintenance' },
  ];

  const faqItems = [
    {
      question: 'How do I schedule a recurring inspection?',
      answer: 'Navigate to the vehicle dashboard, select the Maintenance tab, and click "Schedule Maintenance". Choose the inspection type and set the recurring interval in days or kilometers.',
    },
    {
      question: 'Can I export my data to Excel?',
      answer: 'Yes, you can export data from the Reports section. Click the Export button and select CSV format, which can be opened in Excel.',
    },
    {
      question: 'How do I track tyre wear across the fleet?',
      answer: 'Use the Tyre Management page to view tread depth across all vehicles. The system automatically highlights tyres approaching replacement threshold.',
    },
    {
      question: 'What happens when inventory falls below minimum stock?',
      answer: 'The system will display a warning indicator on the Inventory page and can send email notifications if configured in Settings.',
    },
    {
      question: 'How do I assign a job card to a technician?',
      answer: 'Open the job card and select a technician from the "Assigned To" dropdown. The technician will be notified of the assignment.',
    },
  ];

  const tutorials = [
    { title: 'Complete Fleet Setup Guide', duration: '15 min', views: 1250 },
    { title: 'Daily Inspection Walkthrough', duration: '8 min', views: 890 },
    { title: 'Job Card Workflow Tutorial', duration: '12 min', views: 675 },
    { title: 'Tyre Management Best Practices', duration: '10 min', views: 445 },
    { title: 'Generating Monthly Reports', duration: '6 min', views: 320 },
    { title: 'Inventory Management System', duration: '11 min', views: 290 },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header with Search */}
        <div className="text-center py-8">
          <h1 className="text-3xl font-bold text-white mb-2">How can we help you?</h1>
          <p className="text-dark-400 mb-6">Search our knowledge base or browse topics below</p>
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              placeholder="Search for help topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-dark-800/50 border border-primary-500/20 text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-3 gap-4">
          {quickLinks.map((link, index) => (
            <button
              key={index}
              className="flex items-center justify-between p-4 rounded-xl bg-dark-800/50 border border-primary-500/10 hover:border-primary-500/30 transition-colors text-left group"
            >
              <div>
                <p className="text-white font-medium group-hover:text-primary-400 transition-colors">{link.title}</p>
                <p className="text-sm text-dark-400">{link.category}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-dark-500 group-hover:text-primary-400 transition-colors" />
            </button>
          ))}
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <TabPanel activeTab={activeTab} tabId="getting-started">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Welcome to Workshop Fleet Management</CardTitle>
                <CardDescription>Get up and running in minutes</CardDescription>
              </CardHeader>
              <div className="space-y-4">
                {[
                  { step: 1, title: 'Add Your Vehicles', description: 'Start by adding your fleet vehicles to the system' },
                  { step: 2, title: 'Set Up Maintenance Schedules', description: 'Configure recurring maintenance reminders' },
                  { step: 3, title: 'Stock Your Inventory', description: 'Add parts and supplies to track stock levels' },
                  { step: 4, title: 'Perform Your First Inspection', description: 'Complete a daily inspection on a vehicle' },
                  { step: 5, title: 'Create a Job Card', description: 'Log repair work and track progress' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4 p-4 rounded-lg bg-dark-800/30 border border-primary-500/10">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400 font-bold">
                      {item.step}
                    </div>
                    <div>
                      <p className="text-white font-medium">{item.title}</p>
                      <p className="text-sm text-dark-400">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Tips</CardTitle>
                <CardDescription>Make the most of the system</CardDescription>
              </CardHeader>
              <div className="space-y-4">
                {[
                  { tip: 'Use keyboard shortcuts for faster navigation', icon: '⌨️' },
                  { tip: 'Set up email notifications to never miss maintenance', icon: '📧' },
                  { tip: 'Use the search bar to quickly find any vehicle', icon: '🔍' },
                  { tip: 'Export reports for monthly fleet reviews', icon: '📊' },
                  { tip: 'Tag faults by severity for priority management', icon: '🏷️' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-dark-800/30 border border-primary-500/10">
                    <span className="text-xl">{item.icon}</span>
                    <p className="text-dark-300">{item.tip}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="faq">
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
              <CardDescription>Common questions and answers</CardDescription>
            </CardHeader>
            <div className="space-y-4">
              {faqItems.map((faq, index) => (
                <details key={index} className="group">
                  <summary className="flex items-center justify-between p-4 rounded-lg bg-dark-800/30 border border-primary-500/10 cursor-pointer hover:border-primary-500/30 transition-colors list-none">
                    <span className="text-white font-medium">{faq.question}</span>
                    <ChevronRight className="w-5 h-5 text-dark-400 transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="px-4 py-3 mt-2 rounded-lg bg-dark-900/50 text-dark-300">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </Card>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="tutorials">
          <Card>
            <CardHeader>
              <CardTitle>Video Tutorials</CardTitle>
              <CardDescription>Step-by-step video guides</CardDescription>
            </CardHeader>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tutorials.map((tutorial, index) => (
                <button
                  key={index}
                  className="text-left p-4 rounded-lg bg-dark-800/30 border border-primary-500/10 hover:border-primary-500/30 transition-colors group"
                >
                  <div className="aspect-video rounded-lg bg-dark-700 mb-3 flex items-center justify-center">
                    <Video className="w-12 h-12 text-dark-500 group-hover:text-primary-400 transition-colors" />
                  </div>
                  <p className="text-white font-medium group-hover:text-primary-400 transition-colors">{tutorial.title}</p>
                  <div className="flex items-center gap-3 text-sm text-dark-400 mt-1">
                    <span>{tutorial.duration}</span>
                    <span>•</span>
                    <span>{tutorial.views.toLocaleString()} views</span>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="documentation">
          <div className="grid lg:grid-cols-3 gap-6">
            {[
              { title: 'User Guide', description: 'Complete guide for end users', icon: Book },
              { title: 'Admin Manual', description: 'System administration guide', icon: FileText },
              { title: 'API Reference', description: 'Developer documentation', icon: FileText },
            ].map((doc, index) => (
              <Card key={index} className="hover:border-primary-500/30 cursor-pointer transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary-500/20">
                    <doc.icon className="w-6 h-6 text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{doc.title}</h3>
                    <p className="text-sm text-dark-400 mt-1">{doc.description}</p>
                    <Button variant="ghost" size="sm" className="mt-3">
                      View Documentation
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="support">
          <div className="grid lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>Get in touch with our support team</CardDescription>
              </CardHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-dark-800/30 border border-primary-500/10">
                  <div className="p-3 rounded-xl bg-primary-500/20">
                    <Mail className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Email Support</p>
                    <p className="text-sm text-dark-400">support@workshopfleet.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-dark-800/30 border border-primary-500/10">
                  <div className="p-3 rounded-xl bg-primary-500/20">
                    <Phone className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Phone Support</p>
                    <p className="text-sm text-dark-400">+27 XX XXX XXXX (Business Hours)</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-lg bg-dark-800/30 border border-primary-500/10">
                  <div className="p-3 rounded-xl bg-primary-500/20">
                    <MessageCircle className="w-5 h-5 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Live Chat</p>
                    <p className="text-sm text-dark-400">Available 8am - 5pm SAST</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Submit a Request</CardTitle>
                <CardDescription>We’ll get back to you within 24 hours</CardDescription>
              </CardHeader>
              <div className="space-y-4">
                <Input label="Subject" placeholder="Brief description of your issue" />
                <div>
                  <label className="block text-sm text-dark-300 mb-2">Message</label>
                  <textarea
                    placeholder="Describe your issue in detail..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-dark-800/50 border border-primary-500/20 text-white placeholder-dark-400 focus:outline-none focus:border-primary-500/50 resize-none"
                  />
                </div>
                <Button className="w-full">
                  <MessageCircle className="w-4 h-4" />
                  Submit Request
                </Button>
              </div>
            </Card>
          </div>
        </TabPanel>
      </div>
    </MainLayout>
  );
}
