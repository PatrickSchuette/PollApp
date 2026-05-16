/**
 * Calculates days left until a given date.
 * Returns null if no date is provided.
 * @param dateString End date in ISO format (YYYY-MM-DD).
 */
export function getDaysLeft(dateString: string | null | undefined): number | null {
    if (!dateString) return null;

    const [y, m, d] = dateString.split('-').map(Number);
    const end = new Date(y, m - 1, d, 23, 59, 59);
    const today = new Date();
    const diff = end.getTime() - today.getTime();

    return Math.floor(diff / (1000 * 60 * 60 * 24));
}
