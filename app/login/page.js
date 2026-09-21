"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {createClient} from "../../lib/supabase/client";
export default function Login(){
 const supabase=createClient(); const router=useRouter();
 const [mode,setMode]=useState("login"); const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [name,setName]=useState(""); const [message,setMessage]=useState(""); const [loading,setLoading]=useState(false);
 async function submit(e){e.preventDefault();setLoading(true);setMessage("");
  if(mode==="login"){const {error}=await supabase.auth.signInWithPassword({email,password});if(error)setMessage(error.message);else router.push("/minha-biblioteca")}
  else {const {data,error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name}}});if(error)setMessage(error.message);else setMessage(data.session?"Conta criada!":"Conta criada. Verifique seu e-mail para confirmar o cadastro.")}
  setLoading(false);
 }
 return <main className="authPage"><div className="authCard"><a href="/" className="authBrand">Biblioteca <i>Astral</i></a><span className="sectionKicker">{mode==="login"?"ENTRAR":"CRIAR CONTA"}</span><h1>{mode==="login"?"Bem-vindo de volta.":"Entre para o Círculo."}</h1><p>Acesse sua biblioteca, favoritos e progresso de leitura.</p><form onSubmit={submit}>{mode==="signup"&&<input placeholder="Seu nome" value={name} onChange={e=>setName(e.target.value)} required/>}<input type="email" placeholder="Seu e-mail" value={email} onChange={e=>setEmail(e.target.value)} required/><input type="password" placeholder="Senha" minLength="6" value={password} onChange={e=>setPassword(e.target.value)} required/><button className="goldButton" disabled={loading}>{loading?"Aguarde...":mode==="login"?"Entrar":"Criar conta"}</button></form>{message&&<div className="authMessage">{message}</div>}<button className="switchAuth" onClick={()=>{setMode(mode==="login"?"signup":"login");setMessage("")}}>{mode==="login"?"Ainda não tenho conta":"Já tenho uma conta"}</button></div></main>}