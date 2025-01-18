import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CreateCodeService {
  public getCodeFromClientsName(clientName: string): string | null {
    const fullName = clientName.trim(); // Remove any extra spaces
    console.log('fullName', fullName);
    const parts = fullName.split(' ');

    let nameToUse: string;

    if (parts.length >= 2) {
      // Use the last name if there are at least two parts
      nameToUse = parts[parts.length - 1];
    } else if (parts.length === 1) {
      // Use the first name if only one part is available
      nameToUse = parts[0];
    } else {
      console.log('Invalid name format');
      return null;
    }

    // Return the first three letters of the name to use
    const firstThreeLetters = nameToUse.slice(0, 3).toUpperCase();
    return firstThreeLetters;
  }
}
