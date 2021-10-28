namespace Script {

  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!")

  let viewport: ƒ.Viewport;
  document.addEventListener("interactiveViewportStarted", <EventListener><unknown>start);

  let agentMesh: ƒ.Node;
  let agent: Agent;
  let laser: Laser;
  let agentMutator: ƒ.Mutator;

  async function start(_event: CustomEvent): Promise<void> {
    viewport = _event.detail;

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    let graph: ƒ.Node = viewport.getBranch();
    let laserNode: ƒ.Node = graph.getChildrenByName("Lasers")[0].getChildrenByName("Laser 1")[0];
    
    agentMesh = graph.getChildrenByName("Agents")[0].getChildrenByName("Agent 1")[0];
    agent = new Agent(agentMesh, 500, 360);
    
    agentMutator = agentMesh.getComponent(ƒ.ComponentTransform);
    
    let graphLaser:  ƒ.Graph= < ƒ.Graph>FudgeCore.Project.resources["Graph|2021-10-28T13:10:15.078Z|49171"];
    let copyLaser = await ƒ.Project.createGraphInstance(graphLaser);
    copyLaser.getComponent(ƒ.ComponentTransform);
    graph.getChildrenByName("Lasers")[0].addChild(copyLaser);

    

    laser = new Laser(laserNode, 50);

    //laserTransformMatrix = laser.getComponent(ƒ.ComponentTransform).mtxLocal;
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


  //TODO move code to other class
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
*/
  }


}