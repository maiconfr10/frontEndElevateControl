/** Contratos HTTP efetivamente implementados pelo Spring Boot v1.0. */
import {apiPdf,apiRequest,showPdf} from './http';
import type {Building,Checklist,Client,Elevator,NewChecklist,NewTicket,Ticket,User} from '../types';
const url=(path:string,id:string)=>`${path}/${encodeURIComponent(id)}`;
export const clientsApi={
  list:()=>apiRequest<Client[]>('/clientes'),
  visibleNames:()=>apiRequest<Array<Pick<Client,'id'|'nome'>>>('/clientes/nomes-visiveis'),
  create:(value:Omit<Client,'id'>)=>apiRequest<Client>('/clientes',{method:'POST',body:value}),
};
export const buildingsApi={
  list:()=>apiRequest<Building[]>('/predios'),
  create:(value:Omit<Building,'id'>)=>apiRequest<Building>('/predios',{method:'POST',body:value}),
};
export const elevatorsApi={
  list:()=>apiRequest<Elevator[]>('/elevadores'),
  create:(value:Omit<Elevator,'id'>)=>apiRequest<Elevator>('/elevadores',{method:'POST',body:value}),
  update:(id:string,value:Partial<Omit<Elevator,'id'>>)=>apiRequest<Elevator>(url('/elevadores',id),{method:'PATCH',body:value}),
};
export const ticketsApi={
  list:()=>apiRequest<Ticket[]>('/chamados'),
  create:(value:NewTicket)=>apiRequest<Ticket>('/chamados',{method:'POST',body:value}),
  assign:(id:string,tecnicoId:string)=>apiRequest<Ticket>(url('/chamados',id)+'/atribuicao',{method:'PATCH',body:{tecnicoId}}),
  start:(id:string)=>apiRequest<Ticket>(url('/chamados',id)+'/iniciar',{method:'POST'}),
};
export const checklistsApi={
  list:()=>apiRequest<Checklist[]>('/checklists'),
  create:(value:NewChecklist)=>apiRequest<Checklist>('/checklists',{method:'POST',body:value}),
  detail:(id:string)=>apiRequest<Checklist>(url('/checklists',id)),
};
export interface UsuarioCriado extends User {senhaTemporaria:string}
export const usersApi={
  list:()=>apiRequest<User[]>('/usuarios'),
  create:(value:Omit<User,'id'>)=>apiRequest<UsuarioCriado>('/usuarios',{method:'POST',body:{...value,clienteId:value.perfil==='cliente'?value.clienteId:null}}),
};
export const reportsApi={
  download:async(id:string)=>{
    const blob=await apiPdf(url('/relatorios',id)+'/pdf');
    showPdf(blob,`elevatecontrol-relatorio-${id}.pdf`);
  },
};
