import { Template } from "../types/template";

export const getLocalTpl = (): Template => {
    const tpl = window.localStorage.getItem('weekly-report-template');
    if (tpl) {
        return JSON.parse(tpl);
    }
    return null;
}
export const setLocalTpl = (tpl: Template) => {
    window.localStorage.setItem('weekly-report-template', JSON.stringify(tpl));
}