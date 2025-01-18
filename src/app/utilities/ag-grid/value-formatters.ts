import { Color } from "@shared/models/color";
import { SteelSpecification } from "@shared/models/steelSpecification";
import { CellClassParams, CellClassRules, ValueFormatterParams } from "ag-grid-enterprise";
import { DateTime } from "luxon";

const currencyFormatter = (params: ValueFormatterParams) => {
    const currencyValue = params.value;

    if (currencyValue === undefined || currencyValue === null) {
        return null;
    }

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(currencyValue);
}

const accountingCurrencyFormatter = (params: ValueFormatterParams) => {
    const currencyValue = params.value;

    if (currencyValue === undefined || currencyValue === null) {
        return null;
    }

    const formattedCurrency = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }) //
        .format(currencyValue);

    return currencyValue < 0 ? `(${formattedCurrency}) $` : `${formattedCurrency} $`;
}

// const currencyCellClass = (params: CellClassParams) => (params?.value < 0 ? ['text-right', 'text-red-500'] : 'text-right');

const numberCellClass = (params: CellClassParams): string[] => {
    const { value } = params;
    return value < 0 ? ['text-right', 'text-red-500'] : ['text-right'];
};

// const numberCellClass = (params: CellClassParams): string[] => {
//     const { value } = params;
//     return value < 0 ? ['text-right', 'text-red-500'] : ['text-right'];
// };

const weightFormatter = (params: ValueFormatterParams) => {
    const weightValue = params.value;

    if (weightValue === undefined || weightValue === null) {
        return null;
    }

    const formattedWeight = new Intl.NumberFormat('en-US', {
        style: 'decimal',
        maximumFractionDigits: 2,
    }).format(weightValue);

    return `${formattedWeight} KG`;
}

const widthFormatter = (params: ValueFormatterParams) => {
    const widthValue = params.value;

    if (widthValue === undefined || widthValue === null) {
        return null;
    }

    const formattedWeight = new Intl.NumberFormat('en-US', {
        style: 'decimal',
    }).format(widthValue);

    return `${formattedWeight} mm`;
}

const gaugeFormatter = (params: ValueFormatterParams) => {
    const gaugeValue = params.value;

    if (gaugeValue === undefined || gaugeValue === null) {
        return null;
    }

    return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        maximumFractionDigits: 2,
    }).format(gaugeValue);
}

const decimalFormatter = (params: ValueFormatterParams) => {
    const decimalValue = params.value;

    if (decimalValue === undefined || decimalValue === null) {
        return null;
    }

    return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        maximumFractionDigits: 2,
    }).format(decimalValue);
}

const listFormatter = (params: ValueFormatterParams) => {
    const listItems = params.value;

    if (listItems === undefined || listItems === null) {
        return null;
    }
    
    return new Intl.ListFormat('en', { style: 'long', type: 'conjunction' })
    .format(listItems);
}

const dateFromISOToMEDFormatter = (params: ValueFormatterParams): string => {
    return params.value ? DateTime.fromISO(params.value).toLocaleString(DateTime.DATE_MED) : '';
}

const dateFromJSToMEDFormatter = (params: ValueFormatterParams): string => {
    return params.value ? DateTime.fromJSDate(params.value).toLocaleString(DateTime.DATE_MED) : '';
}

const dateFromSQLToMEDFormatter = (params: ValueFormatterParams): string => {
    return params.value ? DateTime.fromSQL(params.value).toLocaleString(DateTime.DATE_MED) : '';
}

const agGridDateComparator  = (filterDate: Date, cellDateString?: string): -1 | 0 | 1  => {
    // console.log('filterLocalDateAtMidnight', filterDate);
    // console.log('cellDateString', cellDateString);
    if (!cellDateString) {
      return 0;
    }

    const cellDateTime: DateTime = DateTime.fromSQL(cellDateString).startOf('day');
    const filterDateTime: DateTime = DateTime.fromJSDate(filterDate).startOf('day');

    if (cellDateTime < filterDateTime) {
      return -1;
    }

    if (cellDateTime > filterDateTime) {
      return 1;
    }

    return 0;
  }

  const colorFormatter = (color: Color) => { 
    if (!color)return '';
    return
      color?.color?.toLowerCase() == color?.finish?.name.toLowerCase()
        ? color?.color
        : `${color?.color} ${color?.finish?.name}`;
  }

  const steelSpecificationFormatter = (steelSpecification: SteelSpecification) => { 
    if (!steelSpecification)return '';

    const color = steelSpecification?.color;
    const colorDetails =
    //   color?.color?.toLowerCase() == color?.finish?.name.toLowerCase()
    //     ? 
        color?.color
        // : `${color?.color} ${color?.finish?.name}`
        ;
    return `${colorDetails} ${steelSpecification?.width?.width}mm ${steelSpecification?.gauge?.gauge} - ${steelSpecification?.coating}`;
  }


export {
    currencyFormatter
    , accountingCurrencyFormatter
    , dateFromISOToMEDFormatter
    , dateFromJSToMEDFormatter
    , dateFromSQLToMEDFormatter
    , decimalFormatter
    , listFormatter
    , gaugeFormatter
    , numberCellClass
    , weightFormatter
    , widthFormatter
    , agGridDateComparator
    , steelSpecificationFormatter
};