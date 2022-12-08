
class GoogleService {
    successCallback = null
    failureCallback = null
    showSuccessToast(message) {
        alert(message);
    }
    withSuccessHandler(fn) {
        this.successCallback = fn;
        return this;
    }
    withFailureHandler(fn) {
        this.failureCallback = fn;
        return this;
    }
    getSelectedLineValues() {
        const result = '[[["","[Tech] Censoring 数据导出优化","2022-06-05T16:00:00.000Z","2022-06-08T16:00:00.000Z","Reviewing","","","SPML-13617","PM","Chaopeng Guo","","","Need FE & QA","","","","","","","","","","","","",""]]]';
        this.successCallback(result);
    }
    addToMyTaskList() {
        setTimeout(() => {
            this.successCallback("{}");
        }, 2000);

    }
}


window.google = {
    script: {
        run: new GoogleService()
    }
}