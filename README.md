# Use React to develop Google sheets Add-on

In this project, We can use React to develop Google sheets Add-on, Every folder in static without prefix _ is a single page, You can develop your own web page in each project, then push code to Google Appscript .

## How to start up
```bash
yarn # install dependencies

yarn dev about # start up project in static folder,such as about

```

## Mock Google APIs 

You can mock Google API in `static/_share/mock/<name>` <name> is folder name in static,the name is the same as project name, every project can config their own mock configuration.

such as:
```js

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
        const result = '[[["","[Tech]数据导出优化","2022-06-05T16:00:00.000Z","2022-06-08T16:00:00.000Z","Reviewing","","","SPML-13617","PM","","","","Need FE & QA","","","","","","","","","","","","",""]]]';
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
```

## Build and Push code to Google Appscript

### Build
```
yarn run build # buld all project in static, output code to static/_gs
```
### Release

First you need to onfig your Google Appscript Script Id in `.clasp.json`

```
{"scriptId":"9UotQfck","rootDir":"./static/_gs"}

```
Login and push code.

```bash
yarn run gs:login # login to Google 

yarn run gs:push # push code in static/_gs to Google Appscript
```

Then you can login Google Appscript to release your Add-on.