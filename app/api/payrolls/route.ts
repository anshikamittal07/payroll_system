import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const payrolls = await prisma.payroll.findMany({
    orderBy: { createdAt: 'desc' },
    include: { employee: true },
  });

  const mapped = payrolls.map((payroll) => ({
    id: payroll.id,
    employeeId: payroll.employeeId,
    employeeName: `${payroll.employee.firstName} ${payroll.employee.lastName}`,
    payPeriod: payroll.payPeriod,
    grossPay: payroll.grossPay,
    tax: payroll.tax,
    netPay: payroll.netPay,
    createdAt: payroll.createdAt.toISOString(),
  }));

  return NextResponse.json(mapped);
}

export async function POST(request: Request) {
  const body = await request.json();

  const record = await prisma.payroll.create({
    data: {
      employeeId: Number(body.employeeId),
      payPeriod: body.payPeriod,
      grossPay: Number(body.grossPay) || 0,
      tax: Number(body.tax) || 0,
      netPay: Number(body.netPay) || 0,
    },
  });

  return NextResponse.json(record, { status: 201 });
}
