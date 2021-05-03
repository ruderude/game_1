"use strict"
// 全体で使用する変数を定義
let canvas, ctx;
// FPS管理に使用するパラメータを定義
const FPS = 30;
const MSPF = 1000 / FPS;

// キー状態管理変数の定義
const KEYS = new Array(256);
// キーの状態を false （押されていない）で初期化
for(let i=0; i<KEYS.length; i++) {
    KEYS[i] = false;
}

// 画像を保持する変数を定義
const img_player = document.getElementById('player');
const img_enemy = document.getElementById('enemy');

// プレイヤー座標
let player_x = 0;
let player_y = 0;
// プレイヤー歩く感覚
const walk_span = 20;
let currentTime = 0;
// プレイヤーのヒットポイント
let player_hp;
// プレイヤーの無敵インターバル
// （この値が大きいほど無敵時間が長くなる）
const STAR_INTERVAL = 20;
let player_star_interval = 0;

// 敵の数を定義
let ENEMIES = 1;
// 月（敵）座標
let enemies_x = new Array(ENEMIES);
let enemies_y = new Array(ENEMIES);
// 敵のヒットポイント（配列）を保持する変数を定義し
// ENEMIES分だけ要素数を持つ配列を代入
let enemies_hp = new Array(ENEMIES);

// メインループを定義
const mainloop = function() {
    // 処理開始時間を保存
    const startTime = new Date();

    // プレイヤーの移動処理
    movePlayer();
    // 敵キャラの移動処理
    moveEnemies();

    // プレイヤーと敵キャラの当たり判定（プレイヤーが生きている場合）
    if(player_hp > 0 && player_star_interval == 0) {
        for(let i=0; i<ENEMIES; i++) {
            // 敵が生きている場合のみ判定する
            if(enemies_hp[i] > 0) {
                if(hitCheck(player_x, player_y, img_player,
                            enemies_x[i], enemies_y[i], img_enemy)){
                    // 当たっているのでお互いのHPを1削る
                    player_hp -= 5;
                    enemies_hp[i] -= 0;
                    // プレイヤーを無敵状態にする
                    player_star_interval = STAR_INTERVAL;
                }
            }
        }
    }

    // プレイヤーの無敵インターバルを減少させる
    if(player_star_interval > 0) {
        player_star_interval--;
    }

    // 描画処理
    redraw();

    // 処理経過時間および次のループまでの間隔を計算
    currentTime++
    const deltaTime = (new Date()) - startTime;
    const interval = MSPF - deltaTime;
    // console.log(currentTime)

    if(interval > 0) {
        // 処理が早すぎるので次のループまで少し待つ
        setTimeout(mainloop, interval);
    } else {
        // 処理が遅すぎるので即次のループを実行する
        mainloop();
    }
};

// キーが押された時に呼び出される処理を指定
window.onkeydown = function(e) {
    // キーを押された状態に更新
    KEYS[e.keyCode] = true;
    console.log(e)
}
// キーが離された時に呼び出される処理を指定
window.onkeyup = function(e) {
    // キーを離された状態に更新
    KEYS[e.keyCode] = false;
    console.log(e)
}

// ページロード時に呼び出される処理を指定
window.onload = function() {
    // コンテキストを取得（おまじない）
    canvas = document.getElementById('screen');
    ctx = canvas.getContext('2d');

    // Playerの初期位置を指定
    // player_x = キャンバスの左右中央
    // player_y = キャンバスの下から20px上
    player_x = (canvas.width - 128) / 2;
    player_y = (canvas.height - 128) - 10;
    player_hp = 10;

    // 敵キャラの初期位置を指定
    for(let i=0; i<ENEMIES; i++) {
        enemies_x[i] = Math.random() * (canvas.width - img_enemy.width);
        enemies_y[i] = Math.random() * (canvas.height - img_enemy.height);
        enemies_hp[i] = 2;
    }

    // メインループを開始する
    mainloop();

};

// 再描画する関数（無引数、無戻り値）
const redraw = function() {
    // キャンバスをクリアする
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 生きている場合だけ新しい位置にプレイヤーを描画
    // プレイヤー歩くアニメ
    if (player_hp > 0 && (currentTime % 30) > 15) {
        ctx.drawImage(img_player, 0, 0, 128, 128, player_x, player_y, 128, 128)
    } else if(player_hp > 0) {
        ctx.drawImage(img_player, 128, 0, 128, 128, player_x, player_y, 128, 128)
    } else if (player_hp <= 0 && (currentTime % 30) > 15) {
        ctx.drawImage(img_player, 128 * 2, 128, 128, 128, player_x, player_y, 128, 128)
    } else if (player_hp <= 0){
        ctx.drawImage(img_player, 128 * 3, 128, 128, 128, player_x, player_y, 128, 128)
    }

    // 敵キャラの画像を (enemies_x[i], enemies_y[i]) の位置に表示
    for(let i=0; i<ENEMIES; i++) {
        // 生きている場合だけ描画
        if (enemies_hp[i] > 0) {
            ctx.drawImage(img_enemy, enemies_x[i], enemies_y[i]);
        }
    }


};

// プレイヤーの移動処理を定義
const movePlayer = function () {
    // ヒットポイントを確認し、生きている場合のみ処理をする
    if(player_hp <= 0) {
        return;
    }
    // 上下左右の移動速度を定義
    const SPEED = 8;

    // キー番号だとわかりにくいため予め変数に格納
    const RIGHT = 39;
    const LEFT  = 37;
    const SPACE = 32;
    console.log(img_player.width)
    console.log(player_x)

    if(KEYS[RIGHT]) {
        // プレイヤーのx座標を少し増やす
        player_x += SPEED;
    }
    if(KEYS[LEFT] && player_x > 0) {
        // プレイヤーのx座標を少し減らす
        player_x -= SPEED;
    }
    // プレイヤーがはみ出てしまった場合は強制的に中に戻す
    if(player_x < 0) {
        player_x = 0;
    } else if (player_x + 128 > canvas.width) {
        player_x = canvas.width - 128;
    }

};

// 敵キャラの移動処理を定義
const moveEnemies = function() {
    // 上下左右の移動速度を定義
    const SPEED = 8;

    // 各敵ごとに処理を行う
    for (let i = 0; i < ENEMIES; i++) {
        // 敵キャラのy座標を少し増やす
        enemies_y[i] += SPEED;

        // 敵キャラが下画面にはみ出た場合は上に戻す
        if (enemies_y[i] > canvas.height) {
            enemies_y[i] = -img_enemy.height;
            // せっかくなので x座標を再度ランダムに設定
            enemies_x[i] = Math.random() * (canvas.width - img_enemy.width);
        }
    }
};

const hitCheck = function(x1, y1, obj1, x2, y2, obj2) {
    let cx1, cy1, cx2, cy2, r1, r2, d;
    // 中心座標の取得
    cx1 = x1 + 64;
    cy1 = y1 + 64;
    cx2 = x2 + obj2.width/2;
    cy2 = y2 + obj2.height/2;
    // 半径の計算
    r1 = (64+64)/4;
    r2 = (obj2.width+obj2.height)/4;
    // 中心座標同士の距離の測定
    // Math.sqrt(d) -- dのルートを返す
    // Math.pow(x, a) -- xのa乗を返す
    d = Math.sqrt(Math.pow(cx1-cx2, 2) + Math.pow(cy1-cy2, 2));
    // 当たっているか判定
    // ちなみに `return r1+r2 > d;` とだけ書いてもOK
    if(r1 + r2 > d) {
        // 当たってる
        return true;
    } else {
        // 当たっていない
        return false;
    }
};
