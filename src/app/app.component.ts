import { Component, ElementRef, ViewChild } from '@angular/core';
import Modeler from 'bpmn-js/lib/Modeler';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {



  title = 'bpmn-js-app-2';
  @ViewChild('diagram', { static: true }) private el: ElementRef<HTMLDivElement> | undefined;
  // downloadLink
  // downloadSvgLink
  @ViewChild('downloadLink', { static: true }) private downloadLink: ElementRef<HTMLAnchorElement> | undefined;
  @ViewChild('downloadSvgLink', { static: true }) private downloadSvgLink: ElementRef<HTMLAnchorElement> | undefined;
  bpmnModeler: Modeler = new Modeler();

  sample: string = "";

  ngAfterContentInit(): void {
    this.bpmnModeler = new Modeler({ container: this.el?.nativeElement });
    this.bpmnModeler.on('element.changed', (event: any) => {
      this.updateExportLinks(this.bpmnModeler);
    });
  }

  async startNew() {
    let bpmnXML = await fetch("assets/start.bpmn", {}).then(res => {
        return res.text();
      });
      // import diagram
      try {
        await this.bpmnModeler.importXML(bpmnXML);
        // ...
      } catch (err) {
        // err...
      }
  }
  async startSample() {
    let bpmnXML = await fetch("assets/0.bpmn", {}).then(res => {
      return res.text();
    });
    // import diagram
    try {
      await this.bpmnModeler.importXML(bpmnXML);
      // ...
    } catch (err) {
      // err...
    }
  }
  private setEncoded(link: HTMLAnchorElement|undefined, name: string, data: string|undefined): void {

    if (data && link) {
      var encodedData = encodeURIComponent(data);
      link.classList.add('active');
      link.href = 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData;
      link.download = name;
      // link.addClass('active').attr({
      //   'href': 'data:application/bpmn20-xml;charset=UTF-8,' + encodedData,
      //   'download': name
      // });
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
