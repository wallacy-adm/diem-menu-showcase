# Relatório Técnico de Auditoria de Performance — Carpe Diem

Data: 2026-02-12  
Branch de auditoria: `audit/performance-fix-20260212`

## Escopo do diagnóstico

Verificação completa focada em:
- LCP e tempo de carregamento inicial
- Renderização da hero durante busca/limpeza
- Possível loop/re-render excessivo
- Encadeamento crítico de requisições
- JS/CSS potencialmente não utilizados
- Erros de console/requisições

## Evidências coletadas

- Build de produção com chunk JS principal elevado (`688.49 kB` minificado) e alerta de chunk grande do Vite.
- Medição browser (Playwright, mobile viewport 390x844):
  - `domContentLoaded ≈ 1720 ms`
  - `firstContentfulPaint ≈ 1776 ms`
  - `request_count = 112`
  - sem falhas de rede, apenas warnings de future flags do React Router.
- Verificação funcional do bug reportado da hero (buscar e limpar) não reproduziu desaparecimento no estado atual, porém o comportamento ainda depende de re-render completo da árvore e pode sofrer regressão em cenários de mudanças futuras.

## Matriz de achados (problema → causa → impacto)

| Problema identificado | Causa raiz provável | Impacto | Risco | Estimativa de correção | Possível regressão |
|---|---|---:|---|---|---|
| JS inicial muito pesado | Rotas administrativas e modais carregados no bundle principal | Parse/exec JS mais lento no primeiro carregamento (especialmente mobile) | Médio | 1–2h | Baixa (code-splitting é reversível) |
| LCP potencialmente alto na hero | Hero usa background-image CSS (sem prioridade explícita de imagem principal para LCP) | Pintura do maior elemento pode atrasar | Médio | 30–60min | Baixa |
| Render inicial custoso da lista | Todos os cards e modais montados de imediato | Atraso perceptível no TTI e scroll inicial | Médio | 1–2h | Baixa/Média (UX de paginação inicial) |
| Possível pressão de re-render/timers | Hook de countdown por card cria intervalos por item | Custo contínuo em listas longas | Médio | 1h | Baixa |
| Encadeamento de requisições no boot | Múltiplos queries iniciando no primeiro paint (categories/menu/promotions/settings) | Pode aumentar latência total percebida em rede lenta | Médio | 1h | Baixa |
| CSS possivelmente acima do necessário | Arquivo global com muitos keyframes utilitários | Custo de transferência/parse CSS | Baixo | 1–2h | Baixa |
| Cache de assets não formalizado no app | Sem política explícita no repositório para cache em CDN/edge | Re-download de assets em acessos repetidos | Médio (depende infra) | 30min | Nenhuma |
| Bug hero desaparecer ao limpar busca (reportado) | Não encontrado no snapshot atual; risco de regressão se hero depender de render condicional no futuro | Falha visual crítica percebida | Médio | 30min (hardening preventivo) | Baixa |

## Ações aprovadas automaticamente (baixo risco)

1. Hardening da hero: manter estrutura sempre no DOM e controlar apenas visibilidade visual por CSS.
2. Melhorias de LCP: priorizar carregamento da hero (`loading="eager"`, `fetchpriority="high"`) e manter fallback.
3. Redução de custo inicial:
   - skeleton loading simples;
   - render inicial limitado (12 produtos) com botão de expansão;
   - lazy import de componentes/rotas não críticos.
4. Otimizações de query/cache no frontend:
   - `staleTime` e evitar refetch agressivo em foco para listas públicas.
5. Recomendações de cache HTTP para produção (documentadas, sem alteração de infraestrutura neste commit).

## Itens que **não** serão removidos sem confirmação

- Nenhuma funcionalidade crítica será removida.
- Qualquer remoção estrutural futura exigirá documento de impacto + aprovação prévia.

