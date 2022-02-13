namespace TheYourneyOfY {
    import f = FudgeCore;
    import Vector3 = FudgeCore.Vector3;
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
    let borderObjects: f.Node;
    let hoveredObject: f.Node = null;
    let controlledObject: f.Node = null;
    let swoshSound: f.Node;


    let activatePhysics: boolean = true;
    let body :HTMLBodyElement;



    function start(_event: CustomEvent): void {
        body = document.getElementsByTagName('body')[0];

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

        borderObjects = graph.getChildrenByName("Level")[0]
            .getChildrenByName("Surroundings")[0]
            .getChildrenByName("Foreground")[0]
            .getChildrenByName("Non-Movables")[0]
            .getChildrenByName("MovementBorder")[0];
        swoshSound =  graph.getChildrenByName("Level")[0]
            .getChildrenByName("Sounds")[0]
            .getChildrenByName("swosh")[0];

        f.Debug.info("Number of controllable Objects: " + controllableObjects.getChildren().length);


        //graph.getComponents(ƒ.ComponentAudio)[1].play(true);
        spawnPlayer();

        viewport.getCanvas().addEventListener("mousemove", mouseHoverHandler);
        viewport.getCanvas().addEventListener("mousedown", mouseDownHandler);
        viewport.getCanvas().addEventListener("mousemove", mouseMoveHandler);
        viewport.getCanvas().addEventListener("mouseup", mouseUpHandler);
        viewport.getCanvas().addEventListener("wheel", scrollHandler);


        f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update);
        f.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }

    function update(_event: Event): void {
        if (activatePhysics) {
            f.Physics.world.simulate();  // if physics is included and used
        }
        viewport.draw();

        //zoom in
        // f.Debug.info("update loop");
        if (currentZoomLevel < desiredZoomLevel) {
            currentZoomLevel++;
            cmpCamera.mtxPivot.translateZ(1);
        }

        f.AudioManager.default.update();
    }

    function mouseHoverHandler(_event: MouseEvent): void {
        let ray: f.Ray = viewport.getRayFromClient(new f.Vector2(_event.clientX, _event.clientY));
        if (!objectSelected) {
            f.Debug.info("No object selected");
            for (let controllableObject of controllableObjects.getIterator()) {
                if (controllableObject.name == "Controllables") {
                    continue; //ignoring parent object since it cannot be moved and causes problems otherwise
                }
                let componentMesh: f.ComponentMesh = controllableObject.getComponent(f.ComponentMesh);
                let position: f.Vector3 = componentMesh ? componentMesh.mtxWorld.translation : controllableObject.mtxWorld.translation;
                if (ray.getDistance(position).magnitude < controllableObject.radius) {
                    f.Debug.info("hovering over controllable object named: " + controllableObject.name);
                    hoveringOverControllableObject = true;
                    hoveredObject = controllableObject;
                    break; //ignoring other controllable objects. There can only be one.
                } else {
                    hoveringOverControllableObject = false;
                }
            }
        } else {
            /*
            for (let borderObject of borderObjects.getIterator()) {
                if (borderObject.name == "MovementBorder") {
                    continue; //ignoring parent object since it is not relevant and causes problems otherwise
                }
                let componentMesh: f.ComponentMesh = borderObject.getComponent(f.ComponentMesh);
                let position: f.Vector3 = componentMesh ? componentMesh.mtxWorld.translation : borderObject.mtxWorld.translation;
                if (ray.getDistance(position).magnitude < borderObject.radius) {
                    f.Debug.info("Hovering over " + borderObject.name + "! releasing object...");
                    releaseObject();
                    break; //ignoring other controllable objects. There can only be one.
                }
            }

             */
        }

    }

    function mouseDownHandler(_event: MouseEvent): void {
        if (hoveringOverControllableObject) {
            swoshSound.getComponents(f.ComponentAudio)[0].play(true);

            activatePhysics = false;
            body.classList.add("grayscale");   //add the class
            objectSelected = true;
            controlledObject = hoveredObject;

            /*
            // not needed anymore cause physics gets disabled completely
            controlledObject.getComponent(f.ComponentRigidbody).effectGravity = 0;
            //stopping rotation
            controlledObject.getComponent(f.ComponentRigidbody).effectRotation = new f.Vector3(0, 0, 0);
             */
        }
    }

    function mouseUpHandler(_event: MouseEvent): void {
        if (objectSelected) {
            releaseObject();
        }
    }

    function mouseMoveHandler(_event: MouseEvent): void {
        if (objectSelected) {
            let ray: f.Ray = viewport.getRayFromClient(new f.Vector2(_event.clientX, _event.clientY));
            let mousePositionOnWorld: f.Vector3 = ray.intersectPlane(new f.Vector3(0, 0, 0), new f.Vector3(0, 0, 1)); // check
            let moveVector: f.Vector3 = f.Vector3.DIFFERENCE(mousePositionOnWorld, controlledObject.mtxLocal.translation);
            controlledObject.getComponent(f.ComponentRigidbody).translateBody(moveVector);
        }
    }

    function scrollHandler(_event: WheelEvent): void {
        if (objectSelected) {
            controlledObject.getComponent(f.ComponentRigidbody).rotateBody(new Vector3(0, 0, _event.deltaY));
        }
    }

    function releaseObject() {
        activatePhysics = true;
        body.classList.remove("grayscale");   //remove the class
        controlledObject.getComponent(f.ComponentRigidbody).effectGravity = 1;
        controlledObject.getComponent(f.ComponentRigidbody).effectRotation = new f.Vector3(0, 0, 1);
        //controlledObject.getComponent(f.ComponentRigidbody).translateBody(currentPosition);
        objectSelected = false;
        hoveredObject = null;
        controlledObject = null;
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
        player = new Player();
        graph.getChildrenByName("Level")[0].getChildrenByName("Characters")[0].getChildrenByName("Player")[0].addChild(player);
    }
}