import { inject, Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
} from '@angular/router';
import { forkJoin } from 'rxjs';
import { MessagesService } from '@layout/common/messages/messages.service';
import { NavigationService } from 'app/core/navigation/navigation.service';
import { NotificationsService } from '@layout/common/notifications/notifications.service';
import { QuickChatService } from '@layout/common/quick-chat/quick-chat.service';
import { ShortcutsService } from '@layout/common/shortcuts/shortcuts.service';
import { ResolveFn } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class InitialDataResolver {

    private readonly _messagesService = inject(MessagesService);
    private readonly _navigationService = inject(NavigationService);
    private readonly _notificationsService = inject(NotificationsService);
    private readonly _quickChatService = inject(QuickChatService);
    private readonly _shortcutsService = inject(ShortcutsService);

    resolve: ResolveFn<any> = (
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ) => {
        return forkJoin([
            this._navigationService.get(),
            this._messagesService.getAll(),
            this._notificationsService.getAll(),
            this._quickChatService.getChats(),
            this._shortcutsService.getAll(),
        ]);
    }
}
