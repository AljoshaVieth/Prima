namespace TheYourneyOfY {
    import f = FudgeCore;
    f.Debug.info("Main Program Template running!");

    window.addEventListener("load", setup);
    let viewport: f.Viewport;
    document.addEventListener("interactiveViewportStarted", <EventListener>start);

    let graph: f.Node;
    let desiredZoomLevel: number = -30;
    let currentZoomLevel: number = -80;
    let cmpCamera: any;
    let graphId: string = "Graph|2022-01-08T12:51:22.101Z|15244";
    let objectSelected: boolean = false;
    let hoveringOverControllableObject: boolean = false;
    let player: Player;
    let controllableObjects: f.Node;
    let hoveredObject: f.Node = null;
    let controlledObject: f.Node = null;


    function start(_event: CustomEvent): void {
        console.log("Starting...");
        viewport = _event.detail;
        graph = viewport.getBranch();
        console.log(viewport);
        console.log(graph);


        controllableObjects = graph.getChildrenByName("Level")[0]
            .getChildrenByName("Surroundings")[0]
            .getChildrenByName("Foreground")[0]
            .getChildrenByName("Movables")[0]
            .getChildrenByName("Controllables")[0];
        f.Debug.info("Number of controllable Objects: " + controllableObjects.getChildren().length);



        //graph.getComponents(ƒ.ComponentAudio)[1].play(true);
        spawnPlayer();

        viewport.getCanvas().addEventListener("mousemove", mouseHoverObserver);
        viewport.getCanvas().addEventListener("mousedown", mouseDownObserver);
        viewport.getCanvas().addEventListener("mousemove", mouseMoveObserver);
        viewport.getCanvas().addEventListener("mouseup", mouseUpObserver);


        f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update);
        f.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }

    function update(_event: Event): void {
        f.Physics.world.simulate();  // if physics is included and used
        viewport.draw();
        //zoom in
        // f.Debug.info("update loop");
        if (currentZoomLevel < desiredZoomLevel) {
            currentZoomLevel++;
            cmpCamera.mtxPivot.translateZ(1);
        }
        f.AudioManager.default.update();
    }

    function mouseHoverObserver(_event: MouseEvent): void {
        if(!objectSelected){
            let ray: f.Ray = viewport.getRayFromClient(new f.Vector2(_event.clientX, _event.clientY));
            for(let controllableObject of controllableObjects.getIterator()){
                if(controllableObject.name == "Controllables"){
                    continue; //ignoring parent object since it cannot be moved and causes problems otherwise
                }
                let componentMesh: f.ComponentMesh = controllableObject.getComponent(f.ComponentMesh);
                let position: f.Vector3 = componentMesh ? componentMesh.mtxWorld.translation : controllableObject.mtxWorld.translation;
                if (ray.getDistance(position).magnitude < controllableObject.radius) {
                    //f.Debug.info("hovering over controllable object named: " + controllableObject.name);
                    hoveringOverControllableObject = true;
                    hoveredObject = controllableObject;
                    break; //ignoring other controllable objects. There can only be one.
                } else {
                    hoveringOverControllableObject = false;
                }
            }
        }
    }

    function mouseDownObserver(_event: MouseEvent): void {
        if (hoveringOverControllableObject) {
            objectSelected = true;
            controlledObject = hoveredObject;
            //f.Debug.info("Clicked controllable object named: " + controlledObject.name);
        }
    }

    function mouseUpObserver(_event: MouseEvent): void {
        objectSelected = false;
        hoveredObject = null;
        controlledObject = null;
    }

    function mouseMoveObserver(_event: MouseEvent): void {
        if (objectSelected) {
            let ray: f.Ray = viewport.getRayFromClient(new f.Vector2(_event.clientX, _event.clientY));
            let mousePositionOnWorld: f.Vector3 = ray.intersectPlane(new f.Vector3(0, 0, 0), new f.Vector3(0, 0, 1)); // check
            let moveVector: f.Vector3 = f.Vector3.DIFFERENCE(mousePositionOnWorld, controlledObject.mtxLocal.translation);
            controlledObject.getComponent(f.ComponentRigidbody).translateBody(moveVector);
        }
    }


    async function setup(): Promise<void> {
        console.log("setting up...");
        await FudgeCore.Project.loadResourcesFromHTML();
        let graph: any = f.Project.resources[graphId];

        // setup the viewport
        cmpCamera = new FudgeCore.ComponentCamera();
        cmpCamera.mtxPivot.rotateY(180);
        cmpCamera.mtxPivot.translateZ(currentZoomLevel);


        let canvas = document.querySelector("canvas");
        graph.addComponent(cmpCamera);
        let viewport = new FudgeCore.Viewport();
        viewport.initialize("Viewport", graph, cmpCamera, canvas);
        FudgeCore.Debug.log("Viewport:", viewport);
        // hide the cursor when interacting, also suppressing right-click menu
        //canvas.addEventListener("mousedown", canvas.requestPointerLock);
        //canvas.addEventListener("mouseup", function () { document.exitPointerLock(); });
        // make the camera interactive (complex method in FudgeAid)
        //FudgeAid.Viewport.expandCameraToInteractiveOrbit(viewport);

        // setup audio

        let cmpListener = new f.ComponentAudioListener();
        cmpCamera.node.addComponent(cmpListener);
        FudgeCore.AudioManager.default.listenWith(cmpListener);
        FudgeCore.AudioManager.default.listenTo(graph);
        FudgeCore.Debug.log("Audio:", FudgeCore.AudioManager.default);


        // draw viewport once for immediate feedback

        viewport.draw();
        canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", {bubbles: true, detail: viewport}));
    }

    function spawnPlayer(): void {
        player = new Player("name", 0, 360);
        graph.getChildrenByName("Level")[0].getChildrenByName("Characters")[0].getChildrenByName("Player")[0].addChild(player);
    }
}