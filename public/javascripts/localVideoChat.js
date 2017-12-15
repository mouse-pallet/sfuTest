$(function(){

    let localStream = null;
    let peer = null;
    let existingCall = null;

    var audioSelect = $('#audioSource');
    var videoSelect = $('#videoSource');

    var addAnotherAudioSelect = $('#addAnotherAudioSource');
    var addAnotherVideoSelect = $('#addAnotherVideoSource');
    // var $addAnotherAudioSelect_options;
    // var $addAnotherVideoSelect_options;



    var videoIDs = [];
    var audioIDs = [];
    var deviceInfos_global = [];


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
                    audioSelect.append(option);
                    audioIDs.push(deviceInfo);
                } else if (deviceInfo.kind === 'videoinput') {
                    option.text(deviceInfo.label);
                    videoSelect.append(option);
                    videoIDs .push(deviceInfo);
                }
            }

            console.log("deviceInfos_global");
            console.log(deviceInfos_global);

            videoSelect.on('change', setupGetUserMedia);
            audioSelect.on('change', setupGetUserMedia);

            // $addAnotherAudioSelect_options = $("#audioSelect > option").clone();
            // $addAnotherVideoSelect_options = $("#videoSelect > option").clone();
            // console.log("$addAnotherAudioSelect_options : ");
            // console.log($addAnotherAudioSelect_options);

            setupGetUserMedia();
        }).catch(function (error) {
            console.error('mediaDevices.enumerateDevices() error:', error);
            return;
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
        videoDom.attr('id',stream.peerId);
        videoDom.get(0).srcObject = stream;
        $('.videosContainer').append(videoDom);
        // addActor(stream.id,stream);　//Add Anamorphico
        // //ダイアログを表示　新しい参加者来ました。どのカメラを提示しますか？（カメラ選択画面とプレビュー,ボタン）
        $('#overlay').fadeIn("fast",function(){
            $('#modalWindow').fadeIn("fast",function(){
            console.log("deviceInfos_global");
            console.log(deviceInfos_global);
            for (var i = 0; i !== deviceInfos_global .length; ++i) {
                var deviceInfo = deviceInfos_global [i];
                var option = $('<option>');
                option.val(deviceInfo.deviceId);
                if (deviceInfo.kind === 'audioinput') {
                    option.text(deviceInfo.label);
                    addAnotherAudioSelect.append(option);
                } else if (deviceInfo.kind === 'videoinput') {
                    option.text(deviceInfo.label);
                    addAnotherVideoSelect.append(option);
                }
            }
            addAnotherAudioSelect.on('change', deviceChange);
            addAnotherVideoSelect.on('change', deviceChange);
        });
        });

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
        console.log("addStream");

        var stream = $('#streamPreview').get(0).srcObject;
        var track = stream.getVideoTracks();
        $('#streamPreview').get(0).srcObject = null;
        console.log(track[0]);
        // localStream.addTrack(track);

        console.log(localStream);

        navigator.mediaDevices.getUserMedia(constraints)
            .then(function (stream) {
                $('#streamPreview').get(0).srcObject = stream;
            }).catch(function (error) {
                console.error('mediaDevice.getUserMedia() error:', error);
                return;
            });

        // if(existingCall){
        //     existingCall.replaceStream(localStream);
        // }
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
