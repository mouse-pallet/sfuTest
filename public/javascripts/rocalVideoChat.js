$(function(){

    let localStream = null;
    let peer = null;
    let existingCall = null;

    var audioSelect = $('#audioSource');
    var videoSelect = $('#videoSource');

    var videoIDs = [];
    var audioIDs = [];

    //使用可能なvideo・audioデバイスを確認、選択項目に入れる。
    navigator.mediaDevices.enumerateDevices()
        .then(function(deviceInfos) {
            for (var i = 0; i !== deviceInfos.length; ++i) {
                var deviceInfo = deviceInfos[i];
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
            videoSelect.on('change', setupGetUserMedia);
            audioSelect.on('change', setupGetUserMedia);
            setupGetUserMedia();
        }).catch(function (error) {
            console.error('mediaDevices.enumerateDevices() error:', error);
            return;
        });

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
    $('#close').on('click', function() {
    $('#overlay, #modalWindow').fadeOut();
  });

    function addVideo(stream){
        const videoDom = $('<video autoplay>');
        videoDom.attr('id',stream.peerId);
        videoDom.get(0).srcObject = stream;
        $('.videosContainer').append(videoDom);
        // addActor(stream.id,stream);　//Add Anamorphico
        // //ダイアログ表示
        // //ダイアログを表示　新しい参加者来ました。どのカメラを提示しますか？（カメラ選択画面とプレビュー,ボタン）
        $('#overlay, #modalWindow').fadeIn();
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
