import { useState, useEffect, useRef } from "react";

// ─── JSONBIN STORAGE ──────────────────────────────────────────────────────────
// These values come from your .env.local file (locally) or Vercel env vars (live)
const API         = "https://api.jsonbin.io/v3/b";
const JKEY        = import.meta.env.VITE_JSONBIN_KEY;
const SHARED_BIN  = import.meta.env.VITE_SHARED_BIN;
const PERSON_BIN  = import.meta.env.VITE_PERSONAL_BIN;

async function loadShared() {
  try {
    const r = await fetch(`${API}/${SHARED_BIN}/latest`, {
      headers: { "X-Master-Key": JKEY }
    });
    const d = await r.json();
    return d.record || null;
  } catch { return null; }
}

async function saveShared(data) {
  try {
    await fetch(`${API}/${SHARED_BIN}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Master-Key": JKEY },
      body: JSON.stringify(data)
    });
  } catch {}
}

async function loadPersonal(userId) {
  try {
    const r = await fetch(`${API}/${PERSON_BIN}/latest`, {
      headers: { "X-Master-Key": JKEY }
    });
    const d = await r.json();
    return (d.record || {})[userId] || null;
  } catch { return null; }
}

async function savePersonal(userId, data) {
  try {
    const r = await fetch(`${API}/${PERSON_BIN}/latest`, {
      headers: { "X-Master-Key": JKEY }
    });
    const d = await r.json();
    const all = d.record || {};
    all[userId] = data;
    await fetch(`${API}/${PERSON_BIN}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Master-Key": JKEY },
      body: JSON.stringify(all)
    });
  } catch {}
}

// ─── USERS ────────────────────────────────────────────────────────────────────
const USERS = [
  { id:"ironclad",   name:"The Ironclad",   emoji:"🏋️", pin:"1111", type:"lifter", color:"#FF4D00", tagline:"Will reluctantly kick a ball. Will not skip leg day." },
  { id:"shuttle",    name:"The Shuttle",    emoji:"🏸",  pin:"2222", type:"racket", color:"#00D4FF", tagline:"Eats clean. Plays dirty. Kills it on the court." },
  { id:"spinmaster", name:"The Spinmaster", emoji:"🚴",  pin:"3333", type:"hybrid", color:"#FFD600", tagline:"Saddle sore before sunrise. Still shows up." },
];

// ─── ACTIVITIES ───────────────────────────────────────────────────────────────
const ACTS = {
  lifter: [
    { id:"compound",    label:"Compound Lifts",        icon:"🏋️", pts:5,  unit:"sets", ph:"Squat, deadlift, bench, row, OHP" },
    { id:"accessory",   label:"Accessory / Isolation", icon:"💪",  pts:3,  unit:"sets", ph:"Curls, flyes, tricep work etc." },
    { id:"running",     label:"Running",               icon:"🏃",  pts:8,  unit:"km",   ph:"km covered. Yes, this counts." },
    { id:"sport",       label:"Reluctant Sport",       icon:"😤",  pts:15, unit:"hrs",  ph:"Hours played. Bonus pts just for showing up." },
    { id:"cardio_mach", label:"Cardio Machine",        icon:"⚡",  pts:4,  unit:"mins", ph:"Rower / treadmill / bike — mins" },
  ],
  racket: [
    { id:"badminton",  label:"Badminton",               icon:"🏸",  pts:15, unit:"hrs",  ph:"Hours on court — bread and butter" },
    { id:"pickleball", label:"Pickleball",              icon:"🎾",  pts:13, unit:"hrs",  ph:"When time permits, king" },
    { id:"weights",    label:"Weights Session",         icon:"🏋️", pts:4,  unit:"sets", ph:"Working sets — compound or accessory" },
    { id:"cardio",     label:"Dedicated Cardio",        icon:"🔥",  pts:4,  unit:"mins", ph:"Not court time — focused cardio" },
    { id:"meal_prep",  label:"Strict Meal Prep Day ✅", icon:"🥗",  pts:20, unit:"days", ph:"Days fully on the plan — respect." },
  ],
  hybrid: [
    { id:"bike_short",  label:"Morning Ride (30–44 min)", icon:"🚴",  pts:25, unit:"sessions", ph:"Sub-45min morning grind" },
    { id:"bike_long",   label:"Morning Ride (45–60 min)", icon:"🔥",  pts:35, unit:"sessions", ph:"Full 45–60min slog" },
    { id:"pickleball",  label:"Pickleball",               icon:"🎾",  pts:13, unit:"hrs",      ph:"Hours on the pickle court" },
    { id:"badminton",   label:"Badminton",                icon:"🏸",  pts:13, unit:"hrs",      ph:"Hours on the shuttle court" },
    { id:"weights",     label:"Weights Session",          icon:"🏋️", pts:4,  unit:"sets",     ph:"When you get a solid chunk of time" },
    { id:"sport_other", label:"Other Sport",              icon:"🏅",  pts:12, unit:"hrs",      ph:"Any other sport session" },
  ],
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const WEEKLY_TARGET = 250;

const MILESTONES = [
  { t:0,   label:"Still Warming Up", desc:"The only thing working is your jaw",               emoji:"🥶" },
  { t:25,  label:"Showing Up",       desc:"At least you're not on the couch",                 emoji:"😐" },
  { t:50,  label:"Getting Loose",    desc:"Something's starting to move",                     emoji:"🔥" },
  { t:75,  label:"Deep In It",       desc:"You've been putting in real work",                 emoji:"💦" },
  { t:100, label:"FEAST UNLOCKED",   desc:"You've earned the right to go deep on that plate", emoji:"🍽️" },
];

const QUOTES = [
  "Did you do enough this week to have meat in your mouth?",
  "The boys who work hard together, eat hard together.",
  "You can't just show up and expect to get a piece.",
  "Log your session or you're not getting any.",
  "Every rep is a step closer to putting something special in your mouth.",
  "Soft men don't deserve what's on that plate.",
  "Go hard or go hungry.",
  "The deeper you go, the better the reward.",
  "It doesn't count unless you log it. Just like in life.",
  "Are you man enough to finish what you started?",
  "The feast doesn't come to those who don't thrust themselves into the work.",
  "You want it? Work for it. Then put it all in your mouth.",
];
const randQ = () => QUOTES[Math.floor(Math.random() * QUOTES.length)];

const TIERS = [
  { id:"S", color:"#FF4D00", bg:"#1a0800", desc:"Transcendent. We'd cancel plans." },
  { id:"A", color:"#FFD600", bg:"#1a1400", desc:"Consistently excellent. No notes." },
  { id:"B", color:"#00D4FF", bg:"#001a20", desc:"Solid. We'd go back. Not first choice." },
  { id:"C", color:"#777",    bg:"#111",    desc:"Fine. It's fine." },
  { id:"D", color:"#3a3a3a", bg:"#0a0a0a", desc:"Only if literally nothing else is open." },
];

const FOOD_EMOJIS = ["🍔","🍕","🌮","🌯","🍜","🍝","🥩","🍗","🦴","🍣","🍱","🥗","🍛","🫕","🥪","🧆","🫔","🍖","🥓","🍤","🦐","🦑","🍞","🧀","🥚","🌭","🥙","🍙","🥟","🥠","🫓","🍲","🥘","🍠"];

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
const notif = {
  supported: () => "Notification" in window,
  granted:   () => Notification.permission === "granted",
  request:   async () => { try { return await Notification.requestPermission(); } catch { return "denied"; } },
  send: (title, body) => {
    if (!notif.granted()) return;
    try { new Notification(title, { body }); } catch {}
  },
};

// ─── TIME HELPERS ─────────────────────────────────────────────────────────────
const getWeekStart = () => {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};
const getWeekEnd = () => {
  const d = new Date();
  d.setDate(d.getDate() + (6 - d.getDay()));
  d.setHours(23, 59, 59, 999);
  return d.getTime();
};
const fmtCountdown = (ms) => {
  if (ms <= 0) return "00:00:00";
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
};

// ─── STYLES (shared) ──────────────────────────────────────────────────────────
const S = {
  card: { background:"#0d0d0d", border:"1px solid #1a1a1a", borderRadius:"4px", padding:"clamp(14px,3vw,22px)" },
  label: { fontFamily:"'Courier New',monospace", fontSize:"9px", color:"#444", letterSpacing:"0.3em", marginBottom:"12px" },
  title: { fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"0.05em" },
  mono:  { fontFamily:"'Courier New',monospace" },
  btn: (color="#FF4D00", textColor="#000") => ({
    background:`linear-gradient(90deg,${color},${color}cc)`,
    border:"none", borderRadius:"2px", padding:"10px 18px",
    fontFamily:"'Bebas Neue',sans-serif", fontSize:"13px",
    color:textColor, cursor:"pointer", letterSpacing:"0.15em", whiteSpace:"nowrap"
  }),
  ghostBtn: { background:"none", border:"1px solid #1a1a1a", borderRadius:"2px", padding:"8px 14px", fontFamily:"'Bebas Neue',sans-serif", fontSize:"12px", color:"#444", cursor:"pointer", letterSpacing:"0.1em" },
};

// ─── PIN INPUT ────────────────────────────────────────────────────────────────
function PinInput({ onSuccess }) {
  const [input, setInput] = useState("");
  const [shake, setShake] = useState(false);
  const [quote]           = useState(randQ);

  const handleKey = (k) => {
    if (input.length >= 4) return;
    const next = input + k;
    setInput(next);
    if (next.length === 4) {
      const match = USERS.find(u => u.pin === next);
      if (match) { setTimeout(() => onSuccess(match), 150); }
      else { setShake(true); setTimeout(() => { setInput(""); setShake(false); }, 600); }
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#050505", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", fontFamily:"'Bebas Neue','Impact',sans-serif", padding:"20px" }}>
      <div style={{ textAlign:"center", marginBottom:"36px" }}>
        <div style={{ fontSize:"clamp(52px,11vw,96px)", letterSpacing:"0.05em", color:"#fff", lineHeight:1 }}>GAINZ</div>
        <div style={{ fontSize:"clamp(52px,11vw,96px)", letterSpacing:"0.05em", background:"linear-gradient(90deg,#FF4D00,#FFD600)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", lineHeight:1 }}>FOR GRUB</div>
        <div style={{ fontFamily:"'Courier New',monospace", fontSize:"10px", color:"#333", marginTop:"10px", letterSpacing:"0.35em" }}>EARN IT. EAT IT. NO REGRETS.</div>
      </div>

      <div style={{ background:"#0d0d0d", border:"1px solid #1a1a1a", borderRadius:"4px", padding:"clamp(22px,5vw,38px)", width:"100%", maxWidth:"330px" }}>
        <div style={{ fontFamily:"'Courier New',monospace", fontSize:"9px", color:"#FF4D00", letterSpacing:"0.25em", marginBottom:"5px" }}>THE ORACLE SPEAKS</div>
        <div style={{ fontFamily:"'Georgia',serif", fontStyle:"italic", color:"#555", fontSize:"11px", marginBottom:"26px", lineHeight:1.6 }}>"{quote}"</div>

        <div style={{ fontFamily:"'Courier New',monospace", fontSize:"9px", color:"#333", letterSpacing:"0.2em", marginBottom:"10px" }}>ENTER YOUR PIN</div>
        <div style={{ display:"flex", gap:"8px", justifyContent:"center", marginBottom:"22px", animation:shake?"shake 0.5s":"none" }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ width:"46px", height:"46px", border:`2px solid ${input.length>i?"#FF4D00":"#1a1a1a"}`, background:input.length>i?"#1a0800":"#080808", borderRadius:"2px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px", color:"#FF4D00", transition:"all 0.1s" }}>
              {input.length > i ? "●" : ""}
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"5px" }}>
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button key={n} onClick={() => handleKey(String(n))}
              style={{ background:"#111", border:"1px solid #1c1c1c", color:"#fff", fontSize:"19px", padding:"13px", borderRadius:"2px", cursor:"pointer", fontFamily:"'Bebas Neue',sans-serif", transition:"background 0.1s" }}
              onMouseEnter={e => e.currentTarget.style.background="#191919"}
              onMouseLeave={e => e.currentTarget.style.background="#111"}>{n}</button>
          ))}
          <div />
          <button onClick={() => handleKey("0")}
            style={{ background:"#111", border:"1px solid #1c1c1c", color:"#fff", fontSize:"19px", padding:"13px", borderRadius:"2px", cursor:"pointer", fontFamily:"'Bebas Neue',sans-serif", transition:"background 0.1s" }}
            onMouseEnter={e => e.currentTarget.style.background="#191919"}
            onMouseLeave={e => e.currentTarget.style.background="#111"}>0</button>
          <button onClick={() => setInput(i => i.slice(0,-1))}
            style={{ background:"#111", border:"1px solid #1c1c1c", color:"#555", fontSize:"15px", padding:"13px", borderRadius:"2px", cursor:"pointer", transition:"background 0.1s" }}
            onMouseEnter={e => e.currentTarget.style.background="#191919"}
            onMouseLeave={e => e.currentTarget.style.background="#111"}>⌫</button>
        </div>

        <div style={{ marginTop:"20px", borderTop:"1px solid #0f0f0f", paddingTop:"14px", display:"flex", flexDirection:"column", gap:"5px" }}>
          {USERS.map(u => (
            <div key={u.id} style={{ display:"flex", alignItems:"center", gap:"9px", padding:"7px 9px", background:"#080808", border:"1px solid #0f0f0f", borderRadius:"2px" }}>
              <span style={{ fontSize:"16px" }}>{u.emoji}</span>
              <div>
                <div style={{ color:u.color, fontSize:"12px", fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"0.1em" }}>{u.name}</div>
                <div style={{ color:"#222", fontSize:"9px", fontFamily:"'Courier New',monospace" }}>{u.tagline}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}`}</style>
    </div>
  );
}

// ─── RING ─────────────────────────────────────────────────────────────────────
function Ring({ pct, size=90, color="#FF4D00", label, pulse=false }) {
  const r = (size-12)/2, c = 2*Math.PI*r;
  return (
    <div style={{ position:"relative", width:size, height:size, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
      <svg width={size} height={size} style={{ position:"absolute", transform:"rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#111" strokeWidth="7"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={c} strokeDashoffset={c-(Math.min(pct,100)/100)*c}
          strokeLinecap="round" style={{ transition:"stroke-dashoffset 0.8s ease" }}/>
      </svg>
      <div style={{ textAlign:"center" }}>
        <div style={{ fontSize:"16px", fontFamily:"'Bebas Neue',sans-serif", color, animation:pulse?"ringpulse 1.5s ease-in-out infinite":"" }}>{Math.round(pct)}%</div>
        {label && <div style={{ fontSize:"7px", color:"#333", fontFamily:"'Courier New',monospace", letterSpacing:"0.1em" }}>{label}</div>}
      </div>
      <style>{`@keyframes ringpulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

// ─── FEAST COUNTDOWN ─────────────────────────────────────────────────────────
function FeastCountdown({ weekLogs, shared, onBank, onRedeem, onExit }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);

  const pts    = USERS.reduce((a,u) => { a[u.id]=weekLogs.filter(l=>l.userId===u.id).reduce((s,l)=>s+l.points,0); return a; }, {});
  const total  = Object.values(pts).reduce((s,v)=>s+v,0);
  const pct    = Math.min((total/WEEKLY_TARGET)*100,100);
  const banked = shared.bankedFeasts || 0;
  const msLeft = Math.max(0, getWeekEnd() - now);
  const cdStr  = fmtCountdown(msLeft);
  const [hh1,hh2,,mm1,mm2,,ss1,ss2] = cdStr.split("");
  const arcCol = pct>=100?"#FFD600":pct>=75?"#FF4D00":pct>=50?"#FF8C00":"#444";
  const sz=220, r=(sz-16)/2, c=2*Math.PI*r;

  const Digit = ({ch}) => (
    <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:"#0d0d0d", border:"1px solid #1a1a1a", borderRadius:"3px", width:"clamp(38px,9vw,62px)", height:"clamp(48px,11vw,78px)", fontFamily:"'Bebas Neue',monospace", fontSize:"clamp(28px,7vw,50px)", color:"#fff" }}>{ch}</div>
  );
  const Sep = () => <span style={{ color:"#333", fontSize:"clamp(22px,5vw,38px)", fontFamily:"'Bebas Neue',sans-serif", padding:"0 3px" }}>:</span>;

  return (
    <div style={{ minHeight:"100vh", background:"#020202", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"20px", position:"fixed", inset:0, zIndex:300, overflowY:"auto" }}>
      <button onClick={onExit} style={{ position:"fixed", top:"16px", right:"16px", background:"none", border:"1px solid #1a1a1a", borderRadius:"2px", color:"#333", padding:"7px 12px", cursor:"pointer", fontFamily:"'Courier New',monospace", fontSize:"9px", letterSpacing:"0.2em", zIndex:310 }}>✕ EXIT</button>

      <div style={{ width:"100%", maxWidth:"560px", display:"flex", flexDirection:"column", alignItems:"center", gap:"26px" }}>

        <div style={{ textAlign:"center" }}>
          <div style={{ fontFamily:"'Courier New',monospace", fontSize:"9px", color:"#FF4D00", letterSpacing:"0.4em", marginBottom:"6px" }}>FEAST COUNTDOWN MODE</div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(14px,3vw,18px)", color:pct>=100?"#FFD600":"#555", letterSpacing:"0.1em", transition:"color 0.5s" }}>
            {pct>=100 ? "🍽️ FEAST UNLOCKED — TIME TO EAT" : `${[...MILESTONES].reverse().find(m=>pct>=m.t)?.emoji} ${[...MILESTONES].reverse().find(m=>pct>=m.t)?.label}`}
          </div>
        </div>

        {/* Timer */}
        <div style={{ textAlign:"center" }}>
          <div style={{ fontFamily:"'Courier New',monospace", fontSize:"8px", color:"#333", letterSpacing:"0.3em", marginBottom:"10px" }}>WEEK ENDS IN</div>
          <div style={{ display:"flex", alignItems:"center", gap:"3px" }}>
            <Digit ch={hh1}/><Digit ch={hh2}/><Sep/>
            <Digit ch={mm1}/><Digit ch={mm2}/><Sep/>
            <Digit ch={ss1}/><Digit ch={ss2}/>
          </div>
          <div style={{ fontFamily:"'Courier New',monospace", fontSize:"8px", color:"#1e1e1e", marginTop:"5px", letterSpacing:"0.2em" }}>HH : MM : SS</div>
        </div>

        {/* Big arc */}
        <div style={{ position:"relative", width:"clamp(160px,40vw,220px)", height:"clamp(160px,40vw,220px)" }}>
          <svg width="100%" height="100%" viewBox={`0 0 ${sz} ${sz}`} style={{ position:"absolute", top:0, left:0, transform:"rotate(-90deg)" }}>
            <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke="#0d0d0d" strokeWidth="14"/>
            <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke={arcCol} strokeWidth="14"
              strokeDasharray={c} strokeDashoffset={c-(pct/100)*c}
              strokeLinecap="round" style={{ transition:"stroke-dashoffset 1s ease, stroke 0.5s" }}/>
            {pct>=100 && <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke="#FFD60033" strokeWidth="22" style={{ animation:"glowpulse 2s ease-in-out infinite" }}/>}
          </svg>
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center" }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(38px,9vw,58px)", color:arcCol, lineHeight:1, transition:"color 0.5s" }}>{Math.round(pct)}%</div>
            <div style={{ fontFamily:"'Courier New',monospace", fontSize:"clamp(8px,1.5vw,10px)", color:"#333", letterSpacing:"0.15em", marginTop:"4px" }}>{total} / {WEEKLY_TARGET}</div>
            {pct<100 && <div style={{ fontFamily:"'Courier New',monospace", fontSize:"8px", color:"#222", marginTop:"2px" }}>{WEEKLY_TARGET-total} TO GO</div>}
          </div>
        </div>

        {/* Per-user */}
        <div style={{ width:"100%", display:"flex", gap:"8px", justifyContent:"center", flexWrap:"wrap" }}>
          {USERS.map(u => {
            const p=pts[u.id], pp=Math.min((p/WEEKLY_TARGET)*100,100);
            return (
              <div key={u.id} style={{ flex:"1 1 130px", maxWidth:"180px", background:"#0a0a0a", border:`1px solid ${u.color}1e`, borderRadius:"3px", padding:"12px", textAlign:"center" }}>
                <div style={{ fontSize:"20px", marginBottom:"3px" }}>{u.emoji}</div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"11px", color:u.color, letterSpacing:"0.1em" }}>{u.name.split(" ")[1]}</div>
                <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"22px", color:"#fff", margin:"3px 0" }}>{p}<span style={{fontSize:"8px",color:"#2a2a2a"}}>pts</span></div>
                <div style={{ height:"3px", background:"#111", borderRadius:"2px", overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pp}%`, background:`linear-gradient(90deg,${u.color},${u.color}88)`, transition:"width 0.8s" }}/>
                </div>
              </div>
            );
          })}
        </div>

        {/* Vault */}
        <div style={{ width:"100%", background:"#0d0d0d", border:`1px solid ${pct>=100?"#FFD60033":"#0f0f0f"}`, borderRadius:"4px", padding:"18px", textAlign:"center" }}>
          <div style={{ fontFamily:"'Courier New',monospace", fontSize:"9px", color:"#333", letterSpacing:"0.3em", marginBottom:"8px" }}>FEAST VAULT</div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(18px,4vw,26px)", color:banked>0?"#FFD600":"#1e1e1e", marginBottom:"12px" }}>
            {banked>0 ? `🍽️ ${banked} FEAST${banked>1?"S":""} STORED` : "VAULT EMPTY"}
          </div>
          <div style={{ display:"flex", gap:"8px", justifyContent:"center", flexWrap:"wrap" }}>
            {pct>=100 && <button onClick={onBank} style={S.btn("#FFD600","#000")}>BANK IT 🏦</button>}
            {banked>0 && <button onClick={onRedeem} style={S.btn("#FF4D00","#fff")}>REDEEM 🍽️</button>}
          </div>
          {!pct>=100 && !banked && <div style={{ fontFamily:"'Georgia',serif", fontStyle:"italic", color:"#2a2a2a", fontSize:"11px", marginTop:"8px" }}>{randQ()}</div>}
        </div>
      </div>
      <style>{`@keyframes glowpulse{0%,100%{opacity:0.2}50%{opacity:0.7}}`}</style>
    </div>
  );
}

// ─── NOTIFICATIONS PANEL ──────────────────────────────────────────────────────
function NotifPanel({ user }) {
  const [perm, setPerm] = useState(notif.supported() ? Notification.permission : "unsupported");
  const [toggles, setToggles] = useState({ dailyReminder:true, feastAlert:true, weekendWarning:true });

  const request = async () => {
    const p = await notif.request();
    setPerm(p);
    if (p==="granted") notif.send("GAINZ FOR GRUB 🔥","Notifications live. Now go earn that plate.");
  };

  const testMsgs = {
    dailyReminder:  { t:"Have you logged today? 💪", b:"The boys are watching. Don't be the weak link." },
    feastAlert:     { t:"🍽️ FEAST UNLOCKED!",        b:"The group hit 100%. Time to stuff your face." },
    weekendWarning: { t:"⚠️ Weekend Warning",         b:"Two days left. The feast won't earn itself." },
  };

  const cards = [
    { id:"dailyReminder",  icon:"⏰", label:"Daily Reminder",  desc:"8pm nudge if you haven't logged" },
    { id:"feastAlert",     icon:"🍽️", label:"Feast Alert",     desc:"Fires the moment the group hits 100%" },
    { id:"weekendWarning", icon:"⚠️",  label:"Weekend Warning", desc:"Friday night heads-up if you're behind" },
  ];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
      <div style={{ ...S.card, border:`1px solid ${perm==="granted"?"#00ff8822":"#1a1a1a"}` }}>
        <div style={S.label}>NOTIFICATION STATUS</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"12px" }}>
          <div>
            {perm==="unsupported" && <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"18px", color:"#444" }}>🚫 NOT SUPPORTED IN THIS BROWSER</div>}
            {perm==="default"     && <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"18px", color:"#FF4D00" }}>🔔 NOT YET ENABLED<br/><span style={{ fontSize:"11px", fontFamily:"'Courier New',monospace", color:"#555" }}>Tap below so we can bother you about your gains</span></div>}
            {perm==="denied"      && <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"18px", color:"#444" }}>🔕 BLOCKED — Enable in browser settings</div>}
            {perm==="granted"     && <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"18px", color:"#00ff88" }}>✅ LIVE — You will be disturbed appropriately</div>}
          </div>
          {perm==="default" && <button onClick={request} style={S.btn("#FF4D00","#000")}>ENABLE 🔔</button>}
        </div>
      </div>

      {perm==="granted" && (
        <div style={S.card}>
          <div style={S.label}>ALERT TYPES</div>
          <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
            {cards.map(n => (
              <div key={n.id} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px", padding:"12px", background:"#080808", border:"1px solid #111", borderRadius:"2px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                  <span style={{ fontSize:"18px" }}>{n.icon}</span>
                  <div>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"13px", color:toggles[n.id]?"#fff":"#444", letterSpacing:"0.08em" }}>{n.label}</div>
                    <div style={{ fontFamily:"'Courier New',monospace", fontSize:"9px", color:"#2a2a2a" }}>{n.desc}</div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
                  <button onClick={() => notif.send(testMsgs[n.id].t, testMsgs[n.id].b)}
                    style={{ background:"none", border:"1px solid #1a1a1a", borderRadius:"2px", color:"#444", padding:"4px 8px", cursor:"pointer", fontFamily:"'Courier New',monospace", fontSize:"9px" }}>TEST</button>
                  <div onClick={() => setToggles(t => ({...t,[n.id]:!t[n.id]}))}
                    style={{ width:"38px", height:"20px", borderRadius:"10px", background:toggles[n.id]?user.color:"#111", border:`1px solid ${toggles[n.id]?user.color:"#222"}`, cursor:"pointer", position:"relative", transition:"all 0.2s", flexShrink:0 }}>
                    <div style={{ position:"absolute", top:"2px", left:toggles[n.id]?"19px":"2px", width:"14px", height:"14px", borderRadius:"50%", background:toggles[n.id]?"#000":"#333", transition:"left 0.2s" }}/>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:"12px", fontFamily:"'Courier New',monospace", fontSize:"9px", color:"#222", fontStyle:"italic" }}>
            * Background scheduling requires a PWA install. TEST fires instantly. Auto-alerts fire while the tab is open.
          </div>
        </div>
      )}
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ weekLogs, shared, onBank, onRedeem, onResetWeek, onEnterCountdown }) {
  const [confirmReset, setConfirmReset] = useState(false);

  const pts    = USERS.reduce((a,u) => { a[u.id]=weekLogs.filter(l=>l.userId===u.id).reduce((s,l)=>s+l.points,0); return a; }, {});
  const total  = Object.values(pts).reduce((s,v)=>s+v,0);
  const pct    = Math.min((total/WEEKLY_TARGET)*100,100);
  const ms     = [...MILESTONES].reverse().find(m=>pct>=m.t)||MILESTONES[0];
  const banked = shared.bankedFeasts || 0;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"18px" }}>

      {/* Countdown CTA */}
      <button onClick={onEnterCountdown} style={{ background:"linear-gradient(90deg,#0d0d0d,#0a0800)", border:"1px solid #1a1500", borderRadius:"4px", padding:"14px 18px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", textAlign:"left" }}>
        <div>
          <div style={{ fontFamily:"'Courier New',monospace", fontSize:"9px", color:"#FF4D00", letterSpacing:"0.3em", marginBottom:"3px" }}>CINEMATIC VIEW</div>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"18px", color:"#fff", letterSpacing:"0.05em" }}>⏱ FEAST COUNTDOWN MODE</div>
          <div style={{ fontFamily:"'Georgia',serif", fontStyle:"italic", color:"#444", fontSize:"10px" }}>Full-screen progress with live week timer</div>
        </div>
        <div style={{ fontSize:"26px", opacity:0.4 }}>→</div>
      </button>

      {/* Group status */}
      <div style={{ background:"linear-gradient(135deg,#0d0d0d,#0a0800)", border:"1px solid #1a1500", borderRadius:"4px", padding:"clamp(16px,3.5vw,26px)" }}>
        <div style={{ fontFamily:"'Courier New',monospace", fontSize:"9px", color:"#FF4D00", letterSpacing:"0.3em", marginBottom:"5px" }}>GROUP FEAST STATUS</div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"14px" }}>
          <div style={{ flex:1, minWidth:"180px" }}>
            <div style={{ fontSize:"clamp(24px,5vw,40px)", fontFamily:"'Bebas Neue',sans-serif", color:"#fff", lineHeight:1 }}>{ms.emoji} {ms.label}</div>
            <div style={{ fontFamily:"'Georgia',serif", fontStyle:"italic", color:"#444", fontSize:"11px", marginTop:"4px" }}>{ms.desc}</div>
            <div style={{ marginTop:"12px", display:"flex", gap:"6px", flexWrap:"wrap" }}>
              {USERS.map(u => (
                <div key={u.id} style={{ background:"#0a0a0a", border:`1px solid ${u.color}1a`, borderRadius:"2px", padding:"5px 9px", display:"flex", alignItems:"center", gap:"5px" }}>
                  <span style={{ fontSize:"14px" }}>{u.emoji}</span>
                  <div>
                    <div style={{ color:u.color, fontFamily:"'Bebas Neue',sans-serif", fontSize:"10px", letterSpacing:"0.1em" }}>{u.name.split(" ")[1]}</div>
                    <div style={{ color:"#fff", fontFamily:"'Bebas Neue',sans-serif", fontSize:"14px" }}>{pts[u.id]}<span style={{color:"#2a2a2a",fontSize:"8px"}}> pts</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Ring pct={pct} color="#FFD600" label="TO FEAST" pulse={pct>=100}/>
        </div>
        <div style={{ marginTop:"12px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontFamily:"'Courier New',monospace", fontSize:"9px", color:"#333", marginBottom:"5px" }}>
            <span>{total} pts</span><span>{WEEKLY_TARGET} target</span>
          </div>
          <div style={{ height:"5px", background:"#111", borderRadius:"3px", overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,#FF4D00,#FFD600)", borderRadius:"3px", transition:"width 0.8s" }}/>
          </div>
        </div>
      </div>

      {/* Feast bank */}
      <div style={{ ...S.card, border:`1px solid ${pct>=100?"#FFD60022":"#111"}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"12px" }}>
          <div>
            <div style={S.label}>FEAST BANK 🏦</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(16px,3.5vw,24px)", color:banked>0?"#FFD600":"#2a2a2a" }}>
              {banked>0 ? `🍽️ ${banked} FEAST${banked>1?"S":""} IN THE VAULT` : "VAULT EMPTY"}
            </div>
            <div style={{ fontFamily:"'Georgia',serif", fontStyle:"italic", color:"#333", fontSize:"10px", marginTop:"3px" }}>
              {banked>0 ? "The goods are stored. Deploy when ready." : "Hit 100% then bank it — or blow it immediately."}
            </div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:"5px" }}>
            {pct>=100 && <button onClick={onBank}   style={S.btn("#FFD600","#000")}>BANK IT 🏦</button>}
            {banked>0 && <button onClick={onRedeem} style={S.btn("#FF4D00","#fff")}>REDEEM 🍽️</button>}
          </div>
        </div>
        {shared.redemptions?.length>0 && (
          <div style={{ marginTop:"10px", borderTop:"1px solid #0f0f0f", paddingTop:"10px" }}>
            <div style={{ fontFamily:"'Courier New',monospace", fontSize:"8px", color:"#1e1e1e", letterSpacing:"0.2em", marginBottom:"6px" }}>FEAST HISTORY</div>
            {[...shared.redemptions].reverse().slice(0,3).map((r,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", fontFamily:"'Courier New',monospace", fontSize:"9px", color:"#2a2a2a", padding:"2px 0" }}>
                <span>🍽️ Feast #{shared.redemptions.length-i}</span>
                <span>{new Date(r.ts).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Week reset */}
      <div style={S.card}>
        <div style={S.label}>WEEK CONTROLS</div>
        {!confirmReset ? (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"10px" }}>
            <div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"15px", color:"#555" }}>MANUAL WEEK RESET</div>
              <div style={{ fontFamily:"'Courier New',monospace", fontSize:"9px", color:"#2a2a2a", marginTop:"2px" }}>Wipe this week's logs and start fresh — no feast banked</div>
            </div>
            <button onClick={() => setConfirmReset(true)} style={S.ghostBtn}>RESET WEEK ↺</button>
          </div>
        ) : (
          <div style={{ background:"#0a0000", border:"1px solid #2a0000", borderRadius:"2px", padding:"14px" }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"14px", color:"#FF4D00", marginBottom:"6px" }}>⚠️ YOU SURE ABOUT THAT?</div>
            <div style={{ fontFamily:"'Courier New',monospace", fontSize:"9px", color:"#555", marginBottom:"12px" }}>This wipes all logs for the current week. No feast banked. The boys will not be pleased.</div>
            <div style={{ display:"flex", gap:"8px" }}>
              <button onClick={() => { onResetWeek(); setConfirmReset(false); }} style={{ ...S.ghostBtn, background:"#2a0000", border:"1px solid #FF4D0055", color:"#FF4D00" }}>YES, NUKE IT</button>
              <button onClick={() => setConfirmReset(false)} style={S.ghostBtn}>BACK OUT</button>
            </div>
          </div>
        )}
      </div>

      <ActivityFeed logs={weekLogs}/>
    </div>
  );
}

// ─── ACTIVITY FEED ────────────────────────────────────────────────────────────
function ActivityFeed({ logs }) {
  const visible = [...logs].filter(l=>!l._reset).reverse();
  if (!visible.length) return (
    <div style={{ ...S.card, textAlign:"center" }}>
      <div style={{ color:"#1e1e1e", fontFamily:"'Courier New',monospace", fontSize:"10px" }}>Nothing logged yet this week. Embarrassing.</div>
    </div>
  );
  return (
    <div style={S.card}>
      <div style={S.label}>THIS WEEK'S CONTRIBUTIONS</div>
      <div style={{ display:"flex", flexDirection:"column", gap:"5px", maxHeight:"260px", overflowY:"auto" }}>
        {visible.map((log,i) => {
          const u = USERS.find(u=>u.id===log.userId);
          return (
            <div key={i} style={{ display:"flex", gap:"9px", padding:"9px 11px", background:"#080808", borderRadius:"2px", border:`1px solid ${u?.color||"#111"}10` }}>
              <span style={{ fontSize:"16px", flexShrink:0 }}>{u?.emoji||"?"}</span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", gap:"8px" }}>
                  <div>
                    <span style={{ color:u?.color, fontFamily:"'Bebas Neue',sans-serif", fontSize:"11px", letterSpacing:"0.1em" }}>{u?.name}</span>
                    <span style={{ color:"#333", fontSize:"9px", fontFamily:"'Courier New',monospace", marginLeft:"7px" }}>{log.label}</span>
                  </div>
                  <span style={{ color:"#FFD600", fontFamily:"'Bebas Neue',sans-serif", fontSize:"14px", flexShrink:0 }}>+{log.points}</span>
                </div>
                <div style={{ color:"#2a2a2a", fontSize:"9px", fontFamily:"'Courier New',monospace", marginTop:"1px" }}>
                  {log.amount} {log.unit} · {new Date(log.ts).toLocaleDateString()} {new Date(log.ts).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
                </div>
                {log.note && <div style={{ color:"#444", fontStyle:"italic", fontSize:"10px", fontFamily:"'Georgia',serif", marginTop:"2px" }}>"{log.note}"</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── LOG ACTIVITY ─────────────────────────────────────────────────────────────
function LogActivity({ user, onLog }) {
  const acts = ACTS[user.type];
  const [sel, setSel]       = useState(null);
  const [amount, setAmount] = useState("");
  const [note, setNote]     = useState("");
  const [done, setDone]     = useState(false);

  const act = acts.find(a=>a.id===sel);
  const pts = act ? Math.round((parseFloat(amount)||0) * act.pts) : 0;

  const submit = () => {
    if (!sel || !amount || pts<=0) return;
    onLog({ activityId:sel, label:act.label, amount:parseFloat(amount), unit:act.unit, points:pts, note, ts:Date.now(), userId:user.id });
    setDone(true);
    setTimeout(() => { setDone(false); setSel(null); setAmount(""); setNote(""); }, 2200);
  };

  if (done) return (
    <div style={{ background:"#050f00", border:"1px solid #1a3300", borderRadius:"4px", padding:"40px", textAlign:"center" }}>
      <div style={{ fontSize:"44px", marginBottom:"10px" }}>✅</div>
      <div style={{ fontSize:"30px", fontFamily:"'Bebas Neue',sans-serif", color:"#00ff88" }}>OFFERING ACCEPTED</div>
      <div style={{ color:"#336633", fontFamily:"'Courier New',monospace", fontSize:"10px", marginTop:"8px" }}>+{pts} points locked in. The plate gets closer.</div>
    </div>
  );

  return (
    <div style={S.card}>
      <div style={{ ...S.label, color:user.color }}>LOG YOUR OFFERING</div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(145px,1fr))", gap:"7px", marginBottom:"18px" }}>
        {acts.map(a => (
          <button key={a.id} onClick={() => setSel(a.id)}
            style={{ background:sel===a.id?`${user.color}16`:"#080808", border:`1px solid ${sel===a.id?user.color:"#1a1a1a"}`, borderRadius:"2px", padding:"11px", cursor:"pointer", textAlign:"left", transition:"all 0.15s" }}>
            <div style={{ fontSize:"18px", marginBottom:"3px" }}>{a.icon}</div>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"12px", color:sel===a.id?user.color:"#aaa", letterSpacing:"0.05em", lineHeight:1.2 }}>{a.label}</div>
            <div style={{ fontFamily:"'Courier New',monospace", fontSize:"8px", color:"#2a2a2a", marginTop:"3px" }}>{a.pts} pts / {a.unit}</div>
          </button>
        ))}
      </div>
      {sel && (
        <div style={{ borderTop:"1px solid #111", paddingTop:"18px" }}>
          <div style={{ marginBottom:"10px" }}>
            <div style={{ fontFamily:"'Courier New',monospace", fontSize:"8px", color:"#333", letterSpacing:"0.2em", marginBottom:"5px" }}>{act?.unit?.toUpperCase()}</div>
            <input type="number" min="0" step="0.1" value={amount} onChange={e=>setAmount(e.target.value)} placeholder={act?.ph}
              style={{ width:"100%", background:"#080808", border:"1px solid #1e1e1e", borderRadius:"2px", padding:"11px", color:"#fff", fontFamily:"'Courier New',monospace", fontSize:"12px", outline:"none", boxSizing:"border-box" }}/>
          </div>
          <div style={{ marginBottom:"14px" }}>
            <div style={{ fontFamily:"'Courier New',monospace", fontSize:"8px", color:"#333", letterSpacing:"0.2em", marginBottom:"5px" }}>TRASH TALK (OPTIONAL)</div>
            <input type="text" value={note} onChange={e=>setNote(e.target.value)} placeholder="Let the boys know..."
              style={{ width:"100%", background:"#080808", border:"1px solid #1e1e1e", borderRadius:"2px", padding:"11px", color:"#fff", fontFamily:"'Courier New',monospace", fontSize:"12px", outline:"none", boxSizing:"border-box" }}/>
          </div>
          {pts>0 && <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"22px", color:"#FFD600", marginBottom:"12px" }}>+{pts} POINTS INCOMING</div>}
          <button onClick={submit} style={{ width:"100%", background:`linear-gradient(90deg,${user.color},${user.color}bb)`, border:"none", borderRadius:"2px", padding:"15px", color:"#000", fontSize:"14px", fontFamily:"'Bebas Neue',sans-serif", letterSpacing:"0.2em", cursor:"pointer" }}>
            DROP THAT LOAD
          </button>
        </div>
      )}
    </div>
  );
}

// ─── TIER LIST ────────────────────────────────────────────────────────────────
function TierList({ personal, onUpdate }) {
  const tierList = personal.tierList  || {};
  const foods    = personal.customFoods || [];
  const [dragging, setDragging]     = useState(null);
  const [hovering, setHovering]     = useState(null);
  const [name, setName]             = useState("");
  const [emoji, setEmoji]           = useState("🍔");
  const [pickerOpen, setPickerOpen] = useState(false);

  const getTier = (id) => { for (const t of TIERS) if ((tierList[t.id]||[]).includes(id)) return t.id; return null; };
  const unranked = foods.filter(f => !getTier(f.id));

  const moveToTier = (foodId, tierId) => {
    const tl = {};
    for (const t of TIERS) tl[t.id] = (tierList[t.id]||[]).filter(id=>id!==foodId);
    if (tierId) tl[tierId] = [...(tl[tierId]||[]), foodId];
    onUpdate({ tierList:tl, customFoods:foods });
  };
  const addFood = () => {
    if (!name.trim()) return;
    const id = `cf_${Date.now()}`;
    onUpdate({ tierList, customFoods:[...foods, {id, name:name.trim(), emoji}] });
    setName(""); setEmoji("🍔"); setPickerOpen(false);
  };
  const removeFood = (foodId) => {
    const tl = {};
    for (const t of TIERS) tl[t.id] = (tierList[t.id]||[]).filter(id=>id!==foodId);
    onUpdate({ tierList:tl, customFoods:foods.filter(f=>f.id!==foodId) });
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
      <div style={S.card}>
        <div style={S.label}>ADD FOOD TO YOUR LIST</div>
        <div style={{ display:"flex", gap:"7px", flexWrap:"wrap", alignItems:"center" }}>
          <div style={{ position:"relative" }}>
            <button onClick={() => setPickerOpen(!pickerOpen)}
              style={{ background:"#111", border:"1px solid #1e1e1e", borderRadius:"2px", padding:"9px 13px", fontSize:"18px", cursor:"pointer", lineHeight:1 }}>{emoji}</button>
            {pickerOpen && (
              <div style={{ position:"absolute", top:"calc(100% + 4px)", left:0, zIndex:50, background:"#111", border:"1px solid #1e1e1e", borderRadius:"3px", padding:"8px", display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"3px", width:"210px", maxHeight:"150px", overflowY:"auto" }}>
                {FOOD_EMOJIS.map(e => (
                  <button key={e} onClick={() => { setEmoji(e); setPickerOpen(false); }}
                    style={{ background:"none", border:"none", fontSize:"17px", cursor:"pointer", padding:"3px", borderRadius:"2px" }}
                    onMouseEnter={el=>el.target.style.background="#1a1a1a"}
                    onMouseLeave={el=>el.target.style.background="none"}>{e}</button>
                ))}
              </div>
            )}
          </div>
          <input value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addFood()} placeholder="Name the food, king..."
            style={{ flex:1, minWidth:"100px", background:"#080808", border:"1px solid #1e1e1e", borderRadius:"2px", padding:"9px 11px", color:"#fff", fontFamily:"'Courier New',monospace", fontSize:"12px", outline:"none" }}/>
          <button onClick={addFood} style={S.btn("#FF4D00","#000")}>ADD IT</button>
        </div>
      </div>

      <div style={S.card}>
        <div style={S.label}>DRAG TO RANK YOUR PICKS</div>
        <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
          {TIERS.map(tier => (
            <div key={tier.id} style={{ display:"flex", gap:"5px", alignItems:"stretch" }}>
              <div style={{ width:"36px", background:tier.bg, border:`1px solid ${tier.color}33`, borderRadius:"2px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"19px", color:tier.color }}>{tier.id}</span>
              </div>
              <div onDragOver={e=>{e.preventDefault();setHovering(tier.id);}} onDragLeave={()=>setHovering(null)}
                onDrop={e=>{e.preventDefault();if(dragging)moveToTier(dragging,tier.id);setDragging(null);setHovering(null);}}
                style={{ flex:1, minHeight:"48px", background:hovering===tier.id?`${tier.color}0c`:"#080808", border:`1px dashed ${hovering===tier.id?tier.color:"#141414"}`, borderRadius:"2px", padding:"5px", display:"flex", flexWrap:"wrap", gap:"4px", alignItems:"center", transition:"all 0.15s" }}>
                {(tierList[tier.id]||[]).map(fid => {
                  const f = foods.find(f=>f.id===fid);
                  return f ? (
                    <div key={fid} draggable onDragStart={()=>setDragging(fid)}
                      style={{ background:"#111", border:`1px solid ${tier.color}25`, borderRadius:"2px", padding:"4px 8px", cursor:"grab", display:"flex", alignItems:"center", gap:"4px", fontSize:"10px", color:"#bbb", fontFamily:"'Courier New',monospace", userSelect:"none" }}>
                      {f.emoji} {f.name}
                      <span onClick={e=>{e.stopPropagation();removeFood(fid);}} style={{ color:"#2a2a2a", marginLeft:"3px", cursor:"pointer", fontSize:"9px" }}>✕</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          ))}
        </div>
        {unranked.length>0 && (
          <div style={{ marginTop:"10px" }}>
            <div style={{ fontFamily:"'Courier New',monospace", fontSize:"8px", color:"#222", letterSpacing:"0.2em", marginBottom:"5px" }}>UNRANKED — DRAG UP TO TIER</div>
            <div onDragOver={e=>{e.preventDefault();setHovering("unranked");}} onDragLeave={()=>setHovering(null)}
              onDrop={e=>{e.preventDefault();if(dragging)moveToTier(dragging,null);setDragging(null);setHovering(null);}}
              style={{ display:"flex", flexWrap:"wrap", gap:"4px", minHeight:"38px", padding:"7px", background:hovering==="unranked"?"#111":"#050505", border:"1px dashed #141414", borderRadius:"2px", transition:"all 0.15s" }}>
              {unranked.map(f => (
                <div key={f.id} draggable onDragStart={()=>setDragging(f.id)}
                  style={{ background:"#111", border:"1px solid #1a1a1a", borderRadius:"2px", padding:"4px 8px", cursor:"grab", display:"flex", alignItems:"center", gap:"4px", fontSize:"10px", color:"#555", fontFamily:"'Courier New',monospace", userSelect:"none" }}>
                  {f.emoji} {f.name}
                  <span onClick={()=>removeFood(f.id)} style={{ color:"#2a2a2a", marginLeft:"3px", cursor:"pointer", fontSize:"9px" }}>✕</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {foods.length===0 && <div style={{ textAlign:"center", padding:"22px", color:"#1a1a1a", fontFamily:"'Courier New',monospace", fontSize:"10px" }}>Add some food above. The list doesn't fill itself.</div>}
      </div>
    </div>
  );
}

// ─── LEADERBOARD ──────────────────────────────────────────────────────────────
function Leaderboard({ weekLogs, shared }) {
  const pts    = USERS.reduce((a,u) => { a[u.id]=weekLogs.filter(l=>l.userId===u.id).reduce((s,l)=>s+l.points,0); return a; }, {});
  const ranked = [...USERS].sort((a,b) => pts[b.id]-pts[a.id]);
  const medals = ["🥇","🥈","🥉"];
  const roasts = ["Carrying the group on his back. Respect.","Solid. Reliable. Not embarrassing.","The effort is… technically present."];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
      <div style={S.card}>
        <div style={S.label}>THIS WEEK'S STANDINGS</div>
        <div style={{ display:"flex", flexDirection:"column", gap:"7px" }}>
          {ranked.map((u,i) => {
            const p=pts[u.id], pp=Math.min((p/WEEKLY_TARGET)*100,100);
            return (
              <div key={u.id} style={{ background:"#080808", border:`1px solid ${u.color}18`, borderRadius:"2px", padding:"14px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"9px" }}>
                  <span style={{ fontSize:"20px" }}>{medals[i]||"💀"}</span>
                  <span style={{ fontSize:"20px" }}>{u.emoji}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"16px", color:u.color, letterSpacing:"0.1em" }}>{u.name}</div>
                    <div style={{ fontFamily:"'Georgia',serif", fontSize:"9px", color:"#2a2a2a", fontStyle:"italic" }}>{roasts[i]}</div>
                  </div>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"24px", color:"#fff" }}>{p}<span style={{fontSize:"9px",color:"#2a2a2a"}}> pts</span></div>
                </div>
                <div style={{ height:"3px", background:"#111", borderRadius:"2px", overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pp}%`, background:`linear-gradient(90deg,${u.color},${u.color}55)`, borderRadius:"2px", transition:"width 0.8s" }}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={S.card}>
        <div style={S.label}>ALL-TIME FEAST COUNT</div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(30px,7vw,52px)", color:"#FFD600" }}>
          {shared.redemptions?.length||0} <span style={{ fontSize:"14px", color:"#2a2a2a" }}>FEASTS CLAIMED</span>
        </div>
        <div style={{ fontFamily:"'Courier New',monospace", fontSize:"9px", color:"#2a2a2a", marginTop:"3px" }}>
          {(shared.bankedFeasts||0)>0 ? `+ ${shared.bankedFeasts} in the vault right now` : "Vault currently empty"}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [user,    setUser]    = useState(null);
  const [tab,     setTab]     = useState("dashboard");
  const [shared,  setShared]  = useState({ logs:[], bankedFeasts:0, redemptions:[] });
  const [personal,setPersonal]= useState({});
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState(null);
  const [countdown,setCountdown]=useState(false);
  const [quote]               = useState(randQ);
  const prevPct               = useRef(0);

  useEffect(() => {
    (async () => { const d=await loadShared(); if(d) setShared(d); setLoading(false); })();
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => { const d=await loadPersonal(user.id); if(d) setPersonal(d); })();
  }, [user]);

  const ws          = getWeekStart();
  const allWeekLogs = (shared.logs||[]).filter(l=>l.ts>=ws);
  const lastReset   = [...allWeekLogs].reverse().find(l=>l._reset);
  const weekLogs    = lastReset
    ? allWeekLogs.filter(l=>l.ts>lastReset.ts && !l._reset)
    : allWeekLogs.filter(l=>!l._reset);

  const weekTotal = weekLogs.reduce((s,l)=>s+l.points,0);
  const pct       = Math.min((weekTotal/WEEKLY_TARGET)*100,100);

  useEffect(() => {
    if (prevPct.current<100 && pct>=100 && notif.granted()) {
      notif.send("🍽️ FEAST UNLOCKED!", "The group hit the target. Go get that meal, kings.");
    }
    prevPct.current = pct;
  }, [pct]);

  const toast_ = (msg) => { setToast(msg); setTimeout(()=>setToast(null), 3200); };

  const handleLog = async (entry) => {
    const upd = {...shared, logs:[...(shared.logs||[]),entry]};
    setShared(upd); await saveShared(upd);
  };
  const handleBank = async () => {
    if (pct<100) return;
    const banked = (shared.bankedFeasts||0)+1;
    const r = {_reset:true,ts:Date.now(),label:"WEEK RESET — feast banked",points:0,userId:"system",amount:0,unit:"",note:""};
    const upd = {...shared, bankedFeasts:banked, logs:[...(shared.logs||[]),r]};
    setShared(upd); await saveShared(upd);
    toast_("🏦 Feast banked. The vault grows heavier.");
    notif.send("🏦 Feast Banked","Counter reset. Start earning the next one.");
  };
  const handleRedeem = async () => {
    if (!(shared.bankedFeasts>0)) return;
    const redemptions = [...(shared.redemptions||[]),{ts:Date.now()}];
    const upd = {...shared, bankedFeasts:shared.bankedFeasts-1, redemptions};
    setShared(upd); await saveShared(upd);
    toast_("🍽️ FEAST REDEEMED. Go get it, kings.");
    notif.send("🍽️ FEAST REDEEMED","The boys are eating tonight.");
  };
  const handleResetWeek = async () => {
    const r = {_reset:true,ts:Date.now(),label:"MANUAL WEEK RESET",points:0,userId:"system",amount:0,unit:"",note:""};
    const upd = {...shared, logs:[...(shared.logs||[]),r]};
    setShared(upd); await saveShared(upd);
    toast_("↺ Week wiped. Fresh start. No excuses.");
  };
  const handlePersonal = async (data) => {
    const upd = {...personal,...data};
    setPersonal(upd); await savePersonal(user.id, upd);
  };

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#050505", display:"flex", alignItems:"center", justifyContent:"center", color:"#1a1a1a", fontFamily:"'Courier New',monospace", fontSize:"10px", letterSpacing:"0.3em" }}>
      LOADING THE GOODS...
    </div>
  );
  if (!user) return <PinInput onSuccess={setUser}/>;
  if (countdown) return <FeastCountdown weekLogs={weekLogs} shared={shared} onBank={handleBank} onRedeem={handleRedeem} onExit={()=>setCountdown(false)}/>;

  const TABS = [
    {id:"dashboard", label:"Dashboard", icon:"📊"},
    {id:"log",       label:"Log",       icon:"💪"},
    {id:"tiers",     label:"Tiers",     icon:"🍽️"},
    {id:"board",     label:"Standings", icon:"🏆"},
    {id:"notifs",    label:"Alerts",    icon:"🔔"},
  ];
  const myPts = weekLogs.filter(l=>l.userId===user.id).reduce((s,l)=>s+l.points,0);

  return (
    <div style={{ minHeight:"100vh", background:"#050505", color:"#fff", fontFamily:"'Bebas Neue','Impact',sans-serif" }}>
      {toast && (
        <div style={{ position:"fixed", top:"64px", left:"50%", transform:"translateX(-50%)", background:"#0d0d0d", border:"1px solid #FFD600", borderRadius:"3px", padding:"10px 20px", fontFamily:"'Bebas Neue',sans-serif", fontSize:"13px", color:"#FFD600", zIndex:200, letterSpacing:"0.1em", whiteSpace:"nowrap", boxShadow:"0 4px 24px #000" }}>
          {toast}
        </div>
      )}

      <div style={{ background:"#080808", borderBottom:"1px solid #0f0f0f", padding:"0 clamp(12px,3vw,26px)", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ maxWidth:"860px", margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", height:"52px" }}>
          <div style={{ fontSize:"clamp(15px,3.5vw,20px)", letterSpacing:"0.08em" }}>
            <span style={{ color:"#fff" }}>GAINZ</span>
            <span style={{ background:"linear-gradient(90deg,#FF4D00,#FFD600)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}> FOR GRUB</span>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"7px" }}>
            <button onClick={()=>setCountdown(true)} title="Feast Countdown Mode"
              style={{ background:"none", border:"1px solid #1a1a1a", borderRadius:"2px", padding:"4px 8px", cursor:"pointer", fontSize:"14px", lineHeight:1, color:"#555" }}>⏱</button>
            <div style={{ display:"flex", alignItems:"center", gap:"5px", background:"#0d0d0d", border:`1px solid ${user.color}22`, borderRadius:"2px", padding:"4px 9px" }}>
              <span style={{ fontSize:"13px" }}>{user.emoji}</span>
              <span style={{ color:user.color, fontSize:"11px", letterSpacing:"0.1em" }}>{user.name}</span>
              <span style={{ color:"#FFD600", fontSize:"12px", marginLeft:"3px" }}>{myPts}<span style={{fontSize:"8px",color:"#2a2a2a"}}>pts</span></span>
            </div>
            <button onClick={()=>setUser(null)} style={{ background:"none", border:"1px solid #141414", color:"#2a2a2a", padding:"4px 7px", borderRadius:"2px", cursor:"pointer", fontSize:"9px", fontFamily:"'Courier New',monospace" }}>OUT</button>
          </div>
        </div>
      </div>

      <div style={{ background:"#060606", borderBottom:"1px solid #0c0c0c", overflowX:"auto" }}>
        <div style={{ maxWidth:"860px", margin:"0 auto", display:"flex" }}>
          {TABS.map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{ flex:"1 1 auto", background:"none", border:"none", borderBottom:`2px solid ${tab===t.id?user.color:"transparent"}`, color:tab===t.id?user.color:"#2a2a2a", padding:"12px clamp(6px,1.8vw,14px)", cursor:"pointer", fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(9px,2.2vw,12px)", letterSpacing:"0.1em", transition:"all 0.15s", whiteSpace:"nowrap" }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:"860px", margin:"0 auto", padding:"clamp(12px,3vw,24px)" }}>
        <div style={{ background:"#080808", border:"1px solid #0f0f0f", borderRadius:"2px", padding:"8px 13px", marginBottom:"18px", display:"flex", gap:"7px", alignItems:"center" }}>
          <span style={{ color:"#FF4D00", fontSize:"12px", flexShrink:0 }}>🔥</span>
          <span style={{ fontFamily:"'Georgia',serif", fontStyle:"italic", color:"#444", fontSize:"11px" }}>{quote}</span>
        </div>
        {tab==="dashboard" && <Dashboard weekLogs={weekLogs} shared={shared} onBank={handleBank} onRedeem={handleRedeem} onResetWeek={handleResetWeek} onEnterCountdown={()=>setCountdown(true)}/>}
        {tab==="log"       && <LogActivity user={user} onLog={handleLog}/>}
        {tab==="tiers"     && <TierList personal={personal} onUpdate={handlePersonal}/>}
        {tab==="board"     && <Leaderboard weekLogs={weekLogs} shared={shared}/>}
        {tab==="notifs"    && <NotifPanel user={user}/>}
      </div>
    </div>
  );
}
