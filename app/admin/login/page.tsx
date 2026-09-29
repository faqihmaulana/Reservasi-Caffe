'use client';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin(){
 const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [loading,setLoading]=useState(false); const router=useRouter();
 async function submit(e:FormEvent){e.preventDefault();setLoading(true);setError('');const r=await fetch('/api/auth/login',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password})});const d=await r.json();if(!r.ok){setError(d.error||'Login gagal');setLoading(false);return}router.replace('/admin');router.refresh();}
 return <main className="auth-page"><div className="auth-card"><a className="brand"><span className="brand-mark">A</span>AURA <span style={{color:'#777'}}>CAFE</span></a><p className="eyebrow"><span/> Secure admin</p><h1>Welcome <em>back.</em></h1><p className="auth-copy">Masuk untuk mengelola reservasi, kursi, dan operasional cafe.</p><form onSubmit={submit}><label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@auracafe.local" required/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required/></label>{error&&<p className="auth-error">{error}</p>}<button className="primary wide" disabled={loading}>{loading?'Signing in…':'Sign in →'}</button></form></div></main>;
}
