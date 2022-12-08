import { doc, getFirestore, collection, addDoc, setDoc } from 'firebase/firestore';
import app from '../firebase';
import { fetchUserInfo, UserInfo } from '../lib/auth';
import format from 'date-fns/format';

const db = getFirestore(app);
const colName = 'function-analyze';
const col = collection(db, colName);
const enableLog = false;

let userInfo: UserInfo;

export const logByEvent = async (event: string, params: any = {}) => {
    if (!enableLog) {
        return;
    }

    if (!userInfo) {
        userInfo = await fetchUserInfo();
    }

    return setDoc(doc(db, colName, `${event}_${Date.now()}`), {
        event,
        user: userInfo.username,
        params,
        timstamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
    })
}