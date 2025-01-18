import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject, tap } from 'rxjs';
import { Navigation } from 'app/core/navigation/navigation.types';

@Injectable({
    providedIn: 'root',
})
export class NavigationService {
    private navigation: ReplaySubject<Navigation> =
        new ReplaySubject<Navigation>(1);

    constructor(private _httpClient: HttpClient) {}

    get navigation$(): Observable<Navigation> {
        return this.navigation.asObservable();
    }
    get(): Observable<Navigation> {
        return this._httpClient.get<Navigation>('api/common/navigation').pipe(
            tap((navigation) => {
                this.navigation.next(navigation);
            })
        );
    }
}
