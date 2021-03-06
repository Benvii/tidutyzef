 function Client()
{
    var webSocket = false;
    var ws = new wsLib();
	var that=this;
    this.onMessage = function(rep){
		console.log(rep.object);
        switch (rep.object){
            case "error":
                that.onError(rep);
                break;
            case "newUser":
                this.send({"object":"getAllUsers"});
				break;
			case "startGame":
				switch_screen.show( screen_map );
				screen_map.showMap(rep.map);
				screen_map.startCountDown(rep.time);
				console.log(rep.zones);
                screen_map.setRadius( ("radius" in rep) ? rep.radius : 10 );
				screen_map.setZone(rep.zones);
				window.navigator.vibrate(500);
				console.log(rep.zones);
				break;
			case "usersConnected":
				if(rep.hasOwnProperty("tidu")){
					screen_wait.newTidu(rep.tidu);
				}
				if(rep.hasOwnProperty("tizef")){
					screen_wait.newTizef(rep.tizef);
				}
				break;
			case "updatePos":
                if(player.user==rep.from){ player.status = rep.status; }
				screen_map.moveMarkers(rep.pos,rep.from,rep.team,rep.status);
				break;
			case "chat":
				screen_map.notif( rep.from+" : "+rep.content);
				break
			case "startBattle":
				switch_screen.show( screen_combat);
				screen_combat.battle(rep.against);
				window.navigator.vibrate(1000);
				break;
			case "battle":
				console.log('Result');
				screen_combat.showResult(rep.winner);
				break;
			case "endBattle":
				console.log('fin de la battle');
				break
			case "endGame":
				window.navigator.vibrate([1000,500,1000,500,1000]);
				switch(rep.cause){
					case "tiduWin":
						screen_map.winner("tizef");
						break;
					case "tizefWin":
						screen_map.winner("tidu");
						break;
					case "noEnoughPlayer":
						alert("Il n'y a pas assez de joueurs \n veuillez résoudre le problème ou contacter l'administrateur");
						switch_screen.show(screen_connection);
						that.onClose();
						break;
					case "timeOut":
						screen_map.winner("nul");
						break;
				}
				break;
		}
    };
    this._onmessage = function(e){ 
        var rep = JSON.parse(e.data);
        console.log(rep);
        that.onMessage(rep);
    };

    this.onError = function(e){
		if(e.errorCode==2){
			switch_screen.show( screen_connection );
		    this.onClose();
		}
		alert(e.desc);
    };
    
    this.onClose = function(){
        var data = {object :"logout"};
        this.send(data);
        webSocket = false;
    };
    
    this.openConnection = function (ip, callback){ // Callback is an optionnal argument
        var _that_ = this,
        callback = ( typeof callback == "undefined" ) ? function(){} : callback; // Default callback function do nothing
        
        if(!webSocket){
            ws.openSocket(ip,
                function(){ webSocket = true; callback(); },
                this.onClose,
                this._onmessage,
                this.onError );
        }
    };

    this.send = function (data){
        if(webSocket && ! ws.isClosed()){
            ws.msg(data);
        }
        else{
            ws.close();
        }
    };
    
}

client = new Client();
