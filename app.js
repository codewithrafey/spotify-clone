let nextBtn = document.getElementById("next");
let prevBtn = document.getElementById("previous");
let play = document.getElementById("play");
let data;
let currentIndex = 0;

function formatTime(seconds) {
    if(isNaN(seconds) || seconds < 0){
        return "0:00"
    }
    let minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);
    secs = secs < 10 ? "0" + secs : secs;
    return `${minutes}:${secs}`;
}

async function loadAudios() {
    let res = await fetch("songs.json");
    data = await res.json();
    console.log(data);

    renderSongs(data.audios); // Initial render of all songs
}

function renderSongs(songs) {
    let audioList = document.getElementById("audioList");
    let cardContainer = document.querySelector(".cardContainer");

    // Clear existing content
    audioList.innerHTML = "";
    cardContainer.innerHTML = "";

    if (songs.length > 0) {
        let firstSong = songs[0];
        document.querySelector(".songinfo").innerHTML = firstSong.title;
        document.querySelector(".songtime").innerHTML = "0:00 / 0:00";
        currentAudio.src = firstSong.file;

        play.src = "./img/play-circle-stroke-standard.svg";
    }

    songs.forEach((audio, index) => {
        let li = document.createElement("li");
        li.innerHTML = `${index + 1}. ${audio.title} 
                        <button class="albumbtn" onclick="playAudio('${audio.title}', '${audio.file}')">
                            <i class="bi bi-play-fill"></i>
                        </button>`;
        audioList.appendChild(li);

        cardContainer.innerHTML += `
            <div class="card">
                <button class="play" onclick="playAudio('${audio.title}', '${audio.file}')">
                    <i class="bi bi-play-fill"></i>
                </button>
                <img src="${audio.img}" alt="">
                <h3>${audio.title}</h3>
                <p>${audio.des}</p>
            </div>
        `;
    });
}

let currentAudio = new Audio();
let isPlaying = false;

function playAudio(title, file) {
    if (currentAudio.src !== file) {
        currentAudio.src = file;
        currentAudio.play();
        isPlaying = true;
        document.querySelector(".songinfo").innerHTML = title;
        play.src = "https://cdn.hugeicons.com/icons/pause-circle-stroke-rounded.svg";

        // Update the currentIndex to the index of the currently playing song
        currentIndex = data.audios.findIndex(audio => audio.file === file);
        console.log(currentIndex);
    }
}

// Auto next song on finish
currentAudio.addEventListener("ended", () => {
    nextBtn.click(); // Play next song automatically
});

play.addEventListener("click", () => {
    if (currentAudio.paused) {
        currentAudio.play();
        isPlaying = true;
        play.src = "https://cdn.hugeicons.com/icons/pause-circle-stroke-rounded.svg";
    } else {
        currentAudio.pause();
        isPlaying = false;
        play.src = "./img/play-circle-stroke-standard.svg";
    }
});

currentAudio.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `
        ${formatTime(currentAudio.currentTime)} / ${formatTime(currentAudio.duration)}
    `;
    document.querySelector(".circle").style.left = (currentAudio.currentTime / currentAudio.duration) * 100 + "%"
});

document.querySelector(".seekbar").addEventListener("click", e => {
    let perc = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = perc + "%";
    currentAudio.currentTime = (currentAudio.duration * perc) / 100;
});

nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % data.audios.length; 
    let nextSong = data.audios[currentIndex];
    playAudio(nextSong.title, nextSong.file);
});

prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + data.audios.length) % data.audios.length; 
    let prevSong = data.audios[currentIndex];
    playAudio(prevSong.title, prevSong.file);
});

document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
});

document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-1000px";
});

const volumeControl = document.getElementById("range");
const volumeIcon = document.getElementById("volumeIcon");

volumeControl.addEventListener("input", e => {
    let volume = e.target.value;
    currentAudio.volume = volume; 
    
    if (volume == 0) {
        volumeIcon.src = "https://cdn.hugeicons.com/icons/volume-off-stroke-rounded.svg";
    } else if (volume < 0.5) {
        volumeIcon.src = "https://cdn.hugeicons.com/icons/volume-low-stroke-rounded.svg";
    } else {
        volumeIcon.src = "https://cdn.hugeicons.com/icons/volume-high-stroke-rounded.svg";
    }
});

volumeIcon.addEventListener("click", () => {
    if (currentAudio.volume > 0) {
        currentAudio.volume = 0;
        volumeControl.value = 0;
        volumeIcon.src = "https://cdn.hugeicons.com/icons/volume-off-stroke-rounded.svg";
    } else {
        currentAudio.volume = 1;
        volumeControl.value = 1;
        volumeIcon.src = "https://cdn.hugeicons.com/icons/volume-high-stroke-rounded.svg";
    }
});

document.getElementById("searchButton").addEventListener("click", function(event) {
    event.preventDefault();
    document.getElementById("searchBar").classList.add("active");
});

document.getElementById("closeSearch").addEventListener("click", function() {
    document.getElementById("searchBar").classList.remove("active");
    document.getElementById("searchInput").value = ""; 
    renderSongs(data.audios); // Reset to show all songs
});

document.getElementById("searchInput").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        let searchText = this.value.toLowerCase();
        let filteredSongs = data.audios.filter(song => 
            song.title.toLowerCase().includes(searchText)
        );
        renderSongs(filteredSongs); // Render filtered songs
    }
});
document.querySelector(".searchButton").addEventListener("click", function() {
    let searchText = document.getElementById("searchInput").value.toLowerCase();
    let filteredSongs = data.audios.filter(song => 
        song.title.toLowerCase().includes(searchText)
    );
    renderSongs(filteredSongs); // Filtered songs render karo
});

loadAudios();