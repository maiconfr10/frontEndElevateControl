# ElevateControl v0.6 — Roteiro de integração com Spring Boot

**Origem:** front-end TypeScript enviado pelo grupo + contratos reais do backend Java 21 / Spring Boot v1.0.

## Configuração necessária

**Backend:** MySQL local `localhost:3306/elevatecontrol`; Spring Boot `localhost:8090`; Java 21; usuário e senha do MySQL configurados somente no `application.yml` ou variáveis do servidor. No STS use perfil `demo` para usuários fictícios, se necessário.

**Front-end:** `.env` com `VITE_AUTH_MODE=api` e `VITE_API_URL=http://localhost:8090/api`, iniciando em `http://localhost:5173`. O Spring Boot precisa aceitar esta origem em `app.frontend-origins` e permitir credenciais em CORS. O código do Spring Boot v1.0 já prevê essa origem.

### Fluxo de autenticação

1. App faz `GET /auth/me` para restaurar sessão; sem sessão o servidor responde 401 e abre a tela de login.
2. Ao entrar, o cliente HTTP faz `GET /auth/csrf` e obtém um token.
3. Envia `POST /auth/login` com JSON `{email, password}` e cabeçalho `X-XSRF-TOKEN`. O browser gerencia o cookie HttpOnly da sessão.
4. Após login, carrega os registros autorizados pela API.
5. Antes de **cada** POST/PATCH, obtém novamente o token CSRF da sessão atual.
6. Para sair, `POST /auth/logout`; ao expirar sessão, a interface volta ao login.

Nunca armazene o `JSESSIONID`, senhas nem token CSRF em `localStorage`.

## Plano de testes manuais no navegador

| # | Perfil | Teste | Esperado |
|---|---|---|---|
| 1 | Admin | Entrar como Camila | Dashboard, clientes e equipe carregados do MySQL |
| 2 | Admin | Cadastrar cliente (documento, contato, e-mail e telefone obrigatórios) | Registro aparece no MySQL após atualizar |
| 3 | Admin | Cadastrar prédio e elevador | Dados persistidos e vinculados |
| 4 | Admin | Abrir chamado Preventiva | Chamado criado com ID e status Aberto |
| 5 | Admin | Atribuir técnico Rafael | Chamado mostra `USR-02` |
| 6 | Admin ou técnico | Iniciar atendimento | Status passa para Em andamento |
| 7 | Admin ou técnico | Registrar visita com checklist mensal S/N/NA de 29 itens | API valida assinatura e rotinas; registro salvo |
| 8 | Admin ou técnico | Registrar visita com pendências | Chamado permanece Em andamento |
| 9 | Admin, técnico ou cliente autorizado | Baixar relatório | PDF entregue por `/relatorios/{id}/pdf` |
| 10 | Técnico | Entrar como Rafael | Só chamados autorizados, sem menu Equipe |
| 11 | Cliente | Entrar como Mariana | Prédios, elevadores e chamados de `CLI-01` |
| 12 | Cliente | Tentar acessar outro cliente manualmente no Postman | 403; regra imposta no backend |
| 13 | Todos | Atualizar dados pelo ícone da barra superior | Novas informações aparecem sem perder página |
| 14 | Todos | Sair e voltar a entrar | Sessão encerrada e depois recriada |

**Verificar a operação no MySQL:**

```sql
USE elevatecontrol;
SELECT id, titulo, status, tecnico_id FROM chamados ORDER BY data DESC;
SELECT id, chamado_id, tecnico_id, tipo FROM checklists ORDER BY concluido_em DESC;
```

### Erros comuns

- **Não foi possível conectar:** Spring Boot está desligado ou porta distinta de 8090; conferir `/actuator/health`.
- **403 em POST/PATCH:** verifique CORS, cookies e CSRF. A camada HTTP já busca `/auth/csrf` automaticamente.
- **401:** sessão expirada ou credenciais inválidas; faça login novamente.
- **400:** conferir mensagens de validação retornadas pelo backend (`observacoes`, assinaturas, campos obrigatórios, 29 rotinas etc.).
- **PDF não baixado:** verificar se o cliente tem acesso a esse checklist e se a API responde `application/pdf`.
- **SMTP:** enquanto não configurado, recuperação de senha pode falhar; não use o `health.mail` como requisito no desenvolvimento.

## Diferenças relevantes frente ao protótipo v0.5

- Cadastros e operações que gravavam em `localStorage` agora chamam o Spring Boot.
- O banco remoto (MySQL) é a fonte de verdade, e não uma cópia local no navegador.
- Após salvar, o app recarrega listagens, preservando a página aberta.
- O cadastro de usuário usa o DTO `CriarUsuario` do backend; a senha inicial gerada aparece uma única vez e não é persistida no estado.
- O PDF vem do servidor; a impressão local permanece apenas no modo demonstração.
- Os endpoints privativos não são chamados em perfis sem permissão.
- Atualizações externas não são em tempo real: use **Atualizar dados**.

## O que ainda depende de outra etapa

- Testes integrados no navegador conectado ao seu Spring Boot.
- Recuperação de senha real por SMTP, fluxo de primeiro acesso e obrigatoriedade de redefinição de senha.
- DTO público mínimo para que o técnico/cliente visualize nomes de contatos vinculados sem consultar endpoints administrativos.
- Melhorias no layout do PDF assinado e regras de validade jurídica.
- Testes automatizados de integração, paginação, monitoramento e implantação.
- Módulos de inteligência artificial (triagem e relatórios automáticos), planejados para depois.
