namespace TheYourneyOfY {

    export interface Stats {
        playerstats: PlayerStat[];
    }
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

        async parseStats(apiUrl: string){
            let stats: string = await this.loadJson(apiUrl);
            let parsedStats : Array<PlayerStat> = JSON.parse(stats);
           return parsedStats;
        }


    }
}