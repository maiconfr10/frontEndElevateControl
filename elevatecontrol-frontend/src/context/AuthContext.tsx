import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AUTH_MODE, authenticate, endSession, requestPasswordReset, restoreSession, changePassword, completeInitialSetup, saveProfile } from '../services/auth';
import type { Credentials, User } from '../types';

interface AuthContextValue {
  user:User|null; checking:boolean; connectionError:string; isDemo:boolean;
  login:(credentials:Credentials)=>Promise<User>; logout:()=>Promise<void>;
  retrySession:()=>Promise<void>; requestPasswordReset:(email:string)=>Promise<void>;
  changeInitialPassword:(senhaAtual:string,novaSenha:string)=>Promise<void>;
  completeFirstSetup:(nome:string,email:string,senhaTemporaria:string,novaSenha:string)=>Promise<void>;
  updateProfile:(nome:string,email:string,senhaAtual:string)=>Promise<void>;
  updateOwnPassword:(senhaAtual:string,novaSenha:string)=>Promise<void>;
}
const AuthContext=createContext<AuthContextValue|null>(null);
export function AuthProvider({children}:{children:ReactNode}){
  const [user,setUser]=useState<User|null>(null);
  const [checking,setChecking]=useState(true);
  const [connectionError,setConnectionError]=useState('');
  const checkSession=async():Promise<void>=>{
    setChecking(true);setConnectionError('');
    try{setUser(await restoreSession());}
    catch{setConnectionError('Não foi possível validar sua sessão. Verifique a conexão com o servidor.');}
    finally{setChecking(false);}
  };
  useEffect(()=>{
    const onExpire=()=>setUser(null);
    window.addEventListener('elevatecontrol-session-expired',onExpire);
    void checkSession();
    return()=>window.removeEventListener('elevatecontrol-session-expired',onExpire);
  },[]);
  const login=async(credentials:Credentials):Promise<User>=>{
    const account=await authenticate(credentials);setUser(account);setConnectionError('');return account;
  };
  const logout=async():Promise<void>=>{await endSession();setUser(null);};
  const changeInitialPassword=async(senhaAtual:string,novaSenha:string)=>{
    await changePassword(senhaAtual,novaSenha);setUser(await restoreSession());
  };
  const completeFirstSetup=async(nome:string,email:string,senhaTemporaria:string,novaSenha:string)=>{
    const account=await completeInitialSetup(nome,email,senhaTemporaria,novaSenha);setUser(account);
  };
  const updateProfile=async(nome:string,email:string,senhaAtual:string)=>{
    await saveProfile(nome,email,senhaAtual);
    // Nome de login pode ter mudado; por segurança, reautenticação com a conta atualizada.
    await endSession();setUser(null);
  };
  const updateOwnPassword=async(senhaAtual:string,novaSenha:string)=>{
    await changePassword(senhaAtual,novaSenha);setUser(await restoreSession());
  };
  const value:AuthContextValue={user,checking,connectionError,isDemo:AUTH_MODE==='demo',login,logout,retrySession:checkSession,requestPasswordReset,changeInitialPassword,completeFirstSetup,updateProfile,updateOwnPassword};
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth():AuthContextValue{
  const context=useContext(AuthContext);if(!context)throw new Error('useAuth precisa estar dentro de AuthProvider');return context;
}
