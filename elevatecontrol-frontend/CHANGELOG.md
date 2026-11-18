## v0.6 — Integração com Spring Boot (16/11/2026)
- Backend real em `localhost:8090/api` ativado por `.env`, preservando modo demo opcional.
- CSRF automático, cookies HttpOnly de sessão e logout; tratamento de expiração de sessão.
- Leitura por perfil de usuários, clientes, prédios, elevadores, chamados e checklists.
- Formulários conectados: clientes, equipe, prédios, elevadores, chamados, atribuição, início e visitas.
- Download de relatórios em PDF via endpoint Spring Boot.
- Sincronização de dados e tratamento de erros; botão atualizar sem perder a página.
- Documentação didática de integração e testes manuais.
- Verificação TypeScript: passou. Build Vite dependente de binários Windows na máquina do grupo.

# Histórico de versões — ElevateControl

## v0.5.0 — Checklist mensal padrão 2026 (13/11/2026)

- Integração de 29 rotinas mensais (17 + 7 + 5) ao formulário de visitas existente.
- Respostas S / N / NA por elevador, com progresso e bloqueio do envio incompleto.
- Campo LL; folga do redutor, medidas dos acrílicos e distância entre contrapeso e para-choque.
- Assinatura do técnico e coleta opcional do líder de serviços.
- Assinatura do condomínio reutilizada do atendimento original, sem duplicação.
- Inclusão das tabelas e assinaturas no relatório imprimível; compatibilidade com históricos antigos.
- Nenhuma modificação de autenticação ou da futura integração com IA.

## v0.4.0 — Registro de atendimento e material

- Visitas para até dois elevadores; situação por equipamento; autorização de material; histórico de visitas.

## v0.3.0 — TypeScript

- React + TSX, serviços tipados e login preparado para API futura.
