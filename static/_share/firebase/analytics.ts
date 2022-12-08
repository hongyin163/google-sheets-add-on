
// Import the functions you need from the SDKs you need
import { Analytics, getAnalytics, setUserId as _setUserId, setUserProperties as _setUserProperties, logEvent as _logEvent, CustomParams } from "firebase/analytics";
import app from './index'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { logByEvent } from './function-analyze'

export const setUserId = (id: string) => {
    let analytics: Analytics = getAnalytics(app);
    _setUserId(analytics, id)
}

export const setUserProperties = (params: CustomParams) => {
    let analytics: Analytics = getAnalytics(app);
    _setUserProperties(analytics, params);
}

export const logEvent = (eventName: string, eventParams?: any) => {
    console.log(eventName,eventParams);
    let analytics: Analytics = getAnalytics(app);
    _logEvent(analytics, eventName, eventParams);
    logByEvent(eventName, eventParams);
}