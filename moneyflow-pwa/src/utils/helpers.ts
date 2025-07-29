
export function formatDate(dateString: string) {
    const dateObj = new Date(dateString);
    const month = dateObj.toLocaleString('default', { month: 'long' });
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${month} ${day}`;
}