import { FileText } from 'lucide-react';

export default function ReceiptPreview({ receipt }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-subtle border-2 border-sand-200">
      <div className="text-center mb-6">
        <h2 className="font-heading font-bold text-slate-800 text-lg">SACCO BRIDGE</h2>
        <p className="text-xs text-slate-500 mt-1">Receipt: {receipt.receipt_number}</p>
        <p className="text-sm font-heading font-semibold text-terracotta-600 mt-3">
          {receipt.receipt_type_display || receipt.receipt_type}
        </p>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between py-2 border-b border-sand-100">
          <span className="text-slate-500">Date</span>
          <span className="text-slate-800">{new Date(receipt.generated_at).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-sand-100">
          <span className="text-slate-500">Amount</span>
          <span className="font-numbers font-bold text-slate-800">KSh {parseInt(receipt.amount || 0).toLocaleString()}</span>
        </div>
        <div className="flex justify-between py-2 border-b border-sand-100">
          <span className="text-slate-500">Description</span>
          <span className="text-slate-800 text-right max-w-[60%]">{receipt.description}</span>
        </div>
        <div className="flex justify-between py-2">
          <span className="text-slate-500">Party</span>
          <span className="text-slate-800">{receipt.party_name}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-sand-100 text-center">
        <p className="text-xs text-slate-400">
          Verification: {receipt.verification_code?.slice(0, 16)}
        </p>
      </div>
    </div>
  );
}