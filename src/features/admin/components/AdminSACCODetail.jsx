import { useState, useRef } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Building2, CheckCircle2, Upload,
  Users, TrendingUp, Calendar, RefreshCw,
  ShieldCheck, ShieldOff, Layers,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { adminApi } from '../api/adminApi';
import { investmentsApi } from '../../investments/api/investmentsApi';
import { formatKES, formatDate } from '../../../utils/format';

const tierColors = {
  1: 'bg-success/10 text-success border border-success/20',
  2: 'bg-blue-500/10 text-blue-500 border border-blue-500/20',
  3: 'bg-alert/10 text-alert border border-alert/20',
};

function SACCODetailSkeleton() {
  return (
    <div className="space-y-4">
      <div className="skeleton-shimmer h-10 w-48 rounded-xl" />
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-sand">
            <CardContent className="p-4 space-y-2">
              <div className="skeleton-shimmer h-3 w-16 rounded" />
              <div className="skeleton-shimmer h-6 w-24 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function AdminSACCODetail() {
  const { saccoId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [showSuspendForm, setShowSuspendForm] = useState(false);

  const {
    data: sacco,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['admin-sacco-detail', saccoId],
    queryFn: () =>
      investmentsApi.getSACCODetail(saccoId).then((r) => r.data.data || r.data),
    enabled: !!saccoId,
  });

  const { data: shareClasses, error: shareClassesError } = useQuery({
    queryKey: ['admin-sacco-share-classes', saccoId],
    queryFn: () =>
      investmentsApi.getShareClasses(saccoId).then((r) => r.data.results || r.data.data || []),
    enabled: !!saccoId,
  });

  const verifyMutation = useMutation({
    mutationFn: () => adminApi.verifySACCO(saccoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sacco-detail', saccoId] });
      queryClient.invalidateQueries({ queryKey: ['admin-saccos'] });
      toast.success('SACCO verified successfully');
    },
    onError: (err) => toast.error(err.response?.data?.error?.message || 'Verification failed'),
  });

  const suspendMutation = useMutation({
    mutationFn: (data) => adminApi.suspendSACCO(saccoId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sacco-detail', saccoId] });
      queryClient.invalidateQueries({ queryKey: ['admin-saccos'] });
      setShowSuspendForm(false);
      setSuspendReason('');
      toast.success('SACCO status updated');
    },
    onError: (err) => toast.error(err.response?.data?.error?.message || 'Action failed'),
  });

  const uploadLogoMutation = useMutation({
    mutationFn: (formData) => adminApi.uploadSACCOLogo(saccoId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-sacco-detail', saccoId] });
      toast.success('Logo uploaded');
    },
    onError: (err) => toast.error(err.response?.data?.error?.message || 'Upload failed'),
  });

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be under 2MB');
      return;
    }
    const formData = new FormData();
    formData.append('logo', file);
    uploadLogoMutation.mutate(formData);
  };

  if (isLoading) return <SACCODetailSkeleton />;
  if (error || !sacco) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Building2 className="h-12 w-12 text-gray-300" />
        <p className="text-slate font-semibold">{error ? 'Failed to load SACCO' : 'SACCO not found'}</p>
        <div className="flex gap-2">
          {error && (
            <Button variant="outline" onClick={() => refetch()} className="border-sand">
              <RefreshCw className="h-4 w-4 mr-2" /> Retry
            </Button>
          )}
          <Button variant="outline" onClick={() => navigate({ to: '/admin/saccos' })} className="border-sand">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to SACCOs
          </Button>
        </div>
      </div>
    );
  }

  const tier = tierColors[sacco.sasra_tier];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate({ to: '/admin/saccos' })}
          className="p-1.5 rounded-lg text-slate hover:bg-sand-light transition-colors"
          aria-label="Back to SACCO list"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate">{sacco.name}</h1>
          <p className="text-xs text-gray-400 mt-0.5">{sacco.registration_number}</p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => refetch()}
          className="border-sand hover:bg-sand-light text-slate"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Status Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge
          className={`${tier || 'bg-sand text-slate border-sand-dark/20'} border text-xs font-bold px-3 py-1`}
          variant="outline"
        >
          Tier {sacco.sasra_tier || '—'}
        </Badge>
        <Badge
          className={`${sacco.verified ? 'bg-success/10 text-success border-success/20' : 'bg-alert/10 text-alert border-alert/20'} border text-xs font-bold px-3 py-1`}
          variant="outline"
        >
          {sacco.verified ? 'Verified' : 'Pending Verification'}
        </Badge>
        {sacco.is_suspended && (
          <Badge className="bg-danger/10 text-danger border border-danger/20 text-xs font-bold px-3 py-1" variant="outline">
            Suspended
          </Badge>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total Members', value: sacco.total_members?.toLocaleString() || '—', icon: Users, color: 'text-terracotta', bg: 'bg-terracotta/10' },
          { label: 'Dividend Rate', value: sacco.dividend_rate != null ? `${sacco.dividend_rate}%` : '—', icon: TrendingUp, color: 'text-success', bg: 'bg-success/10' },
          { label: 'Total Assets', value: sacco.total_assets ? formatKES(sacco.total_assets) : '—', icon: Layers, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Established', value: sacco.established_year || '—', icon: Calendar, color: 'text-alert', bg: 'bg-alert/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-sand bg-white shadow-subtle">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={`h-7 w-7 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                </div>
                <p className="text-xs text-gray-400 font-medium">{label}</p>
              </div>
              <p className="text-base font-bold text-slate truncate" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin Actions */}
      <Card className="border-sand bg-white shadow-subtle">
        <CardHeader className="pb-3 border-b border-sand/40">
          <CardTitle className="text-sm font-bold text-slate uppercase tracking-wider">Admin Actions</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap gap-3">
            {/* Verify */}
            {!sacco.verified && (
              <Button
                size="sm"
                className="bg-success hover:bg-success/90 text-white shadow-sm"
                onClick={() => {
                  if (window.confirm(`Verify ${sacco.name}?`)) {
                    verifyMutation.mutate();
                  }
                }}
                disabled={verifyMutation.isPending}
              >
                <ShieldCheck className="h-4 w-4 mr-1.5" />
                {verifyMutation.isPending ? 'Verifying...' : 'Verify SACCO'}
              </Button>
            )}

            {/* Suspend / Unsuspend */}
            {!sacco.is_suspended ? (
              <Button
                size="sm"
                variant="outline"
                className="border-alert/40 text-alert hover:bg-alert/10"
                onClick={() => setShowSuspendForm(true)}
              >
                <ShieldOff className="h-4 w-4 mr-1.5" /> Suspend
              </Button>
            ) : (
              <Button
                size="sm"
                className="bg-terracotta hover:bg-clay text-white"
                onClick={() => suspendMutation.mutate({ suspend: false })}
                disabled={suspendMutation.isPending}
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                {suspendMutation.isPending ? 'Activating...' : 'Lift Suspension'}
              </Button>
            )}

            {/* Upload Logo */}
            <Button
              size="sm"
              variant="outline"
              className="border-sand hover:bg-sand-light text-slate"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadLogoMutation.isPending}
            >
              <Upload className="h-4 w-4 mr-1.5" />
              {uploadLogoMutation.isPending ? 'Uploading...' : 'Upload Logo'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </div>

          {/* Suspend Form */}
          {showSuspendForm && (
            <div className="mt-3 p-3 bg-sand-light/50 rounded-xl border border-sand space-y-3">
              <p className="text-xs font-semibold text-slate">Suspension reason (optional):</p>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Enter reason for suspension..."
                className="w-full text-xs border border-sand rounded-lg px-3 py-2 bg-white text-slate focus:border-terracotta focus:ring-1 focus:ring-terracotta resize-none outline-none"
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-alert hover:bg-alert/90 text-white"
                  onClick={() => suspendMutation.mutate({ suspend: true, reason: suspendReason })}
                  disabled={suspendMutation.isPending}
                >
                  {suspendMutation.isPending ? 'Suspending...' : 'Confirm Suspend'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-sand text-slate hover:bg-sand-light"
                  onClick={() => { setShowSuspendForm(false); setSuspendReason(''); }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details */}
      <Card className="border-sand bg-white shadow-subtle overflow-hidden">
        <CardHeader className="pb-3 border-b border-sand/40 bg-sand-light/20">
          <CardTitle className="text-sm font-bold text-slate">SACCO Details</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-sand/40">
          {[
            { label: 'Registration Number', value: sacco.registration_number },
            { label: 'SASRA Tier', value: sacco.sasra_tier ? `Tier ${sacco.sasra_tier}` : null },
            { label: 'Established', value: sacco.established_year },
            { label: 'Description', value: sacco.description },
            { label: 'Website', value: sacco.website },
            { label: 'Created', value: sacco.created_at ? formatDate(sacco.created_at) : null },
          ].filter(({ value }) => value != null).map(({ label, value }) => (
            <div key={label} className="flex items-start justify-between gap-4 py-3 text-sm">
              <span className="text-gray-400 font-medium flex-shrink-0">{label}</span>
              <span className="font-semibold text-slate text-right break-all">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Share Classes */}
      {shareClassesError && (
        <div className="text-center py-4">
          <p className="text-xs text-red-500">Failed to load share classes</p>
        </div>
      )}
      {shareClasses?.length > 0 && (
        <Card className="border-sand bg-white shadow-subtle overflow-hidden">
          <CardHeader className="pb-3 border-b border-sand/40 bg-sand-light/20">
            <CardTitle className="text-sm font-bold text-slate">Share Classes ({shareClasses.length})</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-sand/40 p-0">
            {shareClasses.map((sc) => (
              <div key={sc.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate">{sc.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Min: {formatKES(sc.minimum_investment)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {formatKES(sc.current_price || sc.price_per_share)}
                  </p>
                  <p className="text-xs text-gray-400">per share</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
