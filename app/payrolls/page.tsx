"use client";

import { useEffect, useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import { exportToExcel } from '@/lib/exportUtils';

export default function PayrollsPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [form, setForm] = useState({ employeeId: 0, payPeriod: '', grossPay: 0, tax: 0, netPay: 0 });

  useEffect(() => { load(); }, []);
  async function load() {
    const [e, p] = await Promise.all([fetch('/api/employees'), fetch('/api/payrolls')]);
    if (e.ok) setEmployees(await e.json());
    if (p.ok) setPayrolls(await p.json());
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/payrolls', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { setForm({ employeeId: 0, payPeriod: '', grossPay: 0, tax: 0, netPay: 0 }); load(); }
  }

  return (
    <main>
      <div className="page-header">
        <h1>Payrolls</h1>
        <p className="page-description">Manage employee payroll records, track gross pay, tax deductions, and net pay for all compensation periods.</p>
        <button
          onClick={() => exportToExcel('payrolls')}
          style={{
            marginTop: '1rem',
            display: 'inline-flex',
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
          <FiDownload size={16} /> Export to Excel
        </button>
      </div>
      <div className="grid grid-2">
        <div className="card">
          <h2>Create payroll</h2>
          <form onSubmit={submit}>
            <label>Employee
              <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: Number(e.target.value) })} required>
                <option value={0} disabled>Select employee</option>
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
              </select>
            </label>
            <label>Pay period<input value={form.payPeriod} onChange={(e) => setForm({ ...form, payPeriod: e.target.value })} placeholder="April 1 - April 15" required/></label>
            <label>Gross pay<input type="number" step="0.01" value={form.grossPay} onChange={(e) => setForm({ ...form, grossPay: Number(e.target.value) })} required/></label>
            <label>Tax withheld<input type="number" step="0.01" value={form.tax} onChange={(e) => setForm({ ...form, tax: Number(e.target.value) })} required/></label>
            <label>Net pay<input type="number" step="0.01" value={form.netPay} onChange={(e) => setForm({ ...form, netPay: Number(e.target.value) })} required/></label>
            <button type="submit">Save payroll</button>
          </form>
        </div>

        <div className="card">
          <h2>Payroll records</h2>
          <table>
            <thead><tr><th>Employee</th><th>Period</th><th>Gross</th><th>Net</th></tr></thead>
            <tbody>{payrolls.map(p => (
              <tr key={p.id}><td>{p.employeeName}</td><td>{p.payPeriod}</td><td>${p.grossPay.toFixed(2)}</td><td>${p.netPay.toFixed(2)}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
