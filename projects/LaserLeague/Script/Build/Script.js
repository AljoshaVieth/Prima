"use strict";
var ƒ = FudgeCore;
var Script;
(function (Script) {
    class Agent {
        constructor(mesh, maxSpeed, accelerationIncrease) {
            this.mesh = mesh;
            this.minSpeed = 0.0;
            this.maxSpeed = maxSpeed;
            this.accelerationIncrease = accelerationIncrease;
            this.transformMatrix = mesh.getComponent(ƒ.ComponentTransform).mtxLocal;
            this.movedLastFrame = false;
            this.velocity = 0.0;
            this.acceleration = 0.0;
        }
        update() {
            this.handleAgentMovement();
        }
        handleAgentMovement() {
            //(de-)accelerate
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP])) {
                if (this.velocity < this.maxSpeed) {
                    this.accelerate();
                }
            }
            else {
                this.deAccelerate();
            }
            //move
            this.transformMatrix.translateY(this.velocity);
            //rotate
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT])) {
                this.transformMatrix.rotateZ(3);
            }
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT])) {
                this.transformMatrix.rotateZ(-3);
            }
        }
        accelerate() {
            this.velocity = this.velocity + this.acceleration + this.accelerationIncrease;
        }
        deAccelerate() {
            if (this.acceleration > this.accelerationIncrease) {
                if ((this.acceleration - this.accelerationIncrease) > 0.0) {
                    this.acceleration = this.acceleration - this.accelerationIncrease;
                    this.velocity = this.velocity + this.acceleration;
                    return;
                }
            }
            this.acceleration = 0.0;
            this.velocity = 0.0;
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
    ƒ.Debug.info("Main Program Template running!");
    let viewport;
    document.addEventListener("interactiveViewportStarted", start);
    let laserTransformMatrix;
    let agent;
    function start(_event) {
        viewport = _event.detail;
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        let graph = viewport.getBranch();
        let laser = graph.getChildrenByName("Lasers")[0].getChildrenByName("Laser 1")[0];
        let agentMesh = graph.getChildrenByName("Agents")[0].getChildrenByName("Agent 1")[0];
        agent = new Script.Agent(agentMesh, 0.09, 0.001);
        laserTransformMatrix = laser.getComponent(ƒ.ComponentTransform).mtxLocal;
        console.log(graph);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(ƒ.LOOP_MODE.TIME_REAL, 120); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        // ƒ.Physics.world.simulate();  // if physics is included and used
        agent.update();
        laserTransformMatrix.rotateZ(5);
        viewport.draw();
        ƒ.AudioManager.default.update();
    }
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map