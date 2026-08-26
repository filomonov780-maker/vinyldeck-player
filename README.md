<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VinylDeck Player</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jsmediatags/3.9.5/jsmediatags.min.js"></script>
</head>
<body>
    <div class="window-frame">
        <div class="player-side" id="player-side">
            <div class="top-info">
                <div class="now">NOW PLAYING</div>
                <div class="album" id="album-tag">Аудиоколлекция</div>
            </div>

            <div class="cover-box">
                <img id="main-cover" class="main-cover" src="" alt="">
            </div>

            <div class="track-meta">
                <div class="track-title" id="track-title">Выберите трек</div>
                <div class="track-artist" id="track-artist">Исполнитель</div>
            </div>

            <div class="progress-wrap">
                <div class="progress-bar" id="progress-bar">
                    <div class="progress-fill" id="progress-fill"></div>
                </div>
                <div class="time-labels">
                    <span id="cur-time">00:00</span>
                    <span id="dur-time">00:00</span>
                </div>
            </div>

            <div class="controls">
                <button class="ctrl-btn" onclick="prevTrack()">PREV</button>
                <button class="ctrl-btn play-btn" id="play-btn" onclick="togglePlay()">PLAY</button>
                <button class="ctrl-btn" onclick="nextTrack()">NEXT</button>
            </div>

            <div class="track-counter" id="track-counter">Песня 0 из 0</div>

            <div class="bottom-switch">
                <button class="switch-btn active">Плеер</button>
            </div>
        </div>

        <div class="playlist-side">
            <div class="window-header">
                <span class="header-title">VinylDeck</span>
            </div>
            <div class="top-bar-btns">
                <button class="btn-action" onclick="document.getElementById('file-input').click()">Открыть песни</button>
                <input type="file" id="file-input" multiple accept="audio/*" style="display:none">
            </div>
            <div class="playlist-scroll" id="playlist-scroll"></div>
        </div>
    </div>
    <audio id="audio"></audio>
    <script src="script.js"></script>
</body>
</html>
