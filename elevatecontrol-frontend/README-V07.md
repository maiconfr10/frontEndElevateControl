# ElevateControl v0.7 — React + TypeScript

## O que mudou

- Tela obrigatória de primeiro acesso para usuários criados com senha temporária.
- Configuração de nome, e-mail e senha do administrador provisório.
- **Minha conta**, acessível pelo avatar superior e pelo perfil no menu lateral: atualizar nome/e-mail (confirmação da senha atual) e trocar senha.
- Mensagens simples de sucesso, sem exibir o nome do banco de dados.
- Para cliente, a atribuição interna do técnico fica oculta na interface.
- Visitas pendentes podem ser salvas sem assinatura de aprovação do cliente; serviço efetivamente regularizado continua exigindo assinatura.
- Saída da visita obrigatoriamente posterior à chegada, que deve ser informada pelo técnico.
- O nome do cliente aparece automaticamente no formulário do técnico (via endpoint de nomes autorizados).
- Relatórios pendentes não exibem falsas assinaturas. O PDF corporativo é gerado pelo backend atualizado.

## Executar no VS Code (Windows)

1. Suba primeiro o backend v0.7 no Spring Tools, porta `8090`.
2. Abra a pasta do front-end no VS Code.
3. Execute:

```powershell
npm install
npm run typecheck
npm run dev
```

4. Abra **http://localhost:5173** (não o IP da placa de rede, para evitar problemas de CORS e cookies).
5. O arquivo `.env` já aponta para `http://localhost:8090/api`. Esse arquivo não contém senha.

**Se atualizar um repositório Git existente:** copie os arquivos desta pasta sobre o projeto que você já possui, mas mantenha a pasta oculta `.git` do repositório atual. Não copie `node_modules` ou `dist` de computadores anteriores. Execute `npm install` novamente.

## Ordem sugerida para os testes

1. Login existente da Camila — dashboard e dados anteriores devem continuar iguais.
2. Cadastrar usuário novo — no primeiro login, deve aparecer a tela **Crie sua senha pessoal** antes do dashboard.
3. Abrir **Minha conta** pelo avatar, alterar a senha, verificar o login seguinte.
4. Criar chamado, atribuir técnico e registrar uma visita com **Pendência de Material** sem assinatura de aprovação; o chamado deve continuar em andamento.
5. Tentar concluir uma visita regularizada sem a assinatura: o formulário deve impedir.
6. Verificar Cliente — não deve ver o técnico responsável; deve visualizar apenas prédios e elevadores próprios.
7. Baixar um PDF e conferir o layout e os dados.

## Observações

O usuário antigo Matheus já estava cadastrado antes da v0.7. Para preservar o acesso dos usuários atuais, a migração **não obriga retroativamente** Matheus ou Camila a trocar a senha. Veja as instruções no `README-V07.md` do backend caso deseje forçar o próximo acesso de uma conta existente de teste.

A checagem de tipos `tsc -b` passou nesta entrega. O build nativo do Vite não pôde ser concluído aqui porque o ZIP original trazia dependências nativas do Windows; no seu computador, o `npm install` resolverá as dependências da plataforma.
