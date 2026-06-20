import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { profileApi } from '../api/profileApi';
import useAuthStore from '../../../stores/authStore';

const deleteSchema = z.object({
  password: z.string().min(1, 'Password is required'),
  confirmation: z.literal('DELETE', {
    errorMap: () => ({ message: 'Type DELETE to confirm' }),
  }),
});

export default function AccountDeactivation() {
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { logout } = useAuthStore();

  const deleteForm = useForm({
    resolver: zodResolver(deleteSchema),
    defaultValues: { password: '', confirmation: '' },
  });

  const handleDeactivate = async () => {
    setIsDeactivating(true);
    try {
      await profileApi.deactivateAccount({});
      toast.success('Account deactivated. You can reactivate by logging in again.');
      await logout();
    } catch (error) {
      toast.error('Failed to deactivate account');
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleDelete = async (values) => {
    setIsDeleting(true);
    try {
      await profileApi.requestAccountDeletion(values);
      toast.success(
        'Account deletion requested. You have 30 days to cancel by logging in.'
      );
      await logout();
    } catch (error) {
      const msg =
        error.response?.data?.error?.message ||
        'Failed to request deletion. Check your password.';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="border-danger/20">
      <CardHeader>
        <CardTitle className="text-base text-danger flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Danger Zone
        </CardTitle>
        <CardDescription>
          Irreversible actions for your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Deactivate */}
        {!showDeactivate ? (
          <Button
            variant="outline"
            className="w-full border-danger/30 text-danger hover:bg-danger/5"
            onClick={() => setShowDeactivate(true)}
          >
            Deactivate Account
          </Button>
        ) : (
          <div className="p-3 bg-gray-50 rounded-lg space-y-3">
            <p className="text-sm text-gray-600">
              Your account will be disabled. You can reactivate at any time by
              logging in.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="text-danger"
                onClick={handleDeactivate}
                disabled={isDeactivating}
              >
                {isDeactivating ? 'Deactivating...' : 'Confirm Deactivate'}
              </Button>
              <Button variant="ghost" onClick={() => setShowDeactivate(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Delete */}
        {!showDelete ? (
          <Button
            variant="outline"
            className="w-full border-danger/30 text-danger hover:bg-danger/5"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Request Account Deletion
          </Button>
        ) : (
          <div className="p-3 bg-danger/5 rounded-lg space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
              <p className="text-sm text-danger font-medium">
                This will permanently delete your account and all data after a
                30-day grace period. This action cannot be undone.
              </p>
            </div>
            <Form {...deleteForm}>
              <form
                onSubmit={deleteForm.handleSubmit(handleDelete)}
                className="space-y-3"
              >
                <FormField
                  control={deleteForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Enter your password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={deleteForm.control}
                  name="confirmation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type DELETE to confirm</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    variant="outline"
                    className="text-danger border-danger/30"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Requesting...' : 'Permanently Delete'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowDelete(false);
                      deleteForm.reset();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}