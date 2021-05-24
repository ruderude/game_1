$(function () {
  
  // タイトル画面のスコアを取りに行く
  $.get({
    url: './get_score.php',
    dataType: 'json', //必須。json形式で返すように設定
  }).then(function (data) {
    console.log(data)
    SCORES = data
    const title_score_lines = $('#title_score_lines')
    for (let i = 0; i < SCORES.length; i++) {
      const name = SCORES[i].name
      const score = SCORES[i].score
      const row = "<p class='text-white'>" + name + "： " + score + "点</p>"
      title_score_lines.append(row)
    }
  }).catch(function(XMLHttpRequest, textStatus, e){
    alert(e);
  })

  // クリア後スコアをDBにPOSTする
  $('#submit').on('click',function(){
    const error = $(".error")
    error.text('')
    const name = $("#name").val().trim();
    const score = $("#score").text();
    if (!name) {
      error.text('名前を入力してください！')
      return
    }
    // console.log(name)
    // console.log(score)
    $.post({
      url: './post_score.php',
      data: JSON.stringify({
        "name": name,
        "score": score
      }),
      dataType: 'json',
      contentType: 'application/json',
    }).then(function (data) {
      console.log(data)
    }).catch(function(XMLHttpRequest, textStatus, e){
      console.log(e);
    }).then(() => {
      location.reload();
    });
  });
});
  
  