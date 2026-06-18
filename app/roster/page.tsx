"use client";

import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { FiTrash2 } from 'react-icons/fi';

type Shift = {
  id: number;
  employeeId: number;
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  notes?: string;
};

type SelectedRange = {
  start: Date;
  end: Date | null;
  startStr: string;
  endStr: string | null;
};

export default function RosterPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedRange, setSelectedRange] = useState<SelectedRange | null>(null);
  const [newShiftEmployee, setNewShiftEmployee] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [error, setError] = useState('');

  const formatTime = (d: Date): string => {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const dateOnly = (d: Date): string => d.toISOString().split('T')[0];

  const hoursBetween = (s: Date, e: Date): number => {
    const diff = e.getTime() - s.getTime();
    return Math.round((diff / (1000 * 60 * 60)) * 100) / 100;
  };

  const load = async () => {
    try {
      const [shiftRes, empRes] = await Promise.all([
        fetch('/api/shifts'),
        fetch('/api/employees'),
      ]);

      if (shiftRes.ok) {
        const data: Shift[] = await shiftRes.json();
        const ev = data.map((s) => {
          // Extract date part from ISO string if present
          const datePart = s.date.includes('T') ? s.date.split('T')[0] : s.date;
          const start = `${datePart}T${s.startTime}`;
          const end = `${datePart}T${s.endTime}`;
          return {
            id: String(s.id),
            title: `${s.employeeName} (${s.hours}h)`,
            start,
            end,
            extendedProps: { notes: s.notes, shiftId: s.id, employeeId: s.employeeId },
            backgroundColor: '#0f766e',
            borderColor: '#067d73',
          };
        });
        setEvents(ev);
      }

      if (empRes.ok) {
        const empData = await empRes.json();
        setEmployees(empData);
      }
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (selectedRange && employees.length && newShiftEmployee === null) {
      setNewShiftEmployee(employees[0].id);
    }
  }, [employees, selectedRange, newShiftEmployee]);

  const handleSelect = (selection: any) => {
    const start = selection.start as Date;
    const end = (selection.end as Date) || new Date(start.getTime() + 60 * 60 * 1000);
    setSelectedRange({ start, end, startStr: selection.startStr, endStr: selection.endStr || null });
    setNotes('');
    setNewShiftEmployee(employees.length > 0 ? employees[0].id : null);
    setError('');
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedRange || newShiftEmployee === null) {
      setError('Please select employee');
      return;
    }

    const start = selectedRange.start;
    const end = selectedRange.end || new Date(start.getTime() + 60 * 60 * 1000);

    const payload = {
      employeeId: newShiftEmployee,
      date: dateOnly(start),
      startTime: formatTime(start),
      endTime: formatTime(end),
      hours: hoursBetween(start, end),
      notes: notes || null,
    };

    try {
      const res = await fetch('/api/shifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSelectedRange(null);
        setNotes('');
        setNewShiftEmployee(null);
        setError('');
        await load();
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Create failed');
      }
    } catch (err) {
      setError('Failed to create shift');
      console.error(err);
    }
  };

  const handleEventDrop = async (info: any) => {
    const ev = info.event;
    const id = ev.id;
    const start: Date = ev.start as Date;
    const end: Date = ev.end as Date;

    const payload = {
      id: Number(id),
      date: dateOnly(start),
      startTime: formatTime(start),
      endTime: formatTime(end),
      hours: hoursBetween(start, end),
    };

    try {
      const res = await fetch('/api/shifts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        alert('Update failed');
        await load();
      } else {
        await load();
      }
    } catch (err) {
      alert('Failed to update shift');
      console.error(err);
    }
  };

  const handleEventClick = (info: any) => {
    setSelectedEvent(info.event);
  };

  const handleDeleteShift = async () => {
    if (!selectedEvent) return;
    if (!window.confirm('Are you sure you want to delete this shift?')) return;

    try {
      const res = await fetch('/api/shifts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: Number(selectedEvent.id) }),
      });

      if (res.ok) {
        setSelectedEvent(null);
        await load();
      } else {
        alert('Delete failed');
      }
    } catch (err) {
      alert('Failed to delete shift');
      console.error(err);
    }
  };

  return (
    <main>
      <div className="page-header">
        <h1>Roster</h1>
        <p className="page-description">
          View and manage your employee schedule in a visual calendar format. Select time ranges to create shifts,
          drag events to reschedule, or click events to delete them.
        </p>
      </div>

      <div className="card" style={{ position: 'relative' }}>
        {selectedEvent && (
          <div
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: '#fff',
              border: '1px solid #d6f3ee',
              borderRadius: '0.75rem',
              padding: '1rem',
              zIndex: 1000,
              boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
              minWidth: '250px',
            }}
          >
            <div style={{ marginBottom: '0.75rem' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: '#0f3d3a' }}>
                {selectedEvent.title}
              </h4>
              <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#475569' }}>
                <strong>Time:</strong> {formatTime(selectedEvent.start)} - {formatTime(selectedEvent.end)}
              </p>
              {selectedEvent.extendedProps?.notes && (
                <p style={{ margin: '0.25rem 0', fontSize: '0.9rem', color: '#475569' }}>
                  <strong>Notes:</strong> {selectedEvent.extendedProps.notes}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleDeleteShift}
                style={{
                  flex: 1,
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                }}
              >
                <FiTrash2 size={16} /> Delete
              </button>
              <button
                onClick={() => setSelectedEvent(null)}
                style={{
                  flex: 1,
                  background: '#e2e8f0',
                  color: '#0f3d3a',
                  border: 'none',
                  padding: '0.5rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          events={events}
          nowIndicator
          allDaySlot={false}
          height={650}
          selectable={true}
          select={handleSelect}
          editable={true}
          eventDrop={handleEventDrop}
          eventClick={handleEventClick}
        />

        {selectedRange && (
          <div
            className="create-shift-panel card"
            style={{ position: 'absolute', top: 16, right: 16, width: 340, maxWidth: 'calc(100vw - 32px)' }}
          >
            <h3>Create shift</h3>
            {error && (
              <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                {error}
              </div>
            )}
            <p className="field-note">
              <strong>From:</strong> {dateOnly(selectedRange.start)} {formatTime(selectedRange.start)}
            </p>
            <p className="field-note">
              <strong>To:</strong> {dateOnly(selectedRange.end ?? selectedRange.start)}{' '}
              {formatTime(selectedRange.end ?? new Date(selectedRange.start.getTime() + 60 * 60 * 1000))}
            </p>
            <form onSubmit={handleCreate}>
              <label>
                Employee
                <select
                  value={newShiftEmployee ?? 0}
                  onChange={(e) => setNewShiftEmployee(Number(e.target.value))}
                  required
                >
                  <option value={0} disabled>
                    Select employee
                  </option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Notes
                <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
              </label>
              <div className="button-row">
                <button type="submit">Create shift</button>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => {
                    setSelectedRange(null);
                    setError('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}

