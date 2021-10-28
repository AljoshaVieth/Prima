namespace Script {
    import ƒ = FudgeCore;
    export class Agent {
        mesh: ƒ.Node;
        ctrForward: ƒ.Control;
        speed: number;
        
        transformMatrix: ƒ.Matrix4x4;
        rotationSpeed: number;
        private deltaTime: number;

        /*
        velocity: number;
        acceleration: number;
        accelerationIncrease: number;
        maxSpeed: number;
        minSpeed: number;
        movedLastFrame: boolean;
        */

        constructor(mesh: ƒ.Node, speed: number, rotation: number) {
            this.mesh = mesh;
            this.speed = speed;
            this.rotationSpeed = rotation;
            this.transformMatrix = mesh.getComponent(ƒ.ComponentTransform).mtxLocal;
            this.ctrForward = this.ctrForward = new ƒ.Control("Forward", 1, ƒ.CONTROL_TYPE.PROPORTIONAL);
            this.ctrForward.setDelay(20);

        }


        update() {
            this.deltaTime = ƒ.Loop.timeFrameReal / 1000;
            this.handleAgentMovement();
            this.handleAgentRotation();
        }

        private handleAgentMovement(): void {
            let inputValue: number = (
                ƒ.Keyboard.mapToValue(-1, 0, [ƒ.KEYBOARD_CODE.S, ƒ.KEYBOARD_CODE.ARROW_DOWN])
                + ƒ.Keyboard.mapToValue(1, 0, [ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP])
            );
            this.ctrForward.setInput(inputValue * this.deltaTime);
            this.transformMatrix.translateY(this.ctrForward.getOutput());

        }

        private handleAgentRotation(): void {
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT]))
                this.transformMatrix.rotateZ(this.rotationSpeed * this.deltaTime);
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT]))
            this.transformMatrix.rotateZ(-this.rotationSpeed * this.deltaTime);
        }

        getTranslation(): ƒ.Vector3 {
            return this.mesh.mtxWorld.translation;
        }

        getMesh(): ƒ.Node {
            return this.mesh;
        }



        /*
        
            /*
            //(de-)accelerate
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.W, ƒ.KEYBOARD_CODE.ARROW_UP])) {
                if (this.velocity < this.maxSpeed) {
                    this.accelerate();
                }
            } else {
                this.deAccelerate();
            }

            //move
            this.transformMatrix.translateY(this.velocity);

            //rotate
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.A, ƒ.KEYBOARD_CODE.ARROW_LEFT])) {
                this.transformMatrix.rotateZ(3);
            }
            if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.D, ƒ.KEYBOARD_CODE.ARROW_RIGHT])) {
                this.transformMatrix.rotateZ(-3);
            }
            
        private accelerate(): void {
            this.velocity = this.velocity + this.acceleration + this.accelerationIncrease;
        }

        private deAccelerate(): void {
            if (this.acceleration > this.accelerationIncrease) {
                if ((this.acceleration - this.accelerationIncrease) > 0.0) {
                    this.acceleration = this.acceleration - this.accelerationIncrease;
                    this.velocity = this.velocity + this.acceleration;
                    return;
                }
            }
            this.acceleration = 0.0;
            this.velocity = 0.0;
        }
        */
        /*
        constructor(mesh: ƒ.Node, maxSpeed: number, accelerationIncrease: number) {
            this.mesh = mesh;
            this.minSpeed = 0.0;
            this.maxSpeed = maxSpeed;
            this.accelerationIncrease = accelerationIncrease;
            this.transformMatrix = mesh.getComponent(ƒ.ComponentTransform).mtxLocal;
            this.movedLastFrame = false;
            this.velocity = 0.0;
            this.acceleration = 0.0;
        }
        */
    }
}