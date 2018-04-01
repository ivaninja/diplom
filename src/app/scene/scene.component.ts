import { AfterViewInit, Component, ElementRef, Input, ViewChild, HostListener } from '@angular/core';
import * as THREE from 'three';
import "./js/EnableThreeExamples";
import "three/examples/js/controls/OrbitControls";
import "three/examples/js/loaders/ColladaLoader";
class BillBoard {
    stoykaWidth:number;
    stoykaHeight:number;
    stoykaDepth:number;
    bilboardWidth:number;
    bilboardHeigth: number;
    bilboardDepth: number;
    constructor(StoykaWidth, StoykaHeight, StoykaDepth, BilboardWidth, BilboardHeigth, BilboardDepth){
        this.stoykaDepth = StoykaDepth;
        this.stoykaHeight = StoykaHeight;
        this.stoykaWidth = StoykaWidth;
        this.bilboardHeigth = BilboardHeigth;
        this.bilboardDepth = BilboardDepth;
        this.bilboardWidth =BilboardWidth;
    }
}
@Component({
    selector: 'scene',
    templateUrl: './scene.component.html',
    styleUrls: ['./scene.component.css']
})
export class SceneComponent implements AfterViewInit {

    private renderer: THREE.WebGLRenderer;
    private camera: THREE.PerspectiveCamera;
    private cameraTarget: THREE.Vector3;
    public scene: THREE.Scene;
    public stoyka: THREE.Mesh;
    BottomPart : THREE.Mesh;
    TopPart : THREE.Mesh;
    public fieldOfView: number = 60;
    public nearClippingPane: number = 1;
    public farClippingPane: number = 5000;
    public billBoard: BillBoard;
    stoykaHeight: Number;
    public controls: THREE.OrbitControls;

    @ViewChild('canvas')
    private canvasRef: ElementRef;

    constructor() {
        this.render = this.render.bind(this);
        this.billBoard = new BillBoard(200,1000,200,600,200,50);
        this.onModelLoadingCompleted = this.onModelLoadingCompleted.bind(this);
    }

    private get canvas(): HTMLCanvasElement {
        return this.canvasRef.nativeElement;
    }

    private createScene() {
        this.scene = new THREE.Scene();
        this.scene.add(new THREE.AxisHelper(200));
        var loader = new THREE.ColladaLoader();
        loader.load('assets/model/multimaterial.dae', this.onModelLoadingCompleted);
    }

    private onModelLoadingCompleted(collada) {
        var modelScene = collada.scene;
        this.scene.add(modelScene);
        this.render();
    }

    private createLight() {
        var light = new THREE.PointLight(0xffffff, 1, 1000);
        light.position.set(0, 0, 100);
        this.scene.add(light);

        var light = new THREE.PointLight(0xffffff, 1, 1000);
        light.position.set(0, 0, -100);
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
        this.camera.position.x = 10;
        this.camera.position.y = 1000;
        this.camera.position.z = 100;
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
        }());
    }
    
    changeSize(){
        //Расчеты для стойки
        Object.keys(this.billBoard).map((key, index) => {
            this.billBoard[key] = this.billBoard[key] > 1000 ? 1000: this.billBoard[key];
         });
        const height = this.stoyka.geometry.parameters.height;
        const width = this.stoyka.geometry.parameters.width;
        const depth = this.stoyka.geometry.parameters.depth;
        this.stoyka.geometry.parameters.height = this.billBoard.stoykaHeight;
        this.stoyka.geometry.parameters.width =  this.billBoard.stoykaWidth;
        this.stoyka.geometry.parameters.depth =  this.billBoard.stoykaWidth;
        this.stoyka.position.setY(this.billBoard.stoykaHeight/2);
        let scaleFactorY = this.billBoard.stoykaHeight /height;
        let scaleFactorX = this.billBoard.stoykaWidth /width;
        let scaleFactorZ = scaleFactorX;
        // Рассчеты для нижней части
        const BottomPartHeight = this.BottomPart.geometry.parameters.height;
        this.BottomPart.geometry.parameters.height = BottomPartHeight * scaleFactorY;
        const bottomPartYposition = BottomPartHeight * scaleFactorY / 2;
        this.BottomPart.geometry.scale(scaleFactorX, scaleFactorY, scaleFactorZ);
        this.BottomPart.position.setY(bottomPartYposition);
        // this.BottomPart.position.setY( this.BottomPart.geometry.height /2);
        // Расчеты для верхней части
        const bilboardHeigth = this.TopPart.geometry.parameters.height;
        const bilboardWidth = this.TopPart.geometry.parameters.width;
        const bilboardDepth = this.TopPart.geometry.parameters.depth;

        this.TopPart.geometry.parameters.height =  this.billBoard.bilboardHeigth;
        this.TopPart.geometry.parameters.width =  this.billBoard.bilboardWidth;
        this.TopPart.geometry.parameters.depth =  this.billBoard.bilboardDepth;

        this.TopPart.position.setY(this.billBoard.stoykaHeight - this.billBoard.bilboardHeigth /2);
        this.TopPart.position.setZ(this.billBoard.stoykaWidth / 2 + this.billBoard.bilboardDepth /2)  ;
        let scaleFactorBoardY = this.billBoard.bilboardHeigth / bilboardHeigth;
        let scaleFactorBoardX = this.billBoard.bilboardWidth /bilboardWidth;
        let scaleFactorBoardZ = this.billBoard.bilboardDepth / bilboardDepth;
        this.TopPart.geometry.scale(scaleFactorBoardX, scaleFactorBoardY, scaleFactorBoardZ);
        console.log(this.billBoard.stoykaWidth);
        this.stoyka.geometry.scale(scaleFactorX, scaleFactorY , scaleFactorZ);
        
        // this.stoyka.geometry.parameters.height = 200;

        this.render();
    }
    setSize( myMesh, xSize, ySize, zSize){
        var  scaleFactorX = xSize / myMesh.geometry.parameters.width;
        var  scaleFactorY = ySize / myMesh.geometry.parameters.height;
        var  scaleFactorZ = zSize / myMesh.geometry.parameters.depth;
          myMesh.scale.set( scaleFactorX, scaleFactorY, scaleFactorZ );
        }
    public render() {
        this.renderer.render(this.scene, this.camera);
    }

    public addControls() {
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.rotateSpeed = 1.0;
        this.controls.zoomSpeed = 1.2;
        this.controls.addEventListener('change', this.render);

    }

    /* EVENTS */

    public onMouseDown(event: MouseEvent) {
        console.log("onMouseDown");
        event.preventDefault();
    
        // Example of mesh selection/pick:
        var raycaster = new THREE.Raycaster();
        var mouse = new THREE.Vector2();
        mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
        mouse.y = - (event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, this.camera);

        var obj: THREE.Object3D[] = [];
        this.findAllObjects(obj, this.scene);
        var intersects = raycaster.intersectObjects(obj);
        console.log("Scene has " + obj.length + " objects");
        console.log(intersects.length + " intersected objects found")
        intersects.forEach((i) => {
            console.log(i.object); // do what you want to do with object
        });

    }

    private findAllObjects(pred: THREE.Object3D[], parent: THREE.Object3D) {
        // NOTE: Better to keep separate array of selected objects
        if (parent.children.length > 0) {
            parent.children.forEach((i) => {
                pred.push(i);
                this.findAllObjects(pred, i);                
            });
        }
    }

    public onMouseUp(event: MouseEvent) {
        console.log("onMouseUp");
    }


    @HostListener('window:resize', ['$event'])
    public onResize(event: Event) {
        this.canvas.style.width = "100%";
        this.canvas.style.height = "100%";
        console.log("onResize: " + this.canvas.clientWidth + ", " + this.canvas.clientHeight);

        this.camera.aspect = this.getAspectRatio();
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.render();
    }

    @HostListener('document:keypress', ['$event'])
    public onKeyPress(event: KeyboardEvent) {
        console.log("onKeyPress: " + event.key);
    }
    addPlane(){
        var planeGeometry = new THREE.PlaneGeometry(2000,2000);
        var planeMaterial = new THREE.MeshBasicMaterial(
            {color: 0xcccccc});
        var plane = new THREE.Mesh(planeGeometry,planeMaterial);
        plane.rotation.x = -0.5*Math.PI;
        plane.position.x = 15;
        plane.position.y = 0;
        plane.position.z = 0;
        this.scene.add(plane);
    }
    addCube(){
        // var geometry = new THREE.BoxGeometry( 100, 20, 1 );
        // var material = new THREE.MeshBasicMaterial( {color: 0x00ff00, wireframe: true} );
        // var cube = new THREE.Mesh( geometry, material );
        // cube.position.set(0,100,1);
        // this.scene.add( cube );
    }
    addStoyka(){
        var geometry = new THREE.BoxGeometry( this.billBoard.stoykaWidth, this.billBoard.stoykaHeight, this.billBoard.stoykaDepth );
        // geometry.dynamic = true;
        
        var material = new THREE.MeshBasicMaterial( {color: 0x00ff00, wireframe:true} );
        var cube = new THREE.Mesh( geometry, material );
        cube.name = "Stoyka"
        this.stoyka = cube;
        cube.position.set(0,this.billBoard.stoykaHeight/2,1);
        console.log(this.scene.children)

        this.scene.add( cube );
        // this.scene.getChildByName("Stoyka").
        // this.scene.remove(this.scene.getChildByName("Stoyka"));
        console.log()
    }

    //downPart
    addBottomBoard(){
        const r =this.billBoard.stoykaWidth + this.billBoard.stoykaWidth * 0.2;
        const height = this.billBoard.stoykaHeight * 0.15;
        var geometry = new THREE.CylinderGeometry( r, r, height, 32 ); //32 circle 3- triangle 4- square
        // var geometry = new THREE.BoxGeometry( 20, 150, 10 );
        
        var material = new THREE.MeshBasicMaterial( {color: 0xffff00, wireframe:true} );
        var cylinder = new THREE.Mesh( geometry, material );
        cylinder.name = "BottoMPart"
        this.BottomPart = cylinder;
        cylinder.position.set(0,height/2,1);
        this.scene.add( cylinder );
    }
    addTopBoard(){
        const r = 60;
       // var geometry = new THREE.CylinderGeometry( r, r, 50, 3, null, true); //32 circle 3- triangle 4- square
        // geometry.
        var geometry = new THREE.BoxGeometry( this.billBoard.bilboardWidth, this.billBoard.bilboardHeigth, 
            this.billBoard.bilboardDepth );
        var material = new THREE.MeshBasicMaterial( {color: 0xffff00, wireframe:false} );
        var cylinder = new THREE.Mesh( geometry, material );
        // cylinder.geometry.
        cylinder.name = "BottoMPart"
        this.TopPart = cylinder;
        const positionZ = this.billBoard.stoykaDepth / 2 + this.billBoard.bilboardDepth/2;
        const positionY = this.billBoard.stoykaHeight - this.billBoard.bilboardHeigth / 2;
        cylinder.position.set(0,positionY,positionZ);
        this.scene.add( cylinder );
    }
    //TopPart
    /* LIFECYCLE */
    ngAfterViewInit() {
        this.createScene();
        this.createLight();
        this.createCamera();
        this.addPlane();
        this.startRendering();
        this.addControls();
        this.addStoyka();
        this.addBottomBoard();
        this.addTopBoard()
        // this.addCube();

    }

}