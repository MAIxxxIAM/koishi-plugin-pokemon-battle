async function render(log, user, tar) {
    let att, def
    if (user.power[4] > tar.power[4]) { att = user; def = tar } else { att = tar; def = user }
    let array = log.split('\n')
    let html1 = ''
    array.forEach((element, index) => {
        if (index !== array.length - 1) {
            if(index > 6){return}
            if (index != 6) {
                if (index % 2 === 0) {
                    html1 += `<p class="nes-balloon from-left nes-pointer">${element}</p>`
                } else {
                    html1 += `<p class="nes-balloon from-right nes-pointer">${element}</p>`
                }
            } else {
                html1 += `<p class="centered">......</p>`
            }
        } else {
            html1 += `<div class="nes-container with-title is-centered is-dark" style="width:300; position: absolute; bottom: 20;left:150">
  <p class="title" style="font-size: 30px;">对战结果</p>
  <p>${element}</p>
  </div>`
            let img1 = document.getElementById('attpo');
            img1.src = '../../../../image/' + att.monster_1 + '.png';
            let img2 = document.getElementById('defpo');
            img2.src = '../../../../image/' + def.monster_1 + '.png';
            let img3 = document.getElementById('att');
            img3.src = '../img/trainers/0.png';
            let img4 = document.getElementById('def');
            img4.src = '../img/trainers/0.png';
        }
    })
    document.querySelector('section').innerHTML += html1
}