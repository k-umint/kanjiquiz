'use strict'
{

    //get element
    const count = document.getElementById('count');
    const question = document.getElementById('question');
    const choices = document.getElementById('choices');
    const nextbtn = document.getElementById('nextbtn');
    const result = document.getElementById('result');
    const scoreLabel = document.querySelector('#score');
    const twitterLink = document.getElementById('link');
    const startBtn = document.getElementById('startBtn');
    const startDisplay = document.getElementById('startDisplay');
    const timeScore = document.getElementById('timeScore');
    const quiz = document.getElementById('quiz');
    const timer = document.getElementById('timer');


    //クイズのジャンル
    const genreArr = [
        { genre: '植物', file: 'plant_name.csv' },
        { genre: '国名', file: 'country_name.csv' },
        { genre: '魚類', file: 'fish_name.csv' },
        { genre: '鳥類', file: 'bird_name.csv' },
        { genre: '動物', file: 'animal_name.csv' },
        { genre: '外来語', file: 'ForeignToJapanese_name.csv' },
    ];

    // パラメータから値を取得
    function getParam() {
        var url = location.href;
        var parameters = url.split("?")
        var items = parameters[1].split("=")
        var item = items[1];
        return item;
    }

    // ジャンル名を表示
    let genreName = document.createTextNode(genreArr[getParam() - 1].genre);
    let addChild = document.createElement("h1");
    addChild.appendChild(genreName);
    startDisplay.prepend(addChild);

    let quizSet = [];
    let genreNum;
    let currentNum = 0;
    let isAnswered;
    let score = 0;
    let isLast;

    //クリック時の時間を保持するための変数定義
    var startTime;

    //経過時刻を更新するための変数。 初めはだから0で初期化
    var elapsedTime = 0;

    //タイマーを止めるにはclearTimeoutを使う必要があり、そのためにはclearTimeoutの引数に渡すためのタイマーのidが必要
    var timerId;

    //タイマーをストップ -> 再開させたら0になってしまうのを避けるための変数。
    var timeToadd = 0;


    getCSV(); //最初に実行される


    //==============================================================================================
    // CSVファイルから問題を読みこむ
    //==============================================================================================
    function getCSV() {
        let readFile;
        let questionGenre = getParam();
        var req = new XMLHttpRequest();

        genreNum = parseInt(questionGenre);
        readFile = genreArr[genreNum - 1].file;

        // アクセスするファイルを指定
        req.open("get", `csv_files/${readFile}`, true);

        // HTTPリクエストの発行
        req.send(null);

        // レスポンスが返ってきたらconvertCSVtoArray()を呼ぶ	
        req.onload = function () {
            // 渡されるのは読み込んだCSVデータ
            convertCSVtoArray(req.responseText);
        }
    }

    //==============================================================================================
    // 読み込んだCSVデータを二次元配列に変換する関数convertCSVtoArray()の定義
    //==============================================================================================
    function convertCSVtoArray(str) {
        var result = [];
        var tmp = str.split("\n");
        var quest = [];
        var ans = [];
        var answers = [];

        for (var i = 0; i < tmp.length; i++) {
            //問題文のセット
            var splittmp = tmp[i].split(",");
            quest.push(splittmp[0]);

            answers.push(splittmp[1]);
        }

        // 各行ごとにカンマで区切った文字列を要素とした二次元配列を生成
        for (var i = 0; i < tmp.length; i++) {
            var ansArray = [];
            ansArray.push(answers[i]);

            let randomItem;

            for (var j = 0; j < 3; j++) {

                do {
                    randomItem = answers[Math.floor(Math.random() * answers.length)];
                } while (IsArrayExists(ansArray, randomItem));

                ansArray.push(randomItem);
            }
            ans.push(ansArray);

            result.push({ q: quest[i], c: ans[i] });
        }

        quizSet = shuffle(result);
        setQuiz();
    }


    //==============================================================================================
    // 配列の中に指定の値があるかチェック
    //==============================================================================================
    function IsArrayExists(array, value) {
        // 配列の最後までループ
        for (var i = 0, len = array.length; i < len; i++) {
            if (value == array[i]) {
                // 存在したらtrueを返す
                return true;
            }
        }
        // 存在しない場合falseを返す
        return false;
    }


    //==============================================================================================
    // 配列のランダム並び替え
    //==============================================================================================
    function shuffle(arr) {

        //ランダム並び替えする範囲の終点位置
        for (let i = arr.length - 1; i > 0; i--) {
            //ランダム並び替えする対象位置
            let j = Math.floor(Math.random() * (i + 1));
            //分割代入
            [arr[j], arr[i]] = [arr[i], arr[j]]
        }
        return arr;
    }


    //==============================================================================================
    // 回答の正誤チェック
    //==============================================================================================
    function checkAnswer(li) {

        if (isAnswered) {
            return;
        }

        //回答済み
        isAnswered = true;

        if (li.textContent === quizSet[currentNum].c[0]) {
            li.classList.add('correct');

            let circle = document.createElement('div')
            circle.setAttribute('id', 'circle');
            quiz.appendChild(circle)

            score++;
        } else {
            li.classList.add('wrong');

            let cross = document.createElement('div');
            let span = document.createElement('span');
            cross.appendChild(span);
            cross.setAttribute('id', 'cross');
            quiz.appendChild(cross);

            timeToadd += 3000;

        }

        let choiceLi = document.getElementsByClassName('choices-li');

        for (const item of choiceLi) {

            if (item.textContent === quizSet[currentNum].c[0]) {
                item.classList.add('correct');
            }

            if (!item.classList.contains('correct') && !item.classList.contains('wrong')) {
                item.classList.add('no-selected');
            }
        }

        //回答後にNextボタンを活性化
        nextbtn.classList.remove('disabled');
    }


    //==============================================================================================
    // 選択肢の設置
    //==============================================================================================
    function setQuiz() {
        //未回答
        isAnswered = false;
        //問題文を表示
        let answerText = quizSet[currentNum].q;

        //問題が６文字以上なら"・"で分割して最初のものだけ表示
        if (answerText.length > 5) {
            let subStrAns = quizSet[currentNum].q.split("・");
            answerText = subStrAns[0];
        }

        question.textContent = answerText;

        //現在問題数＆全問数
        count.textContent = `${currentNum + 1}問目 / ${quizSet.length}問中`;

        //前回の問題の選択肢があれば消す
        while (choices.firstChild) {
            choices.removeChild(choices.firstChild);
        }

        const shuffledChoices = shuffle([...quizSet[currentNum].c]);

        //選択肢を表示
        shuffledChoices.forEach(choice => {
            const li = document.createElement('li');
            li.textContent = choice;
            li.classList.add('choices-li');
            li.addEventListener('click', () => {
                checkAnswer(li);
            });

            choices.appendChild(li);

        });

        //最終問題の場合、NextボタンをShow Scoreボタンにする
        if (currentNum === quizSet.length - 1) {
            nextbtn.textContent = 'Show Score';

        }
    }


    //==============================================================================================
    //Nextボタンが押されたら次の問題に進む
    //==============================================================================================
    nextbtn.addEventListener('click', () => {

        //Nextボタンが非活性の場合、次の問題に進まない
        if (nextbtn.classList.contains('disabled')) {
            return;
        }

        if (document.getElementById("circle") != null) {
            var elem = document.getElementById('circle');
            elem.remove();
        }
        if (document.getElementById("cross") != null) {
            var elem = document.getElementById('cross');
            elem.remove();
        }

        //次の問題に進む場合はNextボタンを非活性にする
        nextbtn.classList.add('disabled');

        //最終問題の場合、スコア表示
        if (currentNum === quizSet.length - 1) {

            let nlCode = '%0A'
            let tweetAppendix = '【難読漢字タイムアタック】';
            let genreText = `ジャンル：${genreArr[genreNum - 1].genre}`;
            let timeText = `タイム  ${timer.textContent}`;
            let correctText = `${score} 問正解/ ${currentNum + 1} 問中`;

            twitterLink.setAttribute('href', 'https://twitter.com/intent/tweet?text='
                + tweetAppendix + nlCode
                + genreText + nlCode
                + timeText + nlCode
                + correctText + nlCode
                + '&url=https://www.google.com/');

            scoreLabel.textContent = correctText;

            result.classList.remove('hidden');
            quiz.classList.add('hidden');
            isLast = true;
        } else {
            currentNum++;
            setQuiz();
        }
    });

    //==============================================================================================
    //ミリ秒の表示ではなく、分とか秒に直すための関数, 他のところからも呼び出すので別関数として作る
    //==============================================================================================
    function updateTimetText() {

        //m(分) = 135200 / 60000ミリ秒で割った数の商　-> 2分
        var m = Math.floor(elapsedTime / 60000);

        //s(秒) = 135200 % 60000ミリ秒で / 1000 (ミリ秒なので1000で割ってやる) -> 15秒
        var s = Math.floor(elapsedTime % 60000 / 1000);

        //ms(ミリ秒) = 135200ミリ秒を % 1000ミリ秒で割った数の余り
        var ms = elapsedTime % 1000;


        //HTML 上で表示の際の桁数を固定する　例）3 => 03　、 12 -> 012
        //javascriptでは文字列数列を連結すると文字列になる
        //文字列の末尾2桁を表示したいのでsliceで負の値(-2)引数で渡してやる。
        m = ('0' + m).slice(-2);
        s = ('0' + s).slice(-2);
        ms = ('0' + ms).slice(-3);

        //HTMLのid　timer部分に表示させる　
        timer.textContent = m + ':' + s + ':' + ms;

        nextbtn.addEventListener('click', function () {
            if (isLast) {
                timeScore.textContent = 'タイム\t' + m + ':' + s + ':' + ms;
            }
        });

    }


    //==============================================================================================
    //再帰的に使える用の関数
    //==============================================================================================
    function countUp() {

        //timerId変数はsetTimeoutの返り値になるので代入する
        timerId = setTimeout(function () {

            //経過時刻は現在時刻をミリ秒で示すDate.now()からstartを押した時の時刻(startTime)を引く
            elapsedTime = Date.now() - startTime + timeToadd;
            updateTimetText()

            //countUp関数自身を呼ぶことで10ミリ秒毎に以下の計算を始める
            countUp();

            //1秒以下の時間を表示するために10ミリ秒後に始めるよう宣言
        }, 10);
    }


    //==============================================================================================
    //Startボタンが押されたら起こるイベント
    //==============================================================================================
    startBtn.addEventListener('click', function () {
        startDisplay.classList.add('hidden');
        quiz.classList.remove('hidden');

        //在時刻を示すDate.nowを代入
        startTime = Date.now();

        //再帰的に使えるように関数を作る
        countUp();
    });


    //==============================================================================================
    //stopボタンにクリック時のイベントを追加(タイマーストップイベント)
    //==============================================================================================
    function stopTimer() {

        //タイマーを止めるにはclearTimeoutを使う必要があり、そのためにはclearTimeoutの引数に渡すためのタイマーのidが必要
        // clearTimeout(timerId);

        //タイマーに表示される時間elapsedTimeが現在時刻かたスタートボタンを押した時刻を引いたものなので、
        //タイマーを再開させたら0になってしまう。elapsedTime = Date.now - startTime
        //それを回避するためには過去のスタート時間からストップ時間までの経過時間を足してあげなければならない。elapsedTime = Date.now - startTime + timeToadd (timeToadd = ストップを押した時刻(Date.now)から直近のスタート時刻(startTime)を引く)
        timeToadd += Date.now() - startTime;
    };

}