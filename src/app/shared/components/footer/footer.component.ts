import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  companyInfo = {
    name: 'Employee Skills Management',
    email: 'support@esm.com',
    phone: '+1 (555) 123-4567',
  };

  quickLinks = [
    { label: 'About', url: '#' },
    { label: 'Privacy Policy', url: '#' },
    { label: 'Terms & Conditions', url: '#' },
    { label: 'Contact', url: '#' },
  ];

  socialLinks = [
    { label: 'LinkedIn', url: '#' },
    { label: 'Twitter', url: '#' },
    { label: 'Facebook', url: '#' },
  ];
}
