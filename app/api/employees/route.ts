import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const employees = await prisma.employee.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(employees);
}

export async function POST(request: Request) {
  const body = await request.json();

  const record = await prisma.employee.create({
    data: {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      role: body.role,
      hourlyRate: Number(body.hourlyRate) || 0,
    },
  });

  return NextResponse.json(record, { status: 201 });
}
