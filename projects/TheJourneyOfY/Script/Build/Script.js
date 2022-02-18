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
            let stats = await this.loadJson(apiUrl + "?mode=get");
            let playerStats = [];
            for (let i = 0; i < stats.length; i++) {
                playerStats[i] = stats[i];
            }
            return playerStats;
        }
    }
    TheJourneyOfY.DataHandler = DataHandler;
})(TheJourneyOfY || (TheJourneyOfY = {}));
var TheJourneyOfY;
(function (TheJourneyOfY) {
    var f = FudgeCore;
    f.Debug.info("Main Program Template running!");
    window.addEventListener("load", setup);
    document.addEventListener("interactiveViewportStarted", start);
    TheJourneyOfY.activatePhysics = true;
    let canvas;
    let desiredZoomLevel = -70;
    let currentZoomLevel = -80;
    let graphId = "Graph|2022-01-08T12:51:22.101Z|15244";
    let groundObjects;
    let lethalObjects;
    let goal;
    let cmpCamera;
    let cameraNode;
    let apiURL;
    let dataHandler;
    let mouseObserver;
    let playerstats;
    async function start(_event) {
        console.log("setting up...");
        await FudgeCore.Project.loadResourcesFromHTML();
        TheJourneyOfY.graph = f.Project.resources[graphId];
        // setup the viewport
        cmpCamera = new FudgeCore.ComponentCamera();
        cmpCamera.mtxPivot.rotateY(180);
        cmpCamera.mtxPivot.translateZ(-30);
        TheJourneyOfY.viewport = new f.Viewport();
        TheJourneyOfY.player = new TheJourneyOfY.Player();
        TheJourneyOfY.viewport.initialize("Viewport", TheJourneyOfY.graph, cmpCamera, canvas);
        TheJourneyOfY.viewport.getBranch().getChildrenByName("Level")[0].getChildrenByName("Characters")[0].getChildrenByName("Player")[0].addChild(TheJourneyOfY.player);
        FudgeCore.Debug.log("Viewport:", TheJourneyOfY.viewport);
        // setup audio
        let cmpListener = new f.ComponentAudioListener();
        cameraNode = new f.Node("cameraNode");
        cameraNode.addComponent(cmpCamera);
        cameraNode.addComponent(new f.ComponentTransform);
        cameraNode.addComponent(new TheJourneyOfY.CameraMovementScript());
        TheJourneyOfY.graph.addChild(cameraNode);
        FudgeCore.AudioManager.default.listenWith(cmpListener);
        FudgeCore.AudioManager.default.listenTo(TheJourneyOfY.graph);
        FudgeCore.Debug.log("Audio:", FudgeCore.AudioManager.default);
        // draw viewport once for immediate feedback
        TheJourneyOfY.viewport.draw();
        TheJourneyOfY.body = document.getElementsByTagName('body')[0];
        TheJourneyOfY.controllableObjects = TheJourneyOfY.graph.getChildrenByName("Level")[0]
            .getChildrenByName("Surroundings")[0]
            .getChildrenByName("Foreground")[0]
            .getChildrenByName("Movables")[0]
            .getChildrenByName("Controllables")[0];
        groundObjects = TheJourneyOfY.graph.getChildrenByName("Level")[0]
            .getChildrenByName("Surroundings")[0]
            .getChildrenByName("Foreground")[0]
            .getChildrenByName("Non-Movables")[0]
            .getChildrenByName("Ground")[0];
        lethalObjects = TheJourneyOfY.graph.getChildrenByName("Level")[0]
            .getChildrenByName("Surroundings")[0]
            .getChildrenByName("Foreground")[0]
            .getChildrenByName("Non-Movables")[0]
            .getChildrenByName("LethalObjects")[0];
        TheJourneyOfY.swoshSound = TheJourneyOfY.graph.getChildrenByName("Level")[0]
            .getChildrenByName("Sounds")[0]
            .getChildrenByName("swosh")[0];
        goal = TheJourneyOfY.graph.getChildrenByName("Level")[0]
            .getChildrenByName("Surroundings")[0]
            .getChildrenByName("Foreground")[0]
            .getChildrenByName("Non-Movables")[0]
            .getChildrenByName("Goal")[0];
        goal.addComponent(new TheJourneyOfY.GoalScript());
        f.Debug.info("Number of controllable Objects: " + TheJourneyOfY.controllableObjects.getChildren().length);
        TheJourneyOfY.graph.addEventListener('GameOverEvent', ((event) => {
            onGameOverHandler(event);
        }));
        mouseObserver = new TheJourneyOfY.MouseObserver();
        TheJourneyOfY.viewport.getCanvas().addEventListener("mousemove", mouseObserver.mouseHoverHandler);
        TheJourneyOfY.viewport.getCanvas().addEventListener("mousedown", mouseObserver.mouseDownHandler);
        TheJourneyOfY.viewport.getCanvas().addEventListener("mousemove", mouseObserver.mouseMoveHandler);
        TheJourneyOfY.viewport.getCanvas().addEventListener("mouseup", mouseObserver.mouseUpHandler);
        TheJourneyOfY.viewport.getCanvas().addEventListener("wheel", mouseObserver.scrollHandler);
        TheJourneyOfY.viewport.physicsDebugMode = f.PHYSICS_DEBUGMODE.COLLIDERS;
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        initializeCollisionGroups();
        f.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        if (TheJourneyOfY.activatePhysics && currentZoomLevel == desiredZoomLevel) {
            f.Physics.world.simulate(); // if physics is included and used
        }
        TheJourneyOfY.viewport.draw();
        //zoom in
        if (currentZoomLevel < desiredZoomLevel) {
            currentZoomLevel++;
            cmpCamera.mtxPivot.translateZ(1);
        }
        f.AudioManager.default.update();
    }
    function onGameOverHandler(_event) {
        if (_event.gameWon) {
            f.Debug.info("YOU WON!!!!");
        }
        else {
            f.Debug.info("YOU LOST!");
        }
        f.Loop.stop();
    }
    async function setup() {
        canvas = document.querySelector("canvas");
        canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: TheJourneyOfY.viewport }));
        dataHandler = new TheJourneyOfY.DataHandler();
        let config = await dataHandler.loadJson("https://aljoshavieth.github.io/Prima/projects/TheJourneyOfY/config.json");
        apiURL = config.apiURL;
        f.Debug.info("apiURL: " + apiURL);
        playerstats = await dataHandler.parseStats(apiURL);
        //TODO move to end
        playerstats.forEach(function (playerStat) {
            f.Debug.info(playerStat.name + ": " + playerStat.score);
        });
    }
    function initializeCollisionGroups() {
        // ground
        groundObjects.getChildren().forEach(function (groundObject) {
            groundObject.getComponent(f.ComponentRigidbody).collisionGroup = f.COLLISION_GROUP.GROUP_2;
        });
        lethalObjects.getChildren().forEach(function (lethalObject) {
            lethalObject.getComponent(f.ComponentRigidbody).collisionGroup = f.COLLISION_GROUP.GROUP_4;
        });
        TheJourneyOfY.controllableObjects.getChildren().forEach(function (controllableObject) {
            controllableObject.getComponent(f.ComponentRigidbody).collisionGroup = f.COLLISION_GROUP.GROUP_3;
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
            this.rigidbody.applyForce(f.Vector3.SCALE(this.mtxLocal.getX(), this.ctrForward.getOutput()));
            this.isOnGround = false;
            let playerCollisions = this.rigidbody.collisions;
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
                f.Debug.info("Lets goooooo");
                this.rigidbody.applyForce(new f.Vector3(0, 30, 0));
            }
        }
    }
    TheJourneyOfY.Player = Player;
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
            hoveringAnimSeq.addKey(new f.AnimationKey(0, -1));
            hoveringAnimSeq.addKey(new f.AnimationKey(3000, 1));
            hoveringAnimSeq.addKey(new f.AnimationKey(6000, -1));
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
    var f = FudgeCore;
    var Vector3 = FudgeCore.Vector3;
    TheJourneyOfY.objectSelected = false;
    TheJourneyOfY.hoveringOverControllableObject = false;
    class MouseObserver {
        mouseHoverHandler(_event) {
            let ray = TheJourneyOfY.viewport.getRayFromClient(new f.Vector2(_event.clientX, _event.clientY));
            if (!TheJourneyOfY.objectSelected) {
                //f.Debug.info("No object selected");
                for (let controllableObject of TheJourneyOfY.controllableObjects.getIterator()) {
                    if (controllableObject.name == "Controllables") {
                        continue; //ignoring parent object since it cannot be moved and causes problems otherwise
                    }
                    let componentMesh = controllableObject.getComponent(f.ComponentMesh);
                    let position = componentMesh ? componentMesh.mtxWorld.translation : controllableObject.mtxWorld.translation;
                    if (ray.getDistance(position).magnitude < controllableObject.radius) {
                        f.Debug.info("hovering over controllable object named: " + controllableObject.name);
                        TheJourneyOfY.hoveringOverControllableObject = true;
                        TheJourneyOfY.hoveredObject = controllableObject;
                        break; //ignoring other controllable objects. There can only be one.
                    }
                    else {
                        TheJourneyOfY.hoveringOverControllableObject = false;
                    }
                }
            }
            else {
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
        mouseDownHandler(_event) {
            if (TheJourneyOfY.hoveringOverControllableObject) {
                TheJourneyOfY.swoshSound.getComponents(f.ComponentAudio)[0].play(true);
                TheJourneyOfY.activatePhysics = false;
                TheJourneyOfY.body.classList.add("grayscale"); //add the class
                TheJourneyOfY.objectSelected = true;
                TheJourneyOfY.controlledObject = TheJourneyOfY.hoveredObject;
                /*
                // not needed anymore cause physics gets disabled completely
                controlledObject.getComponent(f.ComponentRigidbody).effectGravity = 0;
                //stopping rotation
                controlledObject.getComponent(f.ComponentRigidbody).effectRotation = new f.Vector3(0, 0, 0);
                 */
            }
        }
        mouseUpHandler(_event) {
            if (TheJourneyOfY.objectSelected) {
                releaseObject();
            }
        }
        mouseMoveHandler(_event) {
            if (TheJourneyOfY.objectSelected) {
                let ray = TheJourneyOfY.viewport.getRayFromClient(new f.Vector2(_event.clientX, _event.clientY));
                let mousePositionOnWorld = ray.intersectPlane(new f.Vector3(0, 0, 0), new f.Vector3(0, 0, 1)); // check
                let moveVector = f.Vector3.DIFFERENCE(mousePositionOnWorld, TheJourneyOfY.controlledObject.mtxLocal.translation);
                TheJourneyOfY.controlledObject.getComponent(f.ComponentRigidbody).translateBody(moveVector);
            }
        }
        scrollHandler(_event) {
            if (TheJourneyOfY.objectSelected) {
                TheJourneyOfY.controlledObject.getComponent(f.ComponentRigidbody).rotateBody(new Vector3(0, 0, _event.deltaY));
            }
        }
    }
    TheJourneyOfY.MouseObserver = MouseObserver;
    function releaseObject() {
        TheJourneyOfY.activatePhysics = true;
        TheJourneyOfY.body.classList.remove("grayscale"); //remove the class
        TheJourneyOfY.controlledObject.getComponent(f.ComponentRigidbody).effectGravity = 1;
        TheJourneyOfY.controlledObject.getComponent(f.ComponentRigidbody).effectRotation = new f.Vector3(0, 0, 1);
        //controlledObject.getComponent(f.ComponentRigidbody).translateBody(currentPosition);
        TheJourneyOfY.objectSelected = false;
        TheJourneyOfY.hoveredObject = null;
        TheJourneyOfY.controlledObject = null;
    }
})(TheJourneyOfY || (TheJourneyOfY = {}));
//# sourceMappingURL=Script.js.map