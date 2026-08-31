'use client';

import { useRef, useState } from 'react';

type Memory = { id: number; date: string; author: string; title: string; note: string; place: string; image: string; kind: string; reactions: number };
const memories: Memory[] = [];
const galleryItems: Memory[] = [];

type Props = { displayName: string; avatarUrl: string; inviteOnStart?: boolean; onSaveName: (name: string) => Promise<boolean>; onSaveAvatar: (url: string) => Promise<boolean>; onSignOut: () => void };

export default function Home({ displayName, avatarUrl, inviteOnStart = false, onSaveName, onSaveAvatar, onSignOut }: Props) {
  const [active, setActive] = useState<'timeline' | 'monthly' | 'map' | 'gallery' | 'people'>('timeline');
  const [compose, setCompose] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(inviteOnStart);
  const [profileMenu, setProfileMenu] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileName, setProfileName] = useState(displayName);
  const [profileDraft, setProfileDraft] = useState(displayName);
  const [profileAvatar, setProfileAvatar] = useState(avatarUrl);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [toast, setToast] = useState('');
  const [liked, setLiked] = useState<number[]>([]);
  const [location, setLocation] = useState('');
  const [savedPlaces, setSavedPlaces] = useState<string[]>([]);
  const [playing, setPlaying] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2200); };
  const copyInviteLink = async () => {
    await navigator.clipboard.writeText('https://zhaoyang-yuni.u11206003.chatgpt.site');
    notify('邀請連結已複製');
  };
  const saveProfile = async () => {
    const saved = await onSaveName(profileDraft);
    if (saved) { setProfileName(profileDraft.trim()); setProfileOpen(false); notify('個人檔案已更新'); }
    else notify('更新失敗，請再試一次');
  };
  const chooseAvatar = () => avatarRef.current?.click();
  const uploadAvatar = async (file?: File) => {
    if (!file || !file.type.startsWith('image/')) return;
    setAvatarBusy(true);
    try {
      const source = URL.createObjectURL(file);
      const image = new Image();
      await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(); image.src = source; });
      const size = Math.min(image.naturalWidth, image.naturalHeight);
      const canvas = document.createElement('canvas');
      canvas.width = 180; canvas.height = 180;
      canvas.getContext('2d')?.drawImage(image, (image.naturalWidth - size) / 2, (image.naturalHeight - size) / 2, size, size, 0, 0, 180, 180);
      URL.revokeObjectURL(source);
      const nextAvatar = canvas.toDataURL('image/jpeg', .78);
      const saved = await onSaveAvatar(nextAvatar);
      if (!saved) throw new Error('save failed');
      setProfileAvatar(nextAvatar);
      notify('大頭照已更新');
    } catch {
      notify('照片處理失敗，請換一張再試');
    } finally {
      setAvatarBusy(false);
      if (avatarRef.current) avatarRef.current.value = '';
    }
  };
  const avatar = (className: string) => profileAvatar ? <img className={className} src={profileAvatar} alt={`${profileName}的大頭照`} /> : <span className={className}>{profileName.slice(0,1)}</span>;
  const saveMedia = async (url: string, title: string, kind: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `${title}.${kind === 'video' ? 'mp4' : 'jpg'}`;
      document.body.appendChild(link);
      link.click(); link.remove(); URL.revokeObjectURL(objectUrl);
      notify('已開始儲存到裝置');
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
      notify('請長按媒體，選擇儲存到相簿');
    }
  };

  return <main className="app-shell">
    <aside className="sidebar">
      <div className="brand"><img className="site-logo" src="/photo-together-logo.png" alt=""/><span>照樣<span className="brand-dot">・</span>憶起</span></div>
      <nav aria-label="主要選單">
        <button className={active === 'timeline' ? 'active' : ''} onClick={() => setActive('timeline')}><span className="ui-icon home-icon"/>我們的日常</button>
        <button className={active === 'monthly' ? 'active' : ''} onClick={() => setActive('monthly')}><span className="ui-icon book-icon"/>每月回憶錄</button>
        <button className={active === 'map' ? 'active' : ''} onClick={() => setActive('map')}><span className="ui-icon pin-icon"/>我們的足跡</button>
        <button className={active === 'gallery' ? 'active' : ''} onClick={() => setActive('gallery')}><span className="ui-icon grid-icon"/>全部相簿</button>
        <button className={active === 'people' ? 'active' : ''} onClick={() => setActive('people')}><span className="ui-icon people-icon"/>共同成員</button>
      </nav>
      <div className="album-block"><p>回憶相簿</p><button><i className="album-icon travel-icon"/>第一次旅行</button><button><i className="album-icon food-icon"/>吃吃喝喝</button><button><i className="album-icon daily-icon"/>平凡日常</button></div>
      <div className="sidebar-bottom"><div className="tiny-avatars"><span>妳</span><span>她</span></div><div><strong>我們的小宇宙</strong><small>只有 2 位成員</small></div><button aria-label="設定">•••</button></div>
    </aside>

    <section className="content">
      <header className="topbar">
        <button className="mobile-brand" onClick={() => setActive('timeline')}><img src="/photo-together-logo.png" alt="回到日常"/></button>
        <div className="search"><span className="search-mark"/><input aria-label="搜尋回憶" placeholder="搜尋日期、地點或回憶…" /></div>
        <div className="header-actions"><button className="invite" onClick={() => setInviteOpen(true)}>＋ 邀請她</button><button className="bell" aria-label="通知"><span className="bell-shape"/><i /></button><div className="profile-area"><button className="profile" aria-label="開啟個人選單" onClick={() => setProfileMenu(v => !v)}>{avatar('profile-avatar-image')}</button>{profileMenu && <div className="profile-menu"><div className="profile-menu-head">{avatar('profile-menu-avatar')}<div><strong>{profileName}</strong><small>我的個人空間</small></div></div><button onClick={() => {setSettingsOpen(true);setProfileMenu(false)}}>設定</button><button onClick={() => {setProfileDraft(profileName);setProfileOpen(true);setProfileMenu(false)}}>編輯個人檔案</button><button onClick={() => {setInviteOpen(true);setProfileMenu(false)}}>邀請連結</button></div>}</div></div>
      </header>

      {active === 'timeline' && <div className="page-grid"><div className="feed">
        <div className="welcome"><div><p className="eyebrow">2026 年 8 月</p><h1>最近過得好嗎？</h1><p>把今天的小事，也留給未來的我們。</p></div><div className="weather"><span>晴</span><strong>29°</strong><small>台北・晴</small></div></div>
        <button className="quick-add" onClick={() => setCompose(true)}><span className="add-icon">＋</span><span><strong>新增一則回憶</strong><small>照片、影片，還有想說的話</small></span><b>開始記錄 →</b></button>
        <div className="section-heading"><h2>我們的日常</h2><span>共 0 則回憶</span></div>
        {memories.length === 0 && <div className="empty-state"><i className="empty-photo"/><h3>還沒有回憶</h3><p>從第一張照片、第一段影片或一句想說的話開始。</p><button onClick={() => setCompose(true)}>＋ 上傳第一則回憶</button></div>}
        {memories.map(memory => <article className="memory-card" key={memory.id}>
          <div className="memory-date"><span>{memory.date}</span><button aria-label="更多">•••</button></div>
          <div className="media-wrap"><img src={memory.image} alt={memory.title} />{memory.kind === 'video' && <button className={`play ${playing === memory.id ? 'is-playing' : ''}`} aria-label={playing === memory.id ? '暫停影片' : '播放影片'} onClick={() => {setPlaying(playing === memory.id ? null : memory.id); notify(playing === memory.id ? '影片已暫停' : '影片開始播放');}}><span className={playing === memory.id ? 'pause-shape' : 'play-shape'}/></button>}<span className="place"><i className="mini-pin"/>{memory.place}</span></div>
          <div className="memory-body"><div className="byline"><span className={`avatar avatar-${memory.author === '她' ? 'her' : 'you'}`}>{memory.author}</span><strong>{memory.author}記下的</strong></div><h3>{memory.title}</h3><p>{memory.note}</p><div className="card-actions"><button className={liked.includes(memory.id) ? 'liked' : ''} onClick={() => setLiked(v => v.includes(memory.id) ? v.filter(id => id !== memory.id) : [...v, memory.id])}>喜歡 {memory.reactions + (liked.includes(memory.id) ? 1 : 0)}</button><button onClick={() => notify('留言功能已開啟')}>留言</button><button onClick={() => notify('已加入本月精選')}>精選</button><button className="download-action" onClick={() => saveMedia(memory.image, memory.title, memory.kind)}>儲存</button></div></div>
        </article>)}
      </div><aside className="right-rail">
        <div className="month-card"><p className="eyebrow">本月回憶錄</p><h2>等待第一篇故事</h2><div className="empty-collage"><i className="empty-photo"/></div><p>上傳回憶後，這裡會自動整理成屬於你們的每月回憶錄。</p><button onClick={() => setCompose(true)}>開始收藏 →</button></div>
        <div className="prompt-card"><span>“</span><p>如果只能留下一張照片，這個月你會選哪張？</p><button onClick={() => setCompose(true)}>寫下答案</button></div><p className="privacy"><i className="lock-shape"/>這裡只有你們看得見</p>
      </aside></div>}

      {active === 'monthly' && <div className="monthly-view"><p className="eyebrow">MONTHLY MEMOIR</p><h1>每月回憶錄</h1><p className="lead">有些日子很普通，因為一起記得，就變得閃閃發亮。</p><div className="empty-state monthly-empty"><i className="book-icon ui-icon"/><h3>第一本回憶錄正在等你們</h3><p>本月上傳的照片、影片與日記會自動整理在這裡。</p><button onClick={() => setCompose(true)}>＋ 新增第一則回憶</button></div></div>}
      {active === 'people' && <div className="people-view"><p className="eyebrow">OUR LITTLE UNIVERSE</p><h1>共同成員</h1><p>一起收藏生活的人，都在這裡。</p><div className="people-list"><div><span className="large-avatar you">妳</span><section><h3>妳</h3><p>建立者・記下 0 則回憶</p></section><b>管理員</b></div></div><button className="primary" onClick={() => setInviteOpen(true)}>＋ 邀請重要的人</button></div>}
      {active === 'map' && <div className="map-view"><div className="view-title"><div><p className="eyebrow">OUR FOOTPRINTS</p><h1>我們去過的地方</h1><p>每一個座標，都藏著一段只有我們知道的故事。</p></div><button className="primary" onClick={() => setCompose(true)}>＋ 新增地點</button></div><div className="map-layout"><div className="memory-map empty-map" aria-label="尚無回憶足跡"><div className="map-road road-one"/><div className="map-road road-two"/><div className="river"/>{savedPlaces.map((place, i) => <button key={`${place}-${i}`} className="map-pin new-pin" style={{left: `${34 + (i % 3) * 16}%`, top: `${22 + (i % 4) * 13}%`}} onClick={() => notify(`${place}・剛新增的回憶`)}><i>1</i><span>{place}</span></button>)}{savedPlaces.length === 0 && <div className="map-empty-message"><i className="pin-icon ui-icon"/><strong>還沒有足跡</strong><span>新增回憶時填入地點，就會出現在這張地圖。</span></div>}</div><aside className="place-list"><h2>最近的足跡</h2>{savedPlaces.length === 0 && <p className="list-empty">尚未新增任何地點</p>}{savedPlaces.map((place, i) => <button key={`${place}-list-${i}`} onClick={() => notify(`${place}・剛新增的回憶`)}><span className="place-icon"><i className="mini-pin"/></span><span><strong>{place}</strong><small>1 則回憶・剛剛新增</small></span><b>›</b></button>)}</aside></div></div>}
      {active === 'gallery' && <div className="gallery-view"><div className="view-title"><div><p className="eyebrow">ALL MOMENTS</p><h1>全部相簿</h1><p>照片與影片，都按時間好好收藏在這裡。</p></div><button className="primary" onClick={() => setCompose(true)}>＋ 加入照片或影片</button></div><div className="gallery-tools"><div><button className="selected">全部 0</button><button>照片 0</button><button>影片 0</button></div><button>最新優先</button></div>{galleryItems.length === 0 ? <div className="empty-state gallery-empty"><i className="empty-photo"/><h3>相簿還是空的</h3><p>上傳第一張照片或第一段影片，開始你們的共同相簿。</p><button onClick={() => setCompose(true)}>＋ 選擇照片或影片</button></div> : <div className="gallery-grid">{galleryItems.map((item, i) => <div className={`gallery-item item-${i % 5}`} key={item.id}><img src={item.image} alt={item.title}/><span className={`media-kind ${item.kind === 'video' ? 'video-icon' : 'photo-icon'}`}/><button className="gallery-save" aria-label={`儲存${item.title}`} onClick={() => saveMedia(item.image, item.title, item.kind)}>儲存</button><div><strong>{item.title}</strong><small>{item.date}</small></div></div>)}</div>}</div>}
    </section>

    <nav className="bottom-nav"><button className={active === 'timeline' ? 'active' : ''} onClick={() => setActive('timeline')}><b className="ui-icon home-icon"/><span>日常</span></button><button className={active === 'map' ? 'active' : ''} onClick={() => setActive('map')}><b className="ui-icon pin-icon"/><span>足跡</span></button><button onClick={() => setCompose(true)} className="nav-add">＋</button><button className={active === 'gallery' ? 'active' : ''} onClick={() => setActive('gallery')}><b className="ui-icon grid-icon"/><span>相簿</span></button><button className={active === 'monthly' ? 'active' : ''} onClick={() => setActive('monthly')}><b className="ui-icon book-icon"/><span>回憶錄</span></button></nav>
    {inviteOpen && <div className="modal-backdrop" onMouseDown={() => setInviteOpen(false)}><div className="invite-modal" onMouseDown={e => e.stopPropagation()}><button className="close" onClick={() => setInviteOpen(false)}>×</button><img className="invite-logo" src="/photo-together-logo.png" alt="Photo Together"/><p className="eyebrow">INVITE TOGETHER</p><h2>邀請她一起收藏</h2><p>請伴侶用手機掃描 QR Code，登入後就能一起留下照片、影片與小日記。</p><img className="invite-qr" src="/invite-qr.png" alt="照樣・憶起邀請 QR Code"/><button className="copy-invite" onClick={copyInviteLink}>複製邀請連結</button><small>zhaoyang-yuni.u11206003.chatgpt.site</small></div></div>}
    {profileOpen && <div className="modal-backdrop" onMouseDown={() => setProfileOpen(false)}><div className="profile-modal" onMouseDown={e => e.stopPropagation()}><button className="close" onClick={() => setProfileOpen(false)}>×</button><button className="avatar-upload" type="button" onClick={chooseAvatar} disabled={avatarBusy}>{avatar('profile-edit-avatar')}<span>{avatarBusy ? '處理中…' : '更換照片'}</span></button><input ref={avatarRef} className="avatar-file-input" type="file" accept="image/*" onChange={e => uploadAvatar(e.target.files?.[0])}/><p className="avatar-hint">從手機相簿選擇，會自動裁成方形</p><p className="eyebrow">EDIT PROFILE</p><h2>編輯個人檔案</h2><label>顯示名稱<input maxLength={20} value={profileDraft} onChange={e => setProfileDraft(e.target.value)} /></label><button className="copy-invite" disabled={!profileDraft.trim() || avatarBusy} onClick={saveProfile}>儲存變更</button></div></div>}
    {settingsOpen && <div className="modal-backdrop" onMouseDown={() => setSettingsOpen(false)}><div className="settings-modal" onMouseDown={e => e.stopPropagation()}><button className="close" onClick={() => setSettingsOpen(false)}>×</button><p className="eyebrow">SETTINGS</p><h2>設定</h2><div className="setting-row"><span>帳號名稱</span><strong>{profileName}</strong></div><div className="setting-row"><span>相簿隱私</span><strong>只有受邀成員</strong></div><button className="settings-invite" onClick={() => {setSettingsOpen(false);setInviteOpen(true)}}>查看邀請連結</button><button className="settings-signout" onClick={onSignOut}>登出帳號</button></div></div>}
    {compose && <div className="modal-backdrop" onMouseDown={() => setCompose(false)}><div className="compose-modal" onMouseDown={e => e.stopPropagation()}><button className="close" onClick={() => setCompose(false)}>×</button><p className="eyebrow">NEW MEMORY</p><h2>今天想留下什麼？</h2><button className="upload-zone" onClick={() => fileRef.current?.click()}><span>＋</span><strong>加入照片或影片</strong><small>支援多張照片與影片</small></button><input ref={fileRef} type="file" accept="image/*,video/*" multiple hidden onChange={() => notify('已選取媒體')} /><label>這段回憶的名字<input placeholder="例如：下班後的小約會" /></label><label>去了哪裡？<div className="location-input"><span><i className="mini-pin"/></span><input value={location} onChange={e => setLocation(e.target.value)} placeholder="搜尋或輸入地點，例如：淡水漁人碼頭" /></div><small className="field-hint">收藏後會自動加入「我們的足跡」</small></label><label>想說的話<textarea placeholder="記下此刻的心情…" /></label><div className="modal-actions"><button onClick={() => setCompose(false)}>取消</button><button className="save" onClick={() => { if (location.trim()) setSavedPlaces(v => [location.trim(), ...v]); setLocation(''); setCompose(false); notify(location.trim() ? '回憶已收藏，地點已連結到足跡地圖' : '回憶已好好收藏'); }}>收藏回憶</button></div></div></div>}
    {toast && <div className="toast">完成・{toast}</div>}
  </main>;
}

