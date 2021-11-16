namespace LaserLeague {

  import ƒ = FudgeCore;
  
  
  ƒ.Debug.info("Main Program Template running!")


  window.addEventListener("load", setup);
  let viewport: ƒ.Viewport;
  document.addEventListener("interactiveViewportStarted", <EventListener><unknown>start);

  let graph: ƒ.Node;
  let agent: Agent;

  async function start(_event: CustomEvent): Promise<void> {
    viewport = _event.detail;

    Hud.start();

    document.addEventListener("click", handleMouseClick);
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
    //TODO move to Agent.ts and switch from AudioComponent added in editor to AudioComponent added in code 
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN]) || ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP])){
        //graph.getComponents(ƒ.ComponentAudio)[1].play(true);
        graph.getComponents(ƒ.ComponentAudio)[1].volume = 50;
    } else {
      //graph.getComponents(ƒ.ComponentAudio)[1].play(false);
      graph.getComponents(ƒ.ComponentAudio)[1].volume = 0;
    }
}

function handleMouseClick(_event: Event): void {
  console.log("Clicked!");
}

async function setup(): Promise<void> {
  console.log("setup---------");
  await FudgeCore.Project.loadResourcesFromHTML();
  let graph: any = ƒ.Project.resources["Graph|2021-10-14T11:50:21.744Z|34327"];
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


}