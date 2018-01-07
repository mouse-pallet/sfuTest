
    //基本的な流れ
    $(function(){
        //Stage = setStage();      //WebGLでいうカメラ, rendere, 照明のデフォルトセッティング(グローバル変数)
        RemotePeers = new Array(3); // localSideのPeer群(グローバル変数)
        remoteUserCounter = 0;  //リモートユーザ数(グローバル変数)

        //first setting
        locateCenter();
        $(window).resize(locateCenter);   //デバイス設定用のモーダルの設置
            //モーダルで使うボタンの処理
        $('#generate').on('click', addLocalStream);
        $('#close').on('click', function(e) {
            console.log("close_クリックされました");
            e.preventDefault();
            $('#overlay, #modalWindow').fadeOut();
        });
        modalSetting(); //最初だけモーダル設定しながら出力....はできなさそうな


        // addRemoteUser();     //最初のPeer
        $('#add_person').click(addRemoteUser);//add_personボタンを押すたびに増える
        // Stage.renderStart(); //　WebGL表示開始
    })

    //リモートユーザを受け付けられるよう、local側のPeerを増やす
    function addRemoteUser(){
        //モーダルを表示し、ローカルビデオのデバイス設定
        console.log("addRemoteUser発火");
        $('#overlay').fadeIn("fast",function(){
            $('#modalWindow').fadeIn("fast");
        });

        // $('#overlay, #modalWindow').css("visibility","visible");
    }

    //モーダルのカメラ設定オーディオ設定からのプレビューを設定
    function deviceChange() {
        var addAnotherAudioSource = $('#addAnotherAudioSource').val();
        var addAnotherVideoSource = $('#addAnotherVideoSource').val();
        var constraints = {
            audio: {deviceId: {exact: addAnotherAudioSource}},
            video: {deviceId: {exact: addAnotherVideoSource}}
        };
        constraints.video.width = 320;
        constraints.video.height = 240;

        navigator.mediaDevices.getUserMedia(constraints)
            .then(function (stream) {
                $('#streamPreview').get(0).srcObject = stream;
            }).catch(function (error) {
                console.error('mediaDevice.getUserMedia() error:', error);
                return;
            });
    }

    //モーダル ////////////////////////////////////////////////////////////////////////////////////////////////////////////

    function locateCenter(){
        ///// モーダルを画面中央に配置するための下処理
        let w = $(window).width();
        let h = $(window).height();

        let cw = $('#modalWindow').outerWidth();
        let ch = $('#modalWindow').outerHeight();

        $('#modalWindow').css({
          'left': ((w - cw) / 2) + 'px',
          'top': ((h - ch) / 2) + 'px'
        });

    }

    function modalSetting() { ///////
        //選択デバイスの設定
        var addAnotherAudioSelect = $('#addAnotherAudioSource');
        var addAnotherVideoSelect = $('#addAnotherVideoSource');

        $('#overlay').fadeIn("fast",function(){
            $('#modalWindow').fadeIn("fast",function(){
                navigator.mediaDevices.enumerateDevices()
                    .then(function(deviceInfos) {
                        for (var i = 0; i !== deviceInfos.length; ++i) {
                            var deviceInfo = deviceInfos[i];
                            var option = $('<option>');
                            option.val(deviceInfo.deviceId);
                            if (deviceInfo.kind === 'audioinput') {
                                option.text(deviceInfo.label);
                                addAnotherAudioSelect .append(option);
                            } else if (deviceInfo.kind === 'videoinput') {
                                option.text(deviceInfo.label);
                                addAnotherVideoSelect.append(option);
                            }
                        }

                        addAnotherAudioSelect.on('change', deviceChange);
                        addAnotherVideoSelect.on('change', deviceChange);



                    }).catch(function (error) {
                        console.error('mediaDevices.enumerateDevices() error:', error);
                        return;
                    });
                });
        });
    }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    function deviceChange() {
        var addAnotherAudioSource = $('#addAnotherAudioSource').val();
        var addAnotherVideoSource = $('#addAnotherVideoSource').val();
        var constraints = {
            audio: {deviceId: {exact: addAnotherAudioSource}},
            video: {deviceId: {exact: addAnotherVideoSource}}
        };
        constraints.video.width = 320;
        constraints.video.height = 240;

        navigator.mediaDevices.getUserMedia(constraints)
            .then(function (stream) {
                $('#streamPreview').get(0).srcObject = stream;
            }).catch(function (error) {
                console.error('mediaDevice.getUserMedia() error:', error);
                return;
            });
    }


    function addLocalStream(){
        roomName = 'room_' + remoteUserCounter;
        console.log("addLocalStream発火");

        //表示用video要素を作る
        const localVideoDom = $('<video autoplay>');
        localVideoDom.attr('class','localVideo');
        var stream = $('#streamPreview').get(0).srcObject;
        localVideoDom.get(0).srcObject = stream;

        //roomごとのdiv要素を作り、その中にvideoを入れる
        const roomDiv = $('<div></div>');
        roomDiv.attr('class','roomDiv');
        roomDiv.attr('id',roomName);
        $('.videosContainer').append(roomDiv);
        roomDiv.append(localVideoDom);

        var singleStream = stream;
        console.log("stream");
        if(singleStream){   //nullじゃなければ
            var peer = new personalVideo();    //peer setting コンストラクタ
            RemotePeers[ remoteUserCounter ] = { "myPeer" : peer, "myPeerID" : peer.getPeerID(), "roomName" : roomName,"remotePeerID": null };
            peer.setStreamANDRoom(roomName, singleStream);
            // peer.setRemoteVideo_to_callbackFunctionArgument(function(remoteVideo){//callStreamが来た時に発火
            //     Stage.addActore(remoteVideo);// ビデオから相手のAnamorphoseを作り、Stageに入れる
            // })
            var call = peer.getCall();
            //callイベントの設定
            if(call){
                call.on('stream', function(stream){
                    // Stage.addActore(stream.get(0).srcObject);
                            //表示用video要素を作る
                    const remoteVideoDom = $('<video autoplay>');
                    remoteVideoDom.attr('class','remoteVideo');
                    remoteVideoDom.attr('id', stream.peerId);
                    var stream = $('#streamPreview').get(0).srcObject;
                    remoteVideoDom.get(0).srcObject = stream;
                    console.log('======== roomDiv ==============')
                    console.log($('#room_' + remoteUserCounter));
                    $('#room_' + remoteUserCounter).append(remoteVideoDom);

                    RemotePeers[ remoteUserCounter ] = stream.peerId;
                    remoteUserCounter++;    //カウント
                });

                call.on('removeStream', function(stream){
                    console.log("replace発火!!!! on removeStream");
                    console.log(stream);
                    removeVideo(stream.peerId);
                });

                call.on('peerLeave', function(peerId){
                    removeVideo(peerId);
                });

                call.on('close', function(){
                    removeAllRemoteVideos();
                    setupMakeCallUI();
                });
            }

        }

        $('#overlay, #modalWindow').fadeOut();
        // $('#overlay, #modalWindow').css("visibility","hidden");
    }



    function removeVideo(peerId){
        $('#'+peerId).remove();
    }

    function removeAllRemoteVideos(){
        $('.videosContainer').empty();
    }
























//     let localStream = null;
//     let peer = null;
//     let existingCall = null;

//     // var audioSelect = $('#audioSource');
//     // var videoSelect = $('#videoSource');

//     var addAnotherAudioSelect = $('#addAnotherAudioSource');
//     var addAnotherVideoSelect = $('#addAnotherVideoSource');

//     var videoIDs = [];
//     var audioIDs = [];
//     var deviceInfos_global = [];

//     $('#overlay').fadeIn("fast",function(){
//     $('#modalWindow').fadeIn("fast",function(){
//         //使用可能なvideo・audioデバイスを確認、選択項目に入れる。
//         navigator.mediaDevices.enumerateDevices()
//             .then(function(deviceInfos) {
//                 for (var i = 0; i !== deviceInfos.length; ++i) {
//                     var deviceInfo = deviceInfos[i];
//                     deviceInfos_global.push(deviceInfos[i]);
//                     var option = $('<option>');
//                     option.val(deviceInfo.deviceId);
//                     if (deviceInfo.kind === 'audioinput') {
//                         option.text(deviceInfo.label);
//                         // audioSelect.append(option);
//                         addAnotherAudioSelect .append(option);
//                         audioIDs.push(deviceInfo);
//                     } else if (deviceInfo.kind === 'videoinput') {
//                         option.text(deviceInfo.label);
//                         // videoSelect.append(option);
//                         addAnotherVideoSelect.append(option);
//                         videoIDs .push(deviceInfo);
//                     }
//                 }

//                 console.log("deviceInfos_global");
//                 console.log(deviceInfos_global);

//                 addAnotherAudioSelect.on('change', deviceChange);
//                 addAnotherVideoSelect.on('change', deviceChange);


//                 // setupGetUserMedia();
//             }).catch(function (error) {
//                 console.error('mediaDevices.enumerateDevices() error:', error);
//                 return;
//             });
//         });
//     });

// //モーダル ////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   //モーダルを画面中央に配置するための下処理
//   locateCenter();
//   $(window).resize(locateCenter);

//   function locateCenter() {
//     let w = $(window).width();
//     let h = $(window).height();

//     let cw = $('#modalWindow').outerWidth();
//     let ch = $('#modalWindow').outerHeight();

//     $('#modalWindow').css({
//       'left': ((w - cw) / 2) + 'px',
//       'top': ((h - ch) / 2) + 'px'
//     });
//   }
//     //モーダルで使うボタンの処理
//     $('#generate').on('click', addStream);
//     $('#close').on('click', function() {
//         $('#overlay, #modalWindow').fadeOut();
//     });
// ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//     //peer処理スタート
//     peer = new Peer({
//         key: 'cf0497d0-c8c4-40fd-8d30-006bf1e17808',
//         debug: 3
//     });

//     peer.on('open', function(){
//         $('#my-id').text(peer.id);
//     });

//     peer.on('error', function(err){
//         alert(err.message);
//     });

//     $('#make-call').submit(function(e){
//         e.preventDefault();
//         let roomName = $('#join-room').val();
//         if (!roomName) {
//             return;
//         }
//         const call = peer.joinRoom(roomName, {mode: 'sfu', stream: localStream});
//         console.log(call);
//         setupCallEventHandlers(call);
//     });

//     $('#end-call').click(function(){
//         existingCall.close();
//     });

//     function setupGetUserMedia() {
//         var audioSource = $('#audioSource').val();
//         var videoSource = $('#videoSource').val();
//         var constraints = {
//             audio: {deviceId: {exact: audioSource}},
//             video: {deviceId: {exact: videoSource}}
//         };
//         constraints.video.width = 640;
//         constraints.video.height = 480;

//         if(localStream){
//             localStream = null;
//         }

//         navigator.mediaDevices.getUserMedia(constraints)
//             .then(function (stream) {
//                 $('#myStream').get(0).srcObject = stream;
//                 localStream = stream;

//                 if(existingCall){
//                     existingCall.replaceStream(stream);
//                 }

//             }).catch(function (error) {
//                 console.error('mediaDevice.getUserMedia() error:', error);
//                 return;
//             });
//     }

//     function setupCallEventHandlers(call){
//         if (existingCall) {
//             existingCall.close();
//         };

//         existingCall = call;
//         setupEndCallUI();
//         $('#room-id').text(call.name);

//         call.on('stream', function(stream){
//             console.log("replace発火!!!! on stream");
//             console.log(stream);
//             addVideo(stream);
//         });

//         call.on('removeStream', function(stream){
//             console.log("replace発火!!!! on removeStream");
//             console.log(stream);
//             removeVideo(stream.peerId);
//         });

//         call.on('peerLeave', function(peerId){
//             removeVideo(peerId);
//         });

//         call.on('close', function(){
//             removeAllRemoteVideos();
//             setupMakeCallUI();
//         });

//     }



//     function addVideo(stream){
//         console.log("getStream : ");
//         console.log(stream.getVideoTracks());
//         const videoDom = $('<video autoplay>');
//         videoDom.attr('class','remoteVideo');
//         videoDom.attr('id',stream.peerId);
//         videoDom.get(0).srcObject = stream;
//         // $('.videosContainer').append(videoDom);


//          //remoteVideoとlocalVideoの組み合わせ作成、rocalだけのものがあればそれに入れるし、なければdivを新しく作って、id[PeerPare=xxxxxx]もつける
//         var singleHere = false;
//         $('.singleVideo').each(function(){ //for(#videoFieldの子要素(PeerPare=xxxxxx)を全探索){
//                 console.log("find singleVideo");
//                 console.log("this id  " + $(this).attr('id'));
//                 if(!$(this).attr('id') && $(this).has(".localVideo")){ //idがない、「かつ、localVideosContainerをもっている」とできればもっといい
//                     console.log("find single in videosContainer");
//                     console.log("this class = " + $(this).attr('class') + ", id = " + $(this).attr('id'));
//                     $(this).append(videoDom);
//                     $(this).attr('id','PeerPare='+stream.peerId);
//                     $(this).attr('class','pairVideo');
//                     singleHere = true;
//                     console.log("this class = " + $(this).attr('class') + ", id = " + $(this).attr('id'));
//                     return true;
//                 }
//         });
//         if(!singleHere){//シングルがいない場合、シングルをつくるdivに入れる.singleVideo
//             const singleVideo = $('<div></div>');
//             singleVideo.attr('class','singleVideo');
//             singleVideo.attr('id','PeerPare='+stream.peerId);
//             $('.videosContainer').append(singleVideo);
//             singleVideo.append(videoDom);

//             //相方localカメラを探す。
//             $('#overlay').fadeIn("fast",function(){
//                 $('#modalWindow').fadeIn("fast");
//             });
//         }

//     }

//     function deviceChange() {
//         var addAnotherAudioSource = $('#addAnotherAudioSource').val();
//         var addAnotherVideoSource = $('#addAnotherVideoSource').val();
//         var constraints = {
//             audio: {deviceId: {exact: addAnotherAudioSource}},
//             video: {deviceId: {exact: addAnotherVideoSource}}
//         };
//         constraints.video.width = 320;
//         constraints.video.height = 240;

//         // if(localStream){
//         //     localStream = null;
//         // }

//         navigator.mediaDevices.getUserMedia(constraints)
//             .then(function (stream) {
//                 $('#streamPreview').get(0).srcObject = stream;
//             }).catch(function (error) {
//                 console.error('mediaDevice.getUserMedia() error:', error);
//                 return;
//             });
//     }

//     function addStream(){
//         // const videoDom = $('<video autoplay>');
//         // videoDom.attr('class','localVideo');
//         // videoDom.get(0).srcObject = $('#streamPreview').get(0).srcObject;
//         // $('.videosContainer').append(videoDom);

//         // var stream = $('#streamPreview').get(0).srcObject;
//         // $('#streamPreview').get(0).srcObject = null;

//         const videoDom = $('<video autoplay>');
//         videoDom.attr('class','localVideo');
//         var stream = $('#streamPreview').get(0).srcObject;
//         videoDom.get(0).srcObject = stream;
//         // $('.localVideosContainer').append(videoDom);

//         //remoteVideoとlocalVideoの組み合わせ作成、remoteだけのものがあればそれに入れるし、なければdivを新しく作る
//         var singleHere = false;
//         $('.singleVideo').each(function(){ //for(#videoFieldの子要素(PeerPare=xxxxxx)を全探索){
//                 if($(this).has(".remoteVideo")){ //remoteVideosContainerをもっている
//                     console.log("find single in videoContainer");
//                     console.log("this class = " + $(this).attr('class') + ", id = " + $(this).attr('id'));
//                     $(this).append(videoDom);
//                     $(this).attr('class','pairVideo');//.Singleclassというクラス名を消す
//                     singleHere = true;
//                     console.log("this class = " + $(this).attr('class') + ", id = " + $(this).attr('id'));
//                     return true;
//                 }
//         });
//         if(!singleHere){//シングルがいない場合からのdivに入れる.singleVideo
//             const singleVideo = $('<div></div>');
//             singleVideo.attr('class','singleVideo');
//             $('.videosContainer').append(singleVideo);
//             singleVideo.append(videoDom);
//         }



//         console.log("localStream" + localStream);
//         if(localStream){
//             console.log("addTrack");
//             var audioTrack = stream.getAudioTracks();
//             var videoTrack = stream.getVideoTracks();
//             localStream.addTrack(audioTrack[0]);
//             localStream.addTrack(videoTrack[0]);
//         }else{

//             // $('.localVideo').get(0).srcObject = stream;
//             console.log("localStream cannot find. new one become localStream.");
//             localStream = stream;
//         }

//         if(existingCall){
//             console.log("modal finish!");
//             console.log(localStream.getAudioTracks());
//             console.log(localStream.getVideoTracks());
//             existingCall.replaceStream(localStream);
//             console.log(existingCall);
//             $('#overlay, #modalWindow').fadeOut();
//         }
//         else{
//             console.log("couldn't replace");
//             console.log(localStream);
//             $('#overlay, #modalWindow').fadeOut();
//         }


//     }

//     function removeVideo(peerId){
//         $('#'+peerId).remove();
//     }

//     function removeAllRemoteVideos(){
//         $('.videosContainer').empty();
//     }

//     function setupMakeCallUI(){
//         $('#make-call').show();
//         $('#end-call').hide();
//     }

//     // function setupEndCallUI() {
//     //     $('#make-call').hide();
//     //     $('#end-call').show();
//     // }

// });
