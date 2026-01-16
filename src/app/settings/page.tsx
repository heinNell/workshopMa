'use client';

import { MainLayout } from '@/components/layout';
import { Button, Card, CardDescription, CardHeader, CardTitle, Input, Select, TabPanel, Tabs } from '@/components/ui';
import
  {
    Bell,
    Database,
    Palette,
    RefreshCw,
    Save,
    Settings,
    Shield,
    User,
    Wrench,
  } from 'lucide-react';
import { useState } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'users', label: 'Users & Access', icon: User },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-dark-400 mt-1">Configure application settings and preferences</p>
        </div>

        {/* Tabs */}
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Content */}
        <TabPanel activeTab={activeTab} tabId="general">
          <div className="space-y-6 max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Basic company details for reports and documents</CardDescription>
              </CardHeader>
              <div className="space-y-4">
                <Input label="Company Name" placeholder="Enter company name" defaultValue="Workshop Fleet Management" />
                <Input label="Registration Number" placeholder="Company registration" />
                <Input label="VAT Number" placeholder="VAT registration number" />
                <Input label="Address" placeholder="Physical address" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Phone" placeholder="+27 XX XXX XXXX" />
                  <Input label="Email" placeholder="info@company.com" />
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Preferences</CardTitle>
                <CardDescription>Default system behavior settings</CardDescription>
              </CardHeader>
              <div className="space-y-4">
                <Select
                  label="Date Format"
                  options={[
                    { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY' },
                    { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY' },
                    { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD' },
                  ]}
                />
                <Select
                  label="Currency"
                  options={[
                    { value: 'ZAR', label: 'South African Rand (ZAR)' },
                    { value: 'USD', label: 'US Dollar (USD)' },
                    { value: 'EUR', label: 'Euro (EUR)' },
                  ]}
                />
                <Select
                  label="Timezone"
                  options={[
                    { value: 'Africa/Johannesburg', label: 'Africa/Johannesburg (SAST)' },
                    { value: 'UTC', label: 'UTC' },
                  ]}
                />
              </div>
            </Card>

            <div className="flex justify-end">
              <Button>
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="notifications">
          <div className="space-y-6 max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Configure email alerts and notifications</CardDescription>
              </CardHeader>
              <div className="space-y-4">
                {[
                  { id: 'inspection-due', label: 'Inspection Due Reminders', description: 'Receive alerts before scheduled inspections' },
                  { id: 'maintenance-due', label: 'Maintenance Reminders', description: 'Alerts for upcoming scheduled maintenance' },
                  { id: 'low-stock', label: 'Low Stock Alerts', description: 'Notifications when inventory falls below threshold' },
                  { id: 'fault-reported', label: 'New Fault Reports', description: 'Immediate alerts for new fault submissions' },
                  { id: 'job-card-complete', label: 'Job Card Completion', description: 'Notifications when job cards are completed' },
                ].map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between p-4 rounded-lg bg-dark-800/50 border border-primary-500/10">
                    <div>
                      <p className="text-white font-medium">{notification.label}</p>
                      <p className="text-sm text-dark-400">{notification.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Recipients</CardTitle>
                <CardDescription>Email addresses to receive system notifications</CardDescription>
              </CardHeader>
              <div className="space-y-3">
                <Input placeholder="Add email address" />
                <Button variant="secondary" size="sm">Add Recipient</Button>
              </div>
            </Card>
          </div>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="users">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage user accounts and access permissions</CardDescription>
                </div>
                <Button>
                  <User className="w-4 h-4" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <div className="py-12 text-center text-dark-400">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>User management interface will be displayed here</p>
              <p className="text-sm mt-2">Add, edit, and manage user roles and permissions</p>
            </div>
          </Card>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="database">
          <div className="space-y-6 max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Database Connection</CardTitle>
                <CardDescription>Supabase database configuration</CardDescription>
              </CardHeader>
              <div className="space-y-4">
                <Input label="Supabase URL" placeholder="https://your-project.supabase.co" disabled />
                <Input label="Anon Key" placeholder="eyJ..." type="password" disabled />
                <div className="flex items-center gap-2 text-sm text-success-500">
                  <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
                  Connected
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Backup and maintenance options</CardDescription>
              </CardHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-dark-800/50 border border-primary-500/10">
                  <div>
                    <p className="text-white font-medium">Export Data</p>
                    <p className="text-sm text-dark-400">Download all data as CSV or JSON</p>
                  </div>
                  <Button variant="secondary" size="sm">Export</Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-dark-800/50 border border-primary-500/10">
                  <div>
                    <p className="text-white font-medium">Sync Database</p>
                    <p className="text-sm text-dark-400">Force sync with Supabase</p>
                  </div>
                  <Button variant="secondary" size="sm">
                    <RefreshCw className="w-4 h-4" />
                    Sync
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="appearance">
          <div className="space-y-6 max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Theme Settings</CardTitle>
                <CardDescription>Customize the application appearance</CardDescription>
              </CardHeader>
              <div className="space-y-4">
                <Select
                  label="Theme"
                  options={[
                    { value: 'dark', label: 'Dark (Default)' },
                    { value: 'light', label: 'Light' },
                    { value: 'system', label: 'System' },
                  ]}
                />
                <Select
                  label="Accent Color"
                  options={[
                    { value: 'blue', label: 'Blue (Default)' },
                    { value: 'green', label: 'Green' },
                    { value: 'purple', label: 'Purple' },
                    { value: 'orange', label: 'Orange' },
                  ]}
                />
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Display Options</CardTitle>
                <CardDescription>Configure display preferences</CardDescription>
              </CardHeader>
              <div className="space-y-4">
                {[
                  { id: 'sidebar-collapsed', label: 'Start with Sidebar Collapsed', description: 'Sidebar will be collapsed by default' },
                  { id: 'animations', label: 'Enable Animations', description: 'Show animations and transitions' },
                  { id: 'compact-mode', label: 'Compact Mode', description: 'Use smaller spacing and fonts' },
                ].map((option) => (
                  <div key={option.id} className="flex items-center justify-between p-4 rounded-lg bg-dark-800/50 border border-primary-500/10">
                    <div>
                      <p className="text-white font-medium">{option.label}</p>
                      <p className="text-sm text-dark-400">{option.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabPanel>

        <TabPanel activeTab={activeTab} tabId="maintenance">
          <div className="space-y-6 max-w-2xl">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Schedules</CardTitle>
                <CardDescription>Default maintenance intervals for new vehicles</CardDescription>
              </CardHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Oil Change Interval (km)" type="number" defaultValue="15000" />
                  <Input label="Oil Change Interval (days)" type="number" defaultValue="30" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Full Service Interval (km)" type="number" defaultValue="50000" />
                  <Input label="Full Service Interval (days)" type="number" defaultValue="90" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Brake Inspection (km)" type="number" defaultValue="25000" />
                  <Input label="Brake Inspection (days)" type="number" defaultValue="60" />
                </div>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inspection Defaults</CardTitle>
                <CardDescription>Default inspection schedules and requirements</CardDescription>
              </CardHeader>
              <div className="space-y-4">
                <Select
                  label="Daily Inspection Required"
                  options={[
                    { value: 'all', label: 'All Vehicles' },
                    { value: 'horses', label: 'Horses Only' },
                    { value: 'none', label: 'None (Manual Scheduling)' },
                  ]}
                />
                <Select
                  label="Weekly Inspection Day"
                  options={[
                    { value: 'monday', label: 'Monday' },
                    { value: 'friday', label: 'Friday' },
                    { value: 'saturday', label: 'Saturday' },
                  ]}
                />
              </div>
            </Card>

            <div className="flex justify-end">
              <Button>
                <Save className="w-4 h-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </TabPanel>
      </div>
    </MainLayout>
  );
}
