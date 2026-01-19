"use client"

import { useState, useEffect } from "react"
import { Settings, Save, CreditCard, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface ApplicationStatus {
  id: string
  application_type: string
  is_open: boolean
  status_message: string | null
  start_date: string | null
  end_date: string | null
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [applicationStatuses, setApplicationStatuses] = useState<ApplicationStatus[]>([])
  const [formData, setFormData] = useState({
    contact_email: "",
    contact_phone: "",
    whatsapp_number: "",
    payment_amount: 200,
    maintenance_mode: false,
    payment_status: true,
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings")
        if (res.ok) {
          const { settings } = await res.json()
          setFormData(settings)
        }
      } catch (error) {
        console.error("Failed to load settings:", error)
      }
    }

    const fetchApplicationStatuses = async () => {
      try {
        const res = await fetch("/api/application-status")
        if (res.ok) {
          const { statuses } = await res.json()
          setApplicationStatuses(statuses || [])
        }
      } catch (error) {
        console.error("Failed to load application statuses:", error)
      }
    }

    fetchSettings()
    fetchApplicationStatuses()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id.replace("-", "_")]: value }))
  }

  const handleSwitchChange = (key: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [key]: checked }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        toast({
          title: "Settings Saved",
          description: "Your settings have been updated successfully.",
        })
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplicationStatusChange = (
    application_type: string,
    field: "is_open" | "status_message",
    value: boolean | string
  ) => {
    // Update local state only
    setApplicationStatuses(prev =>
      prev.map(status =>
        status.application_type === application_type
          ? { ...status, [field]: value }
          : status
      )
    )
  }

  const handleSaveApplicationStatus = async (application_type: string) => {
    const status = applicationStatuses.find(s => s.application_type === application_type)
    if (!status) return

    try {
      const res = await fetch("/api/application-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          application_type,
          is_open: status.is_open,
          status_message: status.status_message
        }),
      })

      if (res.ok) {
        toast({
          title: "Status Saved",
          description: `${application_type.charAt(0).toUpperCase() + application_type.slice(1)} application status updated successfully.`,
        })
      } else {
        throw new Error("Failed to update status")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save application status. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-white">Manage platform settings and configurations</p>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Saving..." : "Save General Settings"}
        </Button>
      </div>

      {/* Application Status Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Application Status Management
          </CardTitle>
          <CardDescription>Control which KUCCPS applications are currently open</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {applicationStatuses.map((status) => (
            <div key={status.id} className="p-4 border rounded-lg space-y-3 bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg capitalize">{status.application_type} Applications</h3>
                  <p className="text-sm text-dim">
                    {status.is_open ? "Currently Open" : "Currently Closed"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={status.is_open}
                    onCheckedChange={(checked) =>
                      handleApplicationStatusChange(status.application_type, "is_open", checked)
                    }
                  />
                  <Button
                    size="sm"
                    onClick={() => handleSaveApplicationStatus(status.application_type)}
                    className="bg-accent hover:bg-accent/90 text-dark"
                  >
                    <Save className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                </div>
              </div>

              {status.is_open && (
                <div className="space-y-2 pt-2 border-t">
                  <Label htmlFor={`message-${status.application_type}`}>Status Message (optional)</Label>
                  <Input
                    id={`message-${status.application_type}`}
                    placeholder="e.g., Apply before March 15th"
                    value={status.status_message || ""}
                    onChange={(e) =>
                      handleApplicationStatusChange(status.application_type, "status_message", e.target.value)
                    }
                    className="w-full"
                  />
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>Configure basic platform settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input id="contact_email" type="email" value={formData.contact_email} onChange={handleChange} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input id="contact_phone" value={formData.contact_phone || ""} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
              <Input id="whatsapp_number" value={formData.whatsapp_number || ""} onChange={handleChange} />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-white/70 italic">Put the site in maintenance mode (Active in Production only)</p>
            </div>
            <Switch
              checked={formData.maintenance_mode}
              onCheckedChange={(checked) => handleSwitchChange("maintenance_mode", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment System
              </Label>
              <p className="text-sm text-white">Enable or disable payment functionality</p>
            </div>
            <Switch
              checked={formData.payment_status}
              onCheckedChange={(checked) => handleSwitchChange("payment_status", checked)}
            />
          </div>

          {formData.payment_status && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium">Payment Configuration</h4>
              <div className="space-y-2">
                <Label htmlFor="payment_amount">Payment Amount (KES)</Label>
                <Input
                  id="payment_amount"
                  type="number"
                  value={formData.payment_amount}
                  onChange={handleChange}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
