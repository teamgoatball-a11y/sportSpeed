import { collection, query, orderBy, getDocs, doc, setDoc, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Fetches the latest active matches and aggregates them into a single Firestore document.
 * This reduces read costs by allowing the Home page to fetch exactly 1 document instead of 100.
 */
export const syncAggregatedMatches = async () => {
    try {
        console.log("Syncing aggregated matches to cache...");
        
        // 1. Fetch the latest 100 matches from the actual collection
        const q = query(collection(db, 'matches'), orderBy('createdAt', 'desc'), limit(100));
        const snapshot = await getDocs(q);
        
        const matches = snapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
        }));

        // 2. Save them into a single cache document
        const cacheRef = doc(db, 'cache', 'home_matches');
        
        // We stringify the payload if we want, but Firestore can store arrays of objects natively
        // As long as it's under 1MB, which 100 matches easily is.
        await setDoc(cacheRef, {
            lastUpdated: new Date().toISOString(),
            matches: matches
        });
        
        console.log("Successfully synced aggregated matches.");
        return true;
    } catch (error) {
        console.error("Failed to sync aggregated matches:", error);
        return false;
    }
};
