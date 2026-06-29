import { useEffect, useState } from 'react';
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

  const defaultValues = {
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
  };

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues,
  });

  useEffect(() => {
    const handleReset = () => {
      form.reset({
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
      });
      toast.message('Form reset to last saved values');
    };
    window.addEventListener('profile-form-reset', handleReset);
    return () => window.removeEventListener('profile-form-reset', handleReset);
  }, [form, profile]);

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
      <Card className="border-sand bg-white shadow-subtle">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-slate">Profile Picture</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <div className="relative">
            {profile?.profile_picture ? (
              <img
                src={profile.profile_picture}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover ring-4 ring-sand/30 shadow-subtle"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-sand-light flex items-center justify-center ring-4 ring-sand/30 shadow-subtle">
                <span className="text-2xl font-extrabold text-terracotta font-heading">
                  {getInitials(profile?.first_name, profile?.last_name) || '?'}
                </span>
              </div>
            )}
            <label className="absolute bottom-0 right-0 bg-terracotta text-white p-2 rounded-full cursor-pointer hover:bg-terracotta-dark shadow-subtle transition-colors">
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
          <div className="text-xs text-gray-400 font-medium space-y-0.5">
            <p>JPG, PNG or WebP</p>
            <p>Max 5MB</p>
          </div>
          {profile?.profile_picture && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemovePicture}
              className="border-sand hover:bg-danger/5 hover:text-danger hover:border-danger/20 text-slate cursor-pointer h-8 rounded-lg text-xs font-semibold ml-auto"
            >
              <Trash2 className="mr-1 h-3.5 w-3.5" /> Remove
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card className="border-sand bg-white shadow-subtle">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-slate">Personal Information</CardTitle>
          <CardDescription className="text-xs text-gray-400 font-medium">Update your profile details</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form id="profile-edit-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate">First Name</FormLabel>
                      <FormControl>
                        <Input
                          className="border-input rounded-xl bg-white text-sm focus:border-terracotta focus:ring-1 focus:ring-terracotta"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-danger font-semibold" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate">Last Name</FormLabel>
                      <FormControl>
                        <Input
                          className="border-input rounded-xl bg-white text-sm focus:border-terracotta focus:ring-1 focus:ring-terracotta"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-danger font-semibold" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="date_of_birth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate">Date of Birth</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="border-input rounded-xl bg-white text-sm focus:border-terracotta focus:ring-1 focus:ring-terracotta"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-danger font-semibold" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="occupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate">Occupation</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Teacher"
                        className="border-input rounded-xl bg-white text-sm focus:border-terracotta focus:ring-1 focus:ring-terracotta"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-danger font-semibold" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate">Employer</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., TSC"
                        className="border-input rounded-xl bg-white text-sm focus:border-terracotta focus:ring-1 focus:ring-terracotta"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-danger font-semibold" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="county"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate">County</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Nairobi"
                          className="border-input rounded-xl bg-white text-sm focus:border-terracotta focus:ring-1 focus:ring-terracotta"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-danger font-semibold" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate">City</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Westlands"
                          className="border-input rounded-xl bg-white text-sm focus:border-terracotta focus:ring-1 focus:ring-terracotta"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-danger font-semibold" />
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
                      <FormLabel className="text-xs font-bold text-slate">Risk Tolerance</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="border-input rounded-xl bg-white text-sm focus:border-terracotta focus:ring-1 focus:ring-terracotta h-10 cursor-pointer">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border-sand shadow-subtle rounded-xl">
                          <SelectItem value="CONSERVATIVE" className="cursor-pointer text-sm font-medium hover:bg-sand-light text-slate focus:bg-sand-light focus:text-terracotta">Conservative</SelectItem>
                          <SelectItem value="MODERATE" className="cursor-pointer text-sm font-medium hover:bg-sand-light text-slate focus:bg-sand-light focus:text-terracotta">Moderate</SelectItem>
                          <SelectItem value="AGGRESSIVE" className="cursor-pointer text-sm font-medium hover:bg-sand-light text-slate focus:bg-sand-light focus:text-terracotta">Aggressive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs text-danger font-semibold" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="investment_experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate">Experience</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="border-input rounded-xl bg-white text-sm focus:border-terracotta focus:ring-1 focus:ring-terracotta h-10 cursor-pointer">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border-sand shadow-subtle rounded-xl">
                          <SelectItem value="NONE" className="cursor-pointer text-sm font-medium hover:bg-sand-light text-slate focus:bg-sand-light focus:text-terracotta">None</SelectItem>
                          <SelectItem value="BEGINNER" className="cursor-pointer text-sm font-medium hover:bg-sand-light text-slate focus:bg-sand-light focus:text-terracotta">Beginner</SelectItem>
                          <SelectItem value="INTERMEDIATE" className="cursor-pointer text-sm font-medium hover:bg-sand-light text-slate focus:bg-sand-light focus:text-terracotta">Intermediate</SelectItem>
                          <SelectItem value="EXPERT" className="cursor-pointer text-sm font-medium hover:bg-sand-light text-slate focus:bg-sand-light focus:text-terracotta">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-xs text-danger font-semibold" />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="preferred_language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-slate">Language</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="border-input rounded-xl bg-white text-sm focus:border-terracotta focus:ring-1 focus:ring-terracotta h-10 cursor-pointer">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border-sand shadow-subtle rounded-xl">
                        <SelectItem value="en" className="cursor-pointer text-sm font-medium hover:bg-sand-light text-slate focus:bg-sand-light focus:text-terracotta">English</SelectItem>
                        <SelectItem value="sw" className="cursor-pointer text-sm font-medium hover:bg-sand-light text-slate focus:bg-sand-light focus:text-terracotta">Kiswahili</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs text-danger font-semibold" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-terracotta hover:bg-terracotta-dark text-white border-0 shadow-subtle cursor-pointer h-10 rounded-xl text-xs font-semibold mt-2"
                disabled={isSaving}
              >
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