"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {createClient} from "../../lib/supabase/client";

export default function Assinatura(){
 const supabase=createClient();
 const [user,setUser]=useState(null),[active,setActive]=useState(false),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[message,setMessage]=useState("");

 async function refreshStatus(u){
   if(!u){setActive(false);return}
   const s=await supabase.from("subscriptions").select("status,current_period_end,plan,provider").eq("user_id",u.id).eq("status","active").limit(1);
   setActive(!!s.data?.length);
 }

 useEffect(()=>{(async()=>{
   const {data:{user:u}}=await supabase.auth.getUser();
   setUser(u);
   await refreshStatus(u);
   if(typeof window!=="undefined"&&new URLSearchParams(window.location.search).get("checkout")==="success")setMessage("Pagamento recebido. A confirmação da assinatura pode levar alguns instantes.");
   setLoading(false);
 })()},[]);

 async function subscribe(){
   setBusy(true);setMessage("");
   try{
     const {data:{session}}=await supabase.auth.getSession();
     if(!session?.access_token)throw new Error("Faça login antes de assinar.");
     const response=await fetch("/api/mercadopago/subscribe",{
       method:"POST",
       headers:{authorization:"Bearer "+session.access_token}
     });
     const data=await response.json();
     if(!response.ok)throw new Error(data.error||"Não foi possível abrir o checkout.");
     window.location.href=data.checkoutUrl;
   }catch(error){setMessage(error.message)}finally{setBusy(false)}
 }

 async function cancel(){
   if(!confirm("Deseja cancelar sua assinatura Premium?"))return;
   setBusy(true);setMessage("");
   try{
     const {data:{session}}=await supabase.auth.getSession();
     if(!session?.access_token)throw new Error("Faça login novamente.");
     const response=await fetch("/api/mercadopago/cancel",{
       method:"POST",
       headers:{authorization:"Bearer "+session.access_token}
     });
     const data=await response.json();
     if(!response.ok)throw new Error(data.error||"Não foi possível cancelar.");
     setActive(false);
     setMessage("Sua assinatura foi cancelada.");
   }catch(error){setMessage(error.message)}finally{setBusy(false)}
 }

 const priceLabel=process.env.NEXT_PUBLIC_PREMIUM_PRICE_LABEL||"Plano mensal";

 return <main className="simplePage">
   <header className="topbar">
     <Link href="/" className="brand">✦ Portal Cósmico</Link>
     <nav><Link href="/">Biblioteca</Link><Link href="/minha-biblioteca">Minha Biblioteca</Link><Link href="/conta">Conta</Link></nav>
   </header>
   <section className="pricing">
     <span className="sectionKicker">CÍRCULO PREMIUM</span>
     <h1>Uma biblioteca inteira ao seu alcance.</h1>
     <p>Tenha acesso ao acervo premium, salve livros e acompanhe sua leitura.</p>
     <div className="plan">
       <h2>Plano Biblioteca</h2>
       <div className="price">{priceLabel}</div>
       <ul>
         <li>Acervo premium</li>
         <li>Minha Biblioteca</li>
         <li>Progresso de leitura</li>
         <li>Leitor digital protegido</li>
         <li>Pagamento recorrente pelo Mercado Pago</li>
       </ul>
       {loading?<p>Verificando assinatura...</p>:
        active?<div>
          <div className="authMessage">✓ Sua assinatura Premium está ativa.</div>
          <button className="goldButton" disabled={busy} onClick={cancel}>{busy?"Aguarde...":"Cancelar assinatura"}</button>
        </div>:
        user?<div>
          <button className="goldButton" disabled={busy} onClick={subscribe}>{busy?"Abrindo Mercado Pago...":"Assinar com Mercado Pago"}</button>
          <p className="muted">Você será direcionado ao checkout seguro do Mercado Pago.</p>
        </div>:
        <Link className="goldButton" href="/login">Criar conta para assinar</Link>}
       {message&&<div className="authMessage">{message}</div>}
     </div>
   </section>
 </main>
}
