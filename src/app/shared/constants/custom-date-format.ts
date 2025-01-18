import { MatDateFormats } from '@angular/material/core';

export const CUSTOM_DATE_FORMAT: MatDateFormats = {
    parse: {
        dateInput: 'yyyy-MM-dd',
    },
    display: {
        dateInput: 'yyyy-MM-dd',
        monthYearLabel: 'MMM yyyy',
        dateA11yLabel: 'LL',
        monthYearA11yLabel: 'MMMM yyyy'
    }
}
