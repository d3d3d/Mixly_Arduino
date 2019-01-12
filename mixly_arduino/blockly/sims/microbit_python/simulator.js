'use strict';

var base_url = conf.url + '/blockly/sims/microbit_python/';
Sk.externalLibraries = {
    // added as a farewell message to a school direct student
    microbit: {
        path: base_url + 'microbit/__init__.js',
        dependencies: [
            base_url + 'microbit/display.js',
            base_url + 'microbit/accelerometer.js',
            base_url + 'microbit/compass.js',
        ]
    },
    music: {
        path: conf.url + '/blockly/sims/microbit_python/music/__init__.js'
    },
    radio:{
        path: conf.url + '/blockly/sims/microbit_python/radio/__init__.js'
    }
}


var ui = {
    //模拟器radio初始化配置
    client_radio_data: {
        channel: mbData.radio.channel,
        address:  mbData.radio.address,
        group:  mbData.radio.group,
        data_rate: mbData.radio.data_rate,
        queue:  mbData.radio.queue,
        length:  mbData.radio.length,
        power: mbData.radio.power
    },
    init: function () {
        // 初始化模拟外部操作界面
        var val = $('#monitor_select').children('option:selected').val();
        $('#monitor_' + val + '_div').show();
        $('#monitor_select').change(function () {
            var options = $(this).children('option');
            for (var i = 0; i < options.length; i ++) {
                var id = '#monitor_' + options[i].value + '_div';
                $(id).hide();
            }
            var val = $(this).children('option:selected').val();
            var id = '#monitor_' + val + '_div';
            $(id).show();
        });

        // 温度界面
        var ts = $("#temperature_slider").slider();
        ts.slider('setValue', mbData.temperature);
        $("#curr_temperature").text(mbData.temperature);
        $("#temperature_slider").on("slide", function(slideEvt) {
            $("#curr_temperature").text(slideEvt.value);
        });

        // 指南针界面
        var compass_el_arr = ['compass_heading', 'compass_x', 'compass_y', 'compass_z'];
        for (var i = 0; i < compass_el_arr.length; i ++) {
            var key = compass_el_arr[i].split('_')[1];
            var sdr = $("#" + compass_el_arr[i] + "_slider").slider();
            sdr.slider('setValue', mbData.compass[key]);
            $("#curr_" + compass_el_arr[i]).text(mbData.compass[key]);
            $("#" + compass_el_arr[i] + "_slider").on("slide", function(slideEvt) {
                var sliderId = slideEvt.currentTarget.getAttribute('id').replace('_slider', '');
                $("#curr_" + sliderId).text(slideEvt.value);
            });
        }

        // 超声波测距界面
        var ts = $("#HCSR04_slider").slider();
        ts.slider('setValue', mbData.distance);
        $("#curr_HCSR04").text(mbData.distance);
        $("#HCSR04_slider").on("slide", function(slideEvt) {
            $("#curr_HCSR04").text(slideEvt.value);
        });
        // 无线通信界面
       for (var each in ui.client_radio_data){
            $('#radio_'+ each).val(ui.client_radio_data[each])
       }

    },
    reset: function () {

    },
    bindBtnEvent: function (btn_id, mod_btn_arr) {
        $('#' + btn_id).on("mousedown mouseup click", function(e) {
            for (var i = 0; i < mod_btn_arr.length; i ++) {
                switch(e.type) {
                    case 'mousedown':
                        mod_btn_arr[i].pressed = true;
                        break;
                    case 'mouseup':
                        mod_btn_arr[i].pressed = false;
                        break;
                    case 'click':
                        mod_btn_arr[i].presses ++;
                        break;
                }
            }
        });
    },
    bindSliderEvent: function (sliderId, data, key) {
        var id = "#" + sliderId + "_slider";
        $(id).on('slide', function (slideEvt) {
            data[key] = slideEvt.value;
            $("#curr_" + sliderId).text(slideEvt.value);
        })
    },
    //处理模拟器发送信息到缓冲区，点击确定才会生效！
    bindSendMessageEvent: function(btnId, data){
        var id = '#send_' + btnId + '_message';
        $(id).on('click',function(){
            if(data['buffer'].length < data['queue'])
                data['buffer'].push("\x00\x01\x00" + $('#'+ btnId + '_data').val());
        });
    },
    bindRadioSendMessageEvent: function(){
        ui.bindSendMessageEvent('radio', radio)
    },
    bindCompassEvent: function (sliderId, data, key) {
        ui.bindSliderEvent(sliderId, data, key);
    },
    bindTemperatureEvent: function (sliderId, data, key) {
        ui.bindSliderEvent(sliderId, data, key);
    },
    bindHCSR04Event: function (sliderId, data, key) {
        ui.bindSliderEvent(sliderId, data, key);
    },
    setLED: function (x, y, brightness) {
		$('.mb_led.mb_led_row_' + y + '.mb_led_col_' + x).removeClass('mb_led_brightness_1 mb_led_brightness_2 mb_led_brightness_3 mb_led_brightness_4 mb_led_brightness_5 mb_led_brightness_6 mb_led_brightness_7 mb_led_brightness_8 mb_led_brightness_9').addClass('mb_led_brightness_' + brightness);
	},
    output: function (s) {
        console.log(s);
    },
    updateMicrobitPins: function () {
        //not implement
    }
}

var sim = {
    runAsync: function (asyncFunc) {
        var p = new Promise(asyncFunc);
        var result;
        var susp = new Sk.misceval.Suspension();
        susp.resume = function() {
            return result;
        }
        susp.data = {
            type: "Sk.promise",
            promise: p.then(function(value) {
                result = value;
                return value;
            }, function(err) {
                result = "";
                console.log(err);
                return new Promise(function(resolve, reject){
                });
            })
        };
        return susp;
    }
}

$(function () {
    ui.init();
});