import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import * as QRCode from 'qrcode';
import { SidebarComponent } from '../layout/sidebar.component';

@Component({
  selector: 'app-qr-display',
  standalone: true,
  imports: [CommonModule, RouterLink, SidebarComponent],
  template: `
    <div class="min-h-screen bg-gray-100 flex">
      <!-- Sidebar persistente -->
      <app-sidebar></app-sidebar>
      
      <!-- Contenido Principal -->
      <div class="flex-1 w-full pl-0 lg:pl-64 bg-gradient-to-br from-blue-900 to-purple-900">
      
      
      <div class="mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] w-full">
        
        <div *ngIf="!activeMeeting" class="bg-white p-4 sm:p-8 md:p-12 rounded-2xl shadow-2xl text-center">
          <div class="text-6xl mb-4">⚠️</div>
          <h2 class="text-3xl font-bold text-gray-800 mb-4">No hay reunión activa</h2>
          <p class="text-gray-600 mb-6">Si el programa está en curso, activa el QR desde aquí</p>
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <button (click)="activateQr(false)" class="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition">
              ✅ Activar QR ahora
            </button>
            <a routerLink="/admin" 
               class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition">
              Ir al Panel de Admin
            </a>
          </div>
        </div>

        <div *ngIf="activeMeeting" class="bg-white p-4 sm:p-8 md:p-12 rounded-2xl shadow-2xl">
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold text-gray-800 mb-2">Código QR</h2>
            <p class="text-gray-600">Escanea para Marcar Asistencia</p>
          </div>

          <!-- QR Code Canvas -->
          <div class="flex justify-center mb-6">
            <div class="bg-gray-50 p-4 sm:p-6 md:p-8 rounded-xl border-4 border-blue-500 w-full max-w-sm sm:max-w-md mx-auto">
              <canvas #qrCanvas class="max-w-full"></canvas>
            </div>
          </div>
          <div class="max-w-xl mx-auto mb-8">
            <div class="bg-blue-50 border-2 border-blue-500 rounded-lg p-4">
              <p class="text-sm font-semibold text-blue-900 mb-2 text-center">Código manual para copiar</p>
              <div class="flex flex-col sm:flex-row gap-2">
                <input #tokenInput type="text" [value]="activeMeeting?.tokenQr || ''" readonly class="flex-1 p-3 border-2 border-blue-300 rounded-lg font-mono text-center text-blue-900 select-all">
                <button (click)="copyToken()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Copiar</button>
              </div>
            </div>
          </div>

          <!-- Meeting Info -->
          <div class="bg-blue-50 p-6 rounded-lg space-y-2">
            <div class="flex justify-between items-center">
              <span class="font-semibold text-gray-700">📅 Fecha:</span>
              <span class="text-gray-800">{{ activeMeeting.fecha | date:'dd/MM/yyyy HH:mm' }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="font-semibold text-gray-700">👥 Asistentes:</span>
              <span class="text-2xl font-bold text-blue-600">{{ attendanceCount }}</span>
            </div>
          </div>

          <!-- Live Attendance List -->
          <div class="mt-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <h4 class="text-sm font-bold text-gray-800 flex items-center gap-1">
                <span>👥</span> Asistencias
              </h4>
              <span class="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">● LIVE</span>
            </div>
            <div class="bg-white rounded-lg border-2 border-gray-200 max-h-72 overflow-y-auto">
              <div *ngIf="attendanceList.length === 0" class="p-6 text-center text-gray-500">
                <span class="text-3xl block mb-2">⏳</span>
                <p class="text-xs">Esperando asistencias...</p>
              </div>
              <div *ngFor="let a of attendanceList; let i = index" class="p-2 border-b border-gray-100 flex items-center gap-2">
                <div class="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-xs">{{ i + 1 }}</div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-gray-800 text-sm truncate">{{ a.userName }}</p>
                  <p class="text-xs text-gray-500">{{ a.timestamp | date:'h:mm:ss a' }}</p>
                </div>
                <span class="text-green-500 text-lg">✓</span>
              </div>
            </div>
          </div>
        </div>

      </div>
      </div>
    </div>
  `,
  styles: [`
    canvas {
      image-rendering: pixelated;
      image-rendering: crisp-edges;
    }
  `]
})
export class QrDisplayComponent implements OnInit, AfterViewInit {
  @ViewChild('qrCanvas') qrCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('tokenInput') tokenInput!: ElementRef<HTMLInputElement>;
  
  activeMeeting: any = null;
  attendanceCount: number = 0;
  attendanceList: any[] = [];
  qrSize: number = 300;
  private refreshInterval: any;
  private triedAutoCreate = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    if (!this.authService.isLider()) {
      alert('Solo el líder puede acceder a esta página');
      this.router.navigate(['/dashboard']);
      return;
    }
    this.ensureActiveMeeting();
    this.startAutoRefresh();
  }

  ngAfterViewInit(): void {
    // QR se genera después de cargar la reunión
  }

  private ensureActiveMeeting(): void {
    this.triedAutoCreate = true;
    this.authService.createMeeting(true).subscribe({
      next: (data: any) => {
        this.activeMeeting = data;
        this.generateQR(data.tokenQr);
        this.loadAttendanceCount();
        this.loadAttendances();
      },
      error: () => {
        this.loadActiveMeeting();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  loadActiveMeeting(): void {
    this.authService.getActiveMeeting().subscribe({
      next: (data: any) => {
        if (data && data.tokenQr) {
          this.activeMeeting = data;
          this.generateQR(data.tokenQr);
          this.loadAttendanceCount();
          this.loadAttendances();
        } else {
          this.activeMeeting = null;
          if (!this.triedAutoCreate) {
            this.activateQr(true);
          }
        }
      },
      error: (err: any) => {
        console.error('Error al cargar reunión activa', err);
        this.activeMeeting = null;
      }
    });
  }

  generateQR(token: string): void {
    if (!this.qrCanvas) {
      setTimeout(() => this.generateQR(token), 100);
      return;
    }

    this.qrSize = this.computeQrSize();
    const canvas = this.qrCanvas.nativeElement;
    
    QRCode.toCanvas(canvas, token, {
      width: this.qrSize,
      margin: 2,
      color: {
        dark: '#1e3a8a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'H'
    }, (error: any) => {
      if (error) {
        console.error('Error generando QR:', error);
      }
    });
  }

  @HostListener('window:resize')
  onResize(): void { this.redrawQR(); }

  private computeQrSize(): number {
    const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    const size = Math.min(Math.floor(vw * 0.9), 420);
    return Math.max(size, 220);
  }

  private redrawQR(): void {
    const newSize = this.computeQrSize();
    if (newSize !== this.qrSize && this.activeMeeting?.tokenQr) {
      this.qrSize = newSize;
      this.generateQR(this.activeMeeting.tokenQr);
    }
  }

  loadAttendanceCount(): void {
    if (!this.activeMeeting) return;
    
    this.authService.getAttendanceCount(this.activeMeeting.id).subscribe({
      next: (count: number) => this.attendanceCount = count,
      error: (err: any) => console.error('Error al cargar asistentes', err)
    });
  }

  regenerateQr(): void {
    if (!confirm('¿Regenerar código QR? El código anterior dejará de funcionar.')) {
      return;
    }

    this.authService.regenerateQr().subscribe({
      next: (data: any) => {
        this.activeMeeting = data;
        this.generateQR(data.tokenQr);
        alert('✅ Código QR regenerado exitosamente');
      },
      error: (err: any) => alert('❌ Error al regenerar QR')
    });
  }

  activateQr(silent: boolean): void {
    this.triedAutoCreate = true;
    this.authService.createMeeting(true).subscribe({
      next: (data: any) => {
        this.activeMeeting = data;
        this.generateQR(data.tokenQr);
        this.loadAttendanceCount();
        this.loadAttendances();
      },
      error: (err: any) => {
        if (!silent) {
          const msg = err?.error?.error || 'No se pudo activar el QR. Verifica que el programa esté en curso.';
          alert(`❌ ${msg}`);
        }
      }
    });
  }

  startAutoRefresh(): void {
    this.refreshInterval = setInterval(() => {
      if (this.activeMeeting) {
        this.loadAttendanceCount();
        this.loadAttendances();
      }
    }, 3000);
  }

  loadAttendances(): void {
    if (!this.activeMeeting) return;
    this.authService.getActiveMeetingAttendances().subscribe({
      next: (data: any) => {
        this.attendanceList = data.attendances || [];
        if (data.expired === true) {
          this.activeMeeting = null;
          alert('✅ El programa ha finalizado. QR desactivado.');
        }
      },
      error: () => {}
    });
  }

  copyToken(): void {
    const token = this.activeMeeting?.tokenQr;
    if (!token) return;
    const navAny: any = navigator;
    if (navAny.clipboard && (window as any).isSecureContext) {
      navAny.clipboard.writeText(token).catch(() => this.fallbackCopy());
    } else {
      this.fallbackCopy();
    }
  }

  fallbackCopy(): void {
    const input = this.tokenInput?.nativeElement;
    if (input) {
      input.focus();
      input.select();
      try { document.execCommand('copy'); } catch {}
    }
  }
}
