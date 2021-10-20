import ƒ = FudgeCore;
declare namespace Script {
    class Agent {
        mesh: ƒ.Node;
        transformMatrix: ƒ.Matrix4x4;
        velocity: number;
        acceleration: number;
        accelerationIncrease: number;
        maxSpeed: number;
        minSpeed: number;
        movedLastFrame: boolean;
        constructor(mesh: ƒ.Node, maxSpeed: number, accelerationIncrease: number);
        update(): void;
        private handleAgentMovement;
        private accelerate;
        private deAccelerate;
    }
}
declare namespace Script {
    import ƒ = FudgeCore;
    class CustomComponentScript extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        constructor();
        hndEvent: (_event: Event) => void;
    }
}
declare namespace Script {
}
