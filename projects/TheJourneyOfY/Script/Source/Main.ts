namespace TheJourneyOfY {
    import f = FudgeCore;
    import Node = FudgeCore.Node;

    f.Debug.info("Main Program Template running!");

    window.addEventListener("load", setup);
    document.addEventListener("interactiveViewportStarted", <EventListener><unknown>start);

    export let body: HTMLBodyElement;
    export let viewport: f.Viewport;
    export let graph: f.Node;
    export let player: Player;
    export let controllableObjects: f.Node;
    export let swoshSound: f.Node;
    export let activatePhysics: boolean = true;
    let canvas: HTMLCanvasElement;
    let desiredZoomLevel: number = -70;
    let currentZoomLevel: number = -80;
    let graphId: string = "Graph|2022-01-08T12:51:22.101Z|15244";
    let groundObjects: f.Node;
    let lethalObjects: f.Node;
    let goal: f.Node;
    let cmpCamera: f.ComponentCamera;
    let cameraNode: f.Node;
    let apiURL: string;
    let dataHandler: DataHandler;
    let mouseObserver: MouseObserver;
    let playerstats: PlayerStat[];


    async function start(_event: CustomEvent): Promise<void> {
        console.log("setting up...");
        await FudgeCore.Project.loadResourcesFromHTML();
        graph = <f.Graph>f.Project.resources[graphId];


        // setup the viewport
        cmpCamera = new FudgeCore.ComponentCamera();
        cmpCamera.mtxPivot.rotateY(180);
        cmpCamera.mtxPivot.translateZ(-30);
        viewport = new f.Viewport();
        player = new Player();
        viewport.initialize("Viewport", graph, cmpCamera, canvas);
        viewport.getBranch().getChildrenByName("Level")[0].getChildrenByName("Characters")[0].getChildrenByName("Player")[0].addChild(player);
        FudgeCore.Debug.log("Viewport:", viewport);

        // setup audio
        let cmpListener = new f.ComponentAudioListener();
        cameraNode = new f.Node("cameraNode");
        cameraNode.addComponent(cmpCamera);
        cameraNode.addComponent(new f.ComponentTransform);
        cameraNode.addComponent(new CameraMovementScript());
        graph.addChild(cameraNode);
        FudgeCore.AudioManager.default.listenWith(cmpListener);
        FudgeCore.AudioManager.default.listenTo(graph);
        FudgeCore.Debug.log("Audio:", FudgeCore.AudioManager.default);


        // draw viewport once for immediate feedback
        viewport.draw();

        body = document.getElementsByTagName('body')[0];


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

        goal = graph.getChildrenByName("Level")[0]
            .getChildrenByName("Surroundings")[0]
            .getChildrenByName("Foreground")[0]
            .getChildrenByName("Non-Movables")[0]
            .getChildrenByName("Goal")[0];

        goal.addComponent(new GoalScript());

        f.Debug.info("Number of controllable Objects: " + controllableObjects.getChildren().length);

        graph.addEventListener('GameOverEvent', ((event: GameOverEvent) => {
            onGameOverHandler(event);
        }) as EventListener);


        mouseObserver = new MouseObserver();
        viewport.getCanvas().addEventListener("mousemove", mouseObserver.mouseHoverHandler);
        viewport.getCanvas().addEventListener("mousedown", mouseObserver.mouseDownHandler);
        viewport.getCanvas().addEventListener("mousemove", mouseObserver.mouseMoveHandler);
        viewport.getCanvas().addEventListener("mouseup", mouseObserver.mouseUpHandler);
        viewport.getCanvas().addEventListener("wheel", mouseObserver.scrollHandler);


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


    function onGameOverHandler(_event: GameOverEvent): void {
        if (_event.gameWon) {
            f.Debug.info("YOU WON!!!!")
        } else {
            f.Debug.info("YOU LOST!");
        }
        f.Loop.stop();
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
        playerstats.forEach(function (playerStat) {
            f.Debug.info(playerStat.name + ": " + playerStat.score);
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

    }


}