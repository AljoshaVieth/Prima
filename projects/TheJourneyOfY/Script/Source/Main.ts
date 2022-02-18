namespace TheJourneyOfY {
    // import * as configJson from "../../config.json"; // This import style requires "esModuleInterop" (tsconfig: "resolveJsonModule": true, "esModuleInterop": true) TypeScript 2.9+
    import f = FudgeCore;
    import Vector3 = FudgeCore.Vector3;
    import Node = FudgeCore.Node;

    f.Debug.info("Main Program Template runningxxx!");

    window.addEventListener("load", setup);
    let viewport: f.Viewport;
    document.addEventListener("interactiveViewportStarted", <EventListener><unknown>start);
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
    let goal: f.Node;
    let cmpCamera: f.ComponentCamera;
    let cameraNode: f.Node;
    let apiURL: string;
    let dataHandler: DataHandler;
    let playerstats: PlayerStat[];
    let gameStarted: boolean;
    let startTime: number;
    let timePassed: number;

    let swoshSound: f.Node;
    export let jumpSound: f.Node;
    let victorySound: f.Node;
    let defeatSound: f.Node;
    let music: f.Node;


    let activatePhysics: boolean = true;
    let body: HTMLBodyElement;
    let reloadButton: HTMLElement;
    let gameOverScreen: HTMLElement;
    let scoreTable: HTMLTableElement;
    let yourScoreText: HTMLElement;
    let submitScoreScreen: HTMLElement;
    let submitScoreButton: HTMLElement;
    let gameOverText: HTMLElement;
    let playerName: HTMLInputElement;

    let playMusic: boolean = true;


    async function start(_event: CustomEvent): Promise<void> {
        startTime = new Date().getTime();
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
        //let goal: GoalObject = new GoalObject();
        f.Debug.info("Spawned Player");


        viewport.initialize("Viewport", graph, cmpCamera, canvas);
        viewport.getBranch().getChildrenByName("Level")[0].getChildrenByName("Characters")[0].getChildrenByName("Player")[0].addChild(player);
        //viewport.getBranch().getChildrenByName("Level")[0].getChildrenByName("Characters")[0].getChildrenByName("Player")[0].addChild(goal);
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
        gameOverScreen = document.getElementById('GameOver');
        reloadButton = document.getElementById("reload");
        submitScoreButton = document.getElementById("submitscoreButton");
        yourScoreText = document.getElementById("yourscore");
        submitScoreScreen = document.getElementById("SubmitScore");
        gameOverText = document.getElementById("GameOverText");
        playerName = <HTMLInputElement>document.getElementById("playername");


        reloadButton.addEventListener("click", function () {
            window.location.reload();
        });

        submitScoreButton.addEventListener("click", function () {
            dataHandler.submitScore(apiURL, timePassed, playerName.value);
        });
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

        jumpSound = graph.getChildrenByName("Level")[0]
            .getChildrenByName("Sounds")[0]
            .getChildrenByName("jump")[0];

        victorySound = graph.getChildrenByName("Level")[0]
            .getChildrenByName("Sounds")[0]
            .getChildrenByName("victory")[0];

        defeatSound = graph.getChildrenByName("Level")[0]
            .getChildrenByName("Sounds")[0]
            .getChildrenByName("defeat")[0];

        music = graph.getChildrenByName("Level")[0]
            .getChildrenByName("Sounds")[0]
            .getChildrenByName("music")[0];


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
        music.getComponents(f.ComponentAudio)[0].play(true);
        gameStarted = true;
        f.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }

    function update(_event: Event): void {
        if (gameStarted) {
            if (activatePhysics && currentZoomLevel == desiredZoomLevel) {
                f.Physics.world.simulate();  // if physics is included and used
            }
            viewport.draw();
            //zoom in
            if (currentZoomLevel < desiredZoomLevel) {
                currentZoomLevel++;
                cmpCamera.mtxPivot.translateZ(1);
            }
            timePassed = (new Date().getTime() - startTime) / 1000;
            GameState.get().time = timePassed;
            f.AudioManager.default.update();
        }

    }


    function onGameOverHandler(_event: GameOverEvent): void {
        if (gameStarted) {
            if (_event.gameWon) {
                victorySound.getComponents(f.ComponentAudio)[0].play(true);
                submitScoreScreen.style.visibility = "visible";
                yourScoreText.style.visibility = "visible";
                gameOverText.textContent = "WELL DONE"
            } else {
                defeatSound.getComponents(f.ComponentAudio)[0].play(true);
            }
            stopGame();
        }
    }

    function stopGame() {
        if (playMusic) {
            music.getComponents(f.ComponentAudio)[0].play(false);
        }
        swoshSound.getComponents(f.ComponentAudio)[0].play(false);
        jumpSound.getComponents(f.ComponentAudio)[0].play(false);
        gameOverScreen.style.visibility = "visible";
        yourScoreText.textContent = "Your time: " + timePassed;

        f.Debug.info("stopped");
        gameStarted = false;
        f.Loop.stop();
        f.Loop.removeEventListener(f.EVENT.LOOP_FRAME, update);
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
        }

    }

    function mouseDownHandler(_event: MouseEvent): void {
        if (hoveringOverControllableObject) {
            swoshSound.getComponents(f.ComponentAudio)[0].play(true);

            activatePhysics = false;
            body.classList.add("grayscale");   //add the class
            objectSelected = true;
            controlledObject = hoveredObject;
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

    export function populateScoreTable(_playerStats: PlayerStat[]): void {
        scoreTable = <HTMLTableElement>document.getElementById("scoretable");
        _playerStats.forEach(function (playerStat) {
            let row: HTMLTableRowElement = scoreTable.insertRow();
            let formattedScore = [playerStat.score.toString().slice(0, 2), ",", playerStat.score.toString().slice(2)].join('');

            row.textContent = playerStat.name + ": " + formattedScore;
        })
    }

    async function setup(): Promise<void> {
        canvas = document.querySelector("canvas");
        canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", {bubbles: true, detail: viewport}));

        dataHandler = new DataHandler();
        let config = await dataHandler.loadJson("https://aljoshavieth.github.io/Prima/projects/TheJourneyOfY/config.json");
        apiURL = config.apiURL;
        if (config.music == "true") {
            playMusic = true;
        } else {
            playMusic = false;
        }
        f.Debug.info("playmusic: " + playMusic);
        f.Debug.info("apiURL: " + apiURL);

        playerstats = await dataHandler.parseStats(apiURL);

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