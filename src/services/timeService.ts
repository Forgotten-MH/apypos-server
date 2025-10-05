// timeService.ts
export class TimeService {
    //Source https://web.archive.org/web/20200928092521/https://hunters.mh-xr.jp/special/top/check#expand

    private now: Date;
    private relog: number;
    constructor() {
        this.now = new Date();  // Initialize 'now' once when the class is instantiated

        this.relog = Math.floor(new Date(this.now.getTime() + 24 * 60 * 60 * 1000).getTime() / 1000) % 100000
    }
    // Update the 'now' variable
    private updateNow(): void {
        this.now = new Date();
        this.now.getUTCHours
    }
    getCurrentTime(): number {
        this.updateNow();
        return this.now.getTime()
    }

    getOneDayTime(): number {
        return 3600 // base time based on config in server class. 
    }
    getTotalSecondsToday(): number {
        this.updateNow();
        return (this.now.getUTCHours() * 3600) + (this.now.getUTCMinutes() * 60) + this.now.getUTCSeconds();
    }
    getDateTime(): Date {
        this.updateNow();
        return new Date(this.now.getTime() * 1000)
    }
    getNowTime(): number {
        // Calculate "now_time" based on the custom "one_day_time"
        // Assuming "now_time" is the number of seconds past within the current hour of the day
        this.updateNow();
        return this.getTotalSecondsToday() % this.getOneDayTime()
    }

    getRelogTime(): number {
        return this.relog
    }
    getJapanTime(): Date {
        this.updateNow();
        // Calculate the Japan time by adding 9 hours to the current UTC time
        const japanOffset = 9 * 60 * 60 * 1000; // 9 hours in milliseconds
        return new Date(this.now.getTime() + japanOffset);
    }













}