"use client";

import { useEffect, useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import { exportToExcel } from '@/lib/exportUtils';

type Shift = {
  id: number; employeeId: number; employeeName: string; date: string; startTime: string; endTime: string; hours: number; notes?: string;
};

export default function ShiftsPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [form, setForm] = useState({ employeeId: 0, date: '', startTime: '', endTime: '', hours: 0, notes: '' });

  useEffect(() => { load(); }, []);
  async function load() {
    const [e, s] = await Promise.all([fetch('/api/employees'), fetch('/api/shifts')]);
    if (e.ok) setEmployees(await e.json());
    if (s.ok) setShifts(await s.json());
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/shifts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if (res.ok) { setForm({ employeeId: 0, date: '', startTime: '', endTime: '', hours: 0, notes: '' }); load(); }
  }

  return (
    <main>
      <div className="page-header">
        <h1>Shifts</h1>
        <p className="page-description">Record employee shift details including dates, times, and hours worked. This data is used for payroll calculations and roster planning.</p>
        <button
          onClick={() => exportToExcel('shifts')}
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
          <h2>Record shift</h2>
          <form onSubmit={submit}>
            <label>Employee
              <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: Number(e.target.value) })} required>
                <option value={0} disabled>Select employee</option>
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
              </select>
            </label>
            <label>Date<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required/></label>
            <label>Start time<input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required/></label>
            <label>End time<input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required/></label>
            <label>Hours<input type="number" step="0.25" value={form.hours} onChange={(e) => setForm({ ...form, hours: Number(e.target.value) })} required/></label>
            <label>Notes<textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}></textarea></label>
            <button type="submit">Save shift</button>
          </form>
        </div>

        <div className="card">
          <h2>Shift list</h2>
          <table>
            <thead><tr><th>Date</th><th>Employee</th><th>Time</th><th>Hours</th></tr></thead>
            <tbody>{shifts.map(s => (
              <tr key={s.id}><td>{new Date(s.date).toLocaleDateString()}</td><td>{s.employeeName}</td><td>{s.startTime} - {s.endTime}</td><td>{s.hours}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
