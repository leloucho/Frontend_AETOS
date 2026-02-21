import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-meeting-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="showNotification" 
         class="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl animate-slideDown">
      
      <!-- Mobile Layout -->
      <div class="block sm:hidden px-3 py-3">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-2">
            <div class="bg-white bg-opacity-20 p-2 rounded-full animate-pulse flex-shrink-0">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
            </div>
            <div class="min-w-0 flex-1">
              <h3 class="font-bold text-sm">🎯 Nueva Reunión Activa</h3>
              <p class="text-xs text-white text-opacity-90">
                ¡Es momento de marcar tu asistencia!
              </p>
            </div>
          </div>
          <button 
            (click)="dismissNotification()"
            class="bg-white bg-opacity-20 hover:bg-opacity-30 p-1 rounded-lg transition-all flex-shrink-0">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        <div class="flex items-center justify-between">
          <div class="flex items-center bg-white bg-opacity-20 px-3 py-1 rounded-lg backdrop-blur-sm">
            <div class="text-xs font-semibold text-white text-opacity-80 mr-2">TIEMPO:</div>
            <div class="text-lg font-bold" [ngClass]="timeRemainingColor">{{ timeRemaining }}</div>
          </div>
          <button 
            (click)="navigateToScanner()"
            class="bg-white text-purple-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transform hover:scale-105 transition-all shadow-lg text-sm">
            📱 Marcar
          </button>
        </div>
      </div>

      <!-- Desktop/Tablet Layout -->
      <div class="hidden sm:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex items-center justify-between">
          <!-- Left section: Icon and message -->
          <div class="flex items-center space-x-4 flex-1">
            <div class="bg-white bg-opacity-20 p-3 rounded-full animate-pulse">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
            </div>
            <div>
              <h3 class="font-bold text-lg">🎯 Nueva Reunión Activa</h3>
              <p class="text-sm text-white text-opacity-90">
                ¡Es momento de marcar tu asistencia! Haz clic aquí para escanear el código QR.
              </p>
            </div>
          </div>

          <!-- Center section: Countdown timer -->
          <div class="flex items-center space-x-6 px-6">
            <div class="text-center bg-white bg-opacity-20 px-6 py-3 rounded-lg backdrop-blur-sm">
              <div class="text-xs font-semibold text-white text-opacity-80 mb-1">TIEMPO RESTANTE</div>
              <div class="text-3xl font-bold tracking-wider" [ngClass]="timeRemainingColor">
                {{ timeRemaining }}
              </div>
            </div>
          </div>

          <!-- Right section: Action buttons -->
          <div class="flex items-center space-x-3">
            <button 
              (click)="navigateToScanner()"
              class="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transform hover:scale-105 transition-all shadow-lg">
              📱 Marcar Ahora
            </button>
            <button 
              (click)="dismissNotification()"
              class="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition-all">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slideDown {
      from {
        transform: translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    .animate-slideDown {
      animation: slideDown 0.5s ease-out;
    }
  `]
})
export class MeetingNotificationComponent implements OnInit, OnDestroy {
  showNotification = false;
  timeRemaining = '05:00';
  timeRemainingColor = 'text-white';
  private pollingInterval: any;
  private timerInterval: any;
  private expiresAt: Date | null = null;
  private isDismissed = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Check user role - only show for regular users (MIEMBRO)
    const userRole = this.authService.getRole();
    if (userRole === 'MIEMBRO') {
      this.startPolling();
    }
  }

  ngOnDestroy() {
    this.stopPolling();
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private startPolling() {
    // Check immediately
    this.checkActiveMeeting();
    
    // Poll every 3 seconds
    this.pollingInterval = setInterval(() => {
      this.checkActiveMeeting();
    }, 3000);
  }

  private stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  private checkActiveMeeting() {
    // Skip if user manually dismissed
    if (this.isDismissed) {
      return;
    }

    this.authService.getActiveMeetingStatus().subscribe({
      next: (response) => {
        if (response.hasActiveMeeting && !response.hasAttended) {
          // There's an active meeting and user hasn't attended
          this.showNotification = true;
          this.expiresAt = new Date(response.expiresAt);
          this.startTimer();
        } else {
          // No active meeting or user already attended
          this.showNotification = false;
          this.stopTimer();
        }
      },
      error: (error) => {
        console.error('Error checking active meeting:', error);
      }
    });
  }

  private startTimer() {
    // Clear existing timer if any
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }

    // Update immediately
    this.updateTimeRemaining();

    // Update every second
    this.timerInterval = setInterval(() => {
      this.updateTimeRemaining();
    }, 1000);
  }

  private stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private updateTimeRemaining() {
    if (!this.expiresAt) {
      this.timeRemaining = '00:00';
      this.timeRemainingColor = 'text-red-400';
      return;
    }

    const now = new Date();
    const diff = this.expiresAt.getTime() - now.getTime();

    if (diff <= 0) {
      this.timeRemaining = 'Expirado';
      this.timeRemainingColor = 'text-red-400';
      this.showNotification = false;
      this.stopTimer();
      return;
    }

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    this.timeRemaining = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // Change color based on remaining time
    if (diff < 60000) {
      this.timeRemainingColor = 'text-red-300 animate-pulse';
    } else {
      this.timeRemainingColor = 'text-white';
    }
  }

  navigateToScanner() {
    this.router.navigate(['/scanner']);
  }

  dismissNotification() {
    this.showNotification = false;
    this.isDismissed = true;
    this.stopTimer();
    
    // Reset dismissal after 2 minutes to check again
    setTimeout(() => {
      this.isDismissed = false;
    }, 120000);
  }
}
