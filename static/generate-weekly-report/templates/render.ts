import ejs from 'ejs'
import { Task } from '../../_share/types/global';
import defaultTpl from './default'
export default function render(tpl: string, tasks: Task[]=[]) {
    try{ 
        const template = tpl || defaultTpl;
        return ejs.render(template, { tasks });
    }catch(err){
        return err.message;
    }
}