/**
 * Export Utilities
 * Functions to export data to CSV and JSON formats
 */

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV(data: any[], headers?: string[]): string {
  if (!data || data.length === 0) return '';

  // Get headers from first object if not provided
  const headerRow = headers || Object.keys(data[0]);
  
  // Create CSV rows
  const csvRows = [
    // Header row
    headerRow.join(','),
    // Data rows
    ...data.map(row => 
      headerRow.map(field => {
        const value = row[field];
        // Handle strings with commas, quotes, or newlines
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? '';
      }).join(',')
    )
  ];

  return csvRows.join('\n');
}

/**
 * Download data as CSV file
 */
export function downloadCSV(data: any[], filename: string, headers?: string[]): void {
  const csv = arrayToCSV(data, headers);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Download data as JSON file
 */
export function downloadJSON(data: any, filename: string): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

/**
 * Format date for filename
 */
export function getDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}_${hours}-${minutes}`;
}

/**
 * Export KPIs to CSV
 */
export function exportKPIsToCSV(kpis: any): void {
  const data = [
    { metric: 'Tổng người dùng', value: kpis.users.total },
    { metric: 'Người dùng mới (7 ngày)', value: kpis.users.newLast7Days },
    { metric: 'DAU', value: kpis.users.dau },
    { metric: 'WAU', value: kpis.users.wau },
    { metric: 'MAU', value: kpis.users.mau },
    { metric: 'Độ gắn kết (%)', value: kpis.users.stickiness },
    { metric: 'Tốc độ tăng trưởng người dùng (%)', value: kpis.users.growthRate },
    { metric: 'Tổng điểm đến', value: kpis.destinations.total },
    { metric: 'Điểm đến hoạt động', value: kpis.destinations.active },
    { metric: 'Tổng đánh giá', value: kpis.reviews.total },
    { metric: 'Đánh giá trung bình', value: kpis.reviews.averageRating.toFixed(2) },
    { metric: 'Tốc độ tăng trưởng đánh giá (%)', value: kpis.reviews.growthRate },
    { metric: 'Tổng lượt xem', value: kpis.engagement.totalViews },
    { metric: 'Tổng tìm kiếm', value: kpis.engagement.totalSearches },
    { metric: 'Tỷ lệ nhấp chuột (%)', value: kpis.engagement.ctr },
  ];

  const filename = `wayfinder-kpis_${getDateString()}.csv`;
  downloadCSV(data, filename, ['metric', 'value']);
}

/**
 * Export top destinations to CSV
 */
export function exportTopDestinationsToCSV(destinations: any[]): void {
  const data = destinations.map((dest, index) => ({
    rank: index + 1,
    name: dest.name,
    province: dest.province,
    type: dest.type,
    views: dest.views,
    rating: dest.rating.toFixed(1),
    reviewCount: dest.reviewCount,
  }));

  const filename = `wayfinder-top-destinations_${getDateString()}.csv`;
  downloadCSV(data, filename);
}

/**
 * Export user growth data to CSV
 */
export function exportUserGrowthToCSV(growthData: any[]): void {
  const data = growthData.map(item => ({
    date: item.date,
    newUsers: item.count,
  }));

  const filename = `wayfinder-user-growth_${getDateString()}.csv`;
  downloadCSV(data, filename);
}

/**
 * Export all analytics data to JSON
 */
export function exportAllAnalyticsToJSON(analyticsData: any): void {
  const filename = `wayfinder-analytics_${getDateString()}.json`;
  downloadJSON(analyticsData, filename);
}

