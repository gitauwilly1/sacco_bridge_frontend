import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, ShieldCheck, Upload, CheckCircle2, AlertCircle,
  XCircle, Clock, Loader2, FileText, Trash2, Send, IdCard, Camera,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageSpinner } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { toast } from 'sonner';
import { kycApi } from '../api/kycApi';

const DOCUMENT_FIELDS = [
  { type: 'NATIONAL_ID_FRONT', label: 'National ID (Front)', icon: IdCard, hint: 'Clear photo of the front of your National ID card' },
  { type: 'NATIONAL_ID_BACK', label: 'National ID (Back)', icon: IdCard, hint: 'Clear photo of the back of your National ID card' },
  { type: 'SELFIE', label: 'Selfie Photo', icon: Camera, hint: 'A clear selfie holding your ID or just your face' },
];

const STATUS_CONFIG = {
  VERIFIED: { label: 'Verified', color: 'bg-success/10 text-success border-success/20', icon: CheckCircle2 },
  PENDING: { label: 'Pending', color: 'bg-sand text-slate border-sand-dark/20', icon: Clock },
  REJECTED: { label: 'Rejected', color: 'bg-danger/10 text-danger border-danger/20', icon: XCircle },
  UNVERIFIED: { label: 'Not Started', color: 'bg-alert/10 text-alert border-alert/20', icon: AlertCircle },
};

export default function KYCVerification() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(null);

  const { data: kycData, isLoading, error, refetch } = useQuery({
    queryKey: ['kyc-status'],
    queryFn: () => kycApi.getStatus().then((r) => r.data?.data),
  });

  const submitMutation = useMutation({
    mutationFn: () => kycApi.submitForReview(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-status'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast.success('Documents submitted for verification!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error?.message || 'Failed to submit');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (docId) => kycApi.deleteDocument(docId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc-status'] });
      toast.success('Document removed');
    },
  });

  const handleUpload = async (documentType, file) => {
    setUploading(documentType);
    const formData = new FormData();
    formData.append('document_type', documentType);
    formData.append('file', file);
    try {
      await kycApi.uploadDocument(formData);
      queryClient.invalidateQueries({ queryKey: ['kyc-status'] });
      toast.success('Document uploaded');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const status = kycData?.id_verification_status || 'UNVERIFIED';
  const StatusConfig = STATUS_CONFIG[status] || STATUS_CONFIG.UNVERIFIED;
  const documents = kycData?.documents || [];
  const uploadedTypes = new Set(documents.map((d) => d.document_type));
  const allRequiredUploaded = DOCUMENT_FIELDS.every((f) => uploadedTypes.has(f.type));
  const canSubmit = allRequiredUploaded && status === 'UNVERIFIED';

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorState message="Failed to load KYC status" onRetry={refetch} />;

  return (
    <div className="pb-8">
      <div className="sticky top-14 z-30 bg-white/80 backdrop-blur-lg border-b border-sand px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: '/profile' })} className="p-1 rounded-lg text-slate hover:bg-sand-light transition-colors" aria-label="Back">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-base font-bold font-heading text-slate leading-tight">Identity Verification</h1>
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">KYC Document Upload</p>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto space-y-4">
        <Card className="border-sand bg-white shadow-subtle">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-terracotta" />
                <CardTitle className="text-sm font-bold text-slate">Verification Status</CardTitle>
              </div>
              <Badge className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shadow-none ${StatusConfig.color}`}>
                <StatusConfig.icon className="h-3 w-3 mr-1" />
                {StatusConfig.label}
              </Badge>
            </div>
            {status === 'VERIFIED' && (
              <CardDescription className="text-xs text-success font-medium mt-2">
                Your identity has been verified. You have full access to all features.
              </CardDescription>
            )}
            {status === 'PENDING' && (
              <CardDescription className="text-xs text-slate font-medium mt-2">
                Your documents are under review. This usually takes 1-2 business days.
              </CardDescription>
            )}
            {status === 'REJECTED' && (
              <CardDescription className="text-xs text-danger font-medium mt-2">
                Your documents were rejected. Please re-upload clear documents and resubmit.
              </CardDescription>
            )}
            {status === 'UNVERIFIED' && (
              <CardDescription className="text-xs text-gray-400 mt-2">
                Upload the required documents below to verify your identity.
              </CardDescription>
            )}
          </CardHeader>
        </Card>

        {status !== 'VERIFIED' && DOCUMENT_FIELDS.map((field) => {
          const existing = documents.find((d) => d.document_type === field.type);
          const isUploading = uploading === field.type;
          const FieldIcon = field.icon;

          return (
            <Card key={field.type} className="border-sand bg-white shadow-subtle">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-sand-light flex items-center justify-center border border-sand shrink-0">
                    <FieldIcon className="h-5 w-5 text-slate/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-slate">{field.label}</h3>
                      {existing && (
                        <Badge className="bg-success/10 text-success border-success/20 rounded-full text-[10px] font-bold px-2 shadow-none">
                          <CheckCircle2 className="h-3 w-3 mr-0.5" /> Uploaded
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{field.hint}</p>

                    {existing ? (
                      <div className="flex items-center gap-2 mt-3">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-danger/30 text-danger text-xs font-semibold h-8"
                          onClick={() => deleteMutation.mutate(existing.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-3">
                        <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-semibold text-terracotta hover:text-clay transition-colors">
                          <Upload className="h-3.5 w-3.5" />
                          {isUploading ? 'Uploading...' : 'Choose file'}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,application/pdf"
                            className="hidden"
                            disabled={isUploading || status === 'PENDING'}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUpload(field.type, file);
                              e.target.value = '';
                            }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {status !== 'VERIFIED' && status !== 'PENDING' && (
          <Button
            className="w-full bg-terracotta hover:bg-clay text-white shadow-sm"
            disabled={!canSubmit || submitMutation.isPending}
            onClick={() => submitMutation.mutate()}
          >
            {submitMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            {submitMutation.isPending ? 'Submitting...' : 'Submit for Review'}
          </Button>
        )}

        {!allRequiredUploaded && status !== 'VERIFIED' && status !== 'PENDING' && (
          <p className="text-[11px] text-gray-400 text-center">
            Upload all 3 documents before submitting for review.
          </p>
        )}
      </div>
    </div>
  );
}
