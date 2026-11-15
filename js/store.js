// Saving progress. Uses the Max's Maths Firebase project only.
// Add ?demo=1 to the address to try the app without signing in (saves on this device only).
import { firebaseConfig } from '../firebase-config.js';

const DEMO = new URLSearchParams(location.search).has('demo');
const V = '10.12.2';
let fb = null, auth = null, db = null, uid = null;

async function loadFirebase() {
  if (fb) return fb;
  const [app, a, f] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`)
  ]);
  const appInst = app.initializeApp(firebaseConfig);
  auth = a.getAuth(appInst);
  try {
    db = f.initializeFirestore(appInst, { localCache: f.persistentLocalCache({ tabManager: f.persistentMultipleTabManager() }) });
  } catch (e) {
    db = f.getFirestore(appInst);
  }
  fb = { a, f };
  return fb;
}

export const isDemo = () => DEMO;

export async function watchAuth(cb) {
  if (DEMO) { uid = 'demo'; cb({ email: 'demo' }); return; }
  const { a } = await loadFirebase();
  a.onAuthStateChanged(auth, user => { uid = user ? user.uid : null; cb(user); });
}

export async function signIn(email, password) {
  const { a } = await loadFirebase();
  await a.setPersistence(auth, a.browserLocalPersistence);
  return a.signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function signOut() {
  if (DEMO) return;
  const { a } = await loadFirebase();
  return a.signOut(auth);
}

export function defaultPlayer() {
  return { stats: {}, rung: 0, cupFinal: false, trophy: false, parentPin: null, playedDays: [], createdAt: Date.now() };
}

export async function loadPlayer() {
  if (DEMO) {
    try { return { ...defaultPlayer(), ...JSON.parse(localStorage.getItem('demo_player') || '{}') }; }
    catch (e) { return defaultPlayer(); }
  }
  const { f } = fb;
  const snap = await f.getDoc(f.doc(db, 'players', uid));
  return snap.exists() ? { ...defaultPlayer(), ...snap.data() } : defaultPlayer();
}

export async function savePlayer(p) {
  if (DEMO) { localStorage.setItem('demo_player', JSON.stringify(p)); return; }
  const { f } = fb;
  await f.setDoc(f.doc(db, 'players', uid), JSON.parse(JSON.stringify(p)));
}

export async function addSession(s) {
  if (DEMO) {
    const all = JSON.parse(localStorage.getItem('demo_sessions') || '[]');
    all.push(s); localStorage.setItem('demo_sessions', JSON.stringify(all)); return;
  }
  const { f } = fb;
  await f.setDoc(f.doc(db, 'players', uid, 'sessions', String(s.started)), JSON.parse(JSON.stringify(s)));
}

export async function listSessions(n = 30) {
  if (DEMO) return JSON.parse(localStorage.getItem('demo_sessions') || '[]').sort((a, b) => b.started - a.started).slice(0, n);
  const { f } = fb;
  const q = f.query(f.collection(db, 'players', uid, 'sessions'), f.orderBy('started', 'desc'), f.limit(n));
  const snap = await f.getDocs(q);
  return snap.docs.map(d => d.data());
}
