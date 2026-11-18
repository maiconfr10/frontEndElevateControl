import {createContext,useContext,useEffect,useMemo,useState,type ReactNode} from 'react';
import {getInitialData,persistData,resetData} from '../services/repository';
import {AUTH_MODE} from '../services/auth';
import {useAuth} from './AuthContext';
import {nextId} from '../utils/format';
import {buildingsApi,checklistsApi,clientsApi,elevatorsApi,ticketsApi,usersApi} from '../services/domainApi';
import type {AccessScope,Collection,CollectionItem,Database,NewChecklist,NewRecord,NewTicket,Ticket,Checklist,User} from '../types';
const EMPTY:Database={users:[],clients:[],buildings:[],elevators:[],tickets:[],checklists:[]};
interface AppContextValue {
  db:Database; user:User; access:AccessScope; toast:string; loading:boolean; loadError:string;
  notify:(message:string)=>void; reload:()=>Promise<void>;
  add:<K extends Collection>(collection:K,prefix:string,payload:NewRecord<K>)=>Promise<CollectionItem<K>>;
  update:<K extends Collection>(collection:K,id:string,patch:Partial<CollectionItem<K>>)=>Promise<void>;
  addTicket:(payload:NewTicket)=>Promise<Ticket>;
  saveChecklist:(payload:NewChecklist)=>Promise<Checklist>;
  resetDemo:()=>void;
}
const AppContext=createContext<AppContextValue|null>(null);
export function AppProvider({children}:{children:ReactNode}){
  const {user}=useAuth();
  const [db,setDb]=useState<Database>(()=>AUTH_MODE==='demo'?getInitialData():EMPTY);
  const [toast,setToast]=useState('');
  const [loading,setLoading]=useState(AUTH_MODE==='api');
  const [ready,setReady]=useState(AUTH_MODE==='demo');
  const [loadError,setLoadError]=useState('');
  if(!user)throw new Error('AppProvider exige sessão autenticada.');
  const notify=(message:string)=>setToast(message);
  useEffect(()=>{if(AUTH_MODE==='demo')persistData(db);},[db]);
  useEffect(()=>{if(!toast)return;const timer=setTimeout(()=>setToast(''),4500);return()=>clearTimeout(timer);},[toast]);
  const reload=async():Promise<void>=>{
    if(AUTH_MODE==='demo'){setDb(getInitialData());return;}
    setLoading(true);setLoadError('');
    try{
      // Servidor já filtra prédios, elevadores, chamados e relatórios pelo perfil.
      // /clientes e /usuarios são rotas exclusivas de administradores.
      const [clients,buildings,elevators,tickets,checklists,users]=await Promise.all([
        user.perfil==='admin'?clientsApi.list():clientsApi.visibleNames().then(names=>names.map(n=>({...n,documento:'',contato:'',email:'',telefone:''}))),
        buildingsApi.list(),elevatorsApi.list(),ticketsApi.list(),checklistsApi.list(),
        user.perfil==='admin'?usersApi.list():Promise.resolve([user])
      ]);
      setDb({clients,buildings,elevators,tickets,checklists,users});
      setReady(true);
    }catch(error){const message=error instanceof Error?error.message:'Falha ao carregar dados.';setLoadError(message);if(ready)notify(`Não foi possível atualizar os dados: ${message}`);throw error;}
    finally{setLoading(false);}
  };
  useEffect(()=>{if(AUTH_MODE==='api')void reload().catch(()=>{});},[user.id,user.perfil]);
  const add=async<K extends Collection>(collection:K,prefix:string,payload:NewRecord<K>):Promise<CollectionItem<K>>=>{
    if(AUTH_MODE==='demo'){
      const entry={id:nextId(prefix),...payload} as CollectionItem<K>;
      setDb(prev=>({...prev,[collection]:[entry,...prev[collection]]}));notify('Cadastro salvo na demonstração.');return entry;
    }
    let entry:CollectionItem<K>;
    if(collection==='clients')entry=await clientsApi.create(payload as unknown as Omit<Database['clients'][number],'id'>) as CollectionItem<K>;
    else if(collection==='buildings')entry=await buildingsApi.create(payload as unknown as Omit<Database['buildings'][number],'id'>) as CollectionItem<K>;
    else if(collection==='elevators')entry=await elevatorsApi.create(payload as unknown as Omit<Database['elevators'][number],'id'>) as CollectionItem<K>;
    else if(collection==='users')entry=await usersApi.create(payload as unknown as Omit<Database['users'][number],'id'>) as CollectionItem<K>;
    else throw new Error(`Use o serviço específico para cadastrar em ${collection}.`);
    // Senhas temporárias não são adicionadas ao estado de usuários.
    await reload();notify('Cadastro realizado com sucesso!');return entry;
  };
  const update=async<K extends Collection>(collection:K,id:string,patch:Partial<CollectionItem<K>>):Promise<void>=>{
    if(AUTH_MODE==='demo'){
      setDb(prev=>({...prev,[collection]:prev[collection].map(v=>v.id===id?{...v,...patch}:v)}));return;
    }
    if(collection==='elevators')await elevatorsApi.update(id,patch as Partial<Database['elevators'][number]>);
    else if(collection==='tickets'){
      const change=patch as Partial<Ticket>;
      if(typeof change.tecnicoId==='string'&&change.tecnicoId)await ticketsApi.assign(id,change.tecnicoId);
      else if(change.status==='Em andamento')await ticketsApi.start(id);
      else throw new Error('Essa alteração de chamado não é permitida pela API.');
    }else throw new Error(`Edição de ${collection} não disponível nesta API.`);
    await reload();notify('Alteração salva com sucesso!');
  };
  const addTicket=async(payload:NewTicket):Promise<Ticket>=>{
    if(AUTH_MODE==='demo'){
      const ticket={id:nextId('CH'),...payload,status:'Aberto',criadoPor:user.id,data:new Date().toISOString(),concluidoEm:null} as Ticket;
      setDb(prev=>({...prev,tickets:[ticket,...prev.tickets]}));notify('Chamado criado na demonstração.');return ticket;
    }
    const ticket=await ticketsApi.create(payload);
    await reload();notify('Chamado registrado com sucesso!');return ticket;
  };
  const saveChecklist=async(payload:NewChecklist):Promise<Checklist>=>{
    if(AUTH_MODE==='api'){
      const check=await checklistsApi.create(payload);
      await reload();notify('Visita técnica registrada com sucesso!');return check;
    }
    const now=new Date().toISOString();const check={...payload,id:nextId('CHK'),concluidoEm:now} as Checklist;
    const registro=payload.registroAtendimento;
    const regularizado=Boolean(registro?.equipamentos.every(x=>x.situacoes.length===1&&x.situacoes[0]==='Atendimento regularizado'));
    setDb(prev=>({...prev,checklists:[check,...prev.checklists],
      tickets:prev.tickets.map(t=>t.id===payload.chamadoId?{...t,status:regularizado?'Concluído':'Em andamento',concluidoEm:regularizado?now:null}:t),
      elevators:prev.elevators.map(e=>{
        const item=registro?.equipamentos.find(x=>x.elevadorId===e.id);if(!item)return e;
        const pend=item.situacoes.filter(s=>s!=='Atendimento regularizado').map(s=>s==='Outros'?item.outros:s);
        return {...e,status:item.situacoes.includes('Parado')?'Fora de serviço':pend.length?'Em manutenção':'Operacional',pendencia:pend.join('; ')};
      })
    }));
    notify(regularizado?'Visita salva e chamado concluído.':'Visita salva com pendências.');return check;
  };
  const resetDemo=()=>{if(AUTH_MODE==='demo'){resetData();setDb(getInitialData());notify('Demonstração restaurada.');}};
  const access=useMemo<AccessScope>(()=>{
    const myBuildings=db.buildings.filter(b=>b.clienteId===user.clienteId).map(b=>b.id);
    const visited=new Set<string>(db.checklists.filter(c=>c.tecnicoId===user.id).map(c=>db.tickets.find(t=>t.id===c.chamadoId)?.predioId).filter((s):s is string=>Boolean(s)));
    const tickets=user.perfil==='admin'?db.tickets:user.perfil==='cliente'?db.tickets.filter(t=>myBuildings.includes(t.predioId)):db.tickets.filter(t=>t.tecnicoId===user.id);
    const buildings=user.perfil==='admin'?db.buildings:user.perfil==='cliente'?db.buildings.filter(b=>myBuildings.includes(b.id)):db.buildings.filter(b=>visited.has(b.id)||tickets.some(t=>t.predioId===b.id));
    const history=user.perfil==='admin'?db.checklists:user.perfil==='cliente'?db.checklists.filter(c=>myBuildings.includes(db.tickets.find(t=>t.id===c.chamadoId)?.predioId??'')):db.checklists.filter(c=>visited.has(db.tickets.find(t=>t.id===c.chamadoId)?.predioId??''));
    const elevators=db.elevators.filter(e=>buildings.some(b=>b.id===e.predioId));
    return {tickets,buildings,elevators,history,myBuildingIds:myBuildings,visitedBuildingIds:[...visited]};
  },[db,user]);
  const value=useMemo<AppContextValue>(()=>({db,user,access,toast,loading,loadError,notify,reload,add,update,addTicket,saveChecklist,resetDemo}),[db,user,access,toast,loading,loadError]);
  if(loading&&!ready)return <div className="auth-loading" role="status"><div className="auth-loading-mark">E</div><span>Carregando dados do ElevateControl...</span></div>;
  if(loadError&&!ready)return <div className="auth-loading" role="alert"><strong>Falha ao consultar o backend</strong><p>{loadError}</p><button className="login-submit" onClick={()=>void reload()}>Tentar novamente</button></div>;
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
export function useApp():AppContextValue{
  const v=useContext(AppContext);if(!v)throw new Error('useApp exige AppProvider');return v;
}
