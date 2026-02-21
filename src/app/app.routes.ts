import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { VerifyComponent } from './components/verify/verify.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ScannerComponent } from './components/scanner/scanner.component';
import { AdminComponent } from './components/admin/admin.component';
import { PrayersComponent } from './components/prayers/prayers.component';
import { EventsComponent } from './components/events/events.component';
import { QrDisplayComponent } from './components/qr-display/qr-display.component';
import { ProfileComponent } from './components/profile/profile.component';
import { MyAttendancesComponent } from './components/my-attendances/my-attendances.component';
import { ResourcesComponent } from './components/resources/resources.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify', component: VerifyComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'scanner', component: ScannerComponent, canActivate: [authGuard] },
  { path: 'prayers', component: PrayersComponent, canActivate: [authGuard] },
  { path: 'events', component: EventsComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
  { path: 'qr-display', component: QrDisplayComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'my-attendances', component: MyAttendancesComponent, canActivate: [authGuard] },
  { path: 'resources', component: ResourcesComponent, canActivate: [authGuard] }
];
