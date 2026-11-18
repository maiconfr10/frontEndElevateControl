/** DEMO é simulação local; API exige sessão segura estabelecida pelo servidor. */
import {apiRequest,ApiError} from './http';
import {getInitialData} from './repository';
import type {Credentials,Role,User} from '../types';

export const AUTH_MODE: 'demo'|'api'=import.meta.env.VITE_AUTH_MODE==='api'?'api':'demo';
const SESSION_KEY='elevatecontrol_demo_session_v2';
const DEMO_PASSWORD='Demo@123';
const ROLES:readonly Role[]=['admin','tecnico','cliente'];

function publicUser(value:unknown):User{
  if(!value||typeof value!=='object')throw new Error('O servidor retornou um perfil de usuário inválido.');
  const data=value as Partial<User>;
  if(!data.id||!data.nome||!data.perfil||!ROLES.includes(data.perfil))throw new Error('O servidor retornou um perfil de usuário inválido.');
  return {id:String(data.id),nome:String(data.nome),email:String(data.email||''),perfil:data.perfil,clienteId:data.clienteId||null,registro:data.registro||'',
    trocaSenhaObrigatoria:Boolean(data.trocaSenhaObrigatoria),configuracaoInicialPendente:Boolean(data.configuracaoInicialPendente)};
}
function getDemoUserById(id:string):User|null{return getInitialData().users.find(u=>u.id===id)||null;}
interface AuthResponse {user?:unknown;[key:string]:unknown}
function unwrapUser(response:unknown):User{
  const content=(response&&typeof response==='object'&&'user' in response)?(response as AuthResponse).user:response;
  return publicUser(content);
}
export async function restoreSession():Promise<User|null>{
  if(AUTH_MODE==='demo'){
    try{
      const id=sessionStorage.getItem(SESSION_KEY);const user=id?getDemoUserById(id):null;
      if(!user)sessionStorage.removeItem(SESSION_KEY);
      return user?publicUser(user):null;
    }catch{return null;}
  }
  try{return unwrapUser(await apiRequest('/auth/me'));}
  catch(error){if(error instanceof ApiError&&[401,403].includes(error.status))return null;throw error;}
}
export async function authenticate({email,password}:Credentials):Promise<User>{
  if(AUTH_MODE==='demo'){
    const selected=getInitialData().users.find(u=>u.email.toLowerCase()===email.trim().toLowerCase());
    if(!selected||password!==DEMO_PASSWORD)throw new Error('E-mail ou senha incorretos para a demonstração.');
    sessionStorage.setItem(SESSION_KEY,selected.id);
    return publicUser(selected);
  }
  return unwrapUser(await apiRequest('/auth/login',{method:'POST',body:{email:email.trim(),password}}));
}
export async function endSession():Promise<void>{
  if(AUTH_MODE==='demo'){sessionStorage.removeItem(SESSION_KEY);return;}
  await apiRequest('/auth/logout',{method:'POST'});
}
export async function requestPasswordReset(email:string):Promise<void>{
  if(AUTH_MODE==='demo')throw new Error('Recuperação de senha disponível quando o backend for integrado.');
  await apiRequest('/auth/forgot-password',{method:'POST',body:{email:email.trim()}});
}
export interface DemoAccount {id:string;role:string;email:string;hint:string}
export const demoAccounts:DemoAccount[]=[
  {id:'USR-01',role:'Administrador',email:'camila@exemplo.com',hint:'Gestão geral'},
  {id:'USR-02',role:'Técnico',email:'rafael@exemplo.com',hint:'Atendimentos e checklists'},
  {id:'USR-04',role:'Cliente',email:'mariana@exemplo.com',hint:'Solicitações e relatórios'},
];
export const demoPassword=DEMO_PASSWORD;

/** Troca de senha de primeiro acesso. Nunca armazena senhas em localStorage. */
export async function changePassword(senhaAtual:string,novaSenha:string):Promise<void>{
  if(AUTH_MODE==='demo')throw new Error('Troca de senha disponível no modo conectado.');
  await apiRequest('/auth/change-password',{method:'POST',body:{senhaAtual,novaSenha}});
}
export async function completeInitialSetup(nome:string,email:string,senhaTemporaria:string,novaSenha:string):Promise<User>{
  if(AUTH_MODE==='demo')throw new Error('Configuração inicial disponível no modo conectado.');
  await apiRequest('/auth/complete-setup',{method:'POST',body:{nome,email,senhaTemporaria,novaSenha}});
  // Reautentica com o novo e-mail na mesma sessão do navegador.
  return authenticate({email,password:novaSenha});
}
export async function saveProfile(nome:string,email:string,senhaAtual:string):Promise<void>{
  if(AUTH_MODE==='demo')throw new Error('Edição de perfil disponível no modo conectado.');
  await apiRequest('/auth/profile',{method:'PUT',body:{nome,email,senhaAtual}});
}
