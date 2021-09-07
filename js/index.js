'use strict'

function clickedItem(e) {

    const index = e.currentTarget.dataset['index'];
    location.href = '../quiz.html' + '?item=' + (index);

}
