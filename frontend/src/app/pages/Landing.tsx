import React, { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Link } from "react-router";

/* ─── GLOBAL STYLES ──────────────────────────────────────────────────────── */
const GlobalStyles = (): ReactNode => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=DM+Sans:wght@300;400;500;600&family=Space+Mono:wght@400;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --dark: #0D0D0D; --dark2: #141414; --light: #F7F4EF;
      --gold: #C89B5E; --gold2: #E8BE84; --gold3: #A07840;
      --text-dark: #1F2937; --text-muted: #6B7280;
      --cursor: none;
    }
    @media (hover: none) {
      :root { --cursor: pointer; }
    }
    html { scroll-behavior: smooth; }
    body { font-family: 'DM Sans', sans-serif; background: var(--dark); color: #fff; overflow-x: hidden; }
    body.has-cursor { cursor: none; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: var(--dark); }
    ::-webkit-scrollbar-thumb { background: var(--gold); border-radius: 2px; }
    ::selection { background: var(--gold); color: var(--dark); }

    /* Word-by-word title reveal */
    .wr-wrap { overflow: hidden; display: inline-block; }
    .wr {
      display: inline-block; opacity: 0; transform: translateY(110%);
      transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
    }
    .wr.show { opacity: 1; transform: translateY(0); }

    /* Outline stroke fill */
    .outline-text { color: transparent; -webkit-text-stroke: 1.5px var(--gold); transition: color 1s ease; }
    .outline-text.filled { color: var(--gold); }

    /* Generic scroll reveal — fade up */
    .sr { opacity:0; transform:translateY(56px); transition: opacity .85s cubic-bezier(0.16,1,0.3,1), transform .85s cubic-bezier(0.16,1,0.3,1); }
    .sr.vis { opacity:1; transform:translateY(0); }

    /* Slide from left */
    .sl { opacity:0; transform:translateX(-80px); transition: opacity .9s cubic-bezier(0.16,1,0.3,1), transform .9s cubic-bezier(0.16,1,0.3,1); }
    .sl.vis { opacity:1; transform:translateX(0); }

    /* Slide from right */
    .sr2 { opacity:0; transform:translateX(80px); transition: opacity .9s cubic-bezier(0.16,1,0.3,1), transform .9s cubic-bezier(0.16,1,0.3,1); }
    .sr2.vis { opacity:1; transform:translateX(0); }

    @keyframes marquee   { to { transform: translateX(-50%); } }
    @keyframes float     { 0%,100%{transform:translateY(0)rotate(0deg);} 40%{transform:translateY(-14px)rotate(1deg);} 70%{transform:translateY(-7px)rotate(-.5deg);} }
    @keyframes pulse-gold{ 0%,100%{box-shadow:0 0 0 0 rgba(200,155,94,.45);} 50%{box-shadow:0 0 0 14px rgba(200,155,94,0);} }
    @keyframes shimmer   { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
    @keyframes draw-line { from{stroke-dashoffset:600;} to{stroke-dashoffset:0;} }
    @keyframes ripple    { 0%{transform:scale(0);opacity:.6;} 100%{transform:scale(4);opacity:0;} }
    @keyframes spin-slow { to{transform:rotate(360deg);} }
    @keyframes blink     { 0%,100%{opacity:1;} 50%{opacity:0;} }
    @keyframes lockPulse { 0%,100%{transform:scale(1);} 50%{transform:scale(1.18) rotate(-6deg);} }

    .gold-shimmer {
      background: linear-gradient(90deg,var(--gold),var(--gold2),var(--gold),var(--gold3),var(--gold));
      background-size: 200% auto;
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      animation: shimmer 4s linear infinite;
    }
    .btn-ripple { position:relative; overflow:hidden; }
    .btn-ripple::after { content:''; position:absolute; border-radius:50%; background:rgba(255,255,255,.28); transform:scale(0); width:100px; height:100px; left:50%; top:50%; margin:-50px 0 0 -50px; }
    .btn-ripple:active::after { animation:ripple .5s ease-out; }

    .fcard { transition:transform .4s cubic-bezier(.34,1.56,.64,1),box-shadow .4s ease,border-color .3s; }
    .fcard:hover { transform:translateY(-10px) scale(1.02); box-shadow:0 24px 64px rgba(200,155,94,.22),0 0 0 1px rgba(200,155,94,.35); border-color:rgba(200,155,94,.35)!important; }

    .pcard { transition:transform .4s cubic-bezier(.34,1.56,.64,1),box-shadow .4s; }
    .pcard:hover { transform:translateY(-8px); box-shadow:0 24px 80px rgba(200,155,94,.25); }

    .tcard { transition:transform .3s ease,box-shadow .3s; }
    .tcard:hover { transform:translateY(-6px); box-shadow:0 16px 48px rgba(0,0,0,.15); }

    .prcard { transition:transform .4s cubic-bezier(.34,1.56,.64,1); }
    .prcard:hover { transform:translateY(-14px); }

    .nav-link { position:relative; color:rgba(255,255,255,.7); text-decoration:none; font-size:14px; font-weight:500; transition:color .3s; }
    .nav-link::after { content:''; position:absolute; bottom:-2px; left:0; width:0; height:1px; background:var(--gold); transition:width .3s; }
    .nav-link:hover { color:var(--gold); }
    .nav-link:hover::after { width:100%; }

    .cursor { width:12px; height:12px; background:var(--gold); border-radius:50%; position:fixed; pointer-events:none; z-index:9999; mix-blend-mode:difference; display: none; }
    .cursor-follower { width:36px; height:36px; border:1px solid rgba(200,155,94,.5); border-radius:50%; position:fixed; pointer-events:none; z-index:9998; transition:left .12s ease,top .12s ease; display: none; }
    
    @media (hover: hover) and (pointer: fine) {
      .cursor, .cursor-follower { display: block; }
    }
    
    .lock-badge { animation:lockPulse 2.5s ease-in-out infinite; display:inline-block; }

    /* Responsive Utilities */
    @media (max-width: 768px) {
      .sl, .sr2 { transform: translateY(30px); }
      .sl.vis, .sr2.vis { transform: translateY(0); }
    }
  `}</style>
);

/* ─── CURSOR ─────────────────────────────────────────────────────────────── */
const CustomCursor = (): ReactNode => {
  const c = useRef<HTMLDivElement | null>(null), f = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const isTouch = window.matchMedia("(hover: none)").matches;
    if (isTouch) return;

    document.body.classList.add('has-cursor');
    const mv = (e: MouseEvent) => {
      if (c.current) { c.current.style.left=e.clientX-6+"px"; c.current.style.top=e.clientY-6+"px"; }
      if (f.current) { f.current.style.left=e.clientX-18+"px"; f.current.style.top=e.clientY-18+"px"; }
    };
    window.addEventListener("mousemove",mv);
    return ()=>{
      window.removeEventListener("mousemove",mv);
      document.body.classList.remove('has-cursor');
    };
  },[]);
  return (<><div ref={c} className="cursor"/><div ref={f} className="cursor-follower"/></>);
};

/* ─── SCROLL OBSERVER ────────────────────────────────────────────────────── */
const useScrollObserver = () => {
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add("vis");
        e.target.querySelectorAll(".wr").forEach((w,i) => setTimeout(()=>w.classList.add("show"),i*80));
      });
    },{ threshold:0.1 });
    document.querySelectorAll(".sr,.sl,.sr2").forEach(el=>obs.observe(el));
    return ()=>obs.disconnect();
  },[]);
};

/* ─── SCRAMBLE ───────────────────────────────────────────────────────────── */
const useScramble = (target: string, go = true): string => {
  const [d,setD] = useState(target);
  const chars="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%";
  useEffect(()=>{
    if(!go)return;
    let it=0;
    const iv=setInterval(()=>{
      setD(target.split("").map((c,i)=>{ if(c===" ")return " "; if(i<it)return target[i]; return chars[Math.floor(Math.random()*chars.length)]; }).join(""));
      if(it>=target.length)clearInterval(iv); it+=0.5;
    },40);
    return()=>clearInterval(iv);
  },[target,go]);
  return d;
};

/* ─── OUTLINE REVEAL ─────────────────────────────────────────────────────── */
type ORProps = { text: string };
const OR = ({text}: ORProps): ReactNode => {
  const ref = useRef<HTMLSpanElement | null>(null); const [f,setF]=useState(false);
  useEffect(()=>{
    const obs=new IntersectionObserver(([e])=>{ if(e.isIntersecting)setTimeout(()=>setF(true),400); },{threshold:.4});
    if(ref.current)obs.observe(ref.current);
    return()=>obs.disconnect();
  },[]);
  return <span ref={ref} className={`outline-text${f?" filled":""}`}>{text}</span>;
};

/* ─── ANIMATED SECTION TITLE ─────────────────────────────────────────────── */
type TitleProps = { eyebrow?: string; l1?: string; l2?: string; light?: boolean; center?: boolean };
const T = ({eyebrow,l1,l2,light=false,center=true}: TitleProps): ReactNode => {
  const ref = useRef<HTMLDivElement | null>(null); const [vis,setVis]=useState(false);
  useEffect(()=>{
    const obs=new IntersectionObserver(([e])=>{ if(e.isIntersecting)setVis(true); },{threshold:.2});
    if(ref.current)obs.observe(ref.current);
    return()=>obs.disconnect();
  },[]);
  const c=light?"#fff":"#1F2937";
  const w1=l1?l1.split(" "):[]; const w2=l2?l2.split(" "):[];
  return (
    <div ref={ref} style={{textAlign:center?"center":"left",marginBottom:72}}>
      {eyebrow&&<p style={{fontSize:11,letterSpacing:".16em",color:"#C89B5E",textTransform:"uppercase",fontFamily:"'Space Mono',monospace",marginBottom:18,opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(20px)",transition:"opacity .6s,transform .6s"}}>{eyebrow}</p>}
      <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(38px,4.5vw,64px)",fontWeight:700,lineHeight:1.08,color:c}}>
        <span style={{display:"block"}}>
          {w1.map((w,i)=><span key={i} className="wr-wrap" style={{marginRight:".28em"}}><span className={`wr${vis?" show":""}`} style={{transitionDelay:`${i*80}ms`}}>{w}</span></span>)}
        </span>
        {l2&&<span style={{display:"block"}}>
          {w2.map((w,i)=><span key={i} className="wr-wrap" style={{marginRight:".28em"}}><span className={`wr${vis?" show":""}`} style={{transitionDelay:`${(w1.length+i)*80}ms`}}>{w}</span></span>)}
        </span>}
      </h2>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
const Navbar = (): ReactNode => {
  const [scrolled,setScrolled]=useState(false);
  const [mobileMenuOpen,setMobileMenuOpen]=useState(false);
  const [isTouch, setIsTouch] = useState(false);
  
  useEffect(()=>{ 
    const h=()=>setScrolled(window.scrollY>40); 
    window.addEventListener("scroll",h); 
    return()=>window.removeEventListener("scroll",h); 
  },[]);

  return (
    <>
      <nav style={{
        position:"fixed",top:0,left:0,right:0,zIndex:150,
        padding: "0 clamp(16px, 5vw, 56px)",
        height:72,display:"flex",alignItems:"center",justifyContent:"space-between",
        background:scrolled || mobileMenuOpen ? "rgba(13,13,13,.95)" : "transparent",
        backdropFilter:scrolled || mobileMenuOpen ? "blur(20px)" : "none",
        borderBottom:scrolled || mobileMenuOpen ? "1px solid rgba(200,155,94,.1)" : "none",
        transition:"all .3s ease-out"
      }}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,background:"linear-gradient(135deg,#C89B5E,#E8BE84)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#0D0D0D",fontFamily:"'Space Mono',monospace"}}>S</div>
          <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:600,color:"#fff"}}>StockSentinel</span>
        </div>
        
        {/* Desktop Links */}
        <div style={{display:"none", gap:36, alignItems:"center"}} className="desktop-links">
          {["Features","Pricing","How it Works","Testimonials"].map(l=><a key={l} href={`#${l.toLowerCase().replace(/ /g,"-")}`} className="nav-link">{l}</a>)}
          <Link to="/login" className="nav-link">Login</Link>
          <Link to="/signup" className="btn-ripple" style={{background:"linear-gradient(135deg,#C89B5E,#E8BE84)",color:"#0D0D0D",border:"none",padding:"10px 24px",borderRadius:8,fontSize:14,fontWeight:700,fontFamily:"'DM Sans',sans-serif",cursor:"var(--cursor)",textDecoration:"none"}}>Signup</Link>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: "none", border: "none", color: "#fff", cursor: "pointer", 
            display: "none", flexDirection: "column", gap: "6px", padding: "8px",
            transition: "all 0.3s"
          }}
        >
          <div style={{width: 24, height: 2.5, background: "#C89B5E", transition: "0.3s cubic-bezier(0.16, 1, 0.3, 1)", borderRadius: 10, transform: mobileMenuOpen ? "rotate(45deg) translate(6px, 6px)" : "none"}}/>
          <div style={{width: 24, height: 2.5, background: "#C89B5E", transition: "0.3s", opacity: mobileMenuOpen ? 0 : 1, borderRadius: 10}}/>
          <div style={{width: 24, height: 2.5, background: "#C89B5E", transition: "0.3s cubic-bezier(0.16, 1, 0.3, 1)", borderRadius: 10, transform: mobileMenuOpen ? "rotate(-45deg) translate(6px, -6px)" : "none"}}/>
        </button>

        <style>{`
          @media (min-width: 992px) {
            .desktop-links { display: flex !important; }
            .mobile-toggle { display: none !important; }
          }
          @media (max-width: 991px) {
            .mobile-toggle { display: flex !important; }
          }
        `}</style>
      </nav>

      {/* Mobile Menu Overlay */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 140, background: "#0D0D0D", 
        display: mobileMenuOpen ? "flex" : "none",
        flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "32px",
        padding: "0 24px",
        transition: "all 0.3s",
        opacity: mobileMenuOpen ? 1 : 0,
        pointerEvents: mobileMenuOpen ? "auto" : "none"
      }}>
        {["Features","Pricing","How it Works","Testimonials"].map(l=>(
          <a key={l} href={`#${l.toLowerCase().replace(/ /g,"-")}`} 
             onClick={() => setMobileMenuOpen(false)}
             style={{fontSize: "28px", fontWeight: "600", color: "#fff", textDecoration: "none", fontFamily: "'Cormorant Garamond', serif"}}>
            {l}
          </a>
        ))}
        <div style={{display: "flex", flexDirection: "column", gap: "16px", width: "100%", maxWidth: "300px", marginTop: "24px"}}>
          <Link to="/login" onClick={() => setMobileMenuOpen(false)} 
                style={{textAlign: "center", padding: "16px", border: "1px solid #C89B5E", borderRadius: "12px", color: "#fff", textDecoration: "none", fontWeight: "600"}}>
            Login
          </Link>
          <Link to="/signup" onClick={() => setMobileMenuOpen(false)}
                style={{textAlign: "center", padding: "16px", background: "linear-gradient(135deg, #C89B5E, #E8BE84)", borderRadius: "12px", color: "#0D0D0D", textDecoration: "none", fontWeight: "700"}}>
            Signup
          </Link>
        </div>
      </div>
    </>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
const Hero = (): ReactNode => {
  const [go,setGo]=useState(false);
  const [sy,setSy]=useState(0);
  const h1=useScramble("TAKE FULL CONTROL",go);
  const h2=useScramble("OF YOUR INVENTORY",go);
  useEffect(()=>{ const t=setTimeout(()=>setGo(true),400); const s=()=>setSy(window.scrollY); window.addEventListener("scroll",s); return()=>{ clearTimeout(t); window.removeEventListener("scroll",s); }; },[]);
  const py=sy*.28;
  return (
    <section style={{minHeight:"100vh",display:"flex",position:"relative",overflow:"hidden"}} className="hero-section">
      {/* Left */}
      <div className="hero-left" style={{background:"linear-gradient(140deg,#0D0D0D 0%,#141414 60%,#111 100%)",display:"flex",flexDirection:"column",justifyContent:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(200,155,94,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(200,155,94,.025) 1px,transparent 1px)",backgroundSize:"64px 64px"}}/>
        <div style={{position:"absolute",top:"18%",left:"8%",width:320,height:320,borderRadius:"50%",background:"radial-gradient(circle,rgba(200,155,94,.07) 0%,transparent 70%)",transform:`translateY(${py*.45}px)`,transition:"transform .1s"}}/>
        <div style={{position:"absolute",bottom:"12%",right:"8%",width:180,height:180,borderRadius:"50%",background:"radial-gradient(circle,rgba(200,155,94,.05) 0%,transparent 70%)",transform:`translateY(${-py*.25}px)`}}/>
        <div style={{position:"relative",zIndex:2,transform:`translateY(${py*.18}px)`}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(200,155,94,.1)",border:"1px solid rgba(200,155,94,.2)",borderRadius:100,padding:"6px 16px",marginBottom:32}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:"#C89B5E",animation:"pulse-gold 2s infinite"}}/>
            <span style={{fontSize:11,color:"rgba(200,155,94,.9)",fontFamily:"'Space Mono',monospace",letterSpacing:".1em"}}>INVENTORY INTELLIGENCE PLATFORM</span>
          </div>
          <h1 style={{fontFamily:"'Space Mono',monospace",fontSize:"clamp(26px,4.5vw,42px)",fontWeight:700,lineHeight:1.18,letterSpacing:".04em",marginBottom:8}}>
            <span style={{color:"#C89B5E"}}>{h1}<span style={{animation:"blink 1s infinite",color:"#C89B5E"}}>_</span></span><br/>
            <span className="gold-shimmer">{h2}</span>
          </h1>
          <p style={{fontSize:17,lineHeight:1.75,color:"rgba(255,255,255,.5)",maxWidth:440,marginTop:22,marginBottom:44,fontWeight:300}}>Real-time tracking, AI-powered insights, and seamless automation — built for businesses that demand precision at every level.</p>
          <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
            <button className="btn-ripple" style={{background:"linear-gradient(135deg,#C89B5E,#E8BE84)",color:"#0D0D0D",border:"none",padding:"16px 44px",borderRadius:10,fontSize:15,fontWeight:700,fontFamily:"'DM Sans',sans-serif",cursor:"var(--cursor)",animation:"pulse-gold 3s infinite",letterSpacing:".02em"}}>Start Free Trial →</button>
            <button style={{background:"transparent",color:"rgba(255,255,255,.65)",border:"1px solid rgba(255,255,255,.15)",padding:"16px 32px",borderRadius:10,fontSize:15,fontWeight:500,fontFamily:"'DM Sans',sans-serif",cursor:"var(--cursor)",transition:"all .3s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(200,155,94,.5)";e.currentTarget.style.color="#C89B5E";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.15)";e.currentTarget.style.color="rgba(255,255,255,.65)";}}>▶ Watch Demo</button>
          </div>
          <div style={{display:"flex",gap:44,marginTop:60,flexWrap:"wrap"}}>
            {[["10K+","Businesses"],["99.9%","Uptime"],["2.3M","SKUs Tracked"]].map(([n,l])=>(
              <div key={l}><div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:700,color:"#C89B5E"}}>{n}</div><div style={{fontSize:11,color:"rgba(255,255,255,.35)",letterSpacing:".08em",textTransform:"uppercase"}}>{l}</div></div>
            ))}
          </div>
        </div>
      </div>
      {/* Right */}
      <div className="hero-right" style={{background:"#F7F4EF",display:"flex",alignItems:"center",justifyContent:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle at 70% 30%,rgba(200,155,94,.08) 0%,transparent 60%)"}}/>
        <div style={{width:"100%",maxWidth:360,position:"relative",zIndex:2,animation:"float 6s ease-in-out infinite"}}>
          {/* Card UI elements ... */}
          <div style={{background:"#fff",borderRadius:20,boxShadow:"0 32px 80px rgba(0,0,0,.12)",overflow:"hidden",border:"1px solid rgba(200,155,94,.1)"}}>
            <div style={{background:"#0D0D0D",padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",gap:6}}>{["#FF5F57","#FEBC2E","#28C840"].map(c=><div key={c} style={{width:8,height:8,borderRadius:"50%",background:c}}/>)}</div>
              <span style={{fontSize:11,color:"rgba(255,255,255,.4)",fontFamily:"'Space Mono',monospace"}}>sentinel.dashboard</span>
              <div style={{width:14,height:14,borderRadius:3,background:"rgba(200,155,94,.3)"}}/>
            </div>
            <div style={{padding:20}}>
              <div style={{display:"flex",gap:8,marginBottom:14}}>
                {[["SKUs","4,821","+12%"],["Low","23","⚠️"],["Orders","142","Today"]].map(([l,v,s])=>(
                  <div key={l} style={{flex:1,background:"#F7F4EF",borderRadius:10,padding:"9px 8px",border:"1px solid rgba(200,155,94,.1)"}}>
                    <div style={{fontSize:9,color:"#9CA3AF",textTransform:"uppercase",letterSpacing:".06em",marginBottom:3}}>{l}</div>
                    <div style={{fontSize:17,fontWeight:700,color:"#1F2937",fontFamily:"'Cormorant Garamond',serif"}}>{v}</div>
                    <div style={{fontSize:9,color:"#C89B5E",fontWeight:600}}>{s}</div>
                  </div>
                ))}
              </div>
              <div style={{background:"#F7F4EF",borderRadius:10,padding:"10px 12px",marginBottom:12}}>
                <div style={{fontSize:9,color:"#9CA3AF",marginBottom:6,fontWeight:600,textTransform:"uppercase",letterSpacing:".06em"}}>Stock Velocity</div>
                <svg width="100%" height="44" viewBox="0 0 300 44">
                  <defs><linearGradient id="sg" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#C89B5E" stopOpacity=".35"/><stop offset="100%" stopColor="#C89B5E" stopOpacity="0"/></linearGradient></defs>
                  <path d="M0,33 C30,28 50,18 80,20 C110,22 130,34 160,25 C190,15 210,8 240,12 C270,16 285,6 300,3" fill="none" stroke="#C89B5E" strokeWidth="2.5" style={{strokeDasharray:400,strokeDashoffset:0,animation:"draw-line 2s ease-out .5s both"}}/>
                  <path d="M0,33 C30,28 50,18 80,20 C110,22 130,34 160,25 C190,15 210,8 240,12 C270,16 285,6 300,3 L300,44 L0,44 Z" fill="url(#sg)"/>
                </svg>
              </div>
              {[{name:"Wireless Earbuds Pro",s:124,ok:true},{name:"USB-C Hub 7-in-1",s:12,ok:false},{name:"Laptop Stand Premium",s:87,ok:true}].map(item=>(
                <div key={item.name} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid rgba(0,0,0,.05)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{width:26,height:26,borderRadius:6,background:item.ok?"rgba(200,155,94,.1)":"rgba(239,68,68,.1)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>{item.ok?"📦":"⚠"}</div>
                    <span style={{fontSize:10,fontWeight:500,color:"#374151"}}>{item.name}</span>
                  </div>
                  <span style={{fontSize:10,fontWeight:700,color:item.ok?"#10B981":"#EF4444",fontFamily:"'Space Mono',monospace"}}>{item.s}u</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{width:"100%",height:50,background:"linear-gradient(to bottom,rgba(200,155,94,.07),transparent)",transform:"scaleY(-1)",filter:"blur(5px)",opacity:.35,borderRadius:"0 0 20px 20px",WebkitMaskImage:"linear-gradient(to bottom,rgba(0,0,0,.3),transparent)",maskImage:"linear-gradient(to bottom,rgba(0,0,0,.3),transparent)"}}/>
        </div>
      </div>

      <style>{`
        @media (max-width: 991px) {
          .hero-section { flex-direction: column !important; }
          .hero-left, .hero-right { flex: none !important; width: 100% !important; }
          .hero-left { padding: 120px 24px 60px !important; text-align: center; align-items: center; }
          .hero-right { padding: 60px 24px 100px !important; }
          .hero-left p { margin-left: auto !important; margin-right: auto !important; }
          .hero-left div[style*="justify-content: center"] { justify-content: center !important; }
          .hero-left div[style*="align-items: center"] { justify-content: center !important; }
        }
        @media (min-width: 992px) {
          .hero-left { flex: 0 0 54% !important; padding: 140px 60px 80px 80px !important; }
          .hero-right { flex: 0 0 46% !important; padding: 100px 48px 80px !important; }
        }
      `}</style>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
const TrustLogos = (): ReactNode => {
  const logos=["Shopify","WooCommerce","QuickBooks","Xero","Salesforce","HubSpot","Stripe","FedEx","DHL","Amazon Seller","BigCommerce","Etsy Pro"];
  return (
    <section style={{background:"#111",padding:"56px 0",overflow:"hidden",borderTop:"1px solid rgba(200,155,94,.07)",borderBottom:"1px solid rgba(200,155,94,.07)"}}>
      <p style={{textAlign:"center",fontSize:11,letterSpacing:".15em",color:"rgba(255,255,255,.25)",textTransform:"uppercase",marginBottom:32,fontFamily:"'Space Mono',monospace"}}>Trusted by 10,000+ growing businesses</p>
      <div style={{display:"flex",overflow:"hidden"}}>
        <div style={{display:"flex",gap:60,alignItems:"center",animation:"marquee 28s linear infinite",whiteSpace:"nowrap"}}>
          {[...logos,...logos].map((l,i)=><span key={i} style={{fontFamily:"'Cormorant Garamond',serif",fontSize:19,fontWeight:600,color:"rgba(255,255,255,.17)",cursor:"default",transition:"color .3s"}} onMouseEnter={e=>e.currentTarget.style.color="rgba(200,155,94,.7)"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,.17)"}>{l}</span>)}
        </div>
      </div>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
/*  IMAGE SECTION                                                             */
/* ══════════════════════════════════════════════════════════════════════════ */
const ImageSection = (): ReactNode => {
  const ref=useRef<HTMLElement | null>(null); const [vis,setVis]=useState(false);
  useEffect(()=>{
    const obs=new IntersectionObserver(([e])=>{ if(e.isIntersecting)setVis(true); },{threshold:.12});
    if(ref.current)obs.observe(ref.current);
    return()=>obs.disconnect();
  },[]);
  return (
    <section ref={ref} style={{background:"#F7F4EF",padding:"clamp(60px, 10vw, 120px) clamp(20px, 5vw, 80px)",overflow:"hidden"}}>
      <T eyebrow="THE PLATFORM" l1="Everything your team needs," l2="in one powerful place." />
      <div style={{maxWidth:1200,margin:"0 auto",display:"flex",gap:52,alignItems:"center"}} className="image-section-content">
        {/* Left bullets */}
        <div style={{flex:"0 0 38%",display:"flex",flexDirection:"column",gap:28}} className="image-section-left">
          {[
            {icon:"📦",title:"Manage Inventory in Real-Time",desc:"Track every SKU with live updates across all locations. Zero lag. Zero guesswork."},
            {icon:"🏬",title:"Multiple Warehouses, One View",desc:"Complete visibility across all your locations. Switch warehouses in a single click."},
            {icon:"📊",title:"Data-Driven Decisions Made Easy",desc:"Demand forecasting, turnover analysis, and performance dashboards that tell you what to do next."},
          ].map((item,i)=>(
            <div key={i} style={{display:"flex",gap:16,alignItems:"flex-start",opacity:vis?1:0,transform:vis?"translateX(0)":"translateX(-50px)",transition:`opacity .75s ease ${i*130+100}ms,transform .75s ease ${i*130+100}ms`}}>
              <div style={{width:46,height:46,borderRadius:12,background:"linear-gradient(135deg,rgba(200,155,94,.15),rgba(200,155,94,.04))",border:"1px solid rgba(200,155,94,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{item.icon}</div>
              <div>
                <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:20,fontWeight:700,color:"#1F2937",marginBottom:5}}>{item.title}</h3>
                <p style={{fontSize:13,lineHeight:1.65,color:"#6B7280"}}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Right image */}
        <div style={{flex:1,position:"relative",opacity:vis?1:0,transform:vis?"translateX(0) scale(1)":"translateX(60px) scale(.95)",transition:"opacity 1s cubic-bezier(0.16,1,0.3,1) .2s,transform 1s cubic-bezier(0.16,1,0.3,1) .2s"}} className="image-section-right">
          <div style={{position:"absolute",top:-28,right:-28,width:200,height:200,borderRadius:"50%",border:"1px solid rgba(200,155,94,.14)",zIndex:0}}/>
          <div style={{position:"absolute",bottom:-16,left:-16,width:110,height:110,borderRadius:"50%",background:"rgba(200,155,94,.05)",zIndex:0}}/>
          <div style={{position:"relative",zIndex:1,borderRadius:24,overflow:"hidden",boxShadow:"0 40px 100px rgba(0,0,0,.14)",border:"1px solid rgba(200,155,94,.12)"}}>
            <img src="https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80&auto=format&fit=crop" alt="Warehouse inventory" style={{width:"100%",height:420,objectFit:"cover",display:"block"}}/>
            <div style={{position:"absolute",bottom:20,left:20,right:20,background:"rgba(13,13,13,.88)",backdropFilter:"blur(12px)",borderRadius:14,padding:"14px 18px",border:"1px solid rgba(200,155,94,.2)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:10,color:"rgba(255,255,255,.4)",marginBottom:3,letterSpacing:".06em",textTransform:"uppercase",fontFamily:"'Space Mono',monospace"}}>Live Inventory Status</div>
                <div style={{fontSize:15,fontWeight:700,color:"#fff",fontFamily:"'Cormorant Garamond',serif"}}>4,821 SKUs · 6 warehouses synced</div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:"#10B981",animation:"pulse-gold 2s infinite"}}/>
                <span style={{fontSize:11,color:"#10B981",fontWeight:600}}>LIVE</span>
              </div>
            </div>
          </div>
          {/* Floating stats ... */}
        </div>
      </div>
      <style>{`
        @media (max-width: 991px) {
          .image-section-content { flex-direction: column !important; gap: 40px !important; }
          .image-section-left, .image-section-right { flex: none !important; width: 100% !important; }
        }
      `}</style>
    </section>
  );
};

const Features = (): ReactNode => {
  const features = [
    {icon:"📦",title:"Manage Inventory in Real-Time",desc:"Track stock levels, monitor product movement, and control everything from a single live dashboard. Zero lag, zero guessing.",tag:"Core"},
    {icon:"🏬",title:"Multiple Warehouses, One View",desc:"Handle inventory across any number of locations with complete visibility. Switch between warehouses instantly, from one screen.",tag:"Core"},
    {icon:"⚡",title:"Upload Hundreds of Products Instantly",desc:"Save hours by importing your entire catalog via CSV or Excel. Bulk operations made ridiculously simple — no dev required.",tag:"Popular"},
    {icon:"📊",title:"Data-Driven Decisions Made Easy",desc:"Get actionable insights into stock levels, trends, and SKU performance. Analytics that actually tell you what to do next.",tag:"Core"},
    {icon:"🔔",title:"Never Run Out of Stock Again",desc:"Intelligent low-stock alerts notify you before problems happen. Set custom thresholds per SKU, per warehouse, per channel.",tag:"Smart"},
    {icon:"🔗",title:"Connect Your Entire Tech Stack",desc:"500+ one-click integrations with Shopify, WooCommerce, QuickBooks, Xero, and every platform your business already runs on.",tag:"Integrations"},
  ];
  return (
    <section id="features" style={{background:"#0D0D0D",padding:"clamp(60px, 10vw, 120px) clamp(20px, 5vw, 80px)"}}>
      <T eyebrow="PLATFORM CAPABILITIES" l1="Everything you need to" l2="dominate inventory." light />
      <div style={{maxWidth:1200,margin:"0 auto",display:"grid",gap:24}} className="features-grid">
        {features.map((f,i)=>{
          const cls=i<3?"sl":"sr2";
          const delay=(i%3)*110;
          return (
            <div key={i} className={`${cls} fcard`} style={{background:"#141414",borderRadius:18,padding:"32px",border:"1px solid rgba(255,255,255,.06)",transitionDelay:`${delay}ms`}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:18}}>
                <div style={{width:52,height:52,borderRadius:14,background:"linear-gradient(135deg,rgba(200,155,94,.14),rgba(200,155,94,.04))",border:"1px solid rgba(200,155,94,.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>{f.icon}</div>
                <span style={{fontSize:9,letterSpacing:".1em",color:"#C89B5E",textTransform:"uppercase",fontFamily:"'Space Mono',monospace",background:"rgba(200,155,94,.08)",border:"1px solid rgba(200,155,94,.15)",padding:"3px 10px",borderRadius:100}}>{f.tag}</span>
              </div>
              <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:21,fontWeight:700,color:"#fff",marginBottom:10,lineHeight:1.2}}>{f.title}</h3>
              <p style={{fontSize:13,lineHeight:1.7,color:"rgba(255,255,255,.42)"}}>{f.desc}</p>
            </div>
          );
        })}
      </div>
      <style>{`
        .features-grid { grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 991px) { .features-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .features-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
/*  PREMIUM LOCKED FEATURES                                                   */
/* ══════════════════════════════════════════════════════════════════════════ */
const PremiumFeatures = (): ReactNode => {
  const premiums=[
    {emoji:"📤",title:"Export Your Data, Anytime",desc:"Download full inventory reports in CSV or Excel. Share with accountants, investors, or plug into your own BI tools instantly."},
    {emoji:"🔔",title:"Never Run Out of Stock Again",desc:"AI-powered smart alerts fire the moment inventory dips below your custom threshold. Act before it's too late — automatically."},
    {emoji:"⚡",title:"Bulk Upload at Lightning Speed",desc:"Upload thousands of products in seconds via CSV or Excel. No manual data entry. No wasted afternoons. Just results."},
  ];
  return (
    <section style={{background:"#F7F4EF",padding:"clamp(60px, 10vw, 120px) clamp(20px, 5vw, 80px)",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle at 50% 50%,rgba(200,155,94,.06) 0%,transparent 65%)"}}/>
      <T eyebrow="PREMIUM FEATURES" l1="Unlock features that" l2="serious businesses need." />
      {/* Upgrade banner */}
      <div className="sr upgrade-banner" style={{maxWidth:900,margin:"0 auto 56px",background:"linear-gradient(135deg,#0D0D0D,#1a1208)",borderRadius:20,padding:"28px 40px",border:"1px solid rgba(200,155,94,.3)",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 20px 60px rgba(200,155,94,.08)"}}>
        <div style={{display:"flex",alignItems:"center",gap:16}}>
          <div style={{fontSize:28}}>💎</div>
          <div>
            <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,color:"#fff"}}>Upgrade to Sentinel Pro</div>
            <div style={{fontSize:13,color:"rgba(255,255,255,.4)",marginTop:3}}>Unlock all premium features and scale without limits</div>
          </div>
        </div>
        <button className="btn-ripple" style={{background:"linear-gradient(135deg,#C89B5E,#E8BE84)",color:"#0D0D0D",border:"none",padding:"13px 32px",borderRadius:10,fontSize:14,fontWeight:700,fontFamily:"'DM Sans',sans-serif",cursor:"var(--cursor)",whiteSpace:"nowrap"}}>Upgrade Now →</button>
      </div>
      <div style={{maxWidth:1100,margin:"0 auto",display:"grid",gap:28}} className="premium-grid">
        {premiums.map((p,i)=>(
          <div key={i} className="sr pcard" style={{background:"linear-gradient(145deg,#1a1208,#241a0e)",borderRadius:20,padding:"36px 32px",border:"1px solid rgba(200,155,94,.25)",position:"relative",overflow:"hidden",transitionDelay:`${i*100}ms`}}>
            <div style={{position:"absolute",top:16,right:16}}>
              <div className="lock-badge" style={{width:34,height:34,borderRadius:"50%",background:"rgba(200,155,94,.15)",border:"1px solid rgba(200,155,94,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>🔒</div>
            </div>
            <div style={{position:"absolute",top:0,right:0,width:120,height:120,borderRadius:"0 20px 0 120px",background:"rgba(200,155,94,.04)"}}/>
            <div style={{fontSize:36,marginBottom:16}}>{p.emoji}</div>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,color:"#fff",marginBottom:10,lineHeight:1.2}}>{p.title}</h3>
            <p style={{fontSize:13,lineHeight:1.7,color:"rgba(255,255,255,.45)",marginBottom:24}}>{p.desc}</p>
            <div style={{display:"flex",alignItems:"center",gap:8,color:"#C89B5E",fontSize:13,fontWeight:600}}>
              <span>✦</span><span>Pro Plan Required</span>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .premium-grid { grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 991px) { 
          .premium-grid { grid-template-columns: repeat(2, 1fr); }
          .upgrade-banner { flex-direction: column; text-align: center; gap: 24px; padding: 24px !important; }
        }
        @media (max-width: 640px) { .premium-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
const HowItWorks = (): ReactNode => {
  const steps=[
    {num:"01",title:"Connect",desc:"Link your stores, warehouses, and supplier accounts in under 5 minutes."},
    {num:"02",title:"Configure",desc:"Set your reorder points, alert thresholds, and automation rules exactly how you want."},
    {num:"03",title:"Command",desc:"Watch Sentinel optimize your inventory in real time, 24/7, completely hands-free."},
  ];
  return (
    <section id="how-it-works" style={{background:"#0D0D0D",padding:"clamp(60px, 10vw, 120px) 24px",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(200,155,94,.04) 0%,transparent 70%)",pointerEvents:"none"}}/>
      <T eyebrow="THREE STEPS TO CONTROL" l1="From chaos" l2="to clarity." light />
      <div style={{display:"flex",position:"relative",maxWidth:1100,margin:"0 auto"}} className="steps-container">
        <svg style={{position:"absolute",top:36,left:"10%",width:"80%",height:4,overflow:"visible"}} className="steps-line">
          <line x1="0" y1="2" x2="100%" y2="2" stroke="rgba(200,155,94,.15)" strokeWidth="1" strokeDasharray="6 4"/>
          <line x1="0" y1="2" x2="100%" y2="2" stroke="#C89B5E" strokeWidth="2" style={{strokeDasharray:800,strokeDashoffset:0,animation:"draw-line 2.5s ease-out .4s both"}}/>
        </svg>
        {steps.map((s,i)=>(
          <div key={i} className="sr step-item" style={{flex:1,textAlign:"center",padding:"0 16px",transitionDelay:`${i*180}ms`,position:"relative",zIndex:2}}>
            <div style={{width:72,height:72,borderRadius:"50%",background:"linear-gradient(135deg,#C89B5E,#E8BE84)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 28px",fontFamily:"'Space Mono',monospace",fontSize:18,fontWeight:700,color:"#0D0D0D",boxShadow:"0 0 0 8px rgba(200,155,94,.1),0 0 0 16px rgba(200,155,94,.05)"}}>{s.num}</div>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,fontWeight:700,color:"#fff",marginBottom:10}}>{s.title}</h3>
            <p style={{fontSize:14,lineHeight:1.7,color:"rgba(255,255,255,.4)"}}>{s.desc}</p>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 768px) {
          .steps-container { flex-direction: column; gap: 48px; }
          .steps-line { display: none; }
          .step-item { padding: 0 !important; }
        }
      `}</style>
    </section>
  );
};

const ProductShowcase = (): ReactNode => {
  const [active,setActive]=useState(0);
  const screens=[
    {title:"Live Dashboard",desc:"Command center for your entire inventory operation",color:"#1F2937",items:["Real-time SKU counts","Revenue velocity chart","Alert queue","Team activity feed"]},
    {title:"Product Manager",desc:"Manage every SKU with surgical precision",color:"#0D1B2A",items:["Bulk edit tools","Variant tracking","Cost calculator","Supplier mapping"]},
    {title:"Smart Reorder",desc:"Automated procurement on autopilot",color:"#0A1628",items:["AI reorder triggers","Supplier scorecards","PO automation","Lead time prediction"]},
  ];
  useEffect(()=>{ const t=setInterval(()=>setActive(a=>(a+1)%screens.length),4000); return()=>clearInterval(t); },[]);
  const s=screens[active];
  return (
    <section style={{background:"#F7F4EF",padding:"clamp(60px, 10vw, 120px) 24px"}}>
      <T eyebrow="PRODUCT TOUR" l1="See Sentinel" l2="in action." />
      <div style={{maxWidth:900,margin:"0 auto"}}>
        <div style={{display:"flex",justifyContent:"center",gap:8,marginBottom:44,flexWrap:"wrap"}}>
          {screens.map((sc,i)=><button key={i} onClick={()=>setActive(i)} style={{padding:"10px 20px",borderRadius:100,border:i===active?"1px solid #C89B5E":"1px solid rgba(0,0,0,.1)",background:i===active?"#C89B5E":"transparent",color:i===active?"#0D0D0D":"#6B7280",fontSize:13,fontWeight:600,fontFamily:"'DM Sans',sans-serif",cursor:"default",transition:"all .3s"}}>{sc.title}</button>)}
        </div>
        <div style={{background:s.color,borderRadius:24,padding:"clamp(20px, 5vw, 32px)",boxShadow:"0 40px 100px rgba(0,0,0,.2)",transition:"background .5s",border:"1px solid rgba(200,155,94,.12)"}}>
          <div style={{display:"flex",gap:7,marginBottom:22}}>{["#FF5F57","#FEBC2E","#28C840"].map(c=><div key={c} style={{width:10,height:10,borderRadius:"50%",background:c}}/>)}</div>
          <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:28,color:"#fff",marginBottom:6}}>{s.title}</h3>
          <p style={{fontSize:13,color:"rgba(255,255,255,0.38)",marginBottom:26}}>{s.desc}</p>
          <div style={{display:"grid",gap:12}} className="showcase-grid">
            {s.items.map((item,i)=>(
              <div key={i} style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(200,155,94,.1)",borderRadius:10,padding:"14px 18px",display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:"#C89B5E",flexShrink:0}}/>
                <span style={{fontSize:13,color:"rgba(255,255,255,.65)",fontWeight:500}}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        .showcase-grid { grid-template-columns: 1fr 1fr; }
        @media (max-width: 640px) { .showcase-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
};

/* ══════════════════════════════════════════════════════════════════════════ */
/*  TECH TRUST                                                                */
/* ══════════════════════════════════════════════════════════════════════════ */
const TechTrust = (): ReactNode => {
  const cards=[
    {icon:"🏢",title:"Built for Multiple Businesses",desc:"Multi-tenant architecture means each organization gets its own secure, fully isolated data environment with complete control.",stat:"100%",statLabel:"Data Isolation"},
    {icon:"🔒",title:"Enterprise-Grade Security",desc:"SOC 2 Type II, ISO 27001 certified. End-to-end encryption, modern authentication, and zero-trust infrastructure built in.",stat:"SOC2",statLabel:"Certified"},
    {icon:"⚙️",title:"Smart Access Control Built-In",desc:"Every API action is validated against your subscription tier and usage limits. Role-based permissions at every layer.",stat:"99.9%",statLabel:"Uptime SLA"},
  ];
  return (
    <section style={{background:"#0D0D0D",padding:"clamp(60px, 10vw, 120px) 24px"}}>
      <T eyebrow="TRUST & SECURITY" l1="Enterprise-ready from" l2="day one." light />
      <div style={{maxWidth:1100,margin:"0 auto",display:"grid",gap:28}} className="tech-grid">
        {cards.map((c,i)=>(
          <div key={i} className="sr tcard" style={{background:"#141414",borderRadius:20,padding:"36px 32px",border:"1px solid rgba(255,255,255,.06)",transitionDelay:`${i*100}ms`}}>
            <div style={{width:54,height:54,borderRadius:14,background:"linear-gradient(135deg,rgba(200,155,94,.12),rgba(200,155,94,.04))",border:"1px solid rgba(200,155,94,.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,marginBottom:20}}>{c.icon}</div>
            <h3 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:700,color:"#fff",marginBottom:10,lineHeight:1.2}}>{c.title}</h3>
            <p style={{fontSize:13,lineHeight:1.7,color:"rgba(255,255,255,.42)",marginBottom:24}}>{c.desc}</p>
            <div style={{display:"flex",alignItems:"baseline",gap:6}}>
              <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:32,fontWeight:700,color:"#C89B5E"}}>{c.stat}</span>
              <span style={{fontSize:11,color:"rgba(255,255,255,.35)",textTransform:"uppercase",letterSpacing:".06em"}}>{c.statLabel}</span>
            </div>
          </div>
        ))}
      </div>
      <style>{`
        .tech-grid { grid-template-columns: repeat(3, 1fr); }
        @media (max-width: 991px) { .tech-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 640px) { .tech-grid { grid-template-columns: 1fr; } }
      `}</style>
    </section>
  );
};

const Pricing = (): ReactNode => {
  const [yearly,setYearly]=useState(false);
  const plans=[
    {
      name:"Basic",
      price:0,
      desc:"Great for getting started",
      features:[
        "Up to 10 products",
        "1 warehouse",
        "Manual product/stock management",
        "No bulk upload",
        "No export reports",
        "No alerts or advanced analytics",
      ],
      highlight:false
    },
    {
      name:"Pro",
      price:yearly?799:999,
      desc:"Built for growing operations",
      features:[
        "Unlimited products",
        "Multiple warehouses",
        "Bulk upload (CSV import)",
        "Export reports (CSV + PDF)",
        "Low-stock alerts",
        "Advanced analytics and activity tracking",
      ],
      highlight:true
    },
  ];
  return (
    <section id="pricing" style={{background:"#F7F4EF",padding:"clamp(60px, 10vw, 120px) 24px"}}>
      <T eyebrow="TRANSPARENT PRICING" l1="Invest in growth," l2="not overhead." />
      <div style={{textAlign:"center",marginTop:-40,marginBottom:56,display:"flex",alignItems:"center",justifyContent:"center",gap:14}}>
        <span style={{fontSize:14,color:!yearly?"#C89B5E":"#9CA3AF",fontWeight:600}}>Monthly</span>
        <div onClick={()=>setYearly(!yearly)} style={{width:52,height:28,borderRadius:100,background:yearly?"#C89B5E":"rgba(0,0,0,.12)",cursor:"default",position:"relative",transition:"background .3s"}}>
          <div style={{width:20,height:20,borderRadius:"50%",background:"#fff",position:"absolute",top:4,left:yearly?28:4,transition:"left .3s",boxShadow:"0 2px 6px rgba(0,0,0,.15)"}}/>
        </div>
        <span style={{fontSize:14,color:yearly?"#C89B5E":"#9CA3AF",fontWeight:600}}>Yearly <span style={{fontSize:11,color:"#10B981",fontWeight:700,display: "inline-block"}}>Save 30%</span></span>
      </div>
      <div style={{display:"flex",gap:24,maxWidth:900,margin:"0 auto"}} className="pricing-container">
        {plans.map((plan,i)=>(
          <div key={i} className="sr prcard" style={{flex:1,background:plan.highlight?"linear-gradient(145deg,#1a1208,#241a0e)":"#fff",borderRadius:20,padding:"40px 32px",border:plan.highlight?"1px solid rgba(200,155,94,.5)":"1px solid rgba(0,0,0,.06)",position:"relative",transitionDelay:`${i*100}ms`,boxShadow:plan.highlight?"0 0 60px rgba(200,155,94,.1)":"0 4px 24px rgba(0,0,0,.06)"}}>
            {plan.highlight&&<div style={{position:"absolute",top:-13,left:"50%",transform:"translateX(-50%)",background:"linear-gradient(135deg,#C89B5E,#E8BE84)",color:"#0D0D0D",fontSize:10,fontWeight:700,padding:"4px 18px",borderRadius:100,letterSpacing:".1em",textTransform:"uppercase",fontFamily:"'Space Mono',monospace",whiteSpace:"nowrap"}}>⭐ Most Popular</div>}
            <p style={{fontSize:11,letterSpacing:".12em",color:"#C89B5E",textTransform:"uppercase",fontFamily:"'Space Mono',monospace",marginBottom:8}}>{plan.name}</p>
            <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:6}}>
              {typeof plan.price==="number"?<><span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:52,fontWeight:700,color:plan.highlight?"#fff":"#1F2937",lineHeight:1}}>₹{plan.price}</span><span style={{fontSize:14,color:plan.highlight?"rgba(255,255,255,.4)":"#9CA3AF"}}>/mo</span></>:<span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:42,fontWeight:700,color:plan.highlight?"#fff":"#1F2937"}}>{plan.price}</span>}
            </div>
            <p style={{fontSize:13,color:plan.highlight?"rgba(255,255,255,.4)":"#6B7280",marginBottom:28}}>{plan.desc}</p>
            <button className="btn-ripple" style={{width:"100%",background:plan.highlight?"linear-gradient(135deg,#C89B5E,#E8BE84)":"transparent",color:plan.highlight?"#0D0D0D":"#1F2937",border:plan.highlight?"none":"1px solid rgba(0,0,0,.12)",padding:"14px",borderRadius:10,fontSize:14,fontWeight:700,fontFamily:"'DM Sans',sans-serif",cursor:"default",marginBottom:28}}>
              {plan.name==="Pro"?"Upgrade to Pro":"Get Started"}
            </button>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {plan.features.map((f,j)=>(
                <div key={j} style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:16,height:16,borderRadius:"50%",background:"rgba(200,155,94,.12)",border:"1px solid rgba(200,155,94,.2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:8,color:"#C89B5E"}}>✓</span></div>
                  <span style={{fontSize:13,color:plan.highlight?"rgba(255,255,255,.6)":"#6B7280"}}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <style>{`
        @media (max-width: 768px) {
          .pricing-container { flex-direction: column; gap: 40px; }
        }
      `}</style>
    </section>
  );
};

const Testimonials = (): ReactNode => {
  const [active,setActive]=useState(0);
  const list=[
    {q:"StockSentinel cut our stockouts by 87% in the first month. The AI forecasting is genuinely magical.",a:"Priya Sharma",r:"Head of Ops, Nuvela Retail",av:"PS"},
    {q:"We manage 12,000 SKUs across 6 warehouses. Sentinel makes it feel like 100 SKUs in 1 location.",a:"Marcus Chen",r:"CEO, Helix Distribution",av:"MC"},
    {q:"The auto-reorder engine paid for itself in 2 weeks. I haven't manually created a PO in 4 months.",a:"Zara Al-Farsi",r:"Inventory Director, Kova Group",av:"ZA"},
  ];
  useEffect(()=>{ const t=setInterval(()=>setActive(a=>(a+1)%list.length),5000); return()=>clearInterval(t); },[]);
  const t=list[active];
  return (
    <section id="testimonials" style={{background:"#0D0D0D",padding:"clamp(60px, 10vw, 120px) 24px"}}>
      <T eyebrow="WHAT CUSTOMERS SAY" l1="Results that" l2="speak volumes." light />
      <div style={{maxWidth:700,margin:"0 auto",textAlign:"center"}}>
        <div style={{background:"#141414",borderRadius:24,padding:"clamp(30px, 8vw, 60px)",boxShadow:"0 20px 60px rgba(0,0,0,.3)",border:"1px solid rgba(200,155,94,.12)"}}>
          <div style={{fontSize:48,color:"#C89B5E",lineHeight:1,marginBottom:22,fontFamily:"'Cormorant Garamond',serif"}}>"</div>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(18px, 4vw, 24px)",fontWeight:500,color:"#fff",lineHeight:1.55,marginBottom:36,fontStyle:"italic"}}>{t.q}</p>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14}}>
            <div style={{width:44,height:44,borderRadius:"50%",background:"linear-gradient(135deg,#C89B5E,#E8BE84)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#0D0D0D",fontFamily:"'Space Mono',monospace"}}>{t.av}</div>
            <div style={{textAlign:"left"}}>
              <div style={{fontSize:15,fontWeight:700,color:"#fff"}}>{t.a}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.35)"}}>{t.r}</div>
            </div>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:24}}>
          {list.map((_,i)=><div key={i} onClick={()=>setActive(i)} style={{width:i===active?32:8,height:8,borderRadius:100,background:i===active?"#C89B5E":"rgba(200,155,94,.2)",cursor:"default",transition:"all .3s"}}/>)}
        </div>
      </div>
    </section>
  );
};

const CTA = (): ReactNode => (
  <section style={{background:"#0D0D0D",padding:"clamp(80px, 15vw, 140px) 24px",textAlign:"center",position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",inset:0,background:"radial-gradient(ellipse at center,rgba(200,155,94,.08) 0%,transparent 65%)"}}/>
    <div style={{position:"absolute",top:"10%",left:"5%",width:400,height:400,borderRadius:"50%",border:"1px solid rgba(200,155,94,.05)",animation:"spin-slow 40s linear infinite"}}/>
    <div style={{position:"absolute",bottom:"10%",right:"5%",width:280,height:280,borderRadius:"50%",border:"1px solid rgba(200,155,94,.04)",animation:"spin-slow 60s linear infinite reverse"}}/>
    <div className="sr" style={{position:"relative",zIndex:2}}>
      <p style={{fontSize:11,letterSpacing:".16em",color:"#C89B5E",textTransform:"uppercase",fontFamily:"'Space Mono',monospace",marginBottom:20}}>START TODAY — FREE</p>
      <h2 style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(32px,8vw,88px)",fontWeight:700,lineHeight:1.05,color:"#fff",marginBottom:22}}>Stop guessing.<br/><span className="gold-shimmer">Start Sentinel.</span></h2>
      <p style={{fontSize:17,color:"rgba(255,255,255,0.4)",marginBottom:52,fontWeight:300}}>Join 10,000+ businesses managing inventory with absolute confidence.</p>
      <button className="btn-ripple" style={{background:"linear-gradient(135deg,#C89B5E,#E8BE84)",color:"#0D0D0D",border:"none",padding:"16px 48px",borderRadius:12,fontSize:16,fontWeight:700,fontFamily:"'DM Sans',sans-serif",cursor:"default",boxShadow:"0 0 48px rgba(200,155,94,.3)",letterSpacing:".02em", width: "100%", maxWidth: "400px"}}>Get Started Free</button>
      <p style={{marginTop:20,fontSize:13,color:"rgba(255,255,255,0.2)"}}>14-day free trial · Cancel anytime</p>
    </div>
  </section>
);

const Footer = (): ReactNode => (
  <footer className="sr" style={{background:"#0A0A0A",borderTop:"1px solid rgba(200,155,94,.09)",padding:"60px clamp(24px, 8vw, 80px) 40px"}}>
    <div style={{display:"flex",justifyContent:"space-between",flexDirection: "row", gap: "40px", flexWrap: "wrap"}} className="footer-content">
      <div style={{flex: "1 1 260px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
          <div style={{width:32,height:32,background:"linear-gradient(135deg,#C89B5E,#E8BE84)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#0D0D0D",fontFamily:"'Space Mono',monospace"}}>S</div>
          <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:22,fontWeight:600,color:"#fff"}}>StockSentinel</span>
        </div>
        <p style={{fontSize:13,color:"rgba(255,255,255,0.28)",maxWidth:260,lineHeight:1.7}}>The intelligent inventory platform for modern commerce.</p>
      </div>
      <div style={{display: "flex", gap: "40px", flexWrap: "wrap", flex: "2 1 auto", justifyContent: "space-between"}}>
        {[{label:"Product",links:["Features","Pricing","Integrations","Changelog"]},{label:"Company",links:["About","Blog","Careers","Press"]},{label:"Support",links:["Documentation","API Ref","Status","Contact"]}].map(col=>(
          <div key={col.label} style={{minWidth: "120px"}}>
            <p style={{fontSize:10,letterSpacing:".12em",color:"#C89B5E",textTransform:"uppercase",fontFamily:"'Space Mono',monospace",marginBottom:16}}>{col.label}</p>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {col.links.map(l=><a key={l} href="#" style={{fontSize:13,color:"rgba(255,255,255,0.35)",textDecoration:"none",transition:"color .2s"}} onMouseEnter={e=>e.currentTarget.style.color="#C89B5E"} onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.35)"}>{l}</a>)}
            </div>
          </div>
        ))}
      </div>
    </div>
    <div style={{borderTop:"1px solid rgba(255,255,255,.05)",paddingTop:24,marginTop: 48, display:"flex",justifyContent:"space-between",alignItems:"center", flexWrap: "wrap", gap: "16px"}}>
      <p style={{fontSize:12,color:"rgba(255,255,255,0.18)"}}>© 2026 StockSentinel Inc.</p>
      <p style={{fontSize:12,color:"rgba(255,255,255,0.18)",fontFamily:"'Space Mono',monospace"}}>SOC2 · ISO27001 · GDPR</p>
    </div>
  </footer>
);

/* ══════════════════════════════════════════════════════════════════════════ */
export default function Landing(): ReactNode {
  useScrollObserver();
  return (
    <>
      <GlobalStyles/>
      <CustomCursor/>
      <Navbar/>
      <Hero/>
      <TrustLogos/>
      <ImageSection/>
      <Features/>
      <PremiumFeatures/>
      <HowItWorks/>
      <ProductShowcase/>
      <TechTrust/>
      <Pricing/>
      <Testimonials/>
      <CTA/>
      <Footer/>
    </>
  );
}