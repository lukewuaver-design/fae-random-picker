const tiles=[...document.querySelectorAll('.number')];const button=document.querySelector('#draw');const result=document.querySelector('#result');let running=false;
function light(n){tiles.forEach((el,i)=>el.classList.toggle('active',i===n-1));}
button.addEventListener('click',()=>{if(running)return;running=true;button.disabled=true;button.textContent='抽選中…';result.textContent='幸運正在降臨！';
let tick=0,step=70;const winner=Math.floor(Math.random()*4)+1;
function spin(){tick++;light((tick%4)+1);if(tick<22){step+=tick>14?18:3;setTimeout(spin,step)}else{light(winner);result.textContent=`🎉 恭喜！今天是 ${winner} 號 FAE！`;button.disabled=false;button.textContent='↻ 再抽一次';running=false}}
spin();});