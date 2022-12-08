import format from 'date-fns/format';
import add from 'date-fns/add';

export const formatDate = (date: Date): string => {
    if (!date) return '';
    return format(date, 'yyyy-MM-dd');
}

export const addDays = (date: Date, days: number) => {
    if (!date) return;
    return add(date, { days });
}