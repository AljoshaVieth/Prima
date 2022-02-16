namespace TheJourneyOfY {
    // import * as configJson from "../../config.json"; // This import style requires "esModuleInterop" (tsconfig: "resolveJsonModule": true, "esModuleInterop": true) TypeScript 2.9+
    import f = FudgeCore;
    import Vector3 = FudgeCore.Vector3;
    import Node = FudgeCore.Node;


    f.Debug.info("Main Program Template running!");

    window.addEventListener("load", setup);
    let viewport: f.Viewport;
    document.addEventListener("interactiveViewportStarted", <EventListener>start);
    let canvas: HTMLCanvasElement;
    let graph: f.Node;
    let desiredZoomLevel: number = -70;
    let currentZoomLevel: number = -80;
    let graphId: string = "Graph|2022-01-08T12:51:22.101Z|15244";
    let objectSelected: boolean = false;
    let hoveringOverControllableObject: boolean = false;
    export let player: Player;
    let controllableObjects: f.Node;
    let groundObjects: f.Node;
    let lethalObjects: f.Node;
    let hoveredObject: f.Node;
    let controlledObject: f.Node;
    let swoshSound: f.Node;
    let cmpCamera: f.ComponentCamera;
    let cameraNode: f.Node;
    let apiURL: string;
    let dataHandler: DataHandler;
    let playerstats: PlayerStat[];

    let activatePhysics: boolean = true;
    let body: HTMLBodyElement;


    async function start(_event: CustomEvent): Promise<void> {
        console.log("setting up...");
        await FudgeCore.Project.loadResourcesFromHTML();
        graph = <f.Graph>f.Project.resources[graphId];

        // setup the viewport
        cmpCamera = new FudgeCore.ComponentCamera();
        cmpCamera.mtxPivot.rotateY(180);
        cmpCamera.mtxPivot.translateZ(-30);
        //graph.addComponent(cmpCamera);
        viewport = new f.Viewport();
        player = new Player();
        f.Debug.info("Spawned Player");


        viewport.initialize("Viewport", graph, cmpCamera, canvas);
        viewport.getBranch().getChildrenByName("Level")[0].getChildrenByName("Characters")[0].getChildrenByName("Player")[0].addChild(player);
        FudgeCore.Debug.log("Viewport:", viewport);

        // setup audio
        let cmpListener = new f.ComponentAudioListener();
        //cmpCamera.node.addComponent(cmpListener);
        //cmpCamera.node.addComponent(new CameraScript());
        cameraNode = new f.Node("cameraNode");
        cameraNode.addComponent(cmpCamera);
        cameraNode.addComponent(new f.ComponentTransform);
        cameraNode.addComponent(new CameraMovementScript());
        //cameraNode.addComponent(cmpListener);
        graph.addChild(cameraNode);
        FudgeCore.AudioManager.default.listenWith(cmpListener);
        FudgeCore.AudioManager.default.listenTo(graph);
        FudgeCore.Debug.log("Audio:", FudgeCore.AudioManager.default);


        // draw viewport once for immediate feedback

        //viewport.draw();

        body = document.getElementsByTagName('body')[0];

        console.log("Starting...");
        //viewport = _event.detail;

        //graph = viewport.getBranch();
        console.log(viewport);
        console.log(graph);


        controllableObjects = graph.getChildrenByName("Level")[0]
            .getChildrenByName("Surroundings")[0]
            .getChildrenByName("Foreground")[0]
            .getChildrenByName("Movables")[0]
            .getChildrenByName("Controllables")[0];

        groundObjects = graph.getChildrenByName("Level")[0]
            .getChildrenByName("Surroundings")[0]
            .getChildrenByName("Foreground")[0]
            .getChildrenByName("Non-Movables")[0]
            .getChildrenByName("Ground")[0];

        lethalObjects = graph.getChildrenByName("Level")[0]
            .getChildrenByName("Surroundings")[0]
            .getChildrenByName("Foreground")[0]
            .getChildrenByName("Non-Movables")[0]
            .getChildrenByName("LethalObjects")[0];


        swoshSound = graph.getChildrenByName("Level")[0]
            .getChildrenByName("Sounds")[0]
            .getChildrenByName("swosh")[0];

        f.Debug.info("Number of controllable Objects: " + controllableObjects.getChildren().length);

        graph.addEventListener("PlayerDeathEvent", onPlayerDeath);

        //graph.getComponents(ƒ.ComponentAudio)[1].play(true);
        // spawnPlayer();

        viewport.getCanvas().addEventListener("mousemove", mouseHoverHandler);
        viewport.getCanvas().addEventListener("mousedown", mouseDownHandler);
        viewport.getCanvas().addEventListener("mousemove", mouseMoveHandler);
        viewport.getCanvas().addEventListener("mouseup", mouseUpHandler);
        viewport.getCanvas().addEventListener("wheel", scrollHandler);


        viewport.physicsDebugMode = f.PHYSICS_DEBUGMODE.COLLIDERS;

        f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update);
        initializeCollisionGroups();
        f.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }

    function update(_event: Event): void {
        if (activatePhysics && currentZoomLevel == desiredZoomLevel) {
            f.Physics.world.simulate();  // if physics is included and used
        }
        viewport.draw();

        //zoom in
        if (currentZoomLevel < desiredZoomLevel) {
            currentZoomLevel++;
            cmpCamera.mtxPivot.translateZ(1);
        }

        f.AudioManager.default.update();
    }

    function onPlayerDeath(_event: Event): void{
        f.Debug.info("!YOU ARE DEAD");
        f.Loop.stop();
    }

    function mouseHoverHandler(_event: MouseEvent): void {
        let ray: f.Ray = viewport.getRayFromClient(new f.Vector2(_event.clientX, _event.clientY));
        if (!objectSelected) {
            //f.Debug.info("No object selected");
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
        canvas = document.querySelector("canvas");
        canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", {bubbles: true, detail: viewport}));

        dataHandler = new DataHandler();
        let config = await dataHandler.loadJson("https://aljoshavieth.github.io/Prima/projects/TheJourneyOfY/config.json");
        apiURL = config.apiURL;
        f.Debug.info("apiURL: " + apiURL);

        playerstats = await dataHandler.parseStats(apiURL);

        //TODO move to end
        playerstats.forEach(function (playerStat){
            f.Debug.info(playerStat.name  + ": " + playerStat.score);
        })
    }

    function initializeCollisionGroups() {
        // ground
        groundObjects.getChildren().forEach(function (groundObject: Node) {
            groundObject.getComponent(f.ComponentRigidbody).collisionGroup = f.COLLISION_GROUP.GROUP_2;
        });

        lethalObjects.getChildren().forEach(function (lethalObject: Node) {
            lethalObject.getComponent(f.ComponentRigidbody).collisionGroup = f.COLLISION_GROUP.GROUP_4;
        });

        controllableObjects.getChildren().forEach(function (controllableObject: Node) {
            controllableObject.getComponent(f.ComponentRigidbody).collisionGroup = f.COLLISION_GROUP.GROUP_3;
        });

        controllableObjects.getChildren().forEach(function (controllableObject: Node) {
            f.Debug.info("Collisiongroup: ");
            f.Debug.info(controllableObject.getComponent(f.ComponentRigidbody).collisionGroup);
        });

    }
}