const { addonBuilder } = require("stremio-addon-sdk");

const manifest = {
    "id": "community.helloworld",
    "version": "0.0.1",
    "catalogs": [
        {
            "type": "movie",
            "id": "top"
        }
    ],
    "resources": [
        "catalog",
        {
            "name": "meta",
            "types": ["movie"],
            "idPrefixes": ["hiwrld_"]
        }
    ],
    "types": [
        "movie",
        "series"
    ],
    "name": "he",
    "description": "f"
}

const builder = new addonBuilder(manifest);

// Populate the catalog from somewhere
function getMoviesCatalog(catalogName) {
    let catalog;

    switch(catalogName) {
        case "top":
            catalog = [
                {
                    id: "tt1254207",
                    type: "movie",
                    name: "The Big Buck Bunny",
                    poster: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Big_buck_bunny_poster_big.jpg/220px-Big_buck_bunny_poster_big.jpg",
                    genres: [ "Animation", "Short", "Comedy" ]
                },
                {
                    id: "hiwrld_jellyfish",
                    type: "movie",
                    name: "Jellyfish",
                    poster: "https://images.unsplash.com/photo-1496108493338-3b30de66f9be",
                    genres: ["Demo", "Nature"]
                },
            ]
            break
        default:
            catalog = []
            break
    }

    return Promise.resolve(catalog)
}

// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineCatalogHandler.md
builder.defineCatalogHandler(({type, id}) => {
    let results;

    switch(type) {
        case "movie":
            results = getMoviesCatalog(id)
            break
       default:
            results = Promise.resolve( [] )
            break
    }

    return results.then(items => ({
        metas: items
    }))
})

function getMovieMeta(id) {
    const metas = {
        hiwrld_jellyfish: {
            id: "hiwrld_jellyfish",
            type: "movie",
            name: "Jellyfish",
            poster: "https://images.unsplash.com/photo-1496108493338-3b30de66f9be",
            genres: ["Demo", "Nature"],
            description: "A .mkv video clip useful for testing the network streaming and playback performance of media streamers & HTPCs.",
            cast: ["Some random jellyfishes"],
            director: ["ScottAllyn"],
            logo: "https://b.kisscc0.com/20180705/yee/kisscc0-art-forms-in-nature-jellyfish-recapitulation-theor-jellyfish-5b3dcabcb00692.802484341530776252721.png",
            background: "https://images.unsplash.com/photo-1461783470466-185038239ee3",
            runtime: "30 sec"
        },
    }
    // return Promise.resolve(metas[id] || null)
    return metas[id]
}

builder.defineMetaHandler(({type, id}) => {
    // Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineMetaHandler.md
    // let results;

    // switch(type) {
    //     case 'movie':
    //         results = getMovieMeta(id)
    //         break
    //    default:
    //         results = null
    //         break
    // }
    // return Promise.resolve({ meta: results })


    return Promise.resolve({ meta: {
        id: "hiwrld_jellyfish",
        type: "movie",
        name: "Jellyfish",
        poster: "https://images.unsplash.com/photo-1496108493338-3b30de66f9be",
        genres: ["Demo", "Nature"],
        description: "A .mkv video clip useful for testing the network streaming and playback performance of media streamers & HTPCs.",
        cast: ["Some random jellyfishes"],
        director: ["ScottAllyn"],
        logo: "https://b.kisscc0.com/20180705/yee/kisscc0-art-forms-in-nature-jellyfish-recapitulation-theor-jellyfish-5b3dcabcb00692.802484341530776252721.png",
        background: "https://images.unsplash.com/photo-1461783470466-185038239ee3",
        runtime: "30 sec"
    }})
})


module.exports = builder.getInterface()