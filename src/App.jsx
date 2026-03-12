
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
