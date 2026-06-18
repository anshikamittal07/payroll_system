'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { FiDownload } from 'react-icons/fi';
import { exportToExcel } from '@/lib/exportUtils';

type Employee = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  hourlyRate: number;
};

type Shift = {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
};

type Payroll = {
  id: number;
  employeeId: number;
  employeeName: string;
  payPeriod: string;
  grossPay: number;
  tax: number;
  netPay: number;
};

export default function HomePage() {
  const [counts, setCounts] = useState({ employees: 0, shifts: 0, payrolls: 0 });
  const [totals, setTotals] = useState({ gross: 0, tax: 0, net: 0 });
  const [employeeHours, setEmployeeHours] = useState<any[]>([]);
  const [payrollTrend, setPayrollTrend] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [eRes, sRes, pRes] = await Promise.all([
          fetch('/api/employees'),
          fetch('/api/shifts'),
          fetch('/api/payrolls'),
        ]);

        const employees: Employee[] = eRes.ok ? await eRes.json() : [];
        const shifts: Shift[] = sRes.ok ? await sRes.json() : [];
        const payrolls: Payroll[] = pRes.ok ? await pRes.json() : [];

        // Basic counts
        setCounts({
          employees: employees.length,
          shifts: shifts.length,
          payrolls: payrolls.length,
        });

        // Payroll totals
        const gross = payrolls.reduce((sum, r) => sum + r.grossPay, 0);
        const tax = payrolls.reduce((sum, r) => sum + r.tax, 0);
        const net = payrolls.reduce((sum, r) => sum + r.netPay, 0);
        setTotals({ gross, tax, net });

        // Employee hours data
        const hoursMap = new Map<string, number>();
        shifts.forEach(shift => {
          const name = shift.employeeName || 'Unknown';
          hoursMap.set(name, (hoursMap.get(name) || 0) + shift.hours);
        });
        const hoursData = Array.from(hoursMap.entries())
          .map(([name, hours]) => ({ name, hours: Math.round(hours * 100) / 100 }))
          .sort((a, b) => b.hours - a.hours)
          .slice(0, 10);
        setEmployeeHours(hoursData);

        // Payroll breakdown (pie chart)
        if (gross > 0) {
          setChartData([
            { name: 'Net Pay', value: net, color: '#22c55e' },
            { name: 'Tax', value: tax, color: '#ef4444' },
          ]);
        }

        // Payroll trend by period
        const trendMap = new Map<string, { period: string; gross: number; net: number }>();
        payrolls.forEach(p => {
          const existing = trendMap.get(p.payPeriod) || { period: p.payPeriod, gross: 0, net: 0 };
          existing.gross += p.grossPay;
          existing.net += p.netPay;
          trendMap.set(p.payPeriod, existing);
        });
        const trend = Array.from(trendMap.values()).sort((a, b) => a.period.localeCompare(b.period));
        setPayrollTrend(trend);

        setLoading(false);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="page-description">
          Get a quick overview of your payroll and roster system with key metrics and analytics. Navigate to specific sections using the sidebar for detailed management.
        </p>
      </div>

      {/* Key Metrics */}
      <section className="grid grid-3">
        <div className="card">
          <h2>Employees</h2>
          <p style={{ fontSize: '2.5rem', margin: '0.5rem 0', fontWeight: '700', color: '#0f766e' }}>{counts.employees}</p>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Total employees</p>
          <a href="/employees" style={{ marginTop: '0.75rem', display: 'inline-block', color: '#0f766e', textDecoration: 'none', fontWeight: '600' }}>
            Manage →
          </a>
        </div>
        <div className="card">
          <h2>Shifts</h2>
          <p style={{ fontSize: '2.5rem', margin: '0.5rem 0', fontWeight: '700', color: '#0f766e' }}>{counts.shifts}</p>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Scheduled shifts</p>
          <a href="/shifts" style={{ marginTop: '0.75rem', display: 'inline-block', color: '#0f766e', textDecoration: 'none', fontWeight: '600' }}>
            Manage →
          </a>
        </div>
        <div className="card">
          <h2>Payroll</h2>
          <p style={{ fontSize: '2.5rem', margin: '0.5rem 0', fontWeight: '700', color: '#0f766e' }}>₹{totals.net.toFixed(0)}</p>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Total net pay</p>
          <a href="/payrolls" style={{ marginTop: '0.75rem', display: 'inline-block', color: '#0f766e', textDecoration: 'none', fontWeight: '600' }}>
            Manage →
          </a>
        </div>
      </section>

      {/* Export Buttons */}
      <section className="card" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <h3 style={{ width: '100%', margin: '0 0 0.75rem 0' }}>Export Data</h3>
        <button
          onClick={() => exportToExcel('employees')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1rem',
            background: '#0f766e',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
          }}
        >
          <FiDownload size={16} /> Export Employees
        </button>
        <button
          onClick={() => exportToExcel('shifts')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1rem',
            background: '#0f766e',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
          }}
        >
          <FiDownload size={16} /> Export Shifts
        </button>
        <button
          onClick={() => exportToExcel('payrolls')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1rem',
            background: '#0f766e',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
          }}
        >
          <FiDownload size={16} /> Export Payrolls
        </button>
        <button
          onClick={() => exportToExcel('all')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1rem',
            background: '#22c55e',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: '600',
          }}
        >
          <FiDownload size={16} /> Export All
        </button>
      </section>

      {/* Analytics Charts */}
      {!loading && (
        <>
          {/* Payroll Summary */}
          <section className="grid grid-2">
            <div className="card">
              <h2>Payroll Summary</h2>
              <table style={{ width: '100%', marginTop: '1rem' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #d6f3ee' }}>Gross Pay</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #d6f3ee', textAlign: 'right', fontWeight: '600', color: '#0f766e' }}>₹{totals.gross.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #d6f3ee' }}>Tax</td>
                    <td style={{ padding: '0.75rem', borderBottom: '1px solid #d6f3ee', textAlign: 'right', fontWeight: '600', color: '#ef4444' }}>₹{totals.tax.toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem' }}>Net Pay</td>
                    <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: '600', color: '#22c55e' }}>₹{totals.net.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="card">
              <h2>Payroll Breakdown</h2>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) =>
                        `${name}: ₹${Number(value ?? 0).toFixed(0)}`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) =>
                        `₹${Number(value ?? 0).toFixed(2)}`
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>No payroll data available</p>
              )}
            </div>
          </section>

          {/* Employee Hours */}
          {employeeHours.length > 0 && (
            <section className="card">
              <h2>Employee Hours Worked (Top 10)</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={employeeHours}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d6f3ee" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip formatter={(value) => `${value} hours`} />
                  <Bar dataKey="hours" fill="#0f766e" />
                </BarChart>
              </ResponsiveContainer>
            </section>
          )}

          {/* Payroll Trend */}
          {payrollTrend.length > 0 && (
            <section className="card">
              <h2>Payroll Trend by Period</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={payrollTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#d6f3ee" />
                  <XAxis dataKey="period" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip
                    formatter={(value) =>
                      `₹${Number(value ?? 0).toFixed(2)}`
                    }
                  />
                  <Legend />
                  <Line type="monotone" dataKey="gross" stroke="#0f766e" strokeWidth={2} name="Gross Pay" />
                  <Line type="monotone" dataKey="net" stroke="#22c55e" strokeWidth={2} name="Net Pay" />
                </LineChart>
              </ResponsiveContainer>
            </section>
          )}
        </>
      )}
    </main>
  );
}

