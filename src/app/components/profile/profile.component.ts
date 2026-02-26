import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../layout/sidebar.component';
import { ImageCropperComponent, ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent, ImageCropperComponent],
  template: `
    <div class="min-h-screen bg-gray-100 flex">
      <!-- Sidebar persistente -->
      <app-sidebar></app-sidebar>
      
      <!-- Contenido Principal -->
      <div class="flex-1 lg:pl-56">

      <div class="p-4 sm:p-6">
        <div class="bg-white rounded-lg shadow-lg overflow-hidden">
          <!-- Header del perfil con avatar -->
          <div class="bg-gradient-to-r from-blue-600 to-purple-600 p-4 sm:p-6 lg:p-8 text-white">
            <div class="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <!-- Avatar con foto o iniciales -->
              <div class="relative">
                <div class="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-3xl sm:text-4xl font-bold overflow-hidden"
                     [class.bg-white]="!user.photoUrl"
                     [class.text-blue-600]="!user.photoUrl">
                  <img *ngIf="user.photoUrl" [src]="user.photoUrl" 
                       alt="Foto de perfil"
                       class="w-full h-full object-cover">
                  <span *ngIf="!user.photoUrl">{{ user.nombre?.charAt(0) }}{{ user.apellidos?.charAt(0) }}</span>
                </div>
                
                <!-- Botón para cambiar/editar foto -->
                <button (click)="fileInput.click()" 
                        class="absolute bottom-0 right-0 bg-purple-500 hover:bg-purple-600 text-white rounded-full p-2 shadow-lg transition"
                        [title]="user.photoUrl ? 'Cambiar foto de perfil' : 'Subir foto de perfil'">
                  <span class="text-lg">{{ user.photoUrl ? '✏️' : '📷' }}</span>
                </button>
                <input #fileInput type="file" accept="image/*" (change)="onFileSelected($event)" class="hidden">
              </div>
              
              <div class="text-center sm:text-left">
                <h2 class="text-2xl sm:text-3xl font-bold">{{ user.nombre }} {{ user.apellidos }}</h2>
                <p class="text-blue-100 mt-1 text-sm sm:text-base">{{ '@' + user.usuario }}</p>
                <span class="inline-block mt-2 px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs sm:text-sm">
                  {{ user.rol === 'LIDER' ? '⭐ Líder' : '👤 Miembro' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Contenido del perfil -->
          <div class="p-4 sm:p-6 lg:p-8">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 class="text-xl sm:text-2xl font-bold text-gray-800">Información Personal</h3>
              <button *ngIf="!editMode" (click)="enableEditMode()" 
                      class="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base">
                ✏️ Editar Perfil
              </button>
            </div>

            <form (ngSubmit)="updateProfile()" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Nombre -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input type="text" [(ngModel)]="user.nombre" name="nombre" 
                         [disabled]="!editMode"
                         class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                         [class.bg-gray-100]="!editMode" required>
                </div>

                <!-- Apellidos -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                  <input type="text" [(ngModel)]="user.apellidos" name="apellidos" 
                         [disabled]="!editMode"
                         class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                         [class.bg-gray-100]="!editMode" required>
                </div>

                <!-- Usuario -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                  <input type="text" [(ngModel)]="user.usuario" name="usuario" 
                         [disabled]="!editMode"
                         class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                         [class.bg-gray-100]="!editMode" required>
                </div>

                <!-- Email (no editable) -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" [(ngModel)]="user.email" name="email" 
                         disabled
                         class="w-full p-3 border rounded-lg bg-gray-100 cursor-not-allowed">
                  <p class="text-xs text-gray-500 mt-1">El email no se puede modificar</p>
                </div>

                <!-- Celular -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Celular</label>
                  <input type="tel" [(ngModel)]="user.celular" name="celular" 
                         [disabled]="!editMode"
                         class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                         [class.bg-gray-100]="!editMode" required>
                </div>

                <!-- Fecha de Nacimiento -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                  <input type="date" [(ngModel)]="user.fechaNacimiento" name="fechaNacimiento" 
                         [disabled]="!editMode"
                         class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                         [class.bg-gray-100]="!editMode">
                </div>
              </div>

              <!-- Rol (solo visualización) -->
              <div class="mt-6 p-4 bg-gray-50 rounded-lg">
                <p class="text-sm font-medium text-gray-700">Rol en AETOS</p>
                <p class="text-lg font-semibold text-blue-600 mt-1">
                  {{ user.rol === 'LIDER' ? '⭐ Líder' : '👤 Miembro' }}
                </p>
              </div>

              <!-- Botones de acción -->
              <div *ngIf="editMode" class="flex gap-3 pt-4 border-t">
                <button type="button" (click)="cancelEdit()" 
                        class="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
                  Cancelar
                </button>
                <button type="submit" 
                        [disabled]="saving"
                        class="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        [class.opacity-50]="saving">
                  {{ saving ? '💾 Guardando...' : '💾 Guardar Cambios' }}
                </button>
              </div>
            </form>

            <!-- Mensaje de éxito -->
            <div *ngIf="successMessage" class="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p class="text-green-700">✅ {{ successMessage }}</p>
            </div>

            <!-- Mensaje de error -->
            <div *ngIf="errorMessage" class="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-red-700">❌ {{ errorMessage }}</p>
            </div>
          </div>
        </div>

        <!-- Sección de cambio de contraseña -->
        <div class="bg-white rounded-lg shadow-lg mt-6 p-8">
          <h3 class="text-2xl font-bold text-gray-800 mb-6">🔒 Cambiar Contraseña</h3>
          <form (ngSubmit)="changePassword()" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
              <input type="password" [(ngModel)]="passwordForm.currentPassword" name="currentPassword" 
                     class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
              <input type="password" [(ngModel)]="passwordForm.newPassword" name="newPassword" 
                     class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                     minlength="6" required>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Confirmar Nueva Contraseña</label>
              <input type="password" [(ngModel)]="passwordForm.confirmPassword" name="confirmPassword" 
                     class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500" 
                     minlength="6" required>
            </div>
            <button type="submit" 
                    [disabled]="changingPassword"
                    class="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                    [class.opacity-50]="changingPassword">
              {{ changingPassword ? '🔄 Cambiando...' : '🔑 Cambiar Contraseña' }}
            </button>
          </form>
        </div>
      </div>
      </div>
    </div>
    
    <!-- Modal de Recorte de Imagen -->
    <div *ngIf="showCropperModal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" (click)="closeCropperModal()">
      <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full animate-fadeIn" (click)="$event.stopPropagation()">
        <div class="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white rounded-t-2xl">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-4xl">✂️</span>
              <div>
                <h3 class="text-2xl font-bold">Foto de Perfil</h3>
                <p class="text-purple-100 text-sm">Ajusta o recorta tu imagen</p>
              </div>
            </div>
            <button (click)="closeCropperModal()" class="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition">
              <span class="text-2xl">✕</span>
            </button>
          </div>
        </div>
        
        <div class="p-6">
          <!-- Cropper -->
          <div class="relative bg-gray-100 rounded-lg overflow-hidden" style="height: 400px;">
            <image-cropper
              [imageChangedEvent]="imageChangedEvent"
              [maintainAspectRatio]="true"
              [aspectRatio]="1"
              [resizeToWidth]="300"
              [cropperMinWidth]="128"
              [roundCropper]="true"
              [canvasRotation]="canvasRotation"
              [transform]="transform"
              format="jpeg"
              outputType="both"
              (imageCropped)="imageCropped($event)"
              (imageLoaded)="imageLoaded()"
              (cropperReady)="cropperReady()"
              (loadImageFailed)="loadImageFailed()">
            </image-cropper>
          </div>
          
          <!-- Controles -->
          <div class="mt-6 space-y-4">
            <div class="flex items-center justify-center gap-4">
              <button (click)="rotateLeft()" 
                      class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition flex items-center gap-2">
                <span class="text-xl">↶</span>
              </button>
              <button (click)="rotateRight()" 
                      class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition flex items-center gap-2">
                <span class="text-xl">↷</span>
              </button>
              <button (click)="flipHorizontal()" 
                      class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition flex items-center gap-2">
                <span class="text-xl">⇄</span>
              </button>
              <button (click)="resetImage()" 
                      class="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition flex items-center gap-2">
                <span class="text-xl">🔄</span>
              </button>
            </div>
            
            <!-- Botones de acción -->
            <div class="flex gap-3 pt-4 border-t">
              <button (click)="closeCropperModal()" 
                      class="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
                ❌ Cancelar
              </button>
              <button (click)="uploadCroppedImage()" 
                      [disabled]="uploadingPhoto"
                      class="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition"
                      [class.opacity-50]="uploadingPhoto">
                {{ uploadingPhoto ? '⏳ Subiendo...' : '✅ Guardar' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  user: any = {
    nombre: '',
    apellidos: '',
    usuario: '',
    email: '',
    celular: '',
    fechaNacimiento: '',
    rol: '',
    photoUrl: ''
  };
  originalUser: any = {};
  editMode = false;
  saving = false;
  changingPassword = false;
  uploadingPhoto = false;
  successMessage = '';
  errorMessage = '';
  isLider = false;
  selectedFile: File | null = null;
  
  // Cropper properties
  showCropperModal = false;
  imageChangedEvent: any = '';
  croppedImage: any = '';
  croppedImageBlob: Blob | null = null;
  canvasRotation = 0;
  rotation = 0;
  scale = 1;
  transform: any = {};
  
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };



  constructor(private authService: AuthService, private router: Router, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.isLider = this.authService.isLider();
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    this.authService.getUserProfile().subscribe({
      next: (data: any) => {
        this.user = data;
        this.user.photoUrl = this.resolvePhotoUrl(data.photoUrl || '');
        this.originalUser = { ...data };
      },
      error: (err: any) => {
        console.error('Error loading profile', err);
        this.errorMessage = 'Error al cargar el perfil';
      }
    });
  }

  enableEditMode(): void {
    this.editMode = true;
    this.successMessage = '';
    this.errorMessage = '';
  }

  cancelEdit(): void {
    this.user = { ...this.originalUser };
    this.editMode = false;
    this.successMessage = '';
    this.errorMessage = '';
  }

  updateProfile(): void {
    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.authService.updateUserProfile(this.user).subscribe({
      next: () => {
        this.saving = false;
        this.editMode = false;
        this.originalUser = { ...this.user };
        this.successMessage = 'Perfil actualizado exitosamente';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err: any) => {
        this.saving = false;
        this.errorMessage = 'Error al actualizar el perfil';
        console.error(err);
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    this.changingPassword = true;
    this.authService.changePassword(
      this.passwordForm.currentPassword,
      this.passwordForm.newPassword
    ).subscribe({
      next: () => {
        this.changingPassword = false;
        alert('✅ Contraseña cambiada exitosamente');
        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
      },
      error: (err: any) => {
        this.changingPassword = false;
        alert('❌ Error al cambiar la contraseña. Verifica tu contraseña actual.');
        console.error(err);
      }
    });
  }
  
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
      alert('❌ Por favor selecciona un archivo de imagen válido');
      event.target.value = ''; // Limpiar input
      return;
    }
    
    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('❌ La imagen no debe superar los 5MB');
      event.target.value = ''; // Limpiar input
      return;
    }
    
    // Abrir modal de cropper
    this.imageChangedEvent = event;
    this.showCropperModal = true;
    this.resetTransform();
  }
  
  // Métodos del cropper
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl || event.base64 || '');
    this.croppedImageBlob = event.blob || null;
  }

  imageLoaded() {
    console.log('Imagen cargada en el cropper');
  }

  cropperReady() {
    console.log('Cropper listo');
  }

  loadImageFailed() {
    alert('❌ Error al cargar la imagen');
    this.closeCropperModal();
  }
  
  rotateLeft() {
    this.canvasRotation--;
    this.flipAfterRotate();
  }

  rotateRight() {
    this.canvasRotation++;
    this.flipAfterRotate();
  }

  private flipAfterRotate() {
    const flippedH = this.transform.flipH;
    const flippedV = this.transform.flipV;
    this.transform = {
      ...this.transform,
      flipH: flippedV,
      flipV: flippedH
    };
  }

  flipHorizontal() {
    this.transform = {
      ...this.transform,
      flipH: !this.transform.flipH
    };
  }

  resetImage() {
    this.canvasRotation = 0;
    this.resetTransform();
  }
  
  private resetTransform() {
    this.transform = {
      scale: 1,
      rotate: 0,
      flipH: false,
      flipV: false
    };
  }
  
  closeCropperModal() {
    this.showCropperModal = false;
    this.imageChangedEvent = '';
    this.croppedImage = '';
    this.croppedImageBlob = null;
    this.canvasRotation = 0;
    this.resetTransform();
  }
  
  uploadCroppedImage() {
    if (!this.croppedImageBlob) {
      alert('❌ No hay imagen para subir');
      return;
    }
    
    this.uploadingPhoto = true;
    this.successMessage = '';
    this.errorMessage = '';
    
    // Convertir blob a File
    const file = new File([this.croppedImageBlob], 'profile.jpg', { type: 'image/jpeg' });
    
    this.authService.uploadProfilePhoto(file).subscribe({
      next: (response: any) => {
        this.uploadingPhoto = false;
        const resolved = this.resolvePhotoUrl(response.photoUrl || '');
        this.user.photoUrl = resolved;
        this.originalUser.photoUrl = resolved;
        this.successMessage = '✅ Foto de perfil actualizada exitosamente';
        setTimeout(() => this.successMessage = '', 3000);
        this.closeCropperModal();
      },
      error: (err: any) => {
        this.uploadingPhoto = false;
        this.errorMessage = err.error?.error || 'Error al subir la foto';
        setTimeout(() => this.errorMessage = '', 5000);
        console.error('Error uploading photo:', err);
      }
    });
  }

  private resolvePhotoUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/api/')) return url;
    if (url.startsWith('/uploads/')) return '/api' + url;
    return url;
  }

}
