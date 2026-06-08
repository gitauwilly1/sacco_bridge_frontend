import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, Send, Shield, CheckCircle, XCircle, RefreshCw, User } from 'lucide-react';
import api from '@/lib/api.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { CardSkeleton } from '@/components/shared/LoadingSkeleton.jsx';
import ErrorState from '@/components/shared/ErrorState.jsx';

export default function ConnectionRoomPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [message, setMessage] = useState('');
  const [offerPrice, setOfferPrice] = useState('');
  const [offerMessage, setOfferMessage] = useState('');

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['connection', id],
    queryFn: async () => {
      const { data } = await api.get(`/investments/connections/${id}/`);
      return data.data || data;
    },
    enabled: !!id,
  });

  const connection = data;

  const offerMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/investments/connections/${id}/make_offer/`, {
        price_per_share: offerPrice,
        message: offerMessage,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection', id] });
      setOfferPrice('');
      setOfferMessage('');
    },
  });

  const acceptMutation = useMutation({
    mutationFn: async (offerId) => {
      await api.post(`/investments/connections/${id}/offers/${offerId}/accept/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection', id] });
      queryClient.invalidateQueries({ queryKey: ['invest-dashboard'] });
    },
  });

  const declineMutation = useMutation({
    mutationFn: async (offerId) => {
      await api.post(`/investments/connections/${id}/offers/${offerId}/decline/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection', id] });
    },
  });

  const counterMutation = useMutation({
    mutationFn: async ({ offerId, price }) => {
      await api.post(`/investments/connections/${id}/offers/${offerId}/counter/`, {
        price_per_share: price,
        message: 'Counter offer',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connection', id] });
    },
  });

  if (isLoading) {
    return (
      <div className="px-4 py-4 space-y-4">
        <div className="skeleton h-6 w-32" />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  if (isError) return <ErrorState onRetry={refetch} />;
  if (!connection) return null;

  const isSeller = connection.seller === user?.id;
  const latestOffer = connection.latest_offer;
  const offers = connection.offers || [];
  const isNegotiating = ['CONNECTED', 'OFFER_MADE', 'OFFER_COUNTERED', 'OFFER_DECLINED'].includes(connection.status);
  const isAccepted = connection.status === 'OFFER_ACCEPTED';
  const isSettled = connection.status === 'SETTLED';

  const quickMessages = [
    "I'm flexible on price. What works for you?",
    "Can we close this today?",
    "I'm ready to proceed when you are.",
    "Let me review and get back to you.",
  ];

  return (
    <div className="px-4 py-4 space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-heading font-semibold text-slate-800">
          Connection Room
        </h2>
        <div className="flex items-center gap-1 text-xs text-success-600 bg-success-50 px-2 py-1 rounded-full">
          <Shield className="w-3 h-3" /> Verified
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 bg-white rounded-xl p-3 shadow-subtle text-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-terracotta-400 to-clay-600 flex items-center justify-center mx-auto mb-1">
            <User className="w-5 h-5 text-white" />
          </div>
          <p className="text-xs font-medium text-slate-700">
            {isSeller ? 'You (Seller)' : connection.seller_name || 'Seller'}
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-success-100 flex items-center justify-center">
          <RefreshCw className="w-4 h-4 text-success-600" />
        </div>
        <div className="flex-1 bg-white rounded-xl p-3 shadow-subtle text-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center mx-auto mb-1">
            <User className="w-5 h-5 text-white" />
          </div>
          <p className="text-xs font-medium text-slate-700">
            {!isSeller ? 'You (Buyer)' : connection.buyer_name || 'Buyer'}
          </p>
        </div>
      </div>

      <div className="bg-sand-50 rounded-xl p-3">
        <p className="text-xs text-slate-500">{connection.sacco_name}</p>
        <p className="text-sm font-medium text-slate-800">
          {connection.agreed_quantity || connection.liquidity_request?.share_quantity || 'N/A'} shares
        </p>
      </div>

      {isSettled && (
        <div className="bg-success-50 rounded-xl p-4 text-center">
          <CheckCircle className="w-8 h-8 text-success-600 mx-auto mb-2" />
          <p className="font-heading font-semibold text-success-700">Transaction Complete</p>
          <p className="text-xs text-success-600 mt-1">
            KSh {parseInt(connection.total_amount || 0).toLocaleString()} settled
          </p>
        </div>
      )}

      {isAccepted && (
        <div className="bg-alert-50 rounded-xl p-4 text-center">
          <CheckCircle className="w-8 h-8 text-alert-600 mx-auto mb-2" />
          <p className="font-heading font-semibold text-alert-700">Offer Accepted</p>
          <p className="text-xs text-alert-600 mt-1">Settlement is being processed</p>
        </div>
      )}

      {latestOffer && latestOffer.status === 'PENDING' && (
        <div className="bg-white rounded-xl p-4 shadow-subtle border-2 border-terracotta-200">
          <p className="text-xs text-slate-500 mb-2">Current Offer</p>
          <div className="flex items-center justify-between mb-3">
            <p className="font-numbers font-bold text-slate-800 text-lg">
              KSh {parseFloat(latestOffer.price_per_share || 0).toFixed(0)}
            </p>
            <span className="text-xs text-slate-500">per share</span>
          </div>
          <div className="flex justify-between text-sm mb-3">
            <span className="text-slate-500">Total</span>
            <span className="font-numbers font-semibold text-slate-800">
              KSh {parseInt(latestOffer.total_amount || 0).toLocaleString()}
            </span>
          </div>
          {latestOffer.message && (
            <p className="text-xs text-slate-500 mb-3 italic">"{latestOffer.message}"</p>
          )}
          {latestOffer.offered_by !== user?.id && (
            <div className="flex gap-2">
              <button
                onClick={() => acceptMutation.mutate(latestOffer.id)}
                disabled={acceptMutation.isPending}
                className="flex-1 py-2 bg-success-600 text-white text-sm font-medium rounded-lg hover:bg-success-700 disabled:opacity-50 transition-colors"
              >
                {acceptMutation.isPending ? 'Accepting...' : 'Accept'}
              </button>
              <button
                onClick={() => declineMutation.mutate(latestOffer.id)}
                disabled={declineMutation.isPending}
                className="flex-1 py-2 bg-white border border-error-200 text-error-600 text-sm font-medium rounded-lg hover:bg-error-50 disabled:opacity-50 transition-colors"
              >
                {declineMutation.isPending ? 'Declining...' : 'Decline'}
              </button>
              <button
                onClick={() => {
                  const counterPrice = prompt('Enter counter price per share:');
                  if (counterPrice) {
                    counterMutation.mutate({ offerId: latestOffer.id, price: counterPrice });
                  }
                }}
                className="flex-1 py-2 bg-white border border-alert-200 text-alert-600 text-sm font-medium rounded-lg hover:bg-alert-50 transition-colors"
              >
                Counter
              </button>
            </div>
          )}
        </div>
      )}

      {isNegotiating && !isSeller && (
        <div className="bg-white rounded-xl p-4 shadow-subtle space-y-3">
          <h3 className="font-heading font-semibold text-slate-800 text-sm">Make an Offer</h3>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Price per Share (KSh)</label>
            <input
              type="number"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-sand-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-terracotta-300"
              placeholder="Enter price"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Message (optional)</label>
            <textarea
              value={offerMessage}
              onChange={(e) => setOfferMessage(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-sand-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-terracotta-300 resize-none"
              rows={2}
              placeholder="Add a message..."
            />
          </div>
          <button
            onClick={() => offerMutation.mutate()}
            disabled={offerMutation.isPending || !offerPrice}
            className="w-full py-2.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white text-sm font-medium rounded-lg shadow-terracotta hover:from-terracotta-600 hover:to-clay-700 disabled:opacity-50 transition-all duration-200"
          >
            {offerMutation.isPending ? 'Sending...' : 'Submit Offer'}
          </button>
        </div>
      )}

      <div className="space-y-2">
        <h3 className="font-heading font-semibold text-slate-800 text-sm">Quick Messages</h3>
        <div className="flex flex-wrap gap-2">
          {quickMessages.map((msg, i) => (
            <button
              key={i}
              onClick={() => setMessage(msg)}
              className="px-3 py-1.5 bg-sand-50 border border-sand-200 rounded-full text-xs text-slate-600 hover:bg-sand-100 hover:border-terracotta-300 transition-all"
            >
              {msg}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}