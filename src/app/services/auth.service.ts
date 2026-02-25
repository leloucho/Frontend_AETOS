import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '/api';
  private tokenKey = 'jwt_token';
  private roleKey = 'user_role';

  constructor(private http: HttpClient) {}

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/reset-password`, { token, newPassword });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          localStorage.setItem(this.roleKey, response.role);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.roleKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getRole(): string | null {
    return localStorage.getItem(this.roleKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isLider(): boolean {
    const role = this.getRole();
    return role === 'LIDER' || role === 'ADMIN';
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }

  getUserEmail(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payloadPart = token.split('.')[1] || '';
      const json = JSON.parse(window.atob(payloadPart));
      return json.email || json.sub || null;
    } catch {
      return null;
    }
  }

  getHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  createMeeting(force: boolean = false): Observable<any> {
    return this.http.post(`${this.apiUrl}/leader/meetings`, { force }, { headers: this.getHeaders() });
  }

  markAttendance(tokenQr: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/attend`, { tokenQr }, { headers: this.getHeaders() });
  }

  getProgram(): Observable<any> {
    return this.http.get(`${this.apiUrl}/program`, { headers: this.getHeaders() });
  }

  updateProgram(program: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/leader/program`, program, { headers: this.getHeaders() });
  }

  getUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`, { headers: this.getHeaders() });
  }

  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`, { headers: this.getHeaders() });
  }

  // Prayer requests
  getPrayers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/prayers`, { headers: this.getHeaders() });
  }

  addPrayer(prayer: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/leader/prayers`, prayer, { headers: this.getHeaders() });
  }

  deletePrayer(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/leader/prayers/${id}`, { headers: this.getHeaders() });
  }

  // Events
  getEvents(): Observable<any> {
    return this.http.get(`${this.apiUrl}/events`, { headers: this.getHeaders() });
  }

  addEvent(event: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/leader/events`, event, { headers: this.getHeaders() });
  }

  createEvent(event: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/leader/events`, event, { headers: this.getHeaders() });
  }

  updateEvent(id: number, event: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/leader/events/${id}`, event, { headers: this.getHeaders() });
  }

  deleteEvent(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/leader/events/${id}`, { headers: this.getHeaders() });
  }

  // Meeting management
  regenerateQr(): Observable<any> {
    return this.http.post(`${this.apiUrl}/leader/meetings/regenerate-qr`, {}, { headers: this.getHeaders() });
  }

  getAbsentMembers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/leader/absent-members`, { headers: this.getHeaders() });
  }

  getActiveMeeting(): Observable<any> {
    return this.http.get(`${this.apiUrl}/leader/active-meeting`, { headers: this.getHeaders() });
  }

  getActiveMeetingAttendances(): Observable<any> {
    return this.http.get(`${this.apiUrl}/leader/meetings/active/attendances`, { headers: this.getHeaders() });
  }

  getUsersAttendanceStatus(): Observable<any> {
    return this.http.get(`${this.apiUrl}/leader/meetings/active/users-status`, { headers: this.getHeaders() });
  }

  getMeetingHistory(meetingId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/leader/meetings/${meetingId}/history`, { headers: this.getHeaders() });
  }

  getAllMeetingsHistory(): Observable<any> {
    return this.http.get(`${this.apiUrl}/leader/meetings/history`, { headers: this.getHeaders() });
  }

  getAttendanceCount(meetingId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/leader/meetings/${meetingId}/attendance-count`, { headers: this.getHeaders() });
  }

  // Programs (history and management)
  getAllPrograms(): Observable<any> {
    return this.http.get(`${this.apiUrl}/programs`, { headers: this.getHeaders() });
  }

  deleteProgram(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/leader/program/${id}`, { headers: this.getHeaders() });
  }

  // Locations
  getLocations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/locations`, { headers: this.getHeaders() });
  }

  createLocation(location: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/leader/locations`, location, { headers: this.getHeaders() });
  }

  updateLocation(id: number, location: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/leader/locations/${id}`, location, { headers: this.getHeaders() });
  }

  deleteLocation(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/leader/locations/${id}`, { headers: this.getHeaders() });
  }

  // User Profile
  getUserProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile`, { headers: this.getHeaders() });
  }

  updateUserProfile(user: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/profile`, user, { headers: this.getHeaders() });
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/profile/change-password`, 
      { currentPassword, newPassword }, 
      { headers: this.getHeaders() });
  }

  uploadProfilePhoto(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('photo', file);
    
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
      // NO incluir Content-Type, Angular lo establece automáticamente para FormData
    });
    
    return this.http.post(`${this.apiUrl}/profile/photo`, formData, { headers });
  }

  // User Management (solo ADMIN)
  getAllUsersForManagement(): Observable<any> {
    // Agregar timestamp para evitar caché
    const timestamp = new Date().getTime();
    return this.http.get(`${this.apiUrl}/admin/users?_=${timestamp}`, { headers: this.getHeaders() });
  }

  changeUserRole(userId: number, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/users/${userId}/role`, 
      { role }, 
      { headers: this.getHeaders() });
  }

  deleteUserById(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/users/${userId}`, { headers: this.getHeaders() });
  }

  // User Attendance History
  getMyAttendances(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/my-attendances`, { headers: this.getHeaders() });
  }

  getActiveMeetingStatus(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/active-meeting-status`, { headers: this.getHeaders() });
  }

  // Notifications
  createNotification(title: string, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/leader/notifications`, 
      { title, message }, 
      { headers: this.getHeaders() });
  }

  getActiveNotifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/notifications/active`, { headers: this.getHeaders() });
  }

  deleteNotification(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/leader/notifications/${id}`, { headers: this.getHeaders() });
  }

  // Justifications
  submitJustification(meetingId: number, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/justifications`, 
      { meetingId, reason }, 
      { headers: this.getHeaders() });
  }

  getMyJustifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/my-justifications`, { headers: this.getHeaders() });
  }

  getPendingJustifications(): Observable<any> {
    return this.http.get(`${this.apiUrl}/leader/justifications/pending`, { headers: this.getHeaders() });
  }

  reviewJustification(id: number, status: string, comment: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/leader/justifications/${id}/review`, 
      { status, comment }, 
      { headers: this.getHeaders() });
  }

  // Manual Attendance
  markManualAttendance(userId: number, meetingId: number, justification: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/leader/manual-attendance`, 
      { userId, meetingId, justification }, 
      { headers: this.getHeaders() });
  }

  // Ranking
  getAttendanceRanking(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ranking`);
  }

  // Attendance Report
  getAttendanceReport(): Observable<any> {
    return this.http.get(`${this.apiUrl}/leader/attendance-report`, { headers: this.getHeaders() });
  }

  // Birthday Notifications
  getBirthdaysThisWeek(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/birthdays/this-week`, { headers: this.getHeaders() });
  }

  // My Upcoming Assignments
  getMyUpcomingAssignments(): Observable<any> {
    return this.http.get(`${this.apiUrl}/profile/my-assignments`, { headers: this.getHeaders() });
  }
}
