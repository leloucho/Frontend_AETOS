import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  template: `
    <!-- Notificación Toast -->
    <div *ngIf="successMessage" class="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
      <div class="bg-white rounded-xl shadow-2xl border-l-4 border-green-500 p-4 max-w-md">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-semibold text-gray-900">{{ successMessage }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="min-h-screen flex items-center justify-center bg-cover bg-center" style="background-image: url('assets/images/reset.png');">
      <div class="absolute inset-0 bg-black opacity-40"></div>
      <div class="bg-white p-8 rounded-lg shadow-2xl w-96 relative z-10">
        <h2 class="text-2xl font-bold mb-6 text-center text-blue-700">Recuperar Contraseña</h2>
        <p class="text-sm text-gray-600 mb-4 text-center">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>
        <form (ngSubmit)="onSubmit()">
          <input type="email" [(ngModel)]="email" name="email" placeholder="Correo Electrónico" 
                 class="w-full p-3 mb-4 border rounded focus:ring-2 focus:ring-blue-500" required>
          <button type="submit" class="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 font-semibold">
            Enviar Enlace
          </button>
        </form>
        <p class="mt-4 text-center text-sm">
          <a routerLink="/login" class="text-blue-600 hover:underline">← Volver al inicio de sesión</a>
        </p>
        <p *ngIf="error" class="mt-4 p-3 text-red-700 bg-red-50 border-l-4 border-red-500 rounded text-center text-sm">
          {{ error }}
        </p>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  email = '';
  error = '';
  successMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.error = '';
    this.successMessage = '';

    if (!this.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      this.error = 'Por favor ingresa un correo válido';
      return;
    }

    this.authService.forgotPassword(this.email).subscribe({
      next: (response: any) => {
        this.successMessage = '📧 Revisa tu correo para restablecer tu contraseña';
        setTimeout(() => this.router.navigate(['/login']), 4000);
      },
      error: (err: any) => {
        this.error = err.error?.error || 'Error al enviar el correo';
      }
    });
  }
}
