export const exportToExcel = async (type: 'employees' | 'shifts' | 'payrolls' | 'all') => {
  try {
    const response = await fetch(`/api/export?type=${type}`);
    if (!response.ok) throw new Error('Export failed');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-${type}-${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Export error:', error);
    alert('Failed to export data');
  }
};
