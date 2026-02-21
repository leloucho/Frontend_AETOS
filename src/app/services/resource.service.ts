import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Resource {
  id: number;
  nombre: string;
  nombreArchivo: string;
  rutaArchivo: string;
  rutaPortada: string;
  usuarioEmail: string;
  usuarioNombre: string;
  fechaSubida: string;
  tamanioBytes: number;
  descripcion?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResourceService {
  private apiUrl = '/api/resources';

  constructor(private http: HttpClient) { }

  getAllResources(): Observable<Resource[]> {
    const token = localStorage.getItem('jwt_token');
    if (!token) {
      console.error('❌ No hay token de autenticación en localStorage');
      throw new Error('No autenticado');
    }
    console.log('✅ Token encontrado en localStorage:', token.substring(0, 20) + '...');
    return this.http.get<Resource[]>(this.apiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  getMyResources(): Observable<Resource[]> {
    const token = localStorage.getItem('jwt_token');
    return this.http.get<Resource[]>(`${this.apiUrl}/my-resources`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  uploadResource(file: File, nombre: string, descripcion?: string): Observable<any> {
    const token = localStorage.getItem('jwt_token');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('nombre', nombre);
    if (descripcion) {
      formData.append('descripcion', descripcion);
    }

    // No establecer Content-Type manualmente para FormData - el navegador lo hace automáticamente
    return this.http.post(`${this.apiUrl}/upload`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  updateResource(id: number, nombre: string, descripcion?: string): Observable<any> {
    const token = localStorage.getItem('jwt_token');
    
    const formData = new FormData();
    formData.append('nombre', nombre);
    if (descripcion) {
      formData.append('descripcion', descripcion);
    }

    return this.http.put(`${this.apiUrl}/${id}`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  deleteResource(id: number): Observable<any> {
    const token = localStorage.getItem('jwt_token');
    return this.http.delete(`${this.apiUrl}/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  downloadResource(id: number): Observable<Blob> {
    const token = localStorage.getItem('jwt_token');
    return this.http.get(`${this.apiUrl}/download/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      responseType: 'blob'
    });
  }

  getThumbnailUrl(filename: string): string {
    return `${this.apiUrl}/thumbnail/${filename}`;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}
