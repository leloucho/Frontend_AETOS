import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="relative">
      <!-- Botón para mostrar/ocultar sidebar -->
      <button 
        *ngIf="!sidebarVisible"
        (click)="toggleSidebar()"
        class="fixed left-0 top-20 z-50 bg-blue-600 text-white p-3 rounded-r-lg shadow-lg hover:bg-blue-700 transition-all">
        ▶
      </button>

      <!-- Sidebar -->
      <div 
        [class.translate-x-0]="sidebarVisible"
        [class.-translate-x-full]="!sidebarVisible"
        class="fixed left-0 top-0 bottom-0 w-56 sm:w-64 bg-white shadow-2xl z-40 transition-transform duration-300 flex flex-col overflow-hidden">
        
        <!-- Header -->
        <div class="p-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex justify-between items-center flex-shrink-0">
          <h2 class="text-xl font-bold">AETOS</h2>
          <button 
            (click)="toggleSidebar()"
            class="text-white hover:bg-blue-800 p-2 rounded transition-colors">
            ◀
          </button>
        </div>

        <!-- Navigation Menu -->
        <nav class="flex-1 overflow-y-auto p-4 min-h-0" (click)="handleNavClick($event)">
          <div class="space-y-1">
            <!-- Inicio (antes Dashboard) -->
            <a 
              routerLink="/dashboard" 
              [class.bg-blue-100]="currentRoute === '/dashboard'"
              [class.border-l-4]="currentRoute === '/dashboard'"
              [class.border-blue-600]="currentRoute === '/dashboard'"
              class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700">
              <span class="text-xl">🏠</span>
              <span class="font-medium">Inicio</span>
            </a>

            <!-- Cronograma (para todos) -->
            <a 
              routerLink="/admin" 
              [queryParams]="{m: 'cronograma'}"
              [class.bg-blue-100]="currentRoute === '/admin' && activeModule === 'cronograma'"
              [class.border-l-4]="currentRoute === '/admin' && activeModule === 'cronograma'"
              [class.border-blue-600]="currentRoute === '/admin' && activeModule === 'cronograma'"
              class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700">
              <span class="text-xl">📅</span>
              <span class="font-medium">Cronograma</span>
            </a>

            <!-- Programas (solo líder) -->
            <a 
              *ngIf="isLider"
              routerLink="/admin" 
              [queryParams]="{m: 'programas'}"
              [class.bg-blue-100]="currentRoute === '/admin' && activeModule === 'programas'"
              [class.border-l-4]="currentRoute === '/admin' && activeModule === 'programas'"
              [class.border-blue-600]="currentRoute === '/admin' && activeModule === 'programas'"
              class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700">
              <span class="text-xl">📋</span>
              <span class="font-medium">Programas</span>
            </a>

             <!-- Escanear QR -->
            <a 
              routerLink="/scanner" 
              [class.bg-blue-100]="currentRoute === '/scanner'"
              [class.border-l-4]="currentRoute === '/scanner'"
              [class.border-blue-600]="currentRoute === '/scanner'"
              class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700">
              <span class="text-xl">📱</span>
              <span class="font-medium">Escanear QR</span>
            </a>

            <!-- Asistencias (solo líder) -->
            <a 
              *ngIf="isLider"
              routerLink="/admin" 
              [queryParams]="{m: 'asistencias'}"
              [class.bg-blue-100]="currentRoute === '/admin' && activeModule === 'asistencias'"
              [class.border-l-4]="currentRoute === '/admin' && activeModule === 'asistencias'"
              [class.border-blue-600]="currentRoute === '/admin' && activeModule === 'asistencias'"
              class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700">
              <span class="text-xl">📊</span>
              <span class="font-medium">Asistencias</span>
            </a>

            <!-- Gestión de Usuarios (solo admin) -->
            <a 
              *ngIf="isAdmin"
              routerLink="/admin" 
              [queryParams]="{m: 'usuarios'}"
              [class.bg-blue-100]="currentRoute === '/admin' && activeModule === 'usuarios'"
              [class.border-l-4]="currentRoute === '/admin' && activeModule === 'usuarios'"
              [class.border-blue-600]="currentRoute === '/admin' && activeModule === 'usuarios'"
              class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700">
              <span class="text-xl">👥</span>
              <span class="font-medium">Gestionar Usuarios</span>
            </a>

            <!-- Ubicaciones (solo líder) -->
            <a 
              *ngIf="isLider"
              routerLink="/admin" 
              [queryParams]="{m: 'ubicaciones'}"
              [class.bg-blue-100]="currentRoute === '/admin' && activeModule === 'ubicaciones'"
              [class.border-l-4]="currentRoute === '/admin' && activeModule === 'ubicaciones'"
              [class.border-blue-600]="currentRoute === '/admin' && activeModule === 'ubicaciones'"
              class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700">
              <span class="text-xl">📍</span>
              <span class="font-medium">Ubicaciones</span>
            </a>

            <!-- Repositorio de Recursos -->
            <a 
              routerLink="/resources" 
              [class.bg-blue-100]="currentRoute === '/resources'"
              [class.border-l-4]="currentRoute === '/resources'"
              [class.border-blue-600]="currentRoute === '/resources'"
              class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700">
              <span class="text-xl">📚</span>
              <span class="font-medium">Recursos</span>
            </a>

            <!-- Mis Asistencias (solo miembros) -->
            <a 
              *ngIf="!isLider && !isAdmin"
              routerLink="/my-attendances"
              [class.bg-blue-100]="currentRoute === '/my-attendances'"
              [class.border-l-4]="currentRoute === '/my-attendances'"
              [class.border-blue-600]="currentRoute === '/my-attendances'"
              class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700">
              <span class="text-xl">📊</span>
              <span class="font-medium">Mis Asistencias</span>
            </a>

            <!-- Divider -->
            <div class="my-4 border-t border-gray-200"></div>

            <!-- Perfil -->
            <a 
              routerLink="/profile" 
              [class.bg-blue-100]="currentRoute === '/profile'"
              [class.border-l-4]="currentRoute === '/profile'"
              [class.border-blue-600]="currentRoute === '/profile'"
              class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700">
              <span class="text-xl">👤</span>
              <span class="font-medium">Mi Perfil</span>
            </a>

            <!-- Cerrar Sesión -->
            <button
              (click)="logout()"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 transition-colors text-red-600">
              <span class="text-xl">🚪</span>
              <span class="font-medium">Cerrar Sesión</span>
            </button>
          </div>
        </nav>

        <!-- Footer -->
        <div class="mt-auto p-3 sm:p-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <div class="flex items-center gap-3 text-sm text-gray-600">
            <!-- Avatar circular -->
            <div class="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
                 [class.bg-blue-600]="!userPhotoUrl"
                 [class.text-white]="!userPhotoUrl">
              <img *ngIf="userPhotoUrl" [src]="userPhotoUrl" 
                   alt="Foto de perfil"
                   class="w-full h-full object-cover">
              <span *ngIf="!userPhotoUrl" class="font-semibold text-sm">{{ getUserInitials() }}</span>
            </div>
            <!-- Nombre y rol -->
            <div class="flex-1">
              <p class="font-semibold">{{userName}}</p>
              <p class="text-xs text-gray-500">{{userRole}}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Overlay cuando el sidebar está visible (móvil) -->
      <div 
        *ngIf="sidebarVisible"
        (click)="toggleSidebar()"
        class="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden">
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class SidebarComponent implements OnInit {
  sidebarVisible = false; // Por defecto oculto en móvil
  currentRoute = '';
  activeModule = '';
  isLider = false;
  isAdmin = false;
  userName = '';
  userRole = '';
  userPhotoUrl = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Escuchar cambios de ruta
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.currentRoute = event.url.split('?')[0];
        const urlParams = new URLSearchParams(event.url.split('?')[1]);
        this.activeModule = urlParams.get('m') || '';
      });
  }

  ngOnInit(): void {
    // Detectar si es desktop y mostrar sidebar por defecto
    if (window.innerWidth >= 1024) {
      this.sidebarVisible = true;
    }

    this.isLider = this.authService.isLider();
    this.isAdmin = this.authService.isAdmin();
    this.authService.getUserProfile().subscribe({
      next: (userData) => {
        this.userName = userData.nombre || 'Usuario';
        this.userRole = this.isAdmin ? 'Administrador' : (this.isLider ? 'Líder' : 'Miembro');
        this.userPhotoUrl = userData.photoUrl || '';
      },
      error: (err) => console.error('Error loading user data', err)
    });

    // Obtener ruta actual
    this.currentRoute = this.router.url.split('?')[0];
    const urlParams = new URLSearchParams(this.router.url.split('?')[1]);
    this.activeModule = urlParams.get('m') || '';
  }

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
    localStorage.setItem('sidebarVisible', this.sidebarVisible.toString());
  }

  handleNavClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const anchor = target.closest('a');
    if (!anchor) return;
    if (window.innerWidth < 1024 && this.sidebarVisible) {
      this.sidebarVisible = false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUserInitials(): string {
    if (!this.userName) return 'U';
    const names = this.userName.split(' ');
    if (names.length >= 2) {
      return (names[0].charAt(0) + names[1].charAt(0)).toUpperCase();
    }
    return this.userName.charAt(0).toUpperCase();
  }
}
