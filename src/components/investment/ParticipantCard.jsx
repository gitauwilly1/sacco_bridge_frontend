import { User, Shield } from 'lucide-react';

export default function ParticipantCard({ name, role, isYou, verificationStatus }) {
  return (
    <div className="bg-white rounded-xl p-3 shadow-subtle text-center flex-1">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-terracotta-400 to-clay-600 flex items-center justify-center mx-auto mb-1">
        <User className="w-5 h-5 text-white" />
      </div>
      <p className="text-xs font-medium text-slate-700">
        {isYou ? 'You' : name || 'Participant'}
      </p>
      <p className="text-[10px] text-slate-400">{role}</p>
      {verificationStatus && (
        <div className="flex items-center justify-center gap-1 mt-1 text-success-600">
          <Shield className="w-3 h-3" />
          <span className="text-[10px]">{verificationStatus}</span>
        </div>
      )}
    </div>
  );
}