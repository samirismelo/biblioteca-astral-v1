"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {createClient} from "../../lib/supabase/client";

const topics=[
 "Alquimia","Artes divinatórias e Oráculos","Astrologia","Autoconhecimento","Benzimento","Bruxaria",
 "Bruxaria Solitária","Budismo","Chakras","Espiritualidade e Meditação","Goétia","Hermetismo",
 "Maçonaria","Magia Angelical","Magia do Caos","Magia Enochiana","Magia Natural","Magia Sexual",
 "Meditação e Gnose","Ocultismo","Projeção Astral","Umbanda e Candomblé","Vampirismo","Xamanismo"
];

const previewCards=[
 ["Grimórios","Estudos clássicos e textos raros"],
 ["Tarot & Oráculos","Leituras simbólicas e sistemas divinatórios"],
 ["Magia Natural","Ervas, ciclos, elementos e prática"],
 ["Hermetismo","Tradição, filosofia e correspondências"],
 ["Goétia","Textos, selos e estudos históricos"],
 ["Projeção Astral","Consciência, práticas e experiências"]
];

const faqs=[
 ["Sou iniciante. Vou conseguir aproveitar?","Sim. A biblioteca reúne conteúdos introdutórios e avançados e foi organizada para facilitar a navegação por tema."],
 ["Funciona no celular?","Sim. O Portal Cósmico é responsivo e pode ser usado no celular, tablet ou computador."],
 ["O conteúdo inclui práticas e rituais?","O catálogo pode reunir materiais teóricos e práticos conforme os livros importados para o acervo."],
 ["Posso sugerir novos títulos?","Sim. Você poderá enviar sugestões para análise e inclusão futura no acervo."],
 ["O acesso é realmente vitalício?","Sim. O modelo desta oferta é pagamento único, sem mensalidade e sem renovação automática."],
 ["Como recebo o acesso?","Após a confirmação do pagamento pelo Mercado Pago, o acesso é liberado na mesma conta usada para comprar."],
 ["O pagamento é seguro?","O checkout é processado pelo Mercado Pago. O Portal Cósmico não armazena os dados do seu cartão."]
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
     if(state==="success")setMessage("Pagamento recebido. Assim que o Mercado Pago confirmar, seu acesso vitalício será liberado automaticamente.");
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

 return <main className="salesPage">
   <header className="salesNav">
     <Link href="/" className="salesLogo"><span>✦</span> Portal Cósmico</Link>
     <nav>
       <a href="#acervo">Acervo</a>
       <a href="#temas">Temas</a>
       <a href="#oferta">Acesso</a>
       <a href="#faq">FAQ</a>
     </nav>
     <Link href={user?"/conta":"/login"} className="navCta">{user?"Minha conta":"Entrar"}</Link>
   </header>

   <section className="salesHero">
     <div className="heroCopy">
       <div className="heroEyebrow">BIBLIOTECA DIGITAL DE ESTUDOS ESOTÉRICOS</div>
       <h1>Todo o conhecimento que você procura.<br/><em>Organizado. Acessível. Em um só lugar.</em></h1>
       <p>Uma biblioteca digital para estudar ocultismo, magia, espiritualidade e tradições simbólicas sem perder tempo procurando material espalhado pela internet.</p>
       <div className="heroActions">
         <a href="#oferta" className="primaryCta">Quero acesso à biblioteca</a>
         <a href="#temas" className="secondaryCta">Ver os temas</a>
       </div>
       <div className="heroTrust">
         <span>Pagamento único</span>
         <span>Acesso vitalício</span>
         <span>15 dias de garantia</span>
       </div>
     </div>
     <div className="heroVisual">
       <div className="cosmicOrb">✦</div>
       <div className="deviceMock">
         <div className="deviceTop">PORTAL CÓSMICO</div>
         <div className="deviceScreen">
           {previewCards.slice(0,4).map(([t,s],i)=><div className={"miniBook miniBook"+i} key={t}><b>{t}</b><small>{s}</small></div>)}
         </div>
       </div>
       <div className="floatingBook bookA">HERMETISMO</div>
       <div className="floatingBook bookB">MAGIA</div>
       <div className="floatingBook bookC">ORÁCULOS</div>
     </div>
   </section>

   <section className="bookRail" id="acervo">
     {["ALQUIMIA","ASTROLOGIA","BRUXARIA","GOÉTIA","HERMETISMO","MAGIA NATURAL","OCULTISMO","XAMANISMO","PROJEÇÃO ASTRAL","ORÁCULOS"].map((t,i)=>
       <div className={"railBook rail"+i%5} key={t}><span>{t}</span></div>
     )}
   </section>

   <section className="salesSection themeSection" id="temas">
     <div className="sectionHeading">
       <span>EXPLORE O ACERVO</span>
       <h2>24 categorias já organizadas.<br/><em>E o acervo continua crescendo.</em></h2>
       <p>O catálogo foi estruturado para você encontrar conteúdos por tradição, prática e linha de estudo.</p>
     </div>
     <div className="themeCloud">{topics.map(t=><span key={t}>{t}</span>)}</div>
   </section>

   <section className="insideSection">
     <div className="sectionHeading centerHeading">
       <span>DENTRO DA BIBLIOTECA</span>
       <h2>Estudo sem distração.<br/><em>Do básico ao aprofundamento.</em></h2>
     </div>
     <div className="previewGrid">
       {previewCards.map(([t,s],i)=><div className="previewCard" key={t}>
         <div className={"previewArt previewArt"+i}><div className="pageLines"></div><strong>{t}</strong></div>
         <h3>{t}</h3><p>{s}</p>
       </div>)}
     </div>
   </section>

   <section className="whySection">
     <div>
       <span className="smallCaps">FEITO PARA QUEM QUER ESTUDAR DE VERDADE</span>
       <h2>Pare de colecionar links.<br/><em>Comece a construir conhecimento.</em></h2>
     </div>
     <div className="benefitGrid">
       <article><b>01</b><h3>Tudo organizado</h3><p>Encontre os materiais por tema sem navegar por dezenas de pastas e sites.</p></article>
       <article><b>02</b><h3>Leitura em qualquer lugar</h3><p>Use o celular, tablet ou computador e mantenha sua biblioteca sempre por perto.</p></article>
       <article><b>03</b><h3>Progresso de leitura</h3><p>Salve títulos, acompanhe o que já estudou e continue de onde parou.</p></article>
       <article><b>04</b><h3>Acervo em expansão</h3><p>Novos materiais podem ser adicionados sem que você precise pagar novamente.</p></article>
     </div>
   </section>

   <section className="offerSection" id="oferta">
     <div className="offerIntro">
       <span>ACESSO VITALÍCIO</span>
       <h2>Entre para a Biblioteca Astral.</h2>
       <p>Um único pagamento libera sua conta para sempre.</p>
     </div>
     <div className="offerCard">
       <div className="offerTop">
         <div><span className="premiumTag">ACESSO COMPLETO</span><h3>Biblioteca Astral</h3></div>
         <div className="offerPrice"><s>R$ 147,00</s><strong>R$ 27,90</strong><span>pagamento único</span></div>
       </div>
       <div className="offerBody">
         <ul>
           <li>Acesso ao acervo completo disponível na plataforma</li>
           <li>24 categorias organizadas por tema</li>
           <li>Leitura no celular, tablet e computador</li>
           <li>Minha Biblioteca, favoritos e progresso de leitura</li>
           <li>Novos livros adicionados sem nova cobrança</li>
           <li>Sugestão de novos títulos para análise</li>
           <li>15 dias de garantia</li>
           <li>Sem mensalidade e sem renovação automática</li>
         </ul>

         {loading?<div className="checkoutState">Verificando seu acesso...</div>:
          active?<div className="checkoutState activeAccess">✓ Seu acesso vitalício está ativo.</div>:
          user?<button className="bigCheckout" disabled={busy} onClick={buyLifetimeAccess}>{busy?"Abrindo Mercado Pago...":"Quero acesso vitalício por R$ 27,90"}</button>:
          <Link className="bigCheckout linkButton" href="/login">Criar conta e liberar meu acesso</Link>}
         <div className="secureLine">Checkout seguro pelo Mercado Pago · acesso liberado após confirmação</div>
         {message&&<div className="salesMessage">{message}</div>}
       </div>
     </div>

     <div className="guaranteeStrip">
       <div className="guaranteeSeal">15<br/><span>DIAS</span></div>
       <div><strong>Experimente com tranquilidade.</strong><p>Você tem 15 dias de garantia para conhecer a plataforma e decidir se ela faz sentido para seus estudos.</p></div>
     </div>
   </section>

   <section className="faqSales" id="faq">
     <div className="sectionHeading">
       <span>DÚVIDAS FREQUENTES</span>
       <h2>Antes de entrar,<br/><em>saiba como funciona.</em></h2>
     </div>
     <div className="faqList">{faqs.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
   </section>

   <section className="closingSection">
     <span>PORTAL CÓSMICO</span>
     <h2>Pare de procurar.<br/><em>Comece a estudar.</em></h2>
     <p>Um único pagamento. Sem mensalidade. Acesso vitalício.</p>
     {!active&&(user?
       <button className="primaryCta closingBtn" disabled={busy} onClick={buyLifetimeAccess}>Liberar meu acesso</button>:
       <Link className="primaryCta closingBtn" href="/login">Criar conta e começar</Link>)}
   </section>

   <footer className="salesFooter">
     <div className="salesLogo"><span>✦</span> Portal Cósmico</div>
     <p>Biblioteca digital para estudos de ocultismo, magia e espiritualidade.</p>
   </footer>
 </main>
}
