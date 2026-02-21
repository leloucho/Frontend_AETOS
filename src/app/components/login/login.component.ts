import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  template: `
    <!-- Notificación Toast -->
    <div *ngIf="successMessage" class="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
      <div class="bg-white rounded-xl shadow-2xl border-l-4 border-blue-500 p-4 max-w-md">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-semibold text-gray-900">{{ successMessage }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="min-h-screen flex items-center justify-center bg-cover bg-center px-4" style="background-image: url('assets/images/login.png');">
      <div class="absolute inset-0 bg-black opacity-40"></div>
      <div class="bg-white p-6 sm:p-8 rounded-lg shadow-2xl w-full max-w-md relative z-10">
        <h2 class="text-2xl font-bold mb-6 text-center">AETOS - Login</h2>
        <form (ngSubmit)="onLogin()">
          <input type="email" [(ngModel)]="email" name="email" placeholder="Email"
                 inputmode="email" autocomplete="username email" autocapitalize="off" autocorrect="off" spellcheck="false"
                 class="w-full p-2 mb-4 border rounded" required>
          <input type="password" [(ngModel)]="password" name="password" placeholder="Contraseña"
                 autocomplete="current-password" autocapitalize="off" autocorrect="off" spellcheck="false"
                 class="w-full p-2 mb-4 border rounded" required>
          <button type="submit" class="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            Iniciar Sesión
          </button>
        </form>
        <div class="mt-4 text-center text-sm space-y-2">
          <p><a routerLink="/forgot-password" class="text-blue-600 hover:underline">¿Olvidaste tu contraseña?</a></p>
          <p>¿No tienes cuenta? <a routerLink="/register" class="text-blue-600 hover:underline">Regístrate</a></p>
        </div>
        <div *ngIf="error" class="mt-4 p-4 rounded-lg text-center" [ngClass]="{
          'bg-yellow-50 border-2 border-yellow-400 text-yellow-800': error.includes('verificar'),
          'bg-red-50 border-2 border-red-300 text-red-700': !error.includes('verificar')
        }">
          <p class="font-semibold" [innerHTML]="error"></p>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  email = '';
  password = '';
  error = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.logout();
  }

  onLogin(): void {
    const email = (this.email || '').trim().toLowerCase();
    const password = this.password ?? '';
    this.authService.login(email, password).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        const errorMsg = (err?.error?.error || 'Credenciales inválidas').toString();
        const lower = errorMsg.toLowerCase();
        if (lower.includes('verifica') || lower.includes('correo') || lower.includes('email')) {
          this.error = '📧 Debes verificar tu correo electrónico. Revisa tu bandeja de entrada o spam.';
        } else {
          this.error = `[${err?.status ?? ''}] ${errorMsg}`.trim();
        }
      }
    });
  }
}
