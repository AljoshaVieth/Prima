declare namespace LaserLeague {
    import ƒ = FudgeCore;
    class CustomComponentScript extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        constructor();
        hndEvent: (_event: Event) => void;
    }
}
declare namespace LaserLeague {
    import ƒ = FudgeCore;
    class Laser {
        mesh: ƒ.Node;
        transformMatrix: ƒ.Matrix4x4;
        ctrForward: ƒ.Control;
        deltaTime: number;
        rotationSpeed: number;
        constructor(mesh: ƒ.Node, rotationSpeed: number);
        update(): void;
        rotate(): void;
        getBeam(index: number): ƒ.Node;
    }
}
declare namespace LaserLeague {
}
declare namespace LaserLeague {
    import ƒ = FudgeCore;
    class Agent extends ƒ.Node {
        constructor();
    }
}
declare namespace LaserLeague {
    import ƒ = FudgeCore;
    class RotatorComponent extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        rotationSpeed: number;
        private deltaTime;
        constructor();
        hndEvent: (_event: Event) => void;
        update: (_event: Event) => void;
    }
}
declare namespace LaserLeague {
    import ƒ = FudgeCore;
    class oldAgent {
        mesh: ƒ.Node;
        ctrForward: ƒ.Control;
        speed: number;
        transformMatrix: ƒ.Matrix4x4;
        rotationSpeed: number;
        private deltaTime;
        constructor(mesh: ƒ.Node, speed: number, rotation: number);
        update(): void;
        private handleAgentMovement;
        private handleAgentRotation;
        getTranslation(): ƒ.Vector3;
    }
}
