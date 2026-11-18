// Assistente do site: avatar da Sabrina no canto inferior direito, janela flutuante e conversa por árvore de decisões.
// "Deixar meu contato" grava como cliente no CRM (função crm-agendar, acao 'contato') e avisa a Sabrina no celular.
// Usa as cores e fontes da página (variáveis --bg, --ink, --gold...). Incluir com <script src="assistente.js" defer></script>.
(() => {
  const API = 'https://jgigosrsyxjqqhckudfe.supabase.co/functions/v1/crm-agendar';
  const NA_AGENDA = /\/agendar(\.html)?$/.test(location.pathname);
  const AGENDA = NA_AGENDA ? null : 'agendar', IG = 'https://ig.me/m/rovyacreative';
  const guardar = (k, v) => { try { sessionStorage.setItem(k, v); } catch { } };
  const lido = k => { try { return sessionStorage.getItem(k); } catch { return null; } };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

  const css = `
  .rva{--rva-bg:var(--bg,#0e0809);--rva-ink:var(--ink,#f3ebe3);--rva-mute:var(--mute,#a8978c);--rva-gold:var(--gold,#c9a063);--rva-gold2:var(--gold2,#e6c891);--rva-line:var(--line,rgba(201,160,99,.22));
    --rva-serif:var(--serif,"Cormorant Garamond",Georgia,serif);--rva-sans:var(--sans,Inter,system-ui,sans-serif);
    position:fixed;right:max(20px,env(safe-area-inset-right));bottom:max(20px,env(safe-area-inset-bottom));z-index:70;font-family:var(--rva-sans);color:var(--rva-ink)}
  .rva *{box-sizing:border-box;margin:0;padding:0}
  .rva-bt{position:relative;width:64px;height:64px;border-radius:50%;border:0;padding:0;cursor:pointer;background:none;display:block;
    box-shadow:0 14px 34px rgba(0,0,0,.45);transition:transform .35s cubic-bezier(.2,.8,.2,1);animation:rva-entra .8s 1.2s cubic-bezier(.2,.8,.2,1) both}
  .rva-bt:hover{transform:translateY(-3px) scale(1.04)}
  .rva-bt img{width:100%;height:100%;border-radius:50%;object-fit:cover;display:block;border:2px solid var(--rva-bg)}
  .rva-bt::before{content:"";position:absolute;inset:-4px;border-radius:50%;padding:2px;background:conic-gradient(from 210deg,var(--rva-gold2),var(--rva-gold),#7a5a2a,var(--rva-gold2));
    -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude}
  .rva-bt::after{content:"";position:absolute;inset:-4px;border-radius:50%;border:1px solid var(--rva-gold);opacity:0;animation:rva-onda 3.2s 2.4s infinite}
  .rva-bt .rva-x{position:absolute;inset:0;border-radius:50%;display:grid;place-items:center;background:var(--rva-bg);opacity:0;transform:rotate(-90deg);transition:.35s}
  .rva-bt .rva-x svg{width:20px;height:20px;stroke:var(--rva-gold)}
  .rva.aberta .rva-bt .rva-x{opacity:1;transform:none}
  .rva.aberta .rva-bt::after{animation:none}
  .rva-on{position:absolute;right:2px;bottom:3px;width:13px;height:13px;border-radius:50%;background:#6fae7b;border:2px solid var(--rva-bg)}
  .rva.aberta .rva-on{display:none}
  .rva-dica{position:absolute;right:76px;bottom:8px;width:max-content;max-width:min(300px,calc(100vw - 110px));padding:.7rem 2.2rem .7rem 1rem;border-radius:16px 16px 4px 16px;
    background:color-mix(in srgb,var(--rva-bg) 90%,transparent);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid var(--rva-line);
    box-shadow:0 18px 40px rgba(0,0,0,.35);font-size:.86rem;line-height:1.45;cursor:pointer;animation:rva-surge .6s cubic-bezier(.2,.8,.2,1) both}
  .rva-dica b{display:block;font:500 1.05rem/1.2 var(--rva-serif);color:var(--rva-gold2);margin-bottom:.15rem}
  .rva-dica button{position:absolute;top:.35rem;right:.4rem;width:24px;height:24px;border:0;background:none;color:var(--rva-mute);cursor:pointer;font-size:1rem;line-height:1}
  .rva.aberta .rva-dica{display:none}
  .rva-jan{position:absolute;right:0;bottom:80px;width:min(380px,calc(100vw - 32px));height:min(600px,calc(100svh - 120px));display:flex;flex-direction:column;overflow:hidden;
    border-radius:20px;border:1px solid var(--rva-line);background:color-mix(in srgb,var(--rva-bg) 93%,transparent);backdrop-filter:blur(20px) saturate(1.1);-webkit-backdrop-filter:blur(20px) saturate(1.1);
    box-shadow:0 40px 90px rgba(0,0,0,.5);transform-origin:bottom right;opacity:0;transform:translateY(14px) scale(.96);pointer-events:none;visibility:hidden;
    transition:opacity .35s,transform .45s cubic-bezier(.2,.8,.2,1),visibility 0s .45s}
  .rva.aberta .rva-jan{opacity:1;transform:none;pointer-events:auto;visibility:visible;transition:opacity .35s,transform .45s cubic-bezier(.2,.8,.2,1)}
  .rva-jan::before{content:"";position:absolute;inset:0 0 auto;height:1px;background:linear-gradient(90deg,transparent,var(--rva-gold),transparent);opacity:.6}
  .rva-topo{display:flex;align-items:center;gap:.8rem;padding:1rem 1.1rem;border-bottom:1px solid var(--rva-line)}
  .rva-topo img{width:44px;height:44px;border-radius:50%;object-fit:cover;border:1px solid var(--rva-gold)}
  .rva-topo div{flex:1;min-width:0}
  .rva-topo b{display:block;font:500 1.2rem/1.1 var(--rva-serif)}
  .rva-topo span{font-size:.7rem;letter-spacing:.06em;color:var(--rva-mute)}
  .rva-topo span i{display:inline-block;width:7px;height:7px;border-radius:50%;background:#6fae7b;margin-right:.35rem;vertical-align:1px}
  .rva-fechar{width:34px;height:34px;border-radius:50%;border:1px solid var(--rva-line);background:none;color:var(--rva-ink);cursor:pointer;display:grid;place-items:center}
  .rva-fechar:hover{border-color:var(--rva-gold)}
  .rva-fechar svg{width:14px;height:14px}
  .rva-msgs{flex:1;overflow-y:auto;padding:1.1rem 1rem .6rem;display:flex;flex-direction:column;gap:.55rem;scrollbar-width:thin;scrollbar-color:var(--rva-line) transparent;overscroll-behavior:contain}
  .rva-m{max-width:86%;padding:.7rem .95rem;border-radius:16px 16px 16px 4px;font-size:.88rem;line-height:1.5;background:color-mix(in srgb,var(--rva-ink) 7%,transparent);border:1px solid var(--rva-line);animation:rva-surge .4s cubic-bezier(.2,.8,.2,1) both}
  .rva-m.eu{align-self:flex-end;border-radius:16px 16px 4px 16px;background:linear-gradient(135deg,var(--rva-gold2),var(--rva-gold));color:#1a0c0e;border:0;font-weight:400}
  [data-theme=light] .rva-m.eu{background:var(--wine,#5c1a24);color:#f3ece3}
  .rva-m b{font-weight:500}
  .rva-m ol{margin:.4rem 0 0 1.1rem}
  .rva-m li{margin:.15rem 0}
  .rva-m a.rva-link{display:inline-flex;align-items:center;gap:.4rem;margin-top:.6rem;padding:.55rem 1rem;border-radius:999px;text-decoration:none;font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;font-weight:500;
    background:linear-gradient(135deg,var(--rva-gold2),var(--rva-gold));color:#1a0c0e}
  [data-theme=light] .rva-m a.rva-link{background:var(--wine,#5c1a24);color:#f3ece3}
  .rva-digitando{display:flex;gap:4px;padding:.85rem 1rem;width:max-content}
  .rva-digitando i{width:6px;height:6px;border-radius:50%;background:var(--rva-mute);animation:rva-pula 1.2s infinite}
  .rva-digitando i:nth-child(2){animation-delay:.15s}.rva-digitando i:nth-child(3){animation-delay:.3s}
  .rva-ops{display:flex;flex-wrap:wrap;gap:.45rem;padding:.4rem 1rem 1rem;justify-content:flex-end}
  .rva-ops button,.rva-ops a{border:1px solid var(--rva-line);background:none;color:var(--rva-ink);border-radius:999px;padding:.55rem .95rem;font:400 .82rem var(--rva-sans);cursor:pointer;text-decoration:none;
    transition:border-color .25s,background .25s;animation:rva-surge .4s cubic-bezier(.2,.8,.2,1) both}
  .rva-ops button:hover,.rva-ops a:hover{border-color:var(--rva-gold);background:color-mix(in srgb,var(--rva-gold) 12%,transparent)}
  .rva-form{display:grid;gap:.7rem;padding:.4rem 1rem 1rem;animation:rva-surge .4s both}
  .rva-form label{font-size:.62rem;letter-spacing:.18em;text-transform:uppercase;color:var(--rva-mute)}
  .rva-form input,.rva-form textarea{display:block;width:100%;margin-top:.25rem;padding:.5rem 0;background:transparent;border:0;border-bottom:1px solid var(--rva-line);color:var(--rva-ink);font:400 .95rem var(--rva-sans);outline:none;resize:none}
  .rva-form input:focus,.rva-form textarea:focus{border-bottom-color:var(--rva-gold)}
  .rva-form .rva-env{margin-top:.2rem;padding:.8rem;border:0;border-radius:999px;cursor:pointer;font:500 .72rem var(--rva-sans);letter-spacing:.2em;text-transform:uppercase;background:linear-gradient(135deg,var(--rva-gold2),var(--rva-gold));color:#1a0c0e}
  [data-theme=light] .rva-form .rva-env{background:var(--wine,#5c1a24);color:#f3ece3}
  .rva-form .rva-env:disabled{opacity:.6;cursor:progress}
  .rva-form .rva-erro{font-size:.78rem;color:#e8907f;min-height:0}
  .rva-form .rva-erro:empty{display:none}
  .rva-form .rva-voltar{background:none;border:0;color:var(--rva-mute);font-size:.75rem;cursor:pointer;justify-self:start}
  .rva-pe{padding:.55rem 1rem;border-top:1px solid var(--rva-line);font-size:.66rem;color:var(--rva-mute);text-align:center;letter-spacing:.04em}
  .rva :focus-visible{outline:2px solid var(--rva-gold);outline-offset:2px}
  @keyframes rva-entra{from{opacity:0;transform:translateY(20px) scale(.8)}to{opacity:1;transform:none}}
  @keyframes rva-surge{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
  @keyframes rva-onda{0%{opacity:.7;transform:scale(1)}70%,100%{opacity:0;transform:scale(1.35)}}
  @keyframes rva-pula{0%,60%,100%{transform:none;opacity:.5}30%{transform:translateY(-4px);opacity:1}}
  @media (max-width:520px){
    .rva{right:14px;bottom:14px}
    .rva-bt{width:58px;height:58px}
    .rva-jan{position:fixed;left:8px;right:8px;bottom:84px;width:auto;height:min(78svh,620px)}
  }
  @media (prefers-reduced-motion:reduce){.rva *,.rva *::before,.rva *::after{animation:none!important;transition:none!important}}`;

  const el = document.createElement('div');
  el.className = 'rva';
  el.innerHTML = `<style>${css}</style>
    <div class="rva-jan" id="rvaJan" role="dialog" aria-modal="false" aria-label="Conversa com a assistente da Sabrina">
      <div class="rva-topo"><img src="img/sabrina-avatar.webp" alt="" width="44" height="44"><div><b>Sabrina Amorim</b><span><i></i>Assistente · resposta automática</span></div>
        <button class="rva-fechar" type="button" aria-label="Fechar conversa"><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 3l10 10M13 3L3 13"/></svg></button></div>
      <div class="rva-msgs" aria-live="polite"></div>
      <div class="rva-acoes"></div>
      <div class="rva-pe">A Sabrina responde pessoalmente o que você deixar aqui.</div>
    </div>
    <button class="rva-bt" type="button" aria-label="Abrir conversa com a assistente da Sabrina" aria-expanded="false" aria-controls="rvaJan">
      <img src="img/sabrina-avatar.webp" alt="" width="64" height="64"><span class="rva-on" aria-hidden="true"></span>
      <span class="rva-x" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" stroke-width="1.6"><path d="M3 3l10 10M13 3L3 13"/></svg></span>
    </button>`;
  document.body.append(el);
  const $ = s => el.querySelector(s), msgs = $('.rva-msgs'), acoes = $('.rva-acoes'), bt = $('.rva-bt');
  const espera = ms => new Promise(r => setTimeout(r, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : ms));
  let iniciou = false, ocupado = false;

  // ---- conversa ----
  const rolar = () => msgs.scrollTo({ top: msgs.scrollHeight, behavior: 'smooth' });
  async function fala(html) {
    const d = document.createElement('div'); d.className = 'rva-m rva-digitando'; d.innerHTML = '<i></i><i></i><i></i>'; msgs.append(d); rolar();
    await espera(Math.min(1300, 450 + html.replace(/<[^>]+>/g, '').length * 9));
    d.className = 'rva-m'; d.innerHTML = html; rolar();
  }
  const eu = t => { const d = document.createElement('div'); d.className = 'rva-m eu'; d.textContent = t; msgs.append(d); rolar(); };
  function opcoes(lista) {
    acoes.innerHTML = `<div class="rva-ops">${lista.map(([t, k], i) => k.startsWith('http') || k.startsWith('#') || k === 'agendar'
      ? `<a href="${esc(k)}" ${k.startsWith('http') ? 'target="_blank" rel="noopener"' : ''} style="animation-delay:${i * 50}ms">${esc(t)}</a>`
      : `<button type="button" data-ir="${esc(k)}" style="animation-delay:${i * 50}ms">${esc(t)}</button>`).join('')}</div>`;
  }
  const MENU = () => [['Quero agendar uma conversa', 'agenda'], ['Como funciona o trabalho?', 'metodo'], ['Para quem é?', 'publico'], ['Quanto custa?', 'valor'],
    ['Ver projetos', NA_AGENDA ? './#projetos' : '#projetos'], ['Deixar meu contato', 'contato'], ['Falar pelo Instagram', IG]];
  const ESTADOS = {
    async inicio() {
      await fala('Oi! 👋 Eu sou a assistente da <b>Sabrina</b>, aqui na ROVYA.');
      await fala(NA_AGENDA ? 'Ficou alguma dúvida antes de escolher o horário? Posso te ajudar com:' : 'Posso te ajudar a dar o primeiro passo com a sua marca. Sobre o que você quer saber?');
      opcoes(MENU());
    },
    async menu() { await fala('Posso ajudar com mais alguma coisa?'); opcoes(MENU()); },
    async agenda() {
      if (NA_AGENDA) { await fala('Você já está na agenda da Sabrina 🙂 É só escolher um dia no calendário: os que têm um ponto dourado estão com horários livres.'); return opcoes([['Como é a conversa?', 'conversa'], ['Outra dúvida', 'menu']]); }
      await fala('Que bom! A primeira conversa é <b>online, pelo Google Meet</b>, e dura cerca de 1 hora. Você escolhe o dia e o horário direto na agenda da Sabrina.<br><a class="rva-link" href="agendar">Abrir a agenda →</a>');
      opcoes([['Como é a conversa?', 'conversa'], ['Outra dúvida', 'menu']]);
    },
    async conversa() {
      await fala('É um momento para a Sabrina entender o seu negócio:<ol><li><b>Escuta:</b> você conta o momento da marca e o que te trouxe até aqui.</li><li><b>Leitura:</b> vocês olham juntas onde a percepção de valor está se perdendo.</li><li><b>Direção:</b> você sai com clareza sobre o próximo passo.</li></ol>');
      opcoes([...(NA_AGENDA ? [] : [['Agendar agora', 'agendar']]), ['Quanto custa?', 'valor'], ['Outra dúvida', 'menu']]);
    },
    async metodo() {
      await fala('A ROVYA faz <b>gestão estratégica e integrada da comunicação</b>: do posicionamento à experiência do cliente.');
      await fala('O caminho tem três etapas:<ol><li><b>Entender:</b> diagnóstico do negócio, do que você entrega e de onde o cliente deixa de perceber esse valor.</li><li><b>Organizar:</b> o diagnóstico vira direção: o que muda, o que fica e o que pode crescer.</li><li><b>Posicionar:</b> comunicação, atendimento e experiência na mesma direção.</li></ol>');
      opcoes([['Para quem é?', 'publico'], ['Quero agendar uma conversa', 'agenda'], ['Outra dúvida', 'menu']]);
    },
    async publico() {
      await fala('É para quem sente que <b>entrega muito e o mercado percebe pouco</b>: quando a comunicação, o atendimento e a experiência não contam a mesma história sobre a marca.');
      opcoes([['Como funciona o trabalho?', 'metodo'], ['Quero agendar uma conversa', 'agenda'], ['Outra dúvida', 'menu']]);
    },
    async valor() {
      await fala('Cada projeto é desenhado a partir do diagnóstico do seu negócio, então o valor depende do que a sua marca precisa.');
      await fala('Na primeira conversa a Sabrina entende o seu momento e, se fizer sentido, te apresenta uma proposta sob medida.');
      opcoes([['Quero agendar uma conversa', 'agenda'], ['Deixar meu contato', 'contato'], ['Outra dúvida', 'menu']]);
    },
    async contato() {
      await fala('Perfeito! Deixa seu nome e um jeito de falar com você, que a <b>Sabrina responde pessoalmente</b>.');
      acoes.innerHTML = `<form class="rva-form" novalidate>
        <label>Seu nome<input name="nome" autocomplete="name" maxlength="120" required></label>
        <label>WhatsApp ou e-mail<input name="contato" autocomplete="email" maxlength="160" required></label>
        <label>Sobre o que quer conversar? <span style="opacity:.6">· opcional</span><textarea name="mensagem" rows="2" maxlength="1500"></textarea></label>
        <input name="site" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px">
        <p class="rva-erro" role="alert"></p>
        <button class="rva-env">Enviar para a Sabrina</button>
        <button type="button" class="rva-voltar" data-ir="menu">← Voltar</button></form>`;
      acoes.querySelector('[name=nome]').focus();
    },
  };
  async function ir(k, rotulo) {
    if (ocupado || !ESTADOS[k]) return;
    ocupado = true; acoes.innerHTML = '';
    if (rotulo) eu(rotulo);
    try { await ESTADOS[k](); } finally { ocupado = false; }
  }
  acoes.addEventListener('click', e => {
    const b = e.target.closest('[data-ir]'); if (b) { e.preventDefault(); ir(b.dataset.ir, b.dataset.ir === 'menu' && b.classList.contains('rva-voltar') ? null : b.textContent); }
    const a = e.target.closest('a[href^="#"]'); if (a) fechar();
  });
  msgs.addEventListener('click', e => { if (e.target.closest('a[href^="#"]')) fechar(); });
  acoes.addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target, d = Object.fromEntries(new FormData(f)), erro = f.querySelector('.rva-erro');
    const contato = d.contato.trim(), email = /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(contato), fone = contato.replace(/\D/g, '').length >= 10;
    if (d.nome.trim().length < 2) { erro.textContent = 'Como posso te chamar?'; return f.nome.focus(); }
    if (!email && !fone) { erro.textContent = 'Deixe um WhatsApp com DDD ou um e-mail.'; return f.contato.focus(); }
    const b = f.querySelector('.rva-env'); b.disabled = true; b.textContent = 'Enviando…'; erro.textContent = '';
    try {
      const r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ acao: 'contato', nome: d.nome.trim(), contato, mensagem: d.mensagem.trim(), pagina: location.pathname, site: d.site }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.erro || 'Não consegui enviar agora.');
      acoes.innerHTML = ''; eu(d.nome.trim() + ' · ' + contato);
      await fala(`Recebido, ${esc(d.nome.trim().split(' ')[0])}! 💛 A Sabrina vai falar com você ${email ? 'por e-mail' : 'pelo WhatsApp'} em breve.`);
      opcoes([...(NA_AGENDA ? [] : [['Já quero escolher um horário', 'agendar']]), ['Outra dúvida', 'menu']]);
    } catch (err) { erro.textContent = err.message + ' Tente de novo ou chame no Instagram.'; b.disabled = false; b.textContent = 'Enviar para a Sabrina'; }
  });

  // ---- abrir e fechar ----
  function abrir() {
    el.classList.add('aberta'); bt.setAttribute('aria-expanded', 'true'); bt.setAttribute('aria-label', 'Fechar conversa'); guardar('rva-dica', '1');
    $('.rva-dica')?.remove();
    if (!iniciou) { iniciou = true; ir('inicio'); }
    setTimeout(() => (acoes.querySelector('button,a,input') || $('.rva-fechar')).focus({ preventScroll: true }), 420);
  }
  function fechar() { el.classList.remove('aberta'); bt.setAttribute('aria-expanded', 'false'); bt.setAttribute('aria-label', 'Abrir conversa com a assistente da Sabrina'); }
  bt.onclick = () => el.classList.contains('aberta') ? fechar() : abrir();
  $('.rva-fechar').onclick = () => { fechar(); bt.focus(); };
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && el.classList.contains('aberta')) { fechar(); bt.focus(); } });

  // convite discreto depois de alguns segundos (uma vez por visita)
  if (!lido('rva-dica')) setTimeout(() => {
    if (el.classList.contains('aberta') || lido('rva-dica')) return;
    const d = document.createElement('div'); d.className = 'rva-dica'; d.setAttribute('role', 'status');
    d.innerHTML = `<b>Oi! Sou a assistente da Sabrina.</b>${NA_AGENDA ? 'Alguma dúvida antes de agendar?' : 'Posso te ajudar?'}<button type="button" aria-label="Dispensar">×</button>`;
    d.onclick = e => { if (e.target.closest('button')) { d.remove(); guardar('rva-dica', '1'); } else abrir(); };
    el.append(d);
  }, NA_AGENDA ? 9000 : 7000);
})();
