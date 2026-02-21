import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../layout/sidebar.component';
import { MeetingNotificationComponent } from '../meeting-notification/meeting-notification.component';
import QRCode from 'qrcode';

registerLocaleData(localeEs);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, MeetingNotificationComponent],
  template: `
    <!-- Notificación de Reunión Activa -->
    <app-meeting-notification></app-meeting-notification>
    
    <!-- Sidebar persistente -->
    <app-sidebar></app-sidebar>

    <!-- Contenido principal -->
    <div class="min-h-screen bg-gray-100 lg:pl-56 transition-all duration-300">
      <div class="p-4 sm:p-6 lg:p-8">
        <!-- Header -->
        <div class="mb-6 lg:mb-8">
          <h1 class="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2 sm:gap-3">
            <span class="text-3xl sm:text-4xl">🏠</span>
            Inicio
          </h1>
          <p class="text-sm sm:text-base text-gray-600 mt-2">{{currentDate | date:'fullDate':'':'es'}}</p>
        </div>

        <!-- Banner de Cumpleaños -->
        <div *ngIf="showBirthdayBanner && birthdays.length > 0" class="mb-6 lg:mb-8 animate-slideDown">
          <div class="bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 border-2 sm:border-4 border-pink-300 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 relative overflow-hidden">
            <!-- Decoración de fondo -->
            <div class="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <span class="absolute top-2 left-4 text-6xl">🎈</span>
              <span class="absolute top-4 right-8 text-5xl">🎉</span>
              <span class="absolute bottom-6 left-12 text-5xl">🎊</span>
              <span class="absolute bottom-4 right-16 text-6xl">🎁</span>
            </div>



            <!-- Contenido -->
            <div class="relative z-10">
              <div class="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <span class="text-4xl sm:text-6xl animate-bounce">🎂</span>
                <div>
                  <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                    🎉 ¡Próximos Cumpleaños! 🎂
                  </h2>
                  <p class="text-sm sm:text-base text-purple-700 font-medium">Prepárate para celebrar - ¡No olvides felicitar!</p>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div *ngFor="let birthday of birthdays" 
                     class="bg-white rounded-xl p-5 shadow-lg border-2 hover:border-pink-400 transition"
                     [class.border-pink-400]="birthday.isToday"
                     [class.bg-gradient-to-br]="birthday.isToday"
                     [class.from-pink-50]="birthday.isToday"
                     [class.to-yellow-50]="birthday.isToday">
                  
                  <!-- Mensaje especial si es TU cumpleaños HOY -->
                  <div *ngIf="birthday.email === currentUserEmail && birthday.isToday" class="mb-4 text-center">
                    <div class="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-4 py-2 rounded-full font-bold text-lg animate-pulse">
                      🎉 ¡HOY ES TU CUMPLEAÑOS! 🎂
                    </div>
                    <p class="text-purple-600 font-semibold mt-2">¡Que tengas un día maravilloso lleno de bendiciones! 🙏✨</p>
                  </div>

                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                      <div class="bg-gradient-to-br from-pink-400 to-purple-500 rounded-full w-16 h-16 flex items-center justify-center shadow-lg">
                        <span class="text-3xl">🎂</span>
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <p class="text-xl font-bold text-gray-800">{{ birthday.fullName }}</p>
                          <span *ngIf="birthday.isToday" 
                                class="px-3 py-1 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-bold rounded-full shadow animate-pulse">
                            ¡HOY! 🎉
                          </span>
                        </div>
                        <p class="text-sm text-gray-600">
                          📅 {{ birthday.birthdayDate | date:'fullDate':'':'es' }}
                        </p>
                        <p *ngIf="!birthday.isToday" class="text-xs text-orange-600 font-bold">
                          ⏰ Faltan {{ birthday.daysUntilBirthday }} días
                        </p>
                        <p *ngIf="birthday.isToday" class="text-xs text-pink-600 font-bold animate-pulse">
                          🎉 ¡ES HOY!
                        </p>
                      </div>
                    </div>
                    
                    <!-- Botón Felicitar: Solo el día del cumpleaños y no para uno mismo -->
                    <button *ngIf="birthday.isToday && birthday.email !== currentUserEmail"
                      (click)="sendBirthdayMessage(birthday)"
                      class="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-5 py-3 rounded-xl hover:from-pink-600 hover:to-purple-700 transition shadow-lg font-semibold flex items-center gap-2">
                      <span class="text-xl">💌</span>
                      <span class="hidden sm:inline">Felicitar</span>
                    </button>
                    
                    <!-- Mensaje para días antes del cumpleaños -->
                    <div *ngIf="!birthday.isToday" class="text-right">
                      <p class="text-sm text-purple-600 font-semibold">¡Prepárate!</p>
                      <p class="text-xs text-gray-500">Felicita el {{ birthday.birthdayDate | date:'dd/MM' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Banner de Asignaciones/Responsabilidades -->
        <div *ngIf="showAssignmentBanner && assignments.length > 0" class="p-6 pb-0">
          <div class="bg-gradient-to-r from-orange-100 via-red-100 to-pink-100 border-4 border-orange-300 rounded-2xl shadow-2xl p-6 relative overflow-hidden">
            <!-- Decoración de fondo -->
            <div class="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
              <span class="absolute top-2 left-4 text-6xl">📋</span>
              <span class="absolute top-4 right-8 text-5xl">✅</span>
              <span class="absolute bottom-6 left-12 text-5xl">🎯</span>
              <span class="absolute bottom-4 right-16 text-6xl">💪</span>
            </div>

            <!-- Contenido -->
            <div class="relative z-10">
              <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <span class="text-4xl sm:text-5xl lg:text-6xl animate-bounce">📢</span>
                <div>
                  <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">
                    🎯 ¡Tienes Responsabilidades Próximas!
                  </h2>
      
                </div>
              </div>

              <div class="grid grid-cols-1 gap-4">
                <div *ngFor="let assignment of filteredAssignments" 
                     class="bg-white rounded-xl p-4 sm:p-5 shadow-lg border-2 hover:border-orange-400 transition break-words"
                     [class.border-orange-400]="assignment.isToday"
                     [class.bg-gradient-to-br]="assignment.isToday"
                     [class.from-orange-50]="assignment.isToday"
                     [class.to-red-50]="assignment.isToday">
                  
                  <div class="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                    <div class="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      <div class="bg-gradient-to-br from-orange-400 to-red-500 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center shadow-lg flex-shrink-0">
                        <span class="text-2xl sm:text-3xl">📋</span>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex flex-wrap items-center gap-2 mb-2">
                          <span *ngIf="assignment.isToday" 
                                class="px-2 sm:px-3 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full shadow animate-pulse">
                            ¡ES HOY! 🔥
                          </span>
                        </div>
                        
                        <p class="text-xs sm:text-sm text-gray-600 mb-2 break-words">
                          📅 {{ assignment.programDate | date:'fullDate':'':'es' }}
                        </p>
                        <p class="text-xs sm:text-sm text-gray-600 mb-2">
                          🕐 {{ assignment.programTime }} - {{ assignment.programEndTime }}
                        </p>
                        <p class="text-xs sm:text-sm text-gray-600 mb-3 break-words">
                          📍 {{ assignment.location }}
                        </p>
                        
                        <div class="space-y-1">
                          <p class="text-xs font-semibold text-orange-700 mb-1">Tus Responsabilidades:</p>
                          <div *ngFor="let responsibility of assignment.responsibilities" 
                               class="flex items-start gap-2">
                            <span class="text-orange-500 flex-shrink-0">✓</span>
                            <span class="text-xs sm:text-sm font-bold text-gray-800 break-words">{{ responsibility }}</span>
                          </div>
                        </div>
                        
                        <p *ngIf="!assignment.isToday" class="text-xs text-orange-600 font-bold mt-3">
                          ⏰ Faltan {{ assignment.daysUntil }} día{{ assignment.daysUntil !== 1 ? 's' : '' }}
                        </p>
                      </div>
                    </div>
                    
                  
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="h-4"></div>
        <!-- Estado del Programa -->
        <div *ngIf="program" class="mb-8">
          <div class="relative overflow-hidden rounded-2xl shadow-2xl ring-1 ring-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div class="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
              <h2 class="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <span>🗓️</span> Próximo Programa
              </h2>
              <span *ngIf="isProgramActive()" class="px-3 py-1 rounded-full bg-red-500 text-white text-sm font-semibold animate-pulse">🔴 Ahora</span>
              <span *ngIf="!isProgramActive()" class="px-3 py-1 rounded-full bg-white/20 text-white text-sm font-semibold">🕐 Pronto</span>
            </div>

            <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-4">
                <div class="flex items-start gap-3">
                  <span class="text-blue-600">🗓️</span>
                  <div class="flex-1">
                    <p class="text-gray-500 text-sm">Fecha</p>
                    <p class="font-semibold text-gray-800">{{ program.weekStart | date:'fullDate':'':'es' }}</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <span class="text-blue-600">🕐</span>
                  <div class="flex-1">
                    <p class="text-gray-500 text-sm">Horario</p>
                    <p class="font-semibold text-gray-800">{{ program.hora }} - {{ program.horaFin }}</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <span class="text-blue-600">📍</span>
                  <div class="flex-1">
                    <p class="text-gray-500 text-sm">Lugar</p>
                    <p class="font-semibold text-gray-800">{{ program.location?.name || 'Sin ubicación' }}</p>
                    <p *ngIf="program.location?.address" class="text-sm text-gray-500">{{ program.location.address }}</p>
                    <a *ngIf="program.location?.googleMapsUrl" [href]="program.location.googleMapsUrl" target="_blank" 
                       class="inline-flex items-center gap-2 mt-2 px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">🗺️ Ver Mapa</a>
                  </div>
                </div>
              </div>

              <div class="space-y-2">
                <h3 class="text-gray-700 font-semibold mb-2">👥 Responsables</h3>
                <div *ngIf="program.responsableConfraternizacion" class="text-sm">
                  <span class="text-gray-600">🎉 Confraternización:</span>
                  <span class="ml-2 text-gray-800 break-words">{{ getDisplayNameByEmail(program.responsableConfraternizacion) || program.responsableConfraternizacion }}</span>
                </div>
                <div *ngIf="program.responsableDinamica" class="text-sm">
                  <span class="text-gray-600">🎮 Dinámica:</span>
                  <span class="ml-2 text-gray-800 break-words">{{ getDisplayNameByEmail(program.responsableDinamica) || program.responsableDinamica }}</span>
                </div>
                <div *ngIf="program.responsableEspecial" class="text-sm">
                  <span class="text-gray-600">⭐ Especial:</span>
                  <span class="ml-2 text-gray-800 break-words">{{ getDisplayNameByEmail(program.responsableEspecial) || program.responsableEspecial }}</span>
                </div>
                <div *ngIf="program.responsableOracionIntercesora" class="text-sm">
                  <span class="text-gray-600">🙏 Oración:</span>
                  <span class="ml-2 text-gray-800 break-words">{{ getDisplayNameByEmail(program.responsableOracionIntercesora) || program.responsableOracionIntercesora }}</span>
                </div>
                <div *ngIf="program.responsableTema" class="text-sm">
                  <span class="text-gray-600">📖 Tema:</span>
                  <span class="ml-2 text-gray-800 break-words">{{ getDisplayNameByEmail(program.responsableTema) || program.responsableTema }}</span>
                </div>
              </div>
            </div>

            <div *ngIf="isProgramActive()" class="px-6 pb-6 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <button *ngIf="isLider" (click)="goToQrDisplay()" class="px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 transition flex items-center gap-2">
                <span class="text-xl">📱</span> Abrir Pantalla de QR
              </button>
              <button *ngIf="isLider && hasActiveQR && isQrPanelMinimized" (click)="toggleQrPanel()" class="px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-green-600 hover:to-emerald-700 transition flex items-center gap-2 animate-pulse">
                <span class="text-xl">📱</span> Ver QR Activo ({{ attendanceList.length }} asistencias)
              </button>
              <button *ngIf="!isLider" (click)="goToScanner()" class="px-5 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-green-600 hover:to-green-700 transition flex items-center gap-2">
                <span class="text-xl">📷</span> Marcar Asistencia Ahora
              </button>
            </div>

            <div *ngIf="!isProgramActive()" class="px-6 pb-6 text-center text-sm text-gray-600 italic">
              ⏰ La asistencia estará disponible durante el horario del programa ({{program.hora}} - {{program.horaFin}})
            </div>
          </div>
        </div>


      </div>
    </div>
    
    <!-- Panel Lateral de QR (solo para líder) -->
    <div *ngIf="showQrPanel && isLider" 
         class="fixed right-0 top-0 bg-white shadow-2xl transition-all duration-300 z-50"
         [class.w-full]="!isQrPanelMinimized"
         [class.sm:w-96]="!isQrPanelMinimized"
         [class.w-12]="isQrPanelMinimized"
         [class.sm:w-16]="isQrPanelMinimized"
         style="height: 100vh;">
      
      <!-- Panel Minimizado -->
      <div *ngIf="isQrPanelMinimized" class="h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-green-500 to-emerald-600 text-white cursor-pointer hover:from-green-600 hover:to-emerald-700 transition" (click)="toggleQrPanel()">
        <button class="text-3xl animate-pulse">
          📱
        </button>
        <div class="text-xs font-bold transform -rotate-90 whitespace-nowrap">QR ACTIVO</div>
        <div class="mt-4 bg-white bg-opacity-20 rounded-full px-3 py-1 text-sm font-bold">{{ attendanceList.length }}</div>
      </div>
      
      <!-- Panel Expandido -->
      <div *ngIf="!isQrPanelMinimized" class="h-full flex flex-col overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-green-600 to-emerald-600 p-4 text-white flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-2xl">📱</span>
            <div>
              <h3 class="text-lg font-bold">QR Activo</h3>
              <p class="text-xs text-green-100">{{ attendanceList.length }} presentes</p>
            </div>
          </div>
          <div class="flex gap-2">
            <button (click)="toggleQrPanel()" class="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition">
              <span class="text-xl">➖</span>
            </button>
            <button (click)="closeQrPanel()" class="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-lg transition">
              <span class="text-xl">✕</span>
            </button>
          </div>
        </div>
        
        <!-- Contenido Scrolleable -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- QR Code -->
          <div class="text-center">
            <div *ngIf="qrCodeUrl" class="bg-white p-3 rounded-lg border-4 border-green-500 inline-block">
              <img [src]="qrCodeUrl" alt="QR Code" class="w-48 h-48">
            </div>
            <div *ngIf="!qrCodeUrl" class="text-gray-500 py-8">
              Generando QR...
            </div>
          </div>
          
          <!-- Código Manual Copiable -->
          <div class="bg-blue-50 border-2 border-blue-500 rounded-lg p-3">
            <p class="text-xs font-semibold text-blue-900 mb-2 text-center">Código Manual</p>
            <button 
              (click)="copyCode(activeMeeting?.tokenQr)" 
              class="w-full bg-white hover:bg-blue-100 border-2 border-blue-300 rounded-lg p-3 transition group">
              <p class="text-sm font-mono font-bold text-blue-800 break-all">{{ activeMeeting?.tokenQr }}</p>
              <p class="text-xs text-blue-600 mt-1 group-hover:text-blue-800">
                👆 Toca para copiar
              </p>
            </button>
          </div>
          
          <!-- Asistencias en Tiempo Real -->
          <div class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-3">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-bold text-gray-800 flex items-center gap-1">
                <span>👥</span>
                Asistencias
              </h4>
              <span class="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">● LIVE</span>
            </div>
            
            <div class="bg-white rounded-lg border-2 border-gray-200 max-h-64 overflow-y-auto">
              <div *ngIf="attendanceList.length === 0" class="p-6 text-center text-gray-500">
                <span class="text-3xl block mb-2">⏳</span>
                <p class="text-xs">Esperando asistencias...</p>
              </div>
              
              <div *ngFor="let attendance of attendanceList; let i = index" 
                   class="p-2 border-b border-gray-100 hover:bg-blue-50 transition flex items-center gap-2">
                <div class="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {{ i + 1 }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-gray-800 text-sm truncate">{{ attendance.userName }}</p>
                  <p class="text-xs text-gray-500">{{ attendance.timestamp | date:'h:mm:ss a' }}</p>
                </div>
                <span class="text-green-500 text-lg flex-shrink-0">✓</span>
              </div>
            </div>
          </div>
          
          <!-- Consejo -->
          <div class="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-3">
            <p class="text-xs text-yellow-800">
              <span class="font-bold">💡</span> El QR estará activo durante toda la reunión. Puedes minimizar este panel y seguir trabajando.
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: .5; }
    }
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  userName = '';
  currentDate = new Date();
  isLider = false;
  program: any = null;
  locations: any[] = [];
  users: any[] = [];
  
  // Birthday notifications
  birthdays: any[] = [];
  showBirthdayBanner = false;
  currentUserEmail = '';
  
  // Assignment notifications
  assignments: any[] = [];
  filteredAssignments: any[] = [];
  showAssignmentBanner = false;
  
  // QR Panel properties
  showQrPanel = false;
  isQrPanelMinimized = false;
  hasActiveQR = false; // Indica si ya se generó un QR para el programa de hoy
  qrCodeUrl: string = '';
  activeMeeting: any = null;
  attendanceList: any[] = [];
  private pollingInterval: any = null;
  private assignmentsPollingInterval: any = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.getUserProfile().subscribe({
      next: (userData) => {
        this.userName = userData.nombre || 'Usuario';
        this.currentUserEmail = userData.email || '';
      },
      error: (err) => console.error('Error loading user data', err)
    });
    this.isLider = this.authService.isLider();
    this.loadUsers();
    this.loadProgram();
    this.loadBirthdays();
    this.loadAssignments();
    
    // Polling automático para programas, asignaciones y cumpleaños (cada 30 segundos)
    this.assignmentsPollingInterval = setInterval(() => {
      this.loadProgram();
      this.loadAssignments();
      this.loadBirthdays();
      if (this.isLider) {
        this.verifyActiveMeetingPanel();
      }
    }, 30000);
    
    // Si es líder, verificar si ya hay reunión activa
    if (this.isLider) {
      this.checkExistingActiveMeeting();
    }
  }
  
  ngOnDestroy(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    if (this.assignmentsPollingInterval) {
      clearInterval(this.assignmentsPollingInterval);
    }
  }

  isProgramActive(): boolean {
    if (!this.program || !this.program.weekStart) {
      return false;
    }

    const now = new Date();
    
    // Parsear fecha correctamente como fecha local
    const [year, month, day] = this.program.weekStart.split('-').map(Number);
    const programDay = new Date(year, month - 1, day);
    
    // Verificar que sea hoy
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (today.getTime() !== programDay.getTime()) {
      return false;
    }

    // Verificar si estamos en el horario del programa
    const [horaInicio, minutoInicio] = this.program.hora.split(':').map(Number);
    const [horaFin, minutoFin] = this.program.horaFin.split(':').map(Number);

    const minutosActuales = now.getHours() * 60 + now.getMinutes();
    const minutosInicio = horaInicio * 60 + minutoInicio;
    const minutosFin = horaFin * 60 + minutoFin;

    return minutosActuales >= minutosInicio && minutosActuales <= minutosFin;
  }

  getDisplayNameByEmail(email: string): string {
    if (!email) return '';
    const u = this.users.find(x => (x.email || '').toLowerCase() === email.toLowerCase());
    if (!u) return '';
    const full = (u.nombreCompleto || u.nombre || '').trim();
    if (full) return full;
    return `${u.nombre || ''} ${u.apellidos || ''}`.trim();
  }

  loadUsers(): void {
    this.authService.getUsers().subscribe({
      next: (data: any) => {
        this.users = (data || []).map((user: any) => {
          const parts = (user.nombre || '').split(' ');
          const nombre = parts[0] || '';
          const apellidos = parts.slice(1).join(' ') || '';
          return { ...user, nombre, apellidos, nombreCompleto: user.nombre || '' };
        });
      },
      error: () => {}
    });
  }

  loadProgram(): void {
    this.authService.getAllPrograms().subscribe({
      next: (programs: any[]) => {
        console.log('📅 Todos los programas:', programs);
        
        if (!programs || programs.length === 0) {
          console.log('❌ No hay programas');
          this.program = null;
          return;
        }

        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        console.log('⏰ Hora actual:', now, 'Minutos:', currentTime);

        // Primero buscar programa activo AHORA
        const activeProgram = programs.find(prog => {
          // Parsear fecha correctamente como fecha local
          const [year, month, day] = prog.weekStart.split('-').map(Number);
          const programDay = new Date(year, month - 1, day); // month - 1 porque los meses en JS van de 0-11
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          
          console.log('🔍 Revisando programa:', prog);
          console.log('  Fecha programa:', programDay, 'vs Hoy:', today);
          console.log('  ¿Mismo día?', today.getTime() === programDay.getTime());
          
          // Debe ser el mismo día
          if (today.getTime() !== programDay.getTime()) {
            console.log('  ❌ No es hoy');
            return false;
          }
          
          // Verificar horario
          const [horaInicio, minutoInicio] = prog.hora.split(':').map(Number);
          const [horaFin, minutoFin] = prog.horaFin.split(':').map(Number);
          const minutosInicio = horaInicio * 60 + minutoInicio;
          const minutosFin = horaFin * 60 + minutoFin;
          
          console.log(`  Rango: ${minutosInicio} - ${minutosFin}, Actual: ${currentTime}`);
          console.log(`  ¿Está activo?`, currentTime >= minutosInicio && currentTime <= minutosFin);
          
          return currentTime >= minutosInicio && currentTime <= minutosFin;
        });

        if (activeProgram) {
          console.log('✅ Programa activo encontrado:', activeProgram);
          this.program = activeProgram;
          return;
        }

        console.log('⏭️ No hay programa activo, buscando el próximo global...');

        const upcoming = programs
          .map(p => {
            const [y, m, d] = p.weekStart.split('-').map(Number);
            const dt = new Date(y, m - 1, d);
            const [hh, mm] = (p.hora || '00:00').split(':').map(Number);
            dt.setHours(hh, mm, 0, 0);
            return { p, ts: dt.getTime() };
          })
          .filter(x => x.ts > now.getTime())
          .sort((a, b) => a.ts - b.ts)
          .map(x => x.p);

        this.program = upcoming.length > 0 ? upcoming[0] : null;
        console.log('📋 Próximo programa (global):', this.program);
      },
      error: (err) => console.error(err)
    });
  }

  goToScanner(): void {
    this.router.navigate(['/scanner']);
  }

  goToQrDisplay(): void {
    this.router.navigate(['/qr-display']);
  }

  loadBirthdays(): void {
    this.authService.getBirthdaysThisWeek().subscribe({
      next: (data: any) => {
        this.birthdays = data.birthdays || [];
        this.showBirthdayBanner = this.birthdays.length > 0;
        console.log('🎂 Cumpleaños esta semana:', this.birthdays);
      },
      error: (err: any) => {
        console.error('Error loading birthdays', err);
      }
    });
  }
  
  loadAssignments(): void {
    console.log('🔍 Cargando asignaciones...');
    this.authService.getMyUpcomingAssignments().subscribe({
      next: (data: any) => {
        console.log('📊 Respuesta completa del servidor:', data);
        this.assignments = data.assignments || [];
        const now = new Date();
        const todayMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const upcoming = this.assignments.filter((a: any) => {
          if (!a?.programDate) return false;
          const [y, m, d] = a.programDate.split('-').map(Number);
          const dateMs = new Date(y, m - 1, d).getTime();
          if (dateMs > todayMs) return true; // día futuro
          if (dateMs < todayMs) return false; // día pasado
          // mismo día: sólo si aún no inicia
          const [hh, mm] = (a.programTime || '00:00').split(':').map(Number);
          const startMinutes = hh * 60 + mm;
          return currentMinutes < startMinutes;
        });
        this.filteredAssignments = upcoming;
        this.showAssignmentBanner = this.filteredAssignments.length > 0;
        console.log('📋 Mis asignaciones próximas (filtradas):', this.filteredAssignments);
        console.log('🎯 Mostrar banner:', this.showAssignmentBanner);
      },
      error: (err: any) => {
        console.error('❌ Error loading assignments:', err);
      }
    });
  }
  
  sendBirthdayMessage(birthday: any): void {
    const mensaje = `🎉🎂 *¡Feliz Cumpleaños ${birthday.nombre}!* 🎂🎉\n\n` +
                   `Que Dios te bendiga grandemente en este día tan especial. ` +
                   `Que tengas un año lleno de alegría, salud y bendiciones. 🙏✨\n\n` +
                   `¡Celebramos contigo este día! 🎊\n\n` +
                   `Con cariño,\n` +
                   `Familia AETOS 💛`;
    
    navigator.clipboard.writeText(mensaje).then(() => {
      alert(`✅ Mensaje de cumpleaños copiado para ${birthday.nombre}. Pégalo en WhatsApp.`);
    }).catch(() => {
      alert('❌ Error al copiar mensaje.');
    });
  }
  
  verifyActiveMeetingPanel(): void {
    if (!this.isProgramActive()) {
      this.endActiveMeetingUI();
      return;
    }
    this.authService.getActiveMeeting().subscribe({
      next: (data: any) => {
        if (!(data && data.activa)) {
          this.endActiveMeetingUI();
        }
      },
      error: () => {
        this.endActiveMeetingUI();
      }
    });
  }
  
  generateQRForProgram(): void {
    // Redirigir a la pantalla dedicada
    this.router.navigate(['/qr-display']);
  }
  
  createNewMeeting(): void {
    this.authService.createMeeting().subscribe({
      next: (data: any) => {
        console.log('✅ Reunión generada:', data);
        this.activeMeeting = data;
        this.hasActiveQR = true;
        this.generateQrCode(data.tokenQr);
        this.showQrPanel = true;
        this.isQrPanelMinimized = false;
        this.startPollingAttendances();
        this.showToast('QR de asistencia activado', 'success');
      },
      error: (err: any) => {
        console.error('❌ Error al generar reunión:', err);
        this.showToast('Error al generar código QR', 'error');
      }
    });
  }
  
  async generateQrCode(token: string): Promise<void> {
    try {
      this.qrCodeUrl = await QRCode.toDataURL(token, {
        width: 300,
        margin: 2,
        color: {
          dark: '#10B981',
          light: '#FFFFFF'
        }
      });
    } catch (err) {
      console.error('Error generando QR:', err);
    }
  }
  
  startPollingAttendances(): void {
    // Desactivado: gestión de QR centralizada fuera del Dashboard
  }
  
  loadAttendances(): void {
    // Desactivado aquí
  }
  
  toggleQrPanel(): void {
    this.isQrPanelMinimized = !this.isQrPanelMinimized;
  }
  
  closeQrPanel(): void {
    this.showQrPanel = false;
  }
  
  endActiveMeetingUI(): void {
    this.showQrPanel = false;
    this.isQrPanelMinimized = false;
    this.hasActiveQR = false;
    this.activeMeeting = null;
    this.qrCodeUrl = '';
    this.attendanceList = [];
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }
  
  copyCode(code: string): void {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      
    }).catch(err => {
      
    });
  }
  
  checkExistingActiveMeeting(): void {
    if (!this.isProgramActive()) {
      this.endActiveMeetingUI();
      return;
    }
    this.authService.getActiveMeeting().subscribe({
      next: (data: any) => {
        if (data && data.activa) {
          this.activeMeeting = data;
          this.hasActiveQR = true;
          this.generateQrCode(data.tokenQr);
          this.showQrPanel = true;
          this.isQrPanelMinimized = false;
          this.startPollingAttendances();
        } else {
          this.endActiveMeetingUI();
        }
      },
      error: () => {
        this.endActiveMeetingUI();
      }
    });
  }
  
  // Mostrar notificaciones toast
  showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-xl text-white font-medium animate-slideIn`;
    
    switch(type) {
      case 'success':
        toast.className += ' bg-green-500';
        break;
      case 'error':
        toast.className += ' bg-red-500';
        break;
      case 'warning':
        toast.className += ' bg-yellow-500';
        break;
      case 'info':
        toast.className += ' bg-blue-500';
        break;
    }
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }
}
