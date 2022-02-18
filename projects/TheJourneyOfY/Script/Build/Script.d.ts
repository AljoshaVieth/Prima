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
        submitScore(apiUrl: string, score: number, name: string): Promise<void>;
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
    function populateScoreTable(_playerStats: PlayerStat[]): void;
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
declare namespace TheJourneyOfY {
    import f = FudgeCore;
    class GameState extends f.Mutable {
        private static controller;
        private static instance;
        time: number;
        private constructor();
        static get(): GameState;
        protected reduceMutator(_mutator: f.Mutator): void;
    }
}
