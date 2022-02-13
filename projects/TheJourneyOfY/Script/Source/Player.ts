namespace TheYourneyOfY {
    import f = FudgeCore;

    export class Player extends f.Node {
        public health: number = 1;
        public name: string = "Agent Smith";
        mesh: f.Node;
        ctrForward: f.Control;
        private deltaTime: number;


        constructor() {
            super("Player");
            this.ctrForward = this.ctrForward = new f.Control("Forward", 1, f.CONTROL_TYPE.PROPORTIONAL);
            this.ctrForward.setDelay(200);

            this.initiatePositionAndScale();
            f.Loop.addEventListener(f.EVENT.LOOP_FRAME, this.update);
        }

        private initiatePositionAndScale(): void {
            this.addComponent(new f.ComponentTransform);
            this.addComponent(new f.ComponentMesh(new f.MeshCube("Player")));
            this.addComponent(new f.ComponentMaterial(
                new f.Material("materialPlayer", f.ShaderUniColor, new f.CoatColored(new f.Color(1, 0, 1, 1))))
            );
            this.addComponent(new f.ComponentRigidbody());
            this.getComponent(f.ComponentRigidbody).initialization = 2; //TO_PIVOT
            this.getComponent(f.ComponentRigidbody).effectGravity = 1;

            //set position
            this.mtxLocal.translateZ(0);
            this.mtxLocal.translateY(4);
            this.mtxLocal.translateX(0);

            //set scale
            this.mtxLocal.scale(f.Vector3.ONE(0.5));
        }

        private update = (_event: Event) => {
            this.deltaTime = f.Loop.timeFrameReal / 1000;
            this.handlePlayerMovement();
        }

        private handlePlayerMovement() {
            let forward: number = f.Keyboard.mapToTrit([f.KEYBOARD_CODE.D, f.KEYBOARD_CODE.ARROW_RIGHT], [f.KEYBOARD_CODE.A, f.KEYBOARD_CODE.ARROW_LEFT]);
            this.ctrForward.setInput(forward);


            this.getComponent(f.ComponentRigidbody).applyForce(f.Vector3.SCALE(this.mtxLocal.getX(), this.ctrForward.getOutput()));
            console.log(this.ctrForward.getOutput());



            //this.ctrForward.setInput(configurations.initialspeed);
            //this.getComponent(f.ComponentRigidbody).applyForce(f.Vector3.SCALE(this.mtxLocal.getX(), this.ctrlForward.getOutput()));
            /*
            f.Debug.info("player-movement");
            let inputValue: number = (
                f.Keyboard.mapToValue(-5, 0, [f.KEYBOARD_CODE.A, f.KEYBOARD_CODE.ARROW_LEFT])
                + f.Keyboard.mapToValue(5, 0, [f.KEYBOARD_CODE.D, f.KEYBOARD_CODE.ARROW_RIGHT])
            );


            this.ctrForward.setInput(inputValue * this.deltaTime);
            this.mtxLocal.translateY(this.ctrForward.getOutput());
            //console.log(this.ctrForward.getOutput())

             */
        }




    }

}