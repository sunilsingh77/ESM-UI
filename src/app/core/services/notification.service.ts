import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  public success(message: string, title = 'Success'): void {
    // TODO: Replace with Bootstrap Toast or ngx-toastr
    console.log(`✅ ${title}: ${message}`);
  }

  public error(message: string, title = 'Error'): void {
    // TODO: Replace with Bootstrap Toast or ngx-toastr
    console.error(`❌ ${title}: ${message}`);
  }

  public warning(message: string, title = 'Warning'): void {
    console.warn(`⚠️ ${title}: ${message}`);
  }

  public info(message: string, title = 'Information'): void {
    console.info(`ℹ️ ${title}: ${message}`);
  }
}
