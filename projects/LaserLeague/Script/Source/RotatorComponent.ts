namespace LaserLeague {
  import ƒ = FudgeCore;
  ƒ.Project.registerScriptNamespace(LaserLeague);  // Register the namespace to FUDGE for serialization

  export class RotatorComponent extends ƒ.ComponentScript {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(RotatorComponent);
    // Properties may be mutated by users in the editor via the automatically created user interface
    public message: string = "RotatorComponent added to ";

    public rotationSpeed: number;
    private deltaTime: number;

    constructor() {
      super();
      
      
      // Don't start when running in editor
      if (ƒ.Project.mode == ƒ.MODE.EDITOR)
        return;

      // Listen to this component being added to or removed from a node
      this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
      this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);

      
    }

    // Activate the functions of this component as response to events
    public hndEvent = (_event: Event) => {
      switch (_event.type) {
        case ƒ.EVENT.COMPONENT_ADD:
          ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
          ƒ.Debug.log(this.message, this.node);
          let random: ƒ.Random = new ƒ.Random();
      this.rotationSpeed = random.getRangeFloored(20, 200);
          break;
        case ƒ.EVENT.COMPONENT_REMOVE:
          this.removeEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
          this.removeEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
          break;
      }
    }

    public update = (_event: Event): void => {
      this.deltaTime = ƒ.Loop.timeFrameReal / 1000;
      this.node.mtxLocal.rotateZ(this.rotationSpeed * this.deltaTime);
      console.log("rotating " + this.rotationSpeed);
    }

    // protected reduceMutator(_mutator: ƒ.Mutator): void {
    //   // delete properties that should not be mutated
    //   // undefined properties and private fields (#) will not be included by default
    // }
  }
}