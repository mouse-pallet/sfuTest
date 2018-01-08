
    //基本的な流れ
    $(function(){
        //Stage = setStage();      //WebGLでいうカメラ, rendere, 照明のデフォルトセッティング(グローバル変数)
        RemotePeers = new Array(3); // localSideのPeer群(グローバル変数)
        remoteUserCounter = 0;  //リモートユーザ数(グローバル変数)
        remotePersons = new Array(RemotePeers.length); // pesonalVideo(グローバル変数)

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
                // person = new personalVideo();
                remotePersons[ remoteUserCounter ] = new personalVideo();
            }).catch(function (error) {
                console.error('mediaDevice.getUserMedia() error:', error);
                return;
            });
    }


    function addLocalStream(){
        // roomName = 'room_' + remoteUserCounter;
        var roomName = $('#join-room').val();
        if (!roomName) {
            return;
        }
        console.log("addLocalStream発火");

        //表示用video要素を作る
        const localVideoDom = $('<video autoplay>');
        localVideoDom.attr('class','localVideo');
        var stream = $('#streamPreview').get(0).srcObject;
        localVideoDom.get(0).srcObject = stream;

        //roomごとのdiv要素を作り、その中にvideoを入れる
        const roomDiv = $('<div class= "roomDiv"></div>');
        // roomDiv.attr('class','roomDiv');
        roomDiv.attr('id',roomName);
        $('.videosContainer').append(roomDiv);
        roomDiv.append(localVideoDom);

        var singleStream = stream;
        console.log("stream");
        if(singleStream){   //nullじゃなければ
            // var person = new personalVideo();    //peer setting コンストラクタ

            if(remotePersons[ remoteUserCounter ]){
                RemotePeers[ remoteUserCounter ] = { "myPeer" : remotePersons[ remoteUserCounter ].getPeer(), "myPeerID" : remotePersons[ remoteUserCounter ].getPeerID(), "roomName" : roomName,"remotePeerID": null };
                if(singleStream){
                    remotePersons[ remoteUserCounter ].setStreamANDRoom(roomName, singleStream);
                }
            }

            // peer.setRemoteVideo_to_callbackFunctionArgument(function(remoteVideo){//callStreamが来た時に発火
            //     Stage.addActore(remoteVideo);// ビデオから相手のAnamorphoseを作り、Stageに入れる
            // })
            var call = remotePersons[ remoteUserCounter ].getCall();
            //callイベントの設定
            if(call){
                call.on('stream', function(stream){
                    // Stage.addActore(stream.get(0).srcObject);
                            //表示用video要素を作る
                    console.log("get remote stream");
                    console.log(stream);
                    var remoteVideoDom = $('<video autoplay class="remoteVideo">');
                    // remoteVideoDom.attr('class','remoteVideo');
                    remoteVideoDom.attr('id', stream.peerId);
                    remoteVideoDom.get(0).srcObject = stream;
                    console.log('======== roomDiv ==============')
                    console.log(remoteVideoDom)
                    var thisRoomName = RemotePeers[ remoteUserCounter ]["roomName"];
                    console.log("roomName is " + thisRoomName);
                    // $('#' + thisRoomName + " .roomDiv").append(remoteVideoDom);
                    console.log($('#' + thisRoomName));
                    $('#' + thisRoomName).append(remoteVideoDom);

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
