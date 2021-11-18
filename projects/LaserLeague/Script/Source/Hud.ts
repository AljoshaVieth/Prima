namespace LaserLeague {
    import ƒ = FudgeCore;
    import ƒui = FudgeUserInterface; //TODO validate link to Fudge
  
    class GameState extends ƒ.Mutable {
      public hits: number = 0;
      protected reduceMutator(_mutator: ƒ.Mutator): void {/* */ }
    }
  
    export let gameState: GameState = new GameState();
  
    export class Hud {
      private static controller: ƒui.Controller;
  
      public static start(): void {
        console.log("HUD started");
        let domHud: HTMLDivElement = document.querySelector("#Hud");
        Hud.controller = new ƒui.Controller(gameState, domHud);
        Hud.controller.updateUserInterface();
      }
    }
  }