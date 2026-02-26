import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResourceService, Resource } from '../../services/resource.service';
import { AuthService } from '../../services/auth.service';
import { SidebarComponent } from '../layout/sidebar.component';
import { interval, Subscription } from 'rxjs';
@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <!-- Sidebar persistente -->
    <app-sidebar></app-sidebar>

    <!-- Contenido principal -->
    <div class="min-h-screen bg-gray-100 lg:pl-56 transition-all duration-300">
      <div class="p-4 sm:p-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-800">📚 Repositorio de Recursos</h1>
        <div class="mx-auto">
        <button 
          (click)="showUploadModal = true" 
          class="bg-sky-400 hover:bg-blue-700 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg transition text-sm sm:text-base">
          ➕ Subir Recurso
        </button>
        </div>
      </div>

      <div class="mb-4 sm:mb-6 mx-auto">
        <div class="flex gap-4 ml-6 sm:ml-12">
          <button 
            (click)="viewMode = 'all'; loadResources()" 
            [class]="viewMode === 'all' ? 'bg-sky-400 text-white' : 'bg-gray-200 text-gray-700'"
            class="px-3 sm:px-4 py-2 rounded-lg font-medium transition text-sm sm:text-base">
            Todos los Recursos
          </button>
          <button 
            (click)="viewMode = 'mine'; loadMyResources()" 
            [class]="viewMode === 'mine' ? 'bg-sky-400 text-white' : 'bg-gray-200 text-gray-700'"
            class="px-3 sm:px-4 py-2 rounded-lg font-medium transition text-sm sm:text-base">
            Mis Recursos
          </button>
          
        </div>
      </div>

      <div *ngIf="resources.length === 0" class="text-center py-12 text-gray-500">
        <p class="text-lg">No hay recursos disponibles</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div *ngFor="let resource of resources" class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
          <div class="relative h-48 sm:h-64 bg-gray-100 flex items-center justify-center">
            <img 
              [src]="thumbnails[resource.id]"
              [alt]="resource.nombre"
              class="max-w-full max-h-full object-contain"
              (error)="onImageError($event)">
          </div>
          
          <div class="p-3 sm:p-4">
            <h3 class="font-bold text-base sm:text-lg text-gray-800 mb-2 line-clamp-2" [title]="resource.nombre">
              {{resource.nombre}}
            </h3>
            
            <p class="text-xs sm:text-sm text-gray-600 mb-1 break-words">
              👤 {{resource.usuarioNombre}}
            </p>
            
            <p class="text-xs sm:text-sm text-gray-500 mb-1">
              📅 {{formatDate(resource.fechaSubida)}}
            </p>
            
            <p class="text-xs sm:text-sm text-gray-500 mb-3">
              📦 {{formatFileSize(resource.tamanioBytes)}}
            </p>

            <p *ngIf="resource.descripcion" class="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">
              {{resource.descripcion}}
            </p>

            <div class="flex flex-col sm:flex-row gap-2">
              <button 
                (click)="downloadResource(resource)" 
                class="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm py-2 px-2 sm:px-3 rounded transition">
                📥 Descargar
              </button>
              
              <button 
                *ngIf="canEditOrDelete(resource)" 
                (click)="editResource(resource)" 
                class="bg-yellow-500 hover:bg-yellow-600 text-white text-xs sm:text-sm py-2 px-2 sm:px-3 rounded transition">
                ✏️ Editar
              </button>
              
              <button 
                *ngIf="canEditOrDelete(resource)" 
                (click)="confirmDelete(resource)" 
                class="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm py-2 px-2 sm:px-3 rounded transition">
                🗑️ Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de Subir Recurso -->
      <div *ngIf="showUploadModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="closeUploadModal()">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <h2 class="text-2xl font-bold mb-4 text-gray-800">Subir Nuevo Recurso</h2>
          
          <div class="mb-4">
            <label class="block text-gray-700 font-medium mb-2">Archivo PDF</label>
            <input 
              type="file" 
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.gif,.webp" 
              (change)="onFileSelected($event)" 
              class="w-full border border-gray-300 rounded-lg p-2">
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 font-medium mb-2">Nombre del Recurso</label>
            <input 
              type="text" 
              [(ngModel)]="newResourceName" 
              class="w-full border border-gray-300 rounded-lg p-2"
              placeholder="Ej: Lección 5 - El Santuario">
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 font-medium mb-2">Descripción (Opcional)</label>
            <textarea 
              [(ngModel)]="newResourceDescription" 
              class="w-full border border-gray-300 rounded-lg p-2"
              rows="3"
              placeholder="Breve descripción del recurso"></textarea>
          </div>

          <div *ngIf="uploadProgress" class="mb-4">
            <div class="bg-blue-100 text-blue-700 p-3 rounded">
              {{uploadProgress}}
            </div>
          </div>

          <div class="flex gap-2">
            <button 
              (click)="uploadResource()" 
              [disabled]="!selectedFile || !newResourceName || uploading"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:bg-gray-400 disabled:cursor-not-allowed">
              {{uploading ? 'Subiendo...' : 'Subir'}}
            </button>
            <button 
              (click)="closeUploadModal()" 
              [disabled]="uploading"
              class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition disabled:bg-gray-200 disabled:cursor-not-allowed">
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Editar Recurso -->
      <div *ngIf="showEditModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="closeEditModal()">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <h2 class="text-2xl font-bold mb-4 text-gray-800">Editar Recurso</h2>
          
          <div class="mb-4">
            <label class="block text-gray-700 font-medium mb-2">Nombre del Recurso</label>
            <input 
              type="text" 
              [(ngModel)]="editingName" 
              class="w-full border border-gray-300 rounded-lg p-2">
          </div>

          <div class="mb-4">
            <label class="block text-gray-700 font-medium mb-2">Descripción</label>
            <textarea 
              [(ngModel)]="editingDescription" 
              class="w-full border border-gray-300 rounded-lg p-2"
              rows="3"></textarea>
          </div>

          <div class="flex gap-2">
            <button 
              (click)="saveEdit()" 
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition">
              Guardar
            </button>
            <button 
              (click)="closeEditModal()" 
              class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition">
              Cancelar
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Confirmación de Eliminación -->
      <div *ngIf="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" (click)="closeDeleteModal()">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <h2 class="text-2xl font-bold mb-4 text-red-600">⚠️ Confirmar Eliminación</h2>
          <p class="text-gray-700 mb-6">
            ¿Estás seguro de que deseas eliminar el recurso "<strong>{{resourceToDelete?.nombre}}</strong>"?
            Esta acción no se puede deshacer.
          </p>
          <div class="flex gap-2">
            <button 
              (click)="deleteResource()" 
              class="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition">
              Eliminar
            </button>
            <button 
              (click)="closeDeleteModal()" 
              class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class ResourcesComponent implements OnInit, OnDestroy {
  resources: Resource[] = [];
  thumbnails: { [id: number]: string } = {};
  viewMode: 'all' | 'mine' = 'all';
  currentUserEmail: string = '';
  isLeader: boolean = false;

  showUploadModal = false;
  showEditModal = false;
  showDeleteModal = false;

  selectedFile: File | null = null;
  newResourceName = '';
  newResourceDescription = '';
  uploading = false;
  uploadProgress = '';

  editingResource: Resource | null = null;
  editingName = '';
  editingDescription = '';

  resourceToDelete: Resource | null = null;
  
  private pollingSubscription: Subscription | null = null;

  constructor(private resourceService: ResourceService, private authService: AuthService) {
    const jwtEmail = this.authService.getUserEmail();
    if (jwtEmail) {
      this.currentUserEmail = jwtEmail;
    } else {
      const user = localStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        this.currentUserEmail = userData.email || '';
      }
    }
    this.isLeader = this.authService.isLider();
  }

  ngOnInit() {
    this.loadResources();
    this.startPolling();
  }

  ngOnDestroy() {
    this.stopPolling();
    this.revokeThumbnails();
  }

  private startPolling() {
    this.pollingSubscription = interval(30000).subscribe(() => {
      if (this.viewMode === 'all') {
        this.loadResources();
      } else {
        this.loadMyResources();
      }
    });
  }

  private stopPolling() {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
  }

  private fetchThumbnails(list: Resource[]): void {
    for (const r of list) {
      if (!r || !r.rutaPortada) continue;
      this.resourceService.getThumbnailBlob(r.rutaPortada).subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          this.thumbnails[r.id] = url;
        },
        error: () => {
          this.thumbnails[r.id] = this.placeholderFor(r);
        }
      });
    }
  }

  private revokeThumbnails(): void {
    try {
      Object.values(this.thumbnails || {}).forEach(u => { try { URL.revokeObjectURL(u); } catch {} });
    } finally {
      this.thumbnails = {};
    }
  }

  private placeholderFor(r: Resource): string {
    const ext = ((r?.nombreArchivo || '').split('.').pop() || 'FILE').toUpperCase();
    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns='http://www.w3.org/2000/svg' width='300' height='400'>\n<rect width='300' height='400' fill='#eeeeee'/>\n<text x='150' y='200' font-size='72' fill='#999999' text-anchor='middle' dominant-baseline='central'>${ext}</text>\n</svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
  }

  loadResources() {
    this.viewMode = 'all';
    this.resourceService.getAllResources().subscribe({
      next: (data) => {
        this.resources = data;
        this.revokeThumbnails();
        this.fetchThumbnails(this.resources);
      },
      error: (error) => {
        console.error('Error cargando recursos:', error);
      }
    });
  }

  loadMyResources() {
    this.viewMode = 'mine';
    this.resourceService.getMyResources().subscribe({
      next: (data) => {
        this.resources = data;
        this.revokeThumbnails();
        this.fetchThumbnails(this.resources);
      },
      error: (error) => {
        console.error('Error cargando mis recursos:', error);
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) { this.selectedFile = null; return; }
    const allowed = ['pdf','doc','docx','xls','xlsx','ppt','pptx','png','jpg','jpeg','gif','webp'];
    const ext = (file.name?.split('.').pop() || '').toLowerCase();
    if (allowed.includes(ext)) {
      this.selectedFile = file;
    } else {
      alert('Tipo de archivo no permitido. Usa PDF, Word, Excel, PowerPoint o imágenes');
      this.selectedFile = null;
    }
  }

  uploadResource() {
    if (!this.selectedFile || !this.newResourceName) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    this.uploading = true;
    this.uploadProgress = 'Subiendo archivo...';

    this.resourceService.uploadResource(this.selectedFile, this.newResourceName, this.newResourceDescription).subscribe({
      next: (response) => {
        this.uploadProgress = 'Generando miniatura...';
        setTimeout(() => {
          this.uploadProgress = 'Recurso subido exitosamente';
          setTimeout(() => {
            this.closeUploadModal();
            if (this.viewMode === 'all') {
              this.loadResources();
            } else {
              this.loadMyResources();
            }
          }, 1000);
        }, 500);
      },
      error: (error) => {
        console.error('Error subiendo recurso:', error);
        this.uploadProgress = '';
        this.uploading = false;
        alert('Error al subir el recurso: ' + (error.error?.error || 'Error desconocido'));
      }
    });
  }

  closeUploadModal() {
    this.showUploadModal = false;
    this.selectedFile = null;
    this.newResourceName = '';
    this.newResourceDescription = '';
    this.uploading = false;
    this.uploadProgress = '';
  }

  editResource(resource: Resource) {
    this.editingResource = resource;
    this.editingName = resource.nombre;
    this.editingDescription = resource.descripcion || '';
    this.showEditModal = true;
  }

  saveEdit() {
    if (!this.editingResource || !this.editingName) {
      return;
    }

    this.resourceService.updateResource(this.editingResource.id, this.editingName, this.editingDescription).subscribe({
      next: (response) => {
        this.closeEditModal();
        if (this.viewMode === 'all') {
          this.loadResources();
        } else {
          this.loadMyResources();
        }
      },
      error: (error) => {
        console.error('Error actualizando recurso:', error);
        alert('Error al actualizar el recurso');
      }
    });
  }

  closeEditModal() {
    this.showEditModal = false;
    this.editingResource = null;
    this.editingName = '';
    this.editingDescription = '';
  }

  confirmDelete(resource: Resource) {
    this.resourceToDelete = resource;
    this.showDeleteModal = true;
  }

  deleteResource() {
    if (!this.resourceToDelete) {
      return;
    }

    this.resourceService.deleteResource(this.resourceToDelete.id).subscribe({
      next: (response) => {
        this.closeDeleteModal();
        if (this.viewMode === 'all') {
          this.loadResources();
        } else {
          this.loadMyResources();
        }
      },
      error: (error) => {
        console.error('Error eliminando recurso:', error);
        alert('Error al eliminar el recurso');
      }
    });
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.resourceToDelete = null;
  }

  downloadResource(resource: Resource) {
    this.resourceService.downloadResource(resource.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = resource.nombreArchivo;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error('Error descargando recurso:', error);
        alert('Error al descargar el recurso');
      }
    });
  }

  getThumbnailUrl(filename: string): string {
    return this.resourceService.getThumbnailUrl(filename);
  }

  formatFileSize(bytes: number): string {
    return this.resourceService.formatFileSize(bytes);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  isOwner(resource: Resource): boolean {
    const owner = (resource.usuarioEmail || '').trim().toLowerCase();
    const me = (this.currentUserEmail || '').trim().toLowerCase();
    return !!owner && !!me && owner === me;
  }

  canEditOrDelete(resource: Resource): boolean {
    return this.isOwner(resource) || this.isLeader;
  }

  onImageError(event: any) {
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSI0OCIgZmlsbD0iIzk5OSI+UERGPC90ZXh0Pjwvc3ZnPg==';
  }
}
