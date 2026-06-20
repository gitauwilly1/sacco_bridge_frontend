import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Key, Shield, Smartphone } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { profileApi } from '../api/profileApi';

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z.string().min(12, 'Password must be at least 12 characters'),
    new_password_confirm: z.string(),
  })
  .refine((data) => data.new_password === data.new_password_confirm, {
    message: 'Passwords do not match',
    path: ['new_password_confirm'],
  });

export default function SecuritySettings({ profile }) {
  const [changingPassword, setChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [settingUp2FA, setSettingUp2FA] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [totpSecret, setTotpSecret] = useState('');
  const [totpCode, setTotpCode] = useState('');

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      new_password_confirm: '',
    },
  });

  const onChangePassword = async (values) => {
    setChangingPassword(true);
    try {
      await profileApi.changePassword(values);
      toast.success('Password changed successfully');
      passwordForm.reset();
      setShowPasswordForm(false);
    } catch (error) {
      const msg =
        error.response?.data?.error?.message ||
        'Failed to change password. Check your current password.';
      toast.error(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  const onSetup2FA = async () => {
    setSettingUp2FA(true);
    try {
      const { data } = await profileApi.setup2FA();
      setQrCode(data.data?.qr_code_svg || data.qr_code_svg);
      setTotpSecret(data.data?.secret || data.secret);
    } catch (error) {
      toast.error('Failed to setup 2FA');
    } finally {
      setSettingUp2FA(false);
    }
  };

  const onEnable2FA = async () => {
    if (!totpCode) {
      toast.error('Enter the authenticator code');
      return;
    }
    try {
      await profileApi.enable2FA({ totp_code: totpCode });
      toast.success('2FA enabled');
      setQrCode(null);
      setTotpSecret('');
      setTotpCode('');
    } catch (error) {
      toast.error('Invalid code. Please try again.');
    }
  };

  const onDisable2FA = async () => {
    if (!totpCode) {
      toast.error('Enter your authenticator code to disable 2FA');
      return;
    }
    try {
      await profileApi.disable2FA({ totp_code: totpCode });
      toast.success('2FA disabled');
      setTotpCode('');
    } catch (error) {
      toast.error('Invalid code');
    }
  };

  return (
    <div className="space-y-6">
      {/* Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Key className="h-5 w-5 text-terracotta" /> Password
          </CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          {!showPasswordForm ? (
            <Button variant="outline" onClick={() => setShowPasswordForm(true)}>
              Change Password
            </Button>
          ) : (
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(onChangePassword)}
                className="space-y-4"
              >
                <FormField
                  control={passwordForm.control}
                  name="current_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="new_password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="new_password_confirm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button type="submit" disabled={changingPassword}>
                    {changingPassword ? 'Changing...' : 'Update Password'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowPasswordForm(false);
                      passwordForm.reset();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>

      {/* 2FA */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-5 w-5 text-terracotta" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>Add extra security to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium">Authenticator App</p>
              <p className="text-xs text-gray-500">
                {profile?.two_factor_enabled
                  ? '2FA is enabled'
                  : 'Protect your account with 2FA'}
              </p>
            </div>
            <Badge
              className={
                profile?.two_factor_enabled
                  ? 'bg-success/10 text-success'
                  : 'bg-gray-200 text-gray-600'
              }
              variant="outline"
            >
              {profile?.two_factor_enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>

          {/* QR Setup */}
          {qrCode && (
            <div className="mb-4 p-4 bg-white rounded-lg border text-center">
              <div
                dangerouslySetInnerHTML={{ __html: qrCode }}
                className="mb-3 flex justify-center"
              />
              <p className="text-xs text-gray-500 mb-2">
                Scan with Google Authenticator or Authy
              </p>
              <p className="text-xs font-mono bg-gray-100 p-2 rounded mb-3 break-all">
                {totpSecret}
              </p>
              <Input
                placeholder="Enter 6-digit code"
                className="text-center"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
              />
              <Button
                onClick={onEnable2FA}
                className="mt-3 w-full"
                disabled={!totpCode || totpCode.length < 6}
              >
                Verify & Enable 2FA
              </Button>
            </div>
          )}

          {/* Enable/Disable */}
          {profile?.two_factor_enabled ? (
            <div className="space-y-3">
              <Input
                placeholder="Enter code to disable 2FA"
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
              />
              <Button
                variant="outline"
                className="w-full text-danger"
                onClick={onDisable2FA}
              >
                Disable 2FA
              </Button>
            </div>
          ) : (
            !qrCode && (
              <Button
                variant="outline"
                onClick={onSetup2FA}
                disabled={settingUp2FA}
              >
                {settingUp2FA ? 'Loading...' : 'Setup 2FA'}
              </Button>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
}