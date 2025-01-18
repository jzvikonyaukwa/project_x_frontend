import { NgIf } from "@angular/common";
import { Component, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { RouterOutlet } from "@angular/router";
import { FuseFullscreenComponent } from "@fuse/components/fullscreen";
import { FuseLoadingBarComponent } from "@fuse/components/loading-bar";
import {
  FuseHorizontalNavigationComponent,
  FuseNavigationService,
  FuseVerticalNavigationComponent,
} from "@fuse/components/navigation";
import { FuseMediaWatcherService } from "@fuse/services/media-watcher";
import { NavigationService } from "app/core/navigation/navigation.service";
import { Navigation } from "app/core/navigation/navigation.types";
import { LanguagesComponent } from "app/layout/common/languages/languages.component";
import { MessagesComponent } from "app/layout/common/messages/messages.component";
import { NotificationsComponent } from "app/layout/common/notifications/notifications.component";
import { QuickChatComponent } from "app/layout/common/quick-chat/quick-chat.component";
import { SearchComponent } from "app/layout/common/search/search.component";
import { ShortcutsComponent } from "app/layout/common/shortcuts/shortcuts.component";
import { UserComponent } from "app/layout/common/user/user.component";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: "modern-layout",
  templateUrl: "./modern.component.html",
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    FuseLoadingBarComponent,
    NgIf,
    FuseVerticalNavigationComponent,
    FuseHorizontalNavigationComponent,
    MatButtonModule,
    MatIconModule,
    LanguagesComponent,
    FuseFullscreenComponent,
    SearchComponent,
    ShortcutsComponent,
    MessagesComponent,
    NotificationsComponent,
    UserComponent,
    RouterOutlet,
    QuickChatComponent,
  ],
})
export class ModernLayoutComponent implements OnInit, OnDestroy {
  isScreenSmall: boolean;
  navigation: Navigation;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _navigationService: NavigationService,
    private _fuseMediaWatcherService: FuseMediaWatcherService,
    private _fuseNavigationService: FuseNavigationService,
  ) {}

  get currentYear(): number {
    return new Date().getFullYear();
  }

  ngOnInit(): void {
    // Subscribe to navigation data
    this._navigationService.navigation$
      .pipe(
        takeUntil(this._unsubscribeAll)
      )
      .subscribe((navigation: Navigation) => {
        this.navigation = navigation;
      });

    // Subscribe to media changes
    this._fuseMediaWatcherService.onMediaChange$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(({ matchingAliases }) => {
        // Check if the screen is small
        this.isScreenSmall = !matchingAliases.includes("md");
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  toggleNavigation(name: string): void {
    const navigation =
      this._fuseNavigationService.getComponent<FuseVerticalNavigationComponent>(
        name
      );

    if (navigation) {
      navigation.toggle();
    }
  }
}
