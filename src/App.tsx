/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { CommunityConnectPage } from './components/CommunityConnectPage.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';

export default function App() {
  const [currentView, setCurrentView] = useState<'connect' | 'admin'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      if (view === 'admin' || params.get('admin') === 'true') {
        return 'admin';
      }
    }
    return 'connect';
  });

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const view = params.get('view');
      if (view === 'admin') {
        setCurrentView('admin');
      } else {
        setCurrentView('connect');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const switchToConnect = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('view');
    url.searchParams.delete('admin');
    window.history.pushState({}, '', url.toString());
    setCurrentView('connect');
  };

  const switchToAdmin = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'admin');
    window.history.pushState({}, '', url.toString());
    setCurrentView('admin');
  };

  return (
    <div className="min-h-screen bg-[#faf6ee] font-sans text-[#2d2720]">
      {currentView === 'connect' ? (
        <CommunityConnectPage onOpenAdmin={switchToAdmin} />
      ) : (
        <div className="relative">
          {/* Quick return button in Admin top bar */}
          <div className="bg-[#090e18] border-b border-slate-800 px-4 py-2 flex items-center justify-between text-xs">
            <button
              onClick={switchToConnect}
              className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              ← Back to WhatsApp Community Connect Page
            </button>
            <span className="text-slate-400 font-medium">1,000 Keys & Access Administration</span>
          </div>
          <AdminDashboard onSwitchToGateway={switchToConnect} />
        </div>
      )}
    </div>
  );
}
