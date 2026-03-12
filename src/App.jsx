import { useState, useEffect, useRef, useCallback } from "react";

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

const TEAMS = [
  { id:"flamengo",     name:"Flamengo",      abbr:"FLA", emoji:"🔴⚫", color:"#E50914" },
  { id:"palmeiras",    name:"Palmeiras",     abbr:"PAL", emoji:"🟢",   color:"#00A651" },
  { id:"corinthians",  name:"Corinthians",   abbr:"COR", emoji:"⚫⚪",  color:"#CCCCCC" },
  { id:"saopaulo",     name:"São Paulo",     abbr:"SPF", emoji:"⚪🔴",  color:"#E50914" },
  { id:"fluminense",   name:"Fluminense",    abbr:"FLU", emoji:"🔴🟢",  color:"#8B0000" },
  { id:"botafogo",     name:"Botafogo",      abbr:"BOT", emoji:"⭐⚫",  color:"#888"    },
  { id:"vasco",        name:"Vasco",         abbr:"VAS", emoji:"⚫⚪",  color:"#888"    },
  { id:"gremio",       name:"Grêmio",        abbr:"GRE", emoji:"🔵⚫",  color:"#005EB8" },
  { id:"atleticmg",    name:"Atlético-MG",   abbr:"CAM", emoji:"⚫⚪",  color:"#888"    },
  { id:"internacional",name:"Internacional", abbr:"INT", emoji:"🔴",   color:"#E50914" },
  { id:"realmadrid",   name:"Real Madrid",   abbr:"RMA", emoji:"👑⚪",  color:"#CCCCCC" },
  { id:"barcelona",    name:"Barcelona",     abbr:"BAR", emoji:"🔵🔴",  color:"#A50044" },
  { id:"manchester_city",name:"Man City",    abbr:"MCI", emoji:"🔵",   color:"#6CABDD" },
  { id:"liverpool",    name:"Liverpool",     abbr:"LFC", emoji:"🔴",   color:"#E50914" },
  { id:"arsenal",      name:"Arsenal",       abbr:"ARS", emoji:"🔴⚪",  color:"#E50914" },
  { id:"chelsea",      name:"Chelsea",       abbr:"CFC", emoji:"🔵",   color:"#034694" },
  { id:"psg",          name:"PSG",           abbr:"PSG", emoji:"🔵🔴",  color:"#004170" },
  { id:"bayern",       name:"Bayern Munich", abbr:"BMU", emoji:"🔴⚪",  color:"#DC052D" },
  { id:"dortmund",     name:"Borussia Dortmund",abbr:"BVB",emoji:"🟡⚫",color:"#FDE100"},
  { id:"atletico",     name:"Atlético Madrid",abbr:"ATM",emoji:"🔴⚪",  color:"#CB3524" },
];
const findTeam = (id) => TEAMS.find(t => t.id === id);
const findTeamByName = (name) => {
  if (!name) return null;
  return TEAMS.find(t => name.toLowerCase().includes(t.name.toLowerCase()) || t.name.toLowerCase().includes(name.toLowerCase()));
};

const STREAMS = [
  { id:"1", network:"cazé",      title:"🔴 AO VIVO | Flamengo x Palmeiras | Brasileirão", channel:"Cazé TV",    videoId:"jfKfPfyJRdk", viewers:"312K", tags:["Brasileirão"], quality:["AUTO","1080p","720p","480p","360p"], thumbnail:"https://img.youtube.com/vi/jfKfPfyJRdk/maxresdefault.jpg", teams:["flamengo","palmeiras"] },
  { id:"2", network:"espn",      title:"LIVE | Champions League | Bayern x PSG",          channel:"ESPN Brasil", videoId:"5qap5aO4i9A", viewers:"1.2M", tags:["Champions League"], quality:["AUTO","1080p","720p","480p"], thumbnail:"https://img.youtube.com/vi/5qap5aO4i9A/maxresdefault.jpg", teams:["bayern","psg"] },
  { id:"3", network:"sportv",    title:"⚽ Premier League | Man City x Arsenal",          channel:"SporTV",      videoId:"DWcJFNfaw9c", viewers:"890K", tags:["Premier League"], quality:["AUTO","720p","480p","360p"], thumbnail:"https://img.youtube.com/vi/DWcJFNfaw9c/maxresdefault.jpg", teams:["manchester_city","arsenal"] },
  { id:"4", network:"premiere",  title:"👑 PREMIERE | Corinthians x São Paulo",           channel:"Premiere FC", videoId:"M7lc1UVf-VE", viewers:"540K", tags:["Brasileirão"], quality:["AUTO","1080p","720p","480p","360p"], thumbnail:"https://img.youtube.com/vi/M7lc1UVf-VE/maxresdefault.jpg", teams:["corinthians","saopaulo"] },
  { id:"5", network:"getv",      title:"🟢 Copa do Brasil | Athletico x Fortaleza",       channel:"GE.tv",       videoId:"2Vv-BfVoq4g", viewers:"230K", tags:["Copa do Brasil"], quality:["AUTO","720p","480p"], thumbnail:"https://img.youtube.com/vi/2Vv-BfVoq4g/maxresdefault.jpg", teams:[] },
  { id:"6", network:"tnt",       title:"💥 Libertadores | Boca x River",                 channel:"TNT Sports",  videoId:"oHg5SJYRHA0", viewers:"780K", tags:["Libertadores"], quality:["AUTO","1080p","720p","480p","360p"], thumbnail:"https://img.youtube.com/vi/oHg5SJYRHA0/maxresdefault.jpg", teams:[] },
  { id:"7", network:"bandSports",title:"🔵 La Liga | Real Madrid x Barcelona",           channel:"Band Sports", videoId:"dQw4w9WgXcQ", viewers:"2.1M", tags:["La Liga"], quality:["AUTO","1080p","720p","480p"], thumbnail:"https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg", teams:["realmadrid","barcelona"] },
];

const fetchGamesWithClaude = async () => {
  const today = new Date().toLocaleDateString("pt-BR");
  const prompt = `Hoje é ${today}. Retorne APENAS JSON válido (sem markdown) com jogos de futebol de hoje e próximos 7 dias. Prioridade: Brasileirão Série A, Copa do Brasil, Libertadores, Champions League, Premier League, La Liga, Bundesliga. Formato:
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
export default function GoolTV() {
  const [games, setGames] = useState([]);
  const [gamesLoading, setGamesLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const refreshTimer = useRef(null);
  const prevScores = useRef({});
  const [favoriteTeam, setFavoriteTeam] = useState(null);
  const [notifPermission, setNotifPermission] = useState("default");
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [teamSearch, setTeamSearch] = useState("");
  const [toastMsg, setToastMsg] = useState(null);
  const toastTimer = useRef(null);
  const [selectedStream, setSelectedStream] = useState(null);
  const [activeNetwork, setActiveNetwork] = useState("all");
  const [tab, setTab] = useState("home");
  const [streamSearch, setStreamSearch] = useState("");
  const [gamesLeague, setGamesLeague] = useState("Todos");
  const [gamesTab, setGamesTab] = useState("proximos");
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

  useEffect(() => {
    if ("Notification" in window) setNotifPermission(Notification.permission);
  }, []);

  const showToast = (msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 4000);
  };

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
    } catch(e) { console.error(e); }
    setGamesLoading(false);
  }, [favoriteTeam]);

  useEffect(() => {
    loadGames();
    refreshTimer.current = setInterval(loadGames, 5 * 60 * 1000);
    return () => clearInterval(refreshTimer.current);
  }, []);

  const filteredStreams = activeNetwork === "all" ? STREAMS : STREAMS.filter(s => s.network === activeNetwork);
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
  const myTeamStreams = favTeam ? STREAMS.filter(s => s.teams?.includes(favoriteTeam)) : [];
  const filteredTeamSearch = teamSearch.trim() ? TEAMS.filter(t => t.name.toLowerCase().includes(teamSearch.toLowerCase())) : null;

  const showCtrlsTemporarily = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => { setShowControls(false); setShowQualityMenu(false); }, 3500);
  }, []);

  const openStream = (stream) => {
    setSelectedStream(stream); setQuality("AUTO"); setIframeKey(k => k+1);
    setPlayerLoading(true); setTab("player");
    setShowControls(true); setTimeout(() => setShowControls(false), 4000);
  };

  const changeQuality = (q) => { setQuality(q); setShowQualityMenu(false); setPlayerLoading(true); setIframeKey(k=>k+1); showCtrlsTemporarily(); };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) { playerWrap.current?.requestFullscreen?.(); setFullscreen(true); }
    else { document.exitFullscreen?.(); setFullscreen(false); }
  };

  const volFill = muted ? 0 : volume;
  const embedUrl = selectedStream ? `https://www.youtube.com/embed/${selectedStream.videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1` : "";
  const finishOnboarding = ()
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
        .live-pill{display:inline-flex;align-items:center;gap:5px;background:#E50914;color:#fff;font-size:9px;font-weight:700;letter-spacing:.12em;padding:3px 8px;border-radius:3px;}
        .live-dot{width:6px;height:6px;border-radius:50%;background:#fff;animation:livePulse 1.2s ease infinite;}
        .stream-card{border-radius:12px;overflow:hidden;background:#0C0C18;border:1px solid #111;cursor:pointer;transition:transform .15s,border-color .15s;animation:fadeUp .3s ease both;}
        .stream-card:active{transform:scale(.975);}.stream-card:hover{border-color:#E50914;}
        .net-chip{display:flex;align-items:center;gap:5px;padding:7px 13px;border-radius:8px;border:1.5px solid #111;background:transparent;font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;color:#444;cursor:pointer;white-space:nowrap;transition:all .15s;flex-shrink:0;}
        .tab-btn{flex:1;padding:10px 0 20px;background:none;border:none;font-family:'Rajdhani',sans-serif;font-size:10px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#2A2A3A;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:4px;transition:color .2s;}
        .tab-btn.active{color:#E50914;}.tab-icon{font-size:21px;}
        .search-wrap{display:flex;align-items:center;gap:10px;background:#0C0C18;border:1.5px solid #111;border-radius:10px;padding:10px 14px;transition:border-color .2s;}
        .search-wrap:focus-within{border-color:#E50914;}
        .search-wrap input{flex:1;background:none;border:none;outline:none;color:#F0F0FA;font-family:'Rajdhani',sans-serif;font-size:14px;font-weight:500;}
        .search-wrap input::placeholder{color:#222;}
        .player-overlay{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:space-between;pointer-events:none;transition:opacity .35s ease;}
        .player-overlay.visible{opacity:1;pointer-events:all;}.player-overlay.hidden{opacity:0;}
        .ctrl-gradient-top{background:linear-gradient(180deg,rgba(0,0,0,.8),transparent);padding:14px 16px 32px;}
        .ctrl-gradient-bottom{background:linear-gradient(0deg,rgba(0,0,0,.88),transparent);padding:32px 16px 14px;}
        .ctrl-btn{display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.12);backdrop-filter:blur(8px);border:none;color:#fff;cursor:pointer;font-size:17px;transition:background .15s;}
        .ctrl-btn:hover{background:rgba(255,255,255,.22);}
        .vol-track{width:100%;height:4px;border-radius:2px;background:#ffffff1a;position:relative;cursor:pointer;}
        .vol-fill{height:100%;border-radius:2px;background:#E50914;pointer-events:none;}
        .vol-thumb{position:absolute;top:50%;transform:translate(-50%,-50%);width:14px;height:14px;border-radius:50%;background:#fff;pointer-events:none;}
        input[type=range].vol-input{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;margin:0;-webkit-appearance:none;}
        .quality-menu{position:absolute;bottom:60px;right:16px;background:rgba(8,8,18,.97);border:1px solid #1A1A2A;border-radius:10px;overflow:hidden;min-width:120px;animation:slideUp .2s ease;z-index:20;}
        .quality-item{display:flex;align-items:center;justify-content:space-between;padding:11px 16px;font-size:13px;font-weight:600;cursor:pointer;color:#888;transition:background .12s,color .12s;border-bottom:1px solid #0F0F1C;}
        .quality-item:last-child{border-bottom:none;}.quality-item:hover{background:#14141E;color:#fff;}.quality-item.active{color:#E50914;}
        .quality-badge{font-size:9px;font-weight:700;color:#E50914;background:rgba(229,9,20,.12);padding:2px 6px;border-radius:4px;}
        .game-card{background:#0C0C18;border:1px solid #111;border-radius:12px;padding:14px 16px;animation:fadeUp .25s ease both;}
        .seg-btn{flex:1;padding:8px 0;background:none;border:none;font-family:'Rajdhani',sans-serif;font-size:12px;font-weight:700;letter-spacing:.06em;cursor:pointer;border-bottom:2px solid transparent;transition:all .15s;color:#333;}
        .seg-btn.active{color:#E50914;border-bottom-color:#E50914;}
        .league-chip{padding:6px 13px;border-radius:20px;border:1.5px solid #111;background:transparent;font-family:'Rajdhani',sans-serif;font-size:11px;font-weight:700;color:#444;cursor:pointer;white-space:nowrap;transition:all .15s;}
        .league-chip.active{background:#E50914;border-color:#E50914;color:#fff;}
        .team-card{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:12px;background:#0C0C18;border:2px solid #111;cursor:pointer;transition:all .2s;animation:fadeUp .2s ease both;}
        .team-card:hover{border-color:#333;}
        .onboard-btn{width:100%;padding:14px;border-radius:12px;border:none;font-family:'Oswald',sans-serif;font-size:15px;font-weight:600;letter-spacing:.08em;cursor:pointer;transition:all .15s;}
      `}</style>

      {toastMsg && (
        <div style={{ position:"fixed",bottom:90,left:"50%",transform:"translateX(-50%)",background:"#1A1A2A",border:"1px solid #2A2A3A",borderRadius:12,padding:"12px 20px",fontSize:13,fontWeight:700,zIndex:999,whiteSpace:"nowrap",animation:"toastIn .3s ease",boxShadow:"0 8px 32px rgba(0,0,0,.6)" }}>
          {toastMsg}
        </div>
      )}

      {showOnboarding && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.96)",zIndex:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"flex-end",padding:"0 0 40px" }}>
          {onboardingStep===0&&(
            <div style={{ width:"100%",maxWidth:430,padding:"0 24px",animation:"onboardSlide .4s ease" }}>
              <div style={{ textAlign:"center",marginBottom:36 }}>
                <div style={{ fontSize:70,marginBottom:14 }}>⚽</div>
                <div style={{ fontFamily:"'Oswald',sans-serif",fontSize:42,fontWeight:700 }}>
                  <span style={{ color:"#E50914" }}>GOOL</span>TV
                </div>
                <div style={{ fontSize:14,color:"#555",marginTop:10,lineHeight:1.7 }}>
                  Futebol ao vivo do seu jeito.<br/>
                  <span style={{ color:"#009B3A",fontWeight:700 }}>Brasileirão sempre primeiro.</span>
                </div>
              </div>
              <button className="onboard-btn" onClick={()=>setOnboardingStep(1)} style={{ background:"#E50914",color:"#fff",marginBottom:12 }}>COMEÇAR</button>
              <button className="onboard-btn" onClick={finishOnboarding} style={{ background:"transparent",color:"#444",border:"1px solid #222",fontSize:13 }}>Pular</button>
            </div>
          )}
          {onboardingStep===1&&(
            <div style={{ width:"100%",maxWidth:430,padding:"0 20px",maxHeight:"85vh",display:"flex",flexDirection:"column" }}>
              <div style={{ textAlign:"center",marginBottom:14,flexShrink:0 }}>
                <div style={{ fontSize:11,fontWeight:700,color:"#E50914",letterSpacing:".15em",marginBottom:6 }}>PASSO 1 DE 2</div>
                <div style={{ fontFamily:"'Oswald',sans-serif",fontSize:22,fontWeight:700 }}>Qual time você torce?</div>
              </div>
              <div className="search-wrap" style={{ marginBottom:12,flexShrink:0 }}>
                <span style={{ opacity:.3 }}>🔍</span>
                <input placeholder="Buscar time..." value={teamSearch} onChange={e=>setTeamSearch(e.target.value)}/>
              </div>
              <div style={{ overflowY:"auto",flex:1,paddingBottom:8,display:"flex",flexDirection:"column",gap:8 }}>
                {(filteredTeamSearch||TEAMS).map((team,i)=>(
                  <div key={team.id} className="team-card" style={{ animationDelay:`${i*.03}s`,borderColor:favoriteTeam===team.id?team.color:"#111",background:favoriteTeam===team.id?`${team.color}15`:"#0C0C18" }}
                    onClick={()=>{ setFavoriteTeam(team.id); setOnboardingStep(2); }}>
                    <div style={{ width:42,height:42,borderRadius:10,background:`${team.color}15`,border:`1px solid ${team.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>{team.emoji}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:14,fontWeight:700 }}>{team.name}</div>
                      <div style={{ fontSize:11,color:"#444",marginTop:2 }}>{team.abbr}</div>
                    </div>
                    {favoriteTeam===team.id&&<div style={{ color:team.color,fontSize:18 }}>✓</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
          {onboardingStep===2&&(
            <div style={{ width:"100%",maxWidth:430,padding:"0 24px",animation:"onboardSlide .4s ease" }}>
              <div style={{ textAlign:"center",marginBottom:24 }}>
                <div style={{ fontSize:11,fontWeight:700,color:"#E50914",letterSpacing:".15em",marginBottom:8 }}>PASSO 2 DE 2</div>
                <div style={{ fontSize:56,marginBottom:12 }}>🔔</div>
                <div style={{ fontFamily:"'Oswald',sans-serif",fontSize:20,fontWeight:700,marginBottom:8 }}>Ativar alertas de gol?</div>
                <div style={{ fontSize:13,color:"#555",lineHeight:1.6 }}>Quando o <span style={{ color:favTeam?.color,fontWeight:700 }}>{favTeam?.name}</span> marcar, você recebe na hora!</div>
              </div>
              <button className="onboard-btn" onClick={async()=>{ const r=await Notification.requestPermission(); setNotifPermission(r); if(r==="granted") showToast(`🔔 Alertas do ${favTeam?.name} ativados!`); finishOnboarding(); }} style={{ background:"#E50914",color:"#fff",marginBottom:12 }}>🔔 SIM, QUERO ALERTAS!</button>
              <button className="onboard-btn" onClick={finishOnboarding} style={{ background:"transparent",color:"#444",border:"1px solid #222",fontSize:13 }}>Agora não</button>
            </div>
          )}
        </div>
      )}

      <div style={{ padding:"50px 18px 14px",background:"linear-gradient(180deg,#0C0C1A,#06060E)",borderBottom:"1px solid #0C0C18",position:"sticky",top:0,zIndex:50 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
          <div style={{ fontFamily:"'Oswald',sans-serif",fontSize:28,fontWeight:700,letterSpacing:".05em" }}>
            <span style={{ color:"#E50914" }}>GOOL</span>TV
            {gamesLoading&&<span style={{ fontSize:11,color:"#333",marginLeft:8,display:"inline-block",animation:"spin 1s linear infinite" }}>⟳</span>}
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:6,background:"rgba(0,155,58,.1)",border:"1px solid rgba(0,155,58,.3)",borderRadius:8,padding:"5px 10px",fontSize:10,fontWeight:700,color:"#009B3A",letterSpacing:".06em" }}>
            🤖 IA {liveCount>0&&<span style={{ background:"#E50914",color:"#fff",borderRadius:8,padding:"1px 5px",fontSize:8,marginLeft:4 }}>{liveCount} LIVE</span>}
          </div>
        </div>
        {tab==="home"&&(
          <>
            <div className="search-wrap" style={{ marginBottom:12 }}>
              <span style={{ fontSize:15,opacity:.25 }}>🔍</span>
              <input placeholder="Buscar jogo, canal..." value={streamSearch} onChange={e=>setStreamSearch(e.target.value)}/>
              {streamSearch&&<button onClick={()=>setStreamSearch("")} style={{ background:"none",border:"none",color:"#333",fontSize:16,cursor:"pointer",padding:0 }}>✕</button>}
            </div>
            <div style={{ display:"flex",gap:8,overflowX:"auto",paddingBottom:2 }}>
              <button className={`net-chip ${activeNetwork==="all"?"active":""}`} style={activeNetwork==="all"?{background:"#E50914",borderColor:"#E50914",color:"#fff"}:{}} onClick={()=>setActiveNetwork("all")}>Todos</button>
              {NETWORKS.map(n=>(
                <button key={n.id} className={`net-chip ${activeNetwork===n.id?"active":""}`} style={activeNetwork===n.id?{background:n.color+"22",borderColor:n.color,color:n.color}:{}} onClick={()=>setActiveNetwork(n.id)}>{n.icon} {n.name}</button>
              ))}
            </div>
          </>
        )}
        {tab==="jogos"&&(
          <>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
              <div style={{ display:"flex",flex:1,borderBottom:"1px solid #0F0F1C" }}>
                <button className={`seg-btn ${gamesTab==="proximos"?"active":""}`} onClick={()=>setGamesTab("proximos")}>AO VIVO / PRÓXIMOS</button>
                <button className={`seg-btn ${gamesTab==="resultados"?"active":""}`} onClick={()=>setGamesTab("resultados")}>RESULTADOS</button>
              </div>
              <button onClick={loadGames} style={{ background:"none",border:"none",color:"#444",fontSize:18,cursor:"pointer",paddingLeft:12 }}>
                <span style={{ display:"inline-block",animation:gamesLoading?"spin 1s linear infinite":"none" }}>⟳</span>
              </button>
            </div>
            <div style={{ display:"flex",gap:8,overflowX:"auto",paddingBottom:2 }}>
              {leagueNames.map(l=>(
                <button key={l} className={`league-chip ${gamesLeague===l?"active":""}`} onClick={()=>setGamesLeague(l)}>{l}</button>
              ))}
            </div>
            {lastUpdated&&<div style={{ fontSize:10,color:"#222",marginTop:6,textAlign:"right" }}>🤖 {lastUpdated.toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})}</div>}
          </>
        )}
      </div>
<div style={{ height:"calc(100vh - 195px)",overflowY:"auto",padding:"16px 16px 90px" }}>
        {tab==="home"&&(
          <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            {searchedStreams.map((stream,i)=>{
              const net=netOf(stream.network);
              const isMyTeam=favTeam&&stream.teams?.includes(favoriteTeam);
              return (
                <div key={stream.id} className="stream-card" style={{ animationDelay:`${i*.06}s`,borderColor:isMyTeam?favTeam.color+"55":"#111" }} onClick={()=>openStream(stream)}>
                  {isMyTeam&&<div style={{ background:`linear-gradient(90deg,${favTeam.color}22,transparent)`,padding:"6px 14px",fontSize:10,fontWeight:700,color:favTeam.color,letterSpacing:".08em" }}>{favTeam.emoji} JOGO DO SEU TIME</div>}
                  <div style={{ position:"relative",aspectRatio:"16/9",background:"#0A0A14" }}>
                    <img src={stream.thumbnail} alt="" style={{ width:"100%",height:"100%",objectFit:"cover",opacity:.8 }} onError={e=>e.target.style.display="none"}/>
                    <div style={{ position:"absolute",inset:0,background:"linear-gradient(180deg,transparent 30%,#0C0C18 100%)"}}/>
                    <div style={{ position:"absolute",top:10,left:10,background:net.bg,border:`1px solid ${net.color}55`,borderRadius:6,padding:"3px 9px",fontSize:10,fontWeight:700,color:net.color,display:"flex",alignItems:"center",gap:5 }}>{net.icon} {net.name}</div>
                    <div style={{ position:"absolute",top:10,right:10 }}><span className="live-pill"><span className="live-dot"/>AO VIVO</span></div>
                    <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
                      <div style={{ width:54,height:54,borderRadius:"50%",background:"rgba(229,9,20,.9)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,paddingLeft:5,boxShadow:"0 0 28px rgba(229,9,20,.4)" }}>▶</div>
                    </div>
                    {stream.viewers&&<div style={{ position:"absolute",bottom:10,right:10,background:"rgba(0,0,0,.75)",borderRadius:5,padding:"3px 9px",fontSize:11,fontWeight:700 }}>👁 {stream.viewers}</div>}
                  </div>
                  <div style={{ padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
                    <div style={{ flex:1,paddingRight:10 }}>
                      <div style={{ fontSize:13,fontWeight:700,lineHeight:1.3,marginBottom:4 }}>{stream.title}</div>
                      <div style={{ fontSize:11,color:"#444" }}>{stream.channel}</div>
                    </div>
                    <div style={{ display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end" }}>
                      {stream.tags.map(tag=>(
                        <span key={tag} style={{ fontSize:9,fontWeight:700,color:"#E50914",background:"rgba(229,9,20,.1)",borderRadius:4,padding:"2px 7px",letterSpacing:".08em",whiteSpace:"nowrap" }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab==="jogos"&&(
          <div>
            {gamesLoading&&games.length===0&&(
              <div style={{ textAlign:"center",padding:"50px 0" }}>
                <div style={{ width:40,height:40,borderRadius:"50%",border:"3px solid #111",borderTopColor:"#009B3A",animation:"spin .8s linear infinite",margin:"0 auto 14px" }}/>
                <div style={{ fontSize:13,color:"#444" }}>🤖 IA buscando jogos...</div>
              </div>
            )}
            {[...new Set(filteredGames.map(g=>g.league))].map(league=>{
              const lGames=filteredGames.filter(g=>g.league===league);
              const lc=lGames[0]?.leagueColor||"#444";
              const li=lGames[0]?.leagueIcon||"⚽";
              return (
                <div key={league} style={{ marginBottom:24 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:12,paddingBottom:10,borderBottom:`1px solid ${lc}33` }}>
                    <div style={{ width:32,height:32,borderRadius:8,background:`${lc}22`,border:`1px solid ${lc}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16 }}>{li}</div>
                    <div style={{ fontFamily:"'Oswald',sans-serif",fontSize:14,fontWeight:600,color:lc }}>{league.toUpperCase()}</div>
                    {lGames.filter(g=>g.status==="live").length>0&&<span className="live-pill"><span className="live-dot"/>{lGames.filter(g=>g.status==="live").length} LIVE</span>}
                  </div>
                  <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                    {lGames.map((game,i)=>{
                      const live=game.status==="live";
                      const isMyGame=favTeam&&(game.homeId===favoriteTeam||game.awayId===favoriteTeam);
                      return (
                        <div key={game.id} className="game-card" style={{ animationDelay:`${i*.04}s`,borderColor:live?"#E5091433":isMyGame?favTeam?.color+"44":"#111" }}>
                          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:10 }}>
                            <div style={{ fontSize:10,fontWeight:700,color:live?"#E50914":"#333",display:"flex",alignItems:"center",gap:5 }}>
                              {live&&<span className="live-dot" style={{ background:"#E50914" }}/>}
                              {live?`${game.minute?game.minute+"' ":""}AO VIVO`:`📅 ${game.date} • ${game.time}`}
                            </div>
                            {game.status==="final"&&<div style={{ fontSize:10,fontWeight:700,color:"#555",background:"#111",borderRadius:4,padding:"2px 8px" }}>ENCERRADO</div>}
                          </div>
                          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:14,fontWeight:700,color:game.homeId===favoriteTeam&&favTeam?favTeam.color:"#F0F0FA" }}>{game.home}</div>
                              <div style={{ fontSize:10,color:"#333",marginTop:2 }}>{game.homeAbbr}</div>
                            </div>
                            <div style={{ textAlign:"center",padding:"0 12px",minWidth:80 }}>
                              {(live||game.status==="final")&&game.homeScore!==null?(
                                <div style={{ fontFamily:"'Oswald',sans-serif",fontSize:28,fontWeight:700 }}>
                                  <span style={{ color:game.homeScore>game.awayScore?"#4ADE80":"#F0F0FA" }}>{game.homeScore}</span>
                                  <span style={{ color:"#1A1A2A",margin:"0 6px" }}>–</span>
                                  <span style={{ color:game.awayScore>game.homeScore?"#4ADE80":"#F0F0FA" }}>{game.awayScore}</span>
                                </div>
                              ):<div style={{ fontSize:11,fontWeight:700,color:"#333" }}>VS</div>}
                            </div>
                            <div style={{ flex:1,textAlign:"right" }}>
                              <div style={{ fontSize:14,fontWeight:700,color:game.awayId===favoriteTeam&&favTeam?favTeam.color:"#F0F0FA" }}>{game.away}</div>
                              <div style={{ fontSize:10,color:"#333",marginTop:2 }}>{game.awayAbbr}</div>
                            </div>
                          </div>
                          {live&&(
                            <button onClick={()=>setTab("home")} style={{ marginTop:12,width:"100%",background:"rgba(229,9,20,.08)",border:"1px solid rgba(229,9,20,.2)",borderRadius:8,padding:"9px",color:"#E50914",fontFamily:"'Rajdhani',sans-serif",fontSize:12,fontWeight:700,letterSpacing:".08em",cursor:"pointer" }}>
                              🔴 VER STREAMS
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {tab==="meutime"&&(
          <div style={{ animation:"fadeUp .3s ease" }}>
            {favTeam?(
              <>
                <div style={{ background:`linear-gradient(135deg,${favTeam.color}15,#0C0C18)`,border:`1px solid ${favTeam.color}33`,borderRadius:16,padding:"24px 20px",marginBottom:20,textAlign:"center" }}>
                  <div style={{ fontSize:56,marginBottom:10 }}>{favTeam.emoji}</div>
                  <div style={{ fontFamily:"'Oswald',sans-serif",fontSize:26,fontWeight:700,color:favTeam.color }}>{favTeam.name}</div>
                  <div style={{ display:"flex",gap:8,justifyContent:"center",marginTop:16 }}>
                    {[{val:myTeamStreams.length,label:"Streams"},{val:myTeamGames.filter(g=>g.status==="live").length,label:"Ao vivo"},{val:myTeamGames.filter(g=>g.status==="scheduled").length,label:"Próximos"}].map(({val,label})=>(
                      <div key={label} style={{ background:"rgba(255,255,255,.04)",borderRadius:10,padding:"8px 14px",textAlign:"center" }}>
                        <div style={{ fontSize:18,fontWeight:700,color:favTeam.color }}>{val}</div>
                        <div style={{ fontSize:10,color:"#444",marginTop:2 }}>{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <button onClick={()=>{ setShowOnboarding(true); setOnboardingStep(1); setFavoriteTeam(null); }}
                  style={{ width:"100%",background:"transparent",border:"1px solid #1A1A2A",borderRadius:10,padding:"11px",color:"#444",fontFamily:"'Rajdhani',sans-serif",fontSize:12,fontWeight:700,letterSpacing:".06em",cursor:"pointer" }}>
                  🔄 Trocar time
                </button>
              </>
            ):(
              <div style={{ textAlign:"center",padding:"60px 20px" }}>
                <div style={{ fontSize:50,marginBottom:16 }}>⚽</div>
                <div style={{ fontSize:16,fontWeight:700,marginBottom:8 }}>Nenhum time selecionado</div>
                <button onClick={()=>{ setShowOnboarding(true); setOnboardingStep(1); }} style={{ background:"#E50914",border:"none",borderRadius:10,padding:"12px 24px",color:"#fff",fontFamily:"'Oswald',sans-serif",fontSize:14,fontWeight:600,cursor:"pointer" }}>ESCOLHER MEU TIME</button>
              </div>
            )}
          </div>
        )}

        {tab==="player"&&selectedStream&&(
          <div style={{ animation:"fadeUp .3s ease" }}>
            <button onClick={()=>setTab("home")} style={{ background:"none",border:"none",color:"#555",fontFamily:"'Rajdhani',sans-serif",fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:6,marginBottom:14,padding:0 }}>← Voltar</button>
            <div ref={playerWrap} style={{ position:"relative",background:"#000",borderRadius:14,overflow:"hidden",marginBottom:16,aspectRatio:"16/9",border:"1px solid #111",cursor:"pointer" }}
              onMouseMove={showCtrlsTemporarily} onTouchStart={showCtrlsTemporarily}
              onClick={()=>{ if(showQualityMenu){setShowQualityMenu(false);return;} showCtrlsTemporarily(); }}>
              <iframe key={iframeKey} src={embedUrl} style={{ width:"100%",height:"100%",border:"none",display:"block" }} allowFullScreen allow="autoplay;encrypted-media;fullscreen" title="stream" onLoad={()=>setPlayerLoading(false)}/>
              {playerLoading&&<div style={{ position:"absolute",inset:0,background:"rgba(0,0,0,.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:5 }}><div style={{ width:44,height:44,borderRadius:"50%",border:"3px solid #111",borderTopColor:"#E50914",animation:"spin .8s linear infinite" }}/></div>}
              <div className={`player-overlay ${showControls?"visible":"hidden"}`}>
                <div className="ctrl-gradient-top">
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
                    <div><div style={{ fontSize:13,fontWeight:700 }}>{selectedStream.title}</div><div style={{ fontSize:11,color:"#aaa",marginTop:3 }}>{netOf(selectedStream.network).icon} {selectedStream.channel}</div></div>
                    <span className="live-pill"><span className="live-dot"/>AO VIVO</span>
                  </div>
                </div>
                <div className="ctrl-gradient-bottom">
                  <div style={{ marginBottom:14 }}>
                    <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                      <button className="ctrl-btn" onClick={()=>setMuted(!muted)}>{muted||volume===0?"🔇":volume>60?"🔊":"🔉"}</button>
                      <div style={{ flex:1,position:"relative",height:18,display:"flex",alignItems:"center" }}>
                        <div className="vol-track">
                          <div className="vol-fill" style={{ width:`${volFill}%` }}/>
                          <div className="vol-thumb" style={{ left:`${volFill}%` }}/>
                          <input type="range" min="0" max="100" value={volFill} className="vol-input" onChange={e=>{ setVolume(+e.target.value); if(+e.target.value>0) setMuted(false); }}/>
                        </div>
                      </div>
                      <span style={{ fontSize:12,fontWeight:700,color:"#fff",minWidth:34,textAlign:"right",fontFamily:"monospace" }}>{muted?0:volume}%</span>
                    </div>
                  </div>
                  <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",position:"relative" }}>
                    <button className="ctrl-btn" onClick={e=>{ e.stopPropagation(); setShowQualityMenu(!showQualityMenu); }} style={{ width:"auto",borderRadius:8,padding:"0 12px",fontSize:11,fontWeight:700 }}>⚙ {quality}</button>
                    <button className="ctrl-btn" onClick={toggleFullscreen}>{fullscreen?"⤡":"⤢"}</button>
                    {showQualityMenu&&(
                      <div className="quality-menu" onClick={e=>e.stopPropagation()}>
                        {selectedStream.quality.map(q=>(
                          <div key={q} className={`quality-item ${quality===q?"active":""}`} onClick={()=>changeQuality(q)}>
                            <span>{q}</span>
                            {quality===q&&<span>✓</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div style={{ background:"#0C0C18",border:"1px solid #111",borderRadius:14,padding:16 }}>
              <div style={{ fontSize:16,fontWeight:700,lineHeight:1.3,marginBottom:6 }}>{selectedStream.title}</div>
              <div style={{ fontSize:12,color:"#444",marginBottom:14 }}>{selectedStream.channel}</div>
              <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
                {selectedStream.viewers&&<div style={{ background:"rgba(255,255,255,.04)",borderRadius:8,padding:"6px 12px",fontSize:11,fontWeight:700 }}>👁 {selectedStream.viewers}</div>}
                <span className="live-pill" style={{ borderRadius:8,padding:"6px 12px" }}><span className="live-dot"/>AO VIVO</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:430,background:"rgba(6,6,14,.97)",backdropFilter:"blur(24px)",borderTop:"1px solid #0C0C18",display:"flex" }}>
        <button className={`tab-btn ${tab==="home"?"active":""}`} onClick={()=>setTab("home")}><span className="tab-icon">📡</span>Streams</button>
        <button className={`tab-btn ${tab==="jogos"?"active":""}`} onClick={()=>setTab("jogos")} style={{ position:"relative" }}>
          <span className="tab-icon">⚽</span>Jogos
          {liveCount>0&&<span style={{ position:"absolute",top:8,right:"calc(50% - 20px)",background:"#E50914",color:"#fff",borderRadius:10,fontSize:8,fontWeight:700,padding:"1px 5px" }}>{liveCount}</span>}
        </button>
        <button className={`tab-btn ${tab==="meutime"?"active":""}`} onClick={()=>setTab("meutime")}>
          <span className="tab-icon">{favTeam?favTeam.emoji:"❤️"}</span>Meu Time
        </button>
        <button className={`tab-btn ${tab==="player"?"active":""}`} onClick={()=>selectedStream&&setTab("player")} style={{ opacity:selectedStream?1:.3 }}><span className="tab-icon">📺</span>Player</button>
      </div>
    </div>
  );
                                  }
