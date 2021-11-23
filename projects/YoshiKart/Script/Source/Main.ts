namespace Script {
  import ƒ = FudgeCore;
  ƒ.Debug.info("Main Program Template running!");

  let viewport: ƒ.Viewport;
  let kart: ƒ.Node;



  document.addEventListener("interactiveViewportStarted", <EventListener>start);


  let ctrForward: ƒ.Control = new ƒ.Control("Forward", 10, ƒ.CONTROL_TYPE.PROPORTIONAL);
  ctrForward.setDelay(200);
  let ctrTurn: ƒ.Control = new ƒ.Control("Turn", 100, ƒ.CONTROL_TYPE.PROPORTIONAL);
  ctrForward.setDelay(50);

  function start(_event: CustomEvent): void {
    console.log("starting...");

    viewport = _event.detail;
    viewport.calculateTransforms();
    console.log(viewport);
    console.log(viewport.getBranch());
    kart = viewport.getBranch().getChildrenByName("Kart")[0];

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
     ƒ.Loop.start();  // start the game loop to continously draw the viewport, update the audiosystem and drive the physics i/a
  }

  function update(_event: Event): void {
    // ƒ.Physics.world.simulate();  // if physics is included and used
    let deltaTime: number = ƒ.Loop.timeFrameReal / 1000;

    let turn: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT], [ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT]);
    ctrTurn.setInput(turn * deltaTime);
    kart.mtxLocal.rotateY(ctrTurn.getOutput());

    let forward: number = ƒ.Keyboard.mapToTrit([ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP], [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN]);
    ctrForward.setInput(forward * deltaTime);
    kart.mtxLocal.translateZ(ctrForward.getOutput());

    viewport.draw();
    ƒ.AudioManager.default.update();
  }
}