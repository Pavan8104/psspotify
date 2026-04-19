console.log("PSSpotify Pro");

const songs = [
  {songName: "Warriyo - Mortals [NCS Release]", filePath: "/1.mp3", coverPath: "/1.jpg"},
  {songName: "Cielo - Huma-Huma", filePath: "/2.mp3", coverPath: "/2.jpg"},
  {songName: "DEAF KEV - Invincible [NCS Release]-320k", filePath: "/3.mp3", coverPath: "/3.jpg"},
  {songName: "Different Heaven & EH!DE - My Heart [NCS Release]", filePath: "/4.mp3", coverPath: "/4.jpg"},
  {songName: "Janji-Heroes-Tonight-feat-Johnning-NCS-Release", filePath: "/5.mp3", coverPath: "/5.jpg"},
  {songName: "Rabba - Salam-e-Ishq", filePath: "/6.mp3", coverPath: "/6.jpg"},
  {songName: "Sakhiyaan - Salam-e-Ishq", filePath: "/7.mp3", coverPath: "/7.jpg"},
  {songName: "Bhula Dena - Salam-e-Ishq", filePath: "/8.mp3", coverPath: "/8.jpg"},
  {songName: "Tumhari Kasam - Salam-e-Ishq", filePath: "/9.mp3", coverPath: "/9.jpg"},
  {songName: "Na Jaana - Salam-e-Ishq", filePath: "/10.mp3", coverPath: "/10.jpg"},
];

import './style.css';

const app = document.getElementById('app');

// Add search
const searchHTML = `
  <div style="padding: 10px; background: rgba(0,0,0,0.5);">
    <input type="text" id="songSearch" placeholder="Search songs..." style="width: 300px; padding: 8px; border-radius: 20px; border: none;">
  </div>
`;

app.innerHTML = searchHTML + `
  <nav>
    <ul>
      <li class="brand"><img src="/logo.png" alt="PSSpotify"> PSSpotify</li>
      <li>Home</li>
      <li>About</li>
    </ul>
  </nav>
  <div class="container">
    <div class="songList">
      <h1>Best of NCS</h1>
      <div class="songItemContainer" id="songItemContainer">
      </div>
    </div>
    <div class="songBanner"></div>
  </div>
  <div class="bottom">
    <div style="display: flex; width: 80vw; justify-content: space-between; align-items: center;">
      <span id="currentTime">0:00</span>
      <input type="range" id="myProgressBar" min="0" value="0" max="100" style="flex:1; margin: 0 10px;">
      <span id="totalTime">0:00</span>
    </div>
    <div class="icons">
      <i class="fas fa-volume-mute fa-2x" id="volumeIcon"></i>
      <input type="range" id="volumeSlider" min="0" max="100" value="50" style="width: 100px;">
      <i class="fas fa-3x fa-step-backward" id="previous"></i>
      <i class="far fa-3x fa-play-circle" id="masterPlay"></i>
      <i class="fas fa-3x fa-step-forward" id="next"></i> 
    </div>
    <div class="songInfo">
      <img src="/playing.gif" width="42px" alt="" id="gif"> 
      <span id="masterSongName">Select a song</span>
    </div>
  </div>
`;

const songItemContainer = document.getElementById('songItemContainer');
const songSearch = document.getElementById('songSearch');
let songIndex = 0;
let audioElement = new Audio();
let masterPlay = document.getElementById('masterPlay');
let myProgressBar = document.getElementById('myProgressBar');
let gif = document.getElementById('gif');
let masterSongName = document.getElementById('masterSongName');
let volumeSlider = document.getElementById('volumeSlider');
let currentTimeEl = document.getElementById('currentTime');
let totalTimeEl = document.getElementById('totalTime');
let volumeIcon = document.getElementById('volumeIcon');

// Build song list
function renderSongs(filter = '') {
  songItemContainer.innerHTML = '';
  songs.filter(song => song.songName.toLowerCase().includes(filter.toLowerCase())).forEach((song, i) => {
    const songItem = document.createElement('div');
    songItem.className = 'songItem';
    songItem.innerHTML = `
      <img src="${song.coverPath}" alt="${song.songName}">
      <span class="songName">${song.songName}</span>
      <span class="songlistplay">
        <span class="timestamp">05:34 
          <i id="${i}" class="far songItemPlay fa-play-circle"></i>
        </span>
      </span>
    `;
    songItemContainer.appendChild(songItem);
  });
  attachSongListeners();
}

// Initial render
renderSongs();

// Search
songSearch.addEventListener('input', (e) => renderSongs(e.target.value));

// localStorage
function loadRecent() {
  const recent = JSON.parse(localStorage.getItem('recentSongs') || '[]');
  if (recent.length) {
    songIndex = recent[recent.length - 1];
    updateUI();
  }
}

function saveRecent(index) {
  let recent = JSON.parse(localStorage.getItem('recentSongs') || '[]');
  const indexStr = recent.indexOf(index);
  if (indexStr > -1) recent.splice(indexStr, 1);
  recent.push(index);
  if (recent.length > 10) recent.shift();
  localStorage.setItem('recentSongs', JSON.stringify(recent));
}

// Update UI for current song
function updateUI() {
  masterSongName.textContent = songs[songIndex].songName;
  audioElement.src = songs[songIndex].filePath;
}

// Play/Pause
masterPlay.addEventListener('click', () => {
  if (audioElement.paused) {
    audioElement.play();
    masterPlay.classList.replace('fa-play-circle', 'fa-pause-circle');
    gif.style.opacity = 1;
  } else {
    audioElement.pause();
    masterPlay.classList.replace('fa-pause-circle', 'fa-play-circle');
    gif.style.opacity = 0;
  }
});

// Volume
volumeSlider.addEventListener('input', (e) => {
  audioElement.volume = e.target.value / 100;
  volumeIcon.className = audioElement.volume === 0 ? 'fas fa-volume-mute fa-2x' : 'fas fa-volume-up fa-2x';
});
volumeIcon.addEventListener('click', () => {
  if (audioElement.volume > 0) {
    volumeSlider.value = 0;
    audioElement.volume = 0;
    volumeIcon.className = 'fas fa-volume-mute fa-2x';
  } else {
    volumeSlider.value = 50;
    audioElement.volume = 0.5;
    volumeIcon.className = 'fas fa-volume-up fa-2x';
  }
});

// Time update
audioElement.addEventListener('loadedmetadata', () => {
  totalTimeEl.textContent = formatTime(audioElement.duration);
});
audioElement.addEventListener('timeupdate', () => {
  if (audioElement.duration) {
    const progress = (audioElement.currentTime / audioElement.duration) * 100;
    myProgressBar.value = progress;
    currentTimeEl.textContent = formatTime(audioElement.currentTime);
  }
});

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

myProgressBar.addEventListener('input', (e) => {
  audioElement.currentTime = (e.target.value / 100) * audioElement.duration;
});

function makeAllPlays() {
  document.querySelectorAll('.songItemPlay').forEach(el => {
    el.classList.remove('fa-pause-circle');
    el.classList.add('fa-play-circle');
  });
}

function attachSongListeners() {
  document.querySelectorAll('.songItemPlay').forEach((el, i) => {
    el.addEventListener('click', (e) => {
      makeAllPlays();
      e.target.classList.replace('fa-play-circle', 'fa-pause-circle');
      songIndex = i;
      saveRecent(i);
      updateUI();
      audioElement.currentTime = 0;
      audioElement.play();
      masterPlay.classList.replace('fa-play-circle', 'fa-pause-circle');
      gif.style.opacity = 1;
    });
  });
}

document.getElementById('next').addEventListener('click', () => {
  songIndex = (songIndex + 1) % songs.length;
  makeAllPlays();
  document.querySelector(`#songItemContainer [id="${songIndex}"]`)?.classList.replace('fa-play-circle', 'fa-pause-circle');
  saveRecent(songIndex);
  updateUI();
  audioElement.play();
  masterPlay.classList.replace('fa-play-circle', 'fa-pause-circle');
  gif.style.opacity = 1;
});

document.getElementById('previous').addEventListener('click', () => {
  songIndex = (songIndex - 1 + songs.length) % songs.length;
  makeAllPlays();
  document.querySelector(`#songItemContainer [id="${songIndex}"]`)?.classList.replace('fa-play-circle', 'fa-pause-circle');
  saveRecent(songIndex);
  updateUI();
  audioElement.play();
  masterPlay.classList.replace('fa-play-circle', 'fa-pause-circle');
  gif.style.opacity = 1;
});

loadRecent();

