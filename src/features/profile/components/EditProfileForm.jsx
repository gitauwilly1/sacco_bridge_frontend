import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { Camera, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { profileApi } from '../api/profileApi';
import { getInitials } from '../../../utils/format';

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string().optional().or(z.literal('')),
  preferred_language: z.enum(['en', 'sw']).optional(),
  occupation: z.string().optional().or(z.literal('')),
  employer: z.string().optional().or(z.literal('')),
  county: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  risk_tolerance: z.enum(['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE']).optional(),
  investment_experience: z.enum(['NONE', 'BEGINNER', 'INTERMEDIATE', 'EXPERT']).optional(),
});

export default function EditProfileForm({ profile }) {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      date_of_birth: profile?.date_of_birth || '',
      preferred_language: profile?.preferred_language || 'en',
      occupation: profile?.occupation || '',
      employer: profile?.employer || '',
      county: profile?.county || '',
      city: profile?.city || '',
      risk_tolerance: profile?.risk_tolerance || 'MODERATE',
      investment_experience: profile?.investment_experience || 'BEGINNER',
    },
  });

  const onSubmit = async (values) => {
    setIsSaving(true);
    try {
      await profileApi.updateProfile({
        first_name: values.first_name,
        last_name: values.last_name,
        date_of_birth: values.date_of_birth || null,
        preferred_language: values.preferred_language,
      });
      await profileApi.updateDetailedProfile({
        occupation: values.occupation || null,
        employer: values.employer || null,
        county: values.county || null,
        city: values.city || null,
        risk_tolerance: values.risk_tolerance,
        investment_experience: values.investment_experience,
      });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile updated');
    } catch (error) {
      const msg =
        error.response?.data?.error?.message || 'Failed to update profile';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('profile_picture', file);
      await profileApi.uploadProfilePicture(formData);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile picture updated');
    } catch (error) {
      toast.error('Failed to upload picture');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleRemovePicture = async () => {
    try {
      await profileApi.removeProfilePicture();
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Profile picture removed');
    } catch (error) {
      toast.error('Failed to remove picture');
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Picture */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile Picture</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <div className="relative">
            {profile?.profile_picture ? (
              <img
                src={profile.profile_picture}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-sand-light flex items-center justify-center">
                <span className="text-2xl font-bold text-terracotta">
                  {getInitials(profile?.first_name, profile?.last_name) || '?'}
                </span>
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-terracotta text-white p-1.5 rounded-full cursor-pointer">
              <Camera className="h-3.5 w-3.5" />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePictureUpload}
                disabled={isUploading}
              />
            </label>
          </div>
          <div className="text-xs text-gray-500">
            <p>JPG, PNG or WebP</p>
            <p>Max 5MB</p>
          </div>
          {profile?.profile_picture && (
            <Button variant="outline" size="sm" onClick={handleRemovePicture}>
              <Trash2 className="mr-1 h-4 w-4" /> Remove
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
          <CardDescription>Update your profile details</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="occupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Occupation</FormLabel>
                    <FormControl><Input placeholder="e.g., Teacher" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employer</FormLabel>
                    <FormControl><Input placeholder="e.g., TSC" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="county"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>County</FormLabel>
                      <FormControl><Input placeholder="e.g., Nairobi" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl><Input placeholder="e.g., Westlands" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="risk_tolerance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Risk Tolerance</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CONSERVATIVE">Conservative</SelectItem>
                          <SelectItem value="MODERATE">Moderate</SelectItem>
                          <SelectItem value="AGGRESSIVE">Aggressive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="investment_experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="NONE">None</SelectItem>
                          <SelectItem value="BEGINNER">Beginner</SelectItem>
                          <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                          <SelectItem value="EXPERT">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="preferred_language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Language</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="sw">Kiswahili</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}