'use client';

import { useMemo, useState } from 'react';

const seats = [
  { code:'A01',cap:2,x:12,y:30,shape:'round' }, { code:'A02',cap:2,x:29,y:28,shape:'round',occupied:true },
  { code:'B01',cap:4,x:48,y:26,shape:'square' }, { code:'B02',cap:4,x:67,y:26,shape:'square' }, { code:'C01',cap:2,x:84,y:29,shape:'round' },
  { code:'A03',cap:2,x:13,y:65,shape:'round' }, { code:'B03',cap:4,x:34,y:66,shape:'square' }, { code:'C02',cap:2,x:55,y:67,shape:'round',occupied:true },
  { code:'D01',cap:4,x:74,y:65,shape:'square' }, { code:'D02',cap:2,x:89,y:67,shape:'round' }
];

export default function Home(){
 const [selected,setSelected]=useState<string|null>(null);
 const [open,setOpen]=useState(false);
 const [toast,setToast]=useState('');
 const [date,setDate]=useState('');
 const [time,setTime]=useState('18:30');
 const [guests,setGuests]=useState('2 guests');
 const [name,setName]=useState('');
 const [email,setEmail]=useState('');
 const [phone,setPhone]=useState('');
 const [loading,setLoading]=useState(false);
 const fee=useMemo(()=>selected?25000:0,[selected]);
 const notify=(m:string)=>{setToast(m);setTimeout(()=>setToast(''),3000)};
 const choose=(s:any)=>{if(s.occupied)return;setSelected(s.code)};
 const confirm=async()=>{
   if(!date){notify('Pilih tanggal reservasi terlebih dahulu.');return}
   if(!selected){notify('Pilih kursi terlebih dahulu.');return}
   if(!name.trim()||!email.trim()){notify('Isi nama dan email terlebih dahulu.');return}
   setLoading(true);
   try{
     const res=await fetch('/api/reservations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,email,phone,seatCode:selected,date,startTime:time,guests:Number.parseInt(guests),})});
     const body=await res.json();
     if(!res.ok)throw new Error(body.error||'Reservasi gagal.');
     setOpen(false);
     notify(`Reservasi ${body.reservation.code} berhasil dibuat.`);
     setSelected(null);
   }catch(error){notify(error instanceof Error?error.message:'Reservasi gagal.')}
   finally{setLoading(false)}
 };
 return <>
 <header className="nav"><div className="wrap" style={{display:'flex',width:'100%',justifyContent:'space-between',alignItems:'center'}}><a className="brand"><span className="brand-mark">A</span>AURA <span style={{color:'#777'}}>CAFE</span></a><nav><a href="#reserve">Reserve</a><a href="#experience">Experience</a><a href="#features">Features</a></nav><button className="cta" onClick={()=>document.querySelector('#reserve')?.scrollIntoView({behavior:'smooth'})}>Book a seat ↗</button></div></header>
 <main className="wrap">
 <section className="hero" id="experience"><div><p className="eyebrow"><span/> Specialty coffee · Tegal</p><h1>Your table,<br/><em>your moment.</em></h1><p className="hero-text">Reservasi tempat cafe dengan pengalaman memilih kursi secara visual. Pilih waktu, jumlah tamu, lalu tentukan spot favoritmu.</p><div className="actions"><button className="primary" onClick={()=>document.querySelector('#reserve')?.scrollIntoView({behavior:'smooth'})}>Find your seat →</button><button className="ghost" onClick={()=>notify('Menu digital segera tersedia.')}>Explore menu</button></div><div className="proof">◉ ◉ ◉ ◉ <span><b>4.9/5</b><small>from 1,280 guests</small></span></div></div><div className="visual"><div className="float top"><small>Open today</small><b>08:00 — 23:00</b></div><div className="scene"><div className="mini-table one">01</div><div className="mini-table two">02</div><div className="mini-table three">03</div><div className="bar">AURA / BAR</div></div><div className="float bottom"><small>Tonight</small><b>8 seats left</b></div></div></section>
 <section className="section" id="reserve"><div className="section-head"><div><p className="eyebrow"><span/> Reservation</p><h2>Choose how you want<br/>to <em>sit.</em></h2></div><p className="hint">Pilih tanggal, jam, jumlah tamu, kemudian klik kursi yang tersedia. Status kursi ditampilkan langsung pada floor plan.</p></div>
 <div className="booking"><aside className="side"><div className="step"><span>01</span><div><b>Date & time</b><small>When are you coming?</small></div></div><div className="step"><span>02</span><div><b>Party</b><small>How many guests?</small></div></div><div className="step"><span>03</span><div><b>Seat</b><small>Pick your favorite</small></div></div><p className="note">✦ Private corners are limited. Reservasi lebih awal untuk jam ramai.</p></aside>
 <div className="main"><div className="controls"><label>Date<input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label><label>Time<select value={time} onChange={e=>setTime(e.target.value)}>{['18:30','19:00','19:30','20:00','20:30','21:00'].map(x=><option key={x}>{x}</option>)}</select></label><label>Guests<select value={guests} onChange={e=>setGuests(e.target.value)}>{[2,3,4,5,6].map(x=><option key={x}>{x} guests</option>)}</select></label></div><div className="legend"><span><i className="dot"/> Available</span><span><i className="dot selected"/> Your pick</span><span><i className="dot occupied"/> Occupied</span></div>
 <div className="floor"><div className="zone lounge">LOUNGE</div><div className="zone barzone">BAR</div><div className="zone dj">VINYL / DJ</div>{seats.map(s=><button key={s.code} aria-label={`Seat ${s.code}`} onClick={()=>choose(s)} disabled={s.occupied} className={`seat ${s.shape} ${s.occupied?'occupied':''} ${selected===s.code?'selected':''}`} style={{'--x':`${s.x}%`,'--y':`${s.y}%`} as any}><b>{s.code}</b><small>{s.cap}</small></button>)}</div>
 <div className="selection"><div><small>Selected seat</small><strong>{selected??'None selected'}</strong></div><div className="fee"><small>Reservation fee</small><strong>Rp {fee.toLocaleString('id-ID')}</strong></div><button className="primary" disabled={!selected} onClick={()=>setOpen(true)}>Continue →</button></div></div></div></section>
 <section className="section" id="features"><div className="section-head"><div><p className="eyebrow"><span/> System</p><h2>Built for a<br/><em>better visit.</em></h2></div></div><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:1,background:'#2a2d26'}}>{[['01','Visual seat map','Lihat layout cafe sebelum datang dan pilih kursi yang paling sesuai.'],['02','Live availability','Kursi occupied dikunci agar tidak dapat dipilih oleh pelanggan lain.'],['03','Admin ready','Arsitektur database disiapkan untuk dashboard admin, laporan, dan manajemen kursi.']].map(x=><div key={x[0]} style={{padding:'35px',background:'#0d0f0c'}}><span style={{color:'#d7ff63'}}>{x[0]}</span><h3>{x[1]}</h3><p style={{color:'#777',lineHeight:1.7}}>{x[2]}</p></div>)}</div></section>
 </main><footer><span>© 2026 AURA CAFE</span><span>Modern reservation system · Tegal</span><span>Indonesia</span></footer>
 {open&&<div className="modal"><div className="modal-card"><button className="close" onClick={()=>setOpen(false)}>×</button><p className="eyebrow"><span/> Almost there</p><h2>Confirm your <em>reservation.</em></h2><div className="summary"><div><span>Date</span><b>{date||'Pilih tanggal'}</b></div><div><span>Time</span><b>{time}</b></div><div><span>Guests</span><b>{guests}</b></div><div><span>Seat</span><b>{selected}</b></div></div><div style={{display:'grid',gap:10,margin:'20px 0'}}><input placeholder="Nama lengkap" value={name} onChange={e=>setName(e.target.value)}/><input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}/><input placeholder="No. WhatsApp (opsional)" value={phone} onChange={e=>setPhone(e.target.value)}/></div><button className="primary wide" disabled={loading} onClick={confirm}>{loading?'Saving...':'Confirm booking →'}</button></div></div>}
 {toast&&<div className="toast">{toast}</div>}
 </>;
}
