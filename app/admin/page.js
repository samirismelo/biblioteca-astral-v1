"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {createClient} from "../../lib/supabase/client";

export default function Admin(){
 const supabase=createClient();
 const [user,setUser]=useState(null),[cats,setCats]=useState([]),[books,setBooks]=useState([]),[msg,setMsg]=useState(""),[busy,setBusy]=useState(false);
 const [form,setForm]=useState({title:"",author:"",description:"",category_id:"",is_premium:true,published:false});
 const [cover,setCover]=useState(null),[file,setFile]=useState(null);
 useEffect(()=>{(async()=>{const {data:{user}}=await supabase.auth.getUser();setUser(user);const c=await supabase.from("categories").select("*").order("name");setCats(c.data||[]);loadBooks()})()},[]);
 async function loadBooks(){const {data}=await supabase.from("books").select("*,categories(name)").order("created_at",{ascending:false});setBooks(data||[])}
 async function addBook(e){e.preventDefault();setMsg("");if(!user){setMsg("Entre com sua conta para cadastrar livros.");return}if(!file){setMsg("Selecione um PDF ou EPUB.");return}setBusy(true);
  try{
   const id=crypto.randomUUID();const ext=file.name.split(".").pop().toLowerCase();const filePath=`${id}/${file.name}`;
   const up=await supabase.storage.from("book-files").upload(filePath,file,{contentType:file.type||"application/pdf",upsert:false});if(up.error)throw up.error;
   let coverUrl=null;if(cover){const ce=cover.name.split(".").pop().toLowerCase();const cp=`${id}/cover.${ce}`;const cu=await supabase.storage.from("book-covers").upload(cp,cover,{contentType:cover.type,upsert:true});if(cu.error)throw cu.error;coverUrl=supabase.storage.from("book-covers").getPublicUrl(cp).data.publicUrl}
   const ins=await supabase.from("books").insert({id,title:form.title,author:form.author,description:form.description,category_id:form.category_id||null,cover_url:coverUrl,file_path:filePath,file_type:ext==="epub"?"epub":"pdf",is_premium:form.is_premium,published:form.published}).select().single();
   if(ins.error)throw ins.error;setMsg("Livro cadastrado com sucesso.");setForm({title:"",author:"",description:"",category_id:"",is_premium:true,published:false});setCover(null);setFile(null);e.target.reset();loadBooks();
  }catch(err){setMsg(err.message||"Não foi possível cadastrar o livro.")}finally{setBusy(false)}
 }
 return <main className="simplePage"><header className="topbar"><Link href="/" className="brand">✦ Portal Cósmico</Link><nav><Link href="/">Biblioteca</Link><Link href="/minha-biblioteca">Minha Biblioteca</Link></nav></header>
 <section className="admin"><div className="sectionHead"><div><span className="sectionKicker">ADMINISTRAÇÃO</span><h1>Acervo Astral</h1></div></div>
 {!user&&<div className="emptyBox"><h2>Login necessário</h2><p>Entre com sua conta para acessar o cadastro do acervo.</p><Link className="goldButton" href="/login">Entrar</Link></div>}
 {user&&<div className="adminGrid"><section className="panel"><h2>Novo livro</h2><form onSubmit={addBook}>
 <label>Título<input value={form.title} required onChange={e=>setForm({...form,title:e.target.value})}/></label>
 <label>Autor<input value={form.author} onChange={e=>setForm({...form,author:e.target.value})}/></label>
 <label>Categoria<select value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})}><option value="">Selecione</option>{cats.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
 <label>Descrição<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></label>
 <label>Capa<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>setCover(e.target.files?.[0]||null)}/></label>
 <label>PDF ou EPUB<input type="file" accept=".pdf,.epub,application/pdf,application/epub+zip" required onChange={e=>setFile(e.target.files?.[0]||null)}/></label>
 <label className="check"><input type="checkbox" checked={form.is_premium} onChange={e=>setForm({...form,is_premium:e.target.checked})}/> Conteúdo Premium</label>
 <label className="check"><input type="checkbox" checked={form.published} onChange={e=>setForm({...form,published:e.target.checked})}/> Publicar agora</label>
 <button className="goldButton" disabled={busy}>{busy?"Enviando...":"Cadastrar livro"}</button>
 </form>{msg&&<div className="authMessage">{msg}</div>}</section>
 <section className="panel"><h2>Acervo cadastrado</h2><div className="adminList">{books.map(b=><div className="adminRow" key={b.id}><div><strong>{b.title}</strong><small>{b.author||"Autor não informado"} · {b.categories?.name||"Sem categoria"} · {b.published?"Publicado":"Rascunho"}</small></div></div>)}</div></section></div>}
 </section></main>
}