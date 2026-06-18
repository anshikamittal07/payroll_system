import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import ExcelJS from 'exceljs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'employees', 'shifts', 'payrolls'

  try {
    const workbook = new ExcelJS.Workbook();

    if (type === 'employees' || type === 'all') {
      const employees = await prisma.employee.findMany();
      const sheet = workbook.addWorksheet('Employees');
      sheet.columns = [
        { header: 'ID', key: 'id', width: 8 },
        { header: 'First Name', key: 'firstName', width: 15 },
        { header: 'Last Name', key: 'lastName', width: 15 },
        { header: 'Email', key: 'email', width: 25 },
        { header: 'Role', key: 'role', width: 15 },
        { header: 'Hourly Rate', key: 'hourlyRate', width: 12 },
      ];
      employees.forEach(emp => {
        sheet.addRow(emp);
      });
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0f766e' } };
    }

    if (type === 'shifts' || type === 'all') {
      const shifts = await prisma.shift.findMany({ include: { employee: true } });
      const sheet = workbook.addWorksheet('Shifts');
      sheet.columns = [
        { header: 'ID', key: 'id', width: 8 },
        { header: 'Employee', key: 'employee', width: 20 },
        { header: 'Date', key: 'date', width: 12 },
        { header: 'Start Time', key: 'startTime', width: 12 },
        { header: 'End Time', key: 'endTime', width: 12 },
        { header: 'Hours', key: 'hours', width: 10 },
        { header: 'Notes', key: 'notes', width: 25 },
      ];
      shifts.forEach(shift => {
        sheet.addRow({
          id: shift.id,
          employee: `${shift.employee.firstName} ${shift.employee.lastName}`,
          date: shift.date.toISOString().split('T')[0],
          startTime: shift.startTime,
          endTime: shift.endTime,
          hours: shift.hours,
          notes: shift.notes || '',
        });
      });
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0f766e' } };
    }

    if (type === 'payrolls' || type === 'all') {
      const payrolls = await prisma.payroll.findMany({ include: { employee: true } });
      const sheet = workbook.addWorksheet('Payrolls');
      sheet.columns = [
        { header: 'ID', key: 'id', width: 8 },
        { header: 'Employee', key: 'employee', width: 20 },
        { header: 'Pay Period', key: 'payPeriod', width: 15 },
        { header: 'Gross Pay', key: 'grossPay', width: 12 },
        { header: 'Tax', key: 'tax', width: 12 },
        { header: 'Net Pay', key: 'netPay', width: 12 },
      ];
      payrolls.forEach(payroll => {
        sheet.addRow({
          id: payroll.id,
          employee: `${payroll.employee.firstName} ${payroll.employee.lastName}`,
          payPeriod: payroll.payPeriod,
          grossPay: payroll.grossPay,
          tax: payroll.tax,
          netPay: payroll.netPay,
        });
      });
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
      sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0f766e' } };
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `export-${type}-${new Date().toISOString().split('T')[0]}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
