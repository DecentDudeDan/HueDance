import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {

  constructor(public navCtrl: NavController, private toastController: ToastController) {
  }

  sensitivity = {
    lower: -110,
    upper: -10
  };

  brightness: number = 126;

  private maxToastDismissed: boolean = true;
  private minToastDismissed: boolean = true;
  listening: boolean = true;

  private stream;
  private WIDTH;
  private HEIGHT;
  private audioCtx;
  // private gainNode;
  private source;
  @ViewChild('visualizer')
  private canvas: ElementRef;
  private canvasCtx;
  private drawVisual;
  private analyzerNode;
  private bufferLengthAlt;
  private dataArrayAlt;
  private window: any = window;

  ngOnInit() {
    this.audioCtx = new this.window.AudioContext();
    this.canvas.nativeElement.width = (window.screen.availWidth) * 0.9;
    this.canvas.nativeElement.height = (window.screen.availHeight / 8);
    this.analyzerNode = this.audioCtx.createAnalyser();
    this.analyzerNode.minDecibels = -110;
    this.analyzerNode.maxDecibels = -10;
    this.analyzerNode.smoothingTimeConstant = 0.85;

    this.canvasCtx = this.canvas.nativeElement.getContext("2d");
    this.WIDTH = this.canvas.nativeElement.width;
    this.HEIGHT = this.canvas.nativeElement.height;

    if (navigator.getUserMedia) {
      console.log('getUserMedia supported.');
      this.setup();
    } else {
      console.log('getUserMedia not supported on your browser!');
    }
  }

  onSensitivityChange() {
    if (this.sensitivity.lower >= -45) {
      if (this.maxToastDismissed) {
        let maxErrorToast = this.toastController.create({
          message: 'Max value exceeded. Setting minimum value to -46',
          duration: 3000,
          position: 'bottom',
          showCloseButton: true
        });

        maxErrorToast.onDidDismiss(() => {
          this.maxToastDismissed = true;
        });

        maxErrorToast.present();
        this.maxToastDismissed = false;
      }

      this.sensitivity.lower = -46;
      this.analyzerNode.minDecibels = this.sensitivity.lower;
    } else {
      this.analyzerNode.minDecibels = this.sensitivity.lower;
    }

    if (this.sensitivity.upper < -45) {
      if (this.minToastDismissed) {
        let minErrorToast = this.toastController.create({
          message: 'min value exceeded. Setting maximum value to -46',
          duration: 3000,
          position: 'bottom',
          showCloseButton: true
        });

        minErrorToast.onDidDismiss(() => {
          this.minToastDismissed = true;
        });

        minErrorToast.present();
        this.minToastDismissed = false;
      }

      this.sensitivity.upper = -45;
      this.analyzerNode.maxDecibels = this.sensitivity.upper;
    } else {
      this.analyzerNode.maxDecibels = this.sensitivity.upper;
    }
  }

  onListenClick() {
    if (this.listening) {
      this.stream.getTracks()[0].stop();
      this.listening = false;
    } else {
      this.setup();
      this.listening = true;
    }
  }

  setup(): void {
    navigator.getUserMedia(
      // constraints - only audio needed for this app
      {
        audio: true,
        video: false
      }, (stream) => {
        this.stream = stream;
        this.source = this.audioCtx.createMediaStreamSource(stream);
        this.source.connect(this.analyzerNode);

        this.visualize();
      },

      // Error callback
      function (err) {
        console.log('The following gUM error occured: ' + err);
      }
    );
  }

  getWidth(): string {
    return (this.WIDTH || 0) + 'px';
  }

  getHeight(): string {
    return (this.HEIGHT || 0) + 'px';
  }

  visualize() {
    this.analyzerNode.fftSize = 512;
    this.bufferLengthAlt = this.analyzerNode.frequencyBinCount;
    this.dataArrayAlt = new Uint8Array(this.bufferLengthAlt);
    this.canvasCtx.clearRect(0, 0, this.WIDTH, this.HEIGHT);

    this.drawAlt();

  }

  drawAlt() {
    this.analyzerNode.getByteFrequencyData(this.dataArrayAlt);

    this.canvasCtx.fillStyle = 'rgb(0, 0, 0)';
    this.canvasCtx.fillRect(0, 0, this.WIDTH, this.HEIGHT);

    var barWidth = (this.WIDTH / this.bufferLengthAlt) * 2.5;
    var barHeight;
    var x = 0;

    for (var i = 0; i < this.bufferLengthAlt; i++) {
      barHeight = this.dataArrayAlt[i];

      this.canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',100,50)';
      this.canvasCtx.fillRect(x, this.HEIGHT - barHeight / 2, barWidth, barHeight / 2);
      if (barHeight > 0) {
        this.canvasCtx.beginPath();
        this.canvasCtx.arc(x + (barWidth / 2), (this.HEIGHT - barHeight / 2) + 1, (barWidth / 2) - 1, Math.PI, 0);
        this.canvasCtx.fill();
      }

      x += barWidth + 1;
    }
    this.drawVisual = requestAnimationFrame(() => this.drawAlt());

  };
}
