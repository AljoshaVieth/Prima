namespace LaserLeague {

  import ƒ = FudgeCore;
  
  
  ƒ.Debug.info("Main Program Template running!")

  let viewport: ƒ.Viewport;
  document.addEventListener("interactiveViewportStarted", <EventListener><unknown>start);

  let graph: ƒ.Node;
  let agent: Agent;

  async function start(_event: CustomEvent): Promise<void> {
    viewport = _event.detail;

    Hud.start();

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    graph = viewport.getBranch();

    spawnLasers();
    spawnAgent();
        graph.getComponents(ƒ.ComponentAudio)[1].play(true);

    
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start(ƒ.LOOP_MODE.TIME_REAL, 120);  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    // ƒ.Physics.world.simulate();  // if physics is included and used
    //laser.update();
    //checkCollision();
    viewport.draw();
    ƒ.AudioManager.default.update();
    handleSound();
  }

  function spawnAgent(): void {
    let agentName: string = "Agent One";
    agent = new Agent(agentName, 0, 360);
    graph.getChildrenByName("Agents")[0].addChild(agent);
    let domName: HTMLHeadingElement = document.querySelector("#Hud > h1");
    domName.textContent = agentName;
    let domHealthbar: HTMLInputElement = document.querySelector("#Hud > input");
  }

  async function spawnLasers(): Promise<void> {
    let graphLaser: ƒ.Graph = <ƒ.Graph>FudgeCore.Project.resources["Graph|2021-10-28T13:10:15.078Z|49171"];
    for (let i: number = 0; i < 4; i++) {
      let laser = await ƒ.Project.createGraphInstance(graphLaser);
      for (let j: number = 0; j < 4; j++) {
      }
      laser.mtxLocal.translateX(5 * i);
      graph.getChildrenByName("Lasers")[0].addChild(laser);
    }
  }

  function handleSound() {
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN]) || ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP])){
        //graph.getComponents(ƒ.ComponentAudio)[1].play(true);
        graph.getComponents(ƒ.ComponentAudio)[1].volume = 50;
    } else {
      //graph.getComponents(ƒ.ComponentAudio)[1].play(false);
      graph.getComponents(ƒ.ComponentAudio)[1].volume = 0;
    }
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


}