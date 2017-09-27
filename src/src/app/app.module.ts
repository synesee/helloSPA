import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';

import { UserRegistrationService } from './service/user-registration.service';
import { UserParametersService } from './service/user-parameters.service';
import { UserLoginService } from './service/user-login.service';
import { CognitoUtil } from './service/cognito.service';
import { routing } from './app.routes';
import { AboutComponent, HomeComponent, HomeLandingComponent } from './public/home.component';
import { AwsUtil } from './service/aws.service';
import { ApigwService } from './service/apigw.service';

import { LoginComponent } from './public/auth/login/login.component';
import { RegisterComponent } from './public/auth/register/registration.component';
import { ForgotPassword2Component, ForgotPasswordStep1Component } from './public/auth/forgot/forgotPassword.component';
import { LogoutComponent, RegistrationConfirmationComponent } from './public/auth/confirm/confirmRegistration.component';
import { ResendCodeComponent } from './public/auth/resend/resendCode.component';
import { NewPasswordComponent } from './public/auth/newpassword/newpassword.component';

import { SecureHomeComponent } from './secure/landing/securehome.component';
import { NotFoundComponent } from './public/auth/notfound.component';

import 'hammerjs';

import {
  MdToolbarModule,
  MdCardModule,
  MdInputModule,
  MdRadioModule,
  MdSelectModule,
  MdSlideToggleModule,
  MdMenuModule,
  MdSidenavModule,
  MdButtonModule,
  MdIconModule,
  MdProgressSpinnerModule,
  MdDialogModule,
  MdTooltipModule,
  MdTableModule,
  MdSortModule,
  MdSnackBarModule,
  MdPaginatorModule
} from '@angular/material';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MyProfileComponent } from './secure/profile/myprofile.component';

@NgModule({
  declarations: [
    AppComponent,
    NewPasswordComponent,
    LoginComponent,
    LogoutComponent,
    RegistrationConfirmationComponent,
    ResendCodeComponent,
    ForgotPasswordStep1Component,
    ForgotPassword2Component,
    RegisterComponent,
    AboutComponent,
    HomeLandingComponent,
    HomeComponent,
    SecureHomeComponent,
    MyProfileComponent,
    NotFoundComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    HttpModule,
    routing,
    BrowserAnimationsModule,
    FlexLayoutModule,
    MdToolbarModule,
    MdCardModule,
    MdInputModule,
    MdRadioModule,
    MdSelectModule,
    MdSlideToggleModule,
    MdMenuModule,
    MdSidenavModule,
    MdButtonModule,
    MdIconModule,
    MdProgressSpinnerModule,
    MdDialogModule,
    MdTooltipModule,
    MdTableModule,
    MdSortModule,
    MdSnackBarModule,
    MdPaginatorModule
  ],
  providers: [
    CognitoUtil,
    AwsUtil,
    UserRegistrationService,
    UserLoginService,
    UserParametersService,
    ApigwService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

