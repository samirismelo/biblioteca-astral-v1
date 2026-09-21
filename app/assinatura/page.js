"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {createClient} from "../../lib/supabase/client";

export default function Assinatura(){
 const supabase=createClient();
 const [user,setUser]=useState(null),[active,setActive]=useState(false),[loading,setLoading]=useState(true);
 useEffect(()=>{(async()=>{const {data:{user:u}}=await supabase.auth.getUser();setUser(u);if(u){const s=await supabase.from("subscriptions").select("status,current_period_end,plan").eq("user_id",u.id).eq("status","active").limit(1);setActive(!!s.data?.length)}setLoading(false)})()},[]);
 return <main className="simplePage"><header className="topbar"><Link href="/" className="brand">✦ Portal Cósmico</Link><nav><Link href="/">Biblioteca</Link><Link href="/minha-biblioteca">Minha Biblioteca</Link><Link href="/login">Entrar</Link></nav></header><section className="pricing"><span className="sectionKicker">CÍRCULO PREMIUM</span><h1>Uma biblioteca inteira ao seu alcance.</h1><p>Tenha acesso ao acervo premium, salve livros e acompanhe sua leitura.</p><div className="plan"><h2>Plano Biblioteca</h2><div className="price">R$ — <small>/ mês</small></div><ul><li>Acervo premium</li><li>Minha Biblioteca</li><li>Progresso de leitura</li><li>Leitor digital protegido</li></ul>{loading?<p>Verificando assinatura...</p>:active?<div className="authMessage">✓ Sua assinatura está ativa.</div>:user?<div><button className="goldButton" onClick={()=>alert("Gateway de pagamento ainda precisa das credenciais da conta escolhida.")}>Assinar</button><p className="muted">O checkout será conectado ao gateway de pagamento.</p></div>:<Link className="goldButton" href="/login">Criar conta para assinar</Link>}</div></section></main>
}