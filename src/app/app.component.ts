import { Router, ActivatedRoute, NavigationEnd, ActivationEnd } from '@angular/router';
import { Component, OnInit, OnDestroy, NgZone, Injector, Optional } from '@angular/core';
import { debounceTime, filter, map } from 'rxjs/operators';
import { isAndroid, AndroidApplication, AndroidActivityBackPressedEventData, Application, Trace, Connectivity, ApplicationEventData, AndroidActivityBundleEventData, AndroidActivityResultEventData } from '@nativescript/core';
import { Angulartics2 } from 'angulartics2';
import { localize } from '@nativescript/localize';
import { RouterExtensions } from '@nativescript/angular';
import Theme from '@nativescript/theme';
import { HttpClient } from '@angular/common/http';

/*
import * as Sentry from '@nativescript-community/sentry';
import { getAppId, getBuildNumber, getVersionName } from 'nativescript-extendedinfo';
*/
/**
 * Main component of Application.
 *
 * The moduleId was necessary to allow using the filename-only version of template and have it work
 * both for webpack builds and test runs
 */
@Component({
    moduleId: module.id,
    selector: 'ns-app',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

    public isBusy = false;
    public isAppInitialized = false;
    public isFirebaseInitialized = false;
    public isAppComponentLoaded = false;
    private prevConnectionType: number = Connectivity.connectionType.none;

    constructor(
        public router: Router,
        public routerExtension: RouterExtensions,
        public activatedRoute: ActivatedRoute,
        public angulartics: Angulartics2,
        private http: HttpClient,
        private ngZone: NgZone,
        private injector: Injector
    ) {
    }

    public ngOnInit() {
        // Inject AutoLoginService after all modules are loaded


        this.ngZone.run(async () => {
            try {
                // Run the main app init
                await this.initApp();
                Trace.write('[AppComponent] App init done', Trace.categories.Debug);
            }
            catch(e) {
                // Trace.write('[AppComponent] App init failed '+getErrorMessage(e), Trace.categories.Error);
            }
        });


    }

    ngOnDestroy() {
        // https://github.com/NativeScript/nativescript-angular/issues/1887
        Trace.write('[AppComponent] ngOnDestroy called', Trace.categories.Debug);
        if (isAndroid) {
            Application.android.off(Application.android.activityBackPressedEvent, this.handleBackButton);
        }
    }

    /**
     * Main application initialization method
     */
    public async initApp() {
        // Start by checking trace levels and enable based on config
 
        Trace.enable();
 

        // Application events
        Application.on(Application.launchEvent, (args: ApplicationEventData) => {
            Trace.write('[AppComponent] - onInit - App launch event', Trace.categories.Debug);
            if (args.android) {
                // For Android applications, args.android is an android.content.Intent class.
                Trace.write('[AppComponent] Launched Android application with the following intent: ' + args.android + '.', Trace.categories.Debug);
            } else if (args.ios !== undefined) {
                // For iOS applications, args.ios is NSDictionary (launchOptions).
                Trace.write('[AppComponent] Launched iOS application with options: ' + args.ios, Trace.categories.Debug);
            }
        });

        Application.on(Application.suspendEvent, (args: ApplicationEventData) => {
            if (args.android) {
                // For Android applications, args.android is an android activity class.
                Trace.write('[AppComponent] - onInit - suspendEvent - Activity: ' + args.android, Trace.categories.Debug);
            } else if (args.ios) {
                // For iOS applications, args.ios is UIApplication.
                Trace.write('app.component onInit - suspendEvent - UIApplication: ' + args.ios, Trace.categories.Debug);
            }
        });

        Application.on(Application.resumeEvent, (args: ApplicationEventData) => {
            Trace.write('[AppComponent] - onInit - App resume event', Trace.categories.Debug);
        });

        // New in NS 5.1: Handle discarded error events
        Application.on(Application.discardedErrorEvent, function (error: any) {
            console.log(error.message);
            console.log(error.stackTrace);
            console.log(error.nativeException);
            Trace.write('[AppComponent] - NS Application error: ' +  error.message, Trace.categories.Error);
            /*
            firebase.sendCrashLog({
                message: 'NS Application error: ' + error,
                showInConsole: true
            });
            */
        });

        Application.on(Application.exitEvent, (args: ApplicationEventData) => {
            if (args.android) {
                // For Android applications, args.android is an android activity class.
                Trace.write('[AppComponent] - onInit - exitEvent - Activity: ' + args.android, Trace.categories.Debug);
            } else if (args.ios) {
                // For iOS applications, args.ios is UIApplication.
                Trace.write('[AppComponent] - onInit - exitEvent - UIApplication: ' + args.ios, Trace.categories.Debug);
            }
        });

  
        this.http.get('https://nativescript-http-integration-check.local', { responseType: 'json' })
            .toPromise()
            .then((res: any) => {
                // Check if the response contains the expected property
                if (res && res.SelfCheck && res.SelfCheck === 'OK!') {
                    Trace.write('AppStart - nativescript-http automatic integration check successful!', Trace.categories.Debug);
                } else {
                    Trace.write('AppStart - nativescript-http automatic integration failed! Request to https://nativescript-http-integration-check.local failed: ' + JSON.stringify(res), Trace.categories.Error);
                }
            })
            .catch((e) => {
                Trace.write('AppStart - nativescript-http automatic integration failed! Request to https://nativescript-http-integration-check.local failed: ' + e, Trace.categories.Error);
            });

        // Start monitoring connectivity and output state changes through the notification service
        Connectivity.startMonitoring(connectionType => {
            if (connectionType !== Connectivity.connectionType.none) {
                if (this.prevConnectionType !== connectionType) {
                    this.prevConnectionType = connectionType;
                    Trace.write('[AppComponent] - Network connectivity monitor state set to  ' +  connectionType, Trace.categories.Debug);
                }
            }
            else {
                Trace.write('[AppComponent] - Network connectivity monitor - no network, state set to  ' +  connectionType, Trace.categories.Debug);
            }
        });
        /*
        this.router.events.pipe(filter((event) => event instanceof ActivationEnd))
           .subscribe((event: ActivationEnd) => {
               let sName = event.snapshot.data.id;
               if (sName) {
                analytics.setScreenName({
                    screenName: sName
                });
               }
        });
        */
        // Override the default Android back button behavior
        if (isAndroid) {
            let that = this;
            Application.android.on(Application.android.activityBackPressedEvent, function (args: AndroidActivityBackPressedEventData) {
                that.handleBackButton(args);
            });  
        }

        this.isAppInitialized = true;
        Trace.write('[AppComponent] BA initApp: Done', Trace.categories.Debug);
    }



    // https://github.com/NativeScript/nativescript-angular/issues/1887
    handleBackButton(args: any) {
        if (this.ngZone) {
            this.ngZone.run(() => {
                // let intervene = this.navigationInterventionService.processNavigation();
                Trace.write('[AppComponent] handleBackButton - zoned back navigation called', Trace.categories.Debug);
                args.cancel = true;
                if (this.routerExtension && this.routerExtension.canGoBack()) {
                    this.routerExtension.back();
                }
                else if (this.routerExtension && this.routerExtension.canGoBackToPreviousPage()) {
                    this.routerExtension.backToPreviousPage();
                }
                else {
                    if (this.routerExtension) {
                        Trace.write('[AppComponent] handleBackButton - cannot go back', Trace.categories.Debug);
                    }
                    else {
                        Trace.write('[AppComponent] handleBackButton - zone, no router extension', Trace.categories.Debug);
                    }
                }
            });    
        }
        else {
            // let intervene = this.navigationInterventionService.processNavigation();
            args.cancel = true;
            Trace.write('[AppComponent] handleBackButton - no Zone - back navigation called', Trace.categories.Debug);
            if (this.routerExtension && this.routerExtension.canGoBack()) {
                this.routerExtension.back();
            }
            else {
                if (this.routerExtension) {
                    Trace.write('[AppComponent] handleBackButton - cannot go back', Trace.categories.Debug);
                }
                else {
                    Trace.write('[AppComponent] handleBackButton - no router extension', Trace.categories.Debug);
                }
            }
        }
    }
    
    private showUserFeedback(msg: string, isError: boolean) {
        if (this.isAppInitialized && this.isAppComponentLoaded) {
        }
    }

    public onAppComponentLoaded(ev: any) {
        // Force light mode (see https://github.com/NativeScript/theme/issues/277)
        Theme.setMode(Theme.Light);
        this.isAppComponentLoaded = true;
    }
}
