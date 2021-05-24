'use strict';
// 全体で使用する変数を定義
const canvas = document.getElementById('screen');
const ctx = canvas.getContext('2d');

const MAX_WIDTH = 600;
const MAX_HEIGHT = 600;

const SPACE = 32;
const ENTER = 13;

const ENMIES_COUNTS = 7;
const BULLET_COUNTS = 5;
let game_objects = []

let SCORES = {}

class GameObject {
  constructor(x, y , image) {
    this.IMAGE = image
    this.x = x
    this.y = y
    game_objects.push(this)
  }


}

class Player extends GameObject {
  constructor() {
    super(0, MAX_HEIGHT / 2 - 64, document.getElementById('player'))
    this.IMAGE2 = document.getElementById('player2');
    this.hp = 10;
    this.bullets_hp = new Array(BULLET_COUNTS);
    this.SPEED = 8;
    this.count = 0;
    this.STAR_INTERVAL = 50;
    this.FIRE_INTERVAL = 10;
    this.player_star_interval = 0;
    this.player_fire_interval = 0;
  }

  draw() {
    this.count += 0.05;
    // プレイヤー無敵状態の点滅
    if (this.player_star_interval % 2 != 0 || this.hp <= 0) {
      // 半透明に描画する
      ctx.globalAlpha = 0.5;
    } else {
      ctx.globalAlpha = 1;
    }
    // プレイヤーの無敵インターバルを減少させる
    if (this.player_star_interval > 0) {
      this.player_star_interval--;
    }
    // 発射インターバルを減少させる
    if (this.player_fire_interval > 0) {
      this.player_fire_interval--;
    }
    if (this.hp > 0) {
      this.collision();
      let f = Math.floor(this.count) % 2;
      ctx.drawImage(this.IMAGE, 128 * f, 0, 128, 128, this.x, this.y, 128, 128);
    } else {
      let f = (Math.floor(this.count) % 2) + 2;
      ctx.drawImage(
        this.IMAGE,
        128 * f,
        128,
        128,
        128,
        this.x,
        this.y,
        128,
        128
      );
    }
    ctx.globalAlpha = 1;
  }

  hpView() {
    // コンテキストの状態を保存（fillStyleを変えたりするので）
    ctx.save();
    // HPの最大値（10）x 5 の短形を描画（白）
    ctx.fillStyle = '#fff';
    ctx.fillRect(10, canvas.height - 10, 10 * 5, 5);
    // 残りHP x 5 の短形を描画（赤）
    ctx.fillStyle = '#f00';
    ctx.fillRect(10, canvas.height - 10, player.hp * 5, 5);
  }

  move(key) {
    if (key === 'ArrowRight') {
      this.x += this.SPEED;
    } else if (key === 'ArrowLeft') {
      this.x -= this.SPEED;
    } else if (key === 'ArrowUp') {
      this.y -= this.SPEED;
    } else if (key === 'ArrowDown') {
      this.y += this.SPEED;
    }

    // プレイヤーがはみ出てしまった場合は強制的に中に戻す
    if (this.x < 0) {
      this.x = 0;
    } else if (this.x + 128 > canvas.width) {
      this.x = canvas.width - 128;
    } else if (this.y < 0) {
      this.y = 0;
    } else if (this.y + 128 > canvas.height) {
      this.y = canvas.height - 128;
    }
  }

  shot() {
    // 未使用の弾があれば発射する
    if (this.hp > 0 && this.player_fire_interval <= 0) {
      for (let i = 0; i < BULLET_COUNTS; i++) {
        if (bullets[i].hp == 0) {
          // 弾の初期位置はプレイヤーと同じ位置にする
          bullets[i].x = player.x + 100;
          bullets[i].y = player.y + 60;
          // 弾のHPを2にする。これにより次のループから描画や移動処理
          // が行われるようになる
          bullets[i].hp = 2;
          this.player_fire_interval = this.FIRE_INTERVAL;
          break;
        }
      }
    }
  }

  collision() {
    // プレイヤーと敵キャラの当たり判定（プレイヤーが生きている場合）
    if (this.hp > 0 && this.player_star_interval <= 0) {
      for (let i = 0; i < ENMIES_COUNTS; i++) {
        // 敵が生きている場合のみ判定する
        if (enemies[i].hp > 0) {
          if (
            hitCheck(
              this.x,
              this.y,
              this.IMAGE2,
              enemies[i].x,
              enemies[i].y,
              enemies[i].IMAGE
            )
          ) {
            // 当たっているのでお互いのHPを削る
            this.hp -= 2;
            enemies[i].hp -= 0;
            // プレイヤーを無敵状態にする
            this.player_star_interval = this.STAR_INTERVAL;
          }
        }
      }
    }

    // プレイヤーと回復アイテムの当たり判定（プレイヤーが生きている場合）
    if (
      this.hp > 0 &&
      drug.hp > 0 &&
      hitCheck(this.x, this.y, this.IMAGE2, drug.x, drug.y, drug.IMAGE)
    ) {
      this.hp = 10;
      drug.hp = 0;
    }
  }
}

class Bullet extends GameObject {
  constructor() {
    super(0, 0, document.getElementById('tama'))
    this.speed = 10;
    this.hp = 0;
  }

  draw() {
    if (this.hp > 0) {
      this.collision();
      ctx.drawImage(this.IMAGE, this.x, this.y);
      this.move();
    }
  }

  move() {
    this.x += this.speed;
    if (this.x > MAX_WIDTH) {
      this.hp = 0;
    }
  }

  collision() {
    // プレイヤー弾と敵キャラの当たり判定
    for (let i = 0; i < ENMIES_COUNTS; i++) {
      // 敵が死んでいる場合はスルーする
      if (enemies[i].hp <= 0) {
        continue;
      }

      if (
        hitCheck(
          this.x,
          this.y,
          this.IMAGE,
          enemies[i].x,
          enemies[i].y,
          enemies[i].IMAGE
        )
      ) {
        // 当たっているのでお互いのHPを1削る
        this.hp -= 2;
        enemies[i].hp -= 1;
        if (enemies[i].hp <= 0) {
          score.setEnemiePoint()
        }
      }
    }
  }
}

class Drug extends GameObject {
  constructor() {
    super(MAX_WIDTH, 0, document.getElementById('drug'))
    this.speed = 8;
    this.hp = 0;
    this.count = 1;
  }

  draw() {
    if (this.hp > 0) {
      ctx.drawImage(this.IMAGE, this.x, this.y);
      this.move();
    }
  }

  move() {
    this.x -= this.speed;
    if (this.x < -this.IMAGE.width) {
      this.x = MAX_WIDTH + this.IMAGE.width;
      this.y = Math.floor(Math.random() * (MAX_HEIGHT + 1 - 0)) + 0;
    }
  }

  drop() {
    if (this.count > 0) {
      this.x = MAX_WIDTH + this.IMAGE.width;
      this.y = Math.floor(Math.random() * (MAX_HEIGHT + 1 - 0)) + 0;
      this.hp = 2;
      this.count = 0;
    }
  }
}

class Enemie extends GameObject {
  constructor() {
    let y = Math.floor(Math.random() * (MAX_WIDTH + 1 - 0)) + 0;
    super(MAX_WIDTH, y, document.getElementById('enemy'))
    this.speed = Math.floor(Math.random() * (10 + 1 - 3)) + 3;
    this.hp = 2;
  }

  draw() {
    if (this.hp > 0) {
      ctx.drawImage(this.IMAGE, this.x, this.y);
      this.move();
    }
  }

  move() {
    this.x -= this.speed;
    if (this.x < -this.IMAGE.width) {
      this.y = Math.floor(Math.random() * (MAX_WIDTH + 1 - 0)) + 0;
      this.x = MAX_WIDTH;
    }
  }
}

class Score {
  constructor() {
    this.score = 0
    this.start_score = document.getElementById('title_score')
    this.clear_score = document.getElementById('score')
    this.score_board = document.getElementById('score_board')
  }

  init() {
    this.score = 0
  }

  setEnemiePoint() {
    killed++
    this.score += 100
  }

  startScoreHidden() {
    this.start_score.classList.add('hidden')
  }

  clearScore() {
    this.score_board.classList.remove('hidden')
  }

  view() {
    this.clear_score.innerText = this.score
    ctx.save();
    // 「倒した敵の数/全敵の数」という文字列を作成
    const texts = [ '破壊: ' + killed + '/' + ENMIES_COUNTS + " ", 'スコア: ' + this.score + " " ]
    // 文字列の（描画）横幅を計算する
    texts.forEach((text, index) => {
      const width = ctx.measureText(text).width
      const rows = 16 * (index + 1)
      // 文字列を描画（白）
      ctx.fillStyle = '#fff'
      ctx.fillText(text, canvas.width - 10 - width, canvas.height - rows)
    })
  }
}

class GameController {
  constructor() {
    this.state = null;
  }
  setState(state) {
    this.state = state;
    this.state.start();
  }
}

class StartState {
  start() {
    window.onkeydown = function (e) {
      console.log(e.code);
      if (e.keyCode === SPACE) {
        gameController.setState(gameState);
      }
    };
  }

  update() {
    requestAnimationFrame(mainloop);
    ctx.clearRect(0, 0, 600, 600);
    player.draw();
    // Hit SPACE to Start と表示
    ctx.save();//意味があまりわからない消したらスコアの文字が大きくなった
    ctx.font = '20px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    const text = "Hit SPACE to Start";
    const width = ctx.measureText(text).width;
    ctx.fillText(text,
                (canvas.width - width) / 2,
                500);
    ctx.restore();
  }
}

class PoseState {
  start() {
    window.onkeydown = function (e) {
      console.log(e.code);
      if (e.code === 'KeyZ') {
        gameController.setState(gameState);
      }
    };
  }

  update() {
    requestAnimationFrame(mainloop)
  }
}

class GameState {
  start() {
    // キーが押された時に呼び出される処理を指定
    window.onkeydown = function (e) {
      console.log(e.code)
      if (e.code === 'KeyZ') {
        gameController.setState(poseState);
      }
      if (e.keyCode === SPACE) {
        player.shot()
      }
      if (e.keyCode === ENTER) {
        drug.drop()
      }
      player.move(e.key)
    };
  }

  update() {
    requestAnimationFrame(mainloop);
    ctx.clearRect(0, 0, 600, 600);
    game_objects.forEach(obj => {
      obj.draw()
    })
    score.view()
    score.startScoreHidden()
    player.hpView()
  }
}

class EndState {
  start() {
    window.onkeydown = function (e) {};
  }

  update() {
    requestAnimationFrame(mainloop);
    ctx.clearRect(0, 0, 600, 600);
    player.draw();
    // 真ん中に大きな文字でゲームオーバー（赤）と表示する
    ctx.font = '20px sans-serif';
    ctx.textBaseline = 'middle';    // 上下位置のベースラインを中心に
    ctx.fillStyle = '#f00';
    const text = "Game Over";
    const width = ctx.measureText(text).width;
    ctx.fillText(text,
                (canvas.width - width) / 2,
                canvas.height / 2);
  }
}

class ClearState {
  start() {
    window.onkeydown = function (e) {};
  }

  update() {
    requestAnimationFrame(mainloop);
    ctx.clearRect(0, 0, 600, 600);
    player.draw();
    // 真ん中に大きな文字でゲームクリア（白）と表示する
    ctx.font = '20px sans-serif';
    ctx.textBaseline = 'middle';    // 上下位置のベースラインを中心に
    ctx.fillStyle = '#fff';
    const text = "Game Clear";
    const width = ctx.measureText(text).width;
    ctx.fillText(text,
      (canvas.width - width) / 2, 100);
    score.clearScore()

  }
}

const gameController = new GameController();
const startState = new StartState();
const gameState = new GameState();
const poseState = new PoseState();
const clearState = new ClearState();
const endState = new EndState();
const player = new Player();
const drug = new Drug();
const score = new Score();
const bullets = new Array(BULLET_COUNTS);
for (let i = 0; i < BULLET_COUNTS; i++) {
  bullets[i] = new Bullet();
}
let killed = 0;
const enemies = new Array(ENMIES_COUNTS);
for (let i = 0; i < ENMIES_COUNTS; i++) {
  enemies[i] = new Enemie();
}

gameController.setState(startState);
mainloop();

function mainloop() {
  if (player.hp <= 0) {
    gameController.setState(endState);
  }
  if (killed >= ENMIES_COUNTS) {
    gameController.setState(clearState);
  }
  gameController.state.update();
}

// 当たり判定
function hitCheck(x1, y1, obj1, x2, y2, obj2) {
  let cx1, cy1, cx2, cy2, r1, r2, d;
  // 中心座標の取得
  cx1 = x1 + obj1.width / 2;
  cy1 = y1 + obj1.height / 2;
  cx2 = x2 + obj2.width / 2;
  cy2 = y2 + obj2.height / 2;
  // 半径の計算
  r1 = (obj1.width + obj1.height) / 4;
  r2 = (obj2.width + obj2.height) / 4;
  // 中心座標同士の距離の測定
  // Math.sqrt(d) -- dのルートを返す
  // Math.pow(x, a) -- xのa乗を返す
  d = Math.sqrt(Math.pow(cx1 - cx2, 2) + Math.pow(cy1 - cy2, 2));
  // 当たっているか判定
  // ちなみに `return r1+r2 > d;` とだけ書いてもOK
  if (r1 + r2 > d) {
    // 当たってる
    return true;
  } else {
    // 当たっていない
    return false;
  }
}

