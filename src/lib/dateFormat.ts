export function formatDate(dateString: string): string {
  if (!dateString) return 'Unknown date';
  
  try {
    const date = new Date(dateString);
    
    // Handle invalid dates
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date';
  }
}