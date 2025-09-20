// This import should be first in order to load some required settings (like globals and reflect-metadata)
import { NativeDialogService, platformNativeScript, registerElement, runNativeScriptAngularApp } from '@nativescript/angular';
import { enableProdMode, inject } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeNb from '@angular/common/locales/nb';
import { Application, Device, TouchManager, isIOS, Trace, Utils, View, ApplicationSettings } from '@nativescript/core';
import { ApplicationEventData } from '@nativescript/core/application/application-interfaces';
// import { GeolocationBackgroundAppDelegate } from './app/core/geolocation-background-app-delegate';
import { ImageCacheIt } from '@triniwiz/nativescript-image-cache-it';
import { AppModule } from './app/app.module';



// Add this so for iOS 10+ we can do some wiring (set the iOS UNUserNotificationCenter delegate, to be precise).
// Not needed if your app loads the plugin on startup anyway.
// You'll know you need this if on iOS 10+ notifications are not received by your app.
// require ('@nativescript/local-notifications');

// **new** call in your app.ts/ main.ts/ app.js to enable image-cache to hook into the device's lowmemory events
ImageCacheIt.enableAutoMM();

// Optional - attach to livesync hooks and perform navigation and identity restore
// import './livesync-navigation';

// Register Norwegian locale
registerLocaleData(localeNb);

// Configure Azure AD provider
// Note: Disabled - we are using inapp-browser instead
// configureOAuthProviders();


// import { Video } from '@nstudio/nativescript-exoplayer';
// registerElement('Video', () => Video);

// Shimmer
import { Shimmer } from '@nstudio/nativescript-shimmer';
registerElement('Shimmer', () => Shimmer);

registerElement('HTMLLabel', () => require('@nativescript-community/ui-label').Label);

// NS 7 + Angular 11 issue: https://github.com/NativeScript/NativeScript/issues/9245
// Alternatively: Pin all angular dep's to 11.2.0
const oldAEL = XMLHttpRequest.prototype.addEventListener;
XMLHttpRequest.prototype.addEventListener = function () {
	if (arguments.length > 0 && arguments[0] === 'timeout') {
		return;
	}
	return oldAEL.apply(this, arguments);
};

// default Touch animations
// TouchManager.enableGlobalTapAnimations = true;
TouchManager.animations = {
  down: (view: View) => {
    view.animate({
      scale: { x: 0.9, y: 0.9 },
      duration: 200,
    });
  },
  up: (view: View) => {
    view.animate({
      scale: { x: 1, y: 1 },
      duration: 150,
    });
  },
};


// Application events - note that some are handled in the app.component init since we need access
// to injectable services
Application.on(Application.exitEvent, (args: ApplicationEventData) => {
    if (args.android) {
        // For Android applications, args.android is an android activity class.
        Trace.write('Activity: ' + args.android, Trace.categories.Debug);
        // Ensure foreground service for geolocation support is stopped
        const context = Utils.android.getApplicationContext();
        const intent = new android.content.Intent();
        if (Device.sdkVersion < '26') {
            let fgClassName ='org.nativescript.geolocation.ForegroundServiceLegacy';
            // Android < 26 (up to 7.1.1) not supported
        }
        else {
            intent.setClassName(context, 'org.nativescript.geolocation.ForegroundService');
            context.stopService(intent);
        }        
    } else if (args.ios) {
        // For iOS applications, args.ios is UIApplication.
        Trace.write('UIApplication: ' + args.ios, Trace.categories.Debug);
    }

    /*
    if (Device.deviceType == 'Tablet') {
        Application.android.startActivity.setRequestedOrientation(
          android.content.pm.ActivityInfo.SCREEN_ORIENTATION_SENSOR
        );
    } else {
        Application.android.startActivity.setRequestedOrientation(
          android.content.pm.ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
        );
    }
        */

});

Application.on(Application.lowMemoryEvent, (args: ApplicationEventData) => {
    if (args.android) {
        // For Android applications, args.android is an android activity class.
        Trace.write('lowMemoryEvent - Activity: ' + args.android, Trace.categories.Debug);
    } else if (args.ios) {
        // For iOS applications, args.ios is UIApplication.
        Trace.write('lowMemoryEvent - UIApplication: ' + args.ios, Trace.categories.Debug);
    }
});

Application.on(Application.uncaughtErrorEvent, (args: ApplicationEventData) => {
    if (args.android) {
        // For Android applications, args.android is an NativeScriptError.
        Trace.write('uncaughtErrorEvent - NativeScriptError: ' + args.android, Trace.categories.Debug);
    } else if (args.ios) {
        // For iOS applications, args.ios is NativeScriptError.
        Trace.write('uncaughtErrorEvent - NativeScriptError: ' + args.ios, Trace.categories.Debug);
    }
});

if (global.isIOS) {
    // Hook up the application launch from URL.
    Application.ios.addDelegateHandler('applicationOpenURLOptions', (app, url, options) => {
        // console.log('App - applicationOpenURLOptions - opened URL:', url);
        const urlString = url.absoluteString;
        if (urlString) {
            // Store the URL in app settings - can be picked up by the login component, for example
            // ApplicationSettings.setString(AppConstants.APP_URL_LAUNCH, urlString);
        }
        return true; // Ensure the URL was handled properly
    });
}

runNativeScriptAngularApp({
    appModuleBootstrap: () => platformNativeScript().bootstrapModule(AppModule),
});
