"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {createClient} from "../lib/supabase/client";

const fallbackCategories=[
["Artes divinatórias e Oráculos","361 livros"],["Bruxaria","221 livros"],["Magia do Caos","109 livros"],["Umbanda e Candomblé","62 livros"],["Chakras","49 livros"],["Goétia","46 livros"],["Espiritualidade e Meditação","46 livros"],["Magia Angelical","43 livros"],["Meditação e Gnose","38 livros"],["Astrologia","36 livros"],["Ocultismo","35 livros"],["Alquimia","30 livros"]
];
const fallbackBooks=[
["1","Segredos de Salomão","Daniel de Oliveira","Ocultismo"],
["2","Círculo Tradicional das Evocações Goéticas","A. Occultus","Goétia"],
["3","Verdade sobre bruxaria","Scott Cunningham","Bruxaria"],
["4","In Focus Astrology","Sasha Fenton","Astrologia"],
["5","Corpus hermeticum","Hermes Trismegistos","Hermetismo"],
["6","Três Iniciados Caibalion","Hermes Trismegistos","Hermetismo"]
];
export default function Home(){
 const [open,setOpen]=useState(false),[categories,setCategories]=useState(fallbackCategories),[books,setBooks]=useState(fallbackBooks);
 useEffect(()=>{const supabase=createClient();(async()=>{
   const c=await supabase.from("categories").select("id,name").order("name");
   if(c.data?.length)setCategories(c.data.map(x=>[x.name,"Acervo"]));
   const b=await supabase.from("books").select("id,title,author,category_id,cover_url,categories(name)").eq("published",true).order("created_at",{ascending:false}).limit(12);
   if(b.data?.length)setBooks(b.data.map(x=>[x.id,x.title,x.author||"Autor não informado",x.categories?.name||"Portal Cósmico",x.cover_url]));
 })()},[]);
 return <main className="portalShell">
  <aside className={open?"portalSidebar open":"portalSidebar"}>
   <div className="portalBrand">Portal <i>Cósmico</i> ✦</div><div className="brandRule">◆</div>
   <p className="sideIntro">Literatura que transforma e revela.</p>
   <nav className="sideNav"><span>O CÍRCULO</span><small>MAIS</small><Link href="/minha-biblioteca">Meu caderno</Link><Link href="/sobre">Sobre</Link><Link href="/assinatura" className="sideAction">+ Pedir livro</Link></nav>
   <div className="sideAccount"><b>◆ PREMIUM</b><small>portalcosmico.oficial@gmail.com</small><Link href="/conta">Conta</Link><Link href="/assinatura">Pedidos</Link><Link href="/login">Entrar / Sair</Link></div>
  </aside>
  <button className="mobileMenu" onClick={()=>setOpen(!open)}>☰</button>
  <section className="portalMain">
   <header className="portalHeader"><div className="cosmicMark">☼</div><div><h1>Portal <i>Cósmico</i></h1><p>Cada astro é uma história.</p></div><div className="headerLinks"><Link href="/minha-biblioteca">Minha biblioteca</Link><Link href="/login">Entrar</Link></div></header>
   <section className="categorySection"><div className="categoryGrid">{categories.slice(0,24).map(([name,count],i)=><Link href={`/?categoria=${encodeURIComponent(name)}`} className={`categoryCard tone${i%6}`} key={name}><div className="categoryArt"><span>{name}</span></div><b>{name}</b><small>{count}</small></Link>)}</div><Link href="#curadoria" className="allBooks">Ver todos os livros →</Link></section>
   <section className="featured"><div className="sectionKicker">LEITURA DO MÊS <span>SETEMBRO DE 2026</span></div><div className="featureLine"><div className="featureCover">PORTAL<br/><strong>CÓSMICO</strong><small>Leitura em destaque</small></div><div><h2>Conhecimento para transformar sua jornada.</h2><p>Descubra obras selecionadas do nosso acervo.</p><Link className="goldButton" href="#curadoria">Explorar acervo →</Link></div></div></section>
   <section id="curadoria" className="curation"><div className="sectionKicker">DA NOSSA CURADORIA</div><div className="bookRow">{books.map(([id,title,author,cat,cover],i)=><Link href={`/livro/${id}`} className="bookItem" key={id}><div className="bookCover" style={cover?{backgroundImage:`linear-gradient(#0002,#0007),url(${cover})`}:{}}><span>{!cover&&title}</span></div><div className="bookTitle">{title}</div><small>{author}</small><div className="heart">♡</div></Link>)}</div></section>
   <section className="membership"><div><span className="sectionKicker">PREMIUM</span><h2>Uma biblioteca inteira ao seu alcance.</h2><p>Assine para acessar o acervo, salvar livros e continuar sua leitura em qualquer dispositivo.</p></div><Link href="/assinatura" className="goldButton">Conhecer assinatura →</Link></section>
  </section>
 </main>
}