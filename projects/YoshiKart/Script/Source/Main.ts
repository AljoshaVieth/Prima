namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  let kart: ƒ.Node;
  let body: ƒ.ComponentRigidbody;
  let meshTerrain: ƒ.MeshTerrain;
  let mtxTerrain: ƒ.Matrix4x4;
  let isGrounded: boolean = false;
  let dampTranslation: number;
  let dampRotation: number;



  document.addEventListener("interactiveViewportStarted", <EventListener>start);


  let ctrForward: ƒ.Control = new ƒ.Control("Forward", 7000, ƒ.CONTROL_TYPE.PROPORTIONAL);
  ctrForward.setDelay(200);
  let ctrTurn: ƒ.Control = new ƒ.Control("Turn", 1000, ƒ.CONTROL_TYPE.PROPORTIONAL);
  ctrTurn.setDelay(50);

  function start(_event: CustomEvent): void {
    console.log("starting...");

    viewport = _event.detail;
    viewport.calculateTransforms();


    kart = viewport.getBranch().getChildrenByName("Kart")[0];
    body = kart.getComponent(ƒ.ComponentRigidbody);

    dampTranslation = body.dampTranslation;
    dampRotation = body.dampRotation;

    // Terrain stuff
    let cmpMeshTerrain: ƒ.ComponentMesh = viewport.getBranch().getChildrenByName("Terrain")[0].getComponent(ƒ.ComponentMesh);
    meshTerrain = <ƒ.MeshTerrain>cmpMeshTerrain.mesh;
    mtxTerrain = cmpMeshTerrain.mtxWorld;

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {

    let maxHeight: number = 0.3;
    let minHeight: number = 0.2;
    let forceNodes: ƒ.Node[] = kart.getChildren();
    let force: ƒ.Vector3 = ƒ.Vector3.SCALE(ƒ.Physics.world.getGravity(), -body.mass / forceNodes.length);


    isGrounded = false;
    for (let forceNode of forceNodes) {
      let posForce: ƒ.Vector3 = forceNode.getComponent(ƒ.ComponentMesh).mtxWorld.translation;
      let terrainInfo: ƒ.TerrainInfo = meshTerrain.getTerrainInfo(posForce, mtxTerrain);
      let height: number = posForce.y - terrainInfo.position.y;
      if (height < maxHeight) {
        body.applyForceAtPoint(ƒ.Vector3.SCALE(force, (maxHeight - height) / (maxHeight - minHeight)), posForce);
        isGrounded = true;
      }
    }


    if (isGrounded) {
      body.dampTranslation = dampTranslation;
      body.dampRotation = dampRotation;
      let turn: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT], [ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT]);
      ctrTurn.setInput(turn);
      body.applyTorque(ƒ.Vector3.SCALE(kart.mtxLocal.getY(), ctrTurn.getOutput()));

      let forward: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP], [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN]);
      ctrForward.setInput(forward);
      body.applyForce(ƒ.Vector3.SCALE(kart.mtxLocal.getZ(), ctrForward.getOutput()));
    } else {
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
    ƒ.Physics.world.simulate();  // if physics is included and used

    viewport.draw();
    ƒ.AudioManager.default.update();
  }

}



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