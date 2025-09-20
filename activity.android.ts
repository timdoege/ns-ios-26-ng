import {
    Application,
    setActivityCallbacks,
    AndroidActivityCallbacks,
  } from '@nativescript/core';
  
  // Custom Activity which tracks running activities
  // ref: https://github.com/proyecto26/react-native-inappbrowser/issues/213#issuecomment-878915862
  @NativeClass()
  @JavaProxy('org.nativescript.custom.CustomActivity')
  class CustomActivity extends androidx.appcompat.app.AppCompatActivity {
    public isNativeScriptActivity: boolean;
  
    private _callbacks: AndroidActivityCallbacks;
  
    public onCreate(savedInstanceState: android.os.Bundle): void {
      Application.android.init(this.getApplication());
      this.isNativeScriptActivity = true;
      if (!this._callbacks) {
        setActivityCallbacks(this);
      }
  
      this._callbacks.onCreate(
        this,
        savedInstanceState,
        this.getIntent(),
        super.onCreate
      );
  
      (this.getApplication() as any).addActivityToStack(this.getClass());
    }
  
    public onNewIntent(intent: android.content.Intent): void {
      this._callbacks.onNewIntent(
        this,
        intent,
        super.setIntent,
        super.onNewIntent
      );
    }
  
    public onSaveInstanceState(outState: android.os.Bundle): void {
      this._callbacks.onSaveInstanceState(
        this,
        outState,
        super.onSaveInstanceState
      );
    }
  
    public onStart(): void {
      this._callbacks.onStart(this, super.onStart);
    }
  
    public onStop(): void {
      this._callbacks.onStop(this, super.onStop);
    }
  
    public onDestroy(): void {
      this._callbacks.onDestroy(this, super.onDestroy);
      (this.getApplication() as any).removeActivityFromStack(this.getClass());
    }
  
    public onPostResume(): void {
      this._callbacks.onPostResume(this, super.onPostResume);
    }
  
    public onBackPressed(): void {
      this._callbacks.onBackPressed(this, super.onBackPressed);
    }
  
    public onRequestPermissionsResult(
      requestCode: number,
      permissions: Array<string>,
      grantResults: Array<number>
    ): void {
      this._callbacks.onRequestPermissionsResult(
        this,
        requestCode,
        permissions,
        grantResults,
        undefined /*TODO: Enable if needed*/
      );
    }
  
    public onActivityResult(
      requestCode: number,
      resultCode: number,
      data: android.content.Intent
    ): void {
      this._callbacks.onActivityResult(
        this,
        requestCode,
        resultCode,
        data,
        super.onActivityResult
      );
    }
  }
  
  @NativeClass()
  @JavaProxy('org.nativescript.custom.LaunchActivity')
  class LaunchActivity extends androidx.appcompat.app.AppCompatActivity {
    public onCreate(savedInstanceState: android.os.Bundle): void {
      super.onCreate(savedInstanceState);
  
      const application: any = this.getApplication();
      // check that MainActivity is not started yet
      if (!application.isActivityInBackStack(CustomActivity.class)) {
        const intent = new android.content.Intent(this, CustomActivity.class);
        this.startActivity(intent);
      }
      this.finish();
    }
  }
  