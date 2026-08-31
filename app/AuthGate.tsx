'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import MemoryApp from './MemoryApp';

type Props = { supabaseUrl: string; publishableKey: string };

export default function AuthGate({ supabaseUrl, publishableKey }: Props) {
  const supabase = useMemo(() => supabaseUrl && publishableKey ? createClient(supabaseUrl, publishableKey) : null, [supabaseUrl, publishableKey]);
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [nameDraft, setNameDraft] = useState('');
  const [inviteAfterSetup, setInviteAfterSetup] = useState(false);

  useEffect(() => {
    if (!supabase) { setReady(true); return; }
    supabase.auth.getSession().then(({ data }) => {
      setSignedIn(Boolean(data.session));
      setDisplayName(String(data.session?.user.user_metadata?.display_name || ''));
      setAvatarUrl(String(data.session?.user.user_metadata?.avatar_url || ''));
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
      setDisplayName(String(session?.user.user_metadata?.display_name || ''));
      setAvatarUrl(String(session?.user.user_metadata?.avatar_url || ''));
    });
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return setMessage('登入服務尚未完成設定，請稍後再試。');
    setBusy(true); setMessage('');
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setMessage(error ? '電子郵件或密碼不正確。' : '登入成功');
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
      if (error) setMessage(error.message.includes('already') ? '這個電子郵件已經註冊過。' : '註冊失敗，請確認電子郵件與密碼。');
      else if (!data.session) setMessage('註冊成功，請到信箱點擊確認連結。');
      else setMessage('註冊完成');
    }
    setBusy(false);
  };

  const signInWithLine = async () => {
    if (!supabase) return setMessage('登入服務尚未完成設定，請稍後再試。');
    setBusy(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'custom:line',
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setMessage('LINE 登入暫時無法使用，請稍後再試。');
      setBusy(false);
    }
  };

  const saveDisplayName = async (name: string) => {
    const cleanName = name.trim();
    if (!supabase || !cleanName) return false;
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ data: { display_name: cleanName } });
    setBusy(false);
    if (error) return false;
    setDisplayName(cleanName);
    return true;
  };

  const saveAvatar = async (url: string) => {
    if (!supabase || !url) return false;
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ data: { avatar_url: url } });
    setBusy(false);
    if (error) return false;
    setAvatarUrl(url);
    return true;
  };

  const finishFirstProfile = async (event: FormEvent) => {
    event.preventDefault();
    const saved = await saveDisplayName(nameDraft);
    if (saved) setInviteAfterSetup(true);
    else setMessage('名字儲存失敗，請再試一次。');
  };

  if (!ready) return <main className="auth-screen"><div className="auth-loading">正在準備你們的回憶…</div></main>;
  if (signedIn && !displayName) return <main className="auth-screen onboarding-screen">
    <section className="auth-card onboarding-card">
      <div className="onboarding-step">第一步</div>
      <div className="auth-logo-wrap"><img className="auth-logo" src="/photo-together-logo.png" alt="Photo Together" /></div>
      <p className="auth-kicker">HELLO, TOGETHER</p>
      <h1>想怎麼稱呼你？</h1>
      <p className="auth-intro">這個名字會顯示在你留下的照片、影片和小日記旁邊。</p>
      <form onSubmit={finishFirstProfile}>
        <label>你的名字<input autoFocus required maxLength={20} value={nameDraft} onChange={e => setNameDraft(e.target.value)} placeholder="例如：小陽" /></label>
        {message && <p className="auth-message" role="status">{message}</p>}
        <button className="auth-submit" disabled={busy || !nameDraft.trim()}>{busy ? '正在儲存…' : '建立名字並繼續'}</button>
      </form>
      <small>之後可以從右上角頭像修改。</small>
    </section>
  </main>;
  if (signedIn) return <MemoryApp displayName={displayName} avatarUrl={avatarUrl} inviteOnStart={inviteAfterSetup} onSaveName={saveDisplayName} onSaveAvatar={saveAvatar} onSignOut={() => supabase?.auth.signOut()} />;

  return <main className="auth-screen">
    <section className="auth-card">
      <div className="auth-logo-wrap"><img className="auth-logo" src="/photo-together-logo.png" alt="Photo Together 照樣・憶起" /></div>
      <p className="auth-kicker">OUR LITTLE UNIVERSE</p>
      <h1>{mode === 'login' ? '歡迎回來' : '建立你們的相簿'}</h1>
      <p className="auth-intro">登入後，照片、影片和每一段小日記才會出現在這裡。</p>
      <button className="line-login" type="button" onClick={signInWithLine} disabled={busy}>
        <span className="line-mark" aria-hidden="true">LINE</span>
        使用 LINE 登入
      </button>
      <div className="auth-divider"><span>或使用電子郵件</span></div>
      <div className="auth-tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => {setMode('login');setMessage('');}}>登入</button><button className={mode === 'register' ? 'active' : ''} onClick={() => {setMode('register');setMessage('');}}>註冊</button></div>
      <form onSubmit={submit}>
        <label>電子郵件<input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" /></label>
        <label>密碼<input required minLength={6} type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="至少 6 個字元" /></label>
        {message && <p className="auth-message" role="status">{message}</p>}
        <button className="auth-submit" disabled={busy}>{busy ? '請稍候…' : mode === 'login' ? '登入並查看回憶' : '建立帳號'}</button>
      </form>
      <small>只有登入的成員，才能進入共同相簿。</small>
    </section>
  </main>;
}

