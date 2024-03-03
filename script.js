var cpu;
var chi;
var turno=0;
var colore=0;
var cambiata;
var suonato;
var finita=0;
var inter;
var palette=["#ffff00", "#ff8200", "#ff00dc", "#9600ff", "#0000ff", "#00ff00"];
var config=[[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]]; //configurazioni vincenti
var tris=["Q", "Q", "Q", "Q", "Q", "Q", "Q", "Q", "Q"]; //matrice che segna valore attuale di ogni cella (indicizzate da 0 a 8)
var memo=new Array(20000);

function memset(){
    for(var i=0;i<20000;i++) memo[i]=-1;
}

var hash=function(){
    var ret=0;
    for(var i=0;i<9;i++){
        ret*=3;
        if(tris[i]=="X"){
            ret++;
        }else{
            if(tris[i]=="O"){
                ret+=2;
            }
        }
    }
    return ret;
}

var dp=function(){
    for(var i=0;i<8;i++){
        if(tris[config[i][0]]==tris[config[i][1]] && tris[config[i][0]]==tris[config[i][2]]){
            if(tris[config[i][0]]=="X"){
                return memo[hash()]=0;
            }else{
                if(tris[config[i][0]]=="O"){
                    return memo[hash()]=2;
                }
            }
        }
    }
    var cnt=0;
    for(var i=0;i<9;i++){
        if(tris[i]!="Q") cnt++;
    }
    if(cnt==9) return memo[hash()]=1;
    if(memo[hash()]!=-1) return memo[hash()];
    var ret;
    if(cnt%2==0) ret=100;
    else ret=-100;
    for(var i=0;i<9;i++){
        if(tris[i]=="Q"){
            if(cnt%2==0){
                tris[i]="X";
                ret=Math.min(ret, dp());
            }else{
                tris[i]="O";
                ret=Math.max(ret, dp());
            }
            tris[i]="Q";
        }
    }
    return memo[hash()]=ret;
}

var visita=function(){
    var ma;
    if(turno%2==0) ma=100;
    else ma=-100;
    var cnt=0;
    for(var i=0;i<9;i++){
        if(tris[i]=="Q"){
            if(turno%2==0){
                tris[i]="X";
                ma=Math.min(ma, memo[hash()]);
            }else{
                tris[i]="O";
                ma=Math.max(ma, memo[hash()]);
            }
            tris[i]="Q";
        }
    }
    for(var i=0;i<9;i++){
        if(tris[i]=="Q"){
            if(turno%2==0) tris[i]="X";
            else tris[i]="O";
            if(memo[hash()]==ma) cnt++;
            tris[i]="Q";
        }
    }
    cnt=rnd(0, cnt-1);
    for(var i=0;i<9;i++){
        if(tris[i]=="Q"){
            if(turno%2==0){
                tris[i]="X";
            }else{
                tris[i]="O";
            }
            if(memo[hash()]==ma){
                if(!cnt){
                    tris[i]="Q";
                    return i;
                }else{
                    cnt--;
                }
            }
            tris[i]="Q";
        }
    }
}

function sound(chi){
    var snd=new Audio(chi);
    snd.play();
}

function sleep(ms){
    var now=new Date().getTime();
    while(new Date().getTime()<now+ms){}
}

function giostra(chi, dove){
    if(finita!=3){
        for(var i=0;i<3;i++){
            document.getElementById("q"+config[dove][i].toString()).src=chi+colore.toString()+".png";
        }
    }
    document.getElementById("vincitore").style.color=palette[colore];
    colore++;
    colore%=6;
}

var setIntervalImmediate=function(func, ms, arg1, arg2){
    func(arg1, arg2);
    return setInterval(func, ms, arg1, arg2);
}

function check(){ //funzione che controlla se qualcuno ha vinto e stampa il suo nome nel paragrafo "vincitore"
    for(var i=0;i<8;i++){
        if(tris[config[i][0]]==tris[config[i][1]] && tris[config[i][0]]==tris[config[i][2]]){
            if(tris[config[i][0]]=="X"){
                finita=1;
                aggiorna();
                inter=setIntervalImmediate(giostra, 150, "X/x", i);
                return finita;
            }else{
                if(tris[config[i][0]]=="O"){
                    finita=2;
                    aggiorna();
                    inter=setIntervalImmediate(giostra, 150, "O/o", i);
                    return finita;
                }
            }
        }
    }
    if(turno==9){
        finita=3;
        aggiorna();
        inter=setIntervalImmediate(giostra, 150);
        return finita;
    }
    return finita=0;
}

function rnd(min, max){
    return Math.floor(Math.random()*(max-min+1))+min;
}

function aggiorna(){
    if(!finita){
        document.getElementById("vincitore").innerHTML=" ";
        if(turno==0){
            if(chi==2 || document.getElementById("p1").value==""){
                document.getElementById("turno").innerHTML="Inizia X";
            }else{
                document.getElementById("turno").innerHTML="Inizia "+document.getElementById("p1").value;
            }
        }else{
            if(turno%2==0){
                if(chi==2 || document.getElementById("p1").value==""){
                    document.getElementById("turno").innerHTML="Tocca a X";
                }else{
                    document.getElementById("turno").innerHTML="Tocca a "+document.getElementById("p1").value;
                }
            }else{
                if(chi==1 || document.getElementById("p2").value==""){
                    document.getElementById("turno").innerHTML="Tocca a O";
                }else{
                    document.getElementById("turno").innerHTML="Tocca a "+document.getElementById("p2").value;
                }
            }
        }
    }else{
        document.getElementById("turno").innerHTML="Partita terminata";
        if(finita==3){
            document.getElementById("vincitore").innerHTML="Pareggio";
            sound("sound/draw.mp3")
        }else{
            if(!suonato){
                suonato=true;
                if(chi==0 || chi==finita) sound("sound/win.mp3");
                else sound("sound/lose.mp3");
            }
            if((chi==0 && document.getElementById("p"+finita).value=="") || (chi!=0 && chi!=finita) || (chi==finita && document.getElementById("p1").value=="")){
                document.getElementById("vincitore").innerHTML="Vince "+(finita==1?"X":"O");
            }else{
                document.getElementById("vincitore").innerHTML="Vince "+document.getElementById("p"+(chi!=0?"1":finita.toString())).value;
            }
        }
    }
}

function init(come){
    for(var i=0;i<9;i++){
        document.getElementById("q"+i.toString()).src="Other/quadrato.png";
        document.getElementById("q"+i.toString()).width='128';
        document.getElementById("q"+i.toString()).height='128';
        tris[i]="Q";
    }
    document.getElementById("l1").innerHTML="Giocatore 1: ";
    document.getElementById("p1").style.visibility="visible";
    document.getElementById("p1").style.width="177px";
    document.getElementById("p1").style.height="21px";
    if(!come){
        cpu=come;
        chi=0;
        document.getElementById("X").src="";
        document.getElementById("O").src="";
        document.getElementById("l2").innerHTML="Giocatore 2: ";
        document.getElementById("p2").style.visibility="visible";
        document.getElementById("p2").style.width="177px";
        document.getElementById("p2").style.height="21px";
    }else{
        chi=come;
        document.getElementById("l2").innerHTML="";
        document.getElementById("p2").value="";
        document.getElementById("p2").style.visibility="hidden";
        document.getElementById("p2").style.width="0px";
        document.getElementById("p2").style.height="0px";
    }
    turno=0;
    finita=0;
    suonato=false;
    aggiorna();
    if(chi==2){
        n=rnd(0, 8);
        while(cpu==2 && n!=0 && n!=2 && n!=6 && n!=8) n=rnd(0, 8);
        document.getElementById("q"+n.toString()).src="X/x.png";
        sound("sound/X.mp3");
        tris[n]="X";
        turno++;
        aggiorna();
    }
    clearInterval(inter);
}

function mostra(come){
    cpu=come;
    document.getElementById("X").src="Other/imX.png";
    document.getElementById("O").src="Other/imO.png";
    for(var i=0;i<9;i++){
        document.getElementById("q"+i.toString()).src="";
        document.getElementById("q"+i.toString()).width='0';
        document.getElementById("q"+i.toString()).height='0';
    }
    document.getElementById("turno").innerHTML="";
    document.getElementById("vincitore").innerHTML="";
    document.getElementById("l1").innerHTML="";
    document.getElementById("p1").style.visibility="hidden";
    document.getElementById("p1").style.width="0px";
    document.getElementById("p1").style.height="0px";
    document.getElementById("l2").innerHTML="";
    document.getElementById("p2").style.visibility="hidden";
    document.getElementById("p2").style.width="0px";
    document.getElementById("p2").style.height="0px";
}

function assegna(n){
    if(!finita){
        if(tris[n]=="Q"){
            cambiata=false;
            if(turno%2==0){
                document.getElementById("q"+n.toString()).src="X/x.png";
                sound("sound/X.mp3");
                tris[n]="X";
            }else{
                document.getElementById("q"+n.toString()).src="O/o.png";
                sound("sound/O.mp3");
                tris[n]="O";
            }
            turno++;
            aggiorna();
            if(!check()){
                if(cpu){
                    sleep(250);
                    if(cpu==1){
                        do{
                            n=rnd(0, 8);
                        }while(tris[n]!="Q");
                    }else{
                        n=visita();
                    }
                    if(turno%2==0){
                        document.getElementById("q"+n.toString()).src="X/x.png";
                        tris[n]="X";
                    }else{
                        document.getElementById("q"+n.toString()).src="O/o.png";
                        tris[n]="O";
                    }
                    turno++;
                    aggiorna();
                    check();
                }
            }
        }
    }
}

function cambia(n){
    if(!finita){
        if(tris[n]=="Q"){
            if(turno%2==0){
                document.getElementById("q"+n.toString()).src="X/x.png";
            }else{
                document.getElementById("q"+n.toString()).src="O/o.png";
            }
            cambiata=true;
        }
    }
}

function torna(n){
    if(cambiata){
        document.getElementById("q"+n.toString()).src="Other/quadrato.png";
        cambiata=false;
    }
}