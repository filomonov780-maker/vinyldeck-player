let fullPlaylist = [];
let filteredPlaylist = [];
let currentTrackIndex = 0;
const audio = new Audio();
let isPlaying = false;

// Чтение ZIP и парсинг ID3 тегов
document.getElementById('zip-input').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);
    fullPlaylist = [];

    for (const [filename, zipEntry] of Object.entries(contents.files)) {
      if (!zipEntry.dir && (filename.endsWith('.mp3') || filename.endsWith('.wav'))) {
        const blob = await zipEntry.async('blob');
        const trackUrl = URL.createObjectURL(blob);
        const cleanName = filename.split('/').pop().replace(/\.(mp3|wav)$/i, '');

        // Читаем теги с помощью jsmediatags
        const tags = await getAudioTags(blob);

        fullPlaylist.push({
          title: tags.title || cleanName,
          artist: tags.artist || 'Неизвестно',
          album: tags.album || 'Без альбома',
          year: tags.year || 'Неизвестно',
          genre: tags.genre || 'Неизвестно',
          url: trackUrl
        });
      }
    }

    if (fullPlaylist.length > 0) {
      updateFilterDropdowns();
      applyFilters();
    } else {
      alert('В ZIP-архиве не найдено MP3 или WAV файлов!');
    }
  } catch (err) {
    console.error('Ошибка:', err);
    alert('Не удалось прочитать ZIP-архив');
  }
});

// Функция считывания тегов из файла
function getAudioTags(blob) {
  return new Promise((resolve) => {
    jsmediatags.read(blob, {
      onSuccess: (tag) => resolve(tag.tags),
      onError: () => resolve({})
    });
  });
}

// Заполнение выпадающих списков уникальными значениями
function updateFilterDropdowns() {
  populateSelect('filter-artist', 'artist', 'Все исполнители');
  populateSelect('filter-year', 'year', 'Все года');
  populateSelect('filter-album', 'album', 'Все альбомы');
  populateSelect('filter-genre', 'genre', 'Все жанры');
}

function populateSelect(elementId, key, defaultText) {
  const select = document.getElementById(elementId);
  const values = [...new Set(fullPlaylist.map(track => track[key]))].sort();
  select.innerHTML = `<option value="">${defaultText}</option>`;
  values.forEach(val => {
    select.innerHTML += `<option value="${val}">${val}</option>`;
  });
}

// Фильтрация плейлиста
function applyFilters() {
  const artist = document.getElementById('filter-artist').value;
  const year = document.getElementById('filter-year').value;
  const album = document.getElementById('filter-album').value;
  const genre = document.getElementById('filter-genre').value;

  filteredPlaylist = fullPlaylist.filter(track => {
    return (!artist || track.artist === artist) &&
           (!year || String(track.year) === year) &&
           (!album || track.album === album) &&
           (!genre || track.genre === genre);
  });

  currentTrackIndex = 0;
  if (filteredPlaylist.length > 0) {
    loadTrack(currentTrackIndex);
  } else {
    document.getElementById('track-title').innerText = 'Ничего не найдено';
    document.getElementById('track-artist').innerText = '-';
    document.getElementById('track-counter').innerText = 'Песня 0 из 0';
    audio.pause();
  }
}

function loadTrack(index) {
  if (!filteredPlaylist[index]) return;
  const track = filteredPlaylist[index];
  audio.src = track.url;
  
  document.getElementById('track-title').innerText = track.title;
  document.getElementById('track-artist').innerText = `${track.artist} (${track.year})`;
  document.getElementById('album-tag').innerText = `${track.album} • ${track.genre}`;
  document.getElementById('track-counter').innerText = `Песня ${index + 1} из ${filteredPlaylist.length}`;
}

function playTrack() {
  if (!audio.src) return;
  audio.play();
  isPlaying = true;
  document.getElementById('play-btn').innerText = 'PAUSE';
}

function togglePlay() {
  if (!audio.src) return;
  if (isPlaying) {
    audio.pause();
    isPlaying = false;
    document.getElementById('play-btn').innerText = 'PLAY';
  } else {
    playTrack();
  }
}

function nextTrack() {
  if (filteredPlaylist.length === 0) return;
  currentTrackIndex = (currentTrackIndex + 1) % filteredPlaylist.length;
  loadTrack(currentTrackIndex);
  playTrack();
}

function prevTrack() {
  if (filteredPlaylist.length === 0) return;
  currentTrackIndex = (currentTrackIndex - 1 + filteredPlaylist.length) % filteredPlaylist.length;
  loadTrack(currentTrackIndex);
  playTrack();
}

audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const progressPercent = (audio.currentTime / audio.duration) * 100;
  document.getElementById('progress-fill').style.width = `${progressPercent}%`;
  document.getElementById('cur-time').innerText = formatTime(audio.currentTime);
  document.getElementById('dur-time').innerText = formatTime(audio.duration);
});

audio.addEventListener('ended', nextTrack);

function formatTime(sec) {
  const m = Math.floor(sec / 60) || 0;
  const s = Math.floor(sec % 60) || 0;
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}
