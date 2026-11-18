ElevateControl — Front-end v0.6 (React + TypeScript)
TCC • Interface SaaS profissional integrada à API Spring Boot (porta 8090).

Esta versão foi gerada a partir do ZIP atualizada enviada pelo grupo e preservada como páginas, identidade visual, checklists mensais de 29 rotinas, registro de visitas, assinaturas e relatórios. Não é um projeto novo feito do zero: os módulos existentes foram adaptados para a API Spring Boot v1.0 já testados no Postman.

Executável no Windows (VS Code + Spring Tools)
Inicia o backend Spring Boot no STS, configurado para porta 8090 e MySQL elevatecontrol. Verifique em http://localhost:8090/actuator/health se retorna {"status":"UP"}.
Extraia o ZIP e abra a pasta do front-end no VS Code.
Há um .envdesenvolvimento já configurado, ou você pode recria-lo a partir de .env.example:
VITE_AUTH_MODE=api
VITE_API_URL=http://localhost:8090/api
No terminal dessa massa, execute:
npm install
npm run typecheck
npm run dev
Abra http://localhost:5173 (use localhost, não 127.0.0.1, porque o CORS do backend permite http://localhost:5173).
Entre com uma conta que não existe no MySQL . Se o backend estiver com perfil demo, as contas fictícias são:
Administrador: camila@exemplo.com/Demo@123
Técnico: rafael@exemplo.com/Demo@123
Cliente: mariana@exemplo.com/Demo@123
O front-end não precisa do Docker e não acessa o MySQL diretamente. Ele usa somente o backend Spring Boot.

Modos de execução
VITE_AUTH_MODE=api(padrão deste ZIP): usa autenticação real por sessão HttpOnly e CSRF do Spring Security, acessa o MySQL via API e não mantém um segundo banco fictício no navegador.
VITE_AUTH_MODE=demo: permanece disponível como prévio offline , com dados armazenados em localStorage. Não misture ou confunda as informações dos modos.
Modificações .envpara desativar reiniciar npm run dev . Nunca coloque senhas do MySQL nem segredos do backend em variáveis ​​com prefixo VITE_.

Integrações já implementadas
Tela	Requisitos para o Spring Boot
Login	GET /api/auth/me, GET /api/auth/csrf, POST /api/auth/login,POST /api/auth/logout
Recuperação	POST /api/auth/forgot-password(necessita SMTP configurado no backend para envio real)
Clientes	GET/POST /api/clientes(somente administrador)
Prédios	GET/POST /api/predios
Elevadores	GET/POST /api/elevadores,PATCH /api/elevadores/{id}
Equipe	GET/POST /api/usuarios(somente administrador; mostra a senha inicial retornada uma única vez )
Chamados	GET/POST /api/chamados, PATCH /api/chamados/{id}/atribuicao,POST /api/chamados/{id}/iniciar
Listas de verificação e visitas	GET/POST /api/checklists(registro completo, 29 rotinas, assinaturas e pendências)
Relatórios	GET /api/relatorios/{id}/pdf(download do PDF gerado no servidor)
O dashboard usa dados reais agregados das listas; os filtros do backend delimitam o que cada usuário pode consultar. O botão Atualizar dados permite recarregar alterações feitas por outros usuários.

Particularidades do back-end v1.0
GET /api/clientese GET /api/usuariossão restritos ao administrador . O front evita chamar esses endpoints quando o usuário é técnico ou cliente. Por isso, determinados nomes de cliente/técnico não estarão disponíveis para esses perfis até existirem no backend um DTO de resumo autorizado.
PATCH /api/chamados/{id}/atribuicao não permite remover o técnico enviando um ID vazio; o formulário de atribuição faz apenas validades válidas.
Um registro de visita com pendência não conclui o chamado ; o Spring Boot decide a situação e atualiza os elevadores na transação.
O botão de PDF baixa o arquivo do backend, sem depender de abrir pop-ups do navegador.
O código não armazena senhas nem tokens de sessão no localStorage. As assinaturas são enviadas como imagens PNG base64 para API; validade exige procedimentos jurídicos adicionais.
Se a sessão expirar, o aplicativo volta à tela de login; solicitações sem autorização são rejeitadas pelo servidor.
Testes e limites
Checagem npm run typecheck realizada com sucesso neste ambiente.
Não foi possível validar o pacote Vite aqui, porque o node_modulesenviado veio do Windows e não contém os binários nativos do Rollup para Linux. No Windows, execute npm installenpm run build para confirmar a compilação final.
Não foi possível conectar este ambiente ao seu localhost:8090 , então o teste integrado no navegador deve ser realizado no seu computador. O backend foi examinado a partir do pacote Spring Boot v1.0 disponível na conversa.
Os endpoints de cadastro, consulta, histórico e PDF já foram exercitados por você no Postman. Isso não substitui os testes dos formulários no navegador.
IA não está incluída nesta versão . Será possível resolver separadamente depois da integração convencional.
Roteiro detalhado: docs/INTEGRACAO-SPRING-BOOT-V06.md.

Atualizar repositório existente no GitHub
O ZIP não inclui pasta .gitnem node_modules. Se o projeto já estiver clonado no seu PC, copie os arquivos extraídos para a pasta do repositório, preservando a sua pasta.git . Depois:

git status
npm install
npm run typecheck
npm run build
git add .
git commit -m "feat: integra frontend React TypeScript ao Spring Boot"
git push
O .envlocal é ignorado pelo Git. Use .env.examplepara compartilhar as configurações não sensíveis.
