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
const redirectUri = "http://www.chronosong.pages.dev";
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
   // console.log(state);
  });

  // Ready
  player.on("ready", data => {
  //  console.log("Ready with Device ID", data.device_id);
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

let release_year;

function restart() {
  //Reload page
    location.reload();
}

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
      release_year = parseInt(releaseYearString);
      totalYears = 2023 - release_year;

      $(".start").hide();
    },
    error : function() {
        console.log("THIS IS WHERE WE SHOULD TRY TO GET A SONG AGAIN");
    }
    });
}

// GAME LOGIC
let currentRound = 1;
const totalRounds = 5;
let totalScore = 0;
let score = 0;


//CREATE BOTH SLIDERS
const slider = document.getElementById('slider');

noUiSlider.create(slider, {
    start: 1950,
    step: 1,
    connect: 'lower',
    range: {
        'min': 1900,
        'max': 2023
    },
    pips: {
  mode: 'values',
  values: Array.from(Array(13).keys()).map(x => x * 10 + 1900),
  density: 10
}
});

// ADD LABEL FOR SELECTED YEAR
const yearLabel = document.createElement('div');
yearLabel.classList.add('year-label');
slider.parentElement.insertBefore(yearLabel, slider);

slider.noUiSlider.on('update', function (values, handle) {
    const year = Math.round(values[handle]);
    yearLabel.innerHTML = year;
});

slider.noUiSlider.set(1950);
yearLabel.innerHTML = 1950;

slider.noUiSlider.on('update', function (values, handle) {
    yearLabel.innerHTML = Math.round(values[handle]);
});


// SECOND SLIDER TO SHOW DIFFERENCE
const tooltipSlider = document.getElementById('slider2');

    noUiSlider.create(tooltipSlider, {
        start: [1950, 2023],
    tooltips: [true, true],
        step: 1,
        connect: true,
        range: {
            'min': 1900,
            'max': 2023
        },
        pips: {
            mode: 'values',
            values: Array.from(Array(13).keys()).map(x => x * 10 + 1900),
            density: 10
        }
    });

$("#round").html("Round " + currentRound + " of " + totalRounds);
$("#points").html("");
$(".next-round").hide();
$(".reload").hide();
$(".restart").hide();
 $("#slider2").hide();

let highScore = localStorage.getItem("highScore");
$("#high-score-final").html(`High Score: ${highScore}`);

getASong();

function submitAnswer() {
  const selectedYear = Math.round(slider.noUiSlider.get());

  slider2.noUiSlider.updateOptions({
  start: [selectedYear, release_year] });
  $("#slider2").show();

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
  } else {
    score = 0;
  }

  totalScore += score;
  const result = `You scored ${score} points in Round ${currentRound} `;
  const total = `Total Score: ${totalScore}`;

  // update the HTML elements
    $("#points").html(result);
    $("#total-score").html(total);
    $(".submit").hide();
    $(".next-round").show();

    // Display the release year above the Spotify web player
    $("#release-year").show();
    const releaseYearDiv = document.getElementById("release-year");
    releaseYearDiv.innerHTML = release_year;
    releaseYearDiv.style.display = "inline-block";

    if (currentRound < 5) {
        document.getElementById("next-round big-button").textContent = "Next Round";
    } else {
        document.getElementById("next-round big-button").textContent = "Results";
}
}

// function to go to the next round
function nextRound() {
   currentRound++; // increment the round variable
   if (currentRound > totalRounds) {
    showFinalScore();
     $(".next-round").hide();
     $("#release-year").hide();
    return;
    }

  const round = `Round: ${currentRound} / ${totalRounds}`;
  $("#round").html(round);
  $(".submit").show();
  $(".next-round").hide();
  $("#slider2").hide();
  $(".reload").show();
  getASong();
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
    //  console.log(data);
      $("#" + tid).attr(
        "src",
        "https://cdn.glitch.com/eed3cfeb-d097-4769-9d03-2d3a6cc7c004%2Ficons8-heart-24(1).png?v=1597232463038"
      );
    }
  });
}

function showFinalScore() {
 $("#spotify-web-player").hide();
 $(".next-round").hide();
 $("#points").hide();
 $(".reload").hide();
 $(".final-score").show();
 $(".restart").show();

// retrieve and display high score if possible
let highScore = localStorage.getItem("highScore");
if (!highScore || totalScore > highScore) {
    highScore = totalScore;
    localStorage.setItem("highScore", highScore);
}
    $("#high-score-final").html(`High Score: ${highScore}`);
}
