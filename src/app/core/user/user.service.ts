import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User } from 'app/core/user/user.types';
import { UserGroup } from '@shared/enums/user-group';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private _user: BehaviorSubject<User> = new BehaviorSubject<User>(new User());

  set user(value: User) {
    console.log('Just set user');
    this._user.next(value);
  }

  get user$(): Observable<User> {
    return this._user.asObservable();
  }

  get(): Observable<User> {
    return this._user.asObservable();
  }

  getUser(): User {
    return this._user.getValue();
  }

  update(user: User): Observable<any> {
    this._user.next(user);
    return this.get();
  }

  get user(): User {
    return this.getUser();
  }

  get groups(): string[] | null {
    return this.user?.cognitoGroups;
  }

  get isSuperUser(): boolean {
    if (!this.user?.cognitoGroups) {
      return false;
    }
    const groupToCheck = UserGroup.superUserGroup.toLowerCase();
    return this.user.cognitoGroups.some((group) => group.toLowerCase() === groupToCheck);
  }

  get isManager(): boolean {
    if (!this.user?.cognitoGroups) {
      return false;
    }
    const groupToCheck = UserGroup.managersGroup.toLowerCase();
    return this.user.cognitoGroups.some((group) => group.toLowerCase() === groupToCheck);
  }

  get isDeveloper(): boolean {
    if (!this.user?.cognitoGroups) {
      return false;
    }
    const groupToCheck = UserGroup.opkiDevelopersGroup.toLowerCase();
    return this.user.cognitoGroups.some((group) => group.toLowerCase() === groupToCheck);
  }
}
