namespace LaserLeague {
    import ƒ = FudgeCore;

    export class Agent extends ƒ.Node {
        mesh: ƒ.Node;
        ctrForward: ƒ.Control;
        speed: number; //TODO crate logic
        rotationSpeed: number;
        private deltaTime: number;

        constructor(speed: number, rotationSpeed: number) {
            super("Agent");
            this.rotationSpeed = rotationSpeed;
            this.ctrForward = this.ctrForward = new ƒ.Control("Forward", 1, ƒ.CONTROL_TYPE.PROPORTIONAL);
            this.ctrForward.setDelay(200);

            this.initiatePositionAndScale();
            ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.update);
        }

        private initiatePositionAndScale(): void {
            this.addComponent(new ƒ.ComponentTransform);
            this.addComponent(new ƒ.ComponentMesh(new ƒ.MeshQuad("MeshAgent"))); //TODO move to static variable for all agents
            this.addComponent(new ƒ.ComponentMaterial(
                new ƒ.Material("mtrAgent", ƒ.ShaderUniColor, new ƒ.CoatColored(new ƒ.Color(1, 0, 1, 1))))
            );

            //set position
            this.mtxLocal.translateZ(0.5);
            this.mtxLocal.translateY(4);

            //set scale
            this.mtxLocal.scale(ƒ.Vector3.ONE(0.5));
        }

        private update = (_event: Event) => {
            this.deltaTime = ƒ.Loop.timeFrameReal / 1000;
            this.handleAgentMovement();
            this.handleAgentRotation();
        }

        private handleAgentMovement() {
            let inputValue: number = (
                ƒ.Keyboard.mapToValue(-5, 0, [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN])
                + ƒ.Keyboard.mapToValue(5, 0, [ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP])
            );
            this.ctrForward.setInput(inputValue * this.deltaTime);
            this.mtxLocal.translateY(this.ctrForward.getOutput());
            //console.log(this.ctrForward.getOutput())
        }

        private handleAgentRotation(): void {
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT]))
                this.mtxLocal.rotateZ(this.rotationSpeed * this.deltaTime);
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT]))
                this.mtxLocal.rotateZ(-this.rotationSpeed * this.deltaTime);
        }
    }

}