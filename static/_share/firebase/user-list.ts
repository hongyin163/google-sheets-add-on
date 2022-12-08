import { doc, getFirestore, collection, getDocs, addDoc, query, where, setDoc } from 'firebase/firestore';
import app from '.'


const db = getFirestore(app);
const colName = 'user-list';
const col = collection(db, colName);
const enableLog = false;

async function existName(name: string): Promise<boolean> {
    try {
        const queryByUser = query(col, where("id", "==", name));
        const hisTpls = await getDocs(queryByUser);
        return hisTpls.size > 0
    } catch (e) {
        console.error("Error exec existName: ", e.message);
    }
    return false;
}

export async function addUser(name: string) {
    if (!enableLog) {
        return;
    }
    
    const exist = await existName(name);
    if (exist) {
        return;
    }
    return setDoc(doc(db, colName, name), {
        id: name,
        name,
    })
}