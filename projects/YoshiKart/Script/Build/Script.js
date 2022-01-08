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
    Script.CustomComponentScript = CustomComponentScript;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Debug.info("Main Program Template running!");
    let viewport;
    let kart;
    let body;
    let meshTerrain;
    let mtxTerrain;
    let isGrounded = false;
    let dampTranslation;
    let dampRotation;
    document.addEventListener("interactiveViewportStarted", start);
    let ctrForward = new ƒ.Control("Forward", 7000, 0 /* PROPORTIONAL */);
    ctrForward.setDelay(200);
    let ctrTurn = new ƒ.Control("Turn", 1000, 0 /* PROPORTIONAL */);
    ctrTurn.setDelay(50);
    function start(_event) {
        console.log("starting...");
        viewport = _event.detail;
        viewport.calculateTransforms();
        kart = viewport.getBranch().getChildrenByName("Kart")[0];
        body = kart.getComponent(ƒ.ComponentRigidbody);
        dampTranslation = body.dampTranslation;
        dampRotation = body.dampRotation;
        // Terrain stuff
        let cmpMeshTerrain = viewport.getBranch().getChildrenByName("Terrain")[0].getComponent(ƒ.ComponentMesh);
        meshTerrain = cmpMeshTerrain.mesh;
        mtxTerrain = cmpMeshTerrain.mtxWorld;
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start(); // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
    }
    function update(_event) {
        let maxHeight = 0.3;
        let minHeight = 0.2;
        let forceNodes = kart.getChildren();
        let force = ƒ.Vector3.SCALE(ƒ.Physics.world.getGravity(), -body.mass / forceNodes.length);
        isGrounded = false;
        for (let forceNode of forceNodes) {
            let posForce = forceNode.getComponent(ƒ.ComponentMesh).mtxWorld.translation;
            let terrainInfo = meshTerrain.getTerrainInfo(posForce, mtxTerrain);
            let height = posForce.y - terrainInfo.position.y;
            if (height < maxHeight) {
                body.applyForceAtPoint(ƒ.Vector3.SCALE(force, (maxHeight - height) / (maxHeight - minHeight)), posForce);
                isGrounded = true;
            }
        }
        if (isGrounded) {
            body.dampTranslation = dampTranslation;
            body.dampRotation = dampRotation;
            let turn = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT], [ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT]);
            ctrTurn.setInput(turn);
            body.applyTorque(ƒ.Vector3.SCALE(kart.mtxLocal.getY(), ctrTurn.getOutput()));
            let forward = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP], [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN]);
            ctrForward.setInput(forward);
            body.applyForce(ƒ.Vector3.SCALE(kart.mtxLocal.getZ(), ctrForward.getOutput()));
        }
        else {
            body.dampRotation = body.dampTranslation = 0;
        }
        /*
            if (isGrounded) {
              let turn: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT], [ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT]);
              ctrTurn.setInput(turn);
              body.applyTorque(ƒ.Vector3.SCALE(kart.mtxLocal.getY(), ctrTurn.getOutput()));
        
              let forward: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP], [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN]);
              ctrForward.setInput(forward);
              body.applyForce(ƒ.Vector3.SCALE(kart.mtxLocal.getZ(), ctrForward.getOutput()));
            }
        
            */
        ƒ.Physics.world.simulate(); // if physics is included and used
        viewport.draw();
        ƒ.AudioManager.default.update();
    }
})(Script || (Script = {}));
/*
for (let forceNode of forceNodes) {
  let posForce: ƒ.Vector3 = forceNode.getComponent(ƒ.ComponentMesh).mtxWorld.translation;
  body.applyForceAtPoint(force, posForce);
}
let forceNode: ƒ.Node = kart.getChildrenByName("Force")[0];
let posForce: ƒ.Vector3 = forceNode.getComponent(ƒ.ComponentMesh).mtxWorld.translation;
let force: ƒ.Vector3 = ƒ.Vector3.Y(body.mass * ƒ.Physics.world.getGravity().magnitude);
body.applyForceAtPoint(force, posForce);
*/
/* old movement
let deltaTime: number = ƒ.Loop.timeFrameReal / 1000;

let turn: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT], [ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT]);
ctrTurn.setInput(turn * deltaTime);
kart.mtxLocal.rotateY(ctrTurn.getOutput());

let forward: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP], [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN]);
ctrForward.setInput(forward * deltaTime);
kart.mtxLocal.translateZ(ctrForward.getOutput());

//let kart stay on top of terrain via mesh
let terrainInfo: ƒ.TerrainInfo = meshTerrain.getTerrainInfo(kart.mtxLocal.translation, mtxTerrain);
kart.mtxLocal.translation = terrainInfo.position;
kart.mtxLocal.showTo(ƒ.Vector3.SUM(terrainInfo.position, kart.mtxLocal.getZ()), terrainInfo.normal);
*/ 
//# sourceMappingURL=Script.js.map