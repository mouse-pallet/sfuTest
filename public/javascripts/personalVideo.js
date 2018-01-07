// // インスタンス化
// var mem = new Member('太郎', '山田');
// console.log(mem.getName()); // 山田 太郎


// コンストラクタ
var personalVideo = function(){
    this.peer = new Peer({
    key: 'cf0497d0-c8c4-40fd-8d30-006bf1e17808',
        debug: 3
    });
    this.call = null;
    this.existingCall = null;
    // this.streamFunc = null;
    // this.removeStreamFunc = null;
    // this.closeFunc = null

    //peer setting
    this.peer.on('open', function(){
        // var pretext = $('#my-id').text();
        // $('#my-id').text(pretext + " : " +peer.id);
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

// personalVideo.prototype.setCallStreamFunc= function(addRemoteStreamFunc){
//     this.streamFunc = addRemoteStreamFunc;
// }

// personalVideo.prototype.setCallRemoveStreamFunc= function(addRemoveRemoteStreamFunc){
//     this.removeStreamFunc = addRemoveRemoteStreamFunc;
// }

// personalVideo.prototype.setCallCloseFunc= function(addCloseStreamFunc){
//     this.closeFunc = addCloseStreamFunc;
// }

// personalVideo.prototype.setupCallEventHandlers = function(){
//         if (this.existingCall) {
//             this.existingCall.close();
//         };

//         this.existingCall = this.call;
//         // setupEndCallUI();
//         // $('#room-id').text(call.name);

//         call.on('stream', function(stream){
//             console.log("replace発火!!!! on stream");
//             // console.log(stream);
//             // addVideo(stream);
//             this.streamFunc(stream);
//         });

//         call.on('removeStream', function(stream){
//             console.log("replace発火!!!! on removeStream");
//             // console.log(stream);
//             // removeVideo(stream.peerId);
//             this.streamFunc(stream.peerId)
//         });

//         call.on('peerLeave', function(peerId){
//             removeVideo(peerId);
//         });

//         call.on('close', function(){
//             removeAllRemoteVideos();
//             setupMakeCallUI();
//         });

//     }
