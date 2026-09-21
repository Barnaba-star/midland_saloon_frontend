import { Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MainSidenavComponent } from '../component/main-sidenav-component/main-sidenav-component';
import { SidenavItem } from '../component/main-sidenav-component/model';
import { TitleAction } from '../component/title/title.component';
import { environment } from '../enviroments/environment';
import { Observable } from 'rxjs';
import { Response, ResponseList, ResponsePage } from '../models/responces';



@Injectable({
  providedIn: 'root'
})
export class Authentication {
constructor(private cookieService:CookieService, private http:HttpClient){}
private jwtHelper = new JwtHelperService();
private baseURL = environment.baseApiUrl
private profilePicURL = `${this.baseURL}/attachment`

 createHeaders(): HttpHeaders {
    let headers = new HttpHeaders();
    const token = this.cookieService.get('jwt_token');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

setToken(token: string): void {
    this.cookieService.set('jwt_token', token, 7, '/');

  }
 getToken(): string {
  const rawToken = this.cookieService.get('jwt_token');
  return rawToken?.replace(/^"(.*)"$/, '$1');
}


removeToken(): void {
  this.cookieService.delete('jwt_token');
}

getUsername(): string {
  const token = this.getToken();
  if (!token) {
    console.log('No Token Found');
    return '';
  }
  const decodedToken = this.jwtHelper.decodeToken(token);
  const username = decodedToken.sub;
  console.log('Username:', username);
  return username;
}

getFullName(): string {
  const token = this.getToken();
  if (!token) {
    console.log('No Token Found');
    return '';
  }
  const decodedToken = this.jwtHelper.decodeToken(token);
  const fullName = decodedToken.fullName;
  console.log('Full Name:', fullName);
  return fullName;
}

getEmail(): string {
  const token = this.getToken();
  if (!token) {
    console.log('No Token Found');
    return '';
  }
  const decodedToken = this.jwtHelper.decodeToken(token);
  const email = decodedToken.email;
  console.log('Email:', email);
  return email;
}



getRoles(): string {
  const token = this.getToken();
  if (!token) {
    return '';
  }
  const decodedToken = this.jwtHelper.decodeToken(token);
  const roles = decodedToken.roles;
  //console.log('Decoded roles:', roles);
  if (Array.isArray(roles)) {
    return roles.join(', ');
  } else if (typeof roles === 'string') {
    return roles;
  } else if (roles && typeof roles === 'object') {
    return roles.name || roles.role || '';
  } else {
    return '';
  }
}

hasRole(role: string): boolean {
  const roles = this.getRoles();
  if (Array.isArray(roles)) {
    return roles.includes(role);
  }
  return roles.split(', ').includes(role);
}

getUserUID():string{
 const token = this.getToken();
  if (!token) {
    console.log('No Token Found');
    return '';
  }
  const decodedToken = this.jwtHelper.decodeToken(token);
  const userUID = decodedToken.userUID;
  console.log('User UID:', userUID);
  return userUID;
}

getBranchUID():string{
 const token = this.getToken();
  if (!token) {
    console.log('No Token Found');
    return '';
  }
  const decodedToken = this.jwtHelper.decodeToken(token);
  const branchUID = decodedToken.branchUID;
  console.log('User UID:', branchUID);
  return branchUID;
}

getPermissions():string{
  const token = this.getToken();
  if(!token){
    return '';
  }
  const decodedToken = this.jwtHelper.decodeToken(token);
  const permissions:string[] =  decodedToken.permissions;
  const permissionsAsString = permissions.join();
  console.log('Permissions', permissions);
  return permissionsAsString;
}

getTenantId(): string {
  const token = this.getToken();
  if (!token) {
    console.log('No Token Found');
    return '';
  }
  const decodedToken = this.jwtHelper.decodeToken(token);
  const tenantId = decodedToken.tenantId;
  console.log('Username:', tenantId);
  return tenantId;
}

getActions():string{
  const token = this.getToken();
  if(!token){
    return '';
  }
  const decodedToken = this.jwtHelper.decodeToken(token);
  const actions:string[] =  decodedToken.actions;
  const actionsAsString = actions.join();
  console.log('Actions', actions);
  return actionsAsString;
}

getPersonnelName():string{
  const token = this.getToken();
  if(!token){
    return '';
  }
  const decodedToken = this.jwtHelper.decodeToken(token);
  const personnelUID:string =  decodedToken.personnelUID;
  console.log('Personnel Uid', personnelUID);
  return personnelUID;
}



filteredMenuItems(menuItems:SidenavItem[]): SidenavItem[] {
  return menuItems
    .filter(item =>
      !item.roles || item.roles.some(role => this.hasRole(role))
    )
    .map(item => ({
      ...item,
      children: item.children?.filter(child =>
        !child.roles || child.roles.some(role => this.hasRole(role))
      )
    }))
    .filter(item =>
      !item.children || item.children.length > 0 || item.route
    );
}

filteredTitleActions(titles: TitleAction[]): TitleAction[] {
  return titles.filter(title =>
    !title.roles || title.roles.some(role => this.hasRole(role))
  );
}

loadProfilePic(uid: string):Observable<Response<any>>{
 return this.http.get<Response<any>>(`${this.profilePicURL}/loadProfilePic/${uid}`)
}
private heartbeatInterval: any;

heartbeat(): Observable<any> {
  return this.http.post(
    `${this.baseURL}/setting/heartbeat`,
    {},
    {
      headers: this.createHeaders()
    }
  );
}

startHeartbeat(): void {
  this.stopHeartbeat();

  this.heartbeatInterval = setInterval(() => {
    this.heartbeat().subscribe({
      next: () => {
        console.log('Heartbeat updated');
      },
      error: (error) => {
        console.error('Heartbeat failed:', error);
      }
    });
  }, 30000);
}

stopHeartbeat(): void {
  if (this.heartbeatInterval) {
    clearInterval(this.heartbeatInterval);
    this.heartbeatInterval = null;
  }
}



}
