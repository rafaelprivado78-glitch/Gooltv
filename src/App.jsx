import { useState, useEffect, useRef, useCallback } from "react";

// ─── FIREBASE CONFIG ──────────────────────────────────────────────────────────
// Substitua com suas credenciais do Firebase Console (gratuito)
// firebase.google.com → Criar projeto → Web app → Copiar config
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDEMO_SUBSTITUA_COM_SUA_KEY",
  authDomain: "gooltv-demo.firebaseapp.com",
  projectId: "gooltv-demo",
  storageBucket: "gooltv-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef",
};

// ─── FIREBASE LOADER ─────────────────────────────────────────────────────────
let firebaseApp = null, firebaseAuth = null, firebaseDb = null;

const loadFirebase = async () => {
  if (firebaseApp) return { auth: firebaseAuth, db: firebaseDb };
  try {
    const [
      { initializeApp },
      { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged },
      { getFirestore, doc, getDoc, setDoc }
    ] = await Promise.all([
      import("https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"),
    ]);
    firebaseApp = initializeApp(FIREBASE_CONFIG);
    firebaseAuth = { instance: getAuth(firebaseApp), GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged };
    firebaseDb = { instance: getFirestore(firebaseApp), doc, getDoc, setDoc };
    return { auth: firebaseAuth, db: firebaseDb };
  } catch (e) {
    console.warn("Firebase não carregado — modo local ativo", e);
    return null;
  }
};

// ─── NETWORKS ────────────────────────────────────────────────────────────────
const NETWORKS = [
  { id:"cazé",      name:"Cazé TV",    icon:"⚡", color:"#00D4FF", bg:"#001A22" },
  { id:"getv",      name:"GE.tv",      icon:"🟢", color:"#00A651", bg:"#001A0D" },
  { id:"espn",      name:"ESPN",       icon:"🔴", color:"#CC0000", bg:"#1A0000" },
  { id:"sportv",    name:"SporTV",     icon:"📡", color:"#005EB8", bg:"#00081A" },
  { id:"premiere",  name:"Premiere",   icon:"👑", color:"#FFD700", bg:"#1A1400" },
  { id:"bandSports",name:"Band Sports",icon:"🔵", color:"#0066FF", bg:"#00081A" },
  { id:"tnt",       name:"TNT Sports", icon:"💥", color:"#FF4400", bg:"#1A0800" },
];
const netOf = (id) => NETWORKS.find(n => n.id === id) || NETWORKS[0];

// ─── TEAMS ───────────────────────────────────────────────────────────────────
const TEAMS_DB = {
  brasileirao: { label:"Brasileirão", icon:"🇧🇷", teams: [
    { id:"flamengo",     name:"Flamengo",      abbr:"FLA", emoji:"🔴⚫", color:"#E50914" },
    { id:"palmeiras",    name:"Palmeiras",     abbr:"PAL", emoji:"🟢",   color:"#00A651" },
    { id:"corinthians",  name:"Corinthians",   abbr:"COR", emoji:"⚫⚪",  color:"#CCCCCC" },
    { id:"saopaulo",     name:"São Paulo",     abbr:"SPF", emoji:"⚪🔴",  color:"#E50914" },
    { id:"atleticmg",    name:"Atlético-MG",   abbr:"CAM", emoji:"⚫⚪",  color:"#888"    },
    { id:"fluminense",   name:"Fluminense",    abbr:"FLU", emoji:"🔴🟢",  color:"#8B0000" },
    { id:"botafogo",     name:"Botafogo",      abbr:"BOT", emoji:"⭐⚫",  color:"#888"    },
    { id:"vasco",        name:"Vasco",         abbr:"VAS", emoji:"⚫⚪",  color:"#888"    },
    { id:"gremio",       name:"Grêmio",        abbr:"GRE", emoji:"🔵⚫",  color:"#005EB8" },
    { id:"internacional",name:"Internacional", abbr:"INT", emoji:"🔴",   color:"#E50914" },
    { id:"cruzeiro",     name:"Cruzeiro",      abbr:"CRU", emoji:"🔵⚪",  color:"#005EB8" },
    { id:"athletico",    name:"Athletico-PR",  abbr:"CAP", emoji:"🔴⚫",  color:"#E50914" },
    { id:"fortaleza",    name:"Fortaleza",     abbr:"FOR", emoji:"🔵🔴",  color:"#005EB8" },
    { id:"bahia",        name:"Bahia",         abbr:"BAH", emoji:"🔵🔴",  color:"#005EB8" },
  ]},
  europa: { label:"Europa", icon:"🌍", teams: [
    { id:"realmadrid",      name:"Real Madrid",       abbr:"RMA", emoji:"👑⚪", color:"#CCCCCC" },
    { id:"barcelona",       name:"Barcelona",         abbr:"BAR", emoji:"🔵🔴", color:"#A50044" },
    { id:"manchester_city", name:"Man City",          abbr:"MCI", emoji:"🔵",   color:"#6CABDD" },
    { id:"liverpool",       name:"Liverpool",         abbr:"LFC", emoji:"🔴",   color:"#E50914" },
    { id:"arsenal",         name:"Arsenal",           abbr:"ARS", emoji:"🔴⚪", color:"#E50914" },
    { id:"chelsea",         name:"Chelsea",           abbr:"CFC", emoji:"🔵",   color:"#034694" },
    { id:"psg",             name:"PSG",               abbr:"PSG", emoji:"🔵🔴", color:"#004170" },
    { id:"bayern",          name:"Bayern Munich",     abbr:"BMU", emoji:"🔴⚪", color:"#DC052D" },
    { id:"dortmund",        name:"Borussia Dortmund", abbr:"BVB", emoji:"🟡⚫", color:"#FDE100" },
    { id:"atletico",        name:"Atlético Madrid",   abbr:"ATM", emoji:"🔴⚪", color:"#CB3524" },
  ]}
};
const ALL_TEAMS = [...TEAMS_DB.brasileirao.teams, ...TEAMS_DB.europa.teams];
const findTeam = (id) => ALL_TEAMS.find(t => t.id === id);
const findTeamByName = (name) => {
  if (!name) return null;
  return ALL_TEAMS.find(t =>
    name.toLowerCase().includes(t.name.toLowerCase()) ||
    t.name.toLowerCase().includes(name.toLowerCase())
  );
};

const ALL_LEAGUES = ["Brasileirão Série A","Copa do Brasil","Libertadores","Champions League","Premier League","La Liga","Bundesliga"];

// ─── MOCK STREAMS ────────────────────────────────────────────────────────────
const MOCK_STREAMS = [
  { id:"1", network:"cazé",      title:"🔴 AO VIVO | Flamengo x Palmeiras | Brasileirão", channel:"Cazé TV",    videoId:"jfKfPfyJRdk", viewers:"312K", live:true, tags:["Brasileirão"], quality:["AUTO","1080p","720p","480p","360p"], thumbnail:"https://img.youtube.com/vi/jfKfPfyJRdk/maxresdefault.jpg", teams:["flamengo","palmeiras"] },
  { id:"2", network:"espn",      title:"LIVE | Champions League | Bayern x PSG",          channel:"ESPN Brasil", videoId:"5qap5aO4i9A", viewers:"1.2M", live:true, tags:["Champions League"], quality:["AUTO","1080p","720p","480p"], thumbnail:"https://img.youtube.com/vi/5qap5aO4i9A/maxresdefault.jpg", teams:["bayern","psg"] },
  { id:"3", network:"sportv",    title:"⚽ Premier League | Man City x Arsenal",          channel:"SporTV",      videoId:"DWcJFNfaw9c", viewers:"890K", live:true, tags:["Premier League"], quality:["AUTO","720p","480p","360p"], thumbnail:"https://img.youtube.com/vi/DWcJFNfaw9c/maxresdefault.jpg", teams:["manchester_city","arsenal"] },
  { id:"4", network:"premiere",  title:"👑 PREMIERE | Corinthians x São Paulo",           channel:"Premiere FC", videoId:"M7lc1UVf-VE", viewers:"540K", live:true, tags:["Brasileirão"], quality:["AUTO","1080p","720p","480p","360p"], thumbnail:"https://img.youtube.com/vi/M7lc1UVf-VE/maxresdefault.jpg", teams:["corinthians","saopaulo"] },
  { id:"5", network:"getv",      title:"🟢 GE.TV | Copa do Brasil | Athletico x Fortaleza",channel:"GE.tv",     videoId:"2Vv-BfVoq4g", viewers:"230K", live:true, tags:["Copa do Brasil"], quality:["AUTO","720p","480p"], thumbnail:"https://img.youtube.com/vi/2Vv-BfVoq4g/maxresdefault.jpg", teams:["athletico","fortaleza"] },
  { id:"6", network:"tnt",       title:"💥 Libertadores | Boca x River",                 channel:"TNT Sports",  videoId:"oHg5SJYRHA0", viewers:"780K", live:true, tags:["Libertadores"], quality:["AUTO","1080p","720p","480p","360p"], thumbnail:"https://img.youtube.com/vi/oHg5SJYRHA0/maxresdefault.jpg", teams:[] },
  { id:"7", network:"bandSports",title:"🔵 BAND | La Liga | Real Madrid x Barcelona",    channel:"Band Sports", videoId:"dQw4w9WgXcQ", viewers:"2.1M", live:true, tags:["La Liga"], quality:["AUTO","1080p","720p","480p"], thumbnail:"https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg", teams:["realmadrid","barcelona"] },
];

// ─── CLAUDE AI FETCH ──────────────────────────────────────────────────────────
const fetchGamesWithClaude = async () => {
  const today = new Date().toLocaleDateString("pt-BR");
  const prompt = `Hoje é ${today}. Retorne APENAS JSON válido (sem markdown) com jogos de futebol de hoje e próximos 7 dias. Prioridade: Brasileirão Série A, Copa do Brasil, Libertadores, Sul-Americana, Champions League, Premier League, La Liga, Bundesliga. Formato:
[{"id":"1","league":"Brasileirão Série A","leagueIcon":"🇧🇷","leagueColor":"#009B3A","leaguePriority":1,"home":"Time Casa","away":"Time Fora","homeAbbr":"ABR","awayAbbr":"ABR","date":"DD/MM","time":"HH:MM","status":"scheduled","homeScore":null,"awayScore":null,"minute":null,"statusLabel":"EM BREVE"}]
Status: scheduled/live/final. Mínimo 20 jogos. APENAS o JSON.`;
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, messages:[{role:"user",content:prompt}] })
  });
  const data = await res.json();
  const text = data.content?.[0]?.text || "[]";
  const games = JSON.parse(text.replace(/```json|```/g,"").trim());
  return games.map(g => ({ ...g, homeId:findTeamByName(g.home)?.id||"", awayId:findTeamByName(g.away)?.id||"" }));
};

// ─── STORAGE HELPERS (local + cloud) ─────────────────────────────────────────
const LOCAL_KEY = "gooltv_prefs";

const loadLocal = () => {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}"); } catch { return {}; }
};
const saveLocal = (data) => {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(data)); } catch {}
};

const saveToCloud = async (uid, data) => {
  const fb = await loadFirebase();
  if (!fb) return;
  const { db } = fb;
  await db.setDoc(db.doc(db.instance, "users", uid), data, { merge: true });
};

const loadFromCloud = async (uid) => {
  const fb = await loadFirebase();
  if (!fb) return null;
  const { db } = fb;
  const snap = await db.getDoc(db.doc(db.instance, "users", uid));
  return snap.exists() ? snap.data() : null;
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function GoolTV() {
  // Auth
  const [user, setUser] = useState(null); // { uid, name, email, photo }
  const [authLoading, setAuthLoading] = useState(false);
  const [showAccountPanel, setShowAccountPanel] = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle"); // idle | saving | saved | error

  // Games
  const [games, setGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const refreshTimer = useRef(null);
  const prevScores = useRef({});

  // Prefs (synced)
  const [favoriteTeam, setFavoriteTeam] = useState(null);
  const [favoriteLeague, setFavoriteLeague] = useState("Brasileirão Série A");
  const [watchHistory, setWatchHistory] = useState([]); // [{id, title, channel, thumb, watchedAt}]

  // UI
  const [notifPermission, setNotifPermission] = useState("default");
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [teamSearch, setTeamSearch] = useState("");
  const [toastMsg, setToastMsg] = useState(null);
  const toastTimer = useRef(null);

  const [streams] = useState(MOCK_STREAMS);
  const [selectedStream, setSelectedStream] = useState(null);
  const [activeNetwork, setActiveNetwork] = useState("all");
  const [tab, setTab] = useState("home");
  const [streamSearch, setStreamSearch] = useState("");
  const [gamesLeague, setGamesLeague] = useState("Todos");
  const [gamesTab, setGamesTab] = useState("proximos");

  // Player
  const [quality, setQuality] = useState("AUTO");
  const [volume, setVolume] = useState(85);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [playerLoading, setPlayerLoading] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const controlsTimer = useRef(null);
  const playerWrap = useRef(null);

  // ── Load local prefs on mount ──
  useEffect(() => {
    const local = loadLocal();
    if (local.favoriteTeam) setFavoriteTeam(local.favoriteTeam);
    if (local.favoriteLeague) setFavoriteLeague(local.favoriteLeague);
    if (local.watchHistory) setWatchHistory(local.watchHistory);
    if (local.onboardingDone) setShowOnboarding(false);
    if ("Notification" in window) setNotifPermission(Notification.permission);
  }, []);

  // ── Firebase auth listener ──
  useEffect(() => {
    loadFirebase().then(fb => {
      if (!fb) return;
      fb.auth.onAuthStateChanged(fb.auth.instance, async (firebaseUser) => {
        if (firebaseUser) {
          const u = { uid: firebaseUser.uid, name: firebaseUser.displayName, email: firebaseUser.email, photo: firebaseUser.photoURL };
          setUser(u);
          // Load cloud prefs
          const cloud = await loadFromCloud(firebaseUser.uid);
          if (cloud) {
            if (cloud.favoriteTeam) setFavoriteTeam(cloud.favoriteTeam);
            if (cloud.favoriteLeague) setFavoriteLeague(cloud.favoriteLeague);
            if (cloud.watchHistory) setWatchHistory(cloud.watchHistory);
            showToast("✅ Preferências sincronizadas!");
          }
        } else {
          setUser(null);
        }
      });
    });
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 4000);
  };

  // ── Save prefs (local + cloud) ──
  const savePrefs = useCallback(async (prefs) => {
    const current = loadLocal();
    const updated = { ...current, ...prefs };
    saveLocal(updated);
    if (user) {
      setSyncStatus("saving");
      try {
        await saveToCloud(user.uid, prefs);
        setSyncStatus("saved");
        setTimeout(() => setSyncStatus("idle"), 2000);
      } catch {
        setSyncStatus("error");
      }
    }
  }, [user]);

  // ── Update prefs when changed ──
  useEffect(() => { if (favoriteTeam !== null) savePrefs({ favoriteTeam }); }, [favoriteTeam]);
  useEffect(() => { savePrefs({ favoriteLeague }); }, [favoriteLeague]);
  useEffect(() => { if (watchHistory.length) savePrefs({ watchHistory: watchHistory.slice(0, 20) }); }, [watchHistory]);

  // ── Google sign in ──
  const signInGoogle = async () => {
    setAuthLoading(true);
    try {
      const fb = await loadFirebase();
      if (!fb) { showToast("⚠️ Configure o Firebase para ativar login"); setAuthLoading(false); return; }
      const provider = new fb.auth.GoogleAuthProvider();
      await fb.auth.signInWithPopup(fb.auth.instance, provider);
      showToast("👋 Bem-vindo!");
    } catch (e) {
      showToast("❌ Erro no login. Tente novamente.");
    }
    setAuthLoading(false);
  };

  const signOutUser = async () => {
    const fb = await loadFirebase();
    if (fb) await fb.auth.signOut(fb.auth.instance);
    setUser(null);
    setShowAccountPanel(false);
    showToast("👋 Até logo!");
  };

  // ── Load games ──
  const loadGames = useCallback(async () => {
    setGamesLoading(true);
    try {
      const result = await fetchGamesWithClaude();
      if (favoriteTeam) {
        result.forEach(game => {
          if (game.status === "live") {
            const prev = prevScores.current[game.id];
            const team = findTeam(favoriteTeam);
            if (prev && team) {
              const isHome = game.homeId === favoriteTeam;
              const isAway = game.awayId === favoriteTeam;
              if ((isHome && game.homeScore > prev.home) || (isAway && game.awayScore > prev.away)) {
                if (Notification.permission === "granted") new Notification(`⚽ GOL DO ${team.name.toUpperCase()}!`, { body:`${game.home} ${game.homeScore}x${game.awayScore} ${game.away}` });
                showToast(`⚽ GOOOL! ${team.name} marcou!`);
              }
            }
            prevScores.current[game.id] = { home: game.homeScore, away: game.awayScore };
          }
        });
      }
      setGames(result);
      setLastUpdated(new Date());
    } catch {}
    setGamesLoading(false);
  }, [favoriteTeam]);

  useEffect(() => {
    loadGames();
    refreshTimer.current = setInterval(loadGames, 5 * 60 * 1000);
    return () => clearInterval(refreshTimer.current);
  }, []);

  // ── Derived ──
  const filteredStreams = activeNetwork === "all" ? streams : streams.filter(s => s.network === activeNetwork);
  const searchedStreams = streamSearch.trim() ? filteredStreams.filter(s => s.title.toLowerCase().includes(streamSearch.toLowerCase())) : filteredStreams;
  const favTeam = findTeam(favoriteTeam);
  const liveCount = games.filter(g => g.status === "live").length;
  const leagueNames = ["Todos", ...new Set(games.map(g => g.league))];
  const filteredGames = games.filter(g => {
    const lm = gamesLeague === "Todos" || g.league === gamesLeague;
    const sm = gamesTab === "proximos" ? g.status !== "final" : g.status === "final";
    return lm && sm;
  }).sort((a,b) => (a.leaguePriority||99) - (b.leaguePriority||99));
  const myTeamGames = favTeam ? games.filter(g => g.homeId === favoriteTeam || g.awayId === favoriteTeam) : [];
  const myTeamStreams = favTeam ? streams.filter(s => s.teams?.includes(favoriteTeam)) : [];
  const filteredTeamSearch = teamSearch.trim() ? ALL_TEAMS.filter(t => t.name.toLowerCase().includes(teamSearch.toLowerCase())) : null;

  // ── Player ──
  const showCtrlsTemporarily = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => { setShowControls(false); setShowQualityMenu(false); }, 3500);
  }, []);

  const openStream = (stream) => {
    setSelectedStream(stream); setQuality("AUTO"); setIframeKey(k => k+1);
    setPlayerLoading(true); setTab("player");
    setShowControls(true); setTimeout(() => setShowControls(false), 4000);
    // Save to history
    const entry = { id:stream.id, title:stream.title, channel:stream.channel, thumbnail:stream.thumbnail, watchedAt: new Date().toISOString() };
    setWatchHistory(prev => [entry, ...prev.filter(h => h.id !== stream.id)].slice(0, 20));
  };

  const changeQuality = (q) => { setQuality(q); setShowQualityMenu(false); setPlayerLoading(true); setIframeKey(k=>k+1); showCtrlsTemporarily(); };
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) { playerWrap.current?.requestFullscreen?.(); setFullscreen(true); }
    else { document.exitFullscreen?.(); setFullscreen(false); }
  };

  const volFill = muted ? 0 : volume;
  const embedUrl = selectedStream ? `https://www.youtube.com/embed/${selectedStream.videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1` : "";

  const finishOnboarding = () => {
    setShowOnboarding(false);
    savePrefs({ onboardingDone: true });
  };

  return (
    <div style={{ fontFamily:"'Rajdhani','Helvetica Neue',sans-serif", background:"#06060E", color:"#F0F0FA", minHeight:"100vh", maxWidth:430, margin:"0 auto", position:"relative" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Oswald:wght@500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}::-webkit-scrollbar{display:none;}
        @keyframes livePulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.8)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes onboardSlide{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes slideInRight{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:translateX(0)}
