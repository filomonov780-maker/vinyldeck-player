let songs = [];
let curIndex = 0;
const audio = document.getElementById('audio');
const playBtn = document.getElementById('play-btn');
const mainCover = document.getElementById('main-cover');
const trackTitle = document.getElementById('track-title');
const trackArtist = document.getElementById('track-artist');
const albumTag = document.getElementById('album-tag');
const progressFill = document.getElementById('progress-fill');
const progressBar = document.getElementById('progress-bar');
const curTimeEl = document.getElementById('cur-time');
const durTimeEl = document.getElementById('dur-time');
const playlistScroll = document.getElementById('playlist-scroll');
const trackCounter = document.getElementById('track-counter');
const defaultCover = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='1'><rect width='18' height='18' x='3' y='3' rx='2'/></svg>";

const jsMediatags = window.jsmediatags;

const glow = document.createElement('div');
glow.id = 'cursor-glow';
document.body.appendChild(glow);

document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
});

let clickCount = 0;
const glassPanel = document.querySelector('.player-side');
const breakTargets = [document.querySelector('.cover-box'), document.querySelector('.track-meta')];

breakTargets.forEach(target => {
    if (target) {
        target.addEventListener('click', () => {
            clickCount++;
            if (clickCount >= 5) {
                glassPanel.classList.add('broken');
            }
        });
    }
});

function renderPlaylist() {
    playlistScroll.innerHTML = '';
    songs.forEach((song, i) => {
        let row = document.createElement('div');
        row.className = `track-row ${i === curIndex ? 'active' : ''}`;
        let img = song.cover ? song.cover : defaultCover;
        row.innerHTML = `
            <div class="row-left">
                <img class="row-thumb" id="thumb-${i}" src="${img}" alt="">
                <div>
                    <div class="row-title">${song.title}</div>
                    <div class="row-artist">${song.artist}</div>
                </div>
            </div>
            <span class="row-dur" id="dur-${i}">--:--</span>
        `;
        row.onclick = () => { loadTrack(i); playTrack(); };
        playlistScroll.appendChild(row);

        if(!song.src.startsWith('blob:')) {
            let a = new Audio(song.src);
            a.onloadedmetadata = () => {
                let el = document.getElementById(`dur-${i}`);
                if(el) el.textContent = formatTime(a.duration);
            };
        }
    });
}

function formatTime(sec) {
    if (isNaN(sec)) return "00:00";
    let m = Math.floor(sec / 60);
    let s = Math.floor(sec % 60);
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
}

function loadTrack(i) {
    if(songs.length === 0) { trackCounter.textContent = "Песня 0 из 0"; return; }
    curIndex = i;
    let s = songs[curIndex];
    audio.src = s.src;
    trackTitle.textContent = s.title;
    trackArtist.textContent = s.artist;
    albumTag.textContent = s.artist;
    mainCover.src = s.cover ? s.cover : defaultCover;
    trackCounter.textContent = `Песня ${curIndex + 1} из ${songs.length}`;
    renderPlaylist();
}

function togglePlay() {
    if (audio.paused) {
        if(!audio.src && songs.length > 0) loadTrack(0);
        playTrack();
    } else { pauseTrack(); }
}

function playTrack() {
    if(!audio.src) return;
    let promise = audio.play();
    if (promise !== undefined) {
        promise.then(() => {
            playBtn.textContent = '⏸';
        }).catch(err => console.error("Ошибка автовоспроизведения:", err));
    }
}

function pauseTrack() {
    audio.pause();
    playBtn.textContent = '▶';
}

function nextTrack() {
    if(songs.length === 0) return;
    curIndex = (curIndex + 1) % songs.length;
    loadTrack(curIndex);
    playTrack();
}

function prevTrack() {
    if(songs.length === 0) return;
    curIndex = (curIndex - 1 + songs.length) % songs.length;
    loadTrack(curIndex);
    playTrack();
}

audio.ontimeupdate = () => {
    if(audio.duration) {
        progressFill.style.width = (audio.currentTime / audio.duration * 100) + '%';
        curTimeEl.textContent = formatTime(audio.currentTime);
        durTimeEl.textContent = formatTime(audio.duration);
    }
};

progressBar.onclick = (e) => {
    if(audio.duration) audio.currentTime = (e.offsetX / progressBar.clientWidth) * audio.duration;
};

audio.onended = nextTrack;

document.getElementById('file-input').onchange = (e) => {
    let files = Array.from(e.target.files);
    let startIndex = songs.length;

    files.forEach((file, index) => {
        let songIndex = startIndex + index;
        let songObj = {
            title: file.name.replace(/\.[^/.]+$/, ""),
            artist: "Локальный файл",
            src: URL.createObjectURL(file),
            cover: ""
        };
        songs.push(songObj);

        if (jsMediatags) {
            jsMediatags.read(file, {
                onSuccess: function(tag) {
                    let tags = tag.tags;
                    if(tags.artist) songObj.artist = tags.artist;
                    if(tags.title) songObj.title = tags.title;

                    let picture = tags.picture;
                    if (picture) {
                        let base64String = "";
                        for (let i = 0; i < picture.data.length; i++) {
                            base64String += String.fromCharCode(picture.data[i]);
                        }
                        let base64 = "data:" + picture.format + ";base64," + window.btoa(base64String);
                        songObj.cover = base64;

                        let imgEl = document.getElementById(`thumb-${songIndex}`);
                        if(imgEl) imgEl.src = base64;
                        if(curIndex === songIndex) mainCover.src = base64;
                    }
                    renderPlaylist();
                },
                onError: function() {
                    renderPlaylist();
                }
            });
        }
    });

    renderPlaylist();
    if(songs.length > 0 && audio.paused) loadTrack(startIndex);
};
