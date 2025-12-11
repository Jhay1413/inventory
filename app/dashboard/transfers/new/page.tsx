"use client"

import * as React from "react"
import { IconDeviceMobile } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function NewTransferPage() {
  return (
    <div className="flex flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Transfer Request</h1>
        <p className="text-muted-foreground">
          Create a new transfer request between branches
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transfer Details</CardTitle>
            <CardDescription>Enter the transfer information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product">Product/Gadget</Label>
              <Select>
                <SelectTrigger id="product">
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="iphone15">iPhone 15 Pro Max</SelectItem>
                  <SelectItem value="s24">Samsung Galaxy S24 Ultra</SelectItem>
                  <SelectItem value="pixel8">Google Pixel 8 Pro</SelectItem>
                  <SelectItem value="iphone14">iPhone 14 Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imei">IMEI Number</Label>
              <Input id="imei" placeholder="Enter IMEI number" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input id="quantity" type="number" placeholder="0" min="1" defaultValue="1" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="from">From Branch</Label>
              <Select>
                <SelectTrigger id="from">
                  <SelectValue placeholder="Select source branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tacloban">Tacloban</SelectItem>
                  <SelectItem value="catbalogan">Catbalogan</SelectItem>
                  <SelectItem value="guiuan">Guiuan E.Samar</SelectItem>
                  <SelectItem value="borongan">Borongan E.Samar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="to">To Branch</Label>
              <Select>
                <SelectTrigger id="to">
                  <SelectValue placeholder="Select destination branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tacloban">Tacloban</SelectItem>
                  <SelectItem value="catbalogan">Catbalogan</SelectItem>
                  <SelectItem value="guiuan">Guiuan E.Samar</SelectItem>
                  <SelectItem value="borongan">Borongan E.Samar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Transfer Reason</Label>
              <Input id="reason" placeholder="Why is this transfer needed?" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Optional)</Label>
              <Input id="notes" placeholder="Any additional information" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transfer Summary</CardTitle>
            <CardDescription>Review before submitting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <IconDeviceMobile className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">Product:</span>
                <span className="text-muted-foreground">Not selected</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Quantity:</span>
                <span className="text-muted-foreground">0</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">From:</span>
                <span className="text-muted-foreground">Not selected</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">To:</span>
                <span className="text-muted-foreground">Not selected</span>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4 space-y-2">
              <h4 className="font-semibold">Important Notes:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Transfer requests require manager approval</li>
                <li>Estimated delivery time: 1-2 business days</li>
                <li>Ensure product availability at source branch</li>
                <li>Destination branch will be notified upon approval</li>
              </ul>
            </div>

            <div className="space-y-2 pt-4">
              <Button className="w-full" size="lg">
                Submit Transfer Request
              </Button>
              <Button variant="outline" className="w-full">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
