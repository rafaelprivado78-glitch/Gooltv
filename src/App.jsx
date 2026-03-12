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
