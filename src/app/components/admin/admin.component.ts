import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../layout/sidebar.component';
import * as QRCode from 'qrcode';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <div class="min-h-screen bg-gray-100 flex">
      <app-sidebar></app-sidebar>
      
      <div class="flex-1 lg:pl-56 bg-gradient-to-br from-blue-50 to-purple-50">
        
        <div class="p-4 sm:p-6 overflow-auto">
        
        <!-- MÓDULO CRONOGRAMA (Para todos los usuarios) -->
        <div *ngIf="activeModule === 'cronograma'">
          <div class="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-4 sm:mb-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 class="text-2xl sm:text-3xl font-bold text-blue-700 flex items-center gap-2 sm:gap-3">
                  <span class="text-3xl sm:text-4xl">🗓️</span>
                  Cronograma de Reuniones
                </h2>
                <p class="text-sm sm:text-base text-gray-600 mt-1">Visualiza las fechas programadas para las reuniones</p>
              </div>
            </div>
          </div>

          <!-- Calendario Compacto Solo Visualización -->
          <div class="bg-white rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden">
            <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 sm:p-4">
              <div class="flex items-center justify-between text-white">
                <button 
                  (click)="previousMonth()" 
                  class="p-1 sm:p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition">
                  <span class="text-lg sm:text-xl">◀</span>
                </button>
                
                <div class="text-center">
                  <h3 class="text-xl sm:text-2xl font-bold">{{ getMonthName(currentMonth) }} {{ currentYear }}</h3>
                  <p class="text-blue-100 text-xs sm:text-sm">{{ getMonthProgramCount() }} reuniones programadas</p>
                </div>
                
                <button 
                  (click)="nextMonth()" 
                  class="p-1 sm:p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30 transition">
                  <span class="text-lg sm:text-xl">▶</span>
                </button>
              </div>
            </div>

            <div class="grid grid-cols-7 bg-gradient-to-r from-blue-100 to-indigo-100 border-b border-blue-200">
              <div *ngFor="let day of weekDays" class="text-center py-1 sm:py-2 font-bold text-gray-700 text-xs sm:text-sm">
                {{ day }}
              </div>
            </div>

            <div class="grid grid-cols-7 gap-0.5 sm:gap-1 p-1 sm:p-2 bg-gray-50">
              <div 
                *ngFor="let day of calendarDays" 
                (click)="viewDayPrograms(day)"
                [class.opacity-40]="day.isOtherMonth"
                [class.cursor-not-allowed]="day.isOtherMonth"
                [class.cursor-pointer]="!day.isOtherMonth && day.hasProgram"
                [class.hover:shadow-lg]="!day.isOtherMonth && day.hasProgram"
                class="relative h-12 sm:h-16 md:h-20 bg-white rounded-lg border-2 transition-all duration-200 overflow-hidden group"
                [class.border-gray-300]="!day.isOtherMonth && !day.hasProgram && !day.isToday"
                [class.border-green-500]="day.hasProgram"
                [class.bg-green-50]="day.hasProgram"
                [class.ring-2]="day.isToday"
                [class.ring-yellow-400]="day.isToday"
                [class.border-yellow-500]="day.isToday">
                
                <div class="absolute top-1 left-1 text-lg font-bold"
                     [class.text-gray-400]="day.isOtherMonth"
                     [class.text-gray-600]="!day.isOtherMonth && !day.hasProgram && !day.isToday"
                     [class.text-green-700]="day.hasProgram"
                     [class.text-yellow-700]="day.isToday">
                  {{ day.number }}
                </div>

                <div *ngIf="day.isToday" class="absolute top-1 right-1 bg-yellow-500 text-white text-xs px-1 py-0.5 rounded-full shadow">
                  HOY
                </div>

                <div *ngIf="day.hasProgram" class="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-green-500 to-green-600 text-white p-1">
                  <div class="flex items-center justify-center gap-1">
                    <span class="text-sm">✓</span>
                    <span class="text-xs font-bold">{{ day.programCount }} reunión(es)</span>
                  </div>
                </div>

                <div *ngIf="!day.isOtherMonth && day.hasProgram" 
                     class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-green-500 bg-opacity-90">
                  <div class="text-white text-center">
                    <div class="text-2xl mb-1">👁️</div>
                    <div class="text-xs font-bold">Ver</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- MÓDULO PROGRAMAS (Solo para líder/admin - CRUD Completo) -->
        <div *ngIf="activeModule === 'programas'" class="max-w-3xl mx-auto px-2">
          <div class="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-4 sm:mb-6">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 class="text-xl sm:text-2xl font-bold text-blue-700 flex items-center gap-2 sm:gap-3">
                  <span class="text-2xl sm:text-3xl">📋</span>
                  Gestión de Programas
                </h2>
                <h3>     Administra tus reuniones</h3>
              </div>
              <button 
                (click)="openProgramModal()" 
                class="self-center sm:self-auto max-w-[250px] w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 transition shadow-lg flex items-center justify-center gap-2 font-semibold text-xs sm:text-sm">
                <span class="text-lg sm:text-xl">➕</span>
                Crear Programa
              </button>
            </div>
          </div>

          <!-- Lista Completa de Programas -->
          <div class="space-y-4">
            <div *ngIf="allPrograms.length === 0" class="bg-white p-12 rounded-lg shadow-lg text-center">
              <div class="text-8xl mb-4">📋</div>
              <h3 class="text-2xl font-bold text-gray-700 mb-2">No hay programas registrados</h3>
              <p class="text-gray-500 mb-6">Comienza creando tu primer programa</p>
              <button (click)="openProgramModal()" class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                ➕ Crear Primer Programa
              </button>
            </div>

            <div *ngFor="let prog of allPrograms" 
                 class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition">
              <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 sm:p-4 text-white">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div class="flex items-center gap-3 sm:gap-4 min-w-0">
                    <div class="bg-white bg-opacity-20 rounded-full p-3 sm:p-4 flex-shrink-0">
                      <span class="text-2xl sm:text-4xl">{{ isPastProgram(prog) ? '✅' : '📅' }}</span>
                    </div>
                    <div class="min-w-0">
                      <h3 class="text-base sm:text-lg lg:text-xl font-bold break-words">{{ prog.weekStart | date:'EEEE, d MMMM yyyy' }}</h3>
                      <p class="text-blue-100 text-xs sm:text-sm lg:text-base mt-1">🕐 {{ prog.hora }} - {{ prog.horaFin }}</p>
                    </div>
                  </div>
                  <div class="flex-shrink-0">
                    <span *ngIf="getProgramStatus(prog) === 'active'" class="inline-block px-2 sm:px-3 py-0.5 sm:py-1 bg-red-500 text-white rounded-full text-xs sm:text-sm font-semibold animate-pulse">🔴 Ahora</span>
                    <span *ngIf="getProgramStatus(prog) === 'upcoming'" class="inline-block px-2 sm:px-3 py-0.5 sm:py-1 bg-green-500 text-white rounded-full text-xs sm:text-sm font-semibold">⏰ Pronto</span>
                    <span *ngIf="getProgramStatus(prog) === 'past'" class="inline-block px-2 sm:px-3 py-0.5 sm:py-1 bg-gray-500 text-white rounded-full text-xs sm:text-sm font-semibold">✅ Realizado</span>
                  </div>
                </div>
              </div>
              
              <div class="p-3 sm:p-4">
                <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                  <div class="flex flex-col sm:flex-row sm:items-center gap-3">
                    <span class="text-2xl sm:text-3xl flex-shrink-0">📍</span>
                    <div class="flex-1 min-w-0">
                      <p class="text-xs sm:text-sm text-gray-600 font-medium">Ubicación</p>
                      <p class="text-base sm:text-lg font-bold text-gray-800 break-words">{{ prog.location?.name || 'Sin ubicación' }}</p>
                      <p class="text-xs sm:text-sm text-gray-600 break-words">{{ prog.location?.address }}</p>
                    </div>
                    <a *ngIf="prog.location?.googleMapsUrl" [href]="prog.location.googleMapsUrl" target="_blank" class="bg-blue-600 text-white px-2.5 sm:px-3 py-1.5 rounded-md hover:bg-blue-700 transition text-xs sm:text-sm flex-shrink-0">🗺️ Ver Mapa</a>
                  </div>
                </div>
                
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div class="bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-200 rounded-lg p-3 sm:p-4">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-xl sm:text-2xl">🎉</span>
                      <p class="font-semibold text-gray-700 text-xs sm:text-sm">Confraternización</p>
                    </div>
                    <p class="text-sm sm:text-base text-gray-800 font-bold break-words">{{ getDisplayNameByEmail(prog.responsableConfraternizacion) || 'Sin asignar' }}</p>
                  </div>
                  
                  <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-lg p-3 sm:p-4">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-xl sm:text-2xl">🎮</span>
                      <p class="font-semibold text-gray-700 text-xs sm:text-sm">Dinámica</p>
                    </div>
                    <p class="text-sm sm:text-base text-gray-800 font-bold break-words">{{ getDisplayNameByEmail(prog.responsableDinamica) || 'Sin asignar' }}</p>
                  </div>
                  
                  <div class="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-3 sm:p-4">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-xl sm:text-2xl">⭐</span>
                      <p class="font-semibold text-gray-700 text-xs sm:text-sm">Especial</p>
                    </div>
                    <p class="text-sm sm:text-base text-gray-800 font-bold break-words">{{ getDisplayNameByEmail(prog.responsableEspecial) || 'Sin asignar' }}</p>
                  </div>
                  
                  <div class="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-4">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-2xl">🙏</span>
                      <p class="font-semibold text-gray-700 text-sm">Oración</p>
                    </div>
                    <p class="text-gray-800 font-bold break-words">{{ getDisplayNameByEmail(prog.responsableOracionIntercesora) || 'Sin asignar' }}</p>
                  </div>
                  
                  <div class="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-4">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-2xl">📖</span>
                      <p class="font-semibold text-gray-700 text-sm">Tema</p>
                    </div>
                    <p class="text-gray-800 font-bold break-words">{{ getDisplayNameByEmail(prog.responsableTema) || 'Sin asignar' }}</p>
                  </div>
                </div>
                
                <div class="flex flex-wrap gap-6">
                  <button 
                    *ngIf="getProgramStatus(prog) !== 'past'" 
                    (click)="editProgram(prog)" 
                    class="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2">
                    <span class="text-lg">✏️</span>
                    Editar
                  </button>
                  
                  <button 
                    (click)="shareToWhatsApp(prog)" 
                    class="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 sm:px-4 py-2 rounded-md hover:from-green-600 hover:to-green-700 transition font-semibold flex items-center justify-center gap-2 shadow">
                    <span class="text-lg">📱</span>
                   
                  </button>
                  
                  <button 
                    *ngIf="getProgramStatus(prog) === 'upcoming'" 
                    (click)="deleteProgram(prog.id)" 
                    class="bg-red-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-red-700 transition font-semibold flex items-center gap-2">
                    <span class="text-lg">🗑️</span>
                    Eliminar
                  </button>
                  
                  <div *ngIf="getProgramStatus(prog) === 'past'" class="bg-gray-200 text-gray-600 px-3 sm:px-4 py-2 rounded-md text-center font-semibold">
                    🔒 Programa finalizado
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div *ngIf="activeModule === 'ubicaciones'" class="bg-white p-6 rounded-lg shadow-lg">
          <h2 class="text-2xl font-bold mb-6 text-red-700">📍 Gestión de Ubicaciones</h2>
          <button (click)="openLocationModal()" class="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition shadow mb-6">
            + Agregar Ubicación
          </button>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div *ngFor="let loc of locations" class="border rounded-lg p-4 hover:shadow-lg transition">
              <div class="flex justify-between items-start mb-2">
                <h3 class="font-bold text-lg">{{ loc.name }}</h3>
                <div class="flex gap-2">
                  <button (click)="editLocation(loc)" class="text-blue-600 hover:text-blue-800 text-xl">✏️</button>
                  <button (click)="deleteLocation(loc.id)" class="text-red-600 hover:text-red-800 text-xl">🗑️</button>
                </div>
              </div>
              <p class="text-sm text-gray-600 mb-2">{{ loc.address }}</p>
              <a [href]="loc.googleMapsUrl" target="_blank" class="text-sm text-blue-600 hover:underline inline-flex items-center gap-1">
                🗺️ Ver en Google Maps
              </a>
            </div>
            <div *ngIf="locations.length === 0" class="col-span-2 text-center py-12 text-gray-500">
              No hay ubicaciones registradas
            </div>
          </div>
        </div>

        <!-- MÓDULO ASISTENCIAS -->
        <div *ngIf="activeModule === 'asistencias'">
          <div class="bg-white p-6 rounded-lg shadow-lg mb-6">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-3xl font-bold text-purple-700 flex items-center gap-3">
                  <span class="text-4xl">📊</span>
                  Asistencias
                </h2>
                <p class="text-gray-600 mt-1">Gestiona el historial de asistencias</p>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-600">Total de reuniones</p>
                <p class="text-3xl font-bold text-purple-700">{{ attendanceReport?.totalMeetings || 0 }}</p>
              </div>
            </div>

            <!-- Tabs -->
            <div class="flex gap-4 mt-6 border-b-2 border-gray-200">
              <button 
                (click)="attendanceTab = 'todos'" 
                [class.border-purple-600]="attendanceTab === 'todos'"
                [class.text-purple-700]="attendanceTab === 'todos'"
                [class.border-transparent]="attendanceTab !== 'todos'"
                [class.text-gray-500]="attendanceTab !== 'todos'"
                class="pb-3 px-4 font-semibold transition border-b-4 hover:text-purple-600">
                👥 Todos los Miembros
              </button>
              <button 
                (click)="attendanceTab = 'personal'" 
                [class.border-purple-600]="attendanceTab === 'personal'"
                [class.text-purple-700]="attendanceTab === 'personal'"
                [class.border-transparent]="attendanceTab !== 'personal'"
                [class.text-gray-500]="attendanceTab !== 'personal'"
                class="pb-3 px-4 font-semibold transition border-b-4 hover:text-purple-600">
                📋 Mi Historial Personal
              </button>
            </div>
          </div>

          <!-- TAB: TODOS LOS MIEMBROS -->
          <div *ngIf="attendanceTab === 'todos'">
            <!-- Alertas "Te Extrañamos" -->
            <div *ngIf="usersNeedingAlert.length > 0" class="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-xl p-6 mb-6 shadow-lg">
              <div class="flex items-center gap-3 mb-4">
                <span class="text-4xl">💛</span>
                <div>
                  <h3 class="text-xl font-bold text-yellow-800">¡Te Extrañamos!</h3>
                  <p class="text-sm text-yellow-700">{{ usersNeedingAlert.length }} {{ usersNeedingAlert.length === 1 ? 'miembro ha' : 'miembros han' }} faltado 2 reuniones consecutivas</p>
                </div>
              </div>
              <div class="space-y-3">
                <div *ngFor="let user of usersNeedingAlert" class="bg-white rounded-lg p-4 flex items-center justify-between shadow">
                  <div class="flex items-center gap-3">
                    <div class="bg-yellow-100 rounded-full p-3">
                      <span class="text-2xl">😢</span>
                    </div>
                    <div>
                      <p class="font-bold text-gray-800">{{ user.fullName }}</p>
                      <p class="text-sm text-gray-600">{{ user.email }}</p>
                      <p class="text-xs text-yellow-700 mt-1">⚠️ Ausente las últimas 2 reuniones</p>
                    </div>
                  </div>
                  <button 
                    (click)="sendMissYouMessage(user)" 
                    class="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-yellow-600 hover:to-orange-600 transition font-semibold flex items-center gap-2 shadow-lg">
                    <span class="text-lg">💛</span>
                    Te Extrañamos
                  </button>
                </div>
              </div>
            </div>

            <!-- Tabla de Asistencias -->
            <div class="bg-white rounded-xl shadow-lg overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                    <tr>
                      <th class="px-2 sm:px-4 py-3 text-left font-semibold text-xs sm:text-sm">#</th>
                      <th class="px-2 sm:px-4 py-3 text-left font-semibold text-xs sm:text-sm">Miembro</th>
                      <th class="px-2 sm:px-4 py-3 text-center font-semibold text-xs sm:text-sm">Asistió</th>
                      <th class="px-2 sm:px-4 py-3 text-center font-semibold text-xs sm:text-sm">No Asistió</th>
                      <th class="hidden md:table-cell px-4 py-3 text-center font-semibold text-xs sm:text-sm">% Asistencia</th>
                      <th class="hidden lg:table-cell px-4 py-3 text-center font-semibold text-xs sm:text-sm">Estado</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200">
                    <tr *ngFor="let user of attendanceReport?.users; let i = index" class="hover:bg-purple-50 transition">
                      <td class="px-2 sm:px-4 py-3 text-gray-600 text-xs sm:text-sm">{{ i + 1 }}</td>
                      <td class="px-2 sm:px-4 py-3">
                        <div class="flex items-center gap-2">
                          <div class="bg-purple-100 rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-bold text-purple-700 text-xs sm:text-sm flex-shrink-0">
                            {{ user.nombre.charAt(0) }}{{ user.apellidos.charAt(0) }}
                          </div>
                          <div class="min-w-0">
                            <p class="font-bold text-gray-800 text-xs sm:text-sm break-words">{{ user.fullName }}</p>
                            <p class="text-xs text-gray-500 hidden sm:block">{{ user.rol }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="px-2 sm:px-4 py-3 text-center">
                        <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold">
                          {{ user.attended }}
                        </span>
                      </td>
                      <td class="px-2 sm:px-4 py-3 text-center">
                        <span class="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold">
                          {{ user.missed }}
                        </span>
                      </td>
                      <td class="hidden md:table-cell px-4 py-3 text-center">
                        <div class="flex items-center justify-center gap-2">
                          <div class="w-16 sm:w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              class="h-2 rounded-full transition-all"
                              [class.bg-green-500]="user.attendanceRate >= 75"
                              [class.bg-yellow-500]="user.attendanceRate >= 50 && user.attendanceRate < 75"
                              [class.bg-red-500]="user.attendanceRate < 50"
                              [style.width.%]="user.attendanceRate"></div>
                          </div>
                          <span class="text-xs sm:text-sm font-bold text-gray-700">{{ user.attendanceRate }}%</span>
                        </div>
                      </td>
                      <td class="hidden lg:table-cell px-4 py-3 text-center">
                        <span 
                          *ngIf="user.missedLastTwo"
                          class="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                          <span>⚠️</span>
                          Ausente
                        </span>
                        <span 
                          *ngIf="!user.missedLastTwo && user.attendanceRate >= 75"
                          class="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">
                          <span>✅</span>
                          Activo
                        </span>
                        <span 
                          *ngIf="!user.missedLastTwo && user.attendanceRate < 75"
                          class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-bold">
                          Regular
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div *ngIf="!attendanceReport || attendanceReport.users.length === 0" class="text-center py-12 text-gray-500">
                <span class="text-6xl block mb-3">📊</span>
                <p class="text-lg font-medium">No hay datos de asistencia disponibles</p>
              </div>
            </div>
          </div>

          <!-- TAB: MI HISTORIAL PERSONAL -->
          <div *ngIf="attendanceTab === 'personal'">
            <div *ngIf="loadingMyAttendances" class="bg-white rounded-lg shadow-lg p-12 text-center text-gray-500">
              <div class="text-6xl mb-4">⏳</div>
              <p class="text-xl">Cargando tu historial...</p>
            </div>

            <div *ngIf="!loadingMyAttendances">
              <!-- Statistics Cards -->
              <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center shadow">
                  <div class="text-4xl font-bold text-blue-600">{{ myAttendanceStats.total }}</div>
                  <div class="text-sm text-gray-600 mt-2">Total Reuniones</div>
                </div>
                <div class="bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center shadow">
                  <div class="text-4xl font-bold text-green-600">{{ myAttendanceStats.attended }}</div>
                  <div class="text-sm text-gray-600 mt-2">Asistí ✅</div>
                </div>
                <div class="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center shadow">
                  <div class="text-4xl font-bold text-red-600">{{ myAttendanceStats.missed }}</div>
                  <div class="text-sm text-gray-600 mt-2">Ausente ❌</div>
                </div>
              </div>

              <!-- Attendance Percentage -->
              <div class="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6 mb-6 shadow-lg">
                <div class="flex items-center justify-between mb-3">
                  <span class="font-bold text-gray-700 text-lg">Porcentaje de Asistencia</span>
                  <span class="text-3xl font-bold text-purple-600">{{ myAttendancePercentage }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div class="bg-gradient-to-r from-purple-500 to-blue-500 h-4 transition-all duration-500"
                       [style.width.%]="myAttendancePercentage"></div>
                </div>
              </div>

              <!-- Meetings List -->
              <div class="bg-white rounded-lg shadow-lg p-6">
                <h2 class="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span class="text-2xl">📅</span>
                  Historial de Reuniones
                </h2>
                
                <div *ngIf="myAttendances.length === 0" class="text-center py-12 text-gray-500">
                  <div class="text-6xl mb-4">📭</div>
                  <p class="text-xl">No hay reuniones registradas</p>
                </div>

                <div *ngIf="myAttendances.length > 0" class="space-y-3">
                  <div *ngFor="let meeting of myAttendances" 
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
                          <p *ngIf="!meeting.attended && meeting.justificada" class="text-xs text-green-600 mt-1 font-medium">
                            ✓ Justificada
                          </p>
                        </div>
                      </div>

                      <!-- Status Badge -->
                      <div>
                        <span *ngIf="meeting.attended" 
                              class="bg-green-500 text-white px-4 py-2 rounded-lg font-bold shadow">
                          Asistí
                        </span>
                        <span *ngIf="!meeting.attended" 
                              class="bg-gray-400 text-white px-4 py-2 rounded-lg font-bold shadow">
                          Ausente
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- MÓDULO GESTIÓN DE USUARIOS (Solo ADMIN) -->
        <div *ngIf="activeModule === 'usuarios'">
          <div class="bg-white p-6 rounded-lg shadow-lg mb-6">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-3xl font-bold text-indigo-700 flex items-center gap-3">
                  <span class="text-4xl">👥</span>
                  Gestión de Usuarios
                </h2>
                <p class="text-gray-600 mt-1">Administra roles y usuarios del sistema</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-lg p-6">
            <div *ngIf="loadingUsers" class="text-center py-12 text-gray-500">
              <div class="text-6xl mb-4">⏳</div>
              <p class="text-xl">Cargando usuarios...</p>
            </div>

            <div *ngIf="!loadingUsers">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div *ngFor="let user of allUsers" class="bg-gray-50 border rounded-lg p-4 hover:shadow-md transition">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span class="text-2xl">👤</span>
                    </div>
                    <div class="flex-1">
                      <p class="font-bold text-lg text-gray-800">{{ user.nombre }} {{ user.apellidos }}</p>
                      <p class="text-sm text-gray-600">{{ user.email }}</p>
                    </div>
                  </div>
                  
                  <div class="flex items-center justify-between">
                    <span class="px-3 py-1 rounded-full text-sm font-semibold"
                          [class.bg-red-100]="user.rol === 'ADMIN'"
                          [class.text-red-800]="user.rol === 'ADMIN'" 
                          [class.bg-blue-100]="user.rol === 'LIDER'"
                          [class.text-blue-800]="user.rol === 'LIDER'"
                          [class.bg-gray-100]="user.rol === 'MIEMBRO'"
                          [class.text-gray-800]="user.rol === 'MIEMBRO'">
                      {{ getRoleDisplayName(user.rol) }}
                    </span>
                    <button *ngIf="user.rol !== 'ADMIN' && user.email !== currentUserEmail" 
                            (click)="openChangeRoleModal(user)"
                            class="bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700 transition text-sm">
                      ⚙️ Cambiar Rol
                    </button>
                  </div>
                  
                  <div class="mt-3 text-xs text-gray-500">
                    <p>🏠 Usuario: {{ user.usuario }}</p>
                    <p *ngIf="user.celular">📱 {{ user.celular }}</p>
                  </div>
                </div>
              </div>
              
              <div *ngIf="allUsers.length === 0" class="text-center py-12 text-gray-500">
                <div class="text-6xl mb-4">📭</div>
                <p class="text-xl">No hay usuarios registrados</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de Visualización (Cronograma - Solo Lectura) -->
    <div *ngIf="showViewProgramModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full animate-fadeIn max-h-[90vh] overflow-y-auto">
        <div class="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white rounded-t-2xl">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-4xl">🗓️</span>
              <div>
                <h3 class="text-2xl font-bold">Programa del día:</h3>
                <p class="text-green-100 text-sm">{{ selectedProgram?.weekStart | date:'fullDate':'':'es' }}</p>
              </div>
            </div>
            <button (click)="closeViewModal()" class="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition">
              <span class="text-2xl">✕</span>
            </button>
          </div>
        </div>
        
        <div class="p-6 space-y-4">
          <div *ngFor="let prog of selectedDayPrograms; let i = index" class="border-2 border-gray-200 rounded-xl p-4 hover:shadow-md transition">
            <div class="flex items-center gap-3 mb-3">
              
              <div>
                <h4 class="text-xl font-bold text-gray-800">Horario:</h4>
                <p class="text-gray-600">🕐 {{ prog.hora }} - {{ prog.horaFin }}</p>
              </div>
            </div>
            
            <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 mb-3">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm text-gray-600 font-medium">📍 Ubicación</p>
                  <p class="text-lg font-bold text-gray-800">{{ prog.location?.name || 'Sin ubicación' }}</p>
                  <p class="text-sm text-gray-600">{{ prog.location?.address }}</p>
                </div>
                <a *ngIf="prog.location?.googleMapsUrl" [href]="prog.location.googleMapsUrl" target="_blank" 
                   class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm">
                  🗺️ Ver Mapa
                </a>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-2">
              <div *ngIf="prog.responsableConfraternizacion" class="bg-pink-50 border border-pink-200 rounded-lg p-2">
                <p class="text-xs text-gray-600">🎉 Confraternización</p>
                <p class="font-bold text-sm break-words">{{ getDisplayNameByEmail(prog.responsableConfraternizacion) || prog.responsableConfraternizacion }}</p>
              </div>
              <div *ngIf="prog.responsableDinamica" class="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
                <p class="text-xs text-gray-600">🎮 Dinámica</p>
                <p class="font-bold text-sm break-words">{{ getDisplayNameByEmail(prog.responsableDinamica) || prog.responsableDinamica }}</p>
              </div>
              <div *ngIf="prog.responsableEspecial" class="bg-purple-50 border border-purple-200 rounded-lg p-2">
                <p class="text-xs text-gray-600">⭐ Especial</p>
                <p class="font-bold text-sm break-words">{{ getDisplayNameByEmail(prog.responsableEspecial) || prog.responsableEspecial }}</p>
              </div>
              <div *ngIf="prog.responsableOracionIntercesora" class="bg-blue-50 border border-blue-200 rounded-lg p-2">
                <p class="text-xs text-gray-600">🙏 Oración</p>
                <p class="font-bold text-sm break-words">{{ getDisplayNameByEmail(prog.responsableOracionIntercesora) || prog.responsableOracionIntercesora }}</p>
              </div>
              <div *ngIf="prog.responsableTema" class="bg-green-50 border border-green-200 rounded-lg p-2">
                <p class="text-xs text-gray-600">📖 Tema</p>
                <p class="font-bold text-sm break-words">{{ getDisplayNameByEmail(prog.responsableTema) || prog.responsableTema }}</p>
              </div>
            </div>
          </div>
          
          <div *ngIf="selectedDayPrograms.length === 0" class="text-center py-12 text-gray-500">
            <span class="text-6xl block mb-3">📅</span>
            <p class="text-lg font-medium">No hay programas para este día</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Modal de Edición/Creación (Programas - CRUD) -->
    <div *ngIf="showProgramModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 py-10 overflow-y-auto">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full animate-fadeIn my-auto">
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white rounded-t-lg">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-2xl">📋</span>
              <div>
                <h3 class="text-lg font-bold">{{ program.id ? 'Editar Programa' : 'Crear Programa' }}</h3>
                <p class="text-blue-100 text-xs">Información del programa semanal</p>
              </div>
            </div>
            <button type="button" (click)="closeProgramModal()" class="text-white hover:text-gray-200 text-2xl">&times;</button>
          </div>
        </div>
        
        <form (ngSubmit)="updateProgram()" class="p-4 space-y-4">
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 class="text-md font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span class="text-lg">📅</span>
              Información Básica
            </h4>
            <div class="space-y-3">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Fecha del viernes *</label>
                <input type="date" [(ngModel)]="program.weekStart" name="weekStart" required class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Ubicación *</label>
                <select [(ngModel)]="program.locationId" name="locationId" required class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option [ngValue]="null" disabled selected  >Selecciona una ubicación</option>
                  <option *ngFor="let loc of locations" [value]="loc.id">{{ loc.name }}</option>
                </select>
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Hora inicio *</label>
                  <input type="time" [(ngModel)]="program.hora" name="hora" required class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Hora fin *</label>
                  <input type="time" [(ngModel)]="program.horaFin" name="horaFin" required class="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                </div>
              </div>
            </div>
          </div>
          
          <div class="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <h4 class="text-md font-bold text-gray-800 mb-3 flex items-center gap-2">
              <span class="text-lg">👥</span>
              Responsables
            </h4>
            <div class="space-y-3">
              <!-- Confraternización -->
              <div class="bg-white rounded p-2 border border-pink-200 relative">
                <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <span class="text-sm">🎉</span>
                  Confraternización
                </label>
                <input type="text" 
                       [(ngModel)]="displayConfraternizacion" 
                       name="confraternizacion" 
                       (input)="filterUsers('confraternizacion', $event)"
                       (blur)="hideSuggestionsDelayed()"
                       autocomplete="off"
                       placeholder="Nombre del responsable" 
                       class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-500 focus:border-pink-500">
                <div *ngIf="activeField === 'confraternizacion' && filteredUsers.length > 0 && showUserSuggestions" 
                     class="absolute z-50 w-full left-0 mt-1 bg-white border border-pink-300 rounded shadow-lg max-h-32 overflow-y-auto">
                  <div *ngFor="let user of filteredUsers" 
                       (mousedown)="selectUser('confraternizacion', user)"
                       class="px-2 py-1 hover:bg-pink-50 cursor-pointer border-b border-gray-100 last:border-0">
                    <span class="font-medium text-sm">{{ user.nombre }} {{ user.apellidos }}</span>
                    <span class="text-xs text-gray-500 ml-1">{{ user.email }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Dinámica -->
              <div class="bg-white rounded p-2 border border-yellow-200 relative">
                <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <span class="text-sm">🎮</span>
                  Dinámica
                </label>
                <input type="text" 
                       [(ngModel)]="displayDinamica" 
                       name="dinamica" 
                       (input)="filterUsers('dinamica', $event)"
                       (blur)="hideSuggestionsDelayed()"
                       autocomplete="off"
                       placeholder="Nombre del responsable" 
                       class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500">
                <div *ngIf="activeField === 'dinamica' && filteredUsers.length > 0 && showUserSuggestions" 
                     class="absolute z-50 w-full left-0 mt-1 bg-white border border-yellow-300 rounded shadow-lg max-h-32 overflow-y-auto">
                  <div *ngFor="let user of filteredUsers" 
                       (mousedown)="selectUser('dinamica', user)"
                       class="px-2 py-1 hover:bg-yellow-50 cursor-pointer border-b border-gray-100 last:border-0">
                    <span class="font-medium text-sm">{{ user.nombre }} {{ user.apellidos }}</span>
                    <span class="text-xs text-gray-500 ml-1">{{ user.email }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Especial -->
              <div class="bg-white rounded p-2 border border-purple-200 relative">
                <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <span class="text-sm">⭐</span>
                  Especial
                </label>
                <input type="text" 
                       [(ngModel)]="displayEspecial" 
                       name="especial" 
                       (input)="filterUsers('especial', $event)"
                       (blur)="hideSuggestionsDelayed()"
                       autocomplete="off"
                       placeholder="Nombre del responsable" 
                       class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                <div *ngIf="activeField === 'especial' && filteredUsers.length > 0 && showUserSuggestions" 
                     class="absolute z-50 w-full left-0 mt-1 bg-white border border-purple-300 rounded shadow-lg max-h-32 overflow-y-auto">
                  <div *ngFor="let user of filteredUsers" 
                       (mousedown)="selectUser('especial', user)"
                       class="px-2 py-1 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-0">
                    <span class="font-medium text-sm">{{ user.nombre }} {{ user.apellidos }}</span>
                    <span class="text-xs text-gray-500 ml-1">{{ user.email }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Oración Intercesora -->
              <div class="bg-white rounded p-2 border border-blue-200 relative">
                <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <span class="text-sm">🙏</span>
                  Oración Intercesora
                </label>
                <input type="text" 
                       [(ngModel)]="displayOracion" 
                       name="oracion" 
                       (input)="filterUsers('oracion', $event)"
                       (blur)="hideSuggestionsDelayed()"
                       autocomplete="off"
                       placeholder="Nombre del responsable" 
                       class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <div *ngIf="activeField === 'oracion' && filteredUsers.length > 0 && showUserSuggestions" 
                     class="absolute z-50 w-full left-0 mt-1 bg-white border border-blue-300 rounded shadow-lg max-h-32 overflow-y-auto">
                  <div *ngFor="let user of filteredUsers" 
                       (mousedown)="selectUser('oracion', user)"
                       class="px-2 py-1 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0">
                    <span class="font-medium text-sm">{{ user.nombre }} {{ user.apellidos }}</span>
                    <span class="text-xs text-gray-500 ml-1">{{ user.email }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Tema -->
              <div class="bg-white rounded p-2 border border-green-200 relative">
                <label class="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                  <span class="text-sm">📝</span>
                  Tema
                </label>
                <input type="text" 
                       [(ngModel)]="displayTema" 
                       name="tema" 
                       (input)="filterUsers('tema', $event)"
                       (blur)="hideSuggestionsDelayed()"
                       autocomplete="off"
                       placeholder="Nombre del responsable" 
                       class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-green-500">
                <div *ngIf="activeField === 'tema' && filteredUsers.length > 0 && showUserSuggestions" 
                     class="absolute z-50 w-full left-0 mt-1 bg-white border border-green-300 rounded shadow-lg max-h-32 overflow-y-auto">
                  <div *ngFor="let user of filteredUsers" 
                       (mousedown)="selectUser('tema', user)"
                       class="px-2 py-1 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-0">
                    <span class="font-medium text-sm">{{ user.nombre }} {{ user.apellidos }}</span>
                    <span class="text-xs text-gray-500 ml-1">{{ user.email }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex gap-2 pt-3 border-t">
            <button type="button" (click)="closeProgramModal()" class="flex-1 px-3 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium">
              Cancelar
            </button>
            <button type="submit" class="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition font-medium shadow-md">
              {{ program.id ? '💾 Actualizar' : '✨ Crear' }} Programa
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <div *ngIf="showLocationModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-fadeIn">
        <div class="p-6">
          <h3 class="text-xl font-bold mb-4">📍 {{ editingLocation ? 'Editar' : 'Agregar' }} Ubicación</h3>
          <div class="space-y-4">
            <input type="text" [(ngModel)]="newLocation.name" placeholder="Nombre del lugar" class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500">
            <input type="text" [(ngModel)]="newLocation.address" placeholder="Dirección" class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500">
            <input type="text" [(ngModel)]="newLocation.googleMapsUrl" placeholder="URL de Google Maps (https://maps.app.goo.gl/...)" class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-red-500">
          </div>
          <div class="flex gap-3 mt-6">
            <button (click)="closeLocationModal()" class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
              Cancelar
            </button>
            <button (click)="saveLocation()" class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
              {{ editingLocation ? 'Actualizar' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div *ngIf="showDeleteLocationModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 animate-fadeIn">
        <div class="p-6">
          <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-center mb-2">¿Eliminar esta ubicación?</h3>
          <p class="text-gray-600 text-center mb-2">{{ locationToDelete?.name }}</p>
          <p class="text-sm text-gray-500 text-center mb-6">Esta acción no se puede deshacer</p>
          <div class="flex gap-3">
            <button (click)="cancelDeleteLocation()" class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
              Cancelar
            </button>
            <button (click)="confirmDeleteLocation()" class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div *ngIf="showDeleteProgramModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-fadeIn">
        <div class="p-6">
          <div class="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
            <span class="text-4xl">⚠️</span>
          </div>
          <h3 class="text-2xl font-bold text-center mb-2 text-gray-900">¿Eliminar este programa?</h3>
          <div class="bg-gray-50 rounded-lg p-4 my-4 border-2 border-gray-200">
            <p class="font-semibold text-gray-800 text-center text-lg">
              {{ programToDelete?.weekStart | date:'EEEE, d MMMM yyyy' }}
            </p>
            <p class="text-gray-600 text-center mt-1">
              {{ programToDelete?.hora }} - {{ programToDelete?.horaFin }}
            </p>
            <p class="text-gray-600 text-center text-sm mt-2">
              📍 {{ programToDelete?.location?.name }}
            </p>
          </div>
          <div class="bg-red-50 border-l-4 border-red-500 p-3 mb-4">
            <p class="text-sm text-red-700 font-medium">⚠️ Esta acción no se puede deshacer</p>
          </div>
          <div class="flex gap-3">
            <button (click)="cancelDeleteProgram()" class="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold">
              Cancelar
            </button>
            <button (click)="confirmDeleteProgram()" class="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold">
              🗑️ Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div *ngIf="showSuccessNotification" class="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl animate-slide-in flex items-center gap-3">
      <span class="text-2xl">✅</span>
      <span class="font-semibold">{{ successMessage }}</span>
    </div>
    
    <!-- Notificación de Error -->
    <div *ngIf="showErrorNotification" class="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-4 rounded-lg shadow-2xl animate-slide-in flex items-center gap-3 max-w-md">
      <span class="text-2xl">❌</span>
      <span class="font-semibold">{{ errorMessage }}</span>
    </div>
    
    <!-- Notificación de Advertencia -->
    <div *ngIf="showWarningNotification" class="fixed top-4 right-4 z-50 bg-amber-500 text-white px-6 py-4 rounded-lg shadow-2xl animate-slide-in flex items-center gap-3 max-w-md">
      <span class="text-2xl">⚠️</span>
      <span class="font-semibold">{{ warningMessage }}</span>
    </div>
    
    <!-- Notificación de Info -->
    <div *ngIf="showInfoNotification" class="fixed top-4 right-4 z-50 bg-blue-500 text-white px-6 py-4 rounded-lg shadow-2xl animate-slide-in flex items-center gap-3 max-w-md">
      <span class="text-2xl">ℹ️</span>
      <span class="font-semibold">{{ infoMessage }}</span>
    </div>
    
    <!-- Panel QR Persistente (Lateral Derecho) -->
    <div *ngIf="showQrPanel" class="fixed top-0 right-0 h-full bg-white shadow-2xl z-40 transition-all duration-300"
         [ngClass]="isQrPanelMinimized ? 'w-16' : 'w-full md:w-96'">
      
      <!-- Panel Minimizado -->
      <div *ngIf="isQrPanelMinimized" class="h-full flex flex-col items-center justify-center bg-gradient-to-b from-green-600 to-emerald-600 text-white p-4">
        <button (click)="toggleQrPanel()" class="mb-4 hover:scale-110 transition">
          <span class="text-3xl">📱</span>
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
              <p class="text-xs text-green-100">{{ attendanceList.length }}/{{ totalUsers }} presentes</p>
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
    
    <!-- Modal Scanner -->
    <div *ngIf="showScannerModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full animate-fadeIn">
        <div class="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white rounded-t-2xl">
          <div class="flex items-center gap-3">
            <span class="text-4xl">📷</span>
            <div>
              <h3 class="text-2xl font-bold">Escanear QR de Asistencia</h3>
              <p class="text-indigo-100 text-sm">Apunta la cámara al código QR del usuario</p>
            </div>
          </div>
        </div>
        
        <div class="p-6">
          <div class="bg-gray-900 rounded-lg overflow-hidden mb-4" style="height: 400px;">
            <!-- Aquí iría el componente de scanner cuando se implemente -->
            <div class="flex items-center justify-center h-full text-white">
              <div class="text-center">
                <span class="text-6xl mb-4 block">📷</span>
                <p class="text-lg">Vista de cámara aquí</p>
                <p class="text-sm text-gray-400 mt-2">Componente de scanner pendiente</p>
              </div>
            </div>
          </div>
          
          <button (click)="closeScannerModal()" class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition font-semibold w-full">
            Cerrar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Cambio de Rol -->
    <div *ngIf="showChangeRoleModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 class="text-xl font-bold mb-4 text-indigo-700">⚙️ Cambiar Rol de Usuario</h3>
        
        <div class="mb-4">
          <p class="text-gray-700 mb-2">Usuario: <strong>{{ selectedUser?.nombre }} {{ selectedUser?.apellidos }}</strong></p>
          <p class="text-gray-600 text-sm">{{ selectedUser?.email }}</p>
          <p class="text-gray-600 text-sm">Rol actual: <strong>{{ getRoleDisplayName(selectedUser?.rol) }}</strong></p>
        </div>
        
        <div class="mb-6">
          <label class="block text-gray-700 font-medium mb-2">Nuevo Rol:</label>
          <select [(ngModel)]="newRole" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
            <option value="MIEMBRO">Miembro</option>
            <option value="LIDER">Líder</option>
          </select>
        </div>
        
        <div class="flex gap-3">
          <button (click)="cancelChangeRole()" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition">
            Cancelar
          </button>
          <button (click)="confirmChangeRole()" class="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition">
            Confirmar Cambio
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Cambio de Rol -->
    <div *ngIf="showChangeRoleModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 class="text-xl font-bold mb-4 text-indigo-700">⚙️ Cambiar Rol de Usuario</h3>
        
        <div class="mb-4">
          <p class="text-gray-700 mb-2">Usuario: <strong>{{ selectedUser?.nombre }} {{ selectedUser?.apellidos }}</strong></p>
          <p class="text-gray-600 text-sm">{{ selectedUser?.email }}</p>
          <p class="text-gray-600 text-sm">Rol actual: <strong>{{ getRoleDisplayName(selectedUser?.rol) }}</strong></p>
        </div>
        
        <div class="mb-6">
          <label class="block text-gray-700 font-medium mb-2">Nuevo Rol:</label>
          <select [(ngModel)]="newRole" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500">
            <option value="MIEMBRO">Miembro</option>
            <option value="LIDER">Líder</option>
          </select>
        </div>
        
        <div class="flex gap-3">
          <button (click)="cancelChangeRole()" class="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition">
            Cancelar
          </button>
          <button (click)="confirmChangeRole()" class="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition">
            Confirmar Cambio
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes fadeIn {
      from { 
        opacity: 0;
      }
      to { 
        opacity: 1;
      }
    }
    .animate-fadeIn {
      animation: fadeIn 1s ease-in-out;
    }
    @keyframes slide-in {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `]
})
export class AdminComponent implements OnInit, OnDestroy {
  activeModule = 'cronograma';
  users: any[] = [];
  program = {
    id: null,
    weekStart: '',
    hora: '20:00',
    horaFin: '22:00',
    locationId: null,
    responsableConfraternizacion: '',
    responsableDinamica: '',
    responsableEspecial: '',
    responsableOracionIntercesora: '',
    responsableTema: ''
  };
  locations: any[] = [];
  allPrograms: any[] = [];
  newLocation = { name: '', address: '', googleMapsUrl: '' };
  editingLocation: any = null;
  showDeleteLocationModal = false;
  locationToDelete: any = null;
  showProgramModal = false;
  showLocationModal = false;
  showDeleteProgramModal = false;
  programToDelete: any = null;
  showSuccessNotification = false;
  successMessage = '';
  showErrorNotification = false;
  errorMessage = '';
  showWarningNotification = false;
  warningMessage = '';
  showInfoNotification = false;
  infoMessage = '';
  activeMeeting: any = null;
  showQrPanel = false;
  isQrPanelMinimized = false;
  showScannerModal = false;
  qrCodeUrl = '';
  attendanceList: any[] = [];
  attendancePolling: any = null;
  totalUsers = 0;
  showManualCodeInput = false;
  manualCode = '';
  
  // Modal de visualización de programa (cronograma)
  showViewProgramModal = false;
  selectedProgram: any = null;
  selectedDayPrograms: any[] = [];

  // Propiedades del calendario
  currentMonth: number = new Date().getMonth();
  currentYear: number = new Date().getFullYear();
  calendarDays: any[] = [];
  weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

  // Propiedades del módulo de asistencias
  attendanceReport: any = null;
  usersNeedingAlert: any[] = [];
  
  // Variables para gestión de usuarios
  allUsers: any[] = [];
  loadingUsers = false;
  showChangeRoleModal = false;
  selectedUser: any = null;
  newRole = '';
  
  attendanceTab: string = 'todos'; // 'todos' o 'personal'
  myAttendances: any[] = [];
  myAttendanceStats = { total: 0, attended: 0, missed: 0 };
  myAttendancePercentage = 0;
  loadingMyAttendances = false;

  // Birthday notifications
  birthdays: any[] = [];
  showBirthdayBanner = false;

  // Autocomplete para responsables
  filteredUsers: any[] = [];
  activeField: string = '';
  showUserSuggestions = false;
  currentUserEmail = '';
  
  // Campos de visualización (muestran nombres, mientras el modelo guarda emails)
  displayConfraternizacion = '';
  displayDinamica = '';
  displayEspecial = '';
  displayOracion = '';
  displayTema = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Obtener email del usuario actual
    const userData = localStorage.getItem('user');
    if (userData) {
      this.currentUserEmail = JSON.parse(userData).email;
    }

    // Verificar permisos según el módulo solicitado
    this.route.queryParams.subscribe(params => {
      if (params['m']) {
        this.activeModule = params['m'];
        
        // Solo restringir acceso a módulos que requieren ser líder
        if (this.activeModule !== 'cronograma' && !this.authService.isLider()) {
          this.showWarningAlert('⚠️ Solo el líder puede acceder a este módulo');
          this.router.navigate(['/dashboard']);
          return;
        }
        
        // Restricción específica para gestión de usuarios (solo admin)
        if (this.activeModule === 'usuarios' && !this.authService.isAdmin()) {
          this.showWarningAlert('⚠️ Solo el administrador puede gestionar usuarios');
          this.router.navigate(['/dashboard']);
          return;
        }
        
        // Cargar datos específicos según el módulo
        if (this.activeModule === 'asistencias') {
          this.loadAttendanceReport();
          this.loadMyAttendances();
        } else if (this.activeModule === 'usuarios') {
          this.loadAllUsers();
        }
      } else {
        // Si no hay módulo especificado y no es líder, redirigir
        if (!this.authService.isLider()) {
          this.showWarningAlert('⚠️ Solo el líder puede acceder a este módulo');
          this.router.navigate(['/dashboard']);
          return;
        }
      }
    });
    
    this.loadUsers();
    this.loadLocations();
    this.loadAllPrograms();
    this.loadActiveMeeting();
    this.generateCalendar();
  }

  ngOnDestroy(): void {
    this.stopAttendancePolling();
  }

  // ========== MÉTODOS DEL CALENDARIO ==========
  
  generateCalendar(): void {
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    const prevLastDay = new Date(this.currentYear, this.currentMonth, 0);
    
    const firstDayIndex = firstDay.getDay();
    const lastDayDate = lastDay.getDate();
    const prevLastDayDate = prevLastDay.getDate();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    this.calendarDays = [];
    
    // Días del mes anterior
    for (let i = firstDayIndex; i > 0; i--) {
      const dayNum = prevLastDayDate - i + 1;
      const date = new Date(this.currentYear, this.currentMonth - 1, dayNum);
      this.calendarDays.push({
        number: dayNum,
        date: date,
        isOtherMonth: true,
        isToday: false,
        hasProgram: false,
        program: null,
        programTime: ''
      });
    }
    
    // Días del mes actual
    for (let i = 1; i <= lastDayDate; i++) {
      const date = new Date(this.currentYear, this.currentMonth, i);
      const isToday = date.getTime() === today.getTime();
      const programsForDay = this.getProgramsForDate(date);
      
      this.calendarDays.push({
        number: i,
        date: date,
        isOtherMonth: false,
        isToday: isToday,
        hasProgram: programsForDay.length > 0,
        programs: programsForDay,
        programCount: programsForDay.length,
        programTime: programsForDay.length > 0 ? `${programsForDay[0].hora}` : ''
      });
    }
    
    // Días del mes siguiente para completar la cuadrícula
    const remainingDays = 42 - this.calendarDays.length; // 6 semanas completas
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(this.currentYear, this.currentMonth + 1, i);
      this.calendarDays.push({
        number: i,
        date: date,
        isOtherMonth: true,
        isToday: false,
        hasProgram: false,
        program: null,
        programTime: ''
      });
    }
  }
  
  getProgramsForDate(date: Date): any[] {
    return this.allPrograms.filter(prog => {
      // Parsear fecha manualmente para evitar conversión UTC
      const [year, month, day] = prog.weekStart.split('-').map(Number);
      const programDate = new Date(year, month - 1, day);
      programDate.setHours(0, 0, 0, 0);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      return programDate.getTime() === checkDate.getTime();
    });
  }
  
  getProgramForDate(date: Date): any {
    const programs = this.getProgramsForDate(date);
    return programs.length > 0 ? programs[0] : null;
  }
  
  previousMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }
  
  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }
  
  getMonthName(monthIndex: number): string {
    return this.monthNames[monthIndex];
  }
  
  getMonthProgramCount(): number {
    return this.calendarDays.filter(day => day.hasProgram && !day.isOtherMonth).length;
  }
  
  openProgramModalForDate(date: Date): void {
    this.resetProgramForm();
    // Formatear fecha como YYYY-MM-DD
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const dayNum = String(date.getDate()).padStart(2, '0');
    this.program.weekStart = `${year}-${month}-${dayNum}`;
    this.showProgramModal = true;
  }
  
  viewDayPrograms(day: any): void {
    if (day.isOtherMonth || !day.hasProgram) return;
    
    this.selectedDayPrograms = day.programs;
    this.selectedProgram = day.programs[0]; // Para la fecha en el título
    this.showViewProgramModal = true;
  }
  
  closeViewModal(): void {
    this.showViewProgramModal = false;
    this.selectedProgram = null;
    this.selectedDayPrograms = [];
  }

  shareToWhatsApp(program: any): void {
    const fechaFormateada = new Date(program.weekStart).toLocaleDateString('es-PE', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    let texto = '🔔 *PROGRAMA AETOS* 🔔\n\n';
    texto += '📅 *Fecha:* ' + fechaFormateada + '\n';
    texto += '🕐 *Hora:* ' + program.hora + ' - ' + program.horaFin + '\n';
    if (program.location) {
      texto += '📍 *Lugar:* ' + program.location.name + '\n';
      if (program.location.googleMapsUrl) texto += '🗺️ ' + program.location.googleMapsUrl + '\n';
    }
    texto += '\n*👥 RESPONSABLES:*\n\n';
    const nConf = this.getDisplayNameByEmail(program.responsableConfraternizacion) || program.responsableConfraternizacion;
    const nDin = this.getDisplayNameByEmail(program.responsableDinamica) || program.responsableDinamica;
    const nEsp = this.getDisplayNameByEmail(program.responsableEspecial) || program.responsableEspecial;
    const nOra = this.getDisplayNameByEmail(program.responsableOracionIntercesora) || program.responsableOracionIntercesora;
    const nTema = this.getDisplayNameByEmail(program.responsableTema) || program.responsableTema;
    if (program.responsableConfraternizacion) texto += '🎉 *Confraternización:* ' + nConf + '\n';
    if (program.responsableDinamica) texto += '🎮 *Dinámica:* ' + nDin + '\n';
    if (program.responsableEspecial) texto += '⭐ *Especial:* ' + nEsp + '\n';
    if (program.responsableOracionIntercesora) texto += '🙏 *Oración Intercesora:* ' + nOra + '\n';
    if (program.responsableTema) texto += '📖 *Tema:* ' + nTema + '\n';
    texto += '\n¡Los esperamos! 🙏✨';

    const legacyCopy = () => {
      const ta = document.createElement('textarea');
      ta.value = texto;
      ta.style.position = 'fixed';
      ta.style.top = '0';
      ta.style.left = '0';
      ta.style.width = '1px';
      ta.style.height = '1px';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch {}
      document.body.removeChild(ta);
      return ok;
    };

    const shareApi = (navigator as any).share;
    if (shareApi) {
      shareApi.call(navigator, { title: 'Programa AETOS', text: texto })
        .then(() => this.showSuccessAlert('✅ Abre WhatsApp y pega el programa.'))
        .catch(() => {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(texto).then(() => {
              this.showSuccessAlert('✅ Programa copiado al portapapeles. Pégalo en WhatsApp.');
            }).catch(() => {
              if (legacyCopy()) this.showSuccessAlert('✅ Programa copiado al portapapeles. Pégalo en WhatsApp.');
              else this.showErrorAlert('❌ No se pudo copiar. Mantén presionado en WhatsApp para pegar manualmente.');
            });
          } else {
            if (legacyCopy()) this.showSuccessAlert('✅ Programa copiado al portapapeles. Pégalo en WhatsApp.');
            else this.showErrorAlert('❌ No se pudo copiar. Mantén presionado en WhatsApp para pegar manualmente.');
          }
        });
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(() => {
        this.showSuccessAlert('✅ Programa copiado al portapapeles. Pégalo en WhatsApp.');
      }).catch(() => {
        if (legacyCopy()) this.showSuccessAlert('✅ Programa copiado al portapapeles. Pégalo en WhatsApp.');
        else this.showErrorAlert('❌ No se pudo copiar. Mantén presionado en WhatsApp para pegar manualmente.');
      });
    } else {
      if (legacyCopy()) this.showSuccessAlert('✅ Programa copiado al portapapeles. Pégalo en WhatsApp.');
      else this.showErrorAlert('❌ No se pudo copiar. Mantén presionado en WhatsApp para pegar manualmente.');
    }
  }

  // ========== FIN MÉTODOS DEL CALENDARIO ==========

  loadUsers(): void {
    // Usar endpoint público /api/users que está disponible para todos los usuarios autenticados
    this.authService.getUsers().subscribe({
      next: (data: any) => {
        // El endpoint /api/users devuelve {id, nombre: "Nombre Apellido", usuario}
        // Necesitamos separar nombre y apellidos para el autocompletado
        this.users = data.map((user: any) => {
          const nombreParts = (user.nombre || '').split(' ');
          const nombre = nombreParts[0] || '';
          const apellidos = nombreParts.slice(1).join(' ') || '';
          return {
            ...user,
            nombre: nombre,
            apellidos: apellidos,
            nombreCompleto: user.nombre || ''
          };
        });
        this.totalUsers = data.length;
      },
      error: (err: any) => {
        console.error('Error cargando usuarios:', err);
      }
    });
  }

  updateProgram(): void {
    const isUpdate = !!this.program.id;
    this.authService.updateProgram(this.program).subscribe({
      next: () => {
        this.loadAllPrograms();
        this.showProgramModal = false;
        this.resetProgramForm();
        this.showSuccessAlert(isUpdate ? '✅ Programa actualizado exitosamente' : '✅ Programa creado exitosamente');
      },
      error: (err: any) => {
        if (err.error?.error) {
          this.showErrorAlert('❌ ' + err.error.error);
        } else {
          this.showErrorAlert('❌ Error al guardar programa');
        }
      }
    });
  }

  resetProgramForm(): void {
    this.program = {
      id: null,
      weekStart: '',
      hora: '20:00',
      horaFin: '22:00',
      locationId: null,
      responsableConfraternizacion: '',
      responsableDinamica: '',
      responsableEspecial: '',
      responsableOracionIntercesora: '',
      responsableTema: ''
    };
    // Limpiar autocompletado y campos display
    this.filteredUsers = [];
    this.activeField = '';
    this.showUserSuggestions = false;
    this.displayConfraternizacion = '';
    this.displayDinamica = '';
    this.displayEspecial = '';
    this.displayOracion = '';
    this.displayTema = '';
  }

  // ========== MÉTODOS DE AUTOCOMPLETADO DE USUARIOS ==========
  
  filterUsers(field: string, event: Event): void {
    const inputValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.activeField = field;
    
    // Solo mostrar sugerencias si hay al menos 1 caracter
    if (inputValue.length < 1) {
      this.filteredUsers = [];
      this.showUserSuggestions = false;
      return;
    }
    
    // Filtrar usuarios excluyendo cuentas con rol ADMIN
    this.filteredUsers = this.users.filter(user => {
      // Excluir todos los usuarios con rol ADMIN
      if (user.rol === 'ADMIN') {
        return false;
      }
      
      const nombre = (user.nombre || '').toLowerCase();
      const apellidos = (user.apellidos || '').toLowerCase();
      const nombreCompleto = `${nombre} ${apellidos}`;
      
      return nombre.startsWith(inputValue) || 
             apellidos.startsWith(inputValue) || 
             nombreCompleto.includes(inputValue);
    }).slice(0, 5); // Limitar a 5 resultados
    
    this.showUserSuggestions = this.filteredUsers.length > 0;
  }

  selectUser(field: string, user: any): void {
    // Guardar el email en el modelo (para backend) y el nombre en display (para usuario)
    const userEmail = user.email;
    const displayName = `${user.nombre} ${user.apellidos}`;
    
    switch(field) {
      case 'confraternizacion':
        this.program.responsableConfraternizacion = userEmail;
        this.displayConfraternizacion = displayName;
        break;
      case 'dinamica':
        this.program.responsableDinamica = userEmail;
        this.displayDinamica = displayName;
        break;
      case 'especial':
        this.program.responsableEspecial = userEmail;
        this.displayEspecial = displayName;
        break;
      case 'oracion':
        this.program.responsableOracionIntercesora = userEmail;
        this.displayOracion = displayName;
        break;
      case 'tema':
        this.program.responsableTema = userEmail;
        this.displayTema = displayName;
        break;
    }
    
    this.filteredUsers = [];
    this.showUserSuggestions = false;
    this.activeField = '';
  }

  hideSuggestionsDelayed(): void {
    // Pequeño delay para permitir que el click en la sugerencia se registre
    setTimeout(() => {
      this.showUserSuggestions = false;
      this.activeField = '';
    }, 200);
  }

  // ========== FIN MÉTODOS DE AUTOCOMPLETADO ==========

  getDisplayNameByEmail(email: string): string {
    if (!email) return '';
    const u = this.users.find(x => (x.email || '').toLowerCase() === email.toLowerCase());
    if (!u) return '';
    const full = (u.nombreCompleto || '').trim();
    if (full) return full;
    return `${u.nombre || ''} ${u.apellidos || ''}`.trim();
  }

  loadAllPrograms(): void {
    this.authService.getAllPrograms().subscribe({
      next: (data: any) => {
        this.allPrograms = data;
        this.generateCalendar(); // Regenerar calendario cuando cambian los programas
      },
      error: (err: any) => console.error('Error loading programs', err)
    });
  }

  editProgram(prog: any): void {
    this.program = {
      id: prog.id,
      weekStart: prog.weekStart,
      hora: prog.hora,
      horaFin: prog.horaFin,
      locationId: prog.location?.id || null,
      responsableConfraternizacion: prog.responsableConfraternizacion,
      responsableDinamica: prog.responsableDinamica,
      responsableEspecial: prog.responsableEspecial,
      responsableOracionIntercesora: prog.responsableOracionIntercesora,
      responsableTema: prog.responsableTema
    };
    this.displayConfraternizacion = this.getDisplayNameByEmail(prog.responsableConfraternizacion);
    this.displayDinamica = this.getDisplayNameByEmail(prog.responsableDinamica);
    this.displayEspecial = this.getDisplayNameByEmail(prog.responsableEspecial);
    this.displayOracion = this.getDisplayNameByEmail(prog.responsableOracionIntercesora);
    this.displayTema = this.getDisplayNameByEmail(prog.responsableTema);
    this.showProgramModal = true;
  }

  deleteProgram(id: number): void {
    this.programToDelete = this.allPrograms.find(p => p.id === id);
    this.showDeleteProgramModal = true;
  }

  confirmDeleteProgram(): void {
    if (!this.programToDelete) return;
    
    this.authService.deleteProgram(this.programToDelete.id).subscribe({
      next: () => {
        this.loadAllPrograms();
        this.showDeleteProgramModal = false;
        this.programToDelete = null;
        this.showSuccessAlert('✅ Programa eliminado exitosamente');
      },
      error: (err: any) => {
        this.showDeleteProgramModal = false;
        this.programToDelete = null;
        if (err.error?.error) {
          this.showErrorAlert('❌ ' + err.error.error);
        } else {
          this.showErrorAlert('❌ Error al eliminar programa');
        }
      }
    });
  }

  cancelDeleteProgram(): void {
    this.showDeleteProgramModal = false;
    this.programToDelete = null;
  }

  showSuccessAlert(message: string): void {
    this.successMessage = message;
    this.showSuccessNotification = true;
    setTimeout(() => {
      this.showSuccessNotification = false;
      this.successMessage = '';
    }, 3000);
  }

  showErrorAlert(message: string): void {
    this.errorMessage = message;
    this.showErrorNotification = true;
    setTimeout(() => {
      this.showErrorNotification = false;
      this.errorMessage = '';
    }, 4000);
  }

  showWarningAlert(message: string): void {
    this.warningMessage = message;
    this.showWarningNotification = true;
    setTimeout(() => {
      this.showWarningNotification = false;
      this.warningMessage = '';
    }, 4000);
  }

  showInfoAlert(message: string): void {
    this.infoMessage = message;
    this.showInfoNotification = true;
    setTimeout(() => {
      this.showInfoNotification = false;
      this.infoMessage = '';
    }, 3000);
  }

  isPastProgram(prog: any): boolean {
    if (!prog || !prog.weekStart) {
      return false;
    }
    
    const now = new Date();
    const [year, month, day] = prog.weekStart.split('-').map(Number);
    const programDate = new Date(year, month - 1, day);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return programDate < today;
  }

  isProgramActive(prog: any): boolean {
    if (!prog || !prog.weekStart || !prog.hora || !prog.horaFin) {
      return false;
    }
    
    const now = new Date();
    const [year, month, day] = prog.weekStart.split('-').map(Number);
    const [startHour, startMin] = prog.hora.split(':').map(Number);
    const [endHour, endMin] = prog.horaFin.split(':').map(Number);
    
    const programDate = new Date(year, month - 1, day);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (programDate.getTime() !== today.getTime()) {
      return false;
    }
    
    const startTime = new Date(year, month - 1, day, startHour, startMin);
    const endTime = new Date(year, month - 1, day, endHour, endMin);
    
    return now >= startTime && now <= endTime;
  }

  getProgramStatus(prog: any): string {
    if (this.isPastProgram(prog)) return 'past';
    if (this.isProgramActive(prog)) return 'active';
    return 'upcoming';
  }

  loadActiveMeeting(): void {
    console.log('Cargando reunión activa...');
    this.authService.getActiveMeeting().subscribe({
      next: (data: any) => {
        console.log('Reunión activa obtenida:', data);
        console.log('Tiene tokenQr?', data?.tokenQr);
        console.log('Data completo:', JSON.stringify(data, null, 2));
        
        // Solo actualizar si hay una reunión válida y activa
        if (data && data.id && data.activa) {
          this.activeMeeting = data;
          if (data.tokenQr) {
            console.log('Generando QR con token:', data.tokenQr);
            this.generateQrCode(data.tokenQr);
          } else {
            console.warn('No hay tokenQr en la reunión activa');
          }
        } else {
          console.log('No hay reunión activa válida');
          this.activeMeeting = null;
        }
      },
      error: (err: any) => {
        console.log('No hay reunión activa o error:', err);
        this.activeMeeting = null;
      }
    });
  }

  createMeeting(): void {
    console.log('Creando reunión...');
    this.authService.createMeeting().subscribe({
      next: (data: any) => {
        console.log('Reunión creada:', data);
        this.activeMeeting = data;
        this.showQrPanel = true;
        this.isQrPanelMinimized = false;
        if (data && data.tokenQr) {
          this.generateQrCode(data.tokenQr);
          // Auto-registrar al líder que creó la reunión
          this.autoMarkLeaderAttendance(data.tokenQr);
          // Iniciar polling de asistencias
          this.startAttendancePolling();
        } else {
          console.error('No se recibió tokenQr en la respuesta');
          this.showWarningAlert('⚠️ Reunión creada pero sin token QR');
        }
        this.showSuccessAlert('✅ Reunión creada - Tu asistencia fue registrada automáticamente');
      },
      error: (err: any) => {
        console.error('Error creando reunión:', err);
        if (err.status === 403) {
          this.showErrorAlert('❌ No tienes permisos para crear reuniones. Solo LÍDERES y ADMINS pueden hacerlo.');
        } else if (err.error?.error) {
          this.showErrorAlert('❌ ' + err.error.error);
        } else {
          this.showErrorAlert('❌ Error al crear reunión: ' + (err.message || 'Error desconocido'));
        }
      }
    });
  }

  async generateQrCode(token: string): Promise<void> {
    try {
      console.log('Generando QR con token:', token);
      this.qrCodeUrl = await QRCode.toDataURL(token, {
        width: 300,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      });
      console.log('QR generado exitosamente');
    } catch (err) {
      console.error('Error generando QR:', err);
      this.showErrorAlert('❌ Error al generar código QR: ' + err);
    }
  }

  openQrModal(): void {
    console.log('openQrModal - activeMeeting:', this.activeMeeting);
    
    // Si ya tenemos una reunión activa en memoria con token válido, usarla directamente
    if (this.activeMeeting && this.activeMeeting.id && this.activeMeeting.tokenQr && this.activeMeeting.activa) {
      console.log('Mostrando QR de la reunión activa:', this.activeMeeting);
      this.showQrPanel = true;
      this.isQrPanelMinimized = false;
      this.generateQrCode(this.activeMeeting.tokenQr);
      if (!this.attendancePolling) {
        this.startAttendancePolling();
      }
      return;
    }
    
    // Si no hay reunión en memoria, buscar o crear la reunión del programa activo
    this.authService.getActiveMeeting().subscribe({
      next: (data: any) => {
        if (data && data.id && data.tokenQr && data.activa) {
          // Ya existe una reunión activa para el programa de hoy
          console.log('Reunión del programa encontrada:', data);
          this.activeMeeting = data;
          this.showQrPanel = true;
          this.isQrPanelMinimized = false;
          this.generateQrCode(data.tokenQr);
          if (!this.attendancePolling) {
            this.startAttendancePolling();
          }
        } else {
          // Crear reunión para el programa activo
          console.log('Creando reunión para el programa activo');
          this.createMeeting();
        }
      },
      error: () => {
        console.log('Error al verificar reunión, creando para el programa activo');
        this.createMeeting();
      }
    });
  }

  autoMarkLeaderAttendance(tokenQr: string): void {
    console.log('Auto-registrando asistencia del líder...');
    this.authService.markAttendance(tokenQr).subscribe({
      next: (response: any) => {
        console.log('Asistencia del líder registrada:', response);
      },
      error: (err: any) => {
        console.error('Error al auto-registrar líder:', err);
        // No mostrar alerta para no interrumpir, solo log
      }
    });
  }

  startAttendancePolling(): void {
    // Cargar asistencias inmediatamente
    this.loadAttendances();
    // Actualizar cada 2 segundos para tiempo real
    this.attendancePolling = setInterval(() => {
      if (this.showQrPanel && !this.isQrPanelMinimized) {
        this.loadAttendances();
      }
    }, 2000);
  }

  stopAttendancePolling(): void {
    if (this.attendancePolling) {
      clearInterval(this.attendancePolling);
      this.attendancePolling = null;
    }
  }

  loadAttendances(): void {
    this.authService.getActiveMeetingAttendances().subscribe({
      next: (data: any) => {
        console.log('=== ASISTENCIAS RECIBIDAS ===');
        console.log('Datos completos:', data);
        
        // Si la reunión expiró, cerrar el modal automáticamente
        if (data.expired === true) {
          console.log('⏰ Reunión finalizada - cerrando modal automáticamente');
          this.closeQrPanel();
          return;
        }
        
        // El backend devuelve: {meeting, attendances: [], expiresAt, expired}
        this.attendanceList = data.attendances || [];
        console.log('✅ Lista actualizada:', this.attendanceList.length, 'asistencias');
        console.log('📋 Primera asistencia (estructura):', this.attendanceList[0]);
      },
      error: (err: any) => console.error('Error cargando asistencias:', err)
    });
  }

  submitManualCode(): void {
    if (!this.manualCode || this.manualCode.trim() === '') {
      this.showWarningAlert('⚠️ Por favor ingresa un código');
      return;
    }
    
    this.authService.markAttendance(this.manualCode.trim()).subscribe({
      next: (response: any) => {
        this.showSuccessAlert('✅ Asistencia registrada exitosamente');
        this.manualCode = '';
        this.showManualCodeInput = false;
        this.loadAttendances();
      },
      error: (err: any) => {
        if (err.error?.error) {
          this.showErrorAlert('❌ ' + err.error.error);
        } else {
          this.showErrorAlert('❌ Código inválido o ya usado');
        }
      }
    });
  }

  closeQrPanel(): void {
    this.showQrPanel = false;
    this.stopAttendancePolling();
    this.attendanceList = [];
  }

  toggleQrPanel(): void {
    this.isQrPanelMinimized = !this.isQrPanelMinimized;
  }

  copyCode(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      this.showSuccessAlert('✅ Copiado');
    }).catch(() => {
      this.showErrorAlert('❌ Error al copiar');
    });
  }

  openScannerModal(): void {
    this.showScannerModal = true;
  }

  closeScannerModal(): void {
    this.showScannerModal = false;
  }

  openProgramModal(): void {
    this.resetProgramForm();
    this.showProgramModal = true;
  }

  closeProgramModal(): void {
    this.showProgramModal = false;
    this.resetProgramForm();
  }

  loadLocations(): void {
    this.authService.getLocations().subscribe({
      next: (data: any) => (this.locations = data),
      error: (err: any) => console.error('Error loading locations', err)
    });
  }

  saveLocation(): void {
    if (!this.newLocation.name || !this.newLocation.googleMapsUrl) {
      this.showWarningAlert('⚠️ Por favor completa nombre y URL de Google Maps');
      return;
    }

    if (this.editingLocation) {
      this.authService
        .updateLocation(this.editingLocation.id, this.newLocation)
        .subscribe({
          next: () => {
            this.loadLocations();
            this.closeLocationModal();
            this.showSuccessAlert('✅ Ubicación actualizada exitosamente');
          },
          error: (err: any) => this.showErrorAlert('❌ Error al actualizar ubicación')
        });
    } else {
      this.authService.createLocation(this.newLocation).subscribe({
        next: () => {
          this.loadLocations();
          this.closeLocationModal();
          this.showSuccessAlert('✅ Ubicación creada exitosamente');
        },
        error: (err: any) => this.showErrorAlert('❌ Error al crear ubicación')
      });
    }
  }

  editLocation(loc: any): void {
    this.editingLocation = loc;
    this.newLocation = {
      name: loc.name,
      address: loc.address,
      googleMapsUrl: loc.googleMapsUrl
    };
    this.showLocationModal = true;
  }

  openLocationModal(): void {
    this.editingLocation = null;
    this.newLocation = { name: '', address: '', googleMapsUrl: '' };
    this.showLocationModal = true;
  }

  closeLocationModal(): void {
    this.showLocationModal = false;
    this.editingLocation = null;
    this.newLocation = { name: '', address: '', googleMapsUrl: '' };
  }

  deleteLocation(id: number): void {
    this.locationToDelete = this.locations.find(loc => loc.id === id);
    this.showDeleteLocationModal = true;
  }

  confirmDeleteLocation(): void {
    if (!this.locationToDelete) return;
    
    this.authService.deleteLocation(this.locationToDelete.id).subscribe({
      next: () => {
        this.loadLocations();
        this.showDeleteLocationModal = false;
        this.locationToDelete = null;
        this.showSuccessAlert('✅ Ubicación eliminada exitosamente');
      },
      error: (err: any) => {
        this.showErrorAlert('❌ Error al eliminar ubicación');
        this.showDeleteLocationModal = false;
        this.locationToDelete = null;
      }
    });
  }

  cancelDeleteLocation(): void {
    this.showDeleteLocationModal = false;
    this.locationToDelete = null;
  }

  // ========== MÉTODOS DEL MÓDULO DE ASISTENCIAS ==========
  
  loadAttendanceReport(): void {
    this.authService.getAttendanceReport().subscribe({
      next: (data: any) => {
        const filteredUsers = (data.users || []).filter((u: any) => (u.rol || '').toUpperCase() !== 'ADMIN');
        this.attendanceReport = { ...data, users: filteredUsers };
        this.usersNeedingAlert = filteredUsers.filter((user: any) => user.needsAlert);
        console.log('Reporte de asistencias cargado:', data);
      },
      error: (err: any) => {
        console.error('Error cargando reporte de asistencias:', err);
        this.showErrorAlert('❌ Error al cargar las asistencias');
      }
    });
  }

  sendMissYouMessage(user: any): void {
    const mensaje = `💛 *¡Te Extrañamos!* 💛\n\n` +
                   `Hola ${user.nombre},\n\n` +
                   `Hemos notado que has faltado a las últimas reuniones de AETOS. ` +
                   `Te extrañamos mucho y nos encantaría verte de nuevo. 😊\n\n` +
                   `Recuerda que eres parte importante de nuestra comunidad. ` +
                   `¡Esperamos verte pronto! 🙏\n\n` +
                   `Con cariño,\n` +
                   `Equipo AETOS`;
    
    // Copiar al portapapeles
    navigator.clipboard.writeText(mensaje).then(() => {
      this.showSuccessAlert(`✅ Mensaje copiado para ${user.nombre}. Pégalo en WhatsApp.`);
    }).catch(() => {
      this.showErrorAlert('❌ Error al copiar mensaje. Intenta de nuevo.');
    });
  }

  loadMyAttendances(): void {
    this.loadingMyAttendances = true;
    this.authService.getMyAttendances().subscribe({
      next: (data: any) => {
        this.myAttendances = data.meetings || [];
        this.myAttendanceStats = data.stats || { total: 0, attended: 0, missed: 0 };
        this.myAttendancePercentage = this.myAttendanceStats.total > 0 
          ? Math.round((this.myAttendanceStats.attended / this.myAttendanceStats.total) * 100) 
          : 0;
        this.loadingMyAttendances = false;
        console.log('Mis asistencias cargadas:', data);
      },
      error: (err: any) => {
        console.error('Error cargando mis asistencias:', err);
        this.loadingMyAttendances = false;
        this.showErrorAlert('❌ Error al cargar tu historial de asistencias');
      }
    });
  }

  // ========== MÉTODOS DE GESTIÓN DE USUARIOS ==========

  loadAllUsers(): void {
    this.loadingUsers = true;
    // Usar el endpoint correcto que devuelve el rol como string
    this.authService.getAllUsersForManagement().subscribe({
      next: (data: any) => {
        this.allUsers = data.map((user: any) => ({
          ...user,
          nombreCompleto: `${user.nombre || ''}${user.apellidos ? ' ' + user.apellidos : ''}`.trim()
        }));
        this.loadingUsers = false;
      },
      error: (err: any) => {
        console.error('Error cargando usuarios:', err);
        this.loadingUsers = false;
        this.showErrorAlert('❌ Error al cargar usuarios');
      }
    });
  }

  getRoleDisplayName(role: string): string {
    const roleNames: { [key: string]: string } = {
      'ADMIN': 'Administrador',
      'LIDER': 'Líder',
      'MIEMBRO': 'Miembro'
    };
    return roleNames[role] || 'Desconocido';
  }

  openChangeRoleModal(user: any): void {
    this.selectedUser = user;
    this.newRole = user.rol;
    this.showChangeRoleModal = true;
  }

  cancelChangeRole(): void {
    this.showChangeRoleModal = false;
    this.selectedUser = null;
    this.newRole = '';
  }

  confirmChangeRole(): void {
    if (!this.selectedUser || !this.newRole) {
      return;
    }

    this.authService.changeUserRole(this.selectedUser.id, this.newRole).subscribe({
      next: (response: any) => {
        // Actualizar el rol en la lista local
        const userIndex = this.allUsers.findIndex(u => u.id === this.selectedUser.id);
        if (userIndex !== -1) {
          this.allUsers[userIndex].rol = this.newRole;
        }
        
        this.showChangeRoleModal = false;
        this.selectedUser = null;
        this.newRole = '';
        
        this.showSuccessAlert('✅ Rol actualizado exitosamente');
      },
      error: (err: any) => {
        console.error('Error cambiando rol:', err);
        const errorMessage = err.error?.error || 'Error al cambiar el rol';
        this.showErrorAlert(`❌ ${errorMessage}`);
      }
    });
  }

  // ========== FIN MÉTODOS DE GESTIÓN DE USUARIOS ==========
}
