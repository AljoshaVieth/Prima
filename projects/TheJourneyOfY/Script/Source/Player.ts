namespace TheYourneyOfY {
    import f = FudgeCore;

    export class Player extends f.Node {
        public health: number = 1;
        public name: string = "Agent Smith";
        mesh: f.Node;
        ctrForward: f.Control;
        speed: number; //TODO crate logic
        rotationSpeed: number;
        private deltaTime: number;

        constructor(name: string, speed: number, rotationSpeed: number) {
            super("Agent");
            this.name = name;
            this.rotationSpeed = rotationSpeed;
            this.ctrForward = this.ctrForward = new f.Control("Forward", 1, f.CONTROL_TYPE.PROPORTIONAL);
            this.ctrForward.setDelay(200);

            this.initiatePositionAndScale();
            f.Loop.addEventListener(f.EVENT.LOOP_FRAME, this.update);
        }

        private initiatePositionAndScale(): void {
            this.addComponent(new f.ComponentTransform);
            this.addComponent(new f.ComponentMesh(new f.MeshCube("Player"))); //TODO move to static variable for all agents
            this.addComponent(new f.ComponentMaterial(
                new f.Material("mtrAgent", f.ShaderUniColor, new f.CoatColored(new f.Color(1, 0, 1, 1))))
            );
            this.addComponent(new f.ComponentRigidbody());
            this.getComponent(f.ComponentRigidbody).effectGravity = 0;

            //set position
            this.mtxLocal.translateZ(0);
            this.mtxLocal.translateY(4);
            this.mtxLocal.translateX(5);

            //set scale
            this.mtxLocal.scale(f.Vector3.ONE(0.5));
        }

        private update = (_event: Event) => {
            this.deltaTime = f.Loop.timeFrameReal / 1000;
            this.handleAgentMovement();
            this.handleAgentRotation();
        }

        private handleAgentMovement() {
            let inputValue: number = (
                f.Keyboard.mapToValue(-5, 0, [f.KEYBOARD_CODE.S, f.KEYBOARD_CODE.ARROW_DOWN])
                + f.Keyboard.mapToValue(5, 0, [f.KEYBOARD_CODE.W, f.KEYBOARD_CODE.ARROW_UP])
            );
            this.ctrForward.setInput(inputValue * this.deltaTime);
            this.mtxLocal.translateY(this.ctrForward.getOutput());
            //console.log(this.ctrForward.getOutput())
        }



        private handleAgentRotation(): void {
            if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.A, f.KEYBOARD_CODE.ARROW_LEFT]))
                this.mtxLocal.rotateZ(this.rotationSpeed * this.deltaTime);
            if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.D, f.KEYBOARD_CODE.ARROW_RIGHT]))
                this.mtxLocal.rotateZ(-this.rotationSpeed * this.deltaTime);
        }


    }

}