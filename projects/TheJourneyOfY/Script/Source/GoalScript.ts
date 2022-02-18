namespace TheJourneyOfY {
  import f = FudgeCore;
  f.Project.registerScriptNamespace(TheJourneyOfY);  // Register the namespace to FUDGE for serialization

  export class GoalScript extends f.ComponentScript {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = f.Component.registerSubclass(GoalScript);
    // Properties may be mutated by users in the editor via the automatically created user interface
    public message: string = "GoalScript added to ";


    constructor() {
      super();

      // Don't start when running in editor
      if (f.Project.mode == f.MODE.EDITOR)
        return;

      // Listen to this component being added to or removed from a node
      this.addEventListener(f.EVENT.COMPONENT_ADD, this.hndEvent);
      this.addEventListener(f.EVENT.COMPONENT_REMOVE, this.hndEvent);
      this.addEventListener(f.EVENT.NODE_DESERIALIZED, this.hndEvent);
    }

    // Activate the functions of this component as response to events
    public hndEvent = (_event: Event): void => {
      if(_event.type == f.EVENT.COMPONENT_ADD){
          f.Debug.log(this.message, this.node);
          this.start();
      }
    }

    public start (): void  {
      this.initAnim();
      f.Loop.addEventListener(f.EVENT.LOOP_FRAME, this.update);
    }

    public update = (_event: Event): void => {
      this.checkForPlayerPosition();
    }

    private checkForPlayerPosition(){

      if(this.node.mtxLocal.translation.getDistance(player.mtxLocal.translation) < 0.5){ //Player wins
        const gameOverEvent = new GameOverEvent(true);
        this.node.dispatchEvent(gameOverEvent);
      }
    }

    private initAnim(): void {
      let hoveringAnimSeq: f.AnimationSequence = new f.AnimationSequence();
      hoveringAnimSeq.addKey(new f.AnimationKey(0, 2));
      hoveringAnimSeq.addKey(new f.AnimationKey(3000, 4));
      hoveringAnimSeq.addKey(new f.AnimationKey(6000, 2));

      let rotatingAnimSeq: f.AnimationSequence = new f.AnimationSequence();
      rotatingAnimSeq.addKey(new f.AnimationKey(0, 0));
      rotatingAnimSeq.addKey(new f.AnimationKey(3000, 360));
      rotatingAnimSeq.addKey(new f.AnimationKey(6000, 0));

      let animStructure: f.AnimationStructure = {
        components: {
          ComponentTransform: [
            {
              "f.ComponentTransform": {
                mtxLocal: {
                  rotation: {
                    y: rotatingAnimSeq
                  },
                  translation: {
                    y: hoveringAnimSeq
                  }
                }
              }
            }
          ]
        }
      };

      let fps: number = 30;
      let animation: f.Animation = new f.Animation("GoalAnimation", animStructure, fps);
      let cmpAnimator: f.ComponentAnimator = new f.ComponentAnimator(animation, f.ANIMATION_PLAYMODE.LOOP, f.ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS);
      cmpAnimator.scale = 1;
      if (this.node.getComponent(f.ComponentAnimator)) {
        this.node.removeComponent(this.node.getComponent(f.ComponentAnimator));
      }
      this.node.addComponent(cmpAnimator);
      cmpAnimator.activate(true);
    }

  }
}