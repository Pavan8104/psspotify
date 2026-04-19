console.log("PSSpotify Pro - Fixed Playback");

const songs = [
  {id: 0, songName: "Warriyo - Mortals [NCS Release]", filePath: "/1.mp3", coverPath: "/1.jpg"},
  {id: 1, songName: "Cielo - Huma-Huma", filePath: "/2.mp3", coverPath: "/2.jpg"},
  {id: 2, songName: "DEAF KEV - Invincible [NCS Release]-320k", filePath: "/3.mp3", coverPath: "/3.jpg"},
  {id: 3, songName: "Different Heaven & EH!DE - My Heart [NCS Release]", filePath: "/4.mp3", coverPath: "/4.jpg"},
  {id: 4, songName: "Janji-Heroes-Tonight-feat-Johnning-NCS-Release", filePath: "/5.mp3", coverPath: "/5.jpg"},
  {id: 5, songName: "Rabba - Salam-e-Ishq", filePath: "/6.mp3", coverPath: "/6.jpg"},
  {id: 6, songName: "Sakhiyaan - Salam-e-Ishq", filePath: "/7.mp3", coverPath: "/7.jpg"},
  {id: 7, songName: "Bhula Dena - Salam-e-Ishq", filePath: "/8.mp3", coverPath: "/8.jpg"},
  {id: 8, songName: "Tumhari Kasam - Salam-e-Ishq", filePath: "/9.mp3", coverPath: "/9.jpg"},
  {id: 9, songName: "Na Jaana - Salam-e-Ishq", filePath: "/10.mp3", coverPath: "/10.jpg"},
];

import './style.css';

const app = document.getElementById('app');

// Search bar
app.innerHTML = `
  <div class="search-container">
    <input type="text" id="songSearch" placeholder="🔍 Search songs...">
  </div>
  <nav>
    <ul>
      <li class="brand">
        <img src="/logo.png" alt="PSSpotify">
        PSSpotify
      </li>
      <li>Home</li>
      <li>About</li>
    </ul>
  </nav>
  <div class="container">
    <div class="songList">
      <h1>Best of NCS</h1>
      <div class="songItemContainer" id="songItemContainer"></div>
    </div>
    <div class="songBanner"></div>
  </div>
  <div class="bottom">
    <div class="timeControls">
      <span id="currentTime">0:00</span>
      <input type="range" id="myProgressBar" min="0" value="0" max="100">
      <span id="totalTime">0:00</span>
    </div>
    <div class="icons">
      <div class="volumeControls">
        <i class="fas fa-volume-up fa-2x" id="volumeIcon"></i>
        <input type="range" id="volumeSlider" min="0" max="100" value="50">
      </div>
      <i class="fas fa-3x fa-step-backward" id="previous"></i>
      <i class="far fa-3x fa-play-circle" id="masterPlay"></i>
      <i class="fas fa-3x fa-step-forward" id="next"></i>
    </div>
    <div class="songInfo">
      <img src="/playing.gif" id="gif" width="42">
      <span id="masterSongName">Select a song to play</span>
    </div>
  </div>
`;

// Elements
const songItemContainer = document.getElementById('songItemContainer');
const songSearch = document.getElementById('songSearch');
const masterPlay = document.getElementById('masterPlay');
const myProgressBar = document.getElementById('myProgressBar');
const gif = document.getElementById('gif');
const masterSongName = document.getElementById('masterSongName');
const volumeSlider = document.getElementById('volumeSlider');
const volumeIcon = document.getElementById('volumeIcon');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');
const previousBtn = document.getElementById('previous');
const nextBtn = document.getElementById('next');

// Audio setup
const audioElement = new Audio();
audioElement.preload = 'metadata';

let songIndex = 0;
let isPlaying = false;

// LocalStorage
const RECENT_KEY = 'psspotify_recent';
function getRecent() {
  return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
}

function saveRecent(index) {
  let recent = getRecent();
  recent = recent.filter(id => id !== index);
  recent.unshift(index); // Add to front
  if (recent.length > 10) recent.pop();
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  songIndex = index;
  loadSong(index);
  playSong();
}

// Render songs
function renderSongs(searchTerm = '') {
  const filteredSongs = songs.filter(song => 
    song.songName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  songItemContainer.innerHTML = filteredSongs.map((song, filteredIndex) => `
    <div class="songItem" data-song-id="${song.id}">
      <img src="${song.coverPath}" alt="${song.songName}" loading="lazy">
      <span class="songName">${song.songName}</span>
      <span class="songlistplay">
        <span class="timestamp">${formatTime(300)} 
          <i class="far songItemPlay fa-play-circle" data-song-id="${song.id}"></i>
        </span>
      </span>
    </div>
  `).join('');
  
  // Attach listeners to new elements
  document.querySelectorAll('.songItemPlay').forEach(icon => {
    icon.addEventListener('click', (e) => {
      const songId = parseInt(e.target.dataset.songId);
      makeAllPlays();
      e.target.classList.replace('fa-play-circle', 'fa-pause-circle');
      saveRecent(songId);
    });
  });
  
  document.querySelectorAll('.songItem').forEach(item => {
    item.addEventListener('click', (e) => {
      if (!e.target.closest('.songItemPlay')) {
        const songId = parseInt(item.dataset.songId);
        makeAllPlays();
        item.querySelector('.songItemPlay').classList.replace('fa-play-circle', 'fa-pause-circle');
        saveRecent(songId);
      }
    });
  });
}

// Load song
function loadSong(index) {
  if (index < 0 || index >= songs.length) return;
  
  songIndex = index;
  const song = songs[index];
  masterSongName.textContent = song.songName;
  audioElement.src = song.filePath;
  updateActiveSong();
}

// Play current
function playSong() {
  audioElement.play().then(() => {
    isPlaying = true;
    masterPlay.classList.replace('fa-play-circle', 'fa-pause-circle');
    gif.style.opacity = 1;
  }).catch(e => console.error('Play failed:', e));
}

// Pause
function pauseSong() {
  audioElement.pause();
  isPlaying = false;
  masterPlay.classList.replace('fa-pause-circle', 'fa-play-circle');
  gif.style.opacity = 0;
}

// Update active song highlight
function updateActiveSong() {
  document.querySelectorAll('.songItem').forEach(item => {
    item.classList.remove('active');
  });
  const activeItem = document.querySelector(`[data-song-id="${songIndex}"]`);
  if (activeItem) activeItem.classList.add('active');
}

// Make all play icons inactive
function makeAllPlays() {
  document.querySelectorAll('.songItemPlay').forEach(el => {
    el.classList.add('fa-play-circle');
    el.classList.remove('fa-pause-circle');
  });
}

// Time format
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

// Master play/pause
masterPlay.addEventListener('click', () => {
  if (isPlaying) {
    pauseSong();
  } else {
    playSong();
  }
});

// Progress bar
audioElement.addEventListener('loadedmetadata', () => {
  totalTimeEl.textContent = formatTime(audioElement.duration || 0);
});

audioElement.addEventListener('timeupdate', () => {
  if (audioElement.duration) {
    const progress = (audioElement.currentTime / audioElement.duration) * 100;
    myProgressBar.value = progress;
    currentTimeEl.textContent = formatTime(audioElement.currentTime);
  }
});

myProgressBar.addEventListener('input', (e) => {
  if (audioElement.duration) {
    audioElement.currentTime = (parseFloat(e.target.value) / 100) * audioElement.duration;
  }
});

// Volume
volumeSlider.addEventListener('input', (e) => {
  audioElement.volume = parseInt(e.target.value) / 100;
  localStorage.setItem('volume', audioElement.volume);
  updateVolumeIcon();
});

function updateVolumeIcon() {
  if (audioElement.volume === 0) {
    volumeIcon.className = 'fas fa-volume-mute fa-2x';
  } else if (audioElement.volume < 0.5) {
    volumeIcon.className = 'fas fa-volume-down fa-2x';
  } else {
    volumeIcon.className = 'fas fa-volume-up fa-2x';
  }
}

volumeIcon.addEventListener('click', () => {
  if (audioElement.volume > 0) {
    volumeSlider.value = 0;
    audioElement.volume = 0;
  } else {
    const savedVol = localStorage.getItem('volume') || '50';
    volumeSlider.value = savedVol;
    audioElement.volume = parseInt(savedVol) / 100;
  }
  updateVolumeIcon();
});

// Next/Previous
nextBtn.addEventListener('click', () => {
  const nextIndex = (songIndex + 1) % songs.length;
  saveRecent(nextIndex);
});

previousBtn.addEventListener('click', () => {
  const prevIndex = (songIndex - 1 + songs.length) % songs.length;
  saveRecent(prevIndex);
});

// Search
songSearch.addEventListener('input', (e) => {
  renderSongs(e.target.value);
});

// Init
const savedVol = localStorage.getItem('volume') || '50';
volumeSlider.value = savedVol;
audioElement.volume = parseInt(savedVol) / 100;
updateVolumeIcon();

const recent = getRecent();
if (recent.length) {
  loadSong(recent[0]);
} else {
  loadSong(0);
}

renderSongs();

