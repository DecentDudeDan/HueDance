import { HueService } from './../../core/services/hue-service.service';
import { Component, OnInit, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements OnInit {

  constructor(public navCtrl: NavController, private toastController: ToastController,
    private hueService: HueService, private ref: ChangeDetectorRef) {
  }

  sensitivity = {
    lower: -60,
    upper: 0
  };

  brightness: number = 126;
  shouldCycleColors: boolean = true;
  speed: string = "slow"

  firstColor = 'black';
  secondColor = 'black';
  thirdColor = 'black';
  fourthColor = 'black';
  fifthColor = 'black';

  private maxToastDismissed: boolean = true;
  private minToastDismissed: boolean = true;
  listening: boolean = true;

  private availableColors: string[] = ['red', 'orange', 'yellow', 'green', 'blue', 'violet'];
  private colors: string[] = [this.firstColor, this.secondColor, this.thirdColor, this.fourthColor, this.fifthColor];
  private colorIndex: number = 0;

  private stream: MediaStream;
  private WIDTH;
  private HEIGHT;
  private audioCtx: AudioContext;
  private kickLevel: number = 20;
  private lastPosition: number = 0;
  // private gainNode;
  private source: MediaStreamAudioSourceNode;
  @ViewChild('visualizer')
  private canvas: ElementRef;
  private canvasCtx;
  private drawVisual;
  private analyzerNode: AnalyserNode;
  private scriptProcessorNode: ScriptProcessorNode;
  private bufferLengthAlt;
  private dataArrayAlt;
  private window: any = window;
  private oscillator: OscillatorNode;
  private amp: GainNode;

  ngOnInit() {
    this.audioCtx = new this.window.AudioContext();
    this.canvas.nativeElement.width = (window.screen.availWidth) * 0.9;
    this.canvas.nativeElement.height = (window.screen.availHeight / 8);
    this.analyzerNode = this.audioCtx.createAnalyser();
    this.scriptProcessorNode = this.audioCtx.createScriptProcessor(4096, 1, 1);
    this.oscillator = this.audioCtx.createOscillator();
    this.oscillator.frequency.value = 100;
    this.amp = this.audioCtx.createGain();
    this.amp.gain.value = 0;
    this.analyzerNode.minDecibels = -60;
    this.analyzerNode.maxDecibels = 0;
    this.analyzerNode.smoothingTimeConstant = 0.85;


    this.canvasCtx = this.canvas.nativeElement.getContext("2d");
    this.WIDTH = this.canvas.nativeElement.width;
    this.HEIGHT = this.canvas.nativeElement.height;

    this.oscillator.connect(this.amp).connect(this.audioCtx.destination);
    this.oscillator.start();

    console.log('canvas dimensions: ', this.WIDTH, ', ', this.HEIGHT);

    if (navigator.getUserMedia) {
      console.log('getUserMedia supported.');
      this.setup();
    } else {
      console.log('getUserMedia not supported on your browser!');
    }

    this.scriptProcessorNode.onaudioprocess = (event: AudioProcessingEvent) => {
      if (!this.analyzerNode) {
        console.warn('Analyser not connected');
        return;
      }

      let dataArray = Uint8Array.from(this.dataArrayAlt.slice(0, 100));

      const max: { position: number, value: number } = this.getMaxAmplitude(dataArray);

      let splitArrays: Array<Uint8Array> = [];

      let chunk = 20;

      for (let i = 0, j = dataArray.length; i < j; i += chunk) {
        splitArrays.push(dataArray.slice(i, i + chunk));
      }
      debugger;
      splitArrays.forEach((a, i) => {
        let max = this.getMaxAmplitude(a);
        if (max.value/2 > this.HEIGHT - this.kickLevel) {
          this.colors[i] = this.getNextColor();
        } else {
          this.colors[i] = 'black';
        }
      })

      // if (max.position !== this.lastPosition) {
      //   console.log(max);
      //   if (max.position >= 0 && max.position < 14) {
      //     this.firstColor = this.shouldCycleColors ? this.getNextColor() : this.availableColors[0];
      //   } else if (max.position >= 15 && max.position < 24) {
      //     this.secondColor = this.shouldCycleColors ? this.getNextColor() : this.availableColors[1];
      //   } else if (max.position >= 25 && max.position < 34) {
      //     this.thirdColor = this.shouldCycleColors ? this.getNextColor() : this.availableColors[2];
      //   } else if (max.position >= 35 && max.position < 44) {
      //     this.fourthColor = this.shouldCycleColors ? this.getNextColor() : this.availableColors[3];
      //   } else if (max.position >= 45 && max.position < 54) {
      //     this.fifthColor = this.shouldCycleColors ? this.getNextColor() : this.availableColors[4];
      //   }
      //   this.lastPosition = max.position;
      // }

      this.ref.detectChanges();
    }
  }

  getMaxAmplitude(array: Uint8Array): any {
    let max = 0;
    let position = 0;
    array.forEach((num, i) => {
      if (num > max) {
        max = num;
        position = i;
      }
    })
    return {
      position,
      value: max
    }
  }

  getNextColor(): string {
    const index = this.colorIndex;
    if (this.colorIndex + 1 >= this.availableColors.length) {
      this.colorIndex = 0;
    } else {
      this.colorIndex++;
    }

    return this.availableColors[index];
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
      }, (stream: MediaStream) => {
        this.stream = stream;
        this.source = this.audioCtx.createMediaStreamSource(stream);
        this.source.connect(this.analyzerNode).connect(this.scriptProcessorNode).connect(this.audioCtx.destination);
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
    this.analyzerNode.fftSize = 1024;
    this.bufferLengthAlt = this.analyzerNode.frequencyBinCount;
    this.dataArrayAlt = new Uint8Array(this.bufferLengthAlt);
    this.canvasCtx.clearRect(0, 0, this.WIDTH, this.HEIGHT);


    this.drawAlt();

  }

  drawAlt() {
    this.analyzerNode.getByteFrequencyData(this.dataArrayAlt);

    this.canvasCtx.fillStyle = 'rgb(0, 0, 0)';
    this.canvasCtx.fillRect(0, 0, this.WIDTH, this.HEIGHT);
    this.canvasCtx.fillStyle = 'rgb(160,18,204)';
    this.canvasCtx.fillRect(0, this.kickLevel, this.WIDTH, 1);

    var barWidth = (this.WIDTH / this.bufferLengthAlt) * 2.5;
    var barHeight;
    var x = 0;

    for (var i = 0; i < this.bufferLengthAlt; i++) {
      barHeight = this.dataArrayAlt[i];



      this.canvasCtx.fillStyle = 'rgb(' + (barHeight + 100) + ',100,50)';
      this.canvasCtx.fillRect(x, this.HEIGHT - barHeight / 2, barWidth, barHeight / 2);

      x += barWidth + 1;
    }
    this.drawVisual = requestAnimationFrame(() => this.drawAlt());

  };

  startTone() {
    var now = this.audioCtx.currentTime;

    this.oscillator.frequency.setValueAtTime(this.brightness, now);

    // Ramp up the gain so we can hear the sound.
    // We can ramp smoothly to the desired value.
    // First we should cancel any previous scheduled events that might interfere.
    this.amp.gain.cancelScheduledValues(now);
    // Anchor beginning of ramp at current value.
    this.amp.gain.setValueAtTime(0.5, now);
    // this.amp.gain.linearRampToValueAtTime(0.5, this.audioCtx.currentTime + 0.1);
    this.amp.gain.linearRampToValueAtTime(0.0, this.audioCtx.currentTime + 1.0);


    // writeMessageToID( "soundStatus", "<p>Play tone at frequency = " + frequency  + "</p>");
  }

  stopTone() {
    var now = this.audioCtx.currentTime;
    this.amp.gain.cancelScheduledValues(now);
    this.amp.gain.setValueAtTime(this.amp.gain.value, now);
    this.amp.gain.linearRampToValueAtTime(0.0, this.audioCtx.currentTime + 1.0);
    // writeMessageToID( "soundStatus", "<p>Stop tone.</p>");
  }
}
