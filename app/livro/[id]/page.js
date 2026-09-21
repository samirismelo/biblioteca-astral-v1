"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {createClient} from "../../../lib/supabase/client";

export default function Page({params}){
 const supabase=createClient();
 const [book,setBook]=useState(null),[loading,setLoading]=useState(true);
 useEffect(()=>{(async()=>{const p=await params;const {data}=await supabase.from("books").select("*,categories(name)").eq("id",p.id).eq("published",true).single();setBook(data);setLoading(false)})()},[]);
 if(loading)return <main className="simplePage"><p>Carregando...</p></main>;
 if(!book)return <main className="simplePage"><h1>Livro não encontrado</h1><Link className="goldButton" href="/">Voltar</Link></main>;
 return <main><header className="topbar"><Link href="/" className="brand">✦ Portal Cósmico</Link><nav><Link href="/">Biblioteca</Link><Link href="/minha-biblioteca">Minha Biblioteca</Link><Link href="/admin">Admin</Link></nav></header>
 <section className="readerIntro"><div className="largeCover" style={book.cover_url?{backgroundImage:"url("+book.cover_url+")",backgroundSize:"cover",backgroundPosition:"center"}:{}}>{!book.cover_url&&"✦"}</div><div><span className="tag">{book.categories?.name||"Acervo"}</span><h1>{book.title}</h1><p className="muted">{book.author||"Autor não informado"}</p><p>{book.description||"Livro disponível no Portal Cósmico."}</p>{book.is_premium&&<p className="muted">Conteúdo Premium — acesso mediante assinatura ativa.</p>}<Link className="button" href={"/ler/"+book.id}>Abrir leitor</Link></div></section></main>
}