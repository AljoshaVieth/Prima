"use strict";
var LaserLeague;
(function (LaserLeague) {
    var ƒ = FudgeCore;
    class Agent extends ƒ.Node {
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
    LaserLeague.Agent = Agent;
})(LaserLeague || (LaserLeague = {}));
var LaserLeague;
(function (LaserLeague) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(LaserLeague); // Register the namespace to FUDGE for serialization
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
            }
        };
    }
    LaserLeague.CustomComponentScript = CustomComponentScript;
})(LaserLeague || (LaserLeague = {}));
var LaserLeague;
(function (LaserLeague) {
    var ƒ = FudgeCore;
    var ƒui = FudgeUserInterface; //TODO validate link to Fudge
    class GameState extends ƒ.Mutable {
        hits = 0;
        reduceMutator(_mutator) { }
    }
    LaserLeague.gameState = new GameState();
    class Hud {
        static controller;
        static start() {
            console.log("------------------- HUD started");
            let domHud = document.querySelector("#Hud");
            Hud.controller = new ƒui.Controller(LaserLeague.gameState, domHud);
            Hud.controller.updateUserInterface();
        }
    }
    LaserLeague.Hud = Hud;
})(LaserLeague || (LaserLeague = {}));
var LaserLeague;
(function (LaserLeague) {
    var ƒ = FudgeCore;
    class Laser {
        mesh;
        transformMatrix;
        ctrForward;
        deltaTime;
        rotationSpeed;
        constructor(mesh, rotationSpeed) {
            this.mesh = mesh;
            this.rotationSpeed = rotationSpeed;
            this.transformMatrix = mesh.getComponent(ƒ.ComponentTransform).mtxLocal;
        }
        update() {
            this.deltaTime = ƒ.Loop.timeFrameReal / 1000;
            this.rotate();
        }
        rotate() {
            this.transformMatrix.rotateZ(this.rotationSpeed * this.deltaTime);
        }
        getBeam(index) {
            return this.mesh.getChildren()[0].getChildren()[0].getChildren()[index];
        }
    }
    LaserLeague.Laser = Laser;
})(LaserLeague || (LaserLeague = {}));
var LaserLeague;
(function (LaserLeague) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    window.addEventListener("load", setup);
    let viewport;
    document.addEventListener("interactiveViewportStarted", start);
    let graph;
    let agent;
    async function start(_event) {
        viewport = _event.detail;
        LaserLeague.Hud.start();
        document.addEventListener("click", handleMouseClick);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        graph = viewport.getBranch();
        spawnLasers();
        spawnAgent();
        graph.getComponents(ƒ.ComponentAudio)[1].play(true);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(ƒ.LOOP_MODE.TIME_REAL, 120); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        // ƒ.Physics.world.simulate();  // if physics is included and used
        //laser.update();
        //checkCollision();
        viewport.draw();
        ƒ.AudioManager.default.update();
        handleSound();
    }
    function spawnAgent() {
        let agentName = "Agent One";
        agent = new LaserLeague.Agent(agentName, 0, 360);
        graph.getChildrenByName("Agents")[0].addChild(agent);
        let domName = document.querySelector("#Hud > h1");
        domName.textContent = agentName;
        let domHealthbar = document.querySelector("#Hud > input");
    }
    async function spawnLasers() {
        let graphLaser = FudgeCore.Project.resources["Graph|2021-10-28T13:10:15.078Z|49171"];
        for (let i = 0; i < 4; i++) {
            let laser = await ƒ.Project.createGraphInstance(graphLaser);
            for (let j = 0; j < 4; j++) {
            }
            laser.mtxLocal.translateX(5 * i);
            graph.getChildrenByName("Lasers")[0].addChild(laser);
        }
    }
    function handleSound() {
        //TODO move to Agent.ts and switch from AudioComponent added in editor to AudioComponent added in code 
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN]) || ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP])) {
            //graph.getComponents(ƒ.ComponentAudio)[1].play(true);
            graph.getComponents(ƒ.ComponentAudio)[1].volume = 50;
        }
        else {
            //graph.getComponents(ƒ.ComponentAudio)[1].play(false);
            graph.getComponents(ƒ.ComponentAudio)[1].volume = 0;
        }
    }
    function handleMouseClick(_event) {
        console.log("Clicked!");
    }
    async function setup() {
        console.log("setup---------");
        await FudgeCore.Project.loadResourcesFromHTML();
        let graph = ƒ.Project.resources["Graph|2021-10-14T11:50:21.744Z|34327"];
        console.log("graph: " + graph);
        // setup the viewport
        let cmpCamera = new FudgeCore.ComponentCamera();
        let canvas = document.querySelector("canvas");
        graph.addComponent(cmpCamera);
        let viewport = new FudgeCore.Viewport();
        viewport.initialize("Viewport", graph, cmpCamera, canvas);
        FudgeCore.Debug.log("Viewport:", viewport);
        // hide the cursor when interacting, also suppressing right-click menu
        canvas.addEventListener("mousedown", canvas.requestPointerLock);
        canvas.addEventListener("mouseup", function () { document.exitPointerLock(); });
        // make the camera interactive (complex method in FudgeAid)
        FudgeAid.Viewport.expandCameraToInteractiveOrbit(viewport);
        // setup audio
        let cmpListener = new ƒ.ComponentAudioListener();
        cmpCamera.node.addComponent(cmpListener);
        FudgeCore.AudioManager.default.listenWith(cmpListener);
        FudgeCore.AudioManager.default.listenTo(graph);
        FudgeCore.Debug.log("Audio:", FudgeCore.AudioManager.default);
        // draw viewport once for immediate feedback
        viewport.draw();
        canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
    }
    /*
    function checkCollision(): void {
      let beam: ƒ.Node = laser.getBeam(0);
      let posLocal: ƒ.Vector3 = ƒ.Vector3.TRANSFORMATION(agent.getTranslation(), beam.mtxWorldInverse, true);
  
      let minX = beam.getComponent(ƒ.ComponentMesh).mtxPivot.scaling.x / 2 + agentMesh.radius;
      let minY = beam.getComponent(ƒ.ComponentMesh).mtxPivot.scaling.y + agentMesh.radius;
      if (posLocal.x <= (minX) && posLocal.x >= -(minX) && posLocal.y <= minY && posLocal.y >= 0) {
        console.log("hit");
        agentMesh.getComponent(ƒ.ComponentTransform).mutate(agentMutator);
      }
  
      /*
      if(posLocal.get()[0] <1){
        console.log("hit! " + posLocal.toString());
      }
      //console.log(posLocal.toString());
  
    }
  */
})(LaserLeague || (LaserLeague = {}));
var LaserLeague;
(function (LaserLeague) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(LaserLeague); // Register the namespace to FUDGE for serialization
    class RotatorComponent extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(RotatorComponent);
        // Properties may be mutated by users in the editor via the automatically created user interface
        message = "RotatorComponent added to ";
        rotationSpeed;
        deltaTime;
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* COMPONENT_ADD */:
                    ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, this.update);
                    ƒ.Debug.log(this.message, this.node);
                    let random = new ƒ.Random();
                    this.rotationSpeed = random.getRangeFloored(20, 200);
                    break;
                case "componentRemove" /* COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
                    break;
            }
        };
        update = (_event) => {
            this.deltaTime = ƒ.Loop.timeFrameReal / 1000;
            this.node.mtxLocal.rotateZ(this.rotationSpeed * this.deltaTime);
            // console.log("rotating " + this.rotationSpeed);
        };
    }
    LaserLeague.RotatorComponent = RotatorComponent;
})(LaserLeague || (LaserLeague = {}));
var LaserLeague;
(function (LaserLeague) {
    var ƒ = FudgeCore;
    class oldAgent {
        mesh;
        ctrForward;
        speed;
        transformMatrix;
        rotationSpeed;
        deltaTime;
        constructor(mesh, speed, rotation) {
            this.mesh = mesh;
            this.speed = speed;
            this.rotationSpeed = rotation;
            this.transformMatrix = mesh.getComponent(ƒ.ComponentTransform).mtxLocal;
            this.ctrForward = this.ctrForward = new ƒ.Control("Forward", 1, 0 /* PROPORTIONAL */);
            this.ctrForward.setDelay(200);
        }
        update() {
            this.deltaTime = ƒ.Loop.timeFrameReal / 1000;
            this.handleAgentMovement();
            this.handleAgentRotation();
        }
        handleAgentMovement() {
            let inputValue = (ƒ.Keyboard.mapToValue(-5, 0, [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN])
                + ƒ.Keyboard.mapToValue(5, 0, [ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP]));
            this.ctrForward.setInput(inputValue * this.deltaTime);
            this.transformMatrix.translateY(this.ctrForward.getOutput());
            //console.log(this.ctrForward.getOutput())
        }
        handleAgentRotation() {
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT]))
                this.transformMatrix.rotateZ(this.rotationSpeed * this.deltaTime);
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT]))
                this.transformMatrix.rotateZ(-this.rotationSpeed * this.deltaTime);
        }
        getTranslation() {
            return this.mesh.mtxWorld.translation;
        }
    }
    LaserLeague.oldAgent = oldAgent;
})(LaserLeague || (LaserLeague = {}));
//# sourceMappingURL=Script.js.map