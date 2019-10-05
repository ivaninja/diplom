import { Component, ViewChild, AfterViewInit } from "@angular/core";
import { ToastUiImageEditorComponent } from "../toast-ui-image-editor/src/lib/toast-ui-image-editor.component" ;
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
  configBillboardForClient: any = {
    StoykaWidth: 100,
    StoykaHeight: 800,
    StoykaDepth: 100,
    BilboardWidth: 600,
    BilboardHeigth: 250,
    BilboardDepth: 50,
    typeOfStoyka: "rectangle",
    material: "metal1",
    floorMaterial: "floor1",
    logo: "logo"
  };
  test() {
    this.designerMode = "Billboard";
    this.testImg =
      (this.editorComponent.editorInstance as any)._graphics.toDataURL({}) ||
      null;
    console.log(this.testImg); //   _canvas.toDataURL({}))
  }
  ngAfterViewInit() {}
}
