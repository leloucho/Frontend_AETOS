import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MeetingNotificationComponent } from './components/meeting-notification/meeting-notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MeetingNotificationComponent],
  template: `
    <app-meeting-notification></app-meeting-notification>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {}
