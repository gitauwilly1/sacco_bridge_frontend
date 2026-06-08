import { Outlet } from 'react-router-dom';
import Header from '@/components/layout/Header.jsx';
import BottomNav from '@/components/layout/BottomNav.jsx';

export default function AppShell() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FAFAF8' }}>
      <Header />
      <main className="flex-1 overflow-y-auto pb-20 safe-bottom">
        <div className="animate-fade-up">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}