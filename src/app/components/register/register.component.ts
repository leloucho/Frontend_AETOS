import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  template: `
    <!-- Notificación Toast -->
    <div *ngIf="message" class="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
      <div class="bg-white rounded-xl shadow-2xl border-l-4 border-green-500 p-4 max-w-md">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm font-semibold text-gray-900">¡Registro exitoso!</p>
            <p class="text-xs text-gray-600 mt-1">📧 Confirme su correo electrónico</p>
          </div>
        </div>
      </div>
    </div>

    <div class="min-h-screen flex items-center justify-center py-4 bg-cover bg-center" style="background-image: url('assets/images/register.png');">
      <div class="absolute inset-0 bg-black opacity-40"></div>
      <div class="bg-white p-6 rounded-lg shadow-2xl w-full max-w-sm relative z-10">
        <h2 class="text-2xl font-bold mb-4 text-center text-blue-700">Registro AETOS</h2>
        <form (ngSubmit)="onRegister()" class="space-y-2">
          <input type="text" [(ngModel)]="user.nombre" name="nombre" placeholder="Nombre *" 
                 (input)="onlyLetters($event)"
                 class="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500" required>
          
          <input type="text" [(ngModel)]="user.apellidos" name="apellidos" placeholder="Apellidos *" 
                 (input)="onlyLetters($event)"
                 class="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500" required>
          
          <input type="text" [(ngModel)]="user.usuario" name="usuario" placeholder="Usuario (Alias) *" 
                 autocapitalize="off" autocorrect="off" spellcheck="false"
                 class="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500" required minlength="3">
          
          <div class="flex gap-1">
            <input type="text" value="+51" disabled
                   class="w-14 p-2 text-sm border rounded bg-gray-100 text-center font-semibold">
            <input type="tel" [(ngModel)]="user.celular" name="celular" placeholder="Celular" 
                   (input)="onlyNumbers($event)"
                   maxlength="9"
                   class="flex-1 p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500" required>
          </div>
          
        
          <input type="text" [(ngModel)]="user.fechaNacimiento" name="fechaNacimiento" placeholder="DD/MM/YYYY"
                 inputmode="numeric" maxlength="10" (input)="formatBirthdate($event)" (keydown)="handleBirthdateKeydown($event)"
                 autocomplete="bday" autocapitalize="off" spellcheck="false"
                 class="w-full h-11 p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500 bg-white" required>
          
          <input type="email" [(ngModel)]="user.email" name="email" placeholder="Correo Electrónico *"
                 inputmode="email" autocomplete="email" autocapitalize="off" autocorrect="off" spellcheck="false"
                 class="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500" required>
          
          <input type="password" [(ngModel)]="user.password" name="password" placeholder="Contraseña (mínimo 6 caracteres) *"
                 autocomplete="new-password" autocapitalize="off" autocorrect="off" spellcheck="false"
                 class="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500" required minlength="6">
          
          <input type="password" [(ngModel)]="confirmPassword" name="confirmPassword" placeholder="Confirmar Contraseña *"
                 autocomplete="new-password" autocapitalize="off" autocorrect="off" spellcheck="false"
                 class="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-blue-500" required>
          
          <button type="submit" class="w-full bg-green-600 text-white p-2 text-sm rounded-lg hover:bg-green-700 font-semibold transition mt-3">
            Registrarse
          </button>
        </form>
        
        <p class="mt-3 text-center text-xs">
          ¿Ya tienes cuenta? <a routerLink="/login" class="text-blue-600 font-semibold hover:underline">Inicia sesión</a>
        </p>
        
        <p *ngIf="error" class="mt-3 p-2 text-red-700 bg-red-50 border-l-4 border-red-500 rounded text-center text-xs font-medium">
          {{ error }}
        </p>
      </div>
    </div>
  `
})
export class RegisterComponent {
  user = { 
    nombre: '', 
    apellidos: '', 
    usuario: '', 
    celular: '', 
    fechaNacimiento: '', 
    email: '', 
    password: '' 
  };
  confirmPassword = '';
  message = '';
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onlyLetters(event: any): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
  }

  onlyNumbers(event: any): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
  }

  formatBirthdate(event: any): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/[^0-9]/g, '').slice(0, 8);
    let dd = digits.slice(0, 2);
    let mm = digits.slice(2, 4);
    let yyyy = digits.slice(4, 8);

    if (dd.length === 2) {
      let d = Number(dd);
      if (d < 1) d = 1;
      if (d > 31) d = 31;
      dd = d.toString().padStart(2, '0');
    }
    if (mm.length === 1) {
      // No forzar ni acolchar mientras solo hay 1 dígito; permite 1 → 10/11/12
      mm = mm.replace(/[^0-9]/g, '');
    } else if (mm.length === 2) {
      let m = Number(mm);
      if (m < 1) m = 1;
      if (m > 12) m = 12;
      mm = m.toString().padStart(2, '0');
    }
    if (yyyy.length === 4 && mm.length === 2 && dd.length === 2) {
      let y = Number(yyyy);
      if (y < 1900) y = 1900;
      const maxD = this.daysInMonth(y, Number(mm));
      let d = Number(dd);
      if (d > maxD) d = maxD;
      dd = d.toString().padStart(2, '0');
      yyyy = y.toString();
    }

    let value = '';
    if (digits.length <= 2) {
      value = dd.slice(0, digits.length);
      if (digits.length === 2) value = dd + '/';
    } else if (digits.length <= 4) {
      value = dd + '/' + mm.slice(0, digits.length - 2);
      if (digits.length === 4) value = dd + '/' + mm + '/';
    } else {
      value = dd + '/' + mm + '/' + yyyy;
    }

    input.value = value;
    this.user.fechaNacimiento = value;
  }

  handleBirthdateKeydown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
    const pos = input.selectionStart ?? input.value.length;
    const val = input.value;

    if (event.key === 'Backspace') {
      if (pos > 0 && val.charAt(pos - 1) === '/') {
        event.preventDefault();
        input.value = val.slice(0, pos - 1) + val.slice(pos);
        const newPos = pos - 1;
        this.user.fechaNacimiento = input.value;
        setTimeout(() => input.setSelectionRange(newPos, newPos));
      }
    } else if (event.key === 'Delete') {
      if (pos < val.length && val.charAt(pos) === '/') {
        event.preventDefault();
        input.value = val.slice(0, pos) + val.slice(pos + 1);
        const newPos = pos;
        this.user.fechaNacimiento = input.value;
        setTimeout(() => input.setSelectionRange(newPos, newPos));
      }
    }
  }

  daysInMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
  }

  onRegister(): void {
    this.error = '';
    
    // Validar celular: exactamente 9 dígitos antes de anteponer +51
    if (!/^\d{9}$/.test(this.user.celular.trim())) {
      this.error = 'El celular debe tener 9 dígitos';
      return;
    }
    // Agregar código de país +51 si no lo tiene
    if (this.user.celular && !this.user.celular.startsWith('+')) {
      this.user.celular = '+51' + this.user.celular;
    }
    this.message = '';

    // Validaciones
    if (!this.user.nombre.trim()) {
      this.error = 'El nombre es requerido';
      return;
    }
    if (!this.user.apellidos.trim()) {
      this.error = 'Los apellidos son requeridos';
      return;
    }
    if (!this.user.usuario.trim() || this.user.usuario.length < 3) {
      this.error = 'El usuario debe tener al menos 3 caracteres';
      return;
    }
    const fecha = this.user.fechaNacimiento.trim();
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
      this.error = 'Fecha inválida. Usa DD/MM/YYYY';
      return;
    }
    const [ddStr, mmStr, yyyyStr] = fecha.split('/');
    const dd = Number(ddStr);
    const mm = Number(mmStr);
    const yyyy = Number(yyyyStr);

    if (mm < 1 || mm > 12) {
      this.error = 'Mes inválido (01-12)';
      return;
    }
    const maxDay = this.daysInMonth(yyyy, mm);
    if (dd < 1 || dd > maxDay) {
      this.error = `Día inválido (01-${maxDay})`;
      return;
    }

    const dt = new Date(yyyy, mm - 1, dd);
    const valid = dt && dt.getFullYear() === yyyy && dt.getMonth() === mm - 1 && dt.getDate() === dd;
    if (!valid) {
      this.error = 'Fecha inválida';
      return;
    }
    const isoBirth = `${yyyy.toString().padStart(4,'0')}-${mm.toString().padStart(2,'0')}-${dd.toString().padStart(2,'0')}`;
    if (!this.user.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      this.error = 'Email inválido';
      return;
    }
    if (this.user.password.length < 6) {
      this.error = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }
    if (this.user.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    const payload = { ...this.user, fechaNacimiento: isoBirth };
    this.authService.register(payload).subscribe({
      next: (response: any) => {
        console.log('Respuesta del servidor:', response);
        this.message = response.message || 'Registro exitoso. Verifica tu correo.';
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: (err: any) => {
        console.error('Error del servidor:', err);
        this.error = err.error?.error || 'Error en el registro';
      }
    });
  }
}
