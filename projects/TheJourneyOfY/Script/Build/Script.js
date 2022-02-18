"use strict";
var TheJourneyOfY;
(function (TheJourneyOfY) {
    var f = FudgeCore;
    var ComponentTransform = FudgeCore.ComponentTransform;
    f.Project.registerScriptNamespace(TheJourneyOfY); // Register the namespace to FUDGE for serialization
    class CameraMovementScript extends f.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = f.Component.registerSubclass(CameraMovementScript);
        // Properties may be mutated by users in the editor via the automatically created user interface
        message = "CameraMovementScript added to ";
        constructor() {
            super();
            // Don't start when running in editor
            if (f.Project.mode == f.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* COMPONENT_ADD */:
                    f.Debug.log(this.message, this.node);
                    this.start();
                    break;
                case "componentRemove" /* COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                    break;
            }
        };
        start() {
            f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
        }
        update = (_event) => {
            let moveVector = f.Vector3.DIFFERENCE(TheJourneyOfY.player.mtxLocal.translation, this.node.getComponent(ComponentTransform).mtxLocal.translation);
            moveVector.y = 0;
            this.node.getComponent(ComponentTransform).mtxLocal.translate(moveVector);
        };
    }
    TheJourneyOfY.CameraMovementScript = CameraMovementScript;
})(TheJourneyOfY || (TheJourneyOfY = {}));
var TheJourneyOfY;
(function (TheJourneyOfY) {
    class DataHandler {
        async loadJson(path) {
            try {
                const response = await fetch(path);
                return await response.json();
            }
            catch (error) {
                return error;
            }
        }
        async parseStats(apiUrl) {
            console.log("parsing stats");
            let stats = await this.loadJson(apiUrl + "?mode=get");
            let playerStats = [];
            for (let i = 0; i < stats.length; i++) {
                playerStats[i] = stats[i];
            }
            TheJourneyOfY.populateScoreTable(playerStats);
            return playerStats;
        }
        async submitScore(apiUrl, score, name) {
            console.log("Submitting score: name=" + name + " score=" + score + " url=" + apiUrl + "?mode=insert");
            let formData = new FormData();
            formData.append('name', name);
            formData.append('score', score.toString());
            await fetch(apiUrl + "?mode=insert", {
                method: 'POST',
                body: formData,
                headers: { 'Content-Type': 'application/form-data; charset=UTF-8' }
            });
        }
    }
    TheJourneyOfY.DataHandler = DataHandler;
})(TheJourneyOfY || (TheJourneyOfY = {}));
var TheJourneyOfY;
(function (TheJourneyOfY) {
    class GameOverEvent extends CustomEvent {
        _gameWon;
        constructor(gameWon) {
            super("GameOverEvent", { detail: gameWon, "bubbles": true, "cancelable": false });
            this._gameWon = gameWon;
        }
        get gameWon() {
            return this._gameWon;
        }
    }
    TheJourneyOfY.GameOverEvent = GameOverEvent;
})(TheJourneyOfY || (TheJourneyOfY = {}));
var TheJourneyOfY;
(function (TheJourneyOfY) {
    var f = FudgeCore;
    f.Project.registerScriptNamespace(TheJourneyOfY); // Register the namespace to FUDGE for serialization
    class GoalScript extends f.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = f.Component.registerSubclass(GoalScript);
        // Properties may be mutated by users in the editor via the automatically created user interface
        message = "GoalScript added to ";
        constructor() {
            super();
            // Don't start when running in editor
            if (f.Project.mode == f.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
            if (_event.type == "componentAdd" /* COMPONENT_ADD */) {
                f.Debug.log(this.message, this.node);
                this.start();
            }
        };
        start() {
            this.initAnim();
            f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
        }
        update = (_event) => {
            this.checkForPlayerPosition();
        };
        checkForPlayerPosition() {
            if (this.node.mtxLocal.translation.getDistance(TheJourneyOfY.player.mtxLocal.translation) < 0.5) { //Player wins
                const gameOverEvent = new TheJourneyOfY.GameOverEvent(true);
                this.node.dispatchEvent(gameOverEvent);
            }
        }
        initAnim() {
            let hoveringAnimSeq = new f.AnimationSequence();
            hoveringAnimSeq.addKey(new f.AnimationKey(0, 2));
            hoveringAnimSeq.addKey(new f.AnimationKey(3000, 4));
            hoveringAnimSeq.addKey(new f.AnimationKey(6000, 2));
            let rotatingAnimSeq = new f.AnimationSequence();
            rotatingAnimSeq.addKey(new f.AnimationKey(0, 0));
            rotatingAnimSeq.addKey(new f.AnimationKey(3000, 360));
            rotatingAnimSeq.addKey(new f.AnimationKey(6000, 0));
            let animStructure = {
                components: {
                    ComponentTransform: [
                        {
                            "f.ComponentTransform": {
                                mtxLocal: {
                                    rotation: {
                                        y: rotatingAnimSeq
                                    },
                                    translation: {
                                        y: hoveringAnimSeq
                                    }
                                }
                            }
                        }
                    ]
                }
            };
            let fps = 30;
            let animation = new f.Animation("GoalAnimation", animStructure, fps);
            let cmpAnimator = new f.ComponentAnimator(animation, f.ANIMATION_PLAYMODE.LOOP, f.ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS);
            cmpAnimator.scale = 1;
            if (this.node.getComponent(f.ComponentAnimator)) {
                this.node.removeComponent(this.node.getComponent(f.ComponentAnimator));
            }
            this.node.addComponent(cmpAnimator);
            cmpAnimator.activate(true);
        }
    }
    TheJourneyOfY.GoalScript = GoalScript;
})(TheJourneyOfY || (TheJourneyOfY = {}));
var TheJourneyOfY;
(function (TheJourneyOfY) {
    // import * as configJson from "../../config.json"; // This import style requires "esModuleInterop" (tsconfig: "resolveJsonModule": true, "esModuleInterop": true) TypeScript 2.9+
    var f = FudgeCore;
    var Vector3 = FudgeCore.Vector3;
    f.Debug.info("Main Program Template runningxxx!");
    window.addEventListener("load", setup);
    let viewport;
    document.addEventListener("interactiveViewportStarted", start);
    let canvas;
    let graph;
    let desiredZoomLevel = -70;
    let currentZoomLevel = -80;
    let graphId = "Graph|2022-01-08T12:51:22.101Z|15244";
    let objectSelected = false;
    let hoveringOverControllableObject = false;
    let controllableObjects;
    let groundObjects;
    let lethalObjects;
    let hoveredObject;
    let controlledObject;
    let goal;
    let cmpCamera;
    let cameraNode;
    let apiURL;
    let dataHandler;
    let playerstats;
    let gameStarted;
    let startTime;
    let timePassed;
    let swoshSound;
    let victorySound;
    let defeatSound;
    let music;
    let activatePhysics = true;
    let body;
    let reloadButton;
    let gameOverScreen;
    let scoreTable;
    let yourScoreText;
    let submitScoreScreen;
    let submitScoreButton;
    let gameOverText;
    let playerName;
    async function start(_event) {
        startTime = new Date().getTime();
        console.log("setting up...");
        await FudgeCore.Project.loadResourcesFromHTML();
        graph = f.Project.resources[graphId];
        // setup the viewport
        cmpCamera = new FudgeCore.ComponentCamera();
        cmpCamera.mtxPivot.rotateY(180);
        cmpCamera.mtxPivot.translateZ(-30);
        //graph.addComponent(cmpCamera);
        viewport = new f.Viewport();
        TheJourneyOfY.player = new TheJourneyOfY.Player();
        //let goal: GoalObject = new GoalObject();
        f.Debug.info("Spawned Player");
        viewport.initialize("Viewport", graph, cmpCamera, canvas);
        viewport.getBranch().getChildrenByName("Level")[0].getChildrenByName("Characters")[0].getChildrenByName("Player")[0].addChild(TheJourneyOfY.player);
        //viewport.getBranch().getChildrenByName("Level")[0].getChildrenByName("Characters")[0].getChildrenByName("Player")[0].addChild(goal);
        FudgeCore.Debug.log("Viewport:", viewport);
        // setup audio
        let cmpListener = new f.ComponentAudioListener();
        //cmpCamera.node.addComponent(cmpListener);
        //cmpCamera.node.addComponent(new CameraScript());
        cameraNode = new f.Node("cameraNode");
        cameraNode.addComponent(cmpCamera);
        cameraNode.addComponent(new f.ComponentTransform);
        cameraNode.addComponent(new TheJourneyOfY.CameraMovementScript());
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
        playerName = document.getElementById("playername");
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
        TheJourneyOfY.jumpSound = graph.getChildrenByName("Level")[0]
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
        goal.addComponent(new TheJourneyOfY.GoalScript());
        f.Debug.info("Number of controllable Objects: " + controllableObjects.getChildren().length);
        graph.addEventListener('GameOverEvent', ((event) => {
            onGameOverHandler(event);
        }));
        //graph.getComponents(ƒ.ComponentAudio)[1].play(true);
        // spawnPlayer();
        viewport.getCanvas().addEventListener("mousemove", mouseHoverHandler);
        viewport.getCanvas().addEventListener("mousedown", mouseDownHandler);
        viewport.getCanvas().addEventListener("mousemove", mouseMoveHandler);
        viewport.getCanvas().addEventListener("mouseup", mouseUpHandler);
        viewport.getCanvas().addEventListener("wheel", scrollHandler);
        viewport.physicsDebugMode = f.PHYSICS_DEBUGMODE.COLLIDERS;
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        initializeCollisionGroups();
        music.getComponents(f.ComponentAudio)[0].play(true);
        gameStarted = true;
        f.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        if (gameStarted) {
            if (activatePhysics && currentZoomLevel == desiredZoomLevel) {
                f.Physics.world.simulate(); // if physics is included and used
            }
            viewport.draw();
            //zoom in
            if (currentZoomLevel < desiredZoomLevel) {
                currentZoomLevel++;
                cmpCamera.mtxPivot.translateZ(1);
            }
            timePassed = (new Date().getTime() - startTime) / 1000;
            TheJourneyOfY.GameState.get().time = timePassed;
            f.AudioManager.default.update();
        }
    }
    function onGameOverHandler(_event) {
        if (gameStarted) {
            if (_event.gameWon) {
                victorySound.getComponents(f.ComponentAudio)[0].play(true);
                submitScoreScreen.style.visibility = "visible";
                yourScoreText.style.visibility = "visible";
                gameOverText.textContent = "WELL DONE";
            }
            else {
                defeatSound.getComponents(f.ComponentAudio)[0].play(true);
            }
            stopGame();
        }
    }
    function stopGame() {
        music.getComponents(f.ComponentAudio)[0].play(false);
        swoshSound.getComponents(f.ComponentAudio)[0].play(false);
        TheJourneyOfY.jumpSound.getComponents(f.ComponentAudio)[0].play(false);
        gameOverScreen.style.visibility = "visible";
        yourScoreText.textContent = "Your time: " + timePassed;
        f.Debug.info("stopped");
        gameStarted = false;
        f.Loop.stop();
        f.Loop.removeEventListener("loopFrame" /* LOOP_FRAME */, update);
    }
    function mouseHoverHandler(_event) {
        let ray = viewport.getRayFromClient(new f.Vector2(_event.clientX, _event.clientY));
        if (!objectSelected) {
            //f.Debug.info("No object selected");
            for (let controllableObject of controllableObjects.getIterator()) {
                if (controllableObject.name == "Controllables") {
                    continue; //ignoring parent object since it cannot be moved and causes problems otherwise
                }
                let componentMesh = controllableObject.getComponent(f.ComponentMesh);
                let position = componentMesh ? componentMesh.mtxWorld.translation : controllableObject.mtxWorld.translation;
                if (ray.getDistance(position).magnitude < controllableObject.radius) {
                    f.Debug.info("hovering over controllable object named: " + controllableObject.name);
                    hoveringOverControllableObject = true;
                    hoveredObject = controllableObject;
                    break; //ignoring other controllable objects. There can only be one.
                }
                else {
                    hoveringOverControllableObject = false;
                }
            }
        }
    }
    function mouseDownHandler(_event) {
        if (hoveringOverControllableObject) {
            swoshSound.getComponents(f.ComponentAudio)[0].play(true);
            activatePhysics = false;
            body.classList.add("grayscale"); //add the class
            objectSelected = true;
            controlledObject = hoveredObject;
        }
    }
    function mouseUpHandler(_event) {
        if (objectSelected) {
            releaseObject();
        }
    }
    function mouseMoveHandler(_event) {
        if (objectSelected) {
            let ray = viewport.getRayFromClient(new f.Vector2(_event.clientX, _event.clientY));
            let mousePositionOnWorld = ray.intersectPlane(new f.Vector3(0, 0, 0), new f.Vector3(0, 0, 1)); // check
            let moveVector = f.Vector3.DIFFERENCE(mousePositionOnWorld, controlledObject.mtxLocal.translation);
            controlledObject.getComponent(f.ComponentRigidbody).translateBody(moveVector);
        }
    }
    function scrollHandler(_event) {
        if (objectSelected) {
            controlledObject.getComponent(f.ComponentRigidbody).rotateBody(new Vector3(0, 0, _event.deltaY));
        }
    }
    function releaseObject() {
        activatePhysics = true;
        body.classList.remove("grayscale"); //remove the class
        controlledObject.getComponent(f.ComponentRigidbody).effectGravity = 1;
        controlledObject.getComponent(f.ComponentRigidbody).effectRotation = new f.Vector3(0, 0, 1);
        //controlledObject.getComponent(f.ComponentRigidbody).translateBody(currentPosition);
        objectSelected = false;
        hoveredObject = null;
        controlledObject = null;
    }
    function populateScoreTable(_playerStats) {
        scoreTable = document.getElementById("scoretable");
        _playerStats.forEach(function (playerStat) {
            let row = scoreTable.insertRow();
            row.textContent = playerStat.name + ": " + playerStat.score;
        });
    }
    TheJourneyOfY.populateScoreTable = populateScoreTable;
    async function setup() {
        canvas = document.querySelector("canvas");
        canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
        dataHandler = new TheJourneyOfY.DataHandler();
        let config = await dataHandler.loadJson("https://aljoshavieth.github.io/Prima/projects/TheJourneyOfY/config.json");
        apiURL = config.apiURL;
        f.Debug.info("apiURL: " + apiURL);
        playerstats = await dataHandler.parseStats(apiURL);
    }
    function initializeCollisionGroups() {
        // ground
        groundObjects.getChildren().forEach(function (groundObject) {
            groundObject.getComponent(f.ComponentRigidbody).collisionGroup = f.COLLISION_GROUP.GROUP_2;
        });
        lethalObjects.getChildren().forEach(function (lethalObject) {
            lethalObject.getComponent(f.ComponentRigidbody).collisionGroup = f.COLLISION_GROUP.GROUP_4;
        });
        controllableObjects.getChildren().forEach(function (controllableObject) {
            controllableObject.getComponent(f.ComponentRigidbody).collisionGroup = f.COLLISION_GROUP.GROUP_3;
        });
        controllableObjects.getChildren().forEach(function (controllableObject) {
            f.Debug.info("Collisiongroup: ");
            f.Debug.info(controllableObject.getComponent(f.ComponentRigidbody).collisionGroup);
        });
    }
})(TheJourneyOfY || (TheJourneyOfY = {}));
var TheJourneyOfY;
(function (TheJourneyOfY) {
    var f = FudgeCore;
    var ComponentMaterial = FudgeCore.ComponentMaterial;
    class Player extends f.Node {
        ctrForward;
        rigidbody;
        isOnGround;
        idealPosition;
        constructor() {
            super("Player");
            this.ctrForward = this.ctrForward = new f.Control("Forward", 5, 0 /* PROPORTIONAL */);
            this.ctrForward.setDelay(200);
            this.initiatePositionAndScale();
            f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
        }
        initiatePositionAndScale() {
            this.addComponent(new f.ComponentTransform);
            this.addComponent(new f.ComponentMesh(new f.MeshCube("Player")));
            //this.addComponent(new f.ComponentMaterial(
            //    new f.Material("materialPlayer", f.ShaderUniColor, new f.CoatColored(new f.Color(1, 0, 1, 1))))
            //);
            let textureImage = new f.TextureImage("Textures/playerlowpoly.png");
            let playerMaterial = new f.Material("PlayerMaterial", f.ShaderTexture, new f.CoatTextured(new f.Color(1, 1, 1), textureImage));
            this.addComponent(new ComponentMaterial(playerMaterial));
            this.rigidbody = new f.ComponentRigidbody();
            this.addComponent(this.rigidbody);
            this.rigidbody.initialization = f.BODY_INIT.TO_PIVOT; //TO_PIVOT
            this.rigidbody.effectGravity = 1;
            this.rigidbody.typeBody = f.BODY_TYPE.DYNAMIC;
            this.rigidbody.mass = 1;
            this.rigidbody.effectRotation = new f.Vector3(0, 0, 0);
            this.rigidbody.typeCollider = f.COLLIDER_TYPE.CUBE;
            this.rigidbody.collisionGroup = f.COLLISION_GROUP.GROUP_1;
            //set position
            this.mtxLocal.translateZ(0);
            this.mtxLocal.translateY(4);
            this.mtxLocal.translateX(0);
            //set scale
            this.mtxLocal.scale(f.Vector3.ONE(1));
        }
        update = (_event) => {
            this.handlePlayerMovement();
        };
        handlePlayerMovement() {
            // Forward
            let forward = f.Keyboard.mapToTrit([f.KEYBOARD_CODE.D, f.KEYBOARD_CODE.ARROW_RIGHT], [f.KEYBOARD_CODE.A, f.KEYBOARD_CODE.ARROW_LEFT]);
            this.ctrForward.setInput(forward);
            //aaaaaaaada f.Debug.info("speed " + this.ctrForward.getOutput());
            this.rigidbody.applyForce(f.Vector3.SCALE(this.mtxLocal.getX(), this.ctrForward.getOutput()));
            //console.log(this.ctrForward.getOutput());
            this.isOnGround = false;
            let playerCollisions = this.rigidbody.collisions;
            //f.Debug.info(playerCollisions.length);
            playerCollisions.forEach(collider => {
                //f.Debug.info("Collider: " + collider.node.name);
                switch (collider.collisionGroup) {
                    case f.COLLISION_GROUP.GROUP_2: //Ground elements
                        this.isOnGround = true;
                        break;
                    case f.COLLISION_GROUP.GROUP_3: //Obstacles
                        this.isOnGround = true;
                        break;
                    case f.COLLISION_GROUP.GROUP_4: //LethalObjects
                        const gameOverEvent = new TheJourneyOfY.GameOverEvent(false);
                        this.dispatchEvent(gameOverEvent);
                        break;
                    default:
                        break;
                }
            });
            /**
             * Sometimes the player leaves the z=0 position, even tough the z axis should be locked.
             * This sometimes causes problems with the jump, so the workaround is to make sure the player is
             * always on z=0 by constantly teleporting him if he is not.
             */
            if (this.rigidbody.getPosition().z != 0.00) {
                this.idealPosition = this.rigidbody.getPosition();
                this.idealPosition.z = 0;
                let moveVector = f.Vector3.DIFFERENCE(this.idealPosition, this.rigidbody.getPosition());
                this.rigidbody.translateBody(moveVector);
            }
            if (this.rigidbody.getVelocity().x >= 5) {
                this.rigidbody.setVelocity(new f.Vector3(5, this.rigidbody.getVelocity().y, this.rigidbody.getVelocity().z));
            }
            // Jump (using simple keyboard event instead of control since it´s easier in this case)
            if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.SPACE]) && this.isOnGround) {
                TheJourneyOfY.jumpSound.getComponents(f.ComponentAudio)[0].play(true);
                this.rigidbody.applyForce(new f.Vector3(0, 30, 0));
            }
        }
    }
    TheJourneyOfY.Player = Player;
})(TheJourneyOfY || (TheJourneyOfY = {}));
var TheJourneyOfY;
(function (TheJourneyOfY) {
    var f = FudgeCore;
    var fui = FudgeUserInterface;
    class GameState extends f.Mutable {
        static controller;
        static instance;
        time = 10;
        constructor() {
            super();
            let domHud = document.querySelector("#Hud");
            GameState.instance = this;
            GameState.controller = new fui.Controller(this, domHud);
            console.log("Hud-Controller", GameState.controller);
        }
        static get() {
            return GameState.instance || new GameState();
        }
        reduceMutator(_mutator) { }
    }
    TheJourneyOfY.GameState = GameState;
})(TheJourneyOfY || (TheJourneyOfY = {}));
//# sourceMappingURL=Script.js.map