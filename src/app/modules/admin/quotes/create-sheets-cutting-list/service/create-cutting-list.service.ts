import { Injectable } from '@angular/core';
import { ProductType } from 'app/modules/admin/product-types/models/productType';

@Injectable({
  providedIn: 'root',
})
export class CreateCuttingListService {
  getCodeFromClientsName(clientsName: string): string | null {
    // Trim the input to remove leading/trailing whitespace
    const fullName = clientsName.trim();
    console.log('fullName: ', fullName);

    // Split the trimmed name by one or more whitespace characters
    const parts = fullName.split(/\s+/);

    let nameToUse: string;

    if (parts.length >= 2) {
      // Use the last part as the last name
      nameToUse = parts[parts.length - 1];
    } else if (parts.length === 1) {
      // Use the only part available
      nameToUse = parts[0];
    } else {
      console.log('Invalid name format');
      return null;
    }

    // Ensure the name has at least 3 characters
    if (nameToUse.length < 3) {
      console.log('Name is too short to extract 3 letters');
      return nameToUse.toUpperCase();
    }

    const firstThreeLetters = nameToUse.slice(0, 3).toUpperCase();
    console.log('firstThreeLetters: ', firstThreeLetters);
    return firstThreeLetters;
  }

  getFrameName(productType: string): string {
    let frameName: string = '';

    if (productType === 'Roof Purlin') {
      frameName = 'RP';
    } else if (productType === 'Ceiling Batten') {
      frameName = 'CP';
    } else {
      frameName = 'sheet';
    }

    return frameName;
  }

  getProductType(type: string, productTypes: ProductType[]): ProductType {
    if (type === 'Roof Sheeting') {
      return productTypes.find((pt) => pt.name === 'sheet');
    } else if (type === 'Roof Purlin') {
      return productTypes.find((pt) => pt.name === 'purlin');
    } else if (type === 'Ceiling Batten') {
      return productTypes.find((pt) => pt.name === 'batten');
    } else {
      return null;
    }
  }
}

export interface FormManufacturingInput {
  code: string;
  length: number;
  qty: number;
}
