import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent implements OnInit {
  readonly loginForm = this.formBuilder.nonNullable.group({
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  submitting = false;
  errorMessage = '';

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      void this.router.navigate(['/staff/inventory']);
    }
  }

  submit(): void {
    this.errorMessage = '';
    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid || this.submitting) {
      return;
    }

    this.submitting = true;
    const { username, password } = this.loginForm.getRawValue();

    this.authService.login(username, password).pipe(
      finalize(() => this.submitting = false)
    ).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const safeReturnUrl = returnUrl?.startsWith('/staff/') ? returnUrl : '/staff/inventory';
        void this.router.navigateByUrl(safeReturnUrl);
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = error.error?.message || 'Sign-in failed. Please try again.';
      }
    });
  }
}