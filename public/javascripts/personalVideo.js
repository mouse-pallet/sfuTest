// // インスタンス化
// var mem = new Member('太郎', '山田');
// console.log(mem.getName()); // 山田 太郎


// コンストラクタ
var personalVideo = function(){
    this.peer = new Peer({
    key: '*********************',
        debug: 3,
         secure: true
    });
    this.call = null;
    this.existingCall = null;
    console.log(this.peer);
    // this.streamFunc = null;
    // this.removeStreamFunc = null;
    // this.closeFunc = null

    //peer setting
    this.peer.on('open', function(){
        var pretext = $('#my-id').text();
        console.log(this);
        $('#my-id').text(pretext + " : " +this.id);
        // console.log("my Peer is " + this.peer.id);
    });

    this.peer.on('error', function(err){
        alert(err.message);
    });

    $('#end-call').click(function(){
        existingCall.close();
    });

};

personalVideo.prototype.setStreamANDRoom= function(roomName, myStream){
    this.call = this.peer.joinRoom(roomName, {mode: 'sfu', stream: myStream});
    // // this.setupCallEventHandlers();
    // return this.call;
}

personalVideo.prototype.getCall = function(){
    return this.call;
}

personalVideo.prototype.getPeer = function(){
    return this.peer;
}

personalVideo.prototype.getPeerID = function(){
    return this.peer.id;
}

