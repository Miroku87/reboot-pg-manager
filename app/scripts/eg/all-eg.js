/**
 *  ZERG
 */

var z;
var tm;
cheet('z e r g',function(){ 
    //start the zegrush
    //all divs has to be targets
    $('.content-wrapper div').addClass('target');
    $('.content-wrapper section').addClass('target');
    if(!z){
        tm = setTimeout(function(){
            alert('sei stato assimilato!');
            window.location.reload();
        },20*1000);
        z = new ZergRush(10);
    }
});
cheet('s t o p',function(){
    $('.target').removeClass('target');
    if(z){
        clearTimeout(tm);

        z.destroy();
        z = null;
        alert('che culo!');
        //window.location.reload();
    }
    
});
/**
 * MATRIX
 */
var int;
cheet('b l u e p i l l',function(){
    if(int){
        clearInterval(int);
    }
    alert("pillola blu o rossa?");
   $('.matrixC').remove(); 
});
cheet('m a t r i x',function(){
    $('<canvas class="matrixC"></canvas>').appendTo(document.body);
    var c = $(".matrixC")[0];
    var ctx = c.getContext("2d");
    
    c.height = window.innerHeight;
    c.width = window.innerWidth;
    
    var chinese = "田由甲申甴电甶男甸甹町画甼甽甾甿畀畁畂畃畄畅畆畇畈畉畊畋界畍畎畏畐畑";
    chinese = chinese.split("");
    var font_size = 10;
    var columns = c.width/font_size; //number of columns for the rain
    var drops = [];
    for(var x = 0; x < columns; x++)
        drops[x] = 1; 
    
    function draw()
    {
        ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.fillStyle = "#0F0"; //green text
        ctx.font = font_size + "px arial";
        for(var i = 0; i < drops.length; i++)
        {
            var text = chinese[Math.floor(Math.random()*chinese.length)];
            ctx.fillText(text, i*font_size, drops[i]*font_size);
            if(drops[i]*font_size > c.height && Math.random() > 0.975)
                drops[i] = 0;       
            drops[i]++;
        }
    }
    int = setInterval(draw, 33);
    setTimeout(function() {
        clearInterval(int);
        alert("pillola blu o rossa?");
        $('.matrixC').remove(); 
    },20*1000);
});
/**
 * SCHERMATA BLU DELLA MORTE
 */
cheet('g o d b l e s s t h e q u e e n',function(){
    alert("C'è mancato poco ...");
    $('.bsod').remove(); 
 });
 cheet('b s o d',function(){
    $('<div class="bsod"></div>').appendTo(document.body);
    var testo =  `<h1>RAVnet ERROR</h1><br><br><br><p>S&igrave; &egrave; verificato un errore irreversibile si RAV.NET in 0228:STR000SYNAP7 il mondo verr&agrave; terminato.<br>
                        *   Digitare "GODBLESSTHEQUEEN" entro 20 secondi per salvare il mondo<br>
                        *   Oppure prendere contemporaneamente SPAZIO + TRINAGOLO + R1 + L1 + FRECCIA SU </p>`;
    $('.bsod').html(testo);
    setTimeout(function() {
        alert("I tuoi riflessi estinguerebbero il genere umano ...");
        $('.bsod').remove();  
    },20*1000);
});