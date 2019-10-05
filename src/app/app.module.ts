import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { SceneComponent } from "./scene/scene.component";
import { ToastUiImageEditorModule } from "../../src/toast-ui-image-editor/src/lib/toast-ui-image-editor.module";
// import { ToastUiImageEditorModule } from "toast-ui-image-editor";

@NgModule({
  declarations: [
    AppComponent,
    SceneComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ToastUiImageEditorModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
