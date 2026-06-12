// Aplica as cores do CONFIG no CSS
(function aplicarCores() {
  const r = document.documentElement.style;
  r.setProperty('--cor-primaria',   CONFIG.cores.primaria);
  r.setProperty('--cor-secundaria', CONFIG.cores.secundaria);
  r.setProperty('--cor-fundo',      CONFIG.cores.fundo);
  r.setProperty('--cor-texto',      CONFIG.cores.texto);
})();

// ── ABERTURA ────────────────────────────────────────────────
document.getElementById('btn-abrir').addEventListener('click', () => {
  document.getElementById('tela-abertura').classList.add('oculto');
  iniciarPlayer();
});

// ── PARTÍCULAS DE CORAÇÕES ───────────────────────────────────
(function criarParticulas() {
  const container = document.getElementById('particulas');
  const emojis = ['❤️', '💕', '💖', '💗', '🌹', '✨', '💝'];
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particula';
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.left       = Math.random() * 100 + 'vw';
    p.style.fontSize   = (Math.random() * 1.2 + 0.6) + 'rem';
    p.style.animationDuration  = (Math.random() * 12 + 8) + 's';
    p.style.animationDelay     = (Math.random() * 10) + 's';
    container.appendChild(p);
  }
})();

// ── CONTADOR TEMPO JUNTOS ────────────────────────────────────
(function iniciarContador() {
  function atualizar() {
    const inicio = new Date(CONFIG.dataInicio);
    const agora  = new Date();
    const diff   = agora - inicio;
    if (diff < 0) return;

    const anos   = Math.floor(diff / (1000*60*60*24*365.25));
    const meses  = Math.floor((diff % (1000*60*60*24*365.25)) / (1000*60*60*24*30.44));
    const dias   = Math.floor((diff % (1000*60*60*24*30.44))  / (1000*60*60*24));
    const horas  = Math.floor((diff % (1000*60*60*24))        / (1000*60*60));
    const minutos= Math.floor((diff % (1000*60*60))           / (1000*60));
    const segundos = Math.floor((diff % (1000*60))            / 1000);

    document.getElementById('c-anos').textContent    = anos;
    document.getElementById('c-meses').textContent   = meses;
    document.getElementById('c-dias').textContent    = dias;
    document.getElementById('c-horas').textContent   = horas;
    document.getElementById('c-min').textContent     = minutos;
    document.getElementById('c-seg').textContent     = segundos;
  }
  atualizar();
  setInterval(atualizar, 1000);
})();

// ── SLIDESHOW ────────────────────────────────────────────────
(function iniciarSlideshow() {
  const container   = document.getElementById('slides');
  const indicadores = document.getElementById('indicadores');
  if (!CONFIG.fotos.length) return;

  let atual = 0;

  CONFIG.fotos.forEach((foto, i) => {
    // slide
    const slide = document.createElement('div');
    slide.className = 'slide' + (i === 0 ? ' ativo' : '');
    slide.innerHTML = `<div class="slide-img-wrapper"><img src="${foto.src}" alt="Foto ${i+1}" loading="lazy"></div>
                       <p class="slide-legenda">${foto.legenda}</p>`;
    container.appendChild(slide);

    // indicador
    const ind = document.createElement('div');
    ind.className = 'indicador' + (i === 0 ? ' ativo' : '');
    ind.addEventListener('click', () => irPara(i));
    indicadores.appendChild(ind);
  });

  function irPara(idx) {
    document.querySelectorAll('.slide').forEach(s => s.classList.remove('ativo'));
    document.querySelectorAll('.indicador').forEach(d => d.classList.remove('ativo'));
    atual = (idx + CONFIG.fotos.length) % CONFIG.fotos.length;
    document.querySelectorAll('.slide')[atual].classList.add('ativo');
    document.querySelectorAll('.indicador')[atual].classList.add('ativo');
  }

  document.getElementById('btn-anterior').addEventListener('click', () => irPara(atual - 1));
  document.getElementById('btn-proximo').addEventListener('click',  () => irPara(atual + 1));

  // troca automática a cada 6s
  setInterval(() => irPara(atual + 1), 6000);
})();

// ── MENSAGENS (scroll reveal) ────────────────────────────────
(function criarMensagens() {
  const container = document.getElementById('mensagens-container');
  if (!CONFIG.mensagens.length) return;

  CONFIG.mensagens.forEach(msg => {
    const card = document.createElement('div');
    card.className = 'card-mensagem';
    card.innerHTML = `<h3>${msg.titulo}</h3><p>${msg.texto}</p>`;
    container.appendChild(card);
  });

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visivel'); });
  }, { threshold: 0.15 });

  document.querySelectorAll('.card-mensagem').forEach(c => obs.observe(c));
})();

// ── PLAYER DE MÚSICA ─────────────────────────────────────────
let audio        = new Audio();
let faixaAtual   = 0;
let tocando      = false;

function iniciarPlayer() {
  if (!CONFIG.musicas.length) return;
  const player = document.getElementById('player');
  player.classList.add('visivel');
  carregarFaixa(0);
}

function carregarFaixa(idx) {
  faixaAtual = idx;
  const faixa = CONFIG.musicas[faixaAtual];
  audio.src   = faixa.src;
  document.getElementById('player-titulo').textContent  = faixa.titulo;
  document.getElementById('player-artista').textContent = faixa.artista;
  document.getElementById('progress-bar').style.width   = '0%';
  document.getElementById('tempo-atual').textContent    = '0:00';
  document.getElementById('tempo-total').textContent    = '0:00';
  tocarPausar(true);
}

function tocarPausar(forcarTocar = false) {
  if (forcarTocar || !tocando) {
    audio.play().catch(() => {});
    tocando = true;
    document.getElementById('btn-play').textContent = '⏸';
    document.getElementById('icone-musica').classList.remove('pausado');
  } else {
    audio.pause();
    tocando = false;
    document.getElementById('btn-play').textContent = '▶';
    document.getElementById('icone-musica').classList.add('pausado');
  }
}

function formatarTempo(s) {
  const m = Math.floor(s / 60);
  const seg = Math.floor(s % 60).toString().padStart(2, '0');
  return `${m}:${seg}`;
}

audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  document.getElementById('progress-bar').style.width = pct + '%';
  document.getElementById('tempo-atual').textContent  = formatarTempo(audio.currentTime);
});

audio.addEventListener('loadedmetadata', () => {
  document.getElementById('tempo-total').textContent = formatarTempo(audio.duration);
});

audio.addEventListener('ended', () => {
  const proxima = (faixaAtual + 1) % CONFIG.musicas.length;
  carregarFaixa(proxima);
});

document.getElementById('btn-play').addEventListener('click',     () => tocarPausar());
document.getElementById('btn-anterior-p').addEventListener('click', () => carregarFaixa((faixaAtual - 1 + CONFIG.musicas.length) % CONFIG.musicas.length));
document.getElementById('btn-proximo-p').addEventListener('click',  () => carregarFaixa((faixaAtual + 1) % CONFIG.musicas.length));

document.getElementById('progress-bar-wrapper').addEventListener('click', e => {
  const rect = e.currentTarget.getBoundingClientRect();
  const pct  = (e.clientX - rect.left) / rect.width;
  audio.currentTime = pct * audio.duration;
});
