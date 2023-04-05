// Get the hash of the url
const hash = window.location.hash
  .substring(1)
  .split("&")
  .reduce(function(initial, item) {
    if (item) {
      var parts = item.split("=");
      initial[parts[0]] = decodeURIComponent(parts[1]);
    }
    return initial;
  }, {});
window.location.hash = "";

// Set token
let _token = hash.access_token;

const authEndpoint = "https://accounts.spotify.com/authorize";

// Replace with your app's client ID, redirect URI and desired scopes
const clientId = "22aecdf08e6048a08c0d64f052b035c2";
const redirectUri = "http://127.0.0.1:5000/";
const scopes = [
  "streaming",
  "user-modify-playback-state",
  "user-library-modify"
];

// If there is no token, redirect to Spotify authorization
if (!_token) {
  window.location = `${authEndpoint}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
    "%20"
  )}&response_type=token`;
}

// Set up the Web Playback SDK
let deviceId;
let ids = [];

window.onSpotifyPlayerAPIReady = () => {
  const player = new Spotify.Player({
    name: "Big Spotify Button",
    getOAuthToken: cb => {
      cb(_token);
    }
  });

  // Error handling
  player.on("initialization_error", e => console.error(e));
  player.on("authentication_error", e => console.error(e));
  player.on("account_error", e => console.error(e));
  player.on("playback_error", e => console.error(e));

  // Playback status updates
  player.on("player_state_changed", state => {
    console.log(state);
  });

  // Ready
  player.on("ready", data => {
    console.log("Ready with Device ID", data.device_id);
    deviceId = data.device_id;
  });

  // Connect to the player!
  player.connect();
};

// Play a specified track on the Web Playback SDK's device ID
function play(device_id, track) {
  $.ajax({
    url: "https://api.spotify.com/v1/me/player/play?device_id=" + device_id,
    type: "PUT",
    data: `{"uris": ["${track}"]}`,
    beforeSend: function(xhr) {
      xhr.setRequestHeader("Authorization", "Bearer " + _token);
    },
    success: function(data) {
      console.log(data);
    }
  });
}

function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

let release_year = 2023;

function getASong() {
  let random_seed = makeid(2);
  let random_offset = Math.floor(Math.random() * 2000); // returns a random integer from 0 to 9
  $.ajax({
    url:
      "https://api.spotify.com/v1/search?type=track&offset=" +
      random_offset +
      "&limit=1&q=" +
      random_seed,
    type: "GET",
    beforeSend: function(xhr) {
      xhr.setRequestHeader("Authorization", "Bearer " + _token);
    },
    success: function(data) {
      console.log(data);
      let trackUri = data.tracks.items[0].uri;
      let releaseDate = data.tracks.items[0].album.release_date;

      play(deviceId, trackUri);
      $("#current-track-name-save").attr("data-song", data.tracks.items[0].uri);
      $("#current-track-name-save").attr(
        "src",
        "https://cdn.glitch.com/eed3cfeb-d097-4769-9d03-2d3a6cc7c004%2Ficons8-heart-24.png?v=1597232027543"
      );
      $("#embed-uri").attr(
        "src",
        "https://open.spotify.com/embed/track/" + data.tracks.items[0].id
      );
      $("#current-track-name-save").css("display", "block");

            // save the release date in a variable
      let release_date = new Date(releaseDate).toLocaleDateString();
      const releaseYearString = release_date.slice(-4);
      const release_year = parseInt(releaseYearString);
    }
  });
}

function saveTrack(tid) {
  var track = $("#" + tid)
    .attr("data-song")
    .split(":")
    .pop();

  $.ajax({
    url: "https://api.spotify.com/v1/me/tracks?ids=" + track,
    type: "PUT",
    beforeSend: function(xhr) {
      xhr.setRequestHeader("Authorization", "Bearer " + _token);
    },
    success: function(data) {
      console.log(data);
      $("#" + tid).attr(
        "src",
        "https://cdn.glitch.com/eed3cfeb-d097-4769-9d03-2d3a6cc7c004%2Ficons8-heart-24(1).png?v=1597232463038"
      );
    }
  });
}


// GAME LOGIC
let currentRound = 1;
const totalRounds = 5;
let totalScore = 0;
let score = 0;

if (currentRound > totalRounds) {
  currentRound = 1;
  totalScore = 0;
}

slider.noUiSlider.set(1950);
yearLabel.innerHTML = 1950;
$("#round").html("Round " + currentRound + " of " + totalRounds);
$("#points").html("");
$(".next-round").hide();

// Function to start a new round
function startRound() {
  // Update the round number display
  //document.getElementById('round').innerHTML = `Round ${round}`;

  // Generate a random song using Spotify API
  getRandomSong();
}

function submitAnswer() {
  const selectedYear = Math.round(slider.noUiSlider.get());
  const difference = Math.abs(selectedYear - release_year);
  if (difference === 0) {
    score = 1000;
  } else if (difference === 1) {
    score = 918;
  } else if (difference === 2) {
    score = 849;
  } else if (difference === 3) {
    score = 764;
  } else if (difference === 4) {
    score = 680;
  } else if (difference === 5) {
    score = 600;
  } else if (difference === 6) {
    score = 540;
  } else if (difference === 7) {
    score = 466;
  } else if (difference === 8) {
    score = 396;
  } else if (difference === 9) {
    score = 222;
  } else if (difference === 10) {
    score = 111;
  }
  totalScore += score;
  const result = `You scored ${score} points`;
  const total = `Total score: ${totalScore}`;
  const round = `Round: ${currentRound + 1} / 5`;

  // update the HTML elements
  $("#points").html(result + "<br><br>" + total);
  $("#round").html(round);

  // get slider handles
  const handles = slider.querySelectorAll('.noUi-handle');

  // set background color of slider
  const start = Math.min(selectedYear, release_year);
  const end = Math.max(selectedYear, release_year);
  const background = `linear-gradient(to right, #CCC 0%, #CCC ${start - 1900}%, #F00 ${start - 1900}%, #F00 ${end - 1900}%, #CCC ${end - 1900}%, #CCC 100%)`;
  slider.style.background = background;

  // update slider handles
  handles.forEach(handle => {
    handle.classList.add("selected");
  });

  $(".noUi-marker-large").addClass("selected");
  $(".noUi-marker-sub").addClass("selected");
  $(".submit").hide();
  $(".next-round").show();
}

// function to go to the next round
function nextRound() {
  round++; // increment the round variable
  $(".submit").show();
  $(".next-round").hide();
  $("#round").html(`Round ${round}`);
  getASong();
}
