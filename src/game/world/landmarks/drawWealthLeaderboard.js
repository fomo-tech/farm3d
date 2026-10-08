// Canvas artwork for the entrance screen. Only redraw when ranking/photos change.
export function drawWealthLeaderboard(ctx, top, getAvatar) {
  ctx.save();
  ctx.setTransform(.5,0,0,.5,0,0);
  const bg=ctx.createLinearGradient(0,0,2048,1152);
  bg.addColorStop(0,'#eff9e9');bg.addColorStop(.5,'#fffdf1');bg.addColorStop(1,'#e4f2d4');
  ctx.fillStyle=bg;ctx.fillRect(0,0,2048,1152);
  const rect=(x,y,w,h,r,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();ctx.fill();};
  const text=(value,x,y,size,color,width,align='center',weight=700)=>{ctx.textAlign=align;ctx.textBaseline='middle';ctx.font=`${weight} ${size}px "Nunito", "Segoe UI", Arial, sans-serif`;ctx.fillStyle=color;ctx.fillText(value,x,y,width);};
  // Soft meadow shapes frame the winners without competing with their names.
  ctx.fillStyle='#d9edbf';ctx.beginPath();ctx.ellipse(60,870,440,120,-.15,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#d0e8b1';ctx.beginPath();ctx.ellipse(1970,872,480,125,.15,0,Math.PI*2);ctx.fill();
  const flower=(x,y)=>{
    ctx.fillStyle='#fffdf5';
    for(let i=0;i<5;i++){const a=i*Math.PI*2/5;ctx.beginPath();ctx.ellipse(x+Math.cos(a)*15,y+Math.sin(a)*15,14,8,a,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle='#f4c754';ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.fill();
  };
  flower(96,750);flower(1944,750);flower(173,834);flower(1864,842);
  const money=player=>`${Math.max(0,Number(player?.progress?.coins)||0).toLocaleString('vi-VN')} Xu`;
  const portrait=(player,x,y,r,color)=>{
    ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r+8,0,Math.PI*2);ctx.fill();
    ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.clip();ctx.fillStyle='#e9ecdc';ctx.fillRect(x-r,y-r,r*2,r*2);
    const img=getAvatar(player);if(img)ctx.drawImage(img,x-r,y-r,r*2,r*2);
    else text(String(player.name||'N').slice(0,1).toUpperCase(),x,y,Math.round(r*.9),'#315643',r*1.5);
    ctx.restore();
  };
  text('VINH DANH THỊ TRẤN',1024,90,26,'#739563',1700,'center',700);
  text('ĐẠI PHÚ HÀO',1024,168,78,'#375c38',1750,'center',900);
  text('XẾP HẠNG THEO SỐ XU HIỆN CÓ',1024,245,25,'#80946a',1750,'center',600);
  const positions=[{index:1,x:490,y:445,r:104,step:740,color:'#c3e0ed',label:'Á QUÂN'},
    {index:0,x:1024,y:435,r:108,step:675,color:'#ffdb75',label:'ĐẠI PHÚ HÀO'},
    {index:2,x:1558,y:475,r:98,step:775,color:'#f6c4a0',label:'HẠNG BA'}];
  for(const p of positions){
    const player=top[p.index];if(!player)continue;
    if(p.index===0){ctx.fillStyle='#f4cc6c';ctx.beginPath();ctx.moveTo(p.x-50,326);ctx.lineTo(p.x-64,282);ctx.lineTo(p.x-25,302);ctx.lineTo(p.x,272);ctx.lineTo(p.x+25,302);ctx.lineTo(p.x+64,282);ctx.lineTo(p.x+50,326);ctx.closePath();ctx.fill();}
    portrait(player,p.x,p.y,p.r,p.color);
    text(player.name||'Người chơi',p.x,p.y+p.r+56,p.index===0?49:40,'#375c38',460,'center',800);
    text(money(player),p.x,p.y+p.r+110,p.index===0?44:35,'#996b2e',475,'center',800);
    const gradient=ctx.createLinearGradient(0,p.step,0,846);gradient.addColorStop(0,p.color);gradient.addColorStop(1,p.index===0?'#f5bd4f':p.index===1?'#9ccad9':'#e5a880');
    rect(p.x-230,p.step+8,460,846-p.step,24,'#91ad6b30');
    rect(p.x-230,p.step,460,846-p.step,24,gradient);
    rect(p.x-209,p.step+10,418,7,3,'#ffffff90');
    text(String(p.index+1).padStart(2,'0'),p.x,(p.step+846)/2,p.index===0?90:56,'#52613c',400,'center',900);
  }
  if(!top.length)text('Chưa có dữ liệu xếp hạng',1024,540,44,'#739563',1700);
  rect(76,874,1896,244,26,'#ffffffab');
  top.slice(3,10).forEach((player,i)=>{
    const x=i<4?115:1100,y=910+(i%4)*60;
    text(String(i+4).padStart(2,'0'),x,y,26,'#8b9b73',60,'left',700);
    portrait(player,x+98,y,21,'#fffdf5');
    text(player.name||'Người chơi',x+142,y,28,'#47623c',480,'left',600);
    text(money(player),x+810,y,28,'#996b2e',260,'right',700);
  });
  ctx.restore();
}
