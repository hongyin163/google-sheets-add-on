
class GoogleService {
    successCallback = null
    failureCallback = null
    withSuccessHandler(fn) {
        this.successCallback = fn;
        return this;
    }
    withFailureHandler(fn) {
        this.failureCallback = fn;
        return this;
    }
    getSelectedLineValues() {
        const result = '[[["","[Tech]  数据导出优化","2022-06-05T16:00:00.000Z","2022-06-08T16:00:00.000Z","Reviewing","","","SPML-13617","PM","","","","Need FE & QA","","","","","","","","","","","","",""]]]';       
        this.successCallback(result);
    }
    importSubtaskGroupsByJson(params) {
        this.successCallback('success');
    }
}


window.google = {}
window.google.script = {}
window.google.script.run = new GoogleService()