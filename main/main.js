class Time {
    constructor(date) {
        this.date = date;
    }

    getDate(format) {
        const config = {
            YY: this.date.getFullYear(),
            MM: ('0' + (this.date.getMonth() + 1)).slice(-2),
            DD: ('0' + this.date.getDate()).slice(-2),
        };
        for (const key in config) {
            format = format.replace(key,config[key])
        }
        return format;
    }
    getTime(){
        let hour = ('0' + this.date.getHours()).slice(-2);
        let mimutes = ('0' + this.date.getMinutes()).slice(-2);
        return hour + '：'+mimutes;
    }
    getWeek(){
        let week = this.date.getDay();
        switch(week){
            case 1:
                week = '星期一';
                break;
            case 2:
                week = '星期二';
                break;
            case 3:
                week = '星期三';
                break;
            case 4:
                week = '星期四';
                break;
            case 5:
                week = '星期五';
                break;
            case 6:
                week = '星期六';
                break;
            case 0:
                week = '星期日';
                break;
        }
        return week;
    }
}
class CurrentTime extends Time{
    constructor() {
        super();
        this.date = new Date();
    }
    currentDate(){
        return super.getDate('YY.MM.DD');
    }
    currentTime(){
        return super.getTime();
    }
    currentWeek(){
        return super.getWeek();
    }
}


exports.Time = Time;
exports.CurrentTime=CurrentTime;