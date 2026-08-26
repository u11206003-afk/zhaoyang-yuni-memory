'use client';

import { useRef, useState } from 'react';

const memories = [
  { id: 1, date: '8月24日・星期一', author: '妳', title: '臨時起意的淡水散步', note: '風很大，頭髮一直亂飛，但夕陽真的好漂亮。謝謝你總是願意陪我亂跑。', place: '淡水漁人碼頭', image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=85', kind: 'photo', reactions: 3 },
  { id: 2, date: '8月17日・星期一', author: '她', title: '下班後的小約會', note: '找到一間很安靜的咖啡店。妳說起司蛋糕普通，結果還是吃完了我的一半。', place: '中山區', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=85', kind: 'photo', reactions: 2 },
  { id: 3, date: '8月08日・星期六', author: '妳', title: '台北的雨停了', note: '本來以為今天哪裡都去不了，後來雨停，我們就這樣走了好久。', place: '台北街頭', image: 'https://images.unsplash.com/photo-1587306576090-305af1d8b356?auto=format&fit=crop&w=1200&q=85', kind: 'video', reactions: 5 },
];

const galleryItems = [
  ...memories,
  { id: 4, title: '一起看海的午後', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=85', kind: 'photo' },
  { id: 5, title: '週末早午餐', image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=85', kind: 'photo' },
  { id: 6, title: '山裡的風', image: 'https://images.unsplash.com/photo-1464278533981-50106e6176b1?auto=format&fit=crop&w=900&q=85', kind: 'video' },
  { id: 7, title: '回家的路上', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85', kind: 'photo' },
  { id: 8, title: '妳喜歡的花', image: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=900&q=85', kind: 'photo' },
];

export default function Home() {
  const [active, setActive] = useState<'timeline' | 'monthly' | 'map' | 'gallery' | 'people'>('timeline');
  const [compose, setCompose] = useState(false);
  const [toast, setToast] = useState('');
  const [liked, setLiked] = useState<number[]>([]);
  const [location, setLocation] = useState('');
  const [savedPlaces, setSavedPlaces] = useState<string[]>([]);
  const [playing, setPlaying] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2200); };
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
      <div className="brand"><span className="brand-mark">憶</span><span>照樣<span className="brand-dot">・</span>憶起</span></div>
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
        <button className="mobile-brand" onClick={() => setActive('timeline')}>照</button>
        <div className="search"><span className="search-mark"/><input aria-label="搜尋回憶" placeholder="搜尋日期、地點或回憶…" /></div>
        <div className="header-actions"><button className="invite" onClick={() => notify('邀請連結已複製')}>＋ 邀請她</button><button className="bell" aria-label="通知"><span className="bell-shape"/><i /></button><span className="profile">妳</span></div>
      </header>

      {active === 'timeline' && <div className="page-grid"><div className="feed">
        <div className="welcome"><div><p className="eyebrow">2026 年 8 月</p><h1>最近過得好嗎？</h1><p>把今天的小事，也留給未來的我們。</p></div><div className="weather"><span>晴</span><strong>29°</strong><small>台北・晴</small></div></div>
        <button className="quick-add" onClick={() => setCompose(true)}><span className="add-icon">＋</span><span><strong>新增一則回憶</strong><small>照片、影片，還有想說的話</small></span><b>開始記錄 →</b></button>
        <div className="section-heading"><h2>八月的日常</h2><span>共 12 則回憶</span></div>
        {memories.map(memory => <article className="memory-card" key={memory.id}>
          <div className="memory-date"><span>{memory.date}</span><button aria-label="更多">•••</button></div>
          <div className="media-wrap"><img src={memory.image} alt={memory.title} />{memory.kind === 'video' && <button className={`play ${playing === memory.id ? 'is-playing' : ''}`} aria-label={playing === memory.id ? '暫停影片' : '播放影片'} onClick={() => {setPlaying(playing === memory.id ? null : memory.id); notify(playing === memory.id ? '影片已暫停' : '影片開始播放');}}><span className={playing === memory.id ? 'pause-shape' : 'play-shape'}/></button>}<span className="place"><i className="mini-pin"/>{memory.place}</span></div>
          <div className="memory-body"><div className="byline"><span className={`avatar avatar-${memory.author === '她' ? 'her' : 'you'}`}>{memory.author}</span><strong>{memory.author}記下的</strong></div><h3>{memory.title}</h3><p>{memory.note}</p><div className="card-actions"><button className={liked.includes(memory.id) ? 'liked' : ''} onClick={() => setLiked(v => v.includes(memory.id) ? v.filter(id => id !== memory.id) : [...v, memory.id])}>喜歡 {memory.reactions + (liked.includes(memory.id) ? 1 : 0)}</button><button onClick={() => notify('留言功能已開啟')}>留言</button><button onClick={() => notify('已加入本月精選')}>精選</button><button className="download-action" onClick={() => saveMedia(memory.image, memory.title, memory.kind)}>儲存</button></div></div>
        </article>)}
      </div><aside className="right-rail">
        <div className="month-card"><p className="eyebrow">本月回憶錄</p><h2>我們的八月</h2><div className="collage"><img src={memories[0].image} alt="淡水夕陽" /><img src={memories[1].image} alt="咖啡時光" /><img src={memories[2].image} alt="台北夜晚" /></div><p>一起收藏了 <strong>12 個日常</strong><br/>還有 3 天，就能翻開這個月的故事。</p><div className="progress"><i /></div><button onClick={() => setActive('monthly')}>先看看回憶錄 →</button></div>
        <div className="prompt-card"><span>“</span><p>如果只能留下一張照片，這個月你會選哪張？</p><button onClick={() => setCompose(true)}>寫下答案</button></div><p className="privacy"><i className="lock-shape"/>這裡只有你們看得見</p>
      </aside></div>}

      {active === 'monthly' && <div className="monthly-view"><p className="eyebrow">MONTHLY MEMOIR</p><h1>我們的八月</h1><p className="lead">有些日子很普通，因為一起記得，就變得閃閃發亮。</p><div className="monthly-hero"><img src={memories[0].image} alt="八月封面"/><div><small>2026・AUGUST</small><h2>風、雨，還有<br/>一起散步的我們</h2><p>12 則回憶・28 張照片・3 段影片</p></div></div><div className="stats"><div><b>8</b><span>一起記錄的日子</span></div><div><b>3</b><span>去過的地方</span></div><div><b>∞</b><span>想留住的瞬間</span></div></div><button className="primary" onClick={() => notify('回憶錄已儲存')}>收藏這本回憶錄</button></div>}
      {active === 'people' && <div className="people-view"><p className="eyebrow">OUR LITTLE UNIVERSE</p><h1>共同成員</h1><p>一起收藏生活的人，都在這裡。</p><div className="people-list"><div><span className="large-avatar you">妳</span><section><h3>妳</h3><p>建立者・記下 7 則回憶</p></section><b>管理員</b></div><div><span className="large-avatar her">她</span><section><h3>她</h3><p>共同成員・記下 5 則回憶</p></section><b>成員</b></div></div><button className="primary" onClick={() => notify('邀請連結已複製')}>＋ 邀請重要的人</button></div>}
      {active === 'map' && <div className="map-view"><div className="view-title"><div><p className="eyebrow">OUR FOOTPRINTS</p><h1>我們去過的地方</h1><p>每一個座標，都藏著一段只有我們知道的故事。</p></div><button className="primary" onClick={() => setCompose(true)}>＋ 新增地點</button></div><div className="map-layout"><div className="memory-map" aria-label="回憶足跡地圖"><div className="map-road road-one"/><div className="map-road road-two"/><div className="river"/><span className="map-label north">北投</span><span className="map-label center">台北市</span><span className="map-label west">淡水河</span><button className="map-pin pin-one" onClick={() => notify('淡水漁人碼頭・3 則回憶')}><i>3</i><span>淡水</span></button><button className="map-pin pin-two" onClick={() => notify('中山區・5 則回憶')}><i>5</i><span>中山</span></button><button className="map-pin pin-three" onClick={() => notify('信義區・2 則回憶')}><i>2</i><span>信義</span></button>{savedPlaces.map((place, i) => <button key={`${place}-${i}`} className="map-pin new-pin" style={{left: `${34 + (i % 3) * 16}%`, top: `${22 + (i % 4) * 13}%`}} onClick={() => notify(`${place}・剛新增的回憶`)}><i>1</i><span>{place}</span></button>)}</div><aside className="place-list"><h2>最近的足跡</h2>{savedPlaces.map((place, i) => <button key={`${place}-list-${i}`} onClick={() => notify(`${place}・剛新增的回憶`)}><span className="place-icon"><i className="mini-pin"/></span><span><strong>{place}</strong><small>1 則回憶・剛剛新增</small></span><b>›</b></button>)}{memories.map((m, i) => <button key={m.id} onClick={() => notify(`${m.place}・${i + 2} 則回憶`)}><img src={m.image} alt=""/><span><strong>{m.place}</strong><small>{i + 2} 則回憶・最近於 {m.date.split('・')[0]}</small></span><b>›</b></button>)}</aside></div></div>}
      {active === 'gallery' && <div className="gallery-view"><div className="view-title"><div><p className="eyebrow">ALL MOMENTS</p><h1>全部相簿</h1><p>照片與影片，都按時間好好收藏在這裡。</p></div><button className="primary" onClick={() => setCompose(true)}>＋ 加入照片或影片</button></div><div className="gallery-tools"><div><button className="selected">全部 36</button><button>照片 30</button><button>影片 6</button></div><button>最新優先</button></div><div className="gallery-grid">{galleryItems.map((item, i) => <div className={`gallery-item item-${i % 5}`} key={item.id}><img src={item.image} alt={item.title}/><span className={`media-kind ${item.kind === 'video' ? 'video-icon' : 'photo-icon'}`}/><button className="gallery-save" aria-label={`儲存${item.title}`} onClick={() => saveMedia(item.image, item.title, item.kind)}>儲存</button><div><strong>{item.title}</strong><small>2026 年 8 月</small></div></div>)}</div></div>}
    </section>

    <nav className="bottom-nav"><button className={active === 'timeline' ? 'active' : ''} onClick={() => setActive('timeline')}><b className="ui-icon home-icon"/><span>日常</span></button><button className={active === 'map' ? 'active' : ''} onClick={() => setActive('map')}><b className="ui-icon pin-icon"/><span>足跡</span></button><button onClick={() => setCompose(true)} className="nav-add">＋</button><button className={active === 'gallery' ? 'active' : ''} onClick={() => setActive('gallery')}><b className="ui-icon grid-icon"/><span>相簿</span></button><button className={active === 'monthly' ? 'active' : ''} onClick={() => setActive('monthly')}><b className="ui-icon book-icon"/><span>回憶錄</span></button></nav>
    {compose && <div className="modal-backdrop" onMouseDown={() => setCompose(false)}><div className="compose-modal" onMouseDown={e => e.stopPropagation()}><button className="close" onClick={() => setCompose(false)}>×</button><p className="eyebrow">NEW MEMORY</p><h2>今天想留下什麼？</h2><button className="upload-zone" onClick={() => fileRef.current?.click()}><span>＋</span><strong>加入照片或影片</strong><small>支援多張照片與影片</small></button><input ref={fileRef} type="file" accept="image/*,video/*" multiple hidden onChange={() => notify('已選取媒體')} /><label>這段回憶的名字<input placeholder="例如：下班後的小約會" /></label><label>去了哪裡？<div className="location-input"><span><i className="mini-pin"/></span><input value={location} onChange={e => setLocation(e.target.value)} placeholder="搜尋或輸入地點，例如：淡水漁人碼頭" /></div><small className="field-hint">收藏後會自動加入「我們的足跡」</small></label><label>想說的話<textarea placeholder="記下此刻的心情…" /></label><div className="modal-actions"><button onClick={() => setCompose(false)}>取消</button><button className="save" onClick={() => { if (location.trim()) setSavedPlaces(v => [location.trim(), ...v]); setLocation(''); setCompose(false); notify(location.trim() ? '回憶已收藏，地點已連結到足跡地圖' : '回憶已好好收藏'); }}>收藏回憶</button></div></div></div>}
    {toast && <div className="toast">完成・{toast}</div>}
  </main>;
}

