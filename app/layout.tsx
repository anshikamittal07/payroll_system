'use client';
import { useState } from 'react';
import './globals.css';
import Link from 'next/link';
import { FiGrid, FiUsers, FiClock, FiDollarSign, FiCalendar, FiMenu, FiX } from 'react-icons/fi';

function LayoutClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          {sidebarOpen && <div className="brand">Payroll & Roster</div>}
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} title={sidebarOpen ? 'Collapse' : 'Expand'}>
            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
        {sidebarOpen && (
          <nav className="nav">
            <Link href="/">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <FiGrid /> Dashboard
              </span>
            </Link>
            <Link href="/employees">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <FiUsers /> Employees
              </span>
            </Link>
            <Link href="/shifts">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <FiClock /> Shifts
              </span>
            </Link>
            <Link href="/payrolls">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <FiDollarSign /> Payrolls
              </span>
            </Link>
            <Link href="/roster">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <FiCalendar /> Roster
              </span>
            </Link>
          </nav>
        )}
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
