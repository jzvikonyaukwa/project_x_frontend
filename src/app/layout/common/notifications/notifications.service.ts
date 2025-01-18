import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '@environments/environment';
import { Notification } from 'app/layout/common/notifications/notifications.types';
import { map, Observable, ReplaySubject, switchMap, take, tap, timeout } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private _notifications: ReplaySubject<Notification[]> = new ReplaySubject<Notification[]>(1);
  private readonly _httpClient = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  /**
   * Constructor
   */
  constructor() {}

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Getter for notifications
   */
  get notifications$(): Observable<Notification[]> {
    return this._notifications.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get all notifications
   */
  getAll(): Observable<Notification[]> {
    return this._httpClient.get<Notification[]>(`${this.baseUrl}common/notifications`).pipe(
      timeout(environment.DEFAULT_HTTP_TIMEOUT),
      tap((notifications) => {
        this._notifications.next(notifications);
      }),
    );
  }

  /**
   * Create a notification
   *
   * @param notification
   */
  create(notification: Notification): Observable<Notification> {
    return this.notifications$.pipe(
      take(1),
      switchMap((notifications) =>
        this._httpClient
          .post<Notification>(`${this.baseUrl}common/notifications`, { notification })
          .pipe(
            timeout(environment.DEFAULT_HTTP_TIMEOUT),
            map((newNotification) => {
              // Update the notifications with the new notification
              this._notifications.next([...notifications, newNotification]);

              // Return the new notification from observable
              return newNotification;
            }),
          ),
      ),
    );
  }

  /**
   * Update the notification
   *
   * @param id
   * @param notification
   */
  update(id: string, notification: Notification): Observable<Notification> {
    return this.notifications$.pipe(
      take(1),
      switchMap((notifications) =>
        this._httpClient
          .patch<Notification>(`${this.baseUrl}common/notifications`, {
            id,
            notification,
          })
          .pipe(
            timeout(environment.DEFAULT_HTTP_TIMEOUT),
            map((updatedNotification: Notification) => {
              // Find the index of the updated notification
              const index = notifications.findIndex((item) => item.id === id);

              // Update the notification
              notifications[index] = updatedNotification;

              // Update the notifications
              this._notifications.next(notifications);

              // Return the updated notification
              return updatedNotification;
            }),
          ),
      ),
    );
  }

  /**
   * Delete the notification
   *
   * @param id
   */
  delete(id: string): Observable<boolean> {
    return this.notifications$.pipe(
      take(1),
      switchMap((notifications) =>
        this._httpClient
          .delete<boolean>(`${this.baseUrl}common/notifications`, { params: { id } })
          .pipe(
            timeout(environment.DEFAULT_HTTP_TIMEOUT),
            map((isDeleted: boolean) => {
              // Find the index of the deleted notification
              const index = notifications.findIndex((item) => item.id === id);

              // Delete the notification
              notifications.splice(index, 1);

              // Update the notifications
              this._notifications.next(notifications);

              // Return the deleted status
              return isDeleted;
            }),
          ),
      ),
    );
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<boolean> {
    return this.notifications$.pipe(
      take(1),
      switchMap((notifications) =>
        this._httpClient.get<boolean>(`${this.baseUrl}common/notifications/mark-all-as-read`).pipe(
          timeout(environment.DEFAULT_HTTP_TIMEOUT),
          map((isUpdated: boolean) => {
            // Go through all notifications and set them as read
            notifications.forEach((notification, index) => {
              notifications[index].read = true;
            });

            // Update the notifications
            this._notifications.next(notifications);

            // Return the updated status
            return isUpdated;
          }),
        ),
      ),
    );
  }
}
