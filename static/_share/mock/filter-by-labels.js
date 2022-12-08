
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
    filterTaskByLabels() {
        setTimeout(() => {
            this.successCallback(JSON.stringify('success'));
        }, 2000)
    }
    removeFilters() {
        setTimeout(() => {
            this.successCallback("{}");
        }, 2000);

    }
    extractLabels() {
        let labels = ["FE", "Listing Upload"];
        for (let i = 0; i < 50; i++) {
            labels.push('Listing' + i)
        }
        setTimeout(() => {
            this.successCallback(JSON.stringify(labels));
        }, 2000);
    }
}


window.google = {
    script: {
        run: new GoogleService()
    }
}