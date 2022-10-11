const db = require('../database')

class TimeController{
    static today = new Date();

    static getNowDate(){
        return `${this.today.getFullYear()}-${this.today.getMonth()+1}-${this.today.getDate()}`;
    }
    static getNowTime(){
        return `${this.today.getHours()}:${this.today.getMinutes()}:${this.today.getSeconds()}`
    }
    static getTomorrowDate(){
        const tomorrow = new Date(this.today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        return `${tomorrow.getFullYear()}-${tomorrow.getMonth()+1}-${tomorrow.getDate()}`;
    }
    static getYesterdayDate(){
        const tomorrow = new Date(this.today)
        tomorrow.setDate(tomorrow.getDate() - 1)
        return `${tomorrow.getFullYear()}-${tomorrow.getMonth()+1}-${tomorrow.getDate()}`;
    }
}

module.exports = TimeController;