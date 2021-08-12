'use strict'


{
    const genreArr = [
        { genre: '植物', file: 'plant_name.csv' },
        { genre: '国名', file: 'country_name.csv' },
        { genre: '魚', file: 'fish_name.csv' },
        { genre: '鳥', file: 'bird_name.csv' },
        { genre: '魚・鳥以外の生き物', file: 'animal_name.csv' },
        { genre: '外来語', file: 'ForeignToJapanese_name.csv' },
    ];



    function getParam() {
        var url = location.href;
        var parameters = url.split("?")
        var items = parameters[1].split("=")
        var item = items[1];
        return item;
    }

    let quizSet = [];
    let genreNum;

    //CSVファイルから問題文の読み込み
    //CSVファイルを読み込む関数getCSV()の定義
    function getCSV() {
        let readFile;
        let questionGenre = getParam();
        console.log(questionGenre);
        var req = new XMLHttpRequest(); // HTTPでファイルを読み込むためのXMLHttpRrequestオブジェクトを生成

        genreNum = parseInt(questionGenre);
        readFile = genreArr[genreNum - 1].file;

        req.open("get", `csv_files/${readFile}`, true); // アクセスするファイルを指定
        //req.open("get", `csv_files//plant_name_test.csv`, true); // アクセスするファイルを指定
        req.send(null); // HTTPリクエストの発行

        // レスポンスが返ってきたらconvertCSVtoArray()を呼ぶ	
        req.onload = function () {
            convertCSVtoArray(req.responseText); // 渡されるのは読み込んだCSVデータ
        }

    }

    // 読み込んだCSVデータを二次元配列に変換する関数convertCSVtoArray()の定義
    function convertCSVtoArray(str) { // 読み込んだCSVデータが文字列として渡される
        var result = []; // 最終的な二次元配列を入れるための配列
        var tmp = str.split("\n"); // 改行を区切り文字として行を要素とした配列を生成
        //console.log(tmp);
        var quest = [];
        var ans = [];
        var answers = [];

        // var questionItems = tmp[0].

        for (var i = 0; i < tmp.length; i++) {
            //問題文のセット
            var splittmp = tmp[i].split(",");
            quest.push(splittmp[0]);

            answers.push(splittmp[1]);

            // //選択肢のセット
            // var ansArr = splittmp[1].split("/");
            // //console.log(ansArr);
            // ans.push(ansArr);
            // // console.log(quest);
            // // console.log(ans);
        }
        // console.log(answers);
        // console.log(quest);

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
            //console.log(ansArray);

            result.push({ q: quest[i], c: ans[i] });
            // for (var j = 0; j < tmp.length; j++) {
            //     ans[j].push();
            // }
        }

        quizSet = shuffle(result);
        setQuiz();
    }

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



    //HTMLから要素を取得
    const count = document.getElementById('count');
    const question = document.getElementById('question');
    const choices = document.getElementById('choices');
    const btn = document.getElementById('btn');
    const finishBtn = document.getElementById('finishBtn');
    const result = document.getElementById('result');
    const scoreLabel = document.querySelector('#score');
    const twitterLink = document.getElementById('link');
    const startBtn = document.getElementById('startBtn');
    const startDisplay = document.getElementById('startDisplay');
    const timeScore = document.getElementById('timeScore');
    // 問題文＆選択肢のセット
    // ※正解はc配列の一番最初になるように

    //問題数カウント
    let currentNum = 0;
    //回答済み判定
    let isAnswered;
    //スコア
    let score = 0;
    //finish判定
    let isLast;

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

    function checkAnswer(li) {

        //すでに回答済みならチェックしない
        // if (isAnswered === true) {
        if (isAnswered) {
            return;
        }

        //回答済み
        isAnswered = true;

        if (li.textContent === quizSet[currentNum].c[0]) {
            li.classList.add('correct');
            score++;
        } else {
            li.classList.add('wrong');
        }

        //回答後にNextボタンを活性化
        btn.classList.remove('disabled');
    }


    function setQuiz() {
        //未回答
        isAnswered = false;
        //問題文を表示
        question.textContent = quizSet[currentNum].q;

        //現在問題数＆全問数
        count.textContent = `${currentNum + 1}問目　/　${quizSet.length}問中`;

        //前回の問題の選択肢があれば消す
        while (choices.firstChild) {
            choices.removeChild(choices.firstChild);
        }

        const shuffledChoices = shuffle([...quizSet[currentNum].c]);

        //選択肢を表示
        shuffledChoices.forEach(choice => {
            const li = document.createElement('li');
            li.textContent = choice;
            li.addEventListener('click', () => {
                checkAnswer(li);
            });
            choices.appendChild(li);
        });

        //最終問題の場合、NextボタンをShow Scoreボタンにする
        if (currentNum === quizSet.length - 1) {
            btn.textContent = 'Show Score';
        }
    }

    getCSV(); //最初に実行される

    //Finishボタンが押されたらスコア表示
    finishBtn.addEventListener('click', () => {
        scoreLabel.textContent = `成績: ${score} 問正解/ ${currentNum + 1} 問中`;
        twitterLink.setAttribute('href', `https://twitter.com/intent/tweet?text=【難読漢字：${genreArr[genreNum - 1].genre}】%0A${score} 問正解！！/ ${currentNum + 1} 問中%0A&url=http://umintbookpower.com/`);
        result.classList.remove('hidden');
        stopTimer();
        isAnswered = true;
    });

    //Nextボタンが押されたら次の問題に進む
    btn.addEventListener('click', () => {

        //Nextボタンが非活性の場合、次の問題に進まない
        if (btn.classList.contains('disabled')) {
            return;
        }

        //次の問題に進む場合はNextボタンを非活性にする
        btn.classList.add('disabled');

        //最終問題の場合、スコア表示
        if (currentNum === quizSet.length - 1) {
            scoreLabel.textContent = `Score: ${score} 問正解/ ${quizSet.length} 問中`;
            twitterLink.setAttribute('href', `https://twitter.com/intent/tweet?text=【難読漢字：${genreArr[genreNum - 1].genre}】%0A${score} 問正解！！/ ${currentNum + 1} 問中%0A&url=http://umintbookpower.com/`);
            result.classList.remove('hidden');
            isLast = true;
            stopTimer();
        } else {
            currentNum++;
            setQuiz();
        }
    });
    var timer = document.getElementById('timer');
    var start;
    var stop;
    var reset;

    // (function () {
    //     'use strict';

    //htmlのidからデータを取得
    //取得したデータを変数に代入

    //クリック時の時間を保持するための変数定義
    var startTime;

    //経過時刻を更新するための変数。 初めはだから0で初期化
    var elapsedTime = 0;

    //タイマーを止めるにはclearTimeoutを使う必要があり、そのためにはclearTimeoutの引数に渡すためのタイマーのidが必要
    var timerId;

    //タイマーをストップ -> 再開させたら0になってしまうのを避けるための変数。
    var timeToadd = 0;


    //ミリ秒の表示ではなく、分とか秒に直すための関数, 他のところからも呼び出すので別関数として作る
    //計算方法として135200ミリ秒経過したとしてそれを分とか秒に直すと -> 02:15:200
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

        btn.addEventListener('click', function () {
            if (isLast) {
                timeScore.textContent = m + ':' + s + ':' + ms;
            }
        });

    }


    //再帰的に使える用の関数
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

    startBtn.addEventListener('click', function () {
        startDisplay.classList.add('hidden');

        //在時刻を示すDate.nowを代入
        startTime = Date.now();

        //再帰的に使えるように関数を作る
        countUp();
    });

    //stopボタンにクリック時のイベントを追加(タイマーストップイベント)
    function stopTimer() {

        //タイマーを止めるにはclearTimeoutを使う必要があり、そのためにはclearTimeoutの引数に渡すためのタイマーのidが必要
        clearTimeout(timerId);

        //タイマーに表示される時間elapsedTimeが現在時刻かたスタートボタンを押した時刻を引いたものなので、
        //タイマーを再開させたら0になってしまう。elapsedTime = Date.now - startTime
        //それを回避するためには過去のスタート時間からストップ時間までの経過時間を足してあげなければならない。elapsedTime = Date.now - startTime + timeToadd (timeToadd = ストップを押した時刻(Date.now)から直近のスタート時刻(startTime)を引く)
        timeToadd += Date.now() - startTime;
    };

    // //resetボタンにクリック時のイベントを追加(タイマーリセットイベント)
    // reset.addEventListener('click', function () {

    //     //経過時刻を更新するための変数elapsedTimeを0にしてあげつつ、updateTimetTextで0になったタイムを表示。
    //     elapsedTime = 0;

    //     //リセット時に0に初期化したいのでリセットを押した際に0を代入してあげる
    //     timeToadd = 0;

    //     //updateTimetTextで0になったタイムを表示
    //     updateTimetText();

    // });
    // })();
}