namespace Script {

  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!")

  let viewport: ƒ.Viewport;
  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  let laserTransformMatrix: ƒ.Matrix4x4;
  let agent: Agent;

  function start(_event: CustomEvent): void {
    viewport = _event.detail;

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    let graph: ƒ.Node = viewport.getBranch();
    let laser: ƒ.Node = graph.getChildrenByName("Lasers")[0].getChildrenByName("Laser 1")[0];
    let agentMesh: ƒ.Node = graph.getChildrenByName("Agents")[0].getChildrenByName("Agent 1")[0];
    agent = new Agent(agentMesh, 0.09, 0.001);
    laserTransformMatrix = laser.getComponent(ƒ.ComponentTransform).mtxLocal;
    console.log(graph);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(ƒ.LOOP_MODE.TIME_REAL, 120);  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    // ƒ.Physics.world.simulate();  // if physics is included and used
    agent.update();
    laserTransformMatrix.rotateZ(5);
    viewport.draw();
    ƒ.AudioManager.default.update();
  }


}