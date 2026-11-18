import {useState,type FormEvent} from 'react';
import {Eye,EyeOff} from 'lucide-react';
import {useAuth} from '../context/AuthContext';
import {Button,Field,Modal} from './UI';

type PasswordInputProps = {
 id: string;
 label: string;
 value: string;
 onChange: (value: string) => void;
 autoComplete: 'current-password' | 'new-password';
 minLength?: number;
 full?: boolean;
 disabled?: boolean;
};

/** Campo de senha com controle independente de visibilidade. */
function PasswordInput({id,label,value,onChange,autoComplete,minLength,full=false,disabled=false}:PasswordInputProps){
 const [visible,setVisible]=useState(false);
 return <div className={`field${full?' full':''}`}>
   <label className="field-label" htmlFor={id}>{label}</label>
   <div className="setup-password-field">
     <input id={id} required type={visible?'text':'password'} minLength={minLength}
       autoComplete={autoComplete} value={value} disabled={disabled}
       onChange={event=>onChange(event.target.value)}/>
     <button type="button" className="setup-password-toggle"
       aria-label={`${visible?'Ocultar':'Mostrar'} ${label.toLowerCase()}`}
       title={visible?'Ocultar senha':'Mostrar senha'} aria-pressed={visible}
       onClick={()=>setVisible(current=>!current)} disabled={disabled}>
       {visible?<EyeOff size={19} aria-hidden="true"/>:<Eye size={19} aria-hidden="true"/>}
     </button>
   </div>
 </div>;
}
export default function ProfileDialog({onClose}:{onClose:()=>void}){
 const {user,updateProfile,updateOwnPassword,isDemo}=useAuth();
 const [name,setName]=useState(user?.nome||'');const [email,setEmail]=useState(user?.email||'');
 const [profilePassword,setProfilePassword]=useState('');
 const [oldPassword,setOldPassword]=useState('');const [newPassword,setNewPassword]=useState('');const [confirmation,setConfirmation]=useState('');
 const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [notice,setNotice]=useState('');
 const saveInfo=async(e:FormEvent)=>{
   e.preventDefault();setError('');setBusy(true);
   try{await updateProfile(name,email,profilePassword);onClose();}
   catch(ex){setError(ex instanceof Error?ex.message:'Não foi possível atualizar o perfil.');}finally{setBusy(false);}
 };
 const savePassword=async(e:FormEvent)=>{
   e.preventDefault();setError('');setNotice('');
   if(newPassword.length<12||newPassword!==confirmation){setError('Informe uma senha com 12 caracteres e repita-a corretamente.');return;}
   if(newPassword===oldPassword){setError('A nova senha deve ser diferente da atual.');return;}
   setBusy(true);try{await updateOwnPassword(oldPassword,newPassword);setOldPassword('');setNewPassword('');setConfirmation('');setNotice('Senha alterada com sucesso.');}
   catch(ex){setError(ex instanceof Error?ex.message:'Não foi possível alterar a senha.');}finally{setBusy(false);}
 };
 return <Modal title="Minha conta" subtitle="Atualize seus dados e mantenha sua senha em segurança." onClose={onClose} wide>
   {error&&<div role="alert" className="login-alert">{error}</div>}
   {notice&&<div role="status" className="login-success">{notice}</div>}
   {isDemo?<p>A edição de perfil está disponível no ambiente conectado ao servidor.</p>:<>
   <form className="form-grid" onSubmit={saveInfo}>
     <h3 className="full">Dados da conta</h3>
     <Field label="Nome completo"><input required maxLength={120} value={name} onChange={e=>setName(e.target.value)}/></Field>
     <Field label="E-mail de acesso"><input required type="email" value={email} onChange={e=>setEmail(e.target.value)}/></Field>
     <PasswordInput id="profile-current-password" label="Confirme a senha atual para editar seus dados" value={profilePassword} onChange={setProfilePassword} autoComplete="current-password" full disabled={busy}/>
     <div className="form-actions full"><small>Após salvar o perfil, entre novamente com seu e-mail atualizado.</small><Button type="submit" disabled={busy}>Salvar meus dados</Button></div>
   </form>
   <hr className="setup-divider"/>
   <form className="form-grid" onSubmit={savePassword}>
     <h3 className="full">Alterar senha</h3>
     <PasswordInput id="profile-old-password" label="Senha atual" value={oldPassword} onChange={setOldPassword} autoComplete="current-password" full disabled={busy}/>
     <PasswordInput id="profile-new-password" label="Nova senha" value={newPassword} onChange={setNewPassword} autoComplete="new-password" minLength={12} disabled={busy}/>
     <PasswordInput id="profile-confirm-password" label="Confirmar nova senha" value={confirmation} onChange={setConfirmation} autoComplete="new-password" minLength={12} disabled={busy}/>
     <div className="form-actions full"><Button type="submit" disabled={busy}>Alterar senha</Button></div>
   </form></>}
 </Modal>;
}
