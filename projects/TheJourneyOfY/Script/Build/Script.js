"use strict";
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
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
    Script.CustomComponentScript = CustomComponentScript;
})(Script || (Script = {}));
var TheYourneyOfY;
(function (TheYourneyOfY) {
    var f = FudgeCore;
    f.Debug.info("Main Program Template running!");
    window.addEventListener("load", setup);
    let viewport;
    document.addEventListener("interactiveViewportStarted", start);
    let graph;
    let desiredZoomLevel = -30;
    let currentZoomLevel = -80;
    let cmpCamera;
    let graphId = "Graph|2022-01-08T12:51:22.101Z|15244";
    let player;
    function start(_event) {
        console.log("Starting...");
        viewport = _event.detail;
        graph = viewport.getBranch();
        console.log(viewport);
        console.log(graph);
        //graph.getComponents(ƒ.ComponentAudio)[1].play(true);
        f.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        f.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        // ƒ.Physics.world.simulate();  // if physics is included and used
        viewport.draw();
        spawnPlayer();
        //zoom in
        f.Debug.info("update loop");
        if (currentZoomLevel < desiredZoomLevel) {
            currentZoomLevel++;
            cmpCamera.mtxPivot.translateZ(1);
        }
        f.AudioManager.default.update();
    }
    async function setup() {
        console.log("setting up...");
        await FudgeCore.Project.loadResourcesFromHTML();
        let graph = f.Project.resources[graphId];
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
        canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
    }
    function spawnPlayer() {
        player = new TheYourneyOfY.Player("name", 0, 360);
        graph.getChildrenByName("Level")[0].getChildrenByName("Characters")[0].getChildrenByName("Player")[0].addChild(player);
    }
})(TheYourneyOfY || (TheYourneyOfY = {}));
var TheYourneyOfY;
(function (TheYourneyOfY) {
    var ƒ = FudgeCore;
    class Player extends ƒ.Node {
        health = 1;
        name = "Agent Smith";
        mesh;
        ctrForward;
        speed; //TODO crate logic
        rotationSpeed;
        deltaTime;
        constructor(name, speed, rotationSpeed) {
            super("Agent");
            this.name = name;
            this.rotationSpeed = rotationSpeed;
            this.ctrForward = this.ctrForward = new ƒ.Control("Forward", 1, 0 /* PROPORTIONAL */);
            this.ctrForward.setDelay(200);
            this.initiatePositionAndScale();
            ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
        }
        initiatePositionAndScale() {
            this.addComponent(new ƒ.ComponentTransform);
            this.addComponent(new ƒ.ComponentMesh(new ƒ.MeshQuad("MeshAgent"))); //TODO move to static variable for all agents
            this.addComponent(new ƒ.ComponentMaterial(new ƒ.Material("mtrAgent", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(1, 0, 1, 1)))));
            //set position
            this.mtxLocal.translateZ(0.5);
            this.mtxLocal.translateY(4);
            //set scale
            this.mtxLocal.scale(ƒ.Vector3.ONE(0.5));
        }
        update = (_event) => {
            this.deltaTime = ƒ.Loop.timeFrameReal / 1000;
            this.handleAgentMovement();
            this.handleAgentRotation();
        };
        handleAgentMovement() {
            let inputValue = (ƒ.Keyboard.mapToValue(-5, 0, [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN])
                + ƒ.Keyboard.mapToValue(5, 0, [ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP]));
            this.ctrForward.setInput(inputValue * this.deltaTime);
            this.mtxLocal.translateY(this.ctrForward.getOutput());
            //console.log(this.ctrForward.getOutput())
        }
        handleAgentRotation() {
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT]))
                this.mtxLocal.rotateZ(this.rotationSpeed * this.deltaTime);
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT]))
                this.mtxLocal.rotateZ(-this.rotationSpeed * this.deltaTime);
        }
    }
    TheYourneyOfY.Player = Player;
})(TheYourneyOfY || (TheYourneyOfY = {}));
//# sourceMappingURL=Script.js.map