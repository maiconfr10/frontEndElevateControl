import { useState } from 'react';
import { ArrowDownToLine, ClipboardCheck, FileText, Search, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge, Button, EmptyState, PageHeader, Panel, Note } from '../components/UI';
import { dateTimeBr } from '../utils/format';
import { printChecklist } from '../utils/printReport';
import {reportsApi} from '../services/domainApi';
import {AUTH_MODE} from '../services/auth';

export default function Reports() {
  const {db,user,access,notify}=useApp();
  const download=async(c:import('../types').Checklist)=>{
    try{if(AUTH_MODE==='demo')printChecklist(c,db);else await reportsApi.download(c.id);}
    catch(err){notify(err instanceof Error?err.message:'Não foi possível baixar o PDF.');}
  };
  const [search,setSearch]=useState('');
  const reports=access.history.filter(c=>{
    const t=db.tickets.find(t=>t.id===c.chamadoId);
    const b=db.buildings.find(b=>b.id===t?.predioId);
    return [c.chamadoId,c.tipo,b?.nome,t?.titulo].join(' ').toLowerCase().includes(search.toLowerCase());
  });
  return <>
    <PageHeader eyebrow="DOCUMENTOS / HISTÓRICO" title="Relatórios e histórico técnico" subtitle={user.perfil==='admin'?'Visão global das manutenções preventivas e dos atendimentos de emergência.':user.perfil==='tecnico'?'Registros de prédios atendidos pelo técnico.':'Consulte os registros de manutenção dos seus próprios prédios.'}/>
    <div className="reports-banner"><span><ShieldCheck size={20}/></span><div><strong>Histórico segmentado por perfil</strong><p>O administrador consulta todos os registros; o técnico, os prédios já atendidos; o cliente, seus próprios prédios.</p></div></div>
    <Panel title="Histórico de atendimentos" subtitle="Registros de visitas e dados de manutenção" action={<span className="total-count">{reports.length} relatório(s)</span>}>
      <div className="table-controls"><label className="search-control"><Search size={18}/><input placeholder="Buscar por chamado, tipo ou prédio" value={search} onChange={e=>setSearch(e.target.value)}/></label></div>
      {reports.length?<div className="table-scroll"><table className="data-table"><thead><tr><th>RELATÓRIO</th><th>PRÉDIO / ELEVADOR</th><th>TIPO</th><th>REGISTRO</th><th>DATA</th><th>VALIDAÇÃO</th><th>AÇÃO</th></tr></thead><tbody>{reports.map(c=>{
        const t=db.tickets.find(t=>t.id===c.chamadoId);
        const b=db.buildings.find(b=>b.id===t?.predioId);
        const e=db.elevators.find(e=>e.id===t?.elevadorId);
        return <tr key={c.id}><td><strong className="table-main">{t?.titulo||'Atendimento'}</strong><small className="table-secondary">{c.chamadoId} · {c.id}</small></td><td><strong className="table-muted">{b?.nome||'—'}</strong><small className="table-secondary">{e?.identificacao||'—'}</small></td><td><Badge tone={c.tipo==='Mensal'?'blue':'neutral'}>{c.tipo}</Badge></td><td className="nowrap">{c.registroAtendimento?.numeroRegistro||'Legado'}</td><td className="nowrap">{dateTimeBr(c.concluidoEm)}</td><td>{c.assinatura?<Badge tone="green">Assinado</Badge>:<span className="table-secondary">Aguardando validação</span>}</td><td><button className="report-button" onClick={()=>void download(c)}><FileText size={16}/> Imprimir / PDF</button></td></tr>;
      })}</tbody></table></div>:<EmptyState icon={FileText} title="Nenhum relatório encontrado" description="Os atendimentos com checklist concluído aparecerão aqui."/>}
    </Panel>
    <p className="report-footnote">Os relatórios disponíveis podem ser consultados e baixados para acompanhamento dos atendimentos.</p>
  </>;
}
