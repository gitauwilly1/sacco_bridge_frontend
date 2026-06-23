import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Shield, CheckCircle2, XCircle, Ban,
  UserPlus, ShieldCheck, Mail, Phone, Calendar,
  MapPin, Briefcase,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageSpinner } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { toast } from 'sonner';
import { adminApi } from '../api/adminApi';
import { formatDate } from '../../../utils/format';

const roleColors = {
  PLATFORM_ADMIN: 'bg-danger/10 text-danger border-danger/20',
  SUPPORT_AGENT: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  MEMBER: 'bg-sand text-slate border-sand-dark/20',
};

export default function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    data: userData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-user', userId],
    queryFn: () =>
      adminApi
        .getUsers({ user_id: userId })
        .then((r) => r.data.results?.[0] || r.data.data || r.data),
    enabled: !!userId,
  });

  const manageMutation = useMutation({
    mutationFn: (data) => adminApi.manageUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-user', userId] });
      toast.success('User updated');
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error?.message || 'Action failed'
      );
    },
  });

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorState message="Failed to load user" onRetry={refetch} />;
  if (!userData) return <ErrorState message="User not found" />;

  const user = userData;
  const primaryRole = user.roles?.[0] || user.role;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate({ to: '/admin/users' })}
          className="h-9 w-9 flex items-center justify-center rounded-lg border border-sand bg-white/50 text-slate hover:bg-sand-light hover:text-terracotta transition-colors shadow-subtle"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate">
            {user.first_name} {user.last_name}
          </h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="glass-card border-sand bg-white/95 shadow-subtle rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-16 w-16 rounded-full bg-sand-light flex items-center justify-center border border-sand">
              <span className="text-2xl font-bold text-terracotta">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <Badge className={`${roleColors[primaryRole] || 'bg-sand text-slate border-sand-dark/20'} border`} variant="outline">
                  {primaryRole?.replace('_', ' ') || 'Member'}
                </Badge>
                <Badge
                  className={
                    user.status === 'active'
                      ? 'bg-success/10 text-success border-success/20 border'
                      : 'bg-danger/10 text-danger border-danger/20 border'
                  }
                  variant="outline"
                >
                  {user.status}
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-gray-400" /> {user.email}
                </span>
                {user.phone_number && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-gray-400" /> {user.phone_number}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm pt-4 border-t border-sand/30">
            <div>
              <p className="text-xs text-gray-400">Joined</p>
              <p className="font-semibold text-slate">{formatDate(user.created_at)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">KYC Status</p>
              <Badge
                className={
                  user.kyc_status === 'verified'
                    ? 'bg-success/10 text-success border-success/20 border'
                    : 'bg-alert/10 text-alert border-alert/20 border'
                }
                variant="outline"
              >
                {user.kyc_status || 'unverified'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card className="glass-card border-sand bg-white/95 shadow-subtle rounded-2xl overflow-hidden">
        <CardHeader className="border-b border-sand/30 bg-sand-light/10">
          <CardTitle className="text-base text-slate font-bold">Admin Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6">
          {/* KYC Verification */}
          {user.kyc_status === 'pending' && (
            <div className="flex gap-3">
              <Button
                size="sm"
                className="flex-1 bg-terracotta hover:bg-clay text-white shadow-subtle border-none"
                onClick={() =>
                  manageMutation.mutate({ action: 'verify_identity' })
                }
                disabled={manageMutation.isPending}
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Verify Identity
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-sand hover:bg-sand-light text-slate"
                onClick={() =>
                  manageMutation.mutate({ action: 'reject_identity' })
                }
                disabled={manageMutation.isPending}
              >
                <XCircle className="h-4 w-4 mr-1.5 text-danger" /> Reject
              </Button>
            </div>
          )}

          {/* Suspend/Activate */}
          {user.status === 'active' ? (
            <Button
              size="sm"
              variant="outline"
              className="w-full border-danger/30 hover:border-danger hover:bg-danger/5 text-danger font-medium transition-colors"
              onClick={() => {
                if (window.confirm(`Suspend ${user.first_name} ${user.last_name}?`)) {
                  manageMutation.mutate({ action: 'suspend' });
                }
              }}
              disabled={manageMutation.isPending}
            >
              <Ban className="h-4 w-4 mr-1.5" /> Suspend User
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="w-full border-success/30 hover:border-success hover:bg-success/5 text-success font-medium transition-colors"
              onClick={() => manageMutation.mutate({ action: 'activate' })}
              disabled={manageMutation.isPending}
            >
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Activate User
            </Button>
          )}

          {/* Role Management */}
          <div className="border-t border-sand/30 pt-4">
            <p className="text-xs font-semibold text-slate/70 mb-3">Change Role</p>
            <div className="flex gap-3">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-sand hover:bg-sand-light text-slate transition-colors"
                onClick={() =>
                  manageMutation.mutate({ action: 'add_role', role: 'SUPPORT_AGENT' })
                }
                disabled={manageMutation.isPending}
              >
                <UserPlus className="h-4 w-4 mr-1.5 text-terracotta" /> Make Support
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-sand hover:bg-sand-light text-slate transition-colors"
                onClick={() =>
                  manageMutation.mutate({ action: 'remove_role' })
                }
                disabled={manageMutation.isPending}
              >
                <Shield className="h-4 w-4 mr-1.5 text-slate/60" /> Remove Role
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}