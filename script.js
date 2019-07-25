$(function() {
    console.log('jQuery a bien été chargé');

    $('#searchForm').submit(onSubmit);
    $('body').on('click', '.add-to-fav', addToFav);
    $('body').on('click', '.remove-from-fav', removeFromFav);
});



/**
 * Search
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

    query.done(function ({ data: musics }) {
        if (musics.length > 0) {
            const cardHtml = musics.map(renderCard).join('');
            $('#noResult').hide();
            $('#results').show();
            $('#musicList').html(cardHtml);
        } else {
            $('#musicList').html('');
            $('#results').hide();
            $('#noResult').show();
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
 * Favorites
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