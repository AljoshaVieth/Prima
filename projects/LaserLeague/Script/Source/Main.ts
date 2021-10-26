namespace Script {

  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!")

  let viewport: ƒ.Viewport;
  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  let agent: Agent;
  let laser: Laser;

  function start(_event: CustomEvent): void {
    viewport = _event.detail;
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);

    let graph: ƒ.Node = viewport.getBranch();
    let laserMesh: ƒ.Node = graph.getChildrenByName("Lasers")[0].getChildrenByName("Laser 1")[0];
    let agentMesh: ƒ.Node = graph.getChildrenByName("Agents")[0].getChildrenByName("Agent 1")[0];
    agent = new Agent(agentMesh, 500, 360);
    laser = new Laser(laserMesh, 50);
    console.log(graph);
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(ƒ.LOOP_MODE.TIME_REAL, 120);  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    // ƒ.Physics.world.simulate();  // if physics is included and used
    agent.update();
    laser.update();
    checkCollision();
    viewport.draw();
    ƒ.AudioManager.default.update();
  }


  function checkCollision(): void {
    let beam: ƒ.Node = laser.getBeam(0);
    let posLocal: ƒ.Vector3 = ƒ.Vector3.TRANSFORMATION(agent.getTranslation(), beam.mtxWorldInverse, true);
    if (posLocal.get()[0] < 1) {
      console.log("hit! " + posLocal.toString());
    }
    //console.log(posLocal.toString());

  }


}