namespace Script {
    import ƒ = FudgeCore;

    export class Laser {

        mesh: ƒ.Node;
        transformMatrix: ƒ.Matrix4x4;
        ctrForward: ƒ.Control;
        deltaTime: number;
        rotationSpeed: number;

        constructor(mesh: ƒ.Node, rotationSpeed: number) {
            this.mesh = mesh;
            this.rotationSpeed = rotationSpeed;
            this.transformMatrix = mesh.getComponent(ƒ.ComponentTransform).mtxLocal;
        }

        update(): void {
            this.deltaTime = ƒ.Loop.timeFrameReal / 1000;
            this.rotate();
        }

        rotate(): void {
            this.transformMatrix.rotateZ(this.rotationSpeed*this.deltaTime);
        }

        getBeam(index: number): ƒ.Node {
            return this.mesh.getChildren()[0].getChildren()[0].getChildren()[index];
        }

    }
}