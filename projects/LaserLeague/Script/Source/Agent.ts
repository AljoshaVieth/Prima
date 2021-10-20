import ƒ = FudgeCore;
namespace Script {
    export class Agent {
        mesh: ƒ.Node;
        transformMatrix: ƒ.Matrix4x4;
        velocity: number;
        acceleration: number;
        accelerationIncrease: number;
        maxSpeed: number;
        minSpeed: number;
        movedLastFrame: boolean;

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

        update() {
            this.handleAgentMovement();
        }

        private handleAgentMovement(): void {


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
    }
}