import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Send, CheckCircle2, XCircle, RefreshCcw,
  MessageSquare, DollarSign, Clock, Shield, FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageSpinner } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { toast } from 'sonner';
import { investmentsApi } from '../api/investmentsApi';
import { profileApi } from '../../profile/api/profileApi';
import { formatKES, formatDate, formatTimeAgo } from '../../../utils/format';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const offerStatusConfig = {
  pending: { label: 'Pending', color: 'bg-alert/10 text-alert border border-alert/20' },
  accepted: { label: 'Accepted', color: 'bg-success/10 text-success border border-success/20' },
  declined: { label: 'Declined', color: 'bg-danger/10 text-danger border border-danger/20' },
  countered: { label: 'Countered', color: 'bg-blue-500/10 text-blue-500 border border-blue-500/20' },
};

const roleConfig = {
  buyer: { label: 'Buyer', color: 'bg-blue-500/10 text-blue-500 border border-blue-500/20' },
  seller: { label: 'Seller', color: 'bg-terracotta/10 text-terracotta border border-terracotta/20' },
};

const connectionStatusConfig = {
  active: { label: 'Active', color: 'bg-success/10 text-success border border-success/20' },
  settled: { label: 'Settled', color: 'bg-gray-100 text-gray-500 border border-gray-200' },
  cancelled: { label: 'Cancelled', color: 'bg-danger/10 text-danger border border-danger/20' },
};

export default function ConnectionDetail() {
  const { connectionId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [offerPrice, setOfferPrice] = useState('');
  const [offerNotes, setOfferNotes] = useState('');
  const [showOfferForm, setShowOfferForm] = useState(false);

  const {
    data: connection,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['connection', connectionId],
    queryFn: () =>
      investmentsApi.getConnectionDetail(connectionId).then((r) => r.data.data || r.data),
    enabled: !!connectionId,
  });

  const makeOfferMutation = useMutation({
    mutationFn: (data) => investmentsApi.makeOffer(connectionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection', connectionId] });
      toast.success('Offer sent!');
      setShowOfferForm(false);
      setOfferPrice('');
      setOfferNotes('');
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error?.message || 'Failed to send offer'
      );
    },
  });

  const acceptOfferMutation = useMutation({
    mutationFn: (offerId) => investmentsApi.acceptOffer(connectionId, offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection', connectionId] });
      toast.success('Offer accepted!');
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error?.message || 'Failed to accept offer'
      );
    },
  });

  const declineOfferMutation = useMutation({
    mutationFn: (offerId) => investmentsApi.declineOffer(connectionId, offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection', connectionId] });
      toast.success('Offer declined');
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.error?.message || 'Failed to decline offer'
      );
    },
  });
  // Digital signature states
  const [isSignDialogOpen, setIsSignDialogOpen] = useState(false);
  const [signStep, setSignStep] = useState('requesting'); // 'requesting' | 'otp_sent' | 'confirming'
  const [otpCode, setOtpCode] = useState('');
  const [signatureId, setSignatureId] = useState(null);
  const [currentOfferId, setCurrentOfferId] = useState(null);

  const handleMakeOffer = () => {
    if (!offerPrice || parseFloat(offerPrice) <= 0) {
      toast.error('Enter a valid price');
      return;
    }
    makeOfferMutation.mutate({
      price_per_share: parseFloat(offerPrice),
      notes: offerNotes || undefined,
    });
  };

  const handleStartAccept = (offerId) => {
    setCurrentOfferId(offerId);
    setIsSignDialogOpen(true);
    setSignStep('requesting');
    setOtpCode('');

    profileApi.requestSignature({
      document_type: 'SHARE_TRANSFER',
      document_reference: connectionId,
      document_title: `Share Purchase Agreement - ${connection.sacco_name}`,
    })
      .then((res) => {
        const data = res.data?.data || res.data;
        if (data.already_signed) {
          toast.success('Document already signed! Finalizing offer acceptance...');
          acceptOfferMutation.mutate(offerId);
          setIsSignDialogOpen(false);
        } else {
          setSignatureId(data.signature_id);
          setSignStep('otp_sent');
          toast.success('OTP sent to your registered phone number');
        }
      })
      .catch((err) => {
        setIsSignDialogOpen(false);
        toast.error(
          err.response?.data?.error?.message || 'Failed to request digital signature OTP'
        );
      });
  };

  const handleVerifySignature = () => {
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP code');
      return;
    }

    setSignStep('confirming');

    profileApi.confirmSignature({
      signature_id: signatureId,
      otp: otpCode,
    })
      .then((res) => {
        toast.success('Agreement signed digitally!');
        // Now finalize the offer acceptance
        acceptOfferMutation.mutate(currentOfferId, {
          onSuccess: () => {
            setIsSignDialogOpen(false);
          },
          onError: () => {
            setSignStep('otp_sent');
          }
        });
      })
      .catch((err) => {
        setSignStep('otp_sent');
        toast.error(
          err.response?.data?.error?.message || 'Invalid verification OTP'
        );
      });
  };

  const handleResendOTP = () => {
    if (signStep === 'confirming') return;
    
    toast.info('Requesting a new OTP...');
    profileApi.requestSignature({
      document_type: 'SHARE_TRANSFER',
      document_reference: connectionId,
      document_title: `Share Purchase Agreement - ${connection.sacco_name}`,
    })
      .then((res) => {
        const data = res.data?.data || res.data;
        setSignatureId(data.signature_id);
        setOtpCode('');
        setSignStep('otp_sent');
        toast.success('New OTP sent successfully');
      })
      .catch((err) => {
        toast.error(
          err.response?.data?.error?.message || 'Failed to resend OTP'
        );
      });
  };
  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorState message="Failed to load connection" onRetry={refetch} />;
  if (!connection) return <ErrorState message="Connection not found" />;

  const isActive = connection.status === 'active';
  const offers = connection.offers || [];
  const role = roleConfig[connection.my_role] || roleConfig.buyer;
  const status = connectionStatusConfig[connection.status] || connectionStatusConfig.active;

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-white/80 backdrop-blur-lg border-b border-sand px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: '/investments/connections' })}
            className="p-1 rounded-lg text-slate hover:bg-sand-light transition-colors"
            aria-label="Back to connections"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold font-heading text-slate leading-tight truncate">
              {connection.counterparty_name || 'Connection'}
            </h1>
            <p className="text-xs text-gray-400 font-medium truncate mt-0.5">
              {connection.sacco_name} · {connection.share_class_name}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Deal Summary */}
        <Card className="border-sand bg-white shadow-subtle">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-400">Deal Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-xs font-medium">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">My Role</p>
                <Badge className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-none capitalize ${role.color}`} variant="outline">
                  {role.label}
                </Badge>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">Status</p>
                <Badge className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-none capitalize ${status.color}`} variant="outline">
                  {status.label}
                </Badge>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Quantity</p>
                <p className="text-sm font-bold text-slate font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {connection.quantity?.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-0.5">Agreed Price</p>
                <p className="text-sm font-bold text-terracotta font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {connection.agreed_price
                    ? formatKES(connection.agreed_price)
                    : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Offers */}
        <Card className="border-sand bg-white shadow-subtle">
          <CardHeader className="pb-2.5 flex flex-row items-center justify-between gap-4">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-400">Offers</CardTitle>
            {isActive && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowOfferForm(!showOfferForm)}
                className="border-sand hover:bg-sand-light text-slate cursor-pointer h-7 text-[11px] font-semibold px-2.5 rounded-lg"
              >
                {showOfferForm ? 'Cancel' : 'Make Offer'}
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Make Offer Form */}
            {showOfferForm && (
              <div className="bg-sand-light/50 border border-sand/60 rounded-2xl p-3.5 space-y-3 animate-in fade-in duration-200">
                <div className="relative">
                  <Input
                    placeholder="Price per share (KES)"
                    type="number"
                    min="0"
                    step="0.01"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="border-input rounded-xl bg-white text-sm font-numbers focus:border-terracotta focus:ring-1 focus:ring-terracotta"
                  />
                </div>
                <Input
                  placeholder="Notes (optional)"
                  value={offerNotes}
                  onChange={(e) => setOfferNotes(e.target.value)}
                  className="border-input rounded-xl bg-white text-sm focus:border-terracotta focus:ring-1 focus:ring-terracotta"
                />
                <Button
                  size="sm"
                  className="w-full bg-terracotta hover:bg-terracotta-dark text-white shadow-subtle border-0 cursor-pointer h-9 text-xs font-semibold rounded-xl"
                  onClick={handleMakeOffer}
                  disabled={makeOfferMutation.isPending}
                >
                  {makeOfferMutation.isPending ? 'Sending...' : (
                    <>
                      <Send className="h-3.5 w-3.5 mr-1" />
                      Send Offer
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Offers List */}
            {offers.length === 0 ? (
              <p className="text-xs text-gray-400 font-medium text-center py-6">
                No offers yet. Make the first offer!
              </p>
            ) : (
              <div className="space-y-3">
                {offers.map((offer) => {
                  const offerStatus = offerStatusConfig[offer.status] || offerStatusConfig.pending;
                  return (
                    <div
                      key={offer.id}
                      className="border border-sand bg-sand-light/10 hover:bg-sand-light/20 transition-all rounded-xl p-3.5 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-xs font-bold text-slate truncate">
                            {offer.created_by_name || 'Counterparty'}
                          </span>
                          <Badge className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-none capitalize ${offerStatus.color}`} variant="outline">
                            {offerStatus.label}
                          </Badge>
                        </div>
                        <span className="text-[10px] text-gray-400 font-semibold flex-shrink-0">
                          {formatTimeAgo(offer.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-base font-extrabold text-terracotta font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                            {formatKES(offer.price_per_share)}
                          </p>
                          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5">per share</p>
                        </div>
                        {offer.notes && (
                          <p className="text-xs text-gray-500 max-w-[180px] bg-sand-light/30 border border-sand/40 rounded-lg p-1.5 italic text-right">
                            {offer.notes}
                          </p>
                        )}
                      </div>
                      {/* Actions for pending offers not created by me */}
                      {offer.status === 'pending' && isActive && (
                        <div className="flex gap-2.5 pt-1">
                          <Button
                            size="sm"
                            className="flex-1 bg-success hover:bg-success-dark text-white border-0 shadow-subtle cursor-pointer h-8 text-xs font-semibold rounded-lg"
                            onClick={() => handleStartAccept(offer.id)}
                            disabled={acceptOfferMutation.isPending || isSignDialogOpen}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-sand hover:bg-sand-light text-slate cursor-pointer h-8 text-xs font-semibold rounded-lg"
                            onClick={() => declineOfferMutation.mutate(offer.id)}
                            disabled={declineOfferMutation.isPending}
                          >
                            <XCircle className="h-3.5 w-3.5 mr-1" />
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Messages */}
        {connection.messages?.length > 0 && (
          <Card className="border-sand bg-white shadow-subtle">
            <CardHeader className="pb-2.5">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-terracotta" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {connection.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3.5 rounded-2xl text-xs font-medium ${
                    msg.is_mine
                      ? 'bg-terracotta/10 text-slate border border-terracotta/20 rounded-tr-none ml-8'
                      : 'bg-sand/40 text-slate border border-sand-dark/20 rounded-tl-none mr-8'
                  }`}
                >
                  <p className="leading-relaxed">{msg.content || msg.message}</p>
                  <p className="text-[10px] text-gray-400 font-semibold mt-1.5 text-right font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {formatTimeAgo(msg.created_at)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Digital Signature Verification Dialog */}
      <Dialog open={isSignDialogOpen} onOpenChange={setIsSignDialogOpen}>
        <DialogContent className="border-sand bg-white shadow-subtle p-5 max-w-sm">
          <DialogHeader className="space-y-1.5 pb-2">
            <DialogTitle className="text-base font-bold text-slate flex items-center gap-2">
              <Shield className="h-5 w-5 text-terracotta" />
              Bilateral Agreement Signing
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500 leading-normal">
              Authorize the transfer of shares securely using a one-time cryptographic signature.
            </DialogDescription>
          </DialogHeader>

          {signStep === 'requesting' ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <RefreshCcw className="h-8 w-8 text-terracotta animate-spin" />
              <p className="text-xs font-semibold text-slate">Generating legal signature request...</p>
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              <div className="bg-sand-light/40 border border-sand/40 rounded-xl p-3 space-y-2 text-xs">
                <p className="font-semibold text-slate flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-terracotta" />
                  Share Purchase Agreement
                </p>
                <div className="grid grid-cols-2 gap-2 text-gray-500 font-medium">
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-gray-400">Seller</p>
                    <p className="text-slate font-semibold truncate">{connection.counterparty_name}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-gray-400">Shares</p>
                    <p className="text-slate font-bold font-numbers">{connection.quantity?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-gray-400">Total Price</p>
                    <p className="text-terracotta font-bold font-numbers">{connection.agreed_price ? formatKES(connection.agreed_price) : '—'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-wider text-gray-400">Security ID</p>
                    <p className="text-slate font-mono font-semibold truncate text-[10px]">
                      {signatureId ? signatureId.substring(0, 8) : 'Pending...'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">
                  SMS Verification Code (OTP)
                </label>
                <Input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="•••••"
                  className="w-full text-center text-xl font-bold tracking-[0.75em] pl-[0.75em] h-12 border-sand focus:border-terracotta focus:ring-terracotta rounded-xl"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  disabled={signStep === 'confirming' || acceptOfferMutation.isPending}
                />
                <p className="text-[10px] text-gray-400 text-center font-medium leading-relaxed">
                  Enter the 6-digit OTP code sent to your phone to digitally sign this agreement.
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 border-sand hover:bg-sand-light text-slate cursor-pointer h-10 text-xs font-semibold rounded-xl"
                  onClick={() => setIsSignDialogOpen(false)}
                  disabled={signStep === 'confirming' || acceptOfferMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-terracotta hover:bg-terracotta-dark text-white border-0 shadow-subtle cursor-pointer h-10 text-xs font-semibold rounded-xl"
                  onClick={handleVerifySignature}
                  disabled={otpCode.length !== 6 || signStep === 'confirming' || acceptOfferMutation.isPending}
                >
                  {signStep === 'confirming' || acceptOfferMutation.isPending ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <RefreshCcw className="h-3.5 w-3.5 animate-spin" />
                      Signing...
                    </span>
                  ) : (
                    'Verify & Sign'
                  )}
                </Button>
              </div>

              <div className="text-center pt-1.5 border-t border-sand/40">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-xs text-terracotta hover:text-terracotta-dark font-semibold transition-colors"
                  disabled={signStep === 'confirming' || acceptOfferMutation.isPending}
                >
                  Didn't receive code? Resend OTP
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}