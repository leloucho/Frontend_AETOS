import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50">
      <div class="bg-white p-8 rounded-lg shadow-lg w-96 text-center">
        <div *ngIf="loading" class="text-gray-600">
          Verificando tu cuenta...
        </div>
        <div *ngIf="success" class="text-green-600">
          <div class="text-5xl mb-4">✓</div>
          <h2 class="text-2xl font-bold mb-4">¡Cuenta Verificada!</h2>
          <p class="mb-4">Tu cuenta ha sido verificada exitosamente.</p>
          <a routerLink="/login" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 inline-block">
            Iniciar Sesión
          </a>
        </div>
        <div *ngIf="error" class="text-red-600">
          <div class="text-5xl mb-4">✕</div>
          <h2 class="text-2xl font-bold mb-4">Error</h2>
          <p class="mb-4">{{ errorMessage }}</p>
          <a routerLink="/register" class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 inline-block">
            Volver al Registro
          </a>
        </div>
      </div>
    </div>
  `
})
export class VerifyComponent implements OnInit {
  loading = true;
  success = false;
  error = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParams['token'];
    if (!token) {
      this.error = true;
      this.loading = false;
      this.errorMessage = 'Token no proporcionado';
      return;
    }

    this.http.get(`/api/auth/verify?token=${token}`).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
      },
      error: (err: any) => {
        this.loading = false;
        this.error = true;
        this.errorMessage = err.error?.error || 'Error al verificar la cuenta';
      }
    });
  }
}
