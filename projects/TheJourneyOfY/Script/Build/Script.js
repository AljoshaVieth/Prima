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
var TheYourneyOfY;
(function (TheYourneyOfY) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(TheYourneyOfY); // Register the namespace to FUDGE for serialization
    class CustomComponentScript extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(CustomComponentScript);
        // Properties may be mutated by users in the editor via the automatically created user interface
        message = "CustomComponentScript added to ";
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* NODE_DESERIALIZED */, this.hndEvent);
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* COMPONENT_ADD */:
                    ƒ.Debug.log(this.message, this.node);
                    break;
                case "componentRemove" /* COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                    break;
                case "nodeDeserialized" /* NODE_DESERIALIZED */:
                    // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                    break;
            }
        };
    }
    TheYourneyOfY.CustomComponentScript = CustomComponentScript;
})(TheYourneyOfY || (TheYourneyOfY = {}));
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
    // import * as configJson from "../../config.json"; // This import style requires "esModuleInterop" (tsconfig: "resolveJsonModule": true, "esModuleInterop": true) TypeScript 2.9+
    var f = FudgeCore;
    var Vector3 = FudgeCore.Vector3;
    f.Debug.info("Main Program Template running!");
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
    let swoshSound;
    let cmpCamera;
    let cameraNode;
    let apiURL;
    let dataHandler;
    let playerstats;
    let activatePhysics = true;
    let body;
    async function start(_event) {
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
        let goal = new TheJourneyOfY.GoalObject();
        f.Debug.info("Spawned Player");
        viewport.initialize("Viewport", graph, cmpCamera, canvas);
        viewport.getBranch().getChildrenByName("Level")[0].getChildrenByName("Characters")[0].getChildrenByName("Player")[0].addChild(TheJourneyOfY.player);
        viewport.getBranch().getChildrenByName("Level")[0].getChildrenByName("Characters")[0].getChildrenByName("Player")[0].addChild(goal);
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
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        initializeCollisionGroups();
        f.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        if (activatePhysics && currentZoomLevel == desiredZoomLevel) {
            f.Physics.world.simulate(); // if physics is included and used
        }
        viewport.draw();
        //zoom in
        if (currentZoomLevel < desiredZoomLevel) {
            currentZoomLevel++;
            cmpCamera.mtxPivot.translateZ(1);
        }
        f.AudioManager.default.update();
    }
    function onPlayerDeath(_event) {
        f.Debug.info("!YOU ARE DEAD");
        f.Loop.stop();
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
    function mouseDownHandler(_event) {
        if (hoveringOverControllableObject) {
            swoshSound.getComponents(f.ComponentAudio)[0].play(true);
            activatePhysics = false;
            body.classList.add("grayscale"); //add the class
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
    async function setup() {
        canvas = document.querySelector("canvas");
        canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
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
        name = "Agent Smith";
        ctrForward;
        rigidbody;
        isOnGround;
        idealPosition;
        xSpeed;
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
            f.Debug.info("speed " + this.ctrForward.getOutput());
            this.rigidbody.applyForce(f.Vector3.SCALE(this.mtxLocal.getX(), this.ctrForward.getOutput()));
            //console.log(this.ctrForward.getOutput());
            this.isOnGround = false;
            let playerCollisions = this.rigidbody.collisions;
            f.Debug.info(playerCollisions.length);
            playerCollisions.forEach(collider => {
                f.Debug.info("Collider: " + collider.node.name);
                switch (collider.collisionGroup) {
                    case f.COLLISION_GROUP.GROUP_2: //Ground elements
                        this.isOnGround = true;
                        break;
                    case f.COLLISION_GROUP.GROUP_3: //Obstacles
                        this.isOnGround = true;
                        break;
                    case f.COLLISION_GROUP.GROUP_4: //LethalObjects
                        //TODO die! create event
                        //alert("YOU ARE DEAD!");
                        const playerDeathEvent = new Event("PlayerDeathEvent", { "bubbles": true, "cancelable": false });
                        this.dispatchEvent(playerDeathEvent);
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
    var f = FudgeCore;
    var ComponentMaterial = FudgeCore.ComponentMaterial;
    class GoalObject extends f.Node {
        componentTransform;
        constructor() {
            super("GoalObject");
            this.initiatePositionAndScale();
            this.initAnim();
            f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
        }
        initiatePositionAndScale() {
            this.componentTransform = new f.ComponentTransform();
            this.addComponent(this.componentTransform);
            this.addComponent(new f.ComponentMesh(new f.MeshSphere("GoalObject")));
            let textureImage = new f.TextureImage("Textures/goallowpoly.png");
            let goalMaterial = new f.Material("GoalMaterial", f.ShaderTexture, new f.CoatTextured(new f.Color(1, 1, 1), textureImage));
            this.addComponent(new ComponentMaterial(goalMaterial));
            //set position
            this.mtxLocal.translateZ(0);
            this.mtxLocal.translateY(0);
            this.mtxLocal.translateX(5);
            //set scale
            this.mtxLocal.scale(f.Vector3.ONE(1));
        }
        update = (_event) => {
            this.checkForPlayerPosition();
        };
        checkForPlayerPosition() {
            if (this.mtxLocal.translation.getDistance(TheJourneyOfY.player.mtxLocal.translation) < 0.5) {
                f.Debug.info("GOAL");
                //TODO fire event
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
            if (this.getComponent(f.ComponentAnimator)) {
                this.removeComponent(this.getComponent(f.ComponentAnimator));
            }
            this.addComponent(cmpAnimator);
            cmpAnimator.activate(true);
            console.log("Component", cmpAnimator);
        }
    }
    TheJourneyOfY.GoalObject = GoalObject;
})(TheJourneyOfY || (TheJourneyOfY = {}));
//# sourceMappingURL=Script.js.map