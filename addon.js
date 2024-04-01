const { addonBuilder } = require("stremio-addon-sdk");
const magnet = require("magnet-uri");
const fetch = require('node-fetch');
const superagent = require('superagent');
const cheerio = require('cheerio');

const SEIRSANDUK_CHANNELS = {}
const AGENT = superagent.agent();

const manifest = {
    "id": "bg-tv",
    "version": "1.0.0",

    "name": "BG-TV",
    "description": "BG-TV addon provides streaming Bulgarian TV-channels from https://seirsanduk.net/",

    // set what type of resources we will return
    "resources": [
        "catalog",
        {
            "name": "meta",
            "types": ["movie"],
            "idPrefixes": ["bg-tv-"]
        },
        "stream"
    ],

    "types": ["movie", "series"], // your add-on will be preferred for those content types

    // set catalogs, we'll be making 2 catalogs in this case, 1 for movies and 1 for series
    "catalogs": [
        {
            type: 'movie',
            id: 'bg-tv-movies'
        },
        {
            type: 'series',
            id: 'bg-tv-series'
        }
    ],

    // prefix of item IDs (ie: "tt0032138")
    // "idPrefixes": ["bg-tv-"]

};

const builder = new addonBuilder(manifest);


builder.defineCatalogHandler(function (args, cb) {

    console.log('start defineCatalogHandler()')

    // filter the dataset object and only take the requested type
    // const metas = []

    const metas = Object.entries(SEIRSANDUK_CHANNELS)
        .filter(([_, value]) => value.type === args.type)
        .map(([key, value]) => generateMetaPreview(value, key))


    metas.push({
        "id": "bg-tv-jellyfish",
        "type": "movie",
        "name": "Jellyfish",
        "poster": "https://images.unsplash.com/photo-1496108493338-3b30de66f9be",
        "genres": ["Demo", "Nature"]
    })

    console.log('end defineCatalogHandler()')
    return Promise.resolve({ metas: metas })

})

const generateMetaPreview = function (value, key) {

    console.log('start generateMetaPreview()')
    // To provide basic meta for our movies for the catalog
    // we'll fetch the poster from Stremio's MetaHub
    // see https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/meta.md#meta-preview-object
    // const imdbId = key.split(":")[0]

    console.log('end generateMetaPreview()')

    return {
        id: 'bg-tv-' + value.name,
        // id: 'bg-tv-jellyfish',
        type: value.type,
        name: value.name,
        poster: value.channel_icon_url,
    }

    //     const metas = []

    //     for (const key in SEIRSANDUK_CHANNELS) {
    //         metas.push({
    //             id: SEIRSANDUK_CHANNELS[key].name,
    //             type: SEIRSANDUK_CHANNELS[key].type,
    //             name: SEIRSANDUK_CHANNELS[key].name,
    //             poster: SEIRSANDUK_CHANNELS[key].channel_icon_url,
    //         })
    //     }

    //     return metas
}


// builder.defineMetaHandler(function(args) {
//     console.log("start defineMetaHandler")

//     if (args.type === 'movie' && args.id === 'tt1254207') {
//         // serve metadata for Big Buck Bunny
//         const metaObj = {
//             id: 'tt1254207',
//             name: 'Big Buck Bunny',
//             releaseInfo: '2008',
//             poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/uVEFQvFMMsg4e6yb03xOfVsDz4o.jpg',
//             posterShape: 'poster',
//             type: 'movie'
//         }
//         console.log("end defineMetaHandler()")
//         return Promise.resolve({ meta: metaObj })
//     } else {
//         // otherwise return no meta
//         console.log("end defineMetaHandler()")
//         return Promise.resolve({ meta: {} })
//     }


// })


builder.defineMetaHandler(args => {

    console.log('start defineMetaHandler()')
    console.log(args)

    const channel_name = args.id.replace('bg-tv-', '')

    return Promise.resolve({
        meta: {
            id: args.id,
            type: "movie",
            name: SEIRSANDUK_CHANNELS[channel_name].name,
            // poster: "https://images.unsplash.com/photo-1496108493338-3b30de66f9be",
            // genres: ["Demo", "Nature"],
            // description: "A .mkv video clip useful for testing the network streaming and playback performance of media streamers & HTPCs.",
            // cast: ["Some random jellyfishes"],
            // director: ["ScottAllyn"],
            logo: SEIRSANDUK_CHANNELS[channel_name].channel_icon_url,
            // background: "https://images.unsplash.com/photo-1461783470466-185038239ee3",
            // runtime: "30 sec"
        }
    })

    // return new Promise((resolve, reject) => {

    //     // ensure meta type and id are correct
    //     if (args.type == 'movie' && args.id.startsWith('bg-tv-')) {

    //         // // request the meta id from IGDB
    //         // igdbClient.games({
    //         //   fields: [ 'name', 'cover', 'first_release_date', 'screenshots', 'artworks', 'videos', 'genres', 'platforms', 'summary' ],
    //         //   ids: [ args.id.replace('igdb-', '') ],
    //         //   expand: [ 'genres', 'platforms' ]
    //         // }).then(res => {
    //         //   if (res && res.body && res.body.length) {
    //         //     // igdb response is correct and has items
    //         //     // convert igdb object to stremio meta object
    //         //     // and respond to add-on request
    //         //     resolve({ meta: toMeta(res.body[0]) })
    //         //   } else {
    //         //     // send error if invalid response from IGDB
    //         //     reject(new Error('Received Invalid Meta'))
    //         //   }
    //         // }).catch(err => {
    //         //   // send IGDB request error as add-on response
    //         //   reject(err)
    //         // })

    //     } else {
    //         // give error if meta type and id are incorrect
    //         reject(new Error('Invalid Meta Request'))
    //     }
    // })
})

// Streams handler
builder.defineStreamHandler(function (args) {
    // {
    //     name:
    //     type:
    //     url:
    // }

    console.log('start defineStreamHandler()')
    return get_stream(args)


    // if (dataset[args.id]) {

    //     console.log('end defineStreamHandler()')
    //     return Promise.resolve({ streams: [dataset[args.id]] });

    // } else {

    //     console.log('end defineStreamHandler()')
    //     return Promise.resolve({ streams: [] });
    // }
})


////////////
async function seirsanduk_get_channel_urls() {

    console.log('start seirsanduk_get_channel_urls()')

    // url = 'https://www.seirsanduk.net/'
    url = 'https://www.seir-sanduk.com/'


    // Make a GET request to the webpage and store cookies

    try {
        response = await AGENT.get(url)

    } catch (error) {
        console.error('There was a problem with your superagent request:', error);
    };

    // console.log(response.text)

    // Load the HTML content into cheerio
    const $ = cheerio.load(response.text);

    const channels_group = '#channels a'
    // Extract elements using the CSS selector
    // const elements = $(selector).map((index, element) => $(element).text()).get();


    // Get TV channels
    const listChannels = $('#channels > ul').children('li');
    console.log(`List item count: ${listChannels.length}`);

    for (const channel of listChannels) {
        const href = $(channel).find('a').attr('href')
        // console.log(href)
        // channels_urls.push(href.replace('//www.', 'www.'))

        const name = $(channel).text()
        // console.log(name)
        // channels_names.push(name)

        const img_url = $(channel).find('img').attr('src')
        // console.log(img_url)
        // channels_img_urls.push(img_url)    

        SEIRSANDUK_CHANNELS[name] = {
            name: name,
            type: 'movie',
            channel_url: href.replace('//www.', 'www.'),
            channel_icon_url: url + img_url
        }

        console.log(SEIRSANDUK_CHANNELS[name])

        // console.log(channels_urls)


        // fetch("https://www.seirsanduk.net/", {
        //     "headers": {
        //         "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        //         "accept-language": "en-US,en;q=0.9",
        //         "cache-control": "no-cache",
        //         "pragma": "no-cache",
        //         "sec-ch-ua": "\"Chromium\";v=\"122\", \"Not(A:Brand\";v=\"24\", \"Microsoft Edge\";v=\"122\"",
        //         "sec-ch-ua-mobile": "?0",
        //         "sec-ch-ua-platform": "\"Windows\"",
        //         "sec-fetch-dest": "document",
        //         "sec-fetch-mode": "navigate",
        //         "sec-fetch-site": "none",
        //         "sec-fetch-user": "?1",
        //         "upgrade-insecure-requests": "1",
        //         "cookie": "_ga=GA1.1.2138557618.1711489577; CookieInfoScript=1; _ga_LS08Q4CPF3=GS1.1.1711517577.2.1.1711518085.0.0.0"
        //     },
        //     "referrerPolicy": "strict-origin-when-cross-origin",
        //     "body": null,
        //     "method": "GET"
        // }).then(response => {
        //     console.log(response.text())
        // })

        // console.log(response.text())
    }

    console.log('end seirsanduk_get_channel_urls()')

}

async function seirsanduk_get_stream_url(input) {

    console.log('start seirsanduk_get_stream_url()')
    // Open channel page to get the m3u-playlist

    const superagent_get_stream = superagent.agent();

    for (const key in SEIRSANDUK_CHANNELS) {

        if (key == input) {
            const channel_meta = SEIRSANDUK_CHANNELS[key]

            // await new Promise(resolve => setTimeout(resolve, 300));

            try {

                console.log('Open URL with SuperAgent:', channel_meta.channel_url)
                // const response = await AGENT.get(channel_meta.channel_url)
                const response = await superagent_get_stream.get(channel_meta.channel_url)
                console.log('Response Status:', response.status)

                const response_lines = response.text.split('\n');

                for (const line of response_lines) {
                    if (line.includes('file:')) {

                        console.log('found file:', line)
                        const regex = /file:"([^"]+)"/;

                        const match = line.match(regex);

                        if (match) {
                            const url = match[1]; // Access the captured URL from the first capture group (index 1)
                            console.log('Extracted URL:', url);
                            channel_meta.stream_url = url

                        } else {
                            console.log('URL not found in the string.');
                        }

                    }
                }

            } catch (error) {
                console.error('There was a problem with your superagent request:', error);
            };
        }
    }
    console.log('end seirsanduk_get_stream_urls()')
}



async function seirsanduk() {

    console.log('start seirsanduk()')

    await seirsanduk_get_channel_urls()
    // const output = await seirsanduk_get_stream_urls(channels_output)

    // console.log(output)

    // dataset = 

    // const dataset = {

    //     "tt1254207": { name: "TV", type: "movie", url: "https://cdn3.gledam.xyz/hls/hd-nat-geo-hd/index.m3u8?e=1711525282&hash=ijRhH2_TW4EVpkSvx6iU2w" }, // HTTP stream

    console.log('end seirsanduk()')
}

async function get_stream(args) {

    console.log('start get_stream()')
    const channel_name = await args.id.replace('bg-tv-', '')
    await seirsanduk_get_stream_url(channel_name)

    console.log('Channel URL:', SEIRSANDUK_CHANNELS[channel_name].stream_url)

    console.log('end get_stream()')
    console.log({ streams: [{ name: SEIRSANDUK_CHANNELS[channel_name].name, type: 'movie', url: SEIRSANDUK_CHANNELS[channel_name].stream_url, }] })

    return { streams: [{ name: SEIRSANDUK_CHANNELS[channel_name].name, type: 'movie', url: SEIRSANDUK_CHANNELS[channel_name].stream_url, }] }

}

seirsanduk()



/////////////////////////////////////////////////////
// BACKUP 
////////////////////////////////////////////////////

/*

async function seirsanduk_get_stream_urls(input) {

    console.log('start seirsanduk_get_stream_urls()')
    // Open channel page to get the m3u-playlist

    var counter = 0

    for (const channel_meta of SEIRSANDUK_CHANNELS) {

        await new Promise(resolve => setTimeout(resolve, 300));

        const response = await AGENT.get(channel_meta.channel_url)
        const response_lines = response.text.split('\n');

        for (const line of response_lines) {
            if (line.includes('file:')) {

                const regex = /file:"([^"]+)"/;

                const match = line.match(regex);

                if (match) {
                    const url = match[1]; // Access the captured URL from the first capture group (index 1)
                    console.log('Extracted URL:', url);
                    channel_meta.stream_url = url

                } else {
                    console.log('URL not found in the string.');
                }

            }
        }

        counter = counter + 1
        if (counter > 3) {
            break
        }
    }

    console.log('end seirsanduk_get_stream_urls()')
}

const dataset = {

    "tt1254207": { name: "TV", type: "movie", url: "https://cdn4.gledam.xyz/hls/hd-bnt-1-hd/index.m3u8?e=1711919543&hash=uQo_YdCBsXpmWPgOtVAgIQ" }, // HTTP stream

    // fileIdx is the index of the file within the torrent ; if not passed, the largest file will be selected
    // "tt0032138": { name: "The Wizard of Oz", type: "movie", infoHash: "24c8802e2624e17d46cd555f364debd949f2c81e", fileIdx: 0 },
    // "tt0017136": { name: "Metropolis", type: "movie", infoHash: "dca926c0328bb54d209d82dc8a2f391617b47d7a", fileIdx: 1 },

    // // night of the living dead, example from magnet
    // "tt0063350": fromMagnet("Night of the Living Dead", "movie", "magnet:?xt=urn:btih:A7CFBB7840A8B67FD735AC73A373302D14A7CDC9&dn=night+of+the+living+dead+1968+remastered+bdrip+1080p+ita+eng+x265+nahom&tr=udp%3A%2F%2Ftracker.publicbt.com%2Fannounce&tr=udp%3A%2F%2Fglotorrents.pw%3A6969%2Fannounce&tr=udp%3A%2F%2Ftracker.openbittorrent.com%3A80%2Fannounce"),
    // "tt0051744": { name: "House on Haunted Hill", type: "movie", infoHash: "9f86563ce2ed86bbfedd5d3e9f4e55aedd660960" },

    // "tt1254207": { name: "Big Buck Bunny", type: "movie", url: "http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4" }, // HTTP stream
    // "tt0031051": { name: "The Arizona Kid", type: "movie", ytId: "m3BKVSpP80s" }, // YouTube stream

    // "tt0137523": { name: "Fight Club", type: "movie", externalUrl: "https://www.netflix.com/watch/26004747" }, // redirects to Netflix

    // "tt1748166:1:1": { name: "Pioneer One", type: "series", infoHash: "07a9de9750158471c3302e4e95edb1107f980fa6" }, // torrent for season 1, episode 1
    // "tt1748166:1:2": { name: "Pioneer TWO", type: "series", infoHash: "07a9de9750158471c3302e4e95edb1107f980fa6" }, // torrent for season 1, episode 1

};

builder.defineStreamHandler(function (args) {

    console.log('start defineStreamHandler()')
    console.log(args)

    if (dataset[args.id]) {

        console.log('end defineStreamHandler()')
        return Promise.resolve({ streams: [dataset[args.id]] });

    } else {

        console.log('end defineStreamHandler()')
        return Promise.resolve({ streams: [] });
    }
})

const METAHUB_URL = "https://images.metahub.space"

const generateMetaPreview = function (value, key) {

    console.log('start generateMetaPreview()')
    // To provide basic meta for our movies for the catalog
    // we'll fetch the poster from Stremio's MetaHub
    // see https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/meta.md#meta-preview-object
    const imdbId = key.split(":")[0]

    console.log('end generateMetaPreview()')

    return {
        id: imdbId,
        type: value.type,
        name: value.name,
        poster: METAHUB_URL + "/poster/medium/" + imdbId + "/img",
        description: 'Sample Description',
        trailers: [{ "source": "5D90SqKzxFc", "type": "Trailer" }],
        genres: ["Thriller", "Horror"],
        imdbRating: '10.0',
        releaseInfo: '2020',
        director: ['Director Hitar Peter'],
        cast: ['Cast Nastradin Hodzja'],
        // links: ['www.abv.bg'],

    }
}

builder.defineCatalogHandler(function (args, cb) {

    console.log('start defineCatalogHandler()')
    // console.log(args)

    // filter the dataset object and only take the requested type
    const metas = Object.entries(dataset)
        .filter(([_, value]) => value.type === args.type)
        .map(([key, value]) => generateMetaPreview(value, key))


    console.log('end defineCatalogHandler()')
    return Promise.resolve({ metas: metas })
})

// utility function to add from magnet
function fromMagnet(name, type, uri) {

    console.log('start fromMagnet()')

    const parsed = magnet.decode(uri);
    const infoHash = parsed.infoHash.toLowerCase();
    const tags = [];
    if (uri.match(/720p/i)) tags.push("720p");
    if (uri.match(/1080p/i)) tags.push("1080p");

    console.log('end fromMagnet()')

    return {
        name: name,
        type: type,
        infoHash: infoHash,
        sources: (parsed.announce || []).map(function (x) { return "tracker:" + x }).concat(["dht:" + infoHash]),
        tag: tags,
        title: tags[0], // show quality in the UI
    }
}

*/


/////////////////////////////////
// EXPORT MODULE
/////////////////////////////////

module.exports = builder.getInterface()


/////////////////////////////////
// TESTING
/////////////////////////////////



