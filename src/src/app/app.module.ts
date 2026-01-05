import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ToastrModule } from 'ngx-toastr';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    AppRoutingModule,
    CoreModule,
    SharedModule,
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
      timeOut: 5000,
      progressBar: true,
      progressAnimation: 'decreasing',
      closeButton: true,
      newestOnTop: false,
      enableHtml: true,
      tapToDismiss: true,
      maxOpened: 5,
      autoDismiss: true,
      toastClass: 'ngx-toastr custom-toast',
      titleClass: 'toast-title',
      messageClass: 'toast-message'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
