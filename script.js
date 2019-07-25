$(function() {
    console.log('jQuery a bien été chargé');

    $('#searchForm').submit(onSubmit);
});

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

    query.done(onSuccess);
    query.fail(onError);
}

function onSuccess ({ data: musics }) {
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
}

function onError (error) {
    console.log(error);
}

function renderCard (music) {
    return `
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
                <audio class="music-player my-3" src="${music.preview}" controls></audio>
                <button type="button" class="btn btn-danger">
                    <i class="fas fa-star"></i>
                    Retirer de mes favoris
                </button>
            </div>
        </div>
    `;
}