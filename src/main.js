console.log("PSSpotify - Modern Frontend Player");

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

// DOM Elements
const app = document.getElementById('app');
const songListContainer = document.createElement('div');
songListContainer.className = 'songListContainer';

// Build UI structure
app.innerHTML = `
  <nav>
    <ul>
      <li class="brand"><img src="/logo.png" alt="PSSpotify"> PSSpotify</li>
      <li>Home</li>
      <li>About</li>
    </ul>
  </nav>
  <div class="container">
    <div class="songList">
      <h1>Best of NCS - No Copyright Sounds</h1>
      <div class="songItemContainer" id="songItemContainer">
        <!-- Dynamic songs here -->
      </div>
    </div>
    <div class="songBanner"></div>
  </div>
  <div class="bottom">
    <input type="range" name="range" id="myProgressBar" min="0" value="0" max="100">
    <div class="icons">
      <i class="fas fa-3x fa-step-backward" id="previous"></i>
      <i class="far fa-3x fa-play-circle" id="masterPlay"></i>
      <i class="fas fa-3x fa-step-forward" id="next"></i> 
    </div>
    <div class="songInfo">
      <img src="/playing.gif" width="42px" alt="" id="gif"> 
      <span id="masterSongName">Warriyo - Mortals [NCS Release]</span>
    </div>
  </div>
`;

// Dynamic song list
const songItemContainer = document.getElementById('songItemContainer');
songs.forEach((song, i) => {
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

// Audio & Controls
let songIndex = 0;
let audioElement = new Audio(songs[0].filePath);
let masterPlay = document.getElementById('masterPlay');
let myProgressBar = document.getElementById('myProgressBar');
let gif = document.getElementById('gif');
let masterSongName = document.getElementById('masterSongName');

// LocalStorage for recent plays
function loadRecent() {
  const recent = localStorage.getItem('recentSongs');
  if (recent) {
    const parsed = JSON.parse(recent);
    songIndex = parsed[parsed.length - 1] || 0;
    audioElement.src = songs[songIndex].filePath;
    masterSongName.textContent = songs[songIndex].songName;
  }
}

function saveRecent(index) {
  let recent = JSON.parse(localStorage.getItem('recentSongs') || '[]');
  recent.push(index);
  if (recent.length > 10) recent.shift(); // Keep last 10
  localStorage.setItem('recentSongs', JSON.stringify(recent));
  songIndex = index;
}

// Init
loadRecent();

// Play/Pause
masterPlay.addEventListener('click', () => {
  if (audioElement.paused || audioElement.currentTime <= 0) {
    audioElement.play();
    masterPlay.classList.remove('fa-play-circle');
    masterPlay.classList.add('fa-pause-circle');
    gif.style.opacity = 1;
  } else {
    audioElement.pause();
    masterPlay.classList.remove('fa-pause-circle');
    masterPlay.classList.add('fa-play-circle');
    gif.style.opacity = 0;
  }
});

// Progress
audioElement.addEventListener('timeupdate', () => {
  if (audioElement.duration) {
    const progress = parseInt((audioElement.currentTime / audioElement.duration) * 100);
    myProgressBar.value = progress;
  }
});

myProgressBar.addEventListener('change', () => {
  audioElement.currentTime = myProgressBar.value * audioElement.duration / 100;
});

const makeAllPlays = () => {
  document.querySelectorAll('.songItemPlay').forEach(el => {
    el.classList.remove('fa-pause-circle');
    el.classList.add('fa-play-circle');
  });
};

document.querySelectorAll('.songItemPlay').forEach((el, i) => {
  el.addEventListener('click', (e) => {
    makeAllPlays();
    const target = e.target;
    target.classList.remove('fa-play-circle');
    target.classList.add('fa-pause-circle');
    songIndex = i;
    audioElement.src = songs[i].filePath;
    masterSongName.textContent = songs[i].songName;
    audioElement.currentTime = 0;
    audioElement.play();
    gif.style.opacity = 1;
    masterPlay.classList.remove('fa-play-circle');
    masterPlay.classList.add('fa-pause-circle');
    saveRecent(i);
  });
});

document.getElementById('next').addEventListener('click', () => {
  songIndex = (songIndex + 1) % songs.length;
  audioElement.src = songs[songIndex].filePath;
  masterSongName.textContent = songs[songIndex].songName;
  audioElement.currentTime = 0;
  audioElement.play();
  masterPlay.classList.remove('fa-play-circle');
  masterPlay.classList.add('fa-pause-circle');
  makeAllPlays();
  document.querySelector(`[id="${songIndex}"]`).classList.remove('fa-play-circle');
  document.querySelector(`[id="${songIndex}"]`).classList.add('fa-pause-circle');
  saveRecent(songIndex);
});

document.getElementById('previous').addEventListener('click', () => {
  songIndex = (songIndex - 1 + songs.length) % songs.length;
  audioElement.src = songs[songIndex].filePath;
  masterSongName.textContent = songs[songIndex].songName;
  audioElement.currentTime = 0;
  audioElement.play();
  masterPlay.classList.remove('fa-play-circle');
  masterPlay.classList.add('fa-pause-circle');
  makeAllPlays();
  document.querySelector(`[id="${songIndex}"]`).classList.remove('fa-play-circle');
  document.querySelector(`[id="${songIndex}"]`).classList.add('fa-pause-circle');
  saveRecent(songIndex);
});

