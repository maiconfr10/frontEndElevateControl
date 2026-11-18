import {useState,type FormEvent} from 'react';
import {Eye,EyeOff,KeyRound,ShieldCheck,LogOut} from 'lucide-react';
import {useAuth} from '../context/AuthContext';
export default function FirstAccess(){
 const {user,changeInitialPassword,completeFirstSetup,logout}=useAuth();
 const initialSetup=Boolean(user?.configuracaoInicialPendente);
 const [name,setName]=useState(initialSetup?'':user?.nome||'');
 const [email,setEmail]=useState(initialSetup?'':user?.email||'');
 const [current,setCurrent]=useState('');
 const [newPassword,setNewPassword]=useState('');
 const [confirm,setConfirm]=useState('');
 const [visible,setVisible]=useState({current:false,next:false,confirm:false});
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const submit=async(e:FormEvent<HTMLFormElement>)=>{
   e.preventDefault();setError('');
   if(newPassword.length<12){setError('A senha deve ter ao menos 12 caracteres.');return;}
   if(newPassword!==confirm){setError('As senhas não coincidem.');return;}
   if(current===newPassword){setError('Escolha uma senha diferente da temporária.');return;}
   setBusy(true);
   try{
     if(initialSetup)await completeFirstSetup(name.trim(),email.trim(),current,newPassword);
     else await changeInitialPassword(current,newPassword);
     setCurrent('');setNewPassword('');setConfirm('');
   }catch(ex){setError(ex instanceof Error?ex.message:'Não foi possível concluir a configuração.');}
   finally{setBusy(false);}
 };
 return <div className="setup-shell"><div className="setup-card">
   <div className="setup-icon">{initialSetup?<ShieldCheck size={26}/>:<KeyRound size={26}/>}</div>
   <p className="login-kicker">PRIMEIRO ACESSO SEGURO</p>
   <h1>{initialSetup?'Configure sua conta de administrador':'Crie sua senha pessoal'}</h1>
   <p className="setup-description">{initialSetup?'Personalize a conta provisória antes de administrar o ElevateControl.':'Por segurança, altere a senha temporária antes de acessar o sistema.'}</p>
   {error&&<div className="login-alert" role="alert">{error}</div>}
   <form onSubmit={submit} className="setup-form">
     {initialSetup&&<>
       <label htmlFor="setup-name">Seu nome completo</label><input id="setup-name" value={name} required maxLength={120} onChange={e=>setName(e.target.value)} autoComplete="name"/>
       <label htmlFor="setup-email">Seu e-mail de acesso</label><input id="setup-email" value={email} type="email" required onChange={e=>setEmail(e.target.value)} autoComplete="email"/>
     </>}
     <label htmlFor="setup-current">Senha temporária</label>
     <div className="setup-password-field">
       <input id="setup-current" type={visible.current?'text':'password'} autoComplete="current-password" required value={current} onChange={e=>setCurrent(e.target.value)}/>
       <button type="button" className="setup-password-toggle" onClick={()=>setVisible(v=>({...v,current:!v.current}))} aria-label={visible.current?'Ocultar senha temporária':'Mostrar senha temporária'} aria-pressed={visible.current} title={visible.current?'Ocultar senha':'Mostrar senha'} disabled={busy}>{visible.current?<EyeOff size={19}/>:<Eye size={19}/>}</button>
     </div>
     <label htmlFor="setup-new">Nova senha (mínimo de 12 caracteres)</label>
     <div className="setup-password-field">
       <input id="setup-new" type={visible.next?'text':'password'} autoComplete="new-password" minLength={12} required value={newPassword} onChange={e=>setNewPassword(e.target.value)}/>
       <button type="button" className="setup-password-toggle" onClick={()=>setVisible(v=>({...v,next:!v.next}))} aria-label={visible.next?'Ocultar nova senha':'Mostrar nova senha'} aria-pressed={visible.next} title={visible.next?'Ocultar senha':'Mostrar senha'} disabled={busy}>{visible.next?<EyeOff size={19}/>:<Eye size={19}/>}</button>
     </div>
     <label htmlFor="setup-confirm">Confirmar nova senha</label>
     <div className="setup-password-field">
       <input id="setup-confirm" type={visible.confirm?'text':'password'} autoComplete="new-password" minLength={12} required value={confirm} onChange={e=>setConfirm(e.target.value)}/>
       <button type="button" className="setup-password-toggle" onClick={()=>setVisible(v=>({...v,confirm:!v.confirm}))} aria-label={visible.confirm?'Ocultar confirmação de senha':'Mostrar confirmação de senha'} aria-pressed={visible.confirm} title={visible.confirm?'Ocultar senha':'Mostrar senha'} disabled={busy}>{visible.confirm?<EyeOff size={19}/>:<Eye size={19}/>}</button>
     </div>
     <button className="login-submit" disabled={busy} type="submit">{busy?'Atualizando acesso...':'Salvar e acessar o sistema'}</button>
   </form>
   <button className="setup-logout" onClick={()=>void logout()}><LogOut size={16}/> Sair da conta</button>
 </div></div>;
}
