import { Component, ViewChild, AfterViewInit } from "@angular/core";
import { ToastUiImageEditorComponent } from "ngx-tui-image-editor";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent implements AfterViewInit {
  title = "app";
  appMode = "Designer";
  designerMode: "Billboard" | "Edit" = "Billboard";
  testImg = null;
  @ViewChild(ToastUiImageEditorComponent)
  editorComponent: ToastUiImageEditorComponent;
  test() {
    this.designerMode = 'Billboard'
    this.testImg = (this.editorComponent
      .editorInstance as any)._graphics.toDataURL({}) || null;
    console.log(this.testImg); //   _canvas.toDataURL({}))
  }
  ngAfterViewInit() {}
}
