'use strict'

{
    const linkToQuiz = document.getElementById('linkToQuiz');

    linkToQuiz.addEventListener('click', function () {
        var items = document.getElementsByName('genre');
        console.log(items);
        for (let i = 0; i < items.length; i++) {
            if (items[i].checked) {
                location.href = '../quiz.html' + '?item=' + (i + 1)
            }
        }
    });
}