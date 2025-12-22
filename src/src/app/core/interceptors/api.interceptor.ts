import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  constructor(private toastr: ToastrService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
          
          // Show user-friendly messages
          if (error.status === 404) {
            this.toastr.error('Resource not found', 'Error');
          } else if (error.status === 500) {
            this.toastr.error('Server error. Please try again later.', 'Error');
          } else if (error.status === 403) {
            this.toastr.error('Access denied', 'Error');
          } else if (error.status === 401) {
            this.toastr.error('Unauthorized. Please login.', 'Error');
          } else {
            this.toastr.error(error.error?.message || 'Request failed', 'Error');
          }
        }

        console.error(errorMessage);
        return throwError(() => error);
      })
    );
  }
}
