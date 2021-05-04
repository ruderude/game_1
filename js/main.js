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
const img_player_bullet = document.getElementById('tama');
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


// 発射インターバルの値を定義（この値が大きいほど連射が遅くなる）
const FIRE_INTERVAL = 10;
// 弾の数を定義（同時に描画される弾の最大数より大きい必要あり）
const BULLETS = 5;
// プレイヤーの発射インターバル
let player_fire_interval = 0;


// 弾の設定
let player_bullets_x = new Array(BULLETS);
let player_bullets_y = new Array(BULLETS);
let player_bullets_hp = new Array(BULLETS);

// 敵の数を定義
let ENEMIES = 3;
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
    // プレイヤーの弾の移動処理
    movePlayerBullets();
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
                    player_hp -= 10;
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

    // プレイヤー弾と敵キャラの当たり判定（プレイヤーが生きている場合）
    if(player_hp > 0) {
        for(let i=0; i<ENEMIES; i++) {
            // 敵が死んでいる場合はスルーする
            if(enemies_hp[i] <= 0) {
                continue;
            }
            for(let j=0; j<BULLETS; j++) {
                // 弾が死んでいる場合はスルーする
                if(player_bullets_hp[j] <= 0) {
                    continue;
                }
                if(hitCheck(player_bullets_x[j],
                            player_bullets_y[j],
                            img_player_bullet,
                            enemies_x[i],
                            enemies_y[i],
                            img_enemy)){
                    // 当たっているのでお互いのHPを1削る
                    player_bullets_hp[j] -= 1;
                    enemies_hp[i] -=1;
                }
            }
        }
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
    // console.log(e)
}
// キーが離された時に呼び出される処理を指定
window.onkeyup = function(e) {
    // キーを離された状態に更新
    KEYS[e.keyCode] = false;
    // console.log(e)
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

    // 弾の初期位置およびHPを指定
    for(let i=0; i<BULLETS; i++) {
        player_bullets_x[i] = 0;
        player_bullets_y[i] = 0;
        player_bullets_hp[i] = 0;
    }

    // 敵キャラの初期位置を指定
    for(let i=0; i<ENEMIES; i++) {
        enemies_x[i] = Math.random() * (canvas.width - img_enemy.width);
        // enemies_y[i] = Math.random() * (canvas.height - img_enemy.height);
        enemies_y[i] = 0;
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

    // 弾の画像を (bullets_x[i], bullets_y[i]) の位置に表示
    for(let i=0; i<BULLETS; i++) {
        // 生きている場合だけ描画
        if(player_bullets_hp[i] > 0) {
            ctx.drawImage(img_player_bullet,
                        player_bullets_x[i],
                        player_bullets_y[i]);
        }
    }

    // 敵キャラの画像を (enemies_x[i], enemies_y[i]) の位置に表示
    let killed = 3;
    for(let i=0; i<ENEMIES; i++) {
        // 生きている場合だけ描画
        if (enemies_hp[i] > 0) {
            killed--;
            ctx.drawImage(img_enemy, enemies_x[i], enemies_y[i]);
        }
    }

    // コンテキストの状態を保存（fillStyleを変えたりするので）
    ctx.save();
    // HPの最大値（10）x 5 の短形を描画（白）
    // ctx.fillStyle = '#fff';
    // ctx.fillRect(10, canvas.height-10, 10 * 5, 5);
    // // 残りHP x 5 の短形を描画（赤）
    // ctx.fillStyle = '#f00';
    // ctx.fillRect(10, canvas.height - 10, player_hp * 5, 5);
    // 「倒した敵の数/全敵の数」という文字列を作成
    var text = "Killed: " + killed + "/" + ENEMIES;
    // 文字列の（描画）横幅を計算する
    var width = ctx.measureText(text).width;
    // 文字列を描画（白）
    ctx.fillStyle = '#fff';
    ctx.fillText(text,
                canvas.width - 10 - width,
                canvas.height - 10);

    // プレイヤーが死んでいた場合ゲームオーバー画面を表示する
    if(player_hp <= 0){
        // 全体を半透明の黒い四角で覆う（オーバーレイ）
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;

        // 真ん中に大きな文字でゲームオーバー（赤）と表示する
        ctx.font = '20px sans-serif';
        ctx.textBaseline = 'middle';    // 上下位置のベースラインを中心に
        ctx.fillStyle = '#f00';
        text = "Game Over";
        width = ctx.measureText(text).width;
        ctx.fillText(text,
                    (canvas.width - width) / 2,
                    canvas.height / 2);
    } else if (killed == ENEMIES){
        // 全体を半透明の黒い四角で覆う（オーバーレイ）
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;

        // 真ん中に大きな文字でゲームクリア（白）と表示する
        ctx.font = '20px sans-serif';
        ctx.textBaseline = 'middle';    // 上下位置のベースラインを中心に
        ctx.fillStyle = '#fff';
        text = "Game Clear";
        width = ctx.measureText(text).width;
        ctx.fillText(text,
                    (canvas.width - width) / 2,
                    canvas.height / 2);
    }

    // コンテキストの状態を復元
    ctx.restore();


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
    // console.log(img_player.width)
    // console.log(player_x)

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

    // スペースキーが押され、なおかつ発射インターバルが0の時だけ発射する
    if(KEYS[SPACE] && player_fire_interval == 0) {
        // 未使用の弾があれば発射する
        for(let i=0; i<BULLETS; i++) {
            if(player_bullets_hp[i] == 0) {
                // 弾の初期位置はプレイヤーと同じ位置にする
                player_bullets_x[i] = player_x + 60;
                player_bullets_y[i] = player_y;
                // 弾のHPを1にする。これにより次のループから描画や移動処理
                // が行われるようになる
                player_bullets_hp[i] = 1;
                // 弾を打ったので発射インターバルの値を上げる
                player_fire_interval = FIRE_INTERVAL;
                // 弾は打ったのでループを抜ける
                // ループ処理を途中でやめる場合は `break` を使う
                break;
            }
        }
    }

    // 発射インターバルの値が0より大きい場合は値を減らす。
    if(player_fire_interval > 0) {
        player_fire_interval--;
    }

};

// プレイヤーの弾の移動処理を定義
const movePlayerBullets = function() {
    // 上下左右の移動速度を定義
    const SPEED = -10;

    // 各弾ごとに処理を行う
    for(let i=0; i<BULLETS; i++) {
        // ヒットポイントを確認し、生きている場合のみ処理をする
        if(player_bullets_hp[i] <= 0) {
            // ループの残りのステップを無視して次のループに行く場合
            // は `continue` を指定する
            continue;
        }

        // 弾のy座標を少し増やす（減らす）
        player_bullets_y[i] += SPEED;

        // 弾が上画面にはみ出た場合はHPを0にして未使用状態に戻す
        if (player_bullets_y[i] <= 0) {
            player_bullets_hp[i] = 0;
        }
    }
};

// 敵キャラの移動処理を定義
const moveEnemies = function() {
    // 上下左右の移動速度を定義
    const SPEED = 6;

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
