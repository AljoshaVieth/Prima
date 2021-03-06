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
            populateScoreTable(playerStats);
            return playerStats;
        }

        async submitScore(apiUrl: string, score: number, name: string) {
            console.log("Submitting score: name=" + name + " score=" + score + " url=" + apiUrl + "?mode=insert")
            let formData: FormData = new FormData();
            formData.append('name', name);
            formData.append('score', score.toFixed(2));
            let query: URLSearchParams = new URLSearchParams(<any>formData);
            await fetch(apiUrl + "?mode=insert&" + query);
        }
    }
}