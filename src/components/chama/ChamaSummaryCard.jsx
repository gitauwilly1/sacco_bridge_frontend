import { Users, Wallet, Landmark, TrendingUp } from 'lucide-react';

export default function ChamaSummaryCard({ chama, userStanding }) {
  return (
    <div className="bg-gradient-to-br from-terracotta-500 to-clay-700 rounded-xl p-5 text-white shadow-terracotta">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading font-bold text-lg">{chama?.name || 'Chama'}</h3>
          <p className="text-sand-200 text-xs">
            {chama?.member_count || 0} members
          </p>
        </div>
        {userStanding !== undefined && (
          <div className="text-right">
            <div className="w-14 h-14 relative">
              <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="15" fill="none" stroke="white" strokeWidth="3"
                  strokeDasharray={`${userStanding * 94.2 / 100} 94.2`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                {userStanding}%
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/10 rounded-lg p-2.5">
          <Wallet className="w-4 h-4 text-sand-300 mb-1" />
          <p className="text-sand-200 text-xs">Total Savings</p>
          <p className="font-numbers font-semibold text-sm">
            KSh {parseInt(chama?.total_savings || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white/10 rounded-lg p-2.5">
          <Landmark className="w-4 h-4 text-sand-300 mb-1" />
          <p className="text-sand-200 text-xs">Outstanding Loans</p>
          <p className="font-numbers font-semibold text-sm">
            KSh {parseInt(chama?.outstanding_loans || 0).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}