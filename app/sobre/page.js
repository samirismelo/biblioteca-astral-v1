"use client";
import Link from "next/link";

export default function Sobre(){
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
      <span className="sectionKicker">SOBRE O PORTAL</span>
      <h1>Conhecimento, simbolismo e tradição em um só acervo.</h1>
      <p>O Portal Cósmico reúne uma biblioteca digital dedicada a espiritualidade, astrologia, magia, ocultismo e tradições esotéricas.</p>
      <p>O objetivo é organizar o acervo de forma simples, permitindo descobrir títulos, salvar leituras e acompanhar o progresso em qualquer dispositivo.</p>
      <div className="readerActions">
        <Link className="goldButton" href="/">Explorar acervo</Link>
        <Link className="goldButton" href="/assinatura">Conhecer assinatura</Link>
      </div>
    </section>
  </main>;
}
