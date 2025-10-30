"use client"

import { useState } from "react"
import { Settings, Save, CreditCard } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [paymentEnabled, setPaymentEnabled] = useState(true)

  const handleSave = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsLoading(false)
    toast({
      title: "Settings Saved",
      description: "Your settings have been updated successfully.",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage platform settings and configurations</p>
        </div>
        <Button onClick={handleSave} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

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
            <Label htmlFor="site-name">Site Name</Label>
            <Input id="site-name" defaultValue="KUCCPS Course Checker" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="site-description">Site Description</Label>
            <Textarea id="site-description" defaultValue="Find the perfect courses based on your KCSE results" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-email">Contact Email</Label>
            <Input id="contact-email" type="email" defaultValue="info@kuccpschecker.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-phone">Contact Phone</Label>
            <Input id="contact-phone" defaultValue="+254 700 000 000" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">Put the site in maintenance mode</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment System
              </Label>
              <p className="text-sm text-muted-foreground">Enable or disable payment functionality</p>
            </div>
            <Switch checked={paymentEnabled} onCheckedChange={setPaymentEnabled} />
          </div>

          {paymentEnabled && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <h4 className="font-medium">Payment Configuration</h4>
              <div className="space-y-2">
                <Label htmlFor="payment-amount">Payment Amount (KES)</Label>
                <Input id="payment-amount" type="number" defaultValue="200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mpesa-shortcode">M-Pesa Shortcode</Label>
                <Input id="mpesa-shortcode" defaultValue="123456" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
