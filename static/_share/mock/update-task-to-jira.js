
class GoogleService {
    successCallback = null
    failureCallback = null
    showSuccessToast(message){
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
        const result = '[[["Tech","[Tech]Sort out  business flow and system architecture ","请问","滴滴","Developing","","","15420","PM","","","","","","","","Tech","","","","","","","","",""]]]';       
        this.successCallback(result);
    }
    importSubtaskGroupsByJson(params) {
        this.successCallback('success');
    }
}


window.google = {}
window.google.script = {}
window.google.script.run = new GoogleService()