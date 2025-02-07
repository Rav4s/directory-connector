import {
    ChangeDetectorRef,
    Component,
    NgZone,
    OnDestroy,
    OnInit,
} from '@angular/core';

import { ToasterService } from 'angular2-toaster';

import { BroadcasterService } from 'jslib/angular/services/broadcaster.service';

import { I18nService } from 'jslib/abstractions/i18n.service';
import { MessagingService } from 'jslib/abstractions/messaging.service';
import { PlatformUtilsService } from 'jslib/abstractions/platformUtils.service';

import { ConfigurationService } from '../../services/configuration.service';

const BroadcasterSubscriptionId = 'MoreComponent';

@Component({
    selector: 'app-more',
    templateUrl: 'more.component.html',
})
export class MoreComponent implements OnInit {
    version: string;
    year: string;
    checkingForUpdate = false;

    constructor(private platformUtilsService: PlatformUtilsService, private i18nService: I18nService,
        private messagingService: MessagingService, private configurationService: ConfigurationService,
        private toasterService: ToasterService, private broadcasterService: BroadcasterService,
        private ngZone: NgZone, private changeDetectorRef: ChangeDetectorRef) { }

    async ngOnInit() {
        this.broadcasterService.subscribe(BroadcasterSubscriptionId, async (message: any) => {
            this.ngZone.run(async () => {
                switch (message.command) {
                    case 'checkingForUpdate':
                        this.checkingForUpdate = true;
                        break;
                    case 'doneCheckingForUpdate':
                        this.checkingForUpdate = false;
                        break;
                    default:
                        break;
                }

                this.changeDetectorRef.detectChanges();
            });
        });

        this.year = new Date().getFullYear().toString();
        this.version = await this.platformUtilsService.getApplicationVersion();
    }

    ngOnDestroy() {
        this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
    }

    update() {
        this.messagingService.send('checkForUpdate');
    }

    async logOut() {
        const confirmed = await this.platformUtilsService.showDialog(
            this.i18nService.t('logOutConfirmation'), this.i18nService.t('logOut'),
            this.i18nService.t('yes'), this.i18nService.t('cancel'));
        if (confirmed) {
            this.messagingService.send('logout');
        }
    }

    async clearCache() {
        await this.configurationService.clearStatefulSettings(true);
        this.toasterService.popAsync('success', null, this.i18nService.t('syncCacheCleared'));
    }
}
