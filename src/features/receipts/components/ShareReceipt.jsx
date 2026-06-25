import { useParams, useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Download, QrCode, FileText, CheckCircle2, Calendar, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageSpinner } from '@/components/feedback/LoadingState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { toast } from 'sonner';
import { receiptApi } from '../api/receiptApi';
import { formatKES, formatDate } from '../../../utils/format';

export default function ShareReceipt() {
  const { receiptId } = useParams();
  const navigate = useNavigate();

  const {
    data: receipt,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['receipt', receiptId],
    queryFn: () => receiptApi.getReceiptDetail(receiptId).then((r) => r.data.data || r.data),
    enabled: !!receiptId,
  });

  const handleDownload = async () => {
    toast.loading('Downloading receipt...');
    try {
      const response = await receiptApi.downloadReceipt(receiptId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `SaccoBridge_Receipt_${receiptId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.dismiss();
      toast.success('Receipt downloaded successfully!');
    } catch (err) {
      toast.dismiss();
      toast.error('Failed to download PDF receipt. Please try again.');
    }
  };

  if (isLoading) return <PageSpinner />;
  if (error || !receipt) {
    return <ErrorState message="Failed to load receipt details" onRetry={refetch} />;
  }

  // Construct a QR code URL using the verification code / hash
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    receipt.verification_code || receipt.receipt_number || 'SaccoBridge'
  )}`;

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-white/80 backdrop-blur-lg border-b border-sand px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: '/activity' })}
            className="p-1 rounded-lg text-slate hover:bg-sand-light transition-colors"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold font-heading text-slate leading-tight">Receipt Detail</h1>
            <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mt-0.5">
              Ref: {receipt.receipt_number}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 max-w-sm mx-auto space-y-4">
        <Card className="border-sand bg-white shadow-subtle overflow-hidden relative">
          {/* Top Decorative bar */}
          <div className="h-2 bg-gradient-to-r from-terracotta to-clay w-full" />

          <CardHeader className="text-center pb-2 pt-6">
            <div className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-success/15 border border-success/20">
              <CheckCircle2 className="h-6 w-6 text-success animate-scale-up" />
            </div>
            <CardTitle className="text-lg font-bold font-heading text-slate-dark leading-none">
              Transaction Successful
            </CardTitle>
            <CardDescription className="text-xs text-gray-400 mt-1.5 font-medium">
              Thank you for using Sacco Bridge
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-xs font-medium text-slate">
            {/* Visual Receipt Divider */}
            <div className="border-t border-dashed border-sand/60 my-2" />

            {/* QR Code Section */}
            <div className="flex flex-col items-center justify-center py-4 bg-sand-light/10 border border-sand/40 rounded-2xl p-4 shadow-subtle">
              <img
                src={qrCodeUrl}
                alt="Verification QR Code"
                className="w-36 h-36 border border-sand rounded-xl p-1 bg-white"
              />
              <p className="text-[10px] text-gray-400 mt-2 font-normal">Scan to verify this transaction</p>
              <div className="flex items-center gap-1 mt-1 bg-sand/35 px-2 py-0.5 rounded-full text-[9px] font-bold text-slate/75">
                <ShieldCheck className="h-3 w-3 text-terracotta" />
                <span>Verified Hash: {receipt.verification_code?.slice(0, 12)}...</span>
              </div>
            </div>

            {/* Receipt Summary Grid */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-400">Transaction Type</span>
                <Badge className="bg-sand text-slate hover:bg-sand font-bold shadow-none">
                  {receipt.receipt_type_display || receipt.receipt_type}
                </Badge>
              </div>

              <div className="flex justify-between items-center py-1 border-t border-sand-light">
                <span className="text-gray-400">Party / SACCO</span>
                <span className="font-bold text-slate-dark text-right truncate max-w-[180px]">
                  {receipt.party_name}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-t border-sand-light">
                <span className="text-gray-400">Date & Time</span>
                <span className="font-semibold text-slate/85 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  {formatDate(receipt.generated_at)}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-t border-sand-light">
                <span className="text-gray-400">Receipt ID</span>
                <span className="font-bold text-slate font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {receipt.receipt_number}
                </span>
              </div>

              <div className="border-t border-dashed border-sand/65 my-3 pt-3" />

              <div className="flex justify-between items-center py-1">
                <span className="text-sm font-bold text-slate">Total Amount</span>
                <span className="text-lg font-extrabold text-terracotta font-numbers" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {formatKES(receipt.amount)}
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="pb-6 pt-2 px-4 flex flex-col gap-2">
            <Button
              onClick={handleDownload}
              className="w-full bg-terracotta hover:bg-clay text-white shadow-sm transition-all"
            >
              <Download className="h-4 w-4 mr-2" /> Download PDF Receipt
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/activity' })}
              className="w-full border-sand hover:bg-sand-light text-slate hover:text-terracotta transition-colors"
            >
              <FileText className="h-4 w-4 mr-2" /> View All Activity
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
