$(function() {
    console.log('jQuery a bien été chargé');

    // Validation du formulaire de recherche
    $('#searchForm').submit(onSubmit);

    // Gérer l'ajout et la suppression de favoris
    $('body').on('click', '.add-to-fav', addToFav);
    $('body').on('click', '.remove-from-fav', removeFromFav);

    // Charger les musiques sur la page favoris
    loadFavorites();

    // Gestion du favori aléatoire sur la homepage
    getRandomFavorite();
    $('#otherRandomMusic').click(getRandomFavorite);

    // Chargement des 25 musiques suivantes dans les résultats de recherche
    $('#displayMore button').click(loadMoreMusics);
});



/**
 * Recherche
 */
function onSubmit (e) {
    e.preventDefault();

    const q = encodeURIComponent($('#q').val());
    const order = $('#order').val();
    searchOnDeezer(q, order);
}

function searchOnDeezer (q, order) {
    const API_URL = 'https://api.deezer.com/search';

    const params = {
        q       : q,
        order   : order,
        output  : 'jsonp'
    };

    const query = $.ajax({
        url         : API_URL,
        data        : params,
        dataType    : 'jsonp'
    });

    query.done(function (musics) {
        if (musics.data.length > 0) {
            const cardHtml = musics.data.map(renderCard).join('');
            $('#noResult').hide();
            $('#results').show();
            $('#musicList').html(cardHtml);
        } else {
            $('#musicList').html('');
            $('#results').hide();
            $('#noResult').show();
        }

        if (musics.next) {
            $('#displayMoreRow').show();
            $('#displayMoreRow').find('button').data('next', musics.next);
        } else {
            $('#displayMoreRow').hide();
        }
    });

    query.fail(function (error) {
        $('#musicList').html(`<div class="col-12">Une erreur est survenue : ${error.statusText}</div>`);
    });
}

function renderCard (music) {
    const id = music.id;

    let html = `
        <div class="col-12 col-md-6 col-lg-4">
            <div class="music-card my-4">
                <img class="music-img" src="${music.album.cover}" alt="lorem ipsum">
                <div class="music-info pl-3">
                    <p class="music-title">${music.title_short}</p>
                    <p class="music-artist">
                        <i class="fas fa-user"></i>
                        ${music.artist.name}
                    </p>
                    <p class="music-album">
                        <i class="fas fa-compact-disc"></i>
                        ${music.album.title}
                    </p>
                </div>
                <audio class="music-player my-3" src="${music.preview}" controls></audio>`;

    if (window.localStorage.getItem(id)) {
        html += `
                <button type="button" class="btn btn-danger remove-from-fav" data-id="${id}">
                    <i class="fas fa-star"></i>
                    Retirer de mes favoris
                </button>`;
    } else {
        html += `
                <button type="button" class="btn btn-danger add-to-fav" data-id="${id}">
                    <i class="far fa-star"></i>
                    Ajouter à mes favoris
                </button>`;
    }

    html += `
            </div>
        </div>
    `;

    return html;
}



/**
 * Gérer les favoris
 */
function addToFav () {
    const id = $(this).data('id');
    window.localStorage.setItem(id, id);

    $(this).removeClass('add-to-fav').addClass('remove-from-fav');
    $(this).html('<i class="fas fa-star"></i> Retirer de mes favoris');
}

function removeFromFav () {
    const id = $(this).data('id');
    window.localStorage.removeItem(id);
    
    $(this).removeClass('remove-from-fav').addClass('add-to-fav');
    $(this).html('<i class="far fa-star"></i> Ajouter à mes favoris');
}



/**
 * Page favoris
 */
function loadFavorites () {
    const favArray = getFavorites();

    if (favArray.length < 1) {
        $('#noFavorite').show();
    }

    favArray.forEach(trackId => {
        getTrackById(trackId, onSuccessFavorites, onErrorFavorites);
    });
}

function getFavorites () {
    const favArray = [];

    for (let i = 0; i < window.localStorage.length; i++){
        favArray.push(localStorage.getItem(localStorage.key(i)));
    }

    return favArray;
}

function getTrackById (id, onSuccess, onError) {
    const API_URL = `https://api.deezer.com/track/${id}`;

    const params = {
        output: 'jsonp'
    };

    const query = $.ajax({
        url         : API_URL,
        data        : params,
        dataType    : 'jsonp'
    });

    query.done(onSuccess);
    query.fail(onError);
}

function onSuccessFavorites (track) {
    const cardHtml = renderCard(track);
    $('#favList').append(cardHtml);
}

function onErrorFavorites (error) {
    $('#favList').html(`<div class="col-12">Une erreur est survenue : ${error.statusText}</div>`);
}



/**
 * Random favori
 */
function getRandomFavorite () {
    const favArray = getFavorites();

    if (favArray.length < 1) {
        $('#randomMusicSection').hide();
    } else {        
        const randomId = favArray[Math.floor(Math.random() * favArray.length)];
        getTrackById(randomId, onSuccesHome, onErrorHome);
    }
}

function onSuccesHome (track) {
    const cardHtml = renderCardHome(track);
    $('#cardHome').html(cardHtml);
}

function onErrorHome (error) {
    $('#cardHome').html(`Une erreur est survenue : ${error.statusText}`);
}

function renderCardHome (music) {
    const id = music.id;

    const html = `
        <img class="music-img" src="${music.album.cover}" alt="lorem ipsum">
        <div class="music-info pl-3">
            <p class="music-title">${music.title_short}</p>
            <p class="music-artist">
                <i class="fas fa-user"></i>
                ${music.artist.name}
            </p>
            <p class="music-album">
                <i class="fas fa-compact-disc"></i>
                ${music.album.title}
            </p>
        </div>
        <audio class="music-player my-3" src="${music.preview}" controls></audio>
        <button type="button" class="btn btn-danger remove-from-fav" data-id="${id}">
            <i class="fas fa-star"></i>
            Retirer de mes favoris
        </button>`;

    return html;
}



/**
 * Afficher plus
 */
function loadMoreMusics () {
    $('#displayMore button').html(`<i class="fas fa-spinner animated-spinner"></i> Afficher plus`);

    const API_URL = $(this).data('next');

    const query = $.ajax({
        url         : API_URL,
        dataType    : 'jsonp'
    });

    query.done(function (musics) {
        const cardHtml = musics.data.map(renderCard).join('');
        $('#musicList').append(cardHtml);

        if (musics.next) {
            $('#displayMore button').html(`<i class="fas fa-plus-circle"></i> Afficher plus`);
            $('#displayMoreRow').find('button').data('next', musics.next);
        } else {
            $('#displayMoreRow').hide();
        }
    });

    query.fail(function (error) {
        $('#musicList').html(`<div class="col-12">Une erreur est survenue : ${error.statusText}</div>`);
    });
}