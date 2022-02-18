namespace TheJourneyOfY {

    export class GameOverEvent extends CustomEvent<boolean> {
        _gameWon: boolean;

        constructor(gameWon: boolean) {
            super("GameOverEvent", {detail: gameWon, "bubbles":true, "cancelable":false});
            this._gameWon = gameWon;
        }


        get gameWon(): boolean {
            return this._gameWon;
        }
    }
}