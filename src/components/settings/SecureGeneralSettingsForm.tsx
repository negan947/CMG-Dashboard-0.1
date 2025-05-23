'use client';

import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';

interface SecureGeneralSettingsFormProps {
  initialData: any;
  onSubmit: (formData: FormData) => Promise<void>;
  isSubmitting: boolean;
}

export function SecureGeneralSettingsForm({ 
  initialData, 
  onSubmit, 
  isSubmitting 
}: SecureGeneralSettingsFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    await onSubmit(formData);
    // Form will be revalidated by server action, no need to manually reset
  };

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Agency Name */}
        <div className="space-y-2">
          <Label htmlFor="agency_name">
            Agency Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="agency_name"
            name="agency_name"
            type="text"
            required
            defaultValue={initialData?.agency_name || ''}
            placeholder="Enter your agency name"
            disabled={isSubmitting}
          />
        </div>

        {/* Agency Email */}
        <div className="space-y-2">
          <Label htmlFor="agency_email">
            Agency Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="agency_email"
            name="agency_email"
            type="email"
            required
            defaultValue={initialData?.agency_email || ''}
            placeholder="contact@youragency.com"
            disabled={isSubmitting}
          />
        </div>

        {/* Agency Phone */}
        <div className="space-y-2">
          <Label htmlFor="agency_phone">Agency Phone</Label>
          <Input
            id="agency_phone"
            name="agency_phone"
            type="tel"
            defaultValue={initialData?.agency_phone || ''}
            placeholder="+1 (555) 123-4567"
            disabled={isSubmitting}
          />
        </div>

        {/* Agency Website */}
        <div className="space-y-2">
          <Label htmlFor="agency_website">Agency Website</Label>
          <Input
            id="agency_website"
            name="agency_website"
            type="url"
            defaultValue={initialData?.agency_website || ''}
            placeholder="https://yourwebsite.com"
            disabled={isSubmitting}
          />
        </div>

        {/* Agency Logo URL */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="agency_logo_url">Agency Logo URL</Label>
          <Input
            id="agency_logo_url"
            name="agency_logo_url"
            type="url"
            defaultValue={initialData?.agency_logo_url || ''}
            placeholder="https://yourwebsite.com/logo.png"
            disabled={isSubmitting}
          />
        </div>

        {/* Default Currency */}
        <div className="space-y-2">
          <Label htmlFor="default_currency">
            Default Currency <span className="text-red-500">*</span>
          </Label>
          <Select 
            name="default_currency" 
            defaultValue={initialData?.default_currency || 'USD'}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD - US Dollar</SelectItem>
              <SelectItem value="EUR">EUR - Euro</SelectItem>
              <SelectItem value="GBP">GBP - British Pound</SelectItem>
              <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
              <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Timezone */}
        <div className="space-y-2">
          <Label htmlFor="timezone">
            Timezone <span className="text-red-500">*</span>
          </Label>
          <Select 
            name="timezone" 
            defaultValue={initialData?.timezone || 'UTC'}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UTC">UTC</SelectItem>
              <SelectItem value="America/New_York">Eastern Time</SelectItem>
              <SelectItem value="America/Chicago">Central Time</SelectItem>
              <SelectItem value="America/Denver">Mountain Time</SelectItem>
              <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
              <SelectItem value="Europe/London">London</SelectItem>
              <SelectItem value="Europe/Paris">Paris</SelectItem>
              <SelectItem value="Europe/Berlin">Berlin</SelectItem>
              <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
              <SelectItem value="Asia/Shanghai">Shanghai</SelectItem>
              <SelectItem value="Australia/Sydney">Sydney</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Format */}
        <div className="space-y-2">
          <Label htmlFor="date_format">
            Date Format <span className="text-red-500">*</span>
          </Label>
          <Select 
            name="date_format" 
            defaultValue={initialData?.date_format || 'MM/DD/YYYY'}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select date format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (US)</SelectItem>
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (European)</SelectItem>
              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Time Format */}
        <div className="space-y-2">
          <Label htmlFor="time_format">
            Time Format <span className="text-red-500">*</span>
          </Label>
          <Select 
            name="time_format" 
            defaultValue={initialData?.time_format || '12h'}
            disabled={isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select time format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
              <SelectItem value="24h">24-hour</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving Changes...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
} 