"use strict"
// 全体で使用する変数を定義
const canvas = document.getElementById('screen')
const ctx = canvas.getContext('2d')

const MAX_WIDTH = 600
const MAX_HEIGHT = 600

const SPACE = 32
const ENTER = 13

const ENMIES_COUNTS = 5
const BULLET_COUNTS = 5

// プレイヤーの無敵インターバル
// （この値が大きいほど無敵時間が長くなる）
const STAR_INTERVAL = 50
let player_star_interval = 0
// 発射インターバルの値を定義（この値が大きいほど連射が遅くなる）
const FIRE_INTERVAL = 10;
// 画面上に描画できる弾丸数
const BULLETS = 5
// プレイヤーの発射インターバル
let player_fire_interval = 0

// キーが押された時に呼び出される処理を指定
window.onkeydown = function (e) {
    if (e.keyCode === SPACE) { player.shot() }
    if (e.keyCode === ENTER) { drug.drop() }
    player.move(e.key)
}

class Player {
    constructor() {
        this.IMAGE = document.getElementById('player')
        this.IMAGE2 = document.getElementById('player2')
        this.x = 0
        this.y = 220
        this.hp = 10
        this.bullets_hp = new Array(BULLETS)
        this.SPEED = 8
        this.count = 0
    }

    draw() {
        this.count += 0.05
        if (this.hp > 0) {
            let f = Math.floor(this.count) % 2
            ctx.drawImage(this.IMAGE, 128 * f, 0, 128, 128, this.x, this.y, 128, 128)
        } else {
            let f = (Math.floor(this.count) % 2) + 2
            ctx.drawImage(this.IMAGE, 128 * f, 128, 128, 128, this.x, this.y, 128, 128)
        }
    }

    move(key) {
        if (this.hp > 0) {
            if (key === "ArrowRight") {
                this.x += this.SPEED
            } else if (key === "ArrowLeft") {
                this.x -= this.SPEED
            }
            else if (key === "ArrowUp") {
                this.y -= this.SPEED
            }
            else if (key === "ArrowDown") {
                this.y += this.SPEED
            }

            // プレイヤーがはみ出てしまった場合は強制的に中に戻す
            if (this.x < 0) {
                this.x = 0
            } else if (this.x + 128 > canvas.width) {
                this.x = canvas.width - 128
            } else if (this.y < 0) {
                this.y = 0
            } else if (this.y + 128 > canvas.height) {
                this.y = canvas.height - 128
            }
        }
    }

    shot() {
        // 未使用の弾があれば発射する
        if (this.hp > 0 && player_fire_interval <= 0) {
            for (let i = 0; i < BULLET_COUNTS; i++) {
                if(bullets[i].hp == 0) {
                    // 弾の初期位置はプレイヤーと同じ位置にする
                    bullets[i].x = player.x + 100
                    bullets[i].y = player.y + 60
                    // 弾のHPを2にする。これにより次のループから描画や移動処理
                    // が行われるようになる
                    bullets[i].hp = 2
                    player_fire_interval = FIRE_INTERVAL
                    break;
                }
            }
        }
    }
}

class Bullet {
    constructor() {
        this.IMAGE = document.getElementById('tama');
        this.x = 0
        this.y = 0
        this.speed = 10
        this.hp = 0
    }

    draw() {
        if (this.hp > 0) {
            ctx.drawImage(this.IMAGE, this.x, this.y)
            this.move()
        }
        
    }

    move() {
        this.x += this.speed
        if (this.x > MAX_WIDTH) {
            this.hp = 0
        }
    }

}

class Drug {
    constructor() {
        this.IMAGE = document.getElementById('drug')
        this.x = MAX_WIDTH
        this.y = 0
        this.speed = 8
        this.hp = 0
        this.count = 1
    }

    draw() {
        if (this.hp > 0) {
            ctx.drawImage(this.IMAGE, this.x, this.y)
            this.move()
        }
        
    }

    move() {
        this.x -= this.speed
        if (this.x < -this.IMAGE.width) {
            this.x = MAX_WIDTH + this.IMAGE.height
            this.y = Math.floor( Math.random() * (MAX_HEIGHT + 1 - 0) ) + 0
        }
    }

    drop() {
        if (this.count > 0) {
            this.x = MAX_WIDTH + this.IMAGE.height
            this.y = Math.floor( Math.random() * (MAX_HEIGHT + 1 - 0) ) + 0
            this.hp = 2
            this.count = 0
        }
    }

}

class Enemie {
    constructor() {
        this.IMAGE = document.getElementById('enemy')
        this.x = MAX_WIDTH
        this.y = Math.floor( Math.random() * (MAX_WIDTH + 1 - 0) ) + 0
        this.speed = Math.floor( Math.random() * (10 + 1 - 3) ) + 3
        this.hp = 2
    }

    draw() {
        if (this.hp > 0) {
            ctx.drawImage(this.IMAGE, this.x, this.y)
            this.move()
        }
        
    }

    move() {
        this.x -= this.speed
        if (this.x < -this.IMAGE.width) {
            this.y = Math.floor( Math.random() * (MAX_WIDTH + 1 - 0) ) + 0
            this.x = MAX_WIDTH
        }
    }

}

function mainloop() {
    requestAnimationFrame(mainloop)
    ctx.clearRect(0, 0, 600, 600)
    // プレイヤー無敵状態の点滅をココに書いたが最適か？
    if(player_star_interval % 2 != 0 || player.hp <= 0) {
        // 半透明に描画する
        ctx.globalAlpha = 0.5
    } else {
        ctx.globalAlpha = 1
    }
    player.draw()
    ctx.globalAlpha = 1
    drug.draw()
    for (let i = 0; i < BULLET_COUNTS; i++) {
        bullets[i].draw()
    }
    for (let i = 0; i < ENMIES_COUNTS; i++) {
        enemies[i].draw()
    }

    // プレイヤーと敵キャラの当たり判定（プレイヤーが生きている場合）
    if (player.hp > 0 && player_star_interval <= 0) {
        for (let i = 0; i < ENMIES_COUNTS; i++) {
            // 敵が生きている場合のみ判定する
            if (enemies[i].hp > 0) {
                if (hitCheck(player.x, player.y, player.IMAGE2,
                    enemies[i].x, enemies[i].y, enemies[i].IMAGE)) {
                    // 当たっているのでお互いのHPを1削る
                    player.hp -= 2
                    enemies[i].hp -= 0
                    // プレイヤーを無敵状態にする
                    player_star_interval = STAR_INTERVAL
                }
            }
        }
    }

    // プレイヤー弾と敵キャラの当たり判定
    for(let i=0; i<ENMIES_COUNTS; i++) {
        // 敵が死んでいる場合はスルーする
        if(enemies[i].hp <= 0) {
            continue;
        }
        for(let j=0; j<BULLET_COUNTS; j++) {
            // 弾が死んでいる場合はスルーする
            if(bullets[j].hp <= 0) {
                continue;
            }
            if(hitCheck(bullets[j].x,bullets[j].y,bullets[j].IMAGE,
                        enemies[i].x,enemies[i].y,enemies[i].IMAGE)){
                // 当たっているのでお互いのHPを1削る
                bullets[j].hp -= 2
                enemies[i].hp -= 1
                if (enemies[i].hp <= 0) {
                    killed++
                }
            }
        }
    }

    // プレイヤーの無敵インターバルを減少させる
    if(player_star_interval > 0) {
        player_star_interval--
    }
    // 発射インターバルを減少させる
    if(player_fire_interval > 0) {
        player_fire_interval--
    }

    // プレイヤーと回復アイテムの当たり判定（プレイヤーが生きている場合）
    if (player.hp > 0 && drug.hp > 0 && hitCheck(player.x, player.y, player.IMAGE2, drug.x, drug.y, drug.IMAGE)) {
        player.hp = 10
        drug.hp = 0
    }

    // コンテキストの状態を保存（fillStyleを変えたりするので）
    ctx.save();
    // HPの最大値（10）x 5 の短形を描画（白）
    ctx.fillStyle = '#fff';
    ctx.fillRect(10, canvas.height-10, 10 * 5, 5);
    // 残りHP x 5 の短形を描画（赤）
    ctx.fillStyle = '#f00';
    ctx.fillRect(10, canvas.height - 10, player.hp * 5, 5);
    // 「倒した敵の数/全敵の数」という文字列を作成
    var text = "Killed: " + killed + "/" + ENMIES_COUNTS;
    // 文字列の（描画）横幅を計算する
    var width = ctx.measureText(text).width;
    // 文字列を描画（白）
    ctx.fillStyle = '#fff';
    ctx.fillText(text,
                canvas.width - 10 - width,
                canvas.height - 10);
}

const player = new Player()
const drug = new Drug()
const bullets = new Array(BULLET_COUNTS)
for (let i = 0; i < BULLET_COUNTS; i++) {
    bullets[i] = new Bullet()
}
let killed = 0
const enemies = new Array(ENMIES_COUNTS)
for (let i = 0; i < ENMIES_COUNTS; i++) {
    enemies[i] = new Enemie()
}

mainloop()

// 当たり判定
function hitCheck (x1, y1, obj1, x2, y2, obj2) {
    let cx1, cy1, cx2, cy2, r1, r2, d
    // 中心座標の取得
    cx1 = x1 + obj1.width/2
    cy1 = y1 + obj1.height/2
    cx2 = x2 + obj2.width/2
    cy2 = y2 + obj2.height/2
    // 半径の計算
    r1 = (obj1.width+obj1.height)/4
    r2 = (obj2.width+obj2.height)/4
    // 中心座標同士の距離の測定
    // Math.sqrt(d) -- dのルートを返す
    // Math.pow(x, a) -- xのa乗を返す
    d = Math.sqrt(Math.pow(cx1-cx2, 2) + Math.pow(cy1-cy2, 2))
    // 当たっているか判定
    // ちなみに `return r1+r2 > d;` とだけ書いてもOK
    if(r1 + r2 > d) {
        // 当たってる
        return true
    } else {
        // 当たっていない
        return false
    }
}
