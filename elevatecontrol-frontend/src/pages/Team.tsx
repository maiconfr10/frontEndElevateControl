import type {FormEvent} from 'react';
import type {User,Role} from '../types';
import { useState } from 'react';
import { Plus, Search, ShieldCheck, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge, Button, EmptyState, Field, Modal, PageHeader, Panel } from '../components/UI';
import { initials, labelRole } from '../utils/format';

export default function Team() {
  const {db,user,add,notify}=useApp();
  const [modal,setModal]=useState(false);
  const [saving,setSaving]=useState(false);
  const [temporary,setTemporary]=useState('');
  const [search,setSearch]=useState('');
  const [form,setForm]=useState<Omit<User,'id'>>({nome:'',email:'',perfil:'tecnico',registro:'',clienteId:''});
  if(user.perfil!=='admin')return <EmptyState title="Acesso restrito" description="Somente administradores gerenciam a equipe."/>;
  const rows=db.users.filter(u=>[u.nome,u.email,u.registro].join(' ').toLowerCase().includes(search.toLowerCase()));
  const submit=async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    if(db.users.some(u=>u.email.toLowerCase()===form.email.toLowerCase()))return notify('Já existe um usuário com este e-mail.');
    if(form.perfil==='cliente'&&!form.clienteId)return notify('Vincule o acesso de cliente a um cadastro.');
    if(saving)return;setSaving(true);
    try{
      const created=await add('users','USR',{...form,clienteId:form.perfil==='cliente'?form.clienteId:null,registro:form.perfil==='tecnico'?form.registro:''});
      setModal(false);setForm({nome:'',email:'',perfil:'tecnico',registro:'',clienteId:''});
      const pwd=(created as User&{senhaTemporaria?:string}).senhaTemporaria;
      if(pwd)setTemporary(pwd);
    }catch(err){notify(err instanceof Error?err.message:'Não foi possível cadastrar o usuário.');}
    finally{setSaving(false);}
  };
  return <>
    <PageHeader eyebrow="ADMINISTRAÇÃO / EQUIPE" title="Equipe e acessos" subtitle="Gerencie usuários e perfis previstos na arquitetura do sistema." action={<Button icon={Plus} onClick={()=>setModal(true)}>Novo usuário</Button>}/>
    <div className="role-cards"><div><span className="role-icon"><ShieldCheck size={21}/></span><strong>{db.users.filter(u=>u.perfil==='admin').length}</strong><small>Administradores</small></div><div><span className="role-icon"><Users size={21}/></span><strong>{db.users.filter(u=>u.perfil==='tecnico').length}</strong><small>Técnicos</small></div><div><span className="role-icon"><Users size={21}/></span><strong>{db.users.filter(u=>u.perfil==='cliente').length}</strong><small>Acessos de clientes</small></div></div>
    <Panel title="Usuários cadastrados" subtitle="Permissões determinadas pelo perfil de acesso" action={<span className="total-count">{rows.length} usuário(s)</span>}><div className="table-controls"><label className="search-control"><Search size={18}/><input placeholder="Buscar nome, e-mail ou registro" value={search} onChange={e=>setSearch(e.target.value)}/></label></div><div className="table-scroll"><table className="data-table"><thead><tr><th>USUÁRIO</th><th>E-MAIL</th><th>PERFIL</th><th>REGISTRO / VÍNCULO</th></tr></thead><tbody>{rows.map(u=><tr key={u.id}><td><div className="user-row"><span className="avatar table-avatar">{initials(u.nome)}</span><div><strong className="table-main">{u.nome}</strong><small className="table-secondary">{u.id}</small></div></div></td><td>{u.email}</td><td><Badge tone={u.perfil==='admin'?'blue':u.perfil==='tecnico'?'amber':'green'}>{labelRole[u.perfil]}</Badge></td><td>{u.perfil==='cliente'?db.clients.find(c=>c.id===u.clienteId)?.nome||'Sem vínculo':u.registro||'—'}</td></tr>)}</tbody></table></div></Panel>
    {temporary&&<Modal title="Senha inicial do novo usuário" subtitle="Copie e entregue somente à pessoa autorizada. Este valor não será exibido novamente." onClose={()=>setTemporary('')}><div className="form-stack"><strong className="table-main" style={{overflowWrap:'anywhere'}}>{temporary}</strong><Button onClick={()=>{void navigator.clipboard?.writeText(temporary);notify('Senha copiada.')}}>Copiar senha</Button><Button variant="secondary" onClick={()=>setTemporary('')}>Fechar</Button></div></Modal>}
    {modal&&<Modal title="Cadastrar usuário" subtitle="Novo usuário com senha temporária para o primeiro acesso." onClose={()=>setModal(false)} wide><form className="form-grid" onSubmit={submit}><Field className="full" label="Nome completo"><input required value={form.nome} onChange={e=>setForm({...form,nome:e.target.value})}/></Field><Field label="E-mail"><input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></Field><Field label="Perfil de acesso"><select value={form.perfil} onChange={e=>setForm({...form,perfil:e.target.value as Role})}><option value="tecnico">Técnico</option><option value="admin">Administrador</option><option value="cliente">Cliente</option></select></Field>{form.perfil==='tecnico'&&<Field className="full" label="Registro do técnico"><input required value={form.registro} onChange={e=>setForm({...form,registro:e.target.value})} placeholder="Ex.: TEC-2001"/></Field>}{form.perfil==='cliente'&&<Field className="full" label="Cliente vinculado"><select required value={form.clienteId??''} onChange={e=>setForm({...form,clienteId:e.target.value})}><option value="">Selecione o cliente</option>{db.clients.map(c=><option key={c.id} value={c.id}>{c.nome}</option>)}</select></Field>}<div className="form-actions full"><Button variant="secondary" onClick={()=>setModal(false)}>Cancelar</Button><Button type="submit" disabled={saving}>{saving?"Salvando...":"Cadastrar usuário"}</Button></div></form></Modal>}
  </>;
}
