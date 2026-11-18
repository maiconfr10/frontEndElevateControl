/** API do ElevateControl: sessão HttpOnly por cookie + proteção CSRF do Spring Security. */
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8090/api').replace(/\/$/, '');
export class ApiError extends Error {
  constructor(message:string, public readonly status:number) {super(message); this.name='ApiError';}
}
export interface RequestOptions {
  method?:'GET'|'POST'|'PUT'|'PATCH'|'DELETE';body?:unknown;signal?:AbortSignal;
}
interface ErrorPayload {message?:string;error?:string}
async function readError(response:Response):Promise<never> {
  let payload:ErrorPayload={};
  try {payload=await response.json() as ErrorPayload;} catch {/* Resposta vazia ou não JSON. */}
  const generic:Record<number,string>={400:'Dados inválidos.',401:'Sessão expirada ou credenciais inválidas.',403:'Operação não autorizada.',404:'Registro não encontrado.',409:'Este registro já existe.',422:'Validação rejeitada pelo servidor.',429:'Muitas tentativas.'};
  if(response.status===401&&typeof window!=='undefined')window.dispatchEvent(new Event('elevatecontrol-session-expired'));
  throw new ApiError(payload.message || generic[response.status] || `Erro HTTP ${response.status}.`, response.status);
}
async function request(path:string, options:RequestOptions={}, blob=false):Promise<Response> {
  const {method='GET',body,signal}=options;
  let csrfHeaders:Record<string,string>={};
  if(!['GET'].includes(method)){
    // Buscar o token imediatamente antes de cada operação evita reutilizar um token
    // antigo depois do login (proteção ativada no backend Spring Security).
    const tokenResponse=await raw('/auth/csrf',{method:'GET'});
    const token=(await tokenResponse.json()) as {headerName:string;token:string};
    if(!token.headerName||!token.token)throw new ApiError('Token CSRF não recebido.',0);
    csrfHeaders[token.headerName]=token.token;
  }
  return raw(path,options,csrfHeaders,blob);
}
async function raw(path:string,{method='GET',body,signal}:RequestOptions={},csrf:Record<string,string>={},blob=false):Promise<Response>{
  let response:Response;
  try {
    response=await fetch(`${BASE_URL}${path}`,{
      method,signal,credentials:'include',
      headers:{Accept:blob?'application/pdf':'application/json',...(body!==undefined?{'Content-Type':'application/json'}:{}),...csrf},
      ...(body!==undefined?{body:JSON.stringify(body)}:{})
    });
  } catch(error) {
    if(error instanceof DOMException&&error.name==='AbortError')throw error;
    throw new ApiError(`Não foi possível conectar à API em ${BASE_URL}. Confira se o Spring Boot está ligado.`,0);
  }
  if(!response.ok)await readError(response);
  return response;
}
export async function apiRequest<T=unknown>(path:string, options:RequestOptions={}):Promise<T>{
  const response=await request(path,options);
  if(response.status===204)return null as T;
  if(!(response.headers.get('content-type')||'').includes('application/json'))throw new ApiError('Resposta inesperada do servidor.',response.status);
  return (await response.json()) as T;
}
export async function apiPdf(path:string):Promise<Blob>{
  const response=await request(path,{method:'GET'},true);
  if(!(response.headers.get('content-type')||'').includes('application/pdf'))throw new ApiError('O servidor não retornou um PDF.',response.status);
  return response.blob();
}
export function showPdf(blob:Blob, filename:string):void {
  const url=URL.createObjectURL(blob);
  const anchor=document.createElement('a');anchor.href=url;anchor.download=filename;
  document.body.appendChild(anchor);anchor.click();anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
}
