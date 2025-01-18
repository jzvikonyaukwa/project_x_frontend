export interface UserDTO {
    id?: number;
    name: string;
    notes: string;
    addresses: Address[];
    phones: Phone[];
    emails: Email[];
}

export interface BaseContact {
    id?: number;
    label: string;
    delete?: boolean;
}

export interface Email extends BaseContact {
    email: string;
}

export interface Name extends BaseContact {
    name: string;
}

export interface Phone extends BaseContact {
    phone: string;
}

export interface Address extends BaseContact {
    street: string;
    suburb: string;
    city: string;
    country: string;
}
