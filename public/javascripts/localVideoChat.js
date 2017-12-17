$(function(){

    let localStream = null;
    let peer = null;
    let existingCall = null;

    // var audioSelect = $('#audioSource');
    // var videoSelect = $('#videoSource');

    var addAnotherAudioSelect = $('#addAnotherAudioSource');
    var addAnotherVideoSelect = $('#addAnotherVideoSource');



    var videoIDs = [];
    var audioIDs = [];
    var deviceInfos_global = [];

    $('#overlay').fadeIn("fast",function(){
    $('#modalWindow').fadeIn("fast",function(){
        //使用可能なvideo・audioデバイスを確認、選択項目に入れる。
        navigator.mediaDevices.enumerateDevices()
            .then(function(deviceInfos) {
                for (var i = 0; i !== deviceInfos.length; ++i) {
                    var deviceInfo = deviceInfos[i];
                    deviceInfos_global.push(deviceInfos[i]);
                    var option = $('<option>');
                    option.val(deviceInfo.deviceId);
                    if (deviceInfo.kind === 'audioinput') {
                        option.text(deviceInfo.label);
                        // audioSelect.append(option);
                        addAnotherAudioSelect .append(option);
                        audioIDs.push(deviceInfo);
                    } else if (deviceInfo.kind === 'videoinput') {
                        option.text(deviceInfo.label);
                        // videoSelect.append(option);
                        addAnotherVideoSelect.append(option);
                        videoIDs .push(deviceInfo);
                    }
                }

                console.log("deviceInfos_global");
                console.log(deviceInfos_global);

                addAnotherAudioSelect.on('change', deviceChange);
                addAnotherVideoSelect.on('change', deviceChange);

                // videoSelect.on('change', setupGetUserMedia);
                // audioSelect.on('change', setupGetUserMedia);

                // $addAnotherAudioSelect_options = $("#audioSelect > option").clone();
                // $addAnotherVideoSelect_options = $("#videoSelect > option").clone();
                // console.log("$addAnotherAudioSelect_options : ");
                // console.log($addAnotherAudioSelect_options);

                // setupGetUserMedia();
            }).catch(function (error) {
                console.error('mediaDevices.enumerateDevices() error:', error);
                return;
            });
        });
    });

//モーダル ////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //モーダルを画面中央に配置するための下処理
  locateCenter();
  $(window).resize(locateCenter);

  function locateCenter() {
    let w = $(window).width();
    let h = $(window).height();

    let cw = $('#modalWindow').outerWidth();
    let ch = $('#modalWindow').outerHeight();

    $('#modalWindow').css({
      'left': ((w - cw) / 2) + 'px',
      'top': ((h - ch) / 2) + 'px'
    });
  }
    //モーダルで使うボタンの処理
    $('#generate').on('click', addStream);
    $('#close').on('click', function() {
        $('#overlay, #modalWindow').fadeOut();
    });
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //peer処理スタート
    peer = new Peer({
        key: 'cf0497d0-c8c4-40fd-8d30-006bf1e17808',
        debug: 3
    });

    peer.on('open', function(){
        $('#my-id').text(peer.id);
    });

    peer.on('error', function(err){
        alert(err.message);
    });

    $('#make-call').submit(function(e){
        e.preventDefault();
        let roomName = $('#join-room').val();
        if (!roomName) {
            return;
        }
        const call = peer.joinRoom(roomName, {mode: 'sfu', stream: localStream});
        console.log(call);
        setupCallEventHandlers(call);
    });

    $('#end-call').click(function(){
        existingCall.close();
    });

    function setupGetUserMedia() {
        var audioSource = $('#audioSource').val();
        var videoSource = $('#videoSource').val();
        var constraints = {
            audio: {deviceId: {exact: audioSource}},
            video: {deviceId: {exact: videoSource}}
        };
        constraints.video.width = 640;
        constraints.video.height = 480;

        if(localStream){
            localStream = null;
        }

        navigator.mediaDevices.getUserMedia(constraints)
            .then(function (stream) {
                $('#myStream').get(0).srcObject = stream;
                localStream = stream;

                if(existingCall){
                    existingCall.replaceStream(stream);
                }

            }).catch(function (error) {
                console.error('mediaDevice.getUserMedia() error:', error);
                return;
            });
    }

    function setupCallEventHandlers(call){
        if (existingCall) {
            existingCall.close();
        };

        existingCall = call;
        setupEndCallUI();
        $('#room-id').text(call.name);

        call.on('stream', function(stream){
            addVideo(stream);
        });

        call.on('removeStream', function(stream){
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



    function addVideo(stream){
        console.log("getStream : ");
        console.log(stream.getVideoTracks());
        const videoDom = $('<video autoplay>');
        videoDom.attr('class','remoteVideo');
        videoDom.attr('id',stream.peerId);
        videoDom.get(0).srcObject = stream;
        // $('.videosContainer').append(videoDom);


         //remoteVideoとlocalVideoの組み合わせ作成、rocalだけのものがあればそれに入れるし、なければdivを新しく作って、id[PeerPare=xxxxxx]もつける
        var singleHere = false;
        $('.singleVideo').each(function(){ //for(#videoFieldの子要素(PeerPare=xxxxxx)を全探索){
                console.log("find singleVideo");
                console.log("this id  " + $(this).attr('id'));
                if(!$(this).attr('id') && $(this).has(".localVideo")){ //idがない、「かつ、localVideosContainerをもっている」とできればもっといい
                    console.log("find single in videosContainer");
                    console.log("this class = " + $(this).attr('class') + ", id = " + $(this).attr('id'));
                    $(this).append(videoDom);
                    $(this).attr('id','PeerPare='+stream.peerId);
                    $(this).attr('class','pairVideo');
                    singleHere = true;
                    console.log("this class = " + $(this).attr('class') + ", id = " + $(this).attr('id'));
                    return true;
                }
        });
        if(!singleHere){//シングルがいない場合、シングルをつくるdivに入れる.singleVideo
            const singleVideo = $('<div></div>');
            singleVideo.attr('class','singleVideo');
            singleVideo.attr('id','PeerPare='+stream.peerId);
            $('.videosContainer').append(singleVideo);
            singleVideo.append(videoDom);

            //相方localカメラを探す。
            $('#overlay').fadeIn("fast",function(){
                $('#modalWindow').fadeIn("fast");
            });
        }

    }

    function deviceChange() {
        var addAnotherAudioSource = $('#addAnotherAudioSource').val();
        var addAnotherVideoSource = $('#addAnotherVideoSource').val();
        var constraints = {
            audio: {deviceId: {exact: addAnotherAudioSource}},
            video: {deviceId: {exact: addAnotherVideoSource}}
        };
        constraints.video.width = 320;
        constraints.video.height = 240;

        if(localStream){
            localStream = null;
        }

        navigator.mediaDevices.getUserMedia(constraints)
            .then(function (stream) {
                $('#streamPreview').get(0).srcObject = stream;
            }).catch(function (error) {
                console.error('mediaDevice.getUserMedia() error:', error);
                return;
            });
    }

    function addStream(){
        // const videoDom = $('<video autoplay>');
        // videoDom.attr('class','localVideo');
        // videoDom.get(0).srcObject = $('#streamPreview').get(0).srcObject;
        // $('.videosContainer').append(videoDom);

        // var stream = $('#streamPreview').get(0).srcObject;
        // $('#streamPreview').get(0).srcObject = null;

        const videoDom = $('<video autoplay>');
        videoDom.attr('class','localVideo');
        var stream = $('#streamPreview').get(0).srcObject;
        videoDom.get(0).srcObject = stream;
        // $('.localVideosContainer').append(videoDom);

        //remoteVideoとlocalVideoの組み合わせ作成、remoteだけのものがあればそれに入れるし、なければdivを新しく作る
        var singleHere = false;
        $('.singleVideo').each(function(){ //for(#videoFieldの子要素(PeerPare=xxxxxx)を全探索){
                if($(this).has(".remoteVideo")){ //remoteVideosContainerをもっている
                    console.log("find single in videoContainer");
                    console.log("this class = " + $(this).attr('class') + ", id = " + $(this).attr('id'));
                    $(this).append(videoDom);
                    $(this).attr('class','pairVideo');//.Singleclassというクラス名を消す
                    singleHere = true;
                    console.log("this class = " + $(this).attr('class') + ", id = " + $(this).attr('id'));
                    return true;
                }
        });
        if(!singleHere){//シングルがいない場合からのdivに入れる.singleVideo
            const singleVideo = $('<div></div>');
            singleVideo.attr('class','singleVideo');
            $('.videosContainer').append(singleVideo);
            singleVideo.append(videoDom);
        }




        if(localStream){
            var audioTrack = stream.getAudioTracks();
            var videoTrack = stream.getVideoTracks();
            localStream.addTrack(audioTrack[0]);
            localStream.addTrack(videoTrack[0]);
        }else{
            $('.localVideo').get(0).srcObject = stream;
            localStream = stream;
        }

        if(existingCall){
            console.log("modal finish!");
            console.log(localStream.getAudioTracks());
            console.log(localStream.getVideoTracks());
            existingCall.replaceStream(localStream);
            $('#overlay, #modalWindow').fadeOut();
        }
        else{
            console.log("couldn't replace");
            console.log(localStream);
            $('#overlay, #modalWindow').fadeOut();
        }


    }

    function removeVideo(peerId){
        $('#'+peerId).remove();
    }

    function removeAllRemoteVideos(){
        $('.videosContainer').empty();
    }

    function setupMakeCallUI(){
        $('#make-call').show();
        $('#end-call').hide();
    }

    function setupEndCallUI() {
        $('#make-call').hide();
        $('#end-call').show();
    }

});
