
class GoogleService {
    callback = null
    withSuccessHandler(fn) {
        this.callback = fn;
        return this;
    }
    getSelectedLineValues() {
        const result = '[[["3 Aug通过初/终评","Improve Bump UX in APP","2022-08-21T16:00:00.000Z","2022-08-31T16:00:00.000Z","PRD Signoffed","22Q3规划内","SPML-14650","-","PM","Fanghua Wu","","","","","","","","","","","","","","","",""]]]'
        this.callback(result);
    }
}


window.google = {}
window.google.script = {}
window.google.script.run = new GoogleService()