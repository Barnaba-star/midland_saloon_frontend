import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IconRegistryService } from '../Utils/services/icon-registry.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CookieService } from 'ngx-cookie-service';
import { HttpClient } from '@angular/common/http';
import { AlertService } from '../Utils/services/alert';
import { Authentication } from '../Utils/services/authentication';
import { environment } from '../Utils/enviroments/environment';
import { ChangeDetectorRef } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
@Component({
  selector: 'app-login',
  imports: [MatFormFieldModule, MatInputModule, MatCardModule, MatButtonModule, MatIconModule, ReactiveFormsModule, CommonModule, TranslatePipe],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
private api = environment.baseApiUrl
private baseUrl: string = `${this.api}/authentication/login`;

  loginForm: FormGroup;
  showPassword = false;
  submitting = false;

  constructor(private iconRegistry: IconRegistryService, private route:Router, private cookie:CookieService,
  private http:HttpClient, private alert: AlertService, private auth:Authentication,  private cdr: ChangeDetectorRef) {
    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.minLength(3)]),
      password: new FormControl('', [Validators.required, Validators.minLength(3)])
    });
  }
 ngOnInit(): void {
    const idleTime = 1 * 60 * 1000;

    setTimeout(() => {
      this.route.navigate(['/landing']);
    }, idleTime);
  }
loginError: string = '';
onSubmit() {
  if (this.loginForm.valid) {

    this.loginError = '';
    this.submitting = true;

    this.http.post<{ token: string }>(
      this.baseUrl,
      this.loginForm.value,
      {
        withCredentials: true
      }
    ).subscribe({
      next: (res) => {
        this.loginError = '';
        this.submitting = false;

        // Save token
        this.auth.setToken(res.token);

        // Start heartbeat
        this.auth.startHeartbeat();

        // Navigate
        this.route.navigate(['/dashboard']);

        this.cdr.detectChanges();
      },

      error: (err) => {
        this.loginError = err.error;

        this.auth.removeToken();

        this.submitting = false;

        this.cdr.detectChanges();

        console.log('Login error:', err);
      }
    });
  }
}

  get username() { return this.loginForm.get('username'); }
  get password() { return this.loginForm.get('password'); }
}

