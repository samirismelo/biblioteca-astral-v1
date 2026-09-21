# Biblioteca Astral V1

Projeto Next.js pronto para Vercel.

Inclui catálogo, páginas de livro, leitor PDF/EPUB, autenticação Supabase, Minha Biblioteca, assinatura e painel administrativo.

## Supabase

O schema esperado pela aplicação está versionado em:

`supabase/migrations/001_biblioteca_astral.sql`

Ele cria as tabelas `profiles`, `categories`, `books`, `library_items` e `subscriptions`, além dos buckets `book-covers` e `book-files` e políticas RLS.

Depois da primeira conta criada, defina manualmente `profiles.role = 'admin'` para a conta que deve administrar o acervo.

## Vercel

Framework: Next.js

Build command: `npm run build`

A URL de produção registrada no repositório é `https://biblioteca-astral-v1.vercel.app`.

## Estado atual

- Catálogo público: implementado
- Login/cadastro: implementado
- Minha Biblioteca e progresso: implementados
- Leitor PDF/EPUB: implementado
- Painel admin e uploads: implementados
- Página Sobre e Conta: implementadas
- Assinatura: consulta de status implementada
- Checkout/pagamento: ainda requer definição do provedor de pagamento
