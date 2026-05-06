import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-brands',
  imports: [CommonModule],
  templateUrl: './brands.component.html',
  styleUrl: './brands.component.scss'
})
export class BrandsComponent {

  private router = inject(Router)

  currentImage = 2


  onScroll(event: Event) {
    const target = event.target as HTMLElement;
    if (target.scrollTop === 0) {
      this.currentImage = 1;
    } else if (target.scrollTop > 0 && target.scrollTop < 200) {
      this.currentImage = 2;
    } else if (target.scrollTop > 200 && target.scrollTop < 500) {
      this.currentImage = 3;
    } else if (target.scrollTop > 500 && target.scrollTop < 800) {
      this.currentImage = 4;
    } else if (target.scrollTop > 800 && target.scrollTop < 1100) {
      this.currentImage = 5;
    }
  }

  redirectToBooking() {
    const brand = this.currentImage === 1 ? 'disconnection' : this.currentImage === 2 ? 'strega' : this.currentImage === 3 ? 'disconnection' : this.currentImage === 4 ? 'strega' : 'disconnectio'
    this.router.navigate(['/booking', brand])
  }
}

