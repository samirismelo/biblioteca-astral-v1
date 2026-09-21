"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
import {useRouter} from "next/navigation";
import {createClient} from "../../lib/supabase/client";

export default function Conta(){
  const supabase=createClient();
  const router=useRouter();
  const [user,setUser]=useState(null);
  const [profile,setProfile]=useState(null);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState("");

  useEffect(()=>{(async()=>{
    const {data:{user:u}}=await supabase.auth.getUser();
    setUser(u);
    if(u){
      const {data}=await supabase.from("profiles").select("full_name,role").eq("id",u.id).maybeSingle();
      setProfile(data||null);
    }
    setLoading(false);
  })()},[]);

  async function logout(){
    setMessage("");
    const {error}=await supabase.auth.signOut();
    if(error){setMessage(error.message);return}
    router.push("/");
    router.refresh();
  }

  if(loading)return <main className="simplePage"><p>Carregando...</p></main>;

  return <main className="simplePage">
    <header className="topbar">
      <Link href="/" className="brand">✦ Portal Cósmico</Link>
      <nav>
        <Link href="/">Biblioteca</Link>
        <Link href="/minha-biblioteca">Minha Biblioteca</Link>
        <Link href="/assinatura">Assinatura</Link>
      </nav>
    </header>
    <section className="simpleInner">
      <span className="sectionKicker">MINHA CONTA</span>
      <h1>Conta</h1>
      {!user ? <>
        <p>Você ainda não está conectado.</p>
        <Link className="goldButton" href="/login">Entrar</Link>
      </> : <>
        <div className="emptyBox">
          <h2>{profile?.full_name || user.user_metadata?.full_name || "Minha conta"}</h2>
          <p>{user.email}</p>
          {profile?.role && <p className="muted">Perfil: {profile.role}</p>}
        </div>
        <div className="readerActions">
          <Link className="goldButton" href="/minha-biblioteca">Minha Biblioteca</Link>
          <button className="goldButton" onClick={logout}>Sair</button>
        </div>
        {message&&<div className="authMessage">{message}</div>}
      </>}
    </section>
  </main>;
}
