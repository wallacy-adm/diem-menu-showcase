# Comparativo técnico: diem-menu-showcase vs menu-express

> Contexto: neste ambiente só o `diem-menu-showcase` está disponível localmente. O plano abaixo usa evidências concretas deste repositório e estrutura um roteiro de migração incremental para incorporar práticas de performance típicas de um `menu-express` (BFF/API agregadora, menos round-trips e cache centralizado), sem quebra.

## 1) Carregamento de imagens

## Situação atual (diem-menu-showcase)
- A listagem principal evita trazer `image` no payload inicial de produtos (`fetchMenuItemsSafe`) para reduzir payload base.
- Cada `ProductCard` dispara busca individual de imagem (`select("image").eq("id", id).single()`) quando entra em viewport.
- Existe cache em memória (`Map`) por sessão para não repetir leitura da mesma imagem durante a navegação atual.

### Impacto de performance esperado
- Ganho de TTFB inicial (payload menor), mas possível efeito **N+1 requests** no scroll (1 query por card sem imagem já embutida).
- Em cenários de muitas categorias/produtos, o gargalo migra de banda para **latência acumulada de requisições**.

## Boa prática a migrar (menu-express target)
- Entregar no payload inicial um `image_thumb_url` (ou CDN URL assinada curta) em lote.
- Manter `image_full_url` sob demanda apenas para modal/zoom.
- Resultado: elimina N+1 no feed e preserva payload controlado.

## 2) Acesso ao banco de dados

## Situação atual (diem-menu-showcase)
- O front-end consulta Supabase diretamente para dados públicos (categorias, menu, promoções, settings).
- Queries de `settings` são duplicadas em componentes diferentes (header/footer), embora compartilhem `queryKey`.
- Promoções são carregadas após first paint (gating por estado) e com `refetchInterval` de 2 min.

### Impacto de performance esperado
- Bom para simplicidade, mas com acoplamento forte cliente↔banco.
- Sem camada agregadora, o cliente coordena múltiplas consultas e pode gerar overhead de round-trips.

## Boa prática a migrar (menu-express target)
- Criar endpoint agregador (`/api/menu`) retornando: categorias + itens públicos + promoções ativas + settings essenciais em uma resposta cacheável.
- Usar Supabase apenas no backend/BFF para compor resposta e aplicar fallback.

## 3) Número de requisições de rede

## Situação atual (home)
- Inicial: categorias + menu_items + settings (header/footer reaproveitam cache via mesma key).
- Pós-paint: promoções.
- Durante scroll: uma requisição por produto para `image` (quando não houver imagem no payload).

### Impacto de performance esperado
- O maior multiplicador é o carregamento de imagem por item (N+1).

## Boa prática a migrar (menu-express target)
- Trocar fan-out por:
  1. 1 requisição agregada inicial (`/api/menu`),
  2. imagens em URL CDN prontas para lazy do browser,
  3. opcional: prefetch de próxima seção de categorias.

## 4) Arquitetura React

## Situação atual
- Uso consistente de otimizações: `memo`, `lazy`, `Suspense`, `useMemo`, virtualização (`VirtualProductGrid`) e renderização por visibilidade (`useOnScreen`).
- Estratégia de “hydrate visual first”: promoções só após render inicial.

### Impacto de performance esperado
- A árvore React está relativamente otimizada para render; o gargalo predominante tende a ser I/O de dados/imagem, não reconciliação.

## Boa prática a migrar (menu-express target)
- Preservar otimizações de render atuais.
- Simplificar hooks com um único `useMenuData` vindo do endpoint agregador.

## 5) Uso de cache

## Situação atual
- React Query presente, com `staleTime` explícito em menu e `Infinity` em parte de settings.
- Cache de imagem apenas em memória (`Map`), volátil por sessão/aba.
- Sem cache HTTP explícito controlado por backend para payload agregado.

## Boa prática a migrar (menu-express target)
- Cache multinível:
  - CDN/browser cache para imagens (thumb/full).
  - Cache HTTP no endpoint agregador (`Cache-Control`, `ETag`).
  - React Query para sincronização no cliente com invalidation previsível.

---

# Plano técnico de migração sem quebra (incremental)

## Fase 0 — Baseline e observabilidade
1. Instrumentar métricas atuais (LCP, INP, TTFB, total requests, requests de imagem por sessão).
2. Salvar baseline por ambiente (3G Fast + 4G + Wi-Fi).

## Fase 1 — Endpoint agregador paralelo (sem cortar fluxo atual)
1. Introduzir `GET /api/menu?v=1` no projeto `menu-express` (ou serviço equivalente).
2. Resposta mínima:
   - `settings_public`
   - `categories_visible`
   - `menu_items_public` com `image_thumb_url`
   - `active_promotions`
3. Adicionar feature flag `VITE_USE_MENU_AGGREGATOR=false`.
4. No front, criar `useMenuData` que alterna entre:
   - modo atual (queries separadas),
   - modo novo (query única agregada).

## Fase 2 — Imagem sem N+1
1. Incluir `image_thumb_url` no payload agregado.
2. Alterar `ProductCard` para:
   - usar `image_thumb_url` direto no feed,
   - buscar `image_full_url` apenas no modal (quando necessário).
3. Manter fallback para estratégia antiga durante rollout.

## Fase 3 — Cache HTTP + invalidação
1. Configurar `Cache-Control: public, max-age=30, stale-while-revalidate=120` no `/api/menu`.
2. Adicionar `ETag` para 304.
3. Sincronizar React Query (`staleTime`) com política HTTP.

## Fase 4 — Redução de queries legadas
1. Remover queries isoladas redundantes de `settings` em componentes de layout (consumir do `useMenuData`).
2. Consolidar chaves de cache e política de refetch.

## Fase 5 — Rollout seguro
1. Canary por percentual de sessões (5% → 25% → 50% → 100%).
2. Guardrails automáticos:
   - rollback se LCP piorar >10%,
   - rollback se erro 5xx >1%.

## Critérios de aceite
- Redução de requests totais na home em pelo menos 40%.
- Eliminação de padrão N+1 de imagem no feed.
- LCP p95 melhor em pelo menos 20% no mobile.
- Sem regressão funcional em busca, promoções, modal e categorias.
