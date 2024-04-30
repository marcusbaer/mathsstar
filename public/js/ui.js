var UI = function(isNode){

    var UI = {

        // overlay
        overlayOpened: false,

        // TYPES
        ZR20: 20,
        ZR100: 100,
        CALCMINUS: -1,
        CALCPLUS: 1,

        // MODES
        ZR: null,
        CALCMODE: null,

        // STATISTICS
        mistakes: 0,
        total: 0,
        tasklog: [],
        recall: [],
        task: null,

        isNode: (isNode) ? true : false,

        initialize: function() {
            this.bindEvents();
        },

        bindEvents: function() {
            document.addEventListener('DOMContentLoaded', this.onDeviceReady, false);
            // document.addEventListener('deviceready', this.onDeviceReady, false);
        },

        onDeviceReady: function() {
            UI.receivedEvent('deviceready');
        },

        receivedEvent: function(eventId) {
            var parentElement = document.getElementById(eventId);
            var listeningElement = parentElement.querySelector('.listening');
            var receivedElement = parentElement.querySelector('.received');

            listeningElement.setAttribute('style', 'display:none;');
            receivedElement.setAttribute('style', 'display:block;');

            //console.log('Received Event: ' + eventId);

            if (eventId === 'deviceready') {
                this.initTest();
                //this.initSwipes();
            }

        },

        _showOptionsOverlay: function () {
          this.overlayOpened = true;
          $('#overlay').animate({left: 0});
        },

        _hideOptionsOverlay: function () {
          this.overlayOpened = false;
          $('#overlay').animate({left: '-280px'});
        },

        _toggleZR: function () {
            this._changeZR((this.ZR === this.ZR20) ? this.ZR100 : this.ZR20);
        },

        _changeZR: function (value) {
            this.ZR = value;
            if (this.isNode) return;
            var el = window.document.getElementById('zr');
            el.innerHTML = ' ' + this.ZR;
            el.className = (this.ZR === this.ZR20) ? 'icon-toggle-off' : 'icon-toggle-on';
        },

        _toggleCalcMode: function () {
            this._changeCalcMode((this.CALCMODE === this.CALCMINUS) ? this.CALCPLUS : this.CALCMINUS);
        },

        _changeCalcMode: function (mode) {
            this.CALCMODE = mode;
            if (this.isNode) return;
            window.document.getElementById('calcmode').value = (this.CALCMODE === this.CALCMINUS) ? '-' : '+';
            window.document.getElementById('calcmode').blur();
        },

        _resetTasks: function () {
            this.tasklog = [];
            this.recall = [];
            this.mistakes = 0;
            this.total = 0;
            if (this.isNode) return;
            window.document.getElementById('total').innerHTML = this.total;
            window.document.getElementById('mistakes').innerHTML = this.mistakes;
            window.document.getElementById('succeeded').innerHTML = this.total - this.mistakes;
        },

        _getRandomNumbers: function () {
            if (this.CALCMODE > 0) {
                do {
                    var first = Math.round(Math.random()*this.ZR);
                    var second = Math.round(Math.random()*this.ZR);
                    var third = null;
                } while (first+second>this.ZR);
            } else {
                do {
                    var first = Math.round(Math.random()*this.ZR);
                    var second = Math.round(Math.random()*this.ZR);
                    var expected = Math.round(Math.random()*this.ZR);
                    var first = second + expected;
                    var third = null;
                } while (second+expected>this.ZR);
            }
            return [first, second, third];
        },

        _nextTask: function () {
            var chanceForRecallTask = this.recall.length * 0.05;
            if (this.recall.length && Math.random() <= chanceForRecallTask) {
                this._recallTask();
            } else {
                this._newTask();
            }
        },

        _recallTask: function () {
            if (this.recall.length) {
                var task = this.recall.shift();
                task.recalls += 1;
                task.userInput = null;
                task.userSuccess = null;
                task.userDuration = null;
                this.task = task;
                this._showTask(this.task);
            }
        },

        _newTask: function () {
            this.task = {
                numbers: this._getRandomNumbers(),
                calcMode: this.CALCMODE,
                testedNumberIndex: 2,
                recalls: 0,
                userInput: null,
                userSuccess: null,
                userDuration: null
            };
            this._showTask(this.task);
            return this.task;
        },

        _showTask: function (task) {
            if (this.isNode) return;
            window.document.getElementById('calcmode').value = (task.calcMode === this.CALCMINUS) ? '-' : '+';
            for (var i=0; i<task.numbers.length; i+=1) {
                window.document.getElementById('number-'+i).value = (task.numbers[i] === null) ? '' : task.numbers[i];
                // disable all for now
                window.document.getElementById('number-'+i).disabled = true;
                if (task.numbers[i] === null) {
                    window.document.getElementById('number-'+i).className = 'enabled';
                    //window.document.getElementById('number-'+i).disabled = false;
                } else {
                    window.document.getElementById('number-'+i).className = 'disabled';
                    //window.document.getElementById('number-'+i).disabled = true;
                }
            }
        },

        _showSuccess: function (success) {

            if (this.isNode) return;

            var el = window.document.getElementById('feedback');

            if (success === undefined) {

                el.className = '';
                el.innerHTML = '???';

            } else {

                window.document.getElementById('total').innerHTML = this.total;
                window.document.getElementById('mistakes').innerHTML = this.mistakes;
                window.document.getElementById('succeeded').innerHTML = this.total - this.mistakes;

                var happyIcons = ['icon-emo-happy', 'icon-emo-squint', 'icon-emo-wink', 'icon-emo-thumbsup', 'icon-emo-grin', 'icon-emo-laugh', 'icon-emo-wink2', 'icon-emo-tongue'];
                var sadIcons = ['icon-emo-sleep', 'icon-emo-displeased', 'icon-emo-surprised', 'icon-emo-angry', 'icon-emo-unhappy', 'icon-emo-cry'];
                var iconToUse = (success) ? happyIcons[Math.round(Math.random()*(happyIcons.length-1))] : sadIcons[Math.round(Math.random()*(sadIcons.length-1))];

                el.className = (success) ? 'success ' + iconToUse : 'mistake ' + iconToUse;
                el.innerHTML = '';
                //setTimeout(function(){
                //    el.innerHTML = '';
                //}, 2000);

            }

        },

        _startTest: function () {
            this._resetTasks();
            this._newTask();
        },

        _onKey: function (el) {
            var key = el.getAttribute("data-key");
            if (key === 'OK') {
                this._onConfirm();
            } else if (key === 'C') {
                // delete last number
                var inputFieldValue = window.document.getElementById('number-2').value;
                window.document.getElementById('number-2').value = inputFieldValue.substr(0, inputFieldValue.length-1);
            } else if (window.document.getElementById('number-2').value.length < 3) {
                window.document.getElementById('number-2').value += key;
            }
        },

        _onConfirm: function () {

            // insert user input into task
            var inputFieldValue = window.document.getElementById('number-2').value;
            if (inputFieldValue === '') {
                this._showSuccess();
            } else {

                this.task.userInput = window.document.getElementById('number-2').value;
                this.task.userSuccess = (this.task.numbers[0]+(this.task.calcMode*this.task.numbers[1]) === Number(this.task.userInput));

                //console.log(this.task);

                // memorize task
                this.tasklog.push(this.task);
                this.total += 1;

                // add failed tasks to recall cue
                if (!this.task.userSuccess) {
                    this.mistakes += 1;
                    this.recall.push(this.task);
                }

                // display feedback
                this._showSuccess(this.task.userSuccess);

                // go to next task, from recall or have a new one
                this._nextTask();
            }

        },

        initTest: function () {
            var self = this;
            this._changeZR(this.ZR20);
            this._changeCalcMode(this.CALCPLUS);
            this._startTest();
            if (this.isNode) return;

            function isTouchDevice () {
              return 'ontouchstart' in window;
            }

            var touchTriggerAction = isTouchDevice() ? "touchend" : "click";

            // window.document.getElementById('overlay-toggle-open').addEventListener(touchTriggerAction, function(ev){
            //     self._showOptionsOverlay();
            // }, false);
            // window.document.getElementById('overlay-toggle-close').addEventListener(touchTriggerAction, function(ev){
            //     self._hideOptionsOverlay();
            // }, false);
            window.document.getElementById('zr').addEventListener(touchTriggerAction, function(ev){
                // restart test
                self._toggleZR();
                window.document.getElementById('feedback').className = '';
                self._startTest();
            }, false);
            window.document.getElementById('calcmode').addEventListener(touchTriggerAction, function(ev){
                // restart test
                self._toggleCalcMode();
                window.document.getElementById('feedback').className = '';
                self._startTest();
            }, false);
            window.document.getElementById('total').addEventListener(touchTriggerAction, function(ev){
                // restart test
                window.document.getElementById('feedback').className = '';
                self._startTest();
            });
            var keys = window.document.getElementsByClassName('key');
            for (var i=0; i<keys.length; i+=1) {
                keys[i].addEventListener(touchTriggerAction, function(ev){
                    self._onKey(ev.target);
                });
            }
        },

        initSwipes: function () {

            //var slides = document.getElementsByClassName('slide');
            //var activeSlide = 0;
            //
            //var myhammer = new Hammer(document.getElementsByTagName('body')[0], {});
            //myhammer.on('swiperight', function(ev) {
            //    ev.preventDefault();
            //    if (activeSlide === 1) {
            //        slides[0].className = 'slide active';
            //        slides[1].className = 'slide';
            //        activeSlide = 0;
            //    }
            //});
            //myhammer.on('swipeleft', function(ev) {
            //    ev.preventDefault();
            //    if (activeSlide === 0) {
            //        slides[0].className = 'slide';
            //        slides[1].className = 'slide active';
            //        activeSlide = 1;
            //    }
            //});
        },

        testCircleCollision: function (circle1, circle2) {

            //var circle1 = {radius: 20, x: 5, y: 5};
            //var circle2 = {radius: 12, x: 10, y: 5};
            //console.log(this.testCircleCollision(circle1, circle2));

            // get circles like this: circle1 = {radius: 20, x: 5, y: 5};
            var dx = circle1.x - circle2.x;
            var dy = circle1.y - circle2.y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            return (distance < circle1.radius + circle2.radius); // true if collision
        }

    };

    return UI;

};

var App = function(obj) {
    if (obj instanceof UI) return obj;
    if (!(this instanceof UI)) return new UI(obj);
    this._wrapped = obj;
};

(function () {

    // Establish the root object, `window` in the browser, or `global` on the server.
    var root = this;

    // Create a reference to this
    var app = new App();

    var isNode = false;

    // Export the Underscore object for **CommonJS**, with backwards-compatibility
    // for the old `require()` API. If we're not in CommonJS, add `_` to the
    // global object.
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = app;
        root.app = app;
        isNode = true;
    } else {
        root.app = app.initialize();
    }
})();
