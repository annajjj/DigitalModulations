import { Component, OnInit, Input, ViewChild, ElementRef, SimpleChanges, SimpleChange, HostListener } from '@angular/core';
import { ParamsSet, Frame } from '../interfaces/interfaces';

@Component({
  selector: 'new-plot',
  template: `

  <button (click)="x()">nacisnij mnie</button>
    <div #plot id="plot">

    </div>
  `,
  styles: [``]
})
export class newPlotComponent implements OnInit {
  @Input() paramsSet: ParamsSet;
  @Input() signal: (bits: number[]) => void;
  @Input() modulation: () => void;

  @ViewChild('plot') plotObject: ElementRef;

  frames: Frame[] = [];
  constructor() { }

  ngOnInit() {
    this.plotObject = this.plotObject.nativeElement;
        this.signal(this.paramsSet.bits);
this.harmonic();
    console.log(this.paramsSet.bits)
    this.modulation();
    this.funtionPlot();
  }

  x(){
    this.signal(this.paramsSet.bits);
    this.funtionPlot();
  }

  async ngOnChanges(changes: SimpleChanges) {
    const name: SimpleChange = changes.paramsSet['bits'];
    console.log(this.paramsSet.bits)
    this.signal(await this.paramsSet.bits);
    await this.funtionPlot();
  }

  getFrame(name: string) {
    let result = this.frames.find((frame: Frame) => frame.name === name);
    if (result !== undefined) return result;
    else throw(`cannot find frame called: ${name}`)
  }

  makeFrame(name: string) {
    let index = this.frames.findIndex((frame: Frame) => frame.name === name);
    if (index !== -1) this.frames.splice(index,1);
    this.frames.push({ name: name, data: [{ x: [], y: [] }] });
    return this.frames[this.frames.length - 1];
  }



  getFrames(...args: string[]) {
    if (args.length === 0) return [{ x: [], y: [], line: { simplify: false } }];
    let result = [];
    args.forEach((arg: string) => {
      const frame = this.frames.find((frame: Frame) => frame.name === arg);
      result.push({
        x: frame.data[0].x,
        y: frame.data[0].y,
        name: arg,
        line: { simplify: false }
      })
    });
    return result;
  }

  funtionPlot() {
    Plotly.purge(this.plotObject);
    Plotly.plot(this.plotObject, this.getFrames('harmonic', 'signal', 'modulation'), {
      autosize: true,
      title: this.paramsSet.name
    }, { displayModeBar: true });
  }


  
  @HostListener('window:resize', ['$event'])
  resize(): void {
    Plotly.Plots.resize(document.getElementById('plot'));
  }

  // region Modulation API
  harmonic() {
    const harmonic = this.makeFrame('harmonic');
    for (let i = 0, t = i;
      i < this.paramsSet.samplingRate * this.paramsSet.bits.length;
      i++ , t = i / ((this.paramsSet.samplingRate - 1) * this.paramsSet.frequency * 1000 * 1000) * this.paramsSet.bits.length) {
      harmonic.data[0].x[i] = t * this.paramsSet.scale;
      harmonic.data[0].y[i] = Math.sin(t * this.paramsSet.frequency * Math.PI * 1000 * 1000);
    }
  }



  // endregion
}


