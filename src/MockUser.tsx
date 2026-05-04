let mockArtists = [
  [
    {
      genres: ["folk rock", "singer-songwriter"],
      href: "https://api.spotify.com/v1/artists/1R6Hx1tJ2VOUyodEpC12xM",
      id: "1R6Hx1tJ2VOUyodEpC12xM",
      images: [
        {
          height: 990,
          url: "https://i.scdn.co/image/9f9b40704e3361c93ea8a8b7a86a5d9ee755466e",
          width: 1000,
        },
        {
          height: 634,
          url: "https://i.scdn.co/image/a231c19bbf27417afaf99cad6ef372054b38da28",
          width: 640,
        },
        {
          height: 198,
          url: "https://i.scdn.co/image/f2374db73b0a0722f78b84ff88d26ab32472938b",
          width: 200,
        },
      ],
      name: "Jim Croce",
    },
    {
      genres: ["singer-songwriter"],
      href: "https://api.spotify.com/v1/artists/2ApaG60P4r0yhBoDCGD8YG",
      id: "2ApaG60P4r0yhBoDCGD8YG",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5eb079739b801ab3f105866b76f",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab67616100005174079739b801ab3f105866b76f",
          width: 320,
        },
      ],
      name: "Elliott Smith",
    },
    {
      genres: ["rap"],
      href: "https://api.spotify.com/v1/artists/5K4W6rqBFWDnAN6FQUkS6x",
      id: "5K4W6rqBFWDnAN6FQUkS6x",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5eb6e835a500e791bf9c27a422a",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab676161000051746e835a500e791bf9c27a422a",
          width: 320,
        },
      ],
      name: "Kanye West",
    },
    {
      genres: ["singer-songwriter"],
      href: "https://api.spotify.com/v1/artists/0hEurMDQu99nJRq8pTxO14",
      id: "0hEurMDQu99nJRq8pTxO14",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5ebe926dd683e1700a6d65bd835",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab67616100005174e926dd683e1700a6d65bd835",
          width: 320,
        },
      ],
      name: "John Mayer",
    },
    {
      genres: ["hip hop", "west coast hip hop"],
      href: "https://api.spotify.com/v1/artists/2YZyLoL8N0Wb9xBt1NhZWg",
      id: "2YZyLoL8N0Wb9xBt1NhZWg",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5eb39ba6dcd4355c03de0b50918",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab6761610000517439ba6dcd4355c03de0b50918",
          width: 320,
        },
      ],
      name: "Kendrick Lamar",
    },
    {
      genres: ["psychedelic rock", "classic rock", "acid rock", "blues rock"],
      href: "https://api.spotify.com/v1/artists/776Uo845nYHJpNaStv1Ds4",
      id: "776Uo845nYHJpNaStv1Ds4",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5eb31f6ab67e6025de876475814",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab6761610000517431f6ab67e6025de876475814",
          width: 320,
        },
      ],
      name: "Jimi Hendrix",
    },
    {
      genres: ["corrido", "norteño", "música mexicana", "banda"],
      href: "https://api.spotify.com/v1/artists/7u9m43vPVTERaALXXOzrRq",
      id: "7u9m43vPVTERaALXXOzrRq",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5eb5c2431cad6a50bb95218f856",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab676161000051745c2431cad6a50bb95218f856",
          width: 320,
        },
      ],
      name: "Chalino Sanchez",
    },
    {
      genres: [],
      href: "https://api.spotify.com/v1/artists/7t0rwkOPGlDPEhaOcVtOt9",
      id: "7t0rwkOPGlDPEhaOcVtOt9",
      images: [
        {
          height: 667,
          url: "https://i.scdn.co/image/143c01f407ed64a4b3bcbc92d24c05ef80981251",
          width: 1000,
        },
        {
          height: 427,
          url: "https://i.scdn.co/image/a82245ec62ee9606ab456d787f1f7fcd788e6a10",
          width: 640,
        },
        {
          height: 133,
          url: "https://i.scdn.co/image/3a0e3d6f957d3d713a386aeedd028a8e8a1d8803",
          width: 200,
        },
      ],
      name: "The Cranberries",
    },
    {
      genres: ["classic rock", "psychedelic rock"],
      href: "https://api.spotify.com/v1/artists/3WrFJ7ztbogyGnTHbHJFl2",
      id: "3WrFJ7ztbogyGnTHbHJFl2",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5ebe9348cc01ff5d55971b22433",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab67616100005174e9348cc01ff5d55971b22433",
          width: 320,
        },
      ],
      name: "The Beatles",
    },
    {
      genres: [
        "folk rock",
        "folk",
        "singer-songwriter",
        "roots rock",
        "country rock",
      ],
      href: "https://api.spotify.com/v1/artists/74ASZWbe4lXaubB36ztrGX",
      id: "74ASZWbe4lXaubB36ztrGX",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5eb791742524609864273747ef5",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab67616100005174791742524609864273747ef5",
          width: 320,
        },
      ],
      name: "Bob Dylan",
    },
    {
      genres: ["shoegaze"],
      href: "https://api.spotify.com/v1/artists/4KEHIUSoWCcqrk8AddTE1O",
      id: "4KEHIUSoWCcqrk8AddTE1O",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5eb714fa6e5682f730d0c82609c",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab67616100005174714fa6e5682f730d0c82609c",
          width: 320,
        },
      ],
      name: "Panchiko",
    },
    {
      genres: ["art rock", "alternative rock"],
      href: "https://api.spotify.com/v1/artists/4Z8W4fKeB5YxbusRsdQVPb",
      id: "4Z8W4fKeB5YxbusRsdQVPb",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5eba03696716c9ee605006047fd",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab67616100005174a03696716c9ee605006047fd",
          width: 320,
        },
      ],
      name: "Radiohead",
    },
    {
      genres: ["new wave", "madchester", "jangle pop"],
      href: "https://api.spotify.com/v1/artists/3yY2gUcIsjMr8hjo51PoJ8",
      id: "3yY2gUcIsjMr8hjo51PoJ8",
      images: [
        {
          height: 1516,
          url: "https://i.scdn.co/image/481b980af463122013e4578c08fb8c5cbfaed1e9",
          width: 1000,
        },
        {
          height: 970,
          url: "https://i.scdn.co/image/4bf08a9e6eea088b20d4092d1322bbd3f39ff9af",
          width: 640,
        },
        {
          height: 303,
          url: "https://i.scdn.co/image/bd4c7f5ff2c5c4385604e60c71eac1dd498ddbd9",
          width: 200,
        },
      ],
      name: "The Smiths",
    },
    {
      genres: ["indie", "garage rock"],
      href: "https://api.spotify.com/v1/artists/7Ln80lUS6He07XvHI8qqHH",
      id: "7Ln80lUS6He07XvHI8qqHH",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5eb7da39dea0a72f581535fb11f",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab676161000051747da39dea0a72f581535fb11f",
          width: 320,
        },
      ],
      name: "Arctic Monkeys",
    },
    {
      genres: ["spoken word", "jazz funk"],
      href: "https://api.spotify.com/v1/artists/0kEfub5RzlZOB2zGomqVSU",
      id: "0kEfub5RzlZOB2zGomqVSU",
      images: [
        {
          height: 404,
          url: "https://i.scdn.co/image/68e093d4aec6cc8f0d00dbec6d441364c5a3b3b6",
          width: 590,
        },
        {
          height: 137,
          url: "https://i.scdn.co/image/44edd73499cb003c4682b4c4374dc4488be43f1f",
          width: 200,
        },
      ],
      name: "Gil Scott-Heron",
    },
    {
      genres: [],
      href: "https://api.spotify.com/v1/artists/57vWImR43h4CaDao012Ofp",
      id: "57vWImR43h4CaDao012Ofp",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5eb09ac9d040c168d4e4f58eb42",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab6761610000517409ac9d040c168d4e4f58eb42",
          width: 320,
        },
      ],
      name: "Steve Lacy",
    },
    {
      genres: ["jazz", "jazz fusion", "bebop"],
      href: "https://api.spotify.com/v1/artists/4V7Ate3UISn8cy06xnAprh",
      id: "4V7Ate3UISn8cy06xnAprh",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab67616d0000b273b752bbaa0dd7578b736f7cc1",
          width: 640,
        },
        {
          height: 300,
          url: "https://i.scdn.co/image/ab67616d00001e02b752bbaa0dd7578b736f7cc1",
          width: 300,
        },
      ],
      name: "Ryo Fukui",
    },
    {
      genres: ["shoegaze", "post-grunge"],
      href: "https://api.spotify.com/v1/artists/1IHjrY7ygKbmLVoUV1VcXc",
      id: "1IHjrY7ygKbmLVoUV1VcXc",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5eb70e164a7c5093e347f46edb0",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab6761610000517470e164a7c5093e347f46edb0",
          width: 320,
        },
      ],
      name: "Superheaven",
    },
    {
      genres: ["shoegaze", "metalcore"],
      href: "https://api.spotify.com/v1/artists/4G9wSdX0klmoHfjm9i6DLd",
      id: "4G9wSdX0klmoHfjm9i6DLd",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5eb2fa847a71b26afde5da321db",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab676161000051742fa847a71b26afde5da321db",
          width: 320,
        },
      ],
      name: "Loathe",
    },
    {
      genres: ["garage rock", "indie rock", "alternative rock"],
      href: "https://api.spotify.com/v1/artists/0epOFNiUfyON9EYx7Tpr6V",
      id: "0epOFNiUfyON9EYx7Tpr6V",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5ebc3b137793230f4043feb0089",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab67616100005174c3b137793230f4043feb0089",
          width: 320,
        },
      ],
      name: "The Strokes",
    },
    {
      genres: [],
      href: "https://api.spotify.com/v1/artists/4Rus30xX4FOv2cyeFI79Qh",
      id: "4Rus30xX4FOv2cyeFI79Qh",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5ebc2b3c18187029164af151920",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab67616100005174c2b3c18187029164af151920",
          width: 320,
        },
      ],
      name: "Elijah Fox",
    },
    {
      genres: ["nu metal", "metal", "alternative metal", "rap metal", "rock"],
      href: "https://api.spotify.com/v1/artists/5eAWCfyUhZtHHtBdNk56l1",
      id: "5eAWCfyUhZtHHtBdNk56l1",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5eb60063d3451ade8f9fab397c2",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab6761610000517460063d3451ade8f9fab397c2",
          width: 320,
        },
      ],
      name: "System Of A Down",
    },
    {
      genres: [
        "blues",
        "blues rock",
        "classic blues",
        "southern rock",
        "modern blues",
      ],
      href: "https://api.spotify.com/v1/artists/5fsDcuclIe8ZiBD5P787K1",
      id: "5fsDcuclIe8ZiBD5P787K1",
      images: [
        {
          height: 1021,
          url: "https://i.scdn.co/image/1de60c936683320769a1bfb6fba7f75902859085",
          width: 1000,
        },
        {
          height: 654,
          url: "https://i.scdn.co/image/5bd95fbc961256c56560d838bd74d05be50701d4",
          width: 640,
        },
        {
          height: 204,
          url: "https://i.scdn.co/image/a812f6770a18e269934733f69fba0daf93f3ae04",
          width: 200,
        },
      ],
      name: "Stevie Ray Vaughan",
    },
    {
      genres: [],
      href: "https://api.spotify.com/v1/artists/5jTtGLk1mGFMY5lQOvJYUj",
      id: "5jTtGLk1mGFMY5lQOvJYUj",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5ebd699423e4d35ff7a7fb66b7d",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab67616100005174d699423e4d35ff7a7fb66b7d",
          width: 320,
        },
      ],
      name: "bôa",
    },
    {
      genres: ["nu metal", "alternative metal", "rap metal", "shoegaze"],
      href: "https://api.spotify.com/v1/artists/6Ghvu1VvMGScGpOUJBAHNH",
      id: "6Ghvu1VvMGScGpOUJBAHNH",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5eb4b2da0b72cab26ac518f1f0d",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab676161000051744b2da0b72cab26ac518f1f0d",
          width: 320,
        },
      ],
      name: "Deftones",
    },
    {
      genres: ["grunge", "rock"],
      href: "https://api.spotify.com/v1/artists/6olE6TJLqED3rqDCT0FyPh",
      id: "6olE6TJLqED3rqDCT0FyPh",
      images: [
        {
          height: 1057,
          url: "https://i.scdn.co/image/84282c28d851a700132356381fcfbadc67ff498b",
          width: 1000,
        },
        {
          height: 677,
          url: "https://i.scdn.co/image/a4e10b79a642e9891383448cbf37d7266a6883d6",
          width: 640,
        },
        {
          height: 211,
          url: "https://i.scdn.co/image/42ae0f180f16e2f21c1f2212717fc436f5b95451",
          width: 200,
        },
      ],
      name: "Nirvana",
    },
    {
      genres: ["alternative rock", "rock"],
      href: "https://api.spotify.com/v1/artists/40Yq4vzPs9VNUrIBG5Jr2i",
      id: "40Yq4vzPs9VNUrIBG5Jr2i",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5eb86bd93938c4811d1f94adf9f",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab6761610000517486bd93938c4811d1f94adf9f",
          width: 320,
        },
      ],
      name: "The Smashing Pumpkins",
    },
    {
      genres: [],
      href: "https://api.spotify.com/v1/artists/4STHEaNw4mPZ2tzheohgXB",
      id: "4STHEaNw4mPZ2tzheohgXB",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5eb03bf2fe26e397122faa3d323",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab6761610000517403bf2fe26e397122faa3d323",
          width: 320,
        },
      ],
      name: "Paul McCartney",
    },
    {
      genres: ["indie"],
      href: "https://api.spotify.com/v1/artists/77mJc3M7ZT5oOVM7gNdXim",
      id: "77mJc3M7ZT5oOVM7gNdXim",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5eb6e339cf31f00e472b1ddd1c5",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab676161000051746e339cf31f00e472b1ddd1c5",
          width: 320,
        },
      ],
      name: "Her's",
    },
    {
      genres: [],
      href: "https://api.spotify.com/v1/artists/3fMbdgg4jU18AjLCKBhRSm",
      id: "3fMbdgg4jU18AjLCKBhRSm",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5eb997cc9a4aec335d46c9481fd",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab67616100005174997cc9a4aec335d46c9481fd",
          width: 320,
        },
      ],
      name: "Michael Jackson",
    },
    {
      genres: ["christmas", "adult standards"],
      href: "https://api.spotify.com/v1/artists/1eEfMU2AhEo7XnKgL7c304",
      id: "1eEfMU2AhEo7XnKgL7c304",
      images: [
        {
          height: 493,
          url: "https://i.scdn.co/image/ed45f575339b044d7168780a15ff457b85be851a",
          width: 500,
        },
        {
          height: 197,
          url: "https://i.scdn.co/image/6d1f554e76304a29b8baa3f61213a88702c0f599",
          width: 200,
        },
      ],
      name: "Carpenters",
    },
    {
      genres: ["folk rock", "folk", "singer-songwriter"],
      href: "https://api.spotify.com/v1/artists/08F3Y3SctIlsOEmKd6dnH8",
      id: "08F3Y3SctIlsOEmKd6dnH8",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5ebcff97c36c1d9a2a1d421966c",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab67616100005174cff97c36c1d9a2a1d421966c",
          width: 320,
        },
      ],
      name: "Yusuf / Cat Stevens",
    },
    {
      genres: [],
      href: "https://api.spotify.com/v1/artists/5SXuuuRpukkTvsLuUknva1",
      id: "5SXuuuRpukkTvsLuUknva1",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5ebd6f2323c1971fd5a70cd0255",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab67616100005174d6f2323c1971fd5a70cd0255",
          width: 320,
        },
      ],
      name: "Baby Keem",
    },
    {
      genres: [],
      href: "https://api.spotify.com/v1/artists/4V8LLVI7PbaPR0K2TGSxFF",
      id: "4V8LLVI7PbaPR0K2TGSxFF",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5ebdfa2b0c7544a772042a12e52",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab67616100005174dfa2b0c7544a772042a12e52",
          width: 320,
        },
      ],
      name: "Tyler, The Creator",
    },
    {
      genres: ["soundtrack", "celtic"],
      href: "https://api.spotify.com/v1/artists/2ifvIECHAlEgPMBuBOJ0lG",
      id: "2ifvIECHAlEgPMBuBOJ0lG",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5eb7cfb8906597801fcadec3513",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab676161000051747cfb8906597801fcadec3513",
          width: 320,
        },
      ],
      name: "Bear McCreary",
    },
    {
      genres: [
        "blues",
        "classic blues",
        "jazz blues",
        "soul blues",
        "blues rock",
      ],
      href: "https://api.spotify.com/v1/artists/5xLSa7l4IV1gsQfhAMvl0U",
      id: "5xLSa7l4IV1gsQfhAMvl0U",
      images: [
        {
          height: 1259,
          url: "https://i.scdn.co/image/ffb3ff26238fe635a230bb0feb59dd0a5b209b6f",
          width: 1000,
        },
        {
          height: 806,
          url: "https://i.scdn.co/image/7e53bec2f958fa7fd1868124a0897cb0d08b60ee",
          width: 640,
        },
        {
          height: 252,
          url: "https://i.scdn.co/image/8b4bbc1e769cc1cf78a6a369f3a8b0026631eb96",
          width: 200,
        },
      ],
      name: "B.B. King",
    },
    {
      genres: ["motown", "soul"],
      href: "https://api.spotify.com/v1/artists/7guDJrEfX3qb6FEbdPA5qi",
      id: "7guDJrEfX3qb6FEbdPA5qi",
      images: [
        {
          height: 1008,
          url: "https://i.scdn.co/image/c59faacbed7aa770266bad048660810eca204108",
          width: 1000,
        },
        {
          height: 645,
          url: "https://i.scdn.co/image/37c7875911b1d8195b05d40061a86bd01908a0d9",
          width: 640,
        },
        {
          height: 202,
          url: "https://i.scdn.co/image/3b24b51bf11404089c4d66acd0c612539c77e7e7",
          width: 200,
        },
      ],
      name: "Stevie Wonder",
    },
    {
      genres: ["banda", "sierreño", "corrido", "norteño", "música mexicana"],
      href: "https://api.spotify.com/v1/artists/2Lxa3SFNEW0alfRvtdXOul",
      id: "2Lxa3SFNEW0alfRvtdXOul",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5eb44718c4f816472411cd78cd4",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab6761610000517444718c4f816472411cd78cd4",
          width: 320,
        },
      ],
      name: "Ariel Camacho y Los Plebes Del Rancho",
    },
    {
      genres: [],
      href: "https://api.spotify.com/v1/artists/2h93pZq0e7k5yf4dywlkpM",
      id: "2h93pZq0e7k5yf4dywlkpM",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5ebee3123e593174208f9754fab",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab67616100005174ee3123e593174208f9754fab",
          width: 320,
        },
      ],
      name: "Frank Ocean",
    },
    {
      genres: ["shoegaze"],
      href: "https://api.spotify.com/v1/artists/3TJZG17pjOKXwx1ELKJPfm",
      id: "3TJZG17pjOKXwx1ELKJPfm",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5eb5ec3cb2f3f7175b855286695",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab676161000051745ec3cb2f3f7175b855286695",
          width: 320,
        },
      ],
      name: "Wisp",
    },
    {
      genres: [],
      href: "https://api.spotify.com/v1/artists/5GUVj2b1lJ4DolQyHlzyaO",
      id: "5GUVj2b1lJ4DolQyHlzyaO",
      images: [
        {
          height: 727,
          url: "https://i.scdn.co/image/7cb47aa5aba19de14aef71b7b55bdd391a199800",
          width: 1000,
        },
        {
          height: 465,
          url: "https://i.scdn.co/image/4b257c080672292ddf84aa30572b49a3b1bdb12f",
          width: 640,
        },
        {
          height: 145,
          url: "https://i.scdn.co/image/263c07debf9ee6357de823105f422b5583b9aef0",
          width: 199,
        },
      ],
      name: "Blind Faith",
    },
    {
      genres: ["vocal jazz", "jazz"],
      href: "https://api.spotify.com/v1/artists/7lbrnX0ng1Il12RdEU1Ohu",
      id: "7lbrnX0ng1Il12RdEU1Ohu",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5eb1483176c7a9bb309b91f57ba",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab676161000051741483176c7a9bb309b91f57ba",
          width: 320,
        },
      ],
      name: "Jeff Goldblum & The Mildred Snitzer Orchestra",
    },
    {
      genres: ["jazz rap"],
      href: "https://api.spotify.com/v1/artists/3Rq3YOF9YG9YfCWD4D56RZ",
      id: "3Rq3YOF9YG9YfCWD4D56RZ",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5eb57f19d2f179b00207bfb3155",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab6761610000517457f19d2f179b00207bfb3155",
          width: 320,
        },
      ],
      name: "Nujabes",
    },
    {
      genres: ["britpop", "madchester", "rock"],
      href: "https://api.spotify.com/v1/artists/2DaxqgrOhkeH0fpeiQq2f4",
      id: "2DaxqgrOhkeH0fpeiQq2f4",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5eb0522e98a6f0cf1ddbee9a74f",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab676161000051740522e98a6f0cf1ddbee9a74f",
          width: 320,
        },
      ],
      name: "Oasis",
    },
    {
      genres: ["blues", "blues rock", "classic rock"],
      href: "https://api.spotify.com/v1/artists/6PAt558ZEZl0DmdXlnjMgD",
      id: "6PAt558ZEZl0DmdXlnjMgD",
      images: [
        {
          height: 1000,
          url: "https://i.scdn.co/image/ab6772690000c46ca60e8f215103f6841d8a83f0",
          width: 1000,
        },
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6772690000dd22a60e8f215103f6841d8a83f0",
          width: 640,
        },
        {
          height: 200,
          url: "https://i.scdn.co/image/ab6772690000bac3a60e8f215103f6841d8a83f0",
          width: 200,
        },
      ],
      name: "Eric Clapton",
    },
    {
      genres: ["jazz", "cool jazz"],
      href: "https://api.spotify.com/v1/artists/6C65D20ASusYqHGSIktfED",
      id: "6C65D20ASusYqHGSIktfED",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5eb34cb37f08e3259a4084897a6",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab6761610000517434cb37f08e3259a4084897a6",
          width: 320,
        },
      ],
      name: "Erroll Garner",
    },
    {
      genres: ["jazz", "hard bop", "jazz blues", "cool jazz", "bebop"],
      href: "https://api.spotify.com/v1/artists/03YhcM6fxypfwckPCQV8pQ",
      id: "03YhcM6fxypfwckPCQV8pQ",
      images: [
        {
          height: 713,
          url: "https://i.scdn.co/image/e0fcfb2e4dbb9cb9c408ba7fad9bdd3526ef6ed8",
          width: 1000,
        },
        {
          height: 456,
          url: "https://i.scdn.co/image/556fb015a5411afb24f3d6691ac4f12847e08a14",
          width: 639,
        },
        {
          height: 143,
          url: "https://i.scdn.co/image/47b8c42a958dded335d85abe840b66581131be86",
          width: 200,
        },
      ],
      name: "Wes Montgomery",
    },
    {
      genres: [],
      href: "https://api.spotify.com/v1/artists/7MsfV9iU1jXeSocUOSL971",
      id: "7MsfV9iU1jXeSocUOSL971",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab6761610000e5eb2499ea2dd2f1148458bba1c1",
          width: 640,
        },
        {
          height: 320,
          url: "https://i.scdn.co/image/ab676161000051742499ea2dd2f1148458bba1c1",
          width: 320,
        },
      ],
      name: "Father's Children",
    },
    {
      genres: ["jazz", "cool jazz", "vocal jazz"],
      href: "https://api.spotify.com/v1/artists/3rxeQlsv0Sc2nyYaZ5W71T",
      id: "3rxeQlsv0Sc2nyYaZ5W71T",
      images: [
        {
          height: 817,
          url: "https://i.scdn.co/image/8fd767aa91ecd8e5720b424812e2a17586834ac2",
          width: 1000,
        },
        {
          height: 523,
          url: "https://i.scdn.co/image/baa4a09ca62a85dab5de4a8e9d635571b9cfac9d",
          width: 640,
        },
        {
          height: 163,
          url: "https://i.scdn.co/image/5c15cad68e6584825963e484deca44c12e118dfb",
          width: 199,
        },
      ],
      name: "Chet Baker",
    },
    {
      genres: ["jazz"],
      href: "https://api.spotify.com/v1/artists/6m1rUIqtk10YWCyR5jFW9W",
      id: "6m1rUIqtk10YWCyR5jFW9W",
      images: [
        {
          height: 640,
          url: "https://i.scdn.co/image/ab67616d0000b273760810a1a1c36a610a54db0f",
          width: 640,
        },
        {
          height: 300,
          url: "https://i.scdn.co/image/ab67616d00001e02760810a1a1c36a610a54db0f",
          width: 300,
        },
      ],
      name: "Lelio Luttazzi",
    },
  ],
];
