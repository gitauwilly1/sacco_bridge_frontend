import { Outlet } from 'react-router-dom';
import Header from '@/components/layout/Header';
import BottomNav from '@/components/layout/BottomNav';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-white-warm flex flex-col">
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