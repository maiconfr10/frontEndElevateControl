
# 🛗 ElevateControl — Frontend v0.7

### Sistema de Gestão Inteligente de Elevadores

Interface web desenvolvida como parte de um **Trabalho de Conclusão de Curso (TCC)**, com o objetivo de modernizar e centralizar o gerenciamento de elevadores, manutenções preventivas, chamados técnicos e relatórios de atendimento.

O frontend apresenta uma interface moderna, responsiva e profissional, com identidade visual no estilo **SaaS**, integrada a uma API REST desenvolvida em Java e Spring Boot.

**Versão:** 0.7  
**Status:** Em desenvolvimento e testes  
**Arquitetura:** Full Stack — React + Spring Boot + MySQL

---

## 🚀 Tecnologias utilizadas

| Tecnologia | Finalidade |
|---|---|
| React 19 | Construção das interfaces |
| TypeScript | Tipagem e organização do código |
| Vite 6 | Desenvolvimento e compilação |
| Tailwind CSS 4 | Estilização da aplicação |
| Lucide React | Ícones da interface |
| Motion | Animações e transições |
| API REST | Comunicação com o backend |
| Spring Security | Autenticação e autorização pelo servidor |

## 📋 Funcionalidades implementadas

### 🔐 Autenticação e segurança

- Tela de login integrada ao backend.
- Autenticação por sessão com cookies HttpOnly.
- Proteção CSRF nas requisições.
- Controle de acesso por perfil.
- Recuperação de senha por e-mail, quando o SMTP do backend estiver configurado.
- Redirecionamento em caso de sessão expirada.
- Tratamento de erros de conexão e autenticação.

### 👤 Primeiro acesso e Minha Conta

- Troca obrigatória de senha temporária.
- Configuração inicial da conta do administrador.
- Alteração de nome e e-mail.
- Alteração de senha pessoal.
- Confirmação da senha atual em operações sensíveis.
- Botões para mostrar ou ocultar senhas.
- Mensagens de validação e confirmação das operações.

### 📊 Dashboard

- Painel de acompanhamento da operação.
- Indicadores de chamados e manutenções.
- Visualização das informações conforme o perfil do usuário.
- Atualização dos dados pela API.

### 🏢 Clientes e elevadores

- Cadastro e gerenciamento de clientes.
- Cadastro e gerenciamento de prédios.
- Cadastro e acompanhamento de elevadores.
- Associação de elevadores aos prédios.
- Visualização das informações permitidas para cada usuário.

### 🛠️ Chamados e equipe técnica

- Abertura e acompanhamento de chamados.
- Atribuição de técnicos responsáveis.
- Registro de andamento dos atendimentos.
- Gerenciamento de usuários da equipe.
- Restrições de acesso para administradores, técnicos e clientes.
- Ocultação de informações internas que não devem aparecer para o cliente.

### ✅ Checklist de manutenção

- Checklist mensal com **29 rotinas de verificação**.
- Registro dos itens inspecionados.
- Informações de chegada e saída do técnico.
- Registro de observações e pendências.
- Identificação de materiais necessários.
- Coleta de assinaturas quando aplicável.
- Possibilidade de registrar uma visita pendente sem assinatura de aprovação do cliente.
- Validação das informações antes da conclusão do atendimento.

### 📄 Relatórios técnicos

- Consulta ao histórico de manutenções.
- Acompanhamento de serviços executados e pendentes.
- Download de relatórios técnicos em PDF gerados pelo backend.
- Visualização de informações conforme as permissões do usuário.

---

## 👥 Perfis de acesso

| Perfil | Responsabilidades |
|---|---|
| Administrador | Gerenciar clientes, prédios, elevadores, chamados e usuários |
| Técnico | Acompanhar atendimentos, realizar checklists e registrar visitas |
| Cliente | Consultar seus elevadores, chamados e informações autorizadas |

O backend é responsável por validar as permissões. A interface também adapta as funcionalidades disponíveis a cada perfil.

## ⚙️ Como executar o frontend

### Pré-requisitos

- Node.js e npm instalados.
- Visual Studio Code ou editor equivalente.
- Backend ElevateControl em execução para utilizar o modo integrado.

### 1. Obter o projeto

Repositório principal:

https://github.com/maiconfr10/ProjetoTccElevateControllFullStack

Clone o repositório e abra a pasta `elevatecontrol-frontend` no VS Code.

### 2. Instalar dependências

No terminal, execute:

`npm install`

### 3. Configurar a API

Crie um arquivo `.env` na raiz do frontend ou copie o conteúdo de `.env.example`.

Configure:

`VITE_AUTH_MODE=api`

`VITE_API_URL=http://localhost:8090/api`

Essas configurações indicam que o frontend utilizará o backend Spring Boot na porta 8090.

**Importante:** nunca coloque senhas do MySQL ou credenciais administrativas em variáveis `VITE_`.

### 4. Iniciar a aplicação

Execute:

`npm run dev`

Abra no navegador:

**http://localhost:5173**

### 5. Validar e compilar

Verificar os tipos TypeScript:

`npm run typecheck`

Gerar a versão de produção:

`npm run build`

---

## 🔄 Integração com o backend

O frontend não acessa o MySQL diretamente.

A comunicação acontece por meio de requisições HTTP à API REST do Spring Boot.

Fluxo básico:

**Usuário → React → API Spring Boot → MySQL**

O backend é responsável por autenticação, regras de negócio, persistência dos dados e geração dos documentos PDF.

O sistema também dispõe de um modo demonstrativo offline, ativado com `VITE_AUTH_MODE=demo`, que utiliza dados locais para testes de interface. Esse modo é separado da operação real com a API.

## 📁 Organização do código

A pasta `src` contém os principais módulos:

| Pasta ou arquivo | Responsabilidade |
|---|---|
| `pages/` | Telas da aplicação |
| `components/` | Componentes reutilizáveis |
| `context/` | Contextos de autenticação e dados |
| `services/` | Integração com a API REST |
| `data/` | Estruturas auxiliares e dados demonstrativos |
| `utils/` | Funções auxiliares |
| `types.ts` | Tipagens TypeScript |
| `App.tsx` | Estrutura principal da aplicação |
| `styles.css` | Estilização da interface |

## 🧪 Testes

O frontend foi estruturado para permitir testes dos seguintes fluxos:

- Login e encerramento de sessão.
- Primeiro acesso e alteração de senha.
- Atualização das informações de Minha Conta.
- Cadastro de clientes, prédios e elevadores.
- Abertura e atribuição de chamados.
- Registro de manutenção com pendência de materiais.
- Validação de assinaturas e horários de atendimento.
- Consulta e download de relatórios.
- Restrições de acesso por perfil.

A execução integrada depende de uma instância do backend e de um banco MySQL configurados corretamente.

## 🔮 Melhorias futuras

- Ampliação dos testes automatizados.
- Melhorias de acessibilidade e experiência do usuário.
- Evolução dos dashboards e indicadores de manutenção.
- Novas funcionalidades para acompanhamento técnico.
- Estudo de integração com inteligência artificial para apoio à gestão e análise de manutenções.

**Observação:** a integração com inteligência artificial é uma melhoria planejada e ainda não faz parte desta versão.

---

## 🎓 Sobre o projeto

O **ElevateControl** é um projeto acadêmico Full Stack que reúne conhecimentos de desenvolvimento web, arquitetura de software, banco de dados, segurança, integração de sistemas e organização de processos de manutenção.

O frontend foi desenvolvido com foco em usabilidade, estrutura modular e possibilidade de expansão para novas funcionalidades.

**ElevateControl — Gestão inteligente de elevadores.**

*Projeto de TCC | Desenvolvimento Full Stack | 2026*
