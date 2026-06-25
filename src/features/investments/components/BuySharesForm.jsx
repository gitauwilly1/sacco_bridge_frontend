import { useState, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Wallet, Smartphone, AlertCircle, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageSpinner } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { toast } from 'sonner';
import { investmentsApi } from '../api/investmentsApi';
import useAuthStore from '../../../stores/authStore';
import { formatKES } from '../../../utils/format';
import { PHONE_REGEX } from '../../../utils/validators';

export default function BuySharesForm() {
  const { saccoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [selectedShareClassId, setSelectedShareClassId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load SACCO details
  const {
    data: sacco,
    isLoading: saccoLoading,
    error: saccoError,
    refetch: refetchSacco,
  } = useQuery({
    queryKey: ['sacco', saccoId],
    queryFn: () => investmentsApi.getSACCODetail(saccoId).then((r) => r.data.data || r.data),
    enabled: !!saccoId,
  });

  // Load Share Classes
  const {
    data: shareClasses,
    isLoading: sharesLoading,
    error: sharesError,
    refetch: refetchShares,
  } = useQuery({
    queryKey: ['sacco-share-classes', saccoId],
    queryFn: () =>
      investmentsApi.getShareClasses(saccoId).then((r) => r.data.results || r.data.data || []),
    enabled: !!saccoId,
  });

  const shareClassList = Array.isArray(shareClasses) ? shareClasses : [];
  const selectedShareClass = shareClassList.find((sc) => sc.id.toString() === selectedShareClassId);

  // Set default values when data loads
  useEffect(() => {
    if (shareClassList.length > 0 && !selectedShareClassId) {
      setSelectedShareClassId(shareClassList[0].id.toString());
    }
  }, [shareClassList, selectedShareClassId]);

  if (saccoLoading || sharesLoading) return <PageSpinner />;
  if (saccoError || sharesError) {
    return (
      <ErrorState
        message="Failed to load share classes"
        onRetry={() => {
          refetchSacco();
          refetchShares();
        }}
      />
    );
  }

  const pricePerShare = selectedShareClass ? parseFloat(selectedShareClass.current_price || selectedShareClass.price_per_share || 0) : 0;
  const minimumInvestment = selectedShareClass ? parseFloat(selectedShareClass.minimum_investment || 0) : 0;
  const parsedQuantity = parseInt(quantity || '0', 10);
  const totalAmount = parsedQuantity * pricePerShare;

  const isBelowMinimum = totalAmount > 0 && totalAmount < minimumInvestment;
  const isPhoneInvalid = phoneNumber && !PHONE_REGEX.test(phoneNumber);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedShareClass) {
      toast.error('Please select a share class');
      return;
    }
    if (parsedQuantity <= 0) {
      toast.error('Please enter a valid quantity of shares');
      return;
    }
    if (isBelowMinimum) {
      toast.error(`Minimum investment value is ${formatKES(minimumInvestment)}`);
      return;
    }
    if (!phoneNumber) {
      toast.error('M-Pesa phone number is required');
      return;
    }
    if (!PHONE_REGEX.test(phoneNumber)) {
      toast.error('Please enter a valid Kenyan phone number (e.g. 0712345678)');
      return;
    }

    setIsSubmitting(true);
    toast.loading('Initiating STK Push payment...');

    try {
      const payload = {
        phone_number: phoneNumber,
        amount: totalAmount.toFixed(2),
        transaction_type: 'SHARE_PURCHASE',
        account_reference: 'SACCO_BUY',
        transaction_description: `Buy ${parsedQuantity} shs`,
      };

      const response = await investmentsApi.initiateStkPush(payload);
      toast.dismiss();

      if (response.data?.success) {
        toast.success(response.data?.message || 'STK Push sent! Input M-Pesa PIN on your phone.');
        navigate({ to: '/holdings' });
      } else {
        toast.error(response.data?.error?.message || 'Failed to trigger STK Push');
      }
    } catch (err) {
      toast.dismiss();
      const msg = err.response?.data?.error?.message || 'Payment initiation failed';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-white/80 backdrop-blur-lg border-b border-sand px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: `/investments/saccos/${saccoId}` })}
            className="p-1 rounded-lg text-slate hover:bg-sand-light transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold font-heading text-slate leading-tight">Buy Shares</h1>
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">
              {sacco?.name || 'SACCO Shares'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-md mx-auto space-y-4">
        <Card className="border-sand bg-white shadow-subtle overflow-hidden">
          <CardHeader className="pb-3 pt-4 border-b border-sand bg-sand-light/30">
            <CardTitle className="text-sm font-bold text-slate flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-terracotta" />
              Purchase Shares
            </CardTitle>
            <CardDescription className="text-xs text-gray-400">
              Submit your request and complete the payment using M-Pesa STK Push.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Select Share Class */}
              <div className="space-y-1.5">
                <Label htmlFor="share-class" className="text-xs font-bold text-slate">
                  Select Share Class
                </Label>
                <Select value={selectedShareClassId} onValueChange={setSelectedShareClassId}>
                  <SelectTrigger id="share-class" className="border-sand bg-sand-light/10 text-slate focus:ring-terracotta">
                    <SelectValue placeholder="Choose a share class" />
                  </SelectTrigger>
                  <SelectContent className="border-sand">
                    {shareClassList.map((sc) => (
                      <SelectItem key={sc.id} value={sc.id.toString()} className="text-slate">
                        {sc.name} ({formatKES(sc.current_price || sc.price_per_share)} / share)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedShareClass && (
                <div className="p-3 bg-sand-light/40 border border-sand rounded-xl space-y-1.5 text-xs text-slate font-medium">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Price per Share:</span>
                    <span className="font-bold">{formatKES(pricePerShare)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Minimum Investment:</span>
                    <span className="font-bold">{formatKES(minimumInvestment)}</span>
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-1.5">
                <Label htmlFor="quantity" className="text-xs font-bold text-slate">
                  Quantity (Shares)
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="Enter number of shares"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="border-sand focus-visible:ring-terracotta text-slate bg-sand-light/10"
                  min="1"
                  required
                />
              </div>

              {/* M-Pesa Phone Number */}
              <div className="space-y-1.5">
                <Label htmlFor="phone-number" className="text-xs font-bold text-slate flex items-center gap-1">
                  <Smartphone className="h-3 w-3 text-slate/60" />
                  M-Pesa Phone Number
                </Label>
                <Input
                  id="phone-number"
                  type="text"
                  placeholder="e.g. 0712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={`border-sand focus-visible:ring-terracotta text-slate bg-sand-light/10 ${
                    isPhoneInvalid ? 'border-danger focus-visible:ring-danger' : ''
                  }`}
                  required
                />
                {isPhoneInvalid && (
                  <p className="text-[10px] text-danger font-medium flex items-center gap-1 mt-1">
                    <AlertCircle className="h-3 w-3" /> Please enter a valid Kenyan phone number (e.g. 07XXXXXXXX)
                  </p>
                )}
              </div>

              {/* Live Cost Summary */}
              {parsedQuantity > 0 && selectedShareClass && (
                <div className="p-4 bg-terracotta/5 border border-terracotta/20 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate font-bold">Total Cost</span>
                    <span className="text-lg font-extrabold text-terracotta font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {formatKES(totalAmount)}
                    </span>
                  </div>
                  {isBelowMinimum && (
                    <div className="flex items-start gap-1.5 text-[10px] text-alert font-bold leading-tight mt-1">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>Investment amount is below the minimum required ({formatKES(minimumInvestment)})</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button */}
              <Button
                type="submit"
                disabled={isSubmitting || isBelowMinimum || isPhoneInvalid}
                className="w-full bg-terracotta hover:bg-clay text-white shadow-sm transition-all"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Confirm & Pay via M-Pesa
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
