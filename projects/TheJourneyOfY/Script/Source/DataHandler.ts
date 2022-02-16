namespace TheJourneyOfY {

    export interface PlayerStat {
        name: string;
        score: number;
    }

    export class DataHandler {


        async loadJson(path: string) {
            try {
                const response = await fetch(path);
                return await response.json();
            } catch (error) {
                return error;
            }
        }

        async parseStats(apiUrl: string) {
            let stats = await this.loadJson(apiUrl + "?mode=get");
            let playerStats: PlayerStat[] = [];
            for (let i = 0; i < stats.length; i++) {
                playerStats[i] = stats[i];
            }
            return playerStats;
        }


    }
}