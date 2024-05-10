import { Component, ElementRef, ViewChild } from '@angular/core';
import Modeler from 'bpmn-js/lib/Modeler';
import BpmnColorPickerModule from 'bpmn-js-color-picker';
import minimapModule from 'diagram-js-minimap';
import ruTranslateModule from '../ru-translate/ru-translate'
import { Moddle } from 'bpmn-js/lib/model/Types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  events = [
    'element.hover',
    'element.out',
    'element.click',
    'element.dblclick',
    'element.mousedown',
    'element.mouseup'
  ];
  @ViewChild('diagram', { static: true }) private el: ElementRef<HTMLDivElement> | undefined;
  @ViewChild('downloadLink', { static: true }) private downloadLink: ElementRef<HTMLAnchorElement> | undefined;
  @ViewChild('downloadSvgLink', { static: true }) private downloadSvgLink: ElementRef<HTMLAnchorElement> | undefined;
  
  bpmnModeler: Modeler = new Modeler({ 
      additionalModules: [
        BpmnColorPickerModule,
        minimapModule,
        ruTranslateModule
        ]
    });
  onFileSelected(event: any) {

    const file:File = event.target.files[0];
    if (file) {
      // this.fileName = file.name;
      this.readerFilePromise(file)
      .then( xml => this.bpmnModeler.importXML(xml)
        .then(importResult => {
          this.updateExportLinks(this.bpmnModeler);
          //clear input value for reloading file with same name next time
          event.target.value = null;

          this.registerEvents();
          let canvas: any = this.bpmnModeler.get('canvas');
          canvas?null:canvas.zoom('fit-viewport');
        })
      )
      .catch(err => alert(err));
    }
  }

  readerFilePromise(file: File): Promise<string> {

    // check file api availability
    if (!window.FileReader) {
      window.alert(
        'Looks like you use an older browser that does not support drag and drop. ' +
        'Try using a modern browser such as Chrome, Firefox or Internet Explorer > 10.');
    }
    
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result as string);
      fr.readAsText(file);
    });
  }

  registerEvents(){
    var eb: any = this.bpmnModeler.get('eventBus');
    this.events.forEach(function(event) {
      eb.on(event, (e: any) => {
        // e.element = the model element
        // e.gfx = the graphical element
        console.log(event, 'on', e.element.id);
      });
    });
  }

  ngAfterContentInit(): void {

    this.bpmnModeler = new Modeler({ container: this.el?.nativeElement, 
      additionalModules: [
        BpmnColorPickerModule,
        minimapModule,
        ruTranslateModule
      ]});
    this.bpmnModeler.on('element.changed', (event: any) => {
      this.updateExportLinks(this.bpmnModeler);
    });
  }

  startNew(): void {
    this.bpmnModeler.createDiagram()
    .then(()=>{
      
      var moddle: Moddle = this.bpmnModeler.get('moddle');
      // var er: any = this.bpmnModeler.get('elementRegistry')
      var procObj = (this.bpmnModeler.get('elementRegistry') as any).get('Process_1').businessObject,
        startObj = (this.bpmnModeler.get('elementRegistry') as any).get('StartEvent_1').businessObject;
      procObj.id = (moddle as Moddle).ids.nextPrefixed('Process_', procObj);
      startObj.id = (moddle as Moddle).ids.nextPrefixed('StartEvent_', startObj);
      // console.log(proc.id)
      this.updateExportLinks(this.bpmnModeler);
    })
    .catch(console.error);
  }

  startSample(): void {

    fetch("assets/0.bpmn")
    .then(res =>res.text())
    .then(xml => this.bpmnModeler.importXML(xml)
      .then(importResult => { 
        this.updateExportLinks(this.bpmnModeler);
        let canvas: any = this.bpmnModeler.get('canvas');
        canvas?null:canvas.zoom('fit-viewport');
      }))
    .catch(err => console.log(err));
  }

  private setEncoded(link: HTMLAnchorElement|undefined, name: string, data: string|undefined): void {

    if (data && link) {
      var encodedData = encodeURIComponent(data);
      link.classList.add('active')
      link.href = 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData;
      link.download = name;
    } else {
      link?.classList.remove('active');
    }
  }

  async updateExportLinks(bpmnModeler: Modeler) {
    
    try {

      const { svg } = await bpmnModeler.saveSVG();
      this.setEncoded(this.downloadSvgLink?.nativeElement, 'diagram.svg', svg);
    } catch (err) {

      console.error('Error happened saving SVG: ', err);
      this.setEncoded(this.downloadSvgLink?.nativeElement, 'diagram.svg', undefined);
    }

    try {

      const { xml } = await bpmnModeler.saveXML({ format: true });
      this.setEncoded(this.downloadLink?.nativeElement, 'diagram.bpmn', xml);
    } catch (err) {

      console.error('Error happened saving diagram: ', err);
      this.setEncoded(this.downloadLink?.nativeElement, 'diagram.bpmn', undefined);
    }
  }
}
