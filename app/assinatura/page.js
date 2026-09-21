"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {createClient} from "../../lib/supabase/client";

const topics=[
 "Grimórios","Magia de Velas","Magia Lunar","Wicca","Rituais Práticos","Bruxaria",
 "Ervas Mágicas","Proteções Espirituais","Cabala","Magia Natural","Feitiços e Magias",
 "Hermetismo","Goetia","Sigilos","Banimento","Tarot","Magia Cerimonial","Teurgia",
 "Runas","Magia do Caos","Alquimia","Alta Magia","Magia Elemental","Cristais e Pedras"
];

const faqs=[
 ["Sou iniciante. Vou conseguir aproveitar?","Sim. A biblioteca foi pensada para atender desde quem está começando até quem já estuda práticas e tradições esotéricas há mais tempo."],
 ["Funciona no celular?","Sim. Você pode acessar pelo celular, tablet ou computador e continuar sua leitura onde preferir."],
 ["O conteúdo inclui práticas e rituais?","Sim. O acervo reúne materiais teóricos e práticos, incluindo rituais, sigilos, meditações, estudos simbólicos e outros conteúdos aplicáveis."],
 ["Posso pedir livros que ainda não estejam no acervo?","Sim. Quem tem o acesso vitalício pode enviar sugestões de novos títulos para análise e inclusão no acervo."],
 ["O acesso é realmente vitalício?","Sim. É um pagamento único. Não há mensalidade nem renovação automática para continuar acessando a biblioteca."],
 ["Como recebo o acesso?","Após a confirmação do pagamento, o acesso Premium é liberado na sua conta. Basta entrar com o mesmo e-mail usado no cadastro."],
 ["O pagamento é seguro?","Sim. O pagamento é concluído no ambiente seguro do Mercado Pago, e seus dados de pagamento não ficam armazenados no Portal Cósmico."]
];

export default function Assinatura(){
 const supabase=createClient();
 const [user,setUser]=useState(null),[active,setActive]=useState(false),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[message,setMessage]=useState("");

 async function refreshStatus(u){
   if(!u){setActive(false);return}
   const s=await supabase.from("subscriptions").select("status,plan,provider").eq("user_id",u.id).eq("status","active").limit(1);
   setActive(!!s.data?.length);
 }

 useEffect(()=>{(async()=>{
   const {data:{user:u}}=await supabase.auth.getUser();
   setUser(u);
   await refreshStatus(u);
   if(typeof window!=="undefined"){
     const state=new URLSearchParams(window.location.search).get("checkout");
     if(state==="success")setMessage("Pagamento recebido. Assim que o Mercado Pago confirmar, o acesso vitalício será liberado automaticamente.");
     if(state==="pending")setMessage("Seu pagamento está pendente de confirmação.");
     if(state==="failure")setMessage("O pagamento não foi concluído. Você pode tentar novamente.");
   }
   setLoading(false);
 })()},[]);

 async function buyLifetimeAccess(){
   setBusy(true);setMessage("");
   try{
     const {data:{session}}=await supabase.auth.getSession();
     if(!session?.access_token)throw new Error("Faça login antes de comprar o acesso.");
     const response=await fetch("/api/mercadopago/subscribe",{
       method:"POST",
       headers:{authorization:"Bearer "+session.access_token}
     });
     const data=await response.json();
     if(!response.ok)throw new Error(data.error||"Não foi possível abrir o checkout.");
     window.location.href=data.checkoutUrl;
   }catch(error){setMessage(error.message)}finally{setBusy(false)}
 }

 return <main className="simplePage">
   <header className="topbar">
     <Link href="/" className="brand">✦ Portal Cósmico</Link>
     <nav><Link href="/">Biblioteca</Link><Link href="/minha-biblioteca">Minha Biblioteca</Link><Link href="/conta">Conta</Link></nav>
   </header>

   <section className="pricing lifetimePricing">
     <span className="sectionKicker">ACESSO VITALÍCIO</span>
     <h1>Todos os livros de magia e ocultismo que você procura. Em um só lugar.</h1>
     <p>Um acervo organizado por temas para você estudar com mais facilidade, sem depender de mensalidade e sem ficar procurando material espalhado pela internet.</p>

     <div className="offerStats">
       <div><strong>50+</strong><span>temas organizados</span></div>
       <div><strong>1×</strong><span>pagamento único</span></div>
       <div><strong>∞</strong><span>acesso vitalício</span></div>
     </div>

     <div className="topicsBlock">
       <span className="sectionKicker">EXPLORE POR TEMA</span>
       <div className="topicChips">{topics.map(t=><span key={t}>{t}</span>)}</div>
     </div>

     <div className="plan lifetimePlan">
       <div className="planBadge">MAIS COMPLETO</div>
       <h2>Biblioteca Astral — Acesso Vitalício</h2>
       <div className="oldPrice">de R$ 147,00</div>
       <div className="price">R$ 27,90 <small>pagamento único</small></div>
       <ul>
         <li>Acesso ao acervo completo, do básico ao avançado</li>
         <li>Mais de 50 categorias organizadas por tema</li>
         <li>Leitura no celular, tablet e computador</li>
         <li>Minha Biblioteca, favoritos e progresso de leitura</li>
         <li>Coleções e materiais exclusivos</li>
         <li>Novos livros adicionados ao acervo sem nova cobrança</li>
         <li>Envie sugestões de títulos para inclusão</li>
         <li>Roteiros de estudo por tema</li>
         <li>15 dias de garantia</li>
       </ul>

       {loading?<p>Verificando seu acesso...</p>:
        active?<div className="authMessage successMessage">✓ Seu acesso vitalício está ativo.</div>:
        user?<div>
          <button className="goldButton lifetimeButton" disabled={busy} onClick={buyLifetimeAccess}>{busy?"Abrindo Mercado Pago...":"Quero acesso vitalício por R$ 27,90"}</button>
          <p className="muted">Pagamento único. Sem mensalidade e sem renovação automática.</p>
        </div>:
        <Link className="goldButton lifetimeButton" href="/login">Criar conta e liberar meu acesso</Link>}
       {message&&<div className="authMessage">{message}</div>}
     </div>

     <div className="guaranteeBox">
       <strong>15 dias de garantia</strong>
       <p>Acesse, explore e veja se a biblioteca faz sentido para você. Caso desista dentro do período de garantia, você pode solicitar o reembolso.</p>
     </div>

     <section className="faqSection">
       <span className="sectionKicker">DÚVIDAS FREQUENTES</span>
       <h2>Tudo o que você precisa saber antes de entrar.</h2>
       <div className="faqGrid">{faqs.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
     </section>

     <section className="finalCta">
       <span>SEM MENSALIDADE</span>
       <h2>Pare de procurar. Comece a estudar.</h2>
       <p>Um único pagamento libera sua conta para sempre.</p>
       {!active&&(user?
         <button className="goldButton lifetimeButton" disabled={busy} onClick={buyLifetimeAccess}>Liberar acesso vitalício</button>:
         <Link className="goldButton lifetimeButton" href="/login">Criar conta e começar</Link>)}
     </section>
   </section>
 </main>
}
