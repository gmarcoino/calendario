// LISTA CANZONI — modificabile in qualsiasi momento fino al giorno stesso.
// youtubeId: le 11 lettere dopo "v=" nel link YouTube
//   es. https://www.youtube.com/watch?v=dQw4w9WgXcQ  ->  "dQw4w9WgXcQ"
// Lasciato vuoto ("") la casella apre la ricerca YouTube per titolo.
(function (root) {
  var SONGS = [
    { title: "It's Beginning to Look a Lot Like Christmas", artist: "Michael Bublé", youtubeId: "0bhsXykXxfg" },
    { title: "A Natale puoi", artist: "Alicia", youtubeId: "SaVCQVpC-FI" },
    { title: "In der Weihnachtsbäckerei", artist: "Rolf Zuckowski", youtubeId: "IFZqDcFU4Ow" },
    { title: "Let It Snow! Let It Snow! Let It Snow!", artist: "Dean Martin", youtubeId: "Rnil5LyK_B0" },
    { title: "Bianco Natale", artist: "Irene Grandi", youtubeId: "QLq5ZFevKfw" },
    { title: "Leise rieselt der Schnee", artist: "Helene Fischer", youtubeId: "1NdN1kgiLx8" },
    { title: "Jingle Bell Rock", artist: "Bobby Helms", youtubeId: "ZnDmmiiFSUU" },
    { title: "Natale", artist: "Francesco De Gregori", youtubeId: "OqwcV82VqUY" },
    { title: "Kling, Glöckchen, klingelingeling", artist: "Helene Fischer", youtubeId: "Ebxa7oYNud0" },
    { title: "Rockin' Around the Christmas Tree", artist: "Brenda Lee", youtubeId: "TFsZy9t-qDc" },
    { title: "Caro Gesù Bambino", artist: "Andrea Bocelli", youtubeId: "SNpHeu7VJIo" },
    { title: "O Tannenbaum", artist: "Sing mit mir – Kinderlieder", youtubeId: "27JleM39TPY" },
    { title: "Last Christmas", artist: "Wham!", youtubeId: "E8gmARGvPlI" },
    { title: "Quanno nascette Ninno", artist: "Piccolo Coro dell'Antoniano", youtubeId: "VqnFV-LjY7o" },
    { title: "Alle Jahre wieder", artist: "Rolf Zuckowski", youtubeId: "gA9KhcE_yj4" },
    { title: "Driving Home for Christmas", artist: "Chris Rea", youtubeId: "uSjq7x67kzM" },
    { title: "Astro del ciel", artist: "Il Volo", youtubeId: "dhnpibIT6ac" },
    { title: "Süßer die Glocken nie klingen", artist: "Peter Alexander", youtubeId: "zekCHGhLWgE" },
    { title: "White Christmas", artist: "Bing Crosby", youtubeId: "v5ryZdpEHqM" },
    { title: "Adeste Fideles", artist: "Luciano Pavarotti", youtubeId: "cgrv2pDDXV8" },
    { title: "O du fröhliche", artist: "Wiener Sängerknaben", youtubeId: "Vx7UcaW0osw" },
    { title: "All I Want for Christmas Is You", artist: "Mariah Carey", youtubeId: "yXQViqx6GMY" },
    { title: "Tu scendi dalle stelle", artist: "Andrea Bocelli", youtubeId: "68mCdwb4A3k" },
    { title: "Stille Nacht (Live aus der Hofburg Wien)", artist: "Helene Fischer", youtubeId: "ohhXZtgO3J8" }
  ];
  if (typeof module !== 'undefined' && module.exports) module.exports = SONGS;
  else root.SONGS = SONGS;
})(this);
