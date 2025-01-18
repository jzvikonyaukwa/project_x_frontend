import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { Address, Email, Phone, UserDTO, Name } from './models/userDTO';

export interface UserForm {
    name: FormControl<UserDTO['name']>;
    notes: FormControl<UserDTO['notes']>;
    addresses: FormArray<FormGroup<AddressForm>>;
    phones: FormArray<FormGroup<PhoneForm>>;
    emails: FormArray<FormGroup<EmailForm>>;
}

export interface AddressForm {
    label: FormControl<Address['label']>;
    street: FormControl<Address['street']>;
    suburb: FormControl<Address['suburb']>;
    city: FormControl<Address['city']>;
    country: FormControl<Address['country']>;
}
export interface PhoneForm {
    label: FormControl<Phone['label']>;
    phone: FormControl<Phone['phone']>;
}
export interface EmailForm {
    label: FormControl<Email['label']>;
    email: FormControl<Email['email']>;
}
export interface NameForm {
    label: FormControl<Name['label']>;
    name: FormControl<Name['name']>;
}

export interface AddressEditForm extends AddressForm {
    id: FormControl<number | null>;
    delete?: FormControl<boolean>;
}

export interface PhoneEditForm extends PhoneForm {
    id: FormControl<number | null>;
    delete?: FormControl<boolean>;
}

export interface EmailEditForm extends EmailForm {
    id: FormControl<number | null>;
    delete?: FormControl<boolean>;
}
export interface NameEditForm extends NameForm {
    id: FormControl<number | null>;
    // delete?: FormControl<boolean>;
}
