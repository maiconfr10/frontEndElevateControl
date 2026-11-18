# ElevateControl — Front-end v0.6 (React + TypeScript)

**TCC • Interface SaaS profissional integrada à API Spring Boot (porta 8090).**

Esta versão foi gerada a partir do **ZIP atualizado enviado pelo grupo** e preserva as páginas, identidade visual, checklists mensais de 29 rotinas, registro de visitas, assinaturas e relatórios. Não é um projeto novo feito do zero: os módulos existentes foram adaptados para a API Spring Boot v1.0 já testada no Postman.

## Executar no Windows (VS Code + Spring Tools)

1. Inicie o **backend Spring Boot** no STS, configurado para a porta **8090** e MySQL `elevatecontrol`. Verifique em http://localhost:8090/actuator/health se retorna `{"status":"UP"}`.
2. Extraia o ZIP e abra a pasta do front-end no VS Code.
3. Há um `.env` de desenvolvimento já configurado, ou você pode recriá-lo a partir de `.env.example`:
   ```env
   VITE_AUTH_MODE=api
   VITE_API_URL=http://localhost:8090/api
   ```
4. No terminal dessa pasta, execute:
   ```powershell
   npm install
   npm run typecheck
   npm run dev
   ```
5. Abra **http://localhost:5173** (use `localhost`, não `127.0.0.1`, porque o CORS do backend permite `http://localhost:5173`).
6. Entre com uma conta que **exista no MySQL**. Se o backend estiver com perfil `demo`, as contas fictícias são:
   - Administrador: `camila@exemplo.com` / `Demo@123`
   - Técnico: `rafael@exemplo.com` / `Demo@123`
   - Cliente: `mariana@exemplo.com` / `Demo@123`

O front-end **não precisa de Docker** e não acessa o MySQL diretamente. Ele usa somente o backend Spring Boot.

## Modos de execução

- `VITE_AUTH_MODE=api` (padrão deste ZIP): usa autenticação real por **sessão HttpOnly** e **CSRF** do Spring Security, acessa o MySQL via API e não mantém um segundo banco fictício no navegador.
- `VITE_AUTH_MODE=demo`: permanece disponível como **prévia offline**, com dados armazenados em `localStorage`. Não misture ou confunda as informações dos modos.

Modificações no `.env` exigem **reiniciar** `npm run dev`. Nunca coloque senhas do MySQL nem segredos do backend em variáveis com prefixo `VITE_`.

## Integrações já implementadas

| Tela | Requisições ao Spring Boot |
|---|---|
| Login | `GET /api/auth/me`, `GET /api/auth/csrf`, `POST /api/auth/login`, `POST /api/auth/logout` |
| Recuperação | `POST /api/auth/forgot-password` (necessita SMTP configurado no backend para envio real) |
| Clientes | `GET/POST /api/clientes` (somente administrador) |
| Prédios | `GET/POST /api/predios` |
| Elevadores | `GET/POST /api/elevadores`, `PATCH /api/elevadores/{id}` |
| Equipe | `GET/POST /api/usuarios` (somente administrador; mostra a senha inicial retornada **uma única vez**) |
| Chamados | `GET/POST /api/chamados`, `PATCH /api/chamados/{id}/atribuicao`, `POST /api/chamados/{id}/iniciar` |
| Checklists e visitas | `GET/POST /api/checklists` (registro completo, 29 rotinas, assinaturas e pendências) |
| Relatórios | `GET /api/relatorios/{id}/pdf` (download do PDF gerado no servidor) |

O **dashboard** usa dados reais agregados das listagens; os filtros do backend delimitam o que cada usuário pode consultar. O botão **Atualizar dados** permite recarregar alterações feitas por outros usuários.

## Particularidades do backend v1.0

- `GET /api/clientes` e `GET /api/usuarios` são **restritos ao administrador**. O front evita chamar esses endpoints quando o usuário é técnico ou cliente. Por isso, determinados nomes de cliente/técnico não estarão disponíveis para esses perfis até existir no backend um DTO de resumo autorizado.
- `PATCH /api/chamados/{id}/atribuicao` **não permite remover o técnico** enviando um ID vazio; o formulário de atribuição faz apenas seleções válidas.
- Um registro de visita com pendência **não conclui o chamado**; o Spring Boot decide a situação e atualiza os elevadores na transação.
- O botão de PDF baixa o arquivo do backend, sem depender de abrir pop-ups do navegador.
- O código não armazena senhas nem tokens de sessão no `localStorage`. As assinaturas são enviadas como imagens PNG base64 para a API; validade jurídica exige procedimentos adicionais.
- Se a sessão expirar, a aplicação volta à tela de login; solicitações sem autorização são rejeitadas pelo servidor.

## Testes e limites

- Checagem `npm run typecheck` **executada com sucesso** neste ambiente.
- Não foi possível validar o bundle Vite aqui, porque o `node_modules` enviado veio de Windows e não contém os binários nativos do Rollup para Linux. No Windows, **execute `npm install` e `npm run build`** para confirmar a compilação final.
- Não foi possível conectar este ambiente ao **seu** `localhost:8090`, então o teste integrado no navegador deve ser realizado no seu computador. O backend foi examinado a partir do pacote Spring Boot v1.0 disponível na conversa.
- Os endpoints de **cadastro, consulta, histórico e PDF** já foram exercitados por você no Postman. Isso não substitui os testes dos formulários no navegador.
- **IA não está incluída nesta versão**. Será implementada separadamente depois da integração convencional.

Roteiro detalhado: [`docs/INTEGRACAO-SPRING-BOOT-V06.md`](docs/INTEGRACAO-SPRING-BOOT-V06.md).

## Atualizar repositório existente no GitHub

O ZIP **não inclui** a pasta `.git` nem `node_modules`. Se o projeto já está clonado no seu PC, copie os arquivos extraídos para a pasta do repositório, **preservando a sua pasta `.git`**. Depois:

```bash
git status
npm install
npm run typecheck
npm run build
git add .
git commit -m "feat: integra frontend React TypeScript ao Spring Boot"
git push
```

A `.env` local está ignorada pelo Git. Use `.env.example` para compartilhar as configurações não sensíveis.
