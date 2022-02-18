declare namespace TheJourneyOfY {
    import f = FudgeCore;
    class CameraMovementScript extends f.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        constructor();
        hndEvent: (_event: Event) => void;
        start(): void;
        update: (_event: Event) => void;
    }
}
declare namespace TheJourneyOfY {
    interface PlayerStat {
        name: string;
        score: number;
    }
    class DataHandler {
        loadJson(path: string): Promise<any>;
        parseStats(apiUrl: string): Promise<PlayerStat[]>;
    }
}
declare namespace TheJourneyOfY {
    class GameOverEvent extends CustomEvent<boolean> {
        _gameWon: boolean;
        constructor(gameWon: boolean);
        get gameWon(): boolean;
    }
}
declare namespace TheJourneyOfY {
    import f = FudgeCore;
    class GoalScript extends f.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        constructor();
        hndEvent: (_event: Event) => void;
        start(): void;
        update: (_event: Event) => void;
        private checkForPlayerPosition;
        private initAnim;
    }
}
declare namespace TheJourneyOfY {
    import f = FudgeCore;
    let player: Player;
    let jumpSound: f.Node;
}
declare namespace TheJourneyOfY {
    import f = FudgeCore;
    class Player extends f.Node {
        private ctrForward;
        private rigidbody;
        private isOnGround;
        private idealPosition;
        constructor();
        private initiatePositionAndScale;
        private update;
        private handlePlayerMovement;
    }
}
