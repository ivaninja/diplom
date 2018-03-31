import { AfterViewInit, Component, ElementRef, Input, ViewChild, HostListener } from '@angular/core';
import * as THREE from 'three';
import "./js/EnableThreeExamples";
import "three/examples/js/controls/OrbitControls";
import "three/examples/js/loaders/ColladaLoader";

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

    public fieldOfView: number = 60;
    public nearClippingPane: number = 1;
    public farClippingPane: number = 1100;

    public controls: THREE.OrbitControls;

    @ViewChild('canvas')
    private canvasRef: ElementRef;

    constructor() {
        this.render = this.render.bind(this);
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
        this.camera.position.y = 300;
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

    public render() {
        this.renderer.render(this.scene, this.camera);
    }

    public addControls() {
        this.controls = new THREE.OrbitControls(this.camera);
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
        var planeGeometry = new THREE.PlaneGeometry(1000,1000);
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
        var geometry = new THREE.BoxGeometry( 100, 20, 1 );
        var material = new THREE.MeshBasicMaterial( {color: 0x00ff00, wireframe: true} );
        var cube = new THREE.Mesh( geometry, material );
        cube.position.set(0,100,1);
        this.scene.add( cube );
    }
    addStoyka(){
        var geometry = new THREE.BoxGeometry( 20, 150, 10 );
        var material = new THREE.MeshBasicMaterial( {color: 0x00ff00, wireframe:true} );
        var cube = new THREE.Mesh( geometry, material );
        cube.position.set(0,75,1);
        this.scene.add( cube );
    }

    //downPart
    addBottomBoard(){
        const r = 15;
        var geometry = new THREE.CylinderGeometry( r, r, 20, 32 ); //32 circle 3- triangle 4- square
        var material = new THREE.MeshBasicMaterial( {color: 0xffff00, wireframe:true} );
        var cylinder = new THREE.Mesh( geometry, material );
        cylinder.position.set(0,10,1);
        this.scene.add( cylinder );
    }
    addTopBoard(){
        const r = 60;
        var geometry = new THREE.CylinderGeometry( r, r, 50, 3, null, true); //32 circle 3- triangle 4- square
        // geometry.
        var material = new THREE.MeshBasicMaterial( {color: 0xffff00, wireframe:true} );
        var cylinder = new THREE.Mesh( geometry, material );
        // cylinder.geometry.
        cylinder.position.set(0,110,1);
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