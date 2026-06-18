import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const shifts = await prisma.shift.findMany({
    orderBy: { createdAt: 'desc' },
    include: { employee: true },
  });

  const mapped = shifts.map((shift) => ({
    id: shift.id,
    employeeId: shift.employeeId,
    employeeName: `${shift.employee.firstName} ${shift.employee.lastName}`,
    date: shift.date.toISOString(),
    startTime: shift.startTime,
    endTime: shift.endTime,
    hours: shift.hours,
    notes: shift.notes,
    createdAt: shift.createdAt.toISOString(),
  }));

  return NextResponse.json(mapped);
}

export async function POST(request: Request) {
  const body = await request.json();

  const record = await prisma.shift.create({
    data: {
      employeeId: Number(body.employeeId),
      date: new Date(body.date),
      startTime: body.startTime,
      endTime: body.endTime,
      hours: Number(body.hours) || 0,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(record, { status: 201 });
}

export async function PUT(request: Request) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const id = Number(body.id);
  const data: any = {};
  if (body.date) data.date = new Date(body.date);
  if (body.startTime !== undefined) data.startTime = body.startTime;
  if (body.endTime !== undefined) data.endTime = body.endTime;
  if (body.hours !== undefined) data.hours = Number(body.hours);
  if (body.notes !== undefined) data.notes = body.notes;

  const record = await prisma.shift.update({ where: { id }, data });
  return NextResponse.json(record);
}

export async function DELETE(request: Request) {
  const body = await request.json();
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const id = Number(body.id);
  const record = await prisma.shift.delete({ where: { id } });
  return NextResponse.json(record);
}
