'use strict'

function clickedItem(e) {

    const index = e.currentTarget.dataset['index'];
    location.href = '../kanjiquiz/quiz.html' + '?item=' + (index);

}
