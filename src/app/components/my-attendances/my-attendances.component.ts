import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../layout/sidebar.component';

@Component({
  selector: 'app-my-attendances',
  standalone: true,
  imports: [CommonModule, SidebarComponent],
  template: `
    <div class="min-h-screen bg-gray-100 flex">
      <!-- Sidebar persistente -->
      <app-sidebar></app-sidebar>
      
      <!-- Contenido Principal -->
      <div class="flex-1 lg:pl-56 bg-gradient-to-br from-purple-50 to-blue-50">
    <div class="p-6">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h1 class="text-3xl font-bold text-purple-700">📊 Mis Asistencias</h1>
          </div>
          
          <!-- Statistics Cards -->
          <div class="grid grid-cols-3 gap-4 mt-6">
            <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-blue-600">{{ stats.total }}</div>
              <div class="text-sm text-gray-600 mt-1">Total Reuniones</div>
            </div>
            <div class="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-green-600">{{ stats.attended }}</div>
              <div class="text-sm text-gray-600 mt-1">Asistí ✅</div>
            </div>
            <div class="bg-red-50 border-2 border-red-200 rounded-lg p-4 text-center">
              <div class="text-3xl font-bold text-red-600">{{ stats.missed }}</div>
              <div class="text-sm text-gray-600 mt-1">Ausente ❌</div>
            </div>
          </div>

          <!-- Attendance Percentage -->
          <div class="mt-6 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4">
            <div class="flex items-center justify-between mb-2">
              <span class="font-semibold text-gray-700">Porcentaje de Asistencia</span>
              <span class="text-2xl font-bold text-purple-600">{{ attendancePercentage }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div class="bg-gradient-to-r from-purple-500 to-blue-500 h-3 transition-all duration-500"
                   [style.width.%]="attendancePercentage"></div>
            </div>
          </div>
        </div>

        <!-- Meetings List -->
        <div class="bg-white rounded-lg shadow-lg p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">📅 Historial de Reuniones</h2>
          
          <div *ngIf="loading" class="text-center py-12 text-gray-500">
            <div class="text-4xl mb-4">⏳</div>
            <p>Cargando historial...</p>
          </div>

          <div *ngIf="!loading && meetings.length === 0" class="text-center py-12 text-gray-500">
            <div class="text-6xl mb-4">📭</div>
            <p class="text-xl">No hay reuniones registradas</p>
          </div>

          <div *ngIf="!loading && meetings.length > 0" class="space-y-3">
            <div *ngFor="let meeting of meetings" 
                 class="border-2 rounded-lg p-4 transition hover:shadow-md"
                 [class.border-green-200]="meeting.attended"
                 [class.bg-green-50]="meeting.attended"
                 [class.border-gray-200]="!meeting.attended"
                 [class.bg-gray-50]="!meeting.attended">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <!-- Icon -->
                  <div class="w-14 h-14 rounded-full flex items-center justify-center text-3xl"
                       [class.bg-green-100]="meeting.attended"
                       [class.bg-gray-200]="!meeting.attended">
                    {{ meeting.attended ? '✅' : '❌' }}
                  </div>
                  
                  <!-- Meeting Info -->
                  <div>
                    <div class="flex items-center gap-2">
                      <p class="font-semibold text-lg" 
                         [class.text-green-800]="meeting.attended"
                         [class.text-gray-600]="!meeting.attended">
                        {{ meeting.fecha | date:'fullDate' }}
                      </p>
                      <span *ngIf="meeting.activa" 
                            class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
                        🟢 Activa
                      </span>
                    </div>
                    <p class="text-sm text-gray-600">
                      🕐 {{ meeting.fecha | date:'shortTime' }}
                    </p>
                    <p *ngIf="meeting.attended && meeting.timestamp" 
                       class="text-sm text-green-600 mt-1">
                      ⏰ Marcaste asistencia a las {{ meeting.timestamp | date:'shortTime' }}
                    </p>
                    <p *ngIf="!meeting.attended" class="text-sm text-red-600 mt-1">
                      😢 No asististe a esta reunión
                    </p>
                  </div>
                </div>

                <!-- Status Badge -->
                <div class="text-center flex flex-col gap-2">
                  <div class="px-4 py-2 rounded-lg font-semibold"
                       [class.bg-green-500]="meeting.attended"
                       [class.text-white]="meeting.attended"
                       [class.bg-gray-300]="!meeting.attended"
                       [class.text-gray-700]="!meeting.attended">
                    {{ meeting.attended ? 'PRESENTE' : 'AUSENTE' }}
                  </div>
                  <button *ngIf="!meeting.attended && !meeting.activa" 
                          (click)="justifyAbsence(meeting)"
                          class="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 transition">
                    📝 Justificar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      </div>
      </div>
    </div>

    <!-- Modal: Justificar Ausencia -->
    <div *ngIf="showJustifyModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="showJustifyModal = false">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" (click)="$event.stopPropagation()">
        <div class="p-6">
          <h3 class="text-xl font-bold mb-4">📝 Justificar Ausencia</h3>
          <p class="text-sm text-gray-600 mb-4">
            Reunión: {{ selectedMeeting?.fecha | date:'fullDate' }}
          </p>
          <textarea [(ngModel)]="justificationText" 
                    placeholder="Explica el motivo de tu ausencia..." 
                    rows="4"
                    class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500"></textarea>
          <div class="flex gap-3 mt-4">
            <button (click)="showJustifyModal = false" 
                    class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
              Cancelar
            </button>
            <button (click)="submitJustification()" 
                    [disabled]="!justificationText.trim()"
                    class="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition disabled:bg-gray-300">
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class MyAttendancesComponent implements OnInit {
  meetings: any[] = [];
  stats = { total: 0, attended: 0, missed: 0 };
  attendancePercentage = 0;
  loading = true;
  isLider = false;
  showJustifyModal = false;
  selectedMeeting: any = null;
  justificationText = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.isLider = this.authService.isLider();
    this.loadMyAttendances();
  }

  loadMyAttendances(): void {
    this.authService.getMyAttendances().subscribe({
      next: (data: any) => {
        this.meetings = data.meetings || [];
        this.stats = data.stats || { total: 0, attended: 0, missed: 0 };
        this.attendancePercentage = this.stats.total > 0 
          ? Math.round((this.stats.attended / this.stats.total) * 100) 
          : 0;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading attendances', err);
        this.loading = false;
        alert('❌ Error al cargar el historial de asistencias');
      }
    });
  }

  justifyAbsence(meeting: any): void {
    this.selectedMeeting = meeting;
    this.justificationText = '';
    this.showJustifyModal = true;
  }

  submitJustification(): void {
    if (!this.justificationText.trim() || !this.selectedMeeting) return;

    this.authService.submitJustification(this.selectedMeeting.id, this.justificationText).subscribe({
      next: () => {
        alert('✅ Justificación enviada. Será revisada por el líder.');
        this.showJustifyModal = false;
        this.justificationText = '';
        this.selectedMeeting = null;
      },
      error: (err: any) => {
        console.error('Error submitting justification', err);
        alert('❌ Error al enviar justificación');
      }
    });
  }
}
