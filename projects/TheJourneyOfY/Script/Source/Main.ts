namespace TheYourneyOfY {
  import f = FudgeCore;
  f.Debug.info("Main Program Template running!");

  window.addEventListener("load", setup);
  let viewport: f.Viewport;
  document.addEventListener("interactiveViewportStarted", <EventListener>start);

  let graph: f.Node;
  let desiredZoomLevel: number = -30;
  let currentZoomLevel: number = -80;
  let cmpCamera: any;
  let graphId: string = "Graph|2022-01-08T12:51:22.101Z|15244";

  let player: Player;



  function start(_event: CustomEvent): void {
    console.log("Starting...");
    viewport = _event.detail;
    graph = viewport.getBranch();
    console.log(viewport);
    console.log(graph);
    //graph.getComponents(ƒ.ComponentAudio)[1].play(true);
    f.Loop.addEventListener(f.EVENT.LOOP_FRAME, update);
    f.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    // ƒ.Physics.world.simulate();  // if physics is included and used
    viewport.draw();
    spawnPlayer();
    //zoom in
    f.Debug.info("update loop");
    if(currentZoomLevel < desiredZoomLevel) {
      currentZoomLevel++;
      cmpCamera.mtxPivot.translateZ(1);
    }
    f.AudioManager.default.update();
  }



  async function setup(): Promise<void> {
    console.log("setting up...");
    await FudgeCore.Project.loadResourcesFromHTML();
    let graph: any  = f.Project.resources[graphId];

    // setup the viewport
    cmpCamera = new FudgeCore.ComponentCamera();
    cmpCamera.mtxPivot.rotateY(180);
    cmpCamera.mtxPivot.translateZ(currentZoomLevel);


    let canvas = document.querySelector("canvas");
    graph.addComponent(cmpCamera);
    let viewport = new FudgeCore.Viewport();
    viewport.initialize("Viewport", graph, cmpCamera, canvas);
    FudgeCore.Debug.log("Viewport:", viewport);
    // hide the cursor when interacting, also suppressing right-click menu
    //canvas.addEventListener("mousedown", canvas.requestPointerLock);
    //canvas.addEventListener("mouseup", function () { document.exitPointerLock(); });
    // make the camera interactive (complex method in FudgeAid)
    //FudgeAid.Viewport.expandCameraToInteractiveOrbit(viewport);

    // setup audio

    let cmpListener = new f.ComponentAudioListener();
    cmpCamera.node.addComponent(cmpListener);
    FudgeCore.AudioManager.default.listenWith(cmpListener);
    FudgeCore.AudioManager.default.listenTo(graph);
    FudgeCore.Debug.log("Audio:", FudgeCore.AudioManager.default);


    // draw viewport once for immediate feedback

    viewport.draw();
    canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
  }

  function spawnPlayer(): void {
    player = new Player("name", 0, 360);
    graph.getChildrenByName("Level")[0].getChildrenByName("Characters")[0].getChildrenByName("Player")[0].addChild(player);
  }
}