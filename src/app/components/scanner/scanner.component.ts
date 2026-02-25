import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ZXingScannerComponent, ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { SidebarComponent } from '../layout/sidebar.component';
import QRCode from 'qrcode';

@Component({
  selector: 'app-scanner',
  standalone: true,
  imports: [CommonModule, FormsModule, ZXingScannerModule, SidebarComponent],
  template: `
    <div class="min-h-screen bg-gray-100 flex">
      <!-- Sidebar persistente -->
      <app-sidebar></app-sidebar>
      
      <!-- Contenido Principal -->
      <div class="flex-1 lg:pl-56">
        <div class="p-4 sm:p-6 bg-gradient-to-br from-purple-900 to-blue-900 min-h-screen">
        <div class="bg-white rounded-xl sm:rounded-2xl shadow-2xl max-w-2xl mx-auto overflow-hidden">
          
          <!-- Header -->
          <div class="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6 text-center">
            <div class="text-4xl sm:text-5xl mb-2 sm:mb-3">🎯</div>
            <h2 class="text-xl sm:text-2xl font-bold">Marcar Asistencia</h2>
            <p class="text-blue-100 mt-1 sm:mt-2 text-sm sm:text-base">Escanea el código QR de la reunión</p>
          </div>

          <!-- Scanner Mode Toggle -->
          <div class="p-4 sm:p-6 bg-gray-50 border-b flex justify-center gap-2 sm:gap-4">
            <button (click)="useCameraMode = true" 
                    [class.bg-blue-600]="useCameraMode"
                    [class.text-white]="useCameraMode"
                    [class.bg-gray-200]="!useCameraMode"
                    class="px-4 sm:px-6 py-2 rounded-lg font-semibold transition text-sm sm:text-base">
              📷 Usar Cámara
            </button>
            <button (click)="useCameraMode = false" 
                    [class.bg-blue-600]="!useCameraMode"
                    [class.text-white]="!useCameraMode"
                    [class.bg-gray-200]="useCameraMode"
                    class="px-4 sm:px-6 py-2 rounded-lg font-semibold transition text-sm sm:text-base">
              ⌨️ Ingresar Manualmente
            </button>
          </div>

          <!-- Aviso de contexto seguro para cámara -->
          <div *ngIf="!isSecureContext" class="mx-4 mt-4 p-3 bg-red-50 border-2 border-red-300 text-red-700 rounded-lg text-sm text-center">
            Para usar la cámara, abre el sitio con HTTPS (por ejemplo, usando un túnel seguro) o desde localhost. Estás en una conexión no segura (http), por lo que el navegador bloquea el acceso a la cámara. Mientras tanto, usa el modo manual.
          </div>

          <!-- Camera Scanner -->
          <div *ngIf="useCameraMode" class="p-4 sm:p-6">
            <div class="bg-black rounded-lg overflow-hidden mb-4" style="max-height: 350px;">
              <zxing-scanner
                *ngIf="availableDevices && availableDevices.length > 0"
                [device]="currentDevice"
                [formats]="allowedFormats"
                (scanSuccess)="onCodeScanned($event)"
                (camerasFound)="onCamerasFound($event)"
                (permissionResponse)="onPermissionResponse($event)"
                class="w-full">
              </zxing-scanner>
              
              <div *ngIf="!availableDevices || availableDevices.length === 0" 
                   class="text-white text-center py-12">
                <div class="text-4xl mb-3">📹</div>
                <p>Esperando permiso de cámara...</p>
              </div>
            </div>

            <!-- Camera Selector -->
            <div *ngIf="availableDevices && availableDevices.length > 1" class="mb-4">
              <label class="block text-sm font-semibold text-gray-700 mb-2">Seleccionar Cámara:</label>
              <select (change)="onDeviceSelectChange($event)" 
                      class="w-full p-2 border rounded-lg">
                <option *ngFor="let device of availableDevices" 
                        [value]="device.deviceId"
                        [selected]="device === currentDevice">
                  {{ device.label || 'Cámara ' + (availableDevices.indexOf(device) + 1) }}
                </option>
              </select>
            </div>

            <div class="text-center text-sm text-gray-600">
              <p>💡 Apunta la cámara hacia el código QR</p>
              <p class="mt-1">La asistencia se marcará automáticamente al escanear</p>
            </div>
          </div>

          <!-- Manual Input -->
          <div *ngIf="!useCameraMode" class="p-6">
            <p class="text-sm text-gray-600 mb-4 text-center">
              Si no puedes usar la cámara, ingresa el código manualmente:
            </p>
            <input type="text" 
                   [(ngModel)]="tokenQr" 
                   placeholder="Ingresa el token QR aquí" 
                   class="w-full p-3 mb-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-center font-mono">
            <button (click)="markAttendanceManual()" 
                    class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold transition">
              ✅ Marcar Asistencia
            </button>
          </div>

          <!-- Success/Error Messages -->
          <div *ngIf="message || error" class="p-6 border-t">
            <div *ngIf="message" class="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded mb-4">
              <div class="flex items-center">
                <span class="text-2xl mr-3">✅</span>
                <div class="flex-1">
                  <p class="font-bold">¡Éxito!</p>
                  <p>{{ message }}</p>
                  <p class="text-sm mt-2">Serás redirigido a tu historial de asistencias...</p>
                </div>
              </div>
            </div>
            <div *ngIf="error" class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <div class="flex items-center">
                <span class="text-2xl mr-3">❌</span>
                <div>
                  <p class="font-bold">Error</p>
                  <p>{{ error }}</p>
                </div>
              </div>
            </div>
          </div>

          

        </div>
        </div>
      </div>
    </div>
  `
})
export class ScannerComponent implements OnInit {
  @ViewChild(ZXingScannerComponent) scanner?: ZXingScannerComponent;

  // Camera
  useCameraMode = true;
  availableDevices: MediaDeviceInfo[] = [];
  currentDevice?: MediaDeviceInfo;
  allowedFormats = [BarcodeFormat.QR_CODE];
  hasPermission = false;

  // Manual
  tokenQr = '';
  message = '';
  error = '';
  isProcessing = false;
  isLider = false;
  isSecureContext = (window as any).isSecureContext === true;

  // QR panel (líder)
  showQrPanel = false;
  isQrPanelMinimized = false;
  hasActiveQR = false;
  qrCodeUrl: string = '';
  activeMeeting: any = null;
  attendanceList: any[] = [];
  private qrPolling: any = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.isLider = this.authService.isLider();
    if (this.isLider) {
      this.checkExistingActiveMeeting();
    }
  }

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
    this.hasPermission = true;

    // Seleccionar cámara trasera si está disponible
    const backCamera = devices.find(device => 
      device.label.toLowerCase().includes('back') || 
      device.label.toLowerCase().includes('trasera')
    );
    this.currentDevice = backCamera || devices[0];
  }

  onDeviceSelectChange(event: any): void {
    const deviceId = event.target.value;
    this.currentDevice = this.availableDevices.find(d => d.deviceId === deviceId);
  }

  onPermissionResponse(hasPermission: boolean): void {
    this.hasPermission = hasPermission;
    if (!hasPermission) {
      this.error = 'Se necesita permiso de cámara para escanear';
      this.useCameraMode = false;
    }
  }

  onCodeScanned(result: string): void {
    if (this.isProcessing) return; // Evitar múltiples escaneos

    this.isProcessing = true;
    const trimmed = (result || '').trim();
    this.tokenQr = trimmed;
    this.markAttendance(trimmed);
  }

  markAttendanceManual(): void {
    const trimmed = (this.tokenQr || '').trim();
    if (!trimmed) {
      this.error = 'Ingresa un token';
      return;
    }
    this.markAttendance(trimmed);
  }

  private markAttendance(token: string): void {
    this.message = '';
    this.error = '';

    const payload = (token || '').trim();
    console.log('[Scanner] Enviando token:', payload);
    this.authService.markAttendance(payload).subscribe({
      next: (res) => {
        console.log('[Scanner] OK asistencia:', res);
        this.message = '¡Asistencia marcada exitosamente! ✅';
        this.error = '';
        
        setTimeout(() => {
          this.router.navigate(['/my-attendances']);
        }, 2000);
      },
      error: (err) => {
        console.error('[Scanner] Error asistencia:', err);
        this.isProcessing = false;
        
        const backendMsg = err?.error?.error;
        if (backendMsg) {
          this.error = `❌ ${backendMsg}`;
        } else if (err.status === 401) {
          this.error = '❌ Debes iniciar sesión primero';
        } else if (err.status === 400) {
          this.error = '❌ Código QR inválido o reunión no activa';
        } else {
          this.error = '❌ Error al marcar asistencia. Intenta de nuevo.';
        }
        
        this.message = '';
        this.tokenQr = '';
      }
    });
  }

  // ===== Funciones de QR (líder) =====
  generateQRForProgram(): void {
    this.authService.getActiveMeeting().subscribe({
      next: (existing: any) => {
        if (existing && existing.tokenQr) {
          this.activeMeeting = existing;
          this.hasActiveQR = true;
          this.showQrPanel = true;
          this.generateQrCode(existing.tokenQr);
          this.startQrPolling();
        } else {
          this.createNewMeeting();
        }
      },
      error: () => this.createNewMeeting()
    });
  }

  createNewMeeting(): void {
    this.authService.createMeeting(true).subscribe({
      next: (data: any) => {
        this.activeMeeting = data;
        this.hasActiveQR = true;
        this.showQrPanel = true;
        this.generateQrCode(data.tokenQr);
        this.startQrPolling();
      },
      error: () => alert('❌ Error al generar reunión')
    });
  }

  async generateQrCode(token: string): Promise<void> {
    try {
      this.qrCodeUrl = await QRCode.toDataURL(token, { width: 300, margin: 2, color: { dark: '#10B981', light: '#FFFFFF' } });
    } catch {}
  }

  startQrPolling(): void {
    this.loadAttendances();
    this.qrPolling = setInterval(() => this.loadAttendances(), 3000);
  }

  loadAttendances(): void {
    if (!this.activeMeeting || !this.activeMeeting.id) return;
    this.authService.getActiveMeetingAttendances().subscribe({
      next: (data: any) => {
        this.attendanceList = data.attendances || [];
        if (data.expired === true) {
          this.endActiveMeetingUI();
          alert('✅ El programa ha finalizado. QR desactivado.');
        }
      }
    });
  }

  closeQrPanel(): void { this.showQrPanel = false; }

  endActiveMeetingUI(): void {
    this.showQrPanel = false;
    this.isQrPanelMinimized = false;
    this.hasActiveQR = false;
    this.activeMeeting = null;
    this.qrCodeUrl = '';
    this.attendanceList = [];
    if (this.qrPolling) { clearInterval(this.qrPolling); this.qrPolling = null; }
  }

  checkExistingActiveMeeting(): void {
    this.authService.getActiveMeeting().subscribe({
      next: (data: any) => {
        if (data && data.activa) {
          this.activeMeeting = data;
          this.hasActiveQR = true;
          this.showQrPanel = true;
          this.generateQrCode(data.tokenQr);
          this.startQrPolling();
        }
      }
    });
  }

  copyCode(code: string): void {
    if (!code) return;
    navigator.clipboard.writeText(code);
  }
}
