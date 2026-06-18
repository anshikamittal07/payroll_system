"use client";

import { useEffect, useState } from 'react';
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

const emptyEmployee = { firstName: '', lastName: '', email: '', role: '', hourlyRate: 0 };

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState(emptyEmployee);
  const [message, setMessage] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch('/api/employees');
    if (res.ok) setEmployees(await res.json());
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/employees', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { setMessage('Saved'); setForm(emptyEmployee); load(); } else setMessage('Save failed');
  }

  return (
    <main>
      <div className="page-header">
        <h1>Employees</h1>
        <p className="page-description">Add and manage employee profiles, including personal details, contact information, and hourly rates for payroll calculations.</p>
        <button
          onClick={() => exportToExcel('employees')}
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
      {message && <div className="card" style={{ borderColor: '#a7f3d0', background: '#ecfdf5' }}>{message}</div>}
      <div className="grid grid-2">
        <div className="card">
          <h2>Add employee</h2>
          <form onSubmit={submit}>
            <label>First name<input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required/></label>
            <label>Last name<input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required/></label>
            <label>Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required/></label>
            <label>Role<input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required/></label>
            <label>Hourly rate<input type="number" step="0.01" value={form.hourlyRate} onChange={(e) => setForm({ ...form, hourlyRate: Number(e.target.value) })} required/></label>
            <button type="submit">Save</button>
          </form>
        </div>

        <div className="card">
          <h2>Employee list</h2>
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Rate</th></tr></thead>
            <tbody>{employees.map(e => (
              <tr key={e.id}><td>{e.firstName} {e.lastName}</td><td>{e.email}</td><td>{e.role}</td><td>${e.hourlyRate.toFixed(2)}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
