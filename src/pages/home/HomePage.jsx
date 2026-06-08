import { useMode } from '@/contexts/ModeContext.jsx';
import ChamaDashboard from '@/pages/home/ChamaDashboard.jsx';
import InvestDashboard from '@/pages/home/InvestDashboard.jsx';

export default function HomePage() {
  const { isChamaMode } = useMode();

  return isChamaMode ? <ChamaDashboard /> : <InvestDashboard />;
}