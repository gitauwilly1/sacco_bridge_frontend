import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';

export default function ChamaSettingsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="px-4 py-4 space-y-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <h2 className="text-lg font-heading font-semibold text-slate-800">Chama Settings</h2>

      <div className="bg-white rounded-xl p-6 shadow-subtle space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Contribution Amount (KSh)</label>
          <input type="number" className="w-full px-3 py-2 bg-white border border-sand-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-terracotta-300" placeholder="1000" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Contribution Frequency</label>
          <select className="w-full px-3 py-2 bg-white border border-sand-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-terracotta-300">
            <option>Weekly</option>
            <option>Monthly</option>
            <option>Bi-Weekly</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Loan Interest Rate (%)</label>
          <input type="number" className="w-full px-3 py-2 bg-white border border-sand-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-terracotta-300" placeholder="10" />
        </div>
        <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-terracotta-500 to-clay-600 text-white font-medium rounded-lg shadow-terracotta">
          <Save className="w-4 h-4" /> Save Settings
        </button>
      </div>
    </div>
  );
}