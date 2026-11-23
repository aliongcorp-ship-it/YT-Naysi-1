import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {Backdrop} from '../ui/Backdrop';
import {Caption} from '../ui/Caption';
import {C, F, clamp} from '../theme';
import type {Act} from '../timeline';
import {ease, mix, useLocal} from '../ui/anim';

type SceneProps = {act: Act};
const box: React.CSSProperties = {boxSizing: 'border-box', border: '1px solid rgba(244,241,234,0.16)', background: 'linear-gradient(145deg, rgba(18,23,32,.91), rgba(8,10,15,.76))', borderRadius: 24, boxShadow: '0 28px 90px rgba(0,0,0,.35)'};
const Kicker: React.FC<{children: React.ReactNode; t: number}> = ({children, t}) => <div style={{position:'absolute',left:100,top:300,fontFamily:F.mono,fontSize:23,letterSpacing:'.24em',color:C.steel,opacity:ease(t,.12,.45)}}>{children}</div>;
const Title: React.FC<{children: React.ReactNode; top?: number; size?: number; color?: string}> = ({children,top=382,size=104,color=C.ink}) => <div style={{position:'absolute',left:96,right:96,top,fontFamily:F.display,fontWeight:800,fontSize:size,lineHeight:.96,letterSpacing:'-.045em',color,textShadow:'0 10px 48px rgba(0,0,0,.45)'}}>{children}</div>;
const Door: React.FC<{x:number;y:number;scale?:number;open?:number;glow?:string}> = ({x,y,scale=1,open=.65,glow=C.amber}) => <div style={{position:'absolute',left:x,top:y,width:400*scale,height:700*scale,perspective:900}}>
  <div style={{position:'absolute',inset:0,border:`12px solid ${C.steel}88`,borderBottom:0,borderRadius:`12px 12px 0 0`,boxShadow:`0 0 60px ${glow}33`,background:`radial-gradient(ellipse at 50% 35%, ${glow}36, transparent 68%)`}}/>
  <div style={{position:'absolute',left:22*scale,right:22*scale,top:25*scale,bottom:0,overflow:'hidden',background:`linear-gradient(135deg, ${glow}30, rgba(8,10,14,.88))`}}>
    <div style={{position:'absolute',inset:0,background:`linear-gradient(90deg,${glow}10,${glow}30,transparent)`}}/>
    <div style={{position:'absolute',left:'50%',bottom:0,width:70*scale,height:125*scale,transform:'translateX(-50%)',borderRadius:`45% 45% 6px 6px`,background:'linear-gradient(180deg,#d3d8e0,#626d7d)',opacity:.82}}/>
    <div style={{position:'absolute',left:'50%',bottom:0,width:200*scale,height:40*scale,transform:'translateX(-50%)',borderRadius:'50%',background:`${glow}66`,filter:'blur(18px)'}}/>
  </div>
  <div style={{position:'absolute',inset:'0 0 0 50%',transformOrigin:'left center',transform:`rotateY(${-105*open}deg)`,background:`linear-gradient(100deg,#26303c,#111720 72%,#313a48)`,border:`8px solid #566171`,borderRadius:'5px 14px 0 0',boxShadow:'16px 22px 50px rgba(0,0,0,.55)'}}>
    <div style={{position:'absolute',right:'14%',top:'52%',width:16*scale,height:16*scale,borderRadius:'50%',background:C.amber,boxShadow:`0 0 18px ${C.amber}`}}/>
  </div>
  <div style={{position:'absolute',left:-40*scale,bottom:-10,width:480*scale,height:3,background:`linear-gradient(90deg,transparent,${glow}88,transparent)`,boxShadow:`0 0 24px ${glow}77`}}/>
</div>;
const Pill: React.FC<{x:number;y:number;color?:string;children:React.ReactNode}> = ({x,y,color=C.amber,children}) => <div style={{position:'absolute',left:x,top:y,border:`1px solid ${color}66`,background:`${color}12`,color,padding:'13px 20px',borderRadius:99,fontFamily:F.mono,fontSize:20,letterSpacing:'.12em'}}>{children}</div>;

export const Scene: React.FC<SceneProps> = ({act}) => {
  const {t} = useLocal(act.start);
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const enter = spring({frame:Math.max(0,frame-act.start*fps),fps,config:{damping:24,mass:.65,stiffness:150}});
  const pulse = .5 + .5*Math.sin(frame/18);
  const pop = (at:number) => spring({frame:(t-at)*fps,fps,config:{damping:18,mass:.6,stiffness:190}});
  const base = <><Backdrop warm={.9} cool={.85}/><div style={{position:'absolute',inset:0,pointerEvents:'none',background:'linear-gradient(180deg,rgba(6,7,10,.04),transparent 55%,rgba(6,7,10,.45))'}}/><div style={{position:'absolute',left:96,top:350,width:1248,height:1,background:'linear-gradient(90deg,transparent,rgba(244,241,234,.28),transparent)'}}/><div style={{position:'absolute',right:90,top:300,fontFamily:F.mono,fontSize:18,letterSpacing:'.22em',color:C.steel}}>NAYSI · PSIKOLOGI</div></>;
  let art: React.ReactNode;
  if (act.index === 1) {
    const swing = ease(t,.55,.9);
    art = <>
      <Kicker t={t}>PERNAH TERJADI PADAMU?</Kicker>
      <Title top={380} size={108}>MASUK RUANGAN.<br/><span style={{color:C.amber}}>TUJUAN HILANG.</span></Title>
      <div style={{position:'absolute',left:0,right:0,top:660,height:980,overflow:'hidden'}}>
        <div style={{position:'absolute',left:170,top:140,width:1080,height:720,border:'1px solid #69748633',borderRadius:28,background:'linear-gradient(145deg,#151b27aa,#07090fcc)',transform:`perspective(1100px) rotateX(2deg) translateY(${Math.sin(frame/30)*7}px)`,boxShadow:'0 55px 130px #0009'}}/>
        <div style={{position:'absolute',left:210,top:390,fontFamily:F.mono,fontSize:22,letterSpacing:'.24em',color:C.steel}}>RUANG ASAL</div>
        <div style={{position:'absolute',right:214,top:390,fontFamily:F.mono,fontSize:22,letterSpacing:'.24em',color:C.steel,textAlign:'right'}}>RUANG BARU</div>
        <div style={{position:'absolute',left:250,top:500,width:290,height:170,...box,padding:24,opacity:.75}}><div style={{fontFamily:F.mono,color:C.dim,fontSize:18,letterSpacing:'.18em'}}>NIAT AWAL</div><div style={{fontFamily:F.display,fontWeight:800,fontSize:46,color:C.ink,marginTop:19}}>AMBIL AIR</div></div>
        <Door x={520} y={465} scale={.82} open={swing} glow={C.amber}/>
        <div style={{position:'absolute',right:225,top:515,width:245,height:140,...box,display:'grid',placeItems:'center',color:C.coral,fontFamily:F.mono,fontSize:24,letterSpacing:'.14em'}}>404 · NIAT</div>
        <div style={{position:'absolute',left:575,top:1320,width:300,height:4,background:`linear-gradient(90deg,${C.amber},${C.coral})`,transform:`scaleX(${.4+.6*swing})`,transformOrigin:'left',boxShadow:`0 0 26px ${C.amber}88`}}/>
        <div style={{position:'absolute',left:690,top:1275,color:C.ink,fontFamily:F.mono,fontSize:20,letterSpacing:'.16em'}}>BATAS PERISTIWA</div>
      </div>
      <Pill x={100} y={1570} color={C.coral}>KAMU BUKAN SENDIRIAN</Pill>
    </>;
  } else if (act.index === 2) {
    const p = ease(t,1,1.1);
    art = <>
      <Kicker t={t}>APA YANG TERJADI?</Kicker><Title top={390} size={100}>BUKAN PINTUNYA.<br/><span style={{color:C.amber}}>KONTEKSNYA.</span></Title>
      <div style={{position:'absolute',left:110,top:710,width:530,height:700,...box,padding:34,transform:`translateY(${(1-pop(.1))*34}px)`,opacity:pop(.1)}}>
        <div style={{fontFamily:F.mono,fontSize:21,letterSpacing:'.2em',color:C.steel}}>BAB 01 · SEBELUM</div><div style={{marginTop:42,fontFamily:F.display,fontWeight:800,fontSize:60,lineHeight:1,color:C.ink}}>KAMAR<br/><span style={{color:C.amber}}>TUJUAN AKTIF</span></div>
        <div style={{position:'absolute',left:32,right:32,bottom:34,height:116,borderRadius:16,background:'rgba(255,192,74,.08)',border:'1px solid #ffc04a55',display:'flex',alignItems:'center',padding:'0 24px',fontFamily:F.mono,fontSize:22,color:C.amber,letterSpacing:'.08em'}}>AMBIL KUNCI</div>
      </div>
      <div style={{position:'absolute',left:690,top:1020,width:60,height:3,background:C.amber,transform:`scaleX(${p})`,transformOrigin:'left',boxShadow:`0 0 18px ${C.amber}`}}/><div style={{position:'absolute',left:730,top:988,width:18,height:18,borderTop:`3px solid ${C.amber}`,borderRight:`3px solid ${C.amber}`,transform:'rotate(45deg)'}}/>
      <div style={{position:'absolute',right:110,top:710,width:530,height:700,...box,padding:34,transform:`translateY(${(1-pop(.35))*34}px)`,opacity:pop(.35)}}>
        <div style={{fontFamily:F.mono,fontSize:21,letterSpacing:'.2em',color:C.steel}}>BAB 02 · SESUDAH</div><div style={{marginTop:42,fontFamily:F.display,fontWeight:800,fontSize:60,lineHeight:1,color:C.ink}}>DAPUR<br/><span style={{color:C.coral}}>TUJUAN REDUP</span></div>
        <div style={{position:'absolute',left:32,right:32,bottom:34,height:116,borderRadius:16,background:'rgba(255,81,72,.08)',border:'1px solid #ff514855',display:'flex',alignItems:'center',padding:'0 24px',fontFamily:F.mono,fontSize:22,color:C.coral,letterSpacing:'.08em'}}>APA YANG KUCARI?</div>
      </div>
      <div style={{position:'absolute',left:355,top:1490,fontFamily:F.serif,fontStyle:'italic',fontSize:65,color:C.dim}}>Otak mengelompokkan hidup menjadi adegan.</div>
    </>;
  } else if (act.index === 3) {
    const revealed = Math.floor(clamp((t-1)*.75,0,5));
    art = <>
      <Kicker t={t}>EKSPERIMEN MEMORI · RUANG VIRTUAL</Kicker><Title top={390} size={96}>INGAT BENDA.<br/><span style={{color:C.mint}}>LEWATI PINTU.</span></Title>
      <div style={{position:'absolute',left:100,top:720,width:1240,height:630,...box,overflow:'hidden'}}>
        <div style={{position:'absolute',left:0,right:0,top:0,height:8,background:`linear-gradient(90deg,${C.amber},${C.mint},${C.coral})`}}/>
        <div style={{position:'absolute',left:36,top:35,fontFamily:F.mono,fontSize:20,letterSpacing:'.2em',color:C.steel}}>SIMULASI RUANGAN · TES INGATAN VISUAL</div>
        {[0,1,2].map((i)=><div key={i} style={{position:'absolute',left:65+i*370,top:135,width:320,height:380,border:'1px solid rgba(244,241,234,.15)',borderRadius:18,background:`linear-gradient(150deg,${i===1?'#ffc04a12':'#a9c7ff08'},#07090d)`}}><div style={{position:'absolute',left:0,right:0,top:0,height:18,background:`${i===1?C.amber:C.steel}22`,borderRadius:'18px 18px 0 0'}}/><div style={{position:'absolute',left:22,top:32,fontFamily:F.mono,fontSize:17,color:C.steel}}>RUANG 0{i+1}</div>{i===1&&<div style={{position:'absolute',left:113,top:140,width:95,height:180,border:'8px solid #727d8b',borderBottom:0,borderRadius:'12px 12px 0 0',boxShadow:`0 0 38px ${C.amber}66`}}/>}{i===0&&<div style={{position:'absolute',left:75,top:150,width:150,height:100,borderRadius:18,background:`linear-gradient(145deg,${C.amber},#bd7440)`,opacity:.9,boxShadow:`0 18px 42px ${C.amber}33`}}/>}{i===2&&<div style={{position:'absolute',left:105,top:155,width:115,height:115,borderRadius:'50%',background:`radial-gradient(circle at 35% 30%,${C.mint},#176956)`,boxShadow:`0 0 50px ${C.mint}55`}}/>}</div>)}
        <div style={{position:'absolute',left:160,top:560,width:890,height:3,background:'linear-gradient(90deg,#ffc04a,#4beba0,#ff5148)',opacity:.6}}/><div style={{position:'absolute',left:150,top:526,fontFamily:F.mono,fontSize:17,color:C.dim,letterSpacing:'.14em'}}>INGAT → PINDAH → UJI INGATAN</div>
      </div>
      <div style={{position:'absolute',left:110,top:1400,fontFamily:F.mono,fontSize:22,color:C.steel,letterSpacing:'.17em'}}>SEBAGIAN INFORMASI LEBIH MUDAH TERGANGGU</div>
      <div style={{position:'absolute',left:110,top:1470,display:'flex',gap:22}}>{Array.from({length:5},(_,i)=><div key={i} style={{width:190,height:110,...box,display:'grid',placeItems:'center',borderColor:i<revealed?`${C.coral}aa`:'rgba(244,241,234,.12)',background:i<revealed?'rgba(255,81,72,.1)':'rgba(18,23,32,.75)',transform:`translateY(${Math.sin(frame/14+i)*5}px)`}}><div style={{fontSize:40,color:i<revealed?C.coral:C.steel}}>{['▰','◉','△','✳','◇'][i]}</div></div>)}</div>
    </>;
  } else if (act.index === 4) {
    art = <>
      <Kicker t={t}>TEMUAN ILMIAH · 2024</Kicker><Title top={390} size={97}>MEMORI DAPAT<br/><span style={{color:C.coral}}>TERGANGGU.</span></Title>
      <div style={{position:'absolute',left:102,top:740,width:1236,height:205,...box,display:'flex',alignItems:'center',padding:'0 38px',borderColor:`${C.coral}66`}}><div style={{fontFamily:F.mono,fontSize:21,color:C.steel,letterSpacing:'.18em'}}>SETELAH BATAS PERISTIWA</div><div style={{marginLeft:'auto',fontFamily:F.display,fontWeight:800,fontSize:68,color:C.coral}}>AKSES MENURUN</div></div>
      <div style={{position:'absolute',left:103,top:1000,width:590,height:420,...box,padding:34}}><div style={{fontFamily:F.mono,fontSize:20,color:C.steel,letterSpacing:'.18em'}}>YANG PALING RENTAN</div><div style={{fontFamily:F.display,fontSize:62,fontWeight:800,color:C.ink,marginTop:35,lineHeight:1}}>INFO PERTAMA<br/><span style={{color:C.amber}}>SEBELUM PINTU</span></div><div style={{position:'absolute',left:35,right:35,bottom:36,height:12,borderRadius:10,background:`linear-gradient(90deg,${C.coral},${C.amber},transparent)`}}/></div>
      <div style={{position:'absolute',right:103,top:1000,width:590,height:420,...box,padding:34,borderColor:`${C.mint}55`}}><div style={{fontFamily:F.mono,fontSize:20,color:C.steel,letterSpacing:'.18em'}}>ARTINYA BUKAN</div><div style={{fontFamily:F.display,fontSize:62,fontWeight:800,color:C.ink,marginTop:35,lineHeight:1}}>INGATAN<br/><span style={{color:C.mint}}>DIHAPUS</span></div><div style={{position:'absolute',left:35,right:35,bottom:36,height:12,borderRadius:10,background:`linear-gradient(90deg,${C.mint},transparent)`}}/></div>
      <div style={{position:'absolute',left:105,top:1510,fontFamily:F.mono,fontSize:22,color:C.dim,letterSpacing:'.12em'}}>ONGCHOCO & XU · JOURNAL OF VISION · 2024</div>
    </>;
  } else if (act.index === 5) {
    const line = ease(t,.6,1.4);
    art = <>
      <Kicker t={t}>MODEL SEDERHANA · PEMBARUAN KONTEKS</Kicker><Title top={390} size={98}>OTAKMU<br/><span style={{color:C.amber}}>MEMOTONG ADEGAN.</span></Title>
      <div style={{position:'absolute',left:130,top:770,width:1180,height:710}}>
        <div style={{position:'absolute',left:100,top:90,width:430,height:450,...box,padding:34,opacity:.75}}><div style={{fontFamily:F.mono,fontSize:20,color:C.steel,letterSpacing:'.16em'}}>ADEGAN LAMA</div><div style={{fontFamily:F.display,fontSize:56,fontWeight:800,color:C.ink,marginTop:48}}>NIAT<br/>AKTIF</div>{[0,1,2].map(i=><div key={i} style={{position:'absolute',left:36+i*110,top:320,width:78,height:78,borderRadius:20,background:`${C.amber}${i===1?'55':'25'}`,border:`1px solid ${C.amber}66`,transform:`rotate(${i*8-8}deg)`}}/>)}<div style={{position:'absolute',left:36,bottom:28,fontFamily:F.mono,fontSize:18,color:C.amber}}>KAMAR · KUNCI · TUJUAN</div></div>
        <div style={{position:'absolute',left:505,top:314,width:190,height:3,background:`linear-gradient(90deg,${C.amber},${C.coral})`,transform:`scaleX(${line})`,transformOrigin:'left'}}/><div style={{position:'absolute',left:575,top:274,width:20,height:20,borderTop:`3px solid ${C.coral}`,borderRight:`3px solid ${C.coral}`,transform:'rotate(45deg)'}}/>
        <div style={{position:'absolute',right:75,top:90,width:430,height:450,...box,padding:34,borderColor:`${C.coral}55`,opacity:.85}}><div style={{fontFamily:F.mono,fontSize:20,color:C.steel,letterSpacing:'.16em'}}>ADEGAN BARU</div><div style={{fontFamily:F.display,fontSize:56,fontWeight:800,color:C.ink,marginTop:48}}>KONTEKS<br/><span style={{color:C.coral}}>DISESUAIKAN</span></div><div style={{position:'absolute',left:36,bottom:28,fontFamily:F.mono,fontSize:18,color:C.coral}}>DAPUR · AIR · SAAT INI</div></div>
        <div style={{position:'absolute',left:460,top:600,width:270,height:100,borderRadius:50,border:'1px solid #ffc04a55',background:'#ffc04a0c',display:'grid',placeItems:'center',fontFamily:F.mono,fontSize:19,color:C.amber,letterSpacing:'.12em'}}>BATAS PERISTIWA</div>
      </div>
      <div style={{position:'absolute',left:105,top:1510,fontFamily:F.serif,fontStyle:'italic',fontSize:58,color:C.ink}}>Memori lama tidak hilang. Jalur aksesnya berubah.</div>
    </>;
  } else if (act.index === 6) {
    art = <>
      <Kicker t={t}>STRATEGI SAAT PIKIRAN TERPUTUS</Kicker><Title top={390} size={100}>BANTU OTAK<br/><span style={{color:C.mint}}>MENJAGA NIAT.</span></Title>
      <div style={{position:'absolute',left:105,top:760,width:1230,height:340,...box,padding:34,display:'flex',alignItems:'center',gap:34,transform:`translateX(${(1-pop(.2))*-40}px)`,opacity:pop(.2)}}><div style={{width:190,height:190,borderRadius:30,background:`${C.amber}16`,border:`1px solid ${C.amber}66`,display:'grid',placeItems:'center',fontFamily:F.mono,fontSize:70,color:C.amber}}>01</div><div><div style={{fontFamily:F.mono,fontSize:20,color:C.steel,letterSpacing:'.18em'}}>SEBELUM BERPINDAH</div><div style={{fontFamily:F.display,fontWeight:800,fontSize:54,color:C.ink,marginTop:18}}>Ucapkan tujuanmu.</div></div><div style={{marginLeft:'auto',width:240,height:100,borderRadius:18,border:'1px solid #ffc04a55',display:'grid',placeItems:'center',fontFamily:F.mono,color:C.amber,fontSize:20}}>“AMBIL KUNCI”</div></div>
      <div style={{position:'absolute',left:105,top:1145,width:1230,height:340,...box,padding:34,display:'flex',alignItems:'center',gap:34,transform:`translateX(${(1-pop(.55))*40}px)`,opacity:pop(.55)}}><div style={{width:190,height:190,borderRadius:30,background:`${C.mint}16`,border:`1px solid ${C.mint}66`,display:'grid',placeItems:'center',fontFamily:F.mono,fontSize:70,color:C.mint}}>02</div><div><div style={{fontFamily:F.mono,fontSize:20,color:C.steel,letterSpacing:'.18em'}}>KALAU SUDAH LUPA</div><div style={{fontFamily:F.display,fontWeight:800,fontSize:54,color:C.ink,marginTop:18}}>Kembali ke tempat awal.</div></div><div style={{marginLeft:'auto',fontSize:74,color:C.mint,transform:`rotate(${Math.sin(frame/25)*8}deg)`}}>↶</div></div>
      <div style={{position:'absolute',left:106,top:1550,fontFamily:F.mono,fontSize:20,color:C.steel,letterSpacing:'.12em'}}>EFEKNYA TIDAK SELALU TERJADI · KONTEKS DAN PERHATIAN IKUT BERPERAN</div>
    </>;
  } else {
    const close = ease(t,2.2,.8);
    art = <>
      <Kicker t={t}>SATU HAL UNTUK DIINGAT</Kicker><Title top={410} size={98}>PINTU BUKAN<br/><span style={{color:C.coral}}>PENGHAPUS INGATAN.</span></Title>
      <div style={{position:'absolute',left:0,right:0,top:720,height:850,overflow:'hidden'}}>
        <Door x={520} y={100} scale={1.02} open={1-close} glow={C.mint}/>
        <div style={{position:'absolute',left:200,top:700,width:1040,height:4,background:`linear-gradient(90deg,transparent,${C.mint}aa,${C.amber}aa,transparent)`,boxShadow:`0 0 32px ${C.mint}55`}}/>
        <div style={{position:'absolute',left:300,top:570,width:840,height:120,borderRadius:60,background:'rgba(10,14,20,.82)',border:'1px solid #4beba055',display:'grid',placeItems:'center',fontFamily:F.mono,fontSize:25,color:C.mint,letterSpacing:'.18em'}}>PENANDA KONTEKS BERUBAH</div>
      </div>
      <div style={{position:'absolute',left:100,top:1585,fontFamily:F.display,fontWeight:800,fontSize:65,color:C.ink,letterSpacing:'-.02em'}}>OTAKMU SEDANG MENGATUR ADEGAN.</div>
      <div style={{position:'absolute',right:105,top:1700,fontFamily:F.mono,fontSize:18,color:C.steel,letterSpacing:'.2em'}}>NAYSI / PSIKOLOGI SEHARI-HARI</div>
    </>
  }
  return <AbsoluteFill style={{background:C.bg,overflow:'hidden'}}>
    {base}
    <AbsoluteFill style={{transform:`translateY(${(1-enter)*12}px)`,opacity:mix(.86,1,enter)}}>{art}</AbsoluteFill>
    <div style={{position:'absolute',left:100,right:100,bottom:610,height:1,background:'linear-gradient(90deg,transparent,rgba(244,241,234,.2),transparent)'}}/>
    <Caption act={act} t={act.start+t}/>
  </AbsoluteFill>;
};
