import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-prayers',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-gray-100 flex">
      <!-- Menú Lateral -->
      <div class="w-64 bg-white shadow-lg flex flex-col fixed h-full z-40">
        <div class="p-4 bg-blue-600 text-white">
          <h1 class="text-xl font-bold">AETOS</h1>
        </div>
        <nav class="p-4 flex-1 overflow-y-auto">
          <a routerLink="/dashboard" 
             class="w-full text-left p-3 rounded mb-2 hover:bg-gray-100 flex items-center gap-3 transition block">
            <span class="text-xl">🏠</span>
            <span class="font-medium">Inicio</span>
          </a>
          <a routerLink="/scanner" 
             class="w-full text-left p-3 rounded mb-2 hover:bg-gray-100 flex items-center gap-3 transition block">
            <span class="text-xl">📱</span>
            <span class="font-medium">Marcar Asistencia</span>
          </a>
          <a routerLink="/my-attendances" 
             class="w-full text-left p-3 rounded mb-2 hover:bg-gray-100 flex items-center gap-3 transition block">
            <span class="text-xl">📊</span>
            <span class="font-medium">Mis Asistencias</span>
          </a>
          <a routerLink="/prayers" 
             class="w-full text-left p-3 rounded mb-2 bg-blue-100 hover:bg-blue-200 flex items-center gap-3 transition block border-l-4 border-blue-600">
            <span class="text-xl">🙏</span>
            <span class="font-medium">Muro de Oración</span>
          </a>
          <a routerLink="/events" 
             class="w-full text-left p-3 rounded mb-2 hover:bg-gray-100 flex items-center gap-3 transition block">
            <span class="text-xl">📅</span>
            <span class="font-medium">Cronograma</span>
          </a>
          <a routerLink="/profile" 
             class="w-full text-left p-3 rounded mb-2 hover:bg-gray-100 flex items-center gap-3 transition block">
            <span class="text-xl">👤</span>
            <span class="font-medium">Mi Perfil</span>
          </a>
          <a *ngIf="isLider" routerLink="/admin" 
             class="w-full text-left p-3 rounded mb-2 bg-purple-100 hover:bg-purple-200 flex items-center gap-3 transition block border-l-4 border-purple-600">
            <span class="text-xl">⚙️</span>
            <span class="font-medium">Panel Admin</span>
          </a>
        </nav>
        <div class="p-4 border-t">
          <button (click)="logout()" class="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
            🚪 Cerrar Sesión
          </button>
        </div>
      </div>
      
      <!-- Contenido Principal -->
      <div class="flex-1 ml-64">
      <div class="p-6">
        <div class="bg-white p-6 rounded shadow">
          <h2 class="text-2xl font-bold mb-4">Pedidos de Oración</h2>
          <div *ngIf="prayers.length === 0" class="text-gray-600">
            No hay pedidos de oración para la reunión actual.
          </div>
          <div *ngFor="let prayer of prayers" class="mb-4 p-4 border-l-4 border-blue-500 bg-blue-50">
            <p class="font-semibold">{{ prayer.requesterName }} 
              <span *ngIf="prayer.isVisitor" class="text-sm text-gray-600">(Visita)</span>
            </p>
            <p class="mt-2">{{ prayer.requestText }}</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  `
})
export class PrayersComponent implements OnInit {
  prayers: any[] = [];
  isLider = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.isLider = this.authService.isLider();
    this.loadPrayers();
  }

  loadPrayers(): void {
    this.authService.getPrayers().subscribe({
      next: (data) => this.prayers = data,
      error: (err) => console.error(err)
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
