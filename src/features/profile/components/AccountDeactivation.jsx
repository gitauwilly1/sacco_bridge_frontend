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
  const [deactivatePassword, setDeactivatePassword] = useState('');
  const { logout } = useAuthStore();

  const deleteForm = useForm({
    resolver: zodResolver(deleteSchema),
    defaultValues: { password: '', confirmation: '' },
  });

  const handleDeactivate = async () => {
    if (!deactivatePassword) { toast.error('Enter your password to deactivate.'); return; }
    setIsDeactivating(true);
    try {
      await profileApi.deactivateAccount({ password: deactivatePassword });
      toast.success('Account deactivated. You can reactivate by logging in again.');
      await logout();
    } catch (error) {
      const msg = error.response?.data?.error?.message || 'Failed to deactivate account';
      toast.error(msg);
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
    <Card className="border-danger/30 bg-white shadow-subtle">
      <CardHeader className="pb-3 bg-danger/5 rounded-t-2xl border-b border-danger/15">
        <CardTitle className="text-sm font-bold text-danger flex items-center gap-2">
          <AlertTriangle className="h-4.5 w-4.5" />
          Danger Zone
        </CardTitle>
        <CardDescription className="text-xs text-danger/80 font-medium">
          Irreversible actions for your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {/* Deactivate */}
        {!showDeactivate ? (
          <Button
            variant="outline"
            className="w-full border border-danger/30 text-danger hover:bg-danger/10 hover:border-danger/45 bg-white cursor-pointer h-10 rounded-xl text-xs font-semibold transition-all"
            onClick={() => setShowDeactivate(true)}
          >
            Deactivate Account
          </Button>
        ) : (
          <div className="p-3.5 bg-sand-light/30 border border-sand/40 rounded-xl space-y-3.5">
            <p className="text-xs text-slate font-medium leading-relaxed">
              Your account will be temporarily disabled. You can reactivate at any time by simply
              logging back in.
            </p>
            <Input
              type="password"
              placeholder="Enter your password to confirm"
              value={deactivatePassword}
              onChange={(e) => setDeactivatePassword(e.target.value)}
              className="border-input rounded-xl bg-white text-sm h-10"
            />
            <div className="flex gap-2">
              <Button
                className="bg-danger hover:bg-danger/90 text-white shadow-subtle cursor-pointer h-9 rounded-lg text-xs font-semibold px-4 transition-all"
                onClick={handleDeactivate}
                disabled={isDeactivating}
              >
                {isDeactivating ? 'Deactivating...' : 'Confirm Deactivate'}
              </Button>
              <Button
                variant="outline"
                className="border-sand hover:bg-sand-light text-slate cursor-pointer h-9 rounded-lg text-xs font-semibold px-4 transition-all"
                onClick={() => { setShowDeactivate(false); setDeactivatePassword(''); }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Delete */}
        {!showDelete ? (
          <Button
            variant="outline"
            className="w-full border border-danger/30 text-danger hover:bg-danger/10 hover:border-danger/45 bg-white cursor-pointer h-10 rounded-xl text-xs font-semibold transition-all"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Request Account Deletion
          </Button>
        ) : (
          <div className="p-3.5 bg-danger/5 border border-danger/20 rounded-xl space-y-3.5">
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-danger/10 border border-danger/25">
              <AlertTriangle className="h-4.5 w-4.5 text-danger flex-shrink-0 mt-0.5" />
              <p className="text-xs text-danger font-bold leading-relaxed">
                This will permanently delete your account and all associated data after a
                30-day grace period. This action cannot be undone.
              </p>
            </div>
            <Form {...deleteForm}>
              <form
                onSubmit={deleteForm.handleSubmit(handleDelete)}
                className="space-y-4"
              >
                <FormField
                  control={deleteForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate">Enter your password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          className="border-input rounded-xl bg-white text-sm focus:border-danger focus:ring-1 focus:ring-danger h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-danger font-semibold" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={deleteForm.control}
                  name="confirmation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold text-slate">Type DELETE to confirm</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="DELETE"
                          className="border-input rounded-xl bg-white text-sm focus:border-danger focus:ring-1 focus:ring-danger h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs text-danger font-semibold" />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2 pt-1">
                  <Button
                    type="submit"
                    className="bg-danger hover:bg-danger/90 text-white shadow-subtle cursor-pointer h-9 rounded-lg text-xs font-semibold px-4 transition-all"
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Requesting...' : 'Permanently Delete'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-sand hover:bg-sand-light text-slate cursor-pointer h-9 rounded-lg text-xs font-semibold px-4 transition-all"
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