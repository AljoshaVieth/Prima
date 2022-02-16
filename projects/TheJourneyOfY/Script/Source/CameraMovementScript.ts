namespace TheJourneyOfY {
    import f = FudgeCore;
    import ComponentTransform = FudgeCore.ComponentTransform;
    f.Project.registerScriptNamespace(TheJourneyOfY);  // Register the namespace to FUDGE for serialization

    export class CameraMovementScript extends f.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        public static readonly iSubclass: number = f.Component.registerSubclass(CameraMovementScript);
        // Properties may be mutated by users in the editor via the automatically created user interface
        public message: string = "CameraMovementScript added to ";


        constructor() {
            super();
            // Don't start when running in editor
            if (f.Project.mode == f.MODE.EDITOR)
                return;

            // Listen to this component being added to or removed from a node
            this.addEventListener(f.EVENT.COMPONENT_ADD, this.hndEvent);
            this.addEventListener(f.EVENT.COMPONENT_REMOVE, this.hndEvent);
        }

        // Activate the functions of this component as response to events
        public hndEvent = (_event: Event): void => {
            switch (_event.type) {
                case f.EVENT.COMPONENT_ADD:
                    f.Debug.log(this.message, this.node);
                    this.start();
                    break;
                case f.EVENT.COMPONENT_REMOVE:
                    this.removeEventListener(f.EVENT.COMPONENT_ADD, this.hndEvent);
                    this.removeEventListener(f.EVENT.COMPONENT_REMOVE, this.hndEvent);
                    break;
            }
        }

        public start (): void  {
            f.Loop.addEventListener(f.EVENT.LOOP_FRAME, this.update);
        }

        public update = (_event: Event): void => {
            let moveVector: f.Vector3 = f.Vector3.DIFFERENCE(player.mtxLocal.translation, this.node.getComponent(ComponentTransform).mtxLocal.translation);
            moveVector.y = 0;
            this.node.getComponent(ComponentTransform).mtxLocal.translate(moveVector);
        }
    }
}