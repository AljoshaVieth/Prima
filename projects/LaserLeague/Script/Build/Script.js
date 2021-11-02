"use strict";
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    class Agent {
        constructor(mesh, speed, rotation) {
            this.mesh = mesh;
            this.speed = speed;
            this.rotationSpeed = rotation;
            this.transformMatrix = mesh.getComponent(ƒ.ComponentTransform).mtxLocal;
            this.ctrForward = this.ctrForward = new ƒ.Control("Forward", 1, 0 /* PROPORTIONAL */);
            this.ctrForward.setDelay(20);
        }
        update() {
            this.deltaTime = ƒ.Loop.timeFrameReal / 1000;
            this.handleAgentMovement();
            this.handleAgentRotation();
        }
        handleAgentMovement() {
            let inputValue = (ƒ.Keyboard.mapToValue(-1, 0, [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN])
                + ƒ.Keyboard.mapToValue(1, 0, [ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP]));
            this.ctrForward.setInput(inputValue * this.deltaTime);
            this.transformMatrix.translateY(this.ctrForward.getOutput());
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
    Script.Agent = Agent;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class CustomComponentScript extends ƒ.ComponentScript {
        constructor() {
            super();
            // Properties may be mutated by users in the editor via the automatically created user interface
            this.message = "CustomComponentScript added to ";
            // Activate the functions of this component as response to events
            this.hndEvent = (_event) => {
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
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
        }
    }
    // Register the script as component for use in the editor via drag&drop
    CustomComponentScript.iSubclass = ƒ.Component.registerSubclass(CustomComponentScript);
    Script.CustomComponentScript = CustomComponentScript;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    class Laser {
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
    Script.Laser = Laser;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    let viewport;
    document.addEventListener("interactiveViewportStarted", start);
    let agentMesh;
    let agent;
    //let laser: Laser;
    let agentMutator;
    async function start(_event) {
        viewport = _event.detail;
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        let graph = viewport.getBranch();
        // let laserNode: ƒ.Node = graph.getChildrenByName("Lasers")[0].getChildrenByName("Laser 1")[0];
        agentMesh = graph.getChildrenByName("Agents")[0].getChildrenByName("Agent 1")[0];
        agent = new Script.Agent(agentMesh, 500, 360);
        agentMutator = agentMesh.getComponent(ƒ.ComponentTransform);
        let graphLaser = FudgeCore.Project.resources["Graph|2021-10-28T13:10:15.078Z|49171"];
        for (let i = 0; i < 4; i++) {
            let laser = await ƒ.Project.createGraphInstance(graphLaser);
            for (let j = 0; j < 4; j++) {
            }
            laser.mtxLocal.translateX(5 * i);
            graph.getChildrenByName("Lasers")[0].addChild(laser);
        }
        //laser = new Laser(laserNode, 50);
        //laserTransformMatrix = laser.getComponent(ƒ.ComponentTransform).mtxLocal;
        console.log(graph);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(ƒ.LOOP_MODE.TIME_REAL, 120); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        // ƒ.Physics.world.simulate();  // if physics is included and used
        agent.update();
        //laser.update();
        //checkCollision();
        viewport.draw();
        ƒ.AudioManager.default.update();
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
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class RotatorComponent extends ƒ.ComponentScript {
        constructor() {
            super();
            // Properties may be mutated by users in the editor via the automatically created user interface
            this.message = "RotatorComponent added to ";
            // Activate the functions of this component as response to events
            this.hndEvent = (_event) => {
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
            this.update = (_event) => {
                this.deltaTime = ƒ.Loop.timeFrameReal / 1000;
                this.node.mtxLocal.rotateZ(this.rotationSpeed * this.deltaTime);
                console.log("rotating " + this.rotationSpeed);
            };
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndEvent);
        }
    }
    // Register the script as component for use in the editor via drag&drop
    RotatorComponent.iSubclass = ƒ.Component.registerSubclass(RotatorComponent);
    Script.RotatorComponent = RotatorComponent;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map