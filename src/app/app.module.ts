import { NgModule, NO_ERRORS_SCHEMA, Injectable, ErrorHandler, APP_INITIALIZER, inject } from '@angular/core';

import { AppComponent } from './app.component';
import { Trace } from '@nativescript/core';
import { NativeDialogService, NativeScriptCommonModule, NativeScriptModule, NativeScriptRouterModule, registerElement } from '@nativescript/angular';
import { ModalStack, overrideModalViewMethod } from 'nativescript-windowed-modal';
import { PreloadingStrategy } from '@angular/router';
import { ImageCacheItModule } from '@triniwiz/nativescript-image-cache-it/angular';
import { DatePipe } from '@angular/common';

// Workaround for product details screen: Webpack5 issue
// https://github.com/nstudio/nativescript-plugins/issues/39
// references https://github.com/NativeScript/nativescript-dev-webpack/issues/1121
// import './bundle-config';


// https://github.com/manijak/nativescript-carousel
// import { Carousel, CarouselItem } from 'nativescript-carousel';
// registerElement('Carousel', () => Carousel);
// registerElement('CarouselItem', () => CarouselItem);

// https://github.com/mukaschultze/nativescript-windowed-modal
overrideModalViewMethod();
registerElement('ModalStack', () => ModalStack as any);

import { BarcodeView } from '@nativescript-community/ui-barcodeview';
registerElement('BarcodeView', () => BarcodeView);

import { MLKitView } from '@nativescript/mlkit-core';
import { AppPreloadingStrategy } from './app-preloading-stategy';
registerElement('MLKitView', () => MLKitView);

// https://github.com/nativescript-community/ui-pulltorefresh
registerElement('PullToRefresh', () => require('@nativescript-community/ui-pulltorefresh').PullToRefresh);

// import { PreviousNextView } from '@nativescript/iqkeyboardmanager';
// registerElement('PreviousNextView', () => PreviousNextView);

// Enable trace component
Trace.enable();

@Injectable()
export class SentryErrorHandler implements ErrorHandler {
    handleError(error: any): void {
        try {
            // console.trace(error);

        } catch (err) {
            console.log('SentryErrorHandler failed:', err);
        }
    }
}

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        NativeScriptCommonModule,
        NativeScriptModule,
        NativeScriptRouterModule,
        ImageCacheItModule,
    ],
    providers: [
        DatePipe,
        { provide: ErrorHandler, useClass: SentryErrorHandler },
        { provide: PreloadingStrategy, useClass: AppPreloadingStrategy },
   ],
    declarations: [AppComponent],
    schemas: [NO_ERRORS_SCHEMA]
})
export class AppModule { }
