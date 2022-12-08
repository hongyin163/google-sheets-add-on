import { doc, getFirestore, collection, getDocs, addDoc, query, where, setDoc } from 'firebase/firestore';
import { Template } from '../types/template';
import app from '../../_share/firebase'
// Follow this pattern to import other Firebase services
// import { } from 'firebase/<service>';


const db = getFirestore(app);
const tplsColName = 'weekly-report-tpls';
const tplsCol = collection(db, tplsColName);
// Get a list of cities from your database
export async function getTpls() {
    const citySnapshot = await getDocs(tplsCol);
    const cityList = citySnapshot.docs.map(doc => doc.data());
    return cityList;
}

export async function getTplByUser(user: string): Promise<Template> {
    const queryByUser = query(tplsCol, where("user", "==", user));
    const hisTpls = await getDocs(queryByUser);
    if (hisTpls.size <= 0) {
        return null;
    }
    return hisTpls.docs.map(doc => doc.data())[0] as Template;
}

async function existName(name: string, user: string): Promise<boolean> {
    try {
        const queryByUser = query(tplsCol, where("name", "==", name), where("user", "!=", user));
        const hisTpls = await getDocs(queryByUser);
        return hisTpls.size > 0
    } catch (e) {
        console.error("Error exec existName: ", e.message);
    }
    return false;
}

export async function addTpl(name: string, template: string, user: string) {
    const exist = await existName(name, user);
    if (exist) {
        throw new Error(`${name} already exists`);
    }
    const queryByUser = query(tplsCol, where("user", "==", user));
    const hisTpls = await getDocs(queryByUser);
    if (hisTpls.size <= 0) {
        await setDoc(doc(db, tplsColName, user), {
            name,
            template,
            user
        })
    } else {
        await setDoc(doc(db, tplsColName, user), {
            name,
            template,
            user
        })
    }
}