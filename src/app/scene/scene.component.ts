import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  ViewChild,
  HostListener,
  SimpleChanges,
  OnChanges
} from "@angular/core";
import * as THREE from "three";
import "./js/EnableThreeExamples";
import "three/examples/js/controls/OrbitControls";
import "three/examples/js/loaders/ColladaLoader";
import { saveAs } from "file-saver";
import * as exportSTL from "threejs-export-stl";
// const exportSTL = require('threejs-export-stl');
class Construction {
  stoykaWidth: number;
  stoykaHeight: number;
  stoykaDepth: number;
  bilboardWidth: number;
  bilboardHeigth: number;
  bilboardDepth: number;
  sForSquare: number;
  sForRing: number;
  constructor(
    StoykaWidth,
    StoykaHeight,
    StoykaDepth,
    BilboardWidth,
    BilboardHeigth,
    BilboardDepth
  ) {
    this.sForSquare = 1;
    this.sForRing = 1;
    this.stoykaDepth = StoykaDepth;
    this.stoykaHeight = StoykaHeight;
    this.stoykaWidth = StoykaWidth;
    this.bilboardHeigth = BilboardHeigth;
    this.bilboardDepth = BilboardDepth;
    this.bilboardWidth = BilboardWidth;
  }
}
class BillBoard {
  // stoykaWidth: number;
  // stoykaHeight: number;
  // stoykaDepth: number;
  // bilboardWidth: number;
  // bilboardHeigth: number;
  // bilboardDepth: number;
  // boardCarcas: boolean;
  // stoykaCarcas: boolean;
  typeOfStoyka: string;
  construction: Construction;
  material: string;
  floorMaterial: string;

  logo: string;
  P: number; //густота
  V: number; // скорость ветра
  S: number; // площадь
  A: number; // угол
  materialP: number;
  materiealE: number;
  // calculation: Calculation;
  getBoardArea() {
    return (
      ((this.construction.bilboardWidth / 100) *
        this.construction.bilboardHeigth) /
      100
    );
  }
  getBoardV() {
    return (
      ((((this.construction.bilboardWidth / 100) *
        this.construction.bilboardHeigth) /
        100) *
        this.construction.bilboardDepth) /
      100
    );
  }
  getBoardMassa() {
    console.log(this.materialP);
    this.materialP = 7850;
    return this.materialP * this.getBoardV();
  }
  getFkr() {
    const heighInM = this.construction.bilboardHeigth / 100;
    const widthInM = this.construction.bilboardWidth / 100;
    console.log(this);
    return Number(((0.11 * this.V) / Math.max(heighInM, widthInM)).toFixed(2));
  }
  getF() {
    const stoykaHeighInM = this.construction.stoykaHeight / 100;
    // this.materiealE = 2.1 * 10 ** 11;
    // console.log(this.materiealE);
    // console.log((Math.sqrt((3*this.materiealE*Jy) / (this.getBoardMassa() * this.stoykaHeight**3))));
    return Number(
      Math.sqrt(
        (3 * this.materiealE * this.calculateJy()) /
          (this.getBoardMassa() * stoykaHeighInM ** 3)
      ).toFixed(2)
    );
  }
  styleForZnak() {
    return this.getFkr() < this.getF();
  }
  calculateFWIND() {
    return (
      0.5 *
      this.P *
      this.V ** 2 *
      this.getBoardArea() *
      Number(Math.cos(this.toRadians(this.A)).toFixed(2))
    ).toFixed(2);
  }
  calculateMoment() {
    const stoykaHeightInMetre = this.construction.stoykaHeight / 100;
    return (Number(this.calculateFWIND()) * stoykaHeightInMetre) / 100;
  }
  toRadians(angle) {
    // console.log(angle * (Math.PI / 180));
    return Number((angle * (Math.PI / 180)).toFixed(2));
  }
  calculateJy() {
    const {
      typeOfStoyka,
      construction: { sForRing, sForSquare }
    } = this;
    const stoykaWidthInMetre = this.construction.stoykaWidth / 100;
    const sForSquareInMetre = sForSquare / 100;
    const sForRingInMetre = sForRing / 100;
    const PI = Math.PI;
    console.log(this.typeOfStoyka);
    if (typeOfStoyka == "rectangle") {
      return Number((stoykaWidthInMetre ** 4 / 12).toFixed(2));
    }
    if (typeOfStoyka == "square") {
      return Number(
        (((2 / 3) * stoykaWidthInMetre ** 3) / sForSquareInMetre).toFixed(2)
      );
    }
    if (typeOfStoyka == "ring") {
      return Number(
        (
          ((PI * stoykaWidthInMetre ** 4) / 64) *
          (1 - sForRingInMetre / stoykaWidthInMetre)
        ).toFixed(2)
      );
    }
    if (typeOfStoyka == "circle") {
      return Number(((PI * stoykaWidthInMetre ** 4) / 64).toFixed(2));
    }
    return 1;
  }
  calculateW() {
    return Number(
      (this.calculateJy() / (this.construction.stoykaWidth / 100 / 2)).toFixed(
        2
      )
    );
  }
  calculateSigma() {
    return Number((this.calculateMoment() / this.calculateW()).toFixed(2));
  }
  constructor(
    StoykaWidth,
    StoykaHeight,
    StoykaDepth,
    BilboardWidth,
    BilboardHeigth,
    BilboardDepth
  ) {
    this.typeOfStoyka = "rectangle";
    this.construction = new Construction(200, 1000, 200, 600, 200, 50);
    this.material = "metal1";
    this.floorMaterial = "floor1";
    this.logo = "logo";
    this.materialP = 7850;
    this.materiealE = 2.1 * 10 ** 11;
    // this.calculation = new Calculation(1.2, 10, this.getBoardArea(), 45);
    this.P = 1.2;
    this.V = 10;
    this.S = this.getBoardArea();
    this.A = 45;
  }
}

@Component({
  selector: "scene",
  templateUrl: "./scene.component.html",
  styleUrls: ["./scene.component.css"]
})
export class SceneComponent implements AfterViewInit, OnChanges {
  @Input() withForm: boolean = true;
  @Input() src: any = {};

  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private cameraTarget: THREE.Vector3;
  public scene: THREE.Scene;
  public stoyka: THREE.Mesh;
  stoykaCylinder: THREE.Mesh;
  BottomPart: THREE.Mesh;
  TopPart: THREE.Mesh;
  Floor: THREE.Mesh;
  // fWind: Fwind;
  public fieldOfView: number = 60;
  public nearClippingPane: number = 1;
  public farClippingPane: number = 5000;
  public billBoard: BillBoard;
  stoykaHeight: Number;
  public controls: THREE.OrbitControls;

  @ViewChild("canvas") private canvasRef: ElementRef;
  ngOnChanges(changes: SimpleChanges) {
    console.log(1)
    if (changes.src && changes.src.currentValue) {
      this.src = changes.src.currentValue;
      console.log(2)
      this.changeMaterial();
    }
  }
  constructor() {
    this.render = this.render.bind(this);
    this.billBoard = new BillBoard(200, 1000, 200, 600, 200, 50);
    // this.fWind = new Fwind(1.2,10,this.billBoard.getBoardArea(),45);
    this.onModelLoadingCompleted = this.onModelLoadingCompleted.bind(this);
  }

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  private createScene() {
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.AxesHelper(200));
    var loader = new THREE.ColladaLoader();
    var light = new THREE.PointLight(0xffffff);
    light.position.set(0, 2000, -10);
    this.scene.add(light);
    loader.load("assets/model/multimaterial.dae", this.onModelLoadingCompleted);
  }

  private onModelLoadingCompleted(collada) {
    var modelScene = collada.scene;
    this.scene.add(modelScene);
    this.render();
  }

  private createLight() {
    // var light = new THREE.PointLight(0xffffff, 1, 1000);
    // light.position.set(0, 0, 100);
    // this.scene.add(light);

    var light = new THREE.PointLight(0xffffff, 1, 1000);
    light.position.set(1000, 2000, 1000);
    this.scene.add(light);
  }

  private createCamera() {
    let aspectRatio = this.getAspectRatio();
    this.camera = new THREE.PerspectiveCamera(
      this.fieldOfView,
      aspectRatio,
      this.nearClippingPane,
      this.farClippingPane
    );

    // Set position and look at
    this.camera.position.x = 300;
    this.camera.position.y = 1600;
    this.camera.position.z = 1000;
    // this.camera.far = 6000;
    // this.camera.lookAt(this.renderer.domElement);
  }

  private getAspectRatio(): number {
    let height = this.canvas.clientHeight;
    if (height === 0) {
      return 0;
    }
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  private startRendering() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true
    });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0xffffff, 1);
    this.renderer.autoClear = true;

    let component: SceneComponent = this;

    (function render() {
      //requestAnimationFrame(render);
      component.render();
    })();
  }

  changeSize() {
    //Расчеты для стойки
    Object.keys(this.billBoard.construction).map((key, index) => {
      if (this.billBoard.construction[key]) {
        this.billBoard.construction[key] =
          this.billBoard.construction[key] > 1000
            ? 1000
            : this.billBoard.construction[key];
        this.billBoard.construction[key] =
          this.billBoard.construction[key] < 0
            ? 1
            : this.billBoard.construction[key];
      } else this.billBoard.construction[key] = 1;
    });
    const {
      billBoard: { typeOfStoyka }
    } = this;
    console.log("--------------");
    console.log(this.scene.children);
    console.log("--------------");
    if (typeOfStoyka == "circle" || typeOfStoyka == "ring") {
      this.stoyka.visible = false;
      this.stoykaCylinder.visible = true;
    }
    if (typeOfStoyka == "rectangle" || typeOfStoyka == "square") {
      this.stoyka.visible = true;
      this.stoykaCylinder.visible = false;
      // console.log(a);
    }
    console.log(this.stoyka.geometry);
    const height = (this.stoyka.geometry as any).parameters.height;
    const width = (this.stoyka.geometry as any).parameters.width;
    const depth = (this.stoyka.geometry as any).parameters.depth;
    // this.stoyka.geometry.parameters;
    (this.stoyka
      .geometry as any).parameters.height = this.billBoard.construction.stoykaHeight;
    (this.stoyka
      .geometry as any).parameters.width = this.billBoard.construction.stoykaWidth;
    (this.stoyka
      .geometry as any).parameters.depth = this.billBoard.construction.stoykaWidth;
    this.stoyka.position.setY(this.billBoard.construction.stoykaHeight / 2);
    this.stoykaCylinder.position.setY(
      this.billBoard.construction.stoykaHeight / 2
    );
    let scaleFactorY = this.billBoard.construction.stoykaHeight / height;
    let scaleFactorX = this.billBoard.construction.stoykaWidth / width;
    let scaleFactorZ = scaleFactorX;
    // Рассчеты для нижней части
    const BottomPartHeight = (this.BottomPart.geometry as any).parameters
      .height;

    (this.BottomPart.geometry as any).parameters.height *= scaleFactorY;
    (this.BottomPart.geometry as any).parameters.width *= scaleFactorX;
    (this.BottomPart.geometry as any).parameters.depth *= scaleFactorZ;
    const bottomPartYposition = (BottomPartHeight * scaleFactorY) / 2;
    this.BottomPart.geometry.scale(scaleFactorX, scaleFactorY, scaleFactorZ);
    this.BottomPart.position.setY(bottomPartYposition);
    // this.BottomPart.position.setY( this.BottomPart.geometry.height /2);
    // Расчеты для верхней части
    const bilboardHeigth = (this.TopPart.geometry as any).parameters.height;
    const bilboardWidth = (this.TopPart.geometry as any).parameters.width;
    const bilboardDepth = (this.TopPart.geometry as any).parameters.depth;

    (this.TopPart
      .geometry as any).parameters.height = this.billBoard.construction.bilboardHeigth;
    (this.TopPart
      .geometry as any).parameters.width = this.billBoard.construction.bilboardWidth;
    (this.TopPart
      .geometry as any).parameters.depth = this.billBoard.construction.bilboardDepth;

    this.TopPart.position.setY(
      this.billBoard.construction.stoykaHeight -
        this.billBoard.construction.bilboardHeigth / 2
    );
    this.TopPart.position.setZ(
      this.billBoard.construction.stoykaWidth / 2 +
        this.billBoard.construction.bilboardDepth / 2
    );
    let scaleFactorBoardY =
      this.billBoard.construction.bilboardHeigth / bilboardHeigth;
    let scaleFactorBoardX =
      this.billBoard.construction.bilboardWidth / bilboardWidth;
    let scaleFactorBoardZ =
      this.billBoard.construction.bilboardDepth / bilboardDepth;
    this.TopPart.geometry.scale(
      scaleFactorBoardX,
      scaleFactorBoardY,
      scaleFactorBoardZ
    );
    // console.log(this.billBoard.stoykaWidth);
    this.stoyka.geometry.scale(scaleFactorX, scaleFactorY, scaleFactorZ);
    this.stoykaCylinder.geometry.scale(
      scaleFactorX,
      scaleFactorY,
      scaleFactorZ
    );
    // this.stoyka.geometry.parameters.height = 200;

    this.render();
  }
  setSize(myMesh, xSize, ySize, zSize) {
    var scaleFactorX = xSize / myMesh.geometry.parameters.width;
    var scaleFactorY = ySize / myMesh.geometry.parameters.height;
    var scaleFactorZ = zSize / myMesh.geometry.parameters.depth;
    myMesh.scale.set(scaleFactorX, scaleFactorY, scaleFactorZ);
  }
  public render() {
    this.renderer.render(this.scene, this.camera);
  }

  public addControls() {
    this.controls = new THREE.OrbitControls(
      this.camera,
      this.renderer.domElement
    );
    this.controls.rotateSpeed = 1.0;
    this.controls.zoomSpeed = 1.2;
    this.controls.addEventListener("change", this.render);
  }

  /* EVENTS */

  public onMouseDown(event: MouseEvent) {
    console.log("onMouseDown");
    event.preventDefault();

    // Example of mesh selection/pick:
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();
    mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, this.camera);

    var obj: THREE.Object3D[] = [];
    this.findAllObjects(obj, this.scene);
    var intersects = raycaster.intersectObjects(obj);
    console.log("Scene has " + obj.length + " objects");
    console.log(intersects.length + " intersected objects found");
    intersects.forEach(i => {
      console.log(i.object); // do what you want to do with object
    });
  }

  private findAllObjects(pred: THREE.Object3D[], parent: THREE.Object3D) {
    // NOTE: Better to keep separate array of selected objects
    if (parent.children.length > 0) {
      parent.children.forEach(i => {
        pred.push(i);
        this.findAllObjects(pred, i);
      });
    }
  }

  public onMouseUp(event: MouseEvent) {
    console.log("onMouseUp");
  }

  @HostListener("window:resize", ["$event"])
  public onResize(event: Event) {
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    console.log(
      "onResize: " + this.canvas.clientWidth + ", " + this.canvas.clientHeight
    );

    this.camera.aspect = this.getAspectRatio();
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.render();
  }

  @HostListener("document:keypress", ["$event"])
  public onKeyPress(event: KeyboardEvent) {
    console.log("onKeyPress: " + event.key);
  }
  addPlane() {
    var planeGeometry = new THREE.PlaneGeometry(2000, 2000);
    var planeMaterial = new THREE.MeshBasicMaterial({ color: 0xcccccc });
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.x = 15;
    plane.position.y = 0;
    plane.position.z = 0;
    this.Floor = plane;
    this.scene.add(plane);
  }
  addCube() {
    // var geometry = new THREE.BoxGeometry( 100, 20, 1 );
    // var material = new THREE.MeshBasicMaterial( {color: 0x00ff00, wireframe: true} );
    // var cube = new THREE.Mesh( geometry, material );
    // cube.position.set(0,100,1);
    // this.scene.add( cube );
  }
  addStoyka() {
    const {
      billBoard: {
        construction: { stoykaWidth, stoykaHeight, stoykaDepth }
      }
    } = this;
    var geometry = new THREE.BoxGeometry(
      stoykaWidth,
      stoykaHeight,
      stoykaDepth
    );
    var geometryCylinder = new THREE.CylinderGeometry(
      stoykaWidth / 2,
      stoykaWidth / 2,
      stoykaHeight,
      32
    );
    // geometry.dynamic = true;

    // var material = new THREE.MeshBasicMaterial( {color: 0x00ff00, wireframe:this.billBoard.stoykaCarcas} );

    var material = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      wireframe: true
    });
    var cube = new THREE.Mesh(geometry, material);
    var cylinder = new THREE.Mesh(geometryCylinder, material);
    cube.name = "StoykaSquare";
    cylinder.name = "StoYkacylinder";
    this.stoyka = cube;
    this.stoykaCylinder = cylinder;
    cube.position.set(0, this.billBoard.construction.stoykaHeight / 2, 1);
    cylinder.position.set(0, this.billBoard.construction.stoykaHeight / 2, 1);
    console.log(this.scene.children);
    cylinder.visible = false;
    this.scene.add(cube);
    this.scene.add(cylinder);
    // this.scene.getChildByName("StoykaStoykaSquare").
    // this.scene.remove(this.scene.getChildByName("Stoyka"));
    console.log();
  }
  changeFloor() {
    if (this.billBoard.floorMaterial == "plane") {
      this.Floor.material = new THREE.MeshBasicMaterial({
        color: 0xcccccc
      });
      return this.render();
    }
    var crateTexture = THREE.ImageUtils.loadTexture(
      `assets/${this.billBoard.floorMaterial}.jpg`,
      null,
      () => {
        console.log("here");
        console.log(this);
        this.Floor.material = new THREE.MeshBasicMaterial({
          //color: 0x00ff00,
          map: crateTexture
        });
        this.render();
      }
    );
  }
  //   changeLogo() {

  //   }
  changeMaterial() {
    console.log(`assets/${this.billBoard.material}.jpg`);
    if (this.billBoard.material == "carcas") {
      const material = new THREE.MeshStandardMaterial({
        color: 0xffff00,
        wireframe: true
      });
      this.stoyka.material = material;
      this.stoykaCylinder.material = material;
      this.BottomPart.material = material;
      this.TopPart.material = material;
      this.render();
      return;
    }
    var crateTexture = THREE.ImageUtils.loadTexture(
      `assets/${this.billBoard.material}.jpg`,
      null,
      () => {
        console.log("here");
        console.log(this);
        const material = new THREE.MeshBasicMaterial({
          //color: 0x00ff00,
          map: crateTexture
        });
        this.stoyka.material = material;
        this.BottomPart.material = material;
        this.stoykaCylinder.material = material;
        var materialArray = [];
        materialArray.push(material);
        materialArray.push(material);
        materialArray.push(material);
        materialArray.push(material);
        console.log(this.src)
        materialArray.push(
          new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture(
              this.src ||  `assets/${this.billBoard.logo}.jpg`,
              null,
              () => {
                this.render();
              }
            )
          })
        );
        materialArray.push(
          new THREE.MeshBasicMaterial({
            map: crateTexture
          })
        );
        var DiceBlueMaterial = new THREE.MeshFaceMaterial(materialArray);
        // this.TopPart.material = new THREE.MeshBasicMaterial({
        //   //color: 0xffff00,
        //   map: crateTexture
        // });
        this.TopPart.material = DiceBlueMaterial;
        this.render();
      }
    );
  }
  //downPart
  addBottomBoard() {
    const r =
      this.billBoard.construction.stoykaWidth +
      this.billBoard.construction.stoykaWidth * 0.2;
    const height = this.billBoard.construction.stoykaHeight * 0.15;

    var geometry = new THREE.CylinderGeometry(r, r, height, 32); //32 circle 3- triangle 4- square
    // var geometry = new THREE.BoxGeometry( 20, 150, 10 );

    var material = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      wireframe: true
    });

    var cylinder = new THREE.Mesh(geometry, material);
    cylinder.name = "BottoMPart";
    this.BottomPart = cylinder;
    cylinder.position.set(0, height / 2, 1);
    this.scene.add(cylinder);
  }
  addTopBoard() {
    const r = 60;
    // var geometry = new THREE.CylinderGeometry( r, r, 50, 3, null, true); //32 circle 3- triangle 4- square
    // geometry.
    var geometry = new THREE.BoxGeometry(
      this.billBoard.construction.bilboardWidth,
      this.billBoard.construction.bilboardHeigth,
      this.billBoard.construction.bilboardDepth
    );
    var material = new THREE.MeshStandardMaterial({
      color: 0xffff00,
      wireframe: true
    });
    var cylinder = new THREE.Mesh(geometry, material);
    // cylinder.geometry.
    cylinder.name = "BottoMPart";
    this.TopPart = cylinder;
    const positionZ =
      this.billBoard.construction.stoykaDepth / 2 +
      this.billBoard.construction.bilboardDepth / 2;
    const positionY =
      this.billBoard.construction.stoykaHeight -
      this.billBoard.construction.bilboardHeigth / 2;
    cylinder.position.set(0, positionY, positionZ);
    this.scene.add(cylinder);
  }
  importStl() {
    // THREE.STLEx
    const {
      billBoard: {
        construction: { stoykaWidth, stoykaHeight, stoykaDepth }
      }
    } = this;
    var geometry = new THREE.BoxGeometry(
      stoykaWidth,
      stoykaHeight,
      stoykaDepth
    );
    var combined = new THREE.Geometry();
    const {
      billBoard: { typeOfStoyka }
    } = this;
    if (typeOfStoyka == "circle" || typeOfStoyka == "ring") {
      THREE.GeometryUtils.merge(combined, this.stoyka);
    }
    if (typeOfStoyka == "rectangle" || typeOfStoyka == "square") {
      THREE.GeometryUtils.merge(combined, this.stoykaCylinder);
    }
    THREE.GeometryUtils.merge(combined, this.TopPart);
    console.log(combined);
    THREE.GeometryUtils.merge(combined, this.BottomPart);
    console.log(combined);

    const buffer = exportSTL.fromGeometry(combined);
    const blob = new Blob([buffer], { type: exportSTL.mimeType });
    saveAs(blob, "bilboard.stl");
  }
  //TopPart
  /* LIFECYCLE */
  ngOnInit() {
    console.log("sads");
  }
  ngAfterViewInit() {
    console.log("RENDER");
    this.createScene();
    this.createLight();
    this.createCamera();
    this.addPlane();
    this.startRendering();
    this.addControls();
    this.addStoyka();
    this.addBottomBoard();
    this.addTopBoard();
    this.changeMaterial();
    // this.addCube();
  }
}
