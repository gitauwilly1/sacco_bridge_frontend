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
import { formatKES, formatDate, formatTimeAgo } from '../../../utils/format';

const offerStatusConfig = {
  pending: { label: 'Pending', color: 'bg-alert/10 text-alert' },
  accepted: { label: 'Accepted', color: 'bg-success/10 text-success' },
  declined: { label: 'Declined', color: 'bg-danger/10 text-danger' },
  countered: { label: 'Countered', color: 'bg-blue-500/10 text-blue-500' },
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

  if (isLoading) return <PageSpinner />;
  if (error) return <ErrorState message="Failed to load connection" onRetry={refetch} />;
  if (!connection) return <ErrorState message="Connection not found" />;

  const isActive = connection.status === 'active';
  const offers = connection.offers || [];
  const pendingOffers = offers.filter((o) => o.status === 'pending');

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-white border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate({ to: '/investments/connections' })}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-slate">
              {connection.counterparty_name || 'Connection'}
            </h1>
            <p className="text-xs text-gray-500">
              {connection.sacco_name} · {connection.share_class_name}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Deal Summary */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Deal Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-500">My Role</p>
                <Badge className="mt-1">
                  {connection.my_role === 'buyer' ? 'Buyer' : 'Seller'}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <Badge className="mt-1">
                  {connection.status}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500">Quantity</p>
                <p className="font-semibold text-slate">
                  {connection.quantity?.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Agreed Price</p>
                <p className="font-semibold text-terracotta">
                  {connection.agreed_price
                    ? formatKES(connection.agreed_price)
                    : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Offers */}
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Offers</CardTitle>
            {isActive && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowOfferForm(!showOfferForm)}
              >
                {showOfferForm ? 'Cancel' : 'Make Offer'}
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Make Offer Form */}
            {showOfferForm && (
              <div className="bg-sand-light rounded-lg p-3 space-y-2">
                <Input
                  placeholder="Price per share (KES)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                />
                <Input
                  placeholder="Notes (optional)"
                  value={offerNotes}
                  onChange={(e) => setOfferNotes(e.target.value)}
                />
                <Button
                  size="sm"
                  className="w-full"
                  onClick={handleMakeOffer}
                  disabled={makeOfferMutation.isPending}
                >
                  {makeOfferMutation.isPending ? 'Sending...' : (
                    <>
                      <Send className="h-3 w-3 mr-1" />
                      Send Offer
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Offers List */}
            {offers.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No offers yet. Make the first offer!
              </p>
            ) : (
              offers.map((offer) => {
                const status = offerStatusConfig[offer.status] || offerStatusConfig.pending;
                return (
                  <div
                    key={offer.id}
                    className="border rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">
                          {offer.created_by_name || 'Counterparty'}
                        </span>
                        <Badge className={status.color} variant="outline">
                          {status.label}
                        </Badge>
                      </div>
                      <span className="text-xs text-gray-400">
                        {formatTimeAgo(offer.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-terracotta">
                          {formatKES(offer.price_per_share)}
                        </p>
                        <p className="text-xs text-gray-500">per share</p>
                      </div>
                      {offer.notes && (
                        <p className="text-xs text-gray-500 max-w-[180px] text-right">
                          {offer.notes}
                        </p>
                      )}
                    </div>
                    {/* Actions for pending offers not created by me */}
                    {offer.status === 'pending' && isActive && (
                      <div className="flex gap-2 pt-1">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => acceptOfferMutation.mutate(offer.id)}
                          disabled={acceptOfferMutation.isPending}
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => declineOfferMutation.mutate(offer.id)}
                          disabled={declineOfferMutation.isPending}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Decline
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Messages */}
        {connection.messages?.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Messages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {connection.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg text-sm ${
                    msg.is_mine
                      ? 'bg-terracotta/5 ml-4'
                      : 'bg-gray-50 mr-4'
                  }`}
                >
                  <p className="text-slate">{msg.content || msg.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTimeAgo(msg.created_at)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}