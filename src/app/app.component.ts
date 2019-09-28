import { Component,ViewChild, AfterViewInit } from '@angular/core';
import { ToastUiImageEditorComponent } from "ngx-tui-image-editor";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'app';
  appMode = "Designer";
  testImg = null
  @ViewChild(ToastUiImageEditorComponent) editorComponent: ToastUiImageEditorComponent;
  click(){
    this.testImg = this.editorComponent.editorInstance._graphics.toDataURL({});
    console.log(); //   _canvas.toDataURL({}))
  }
  ngAfterViewInit() {
  }
}
