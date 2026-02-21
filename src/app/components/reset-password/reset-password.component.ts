import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="min-h-screen flex items-center justify-center py-4 bg-cover bg-center" style="background-image: url('assets/images/reset.png');">
      <div class="absolute inset-0 bg-black opacity-40"></div>
      <div class="bg-white p-8 rounded-lg shadow-2xl w-96 relative z-10">
        <h2 class="text-2xl font-bold mb-6 text-center text-blue-700">Nueva Contraseña</h2>
        <form (ngSubmit)="onSubmit()">
          <input type="password" [(ngModel)]="password" name="password" placeholder="Nueva Contraseña (mínimo 6 caracteres)" 
                 class="w-full p-3 mb-4 border rounded focus:ring-2 focus:ring-blue-500" required minlength="6">
          <input type="password" [(ngModel)]="confirmPassword" name="confirmPassword" placeholder="Confirmar Contraseña" 
                 class="w-full p-3 mb-4 border rounded focus:ring-2 focus:ring-blue-500" required>
          <button type="submit" class="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 font-semibold">
            Restablecer Contraseña
          </button>
        </form>
        <p *ngIf="error" class="mt-4 p-3 text-red-700 bg-red-50 border-l-4 border-red-500 rounded text-center text-sm">
          {{ error }}
        </p>
        <p *ngIf="successMessage" class="mt-4 p-3 text-green-700 bg-green-50 border-l-4 border-green-500 rounded text-center text-sm">
          {{ successMessage }}
        </p>
      </div>
    </div>
  `
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  password = '';
  confirmPassword = '';
  error = '';
  successMessage = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.error = 'Token inválido';
    }
  }

  onSubmit(): void {
    this.error = '';
    this.successMessage = '';

    if (this.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    this.authService.resetPassword(this.token, this.password).subscribe({
      next: (response: any) => {
        this.successMessage = '✓ Contraseña actualizada correctamente';
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: (err: any) => {
        this.error = err.error?.error || 'Error al restablecer la contraseña';
      }
    });
  }
}
