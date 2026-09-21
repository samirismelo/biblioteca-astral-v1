"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {createClient} from "../../lib/supabase/client";

export default function Reader({params}){
 const supabase=createClient();
 const [id,setId]=useState(null),[book,setBook]=useState(null),[url,setUrl]=useState(""),[user,setUser]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState(""),[progress,setProgress]=useState(0);
 useEffect(()=>{(async()=>{
   const p=await params; setId(p.id);
   const {data:{user:u}}=await supabase.auth.getUser(); setUser(u);
   const {data:b,error:e}=await supabase.from("books").select("*").eq("id",p.id).eq("published",true).single();
   if(e||!b){setError("Livro não encontrado ou ainda não publicado.");setLoading(false);return}
   setBook(b);
   if(b.is_premium&&!u){setError("Este livro é Premium. Entre na sua conta para continuar.");setLoading(false);return}
   if(b.is_premium&&u){
     const s=await supabase.from("subscriptions").select("status,current_period_end").eq("user_id",u.id).eq("status","active").limit(1);
     if(!s.data?.length){setError("Sua assinatura não está ativa. Acesse a página de assinatura para continuar.");setLoading(false);return}
   }
   const signed=await supabase.storage.from("book-files").createSignedUrl(b.file_path,1800);
   if(signed.error){setError("Não foi possível liberar o arquivo.");setLoading(false);return}
   setUrl(signed.data.signedUrl);
   if(u){
     const li=await supabase.from("library_items").select("progress").eq("user_id",u.id).eq("book_id",b.id).maybeSingle();
     setProgress(Number(li.data?.progress||0));
     await supabase.from("library_items").upsert({user_id:u.id,book_id:b.id,progress:Number(li.data?.progress||0)},{onConflict:"user_id,book_id"});
   }
   setLoading(false);
 })()},[]);
 async function saveProgress(v){
   setProgress(v);
   if(user&&book) await supabase.from("library_items").upsert({user_id:user.id,book_id:book.id,progress:v,updated_at:new Date().toISOString()},{onConflict:"user_id,book_id"});
 }
 return <main className="readerPage">
  <header className="readerTop"><Link href={id?"/livro/"+id:"/"} className="brand">← Voltar</Link><div><b>Portal Cósmico</b><small>{book?.title||"Leitor"}</small></div><Link href="/" className="read">Biblioteca</Link></header>
  {loading?<section className="readerState">Carregando seu livro...</section>:error?<section className="readerState"><h1>Acesso ao livro</h1><p>{error}</p><div className="readerActions">{!user&&<Link className="goldButton" href="/login">Entrar</Link>}<Link className="goldButton" href="/assinatura">Ver assinatura</Link></div></section>:
  <section className="readerWrap"><div className="readerMeta"><div><span className="sectionKicker">LEITURA</span><h1>{book.title}</h1><p>{book.author||"Portal Cósmico"}</p></div><label>Progresso <input type="range" min="0" max="100" value={progress} onChange={e=>saveProgress(Number(e.target.value))}/><strong>{progress}%</strong></label></div>
  {book.file_type==="pdf"?<iframe className="pdfReader" src={url} title={book.title}/>:<div className="readerState"><h2>EPUB</h2><p>O arquivo EPUB está protegido e pronto para integração com o leitor EPUB. O acesso já está validado.</p><a className="goldButton" href={url} target="_blank" rel="noreferrer">Abrir EPUB</a></div>}
  </section>}
 </main>
}