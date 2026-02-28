import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  imports: [CommonModule, RouterModule],
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  particles = Array.from({ length: 20 }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5
  }));

  heroImages = [
    'assets/coverImages/2.png',
    'assets/coverImages/nanocareBottel.jpeg',
    'assets/coverImages/Post 5.jpg',
    'assets/coverImages/nanocare2.jpg'
  ];

  showImageModal: boolean = false;
  toggleImage() {
  this.showImageModal = !this.showImageModal;
  // منع السكرول لما الصورة تفتح
  document.body.style.overflow = this.showImageModal ? 'hidden' : 'auto';
}

  currentIndex = 0;
  isAutoPlaying = true;
  autoPlayInterval: any;

  ngOnInit() {
    this.startAutoPlay();
  }

  ngOnDestroy() {
    this.stopAutoPlay();
  }

  startAutoPlay() {
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoPlay() {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  toggleAutoPlay() {
    this.isAutoPlaying = !this.isAutoPlaying;
    if (this.isAutoPlaying) {
      this.startAutoPlay();
    } else {
      this.stopAutoPlay();
    }
  }

  nextSlide() {
    this.currentIndex = (this.currentIndex + 1) % this.heroImages.length;
  }

  prevSlide() {
    this.currentIndex = (this.currentIndex - 1 + this.heroImages.length) % this.heroImages.length;
  }

  goToSlide(index: number) {
    this.currentIndex = index;
  }



  // جوه الكلاس بتاعك
showVideo: boolean = false;

toggleVideo() {
  this.showVideo = !this.showVideo;
  // عشان نمنع الصفحة إنها تعمل Scroll واليوزر بيتفرج
  if (this.showVideo) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = 'auto';
  }
}
}