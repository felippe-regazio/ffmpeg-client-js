"use strict";var _createClass=function(){function s(e,t){for(var r=0;r<t.length;r++){var s=t[r];s.enumerable=s.enumerable||!1,s.configurable=!0,"value"in s&&(s.writable=!0),Object.defineProperty(e,s.key,s)}}return function(e,t,r){return t&&s(e.prototype,t),r&&s(e,r),e}}();function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var FFMPEGClientProcessors=function(){function t(e){_classCallCheck(this,t),this.FF=e}return _createClass(t,[{key:"process",value:function(e){return this.FF.run(e)}},{key:"trim",value:function(e,t,r){return r.args="-i {{file}} -ss "+e+" -to "+t+" -c:v copy -c:a copy {{file}}",this.process(r)}},{key:"split",value:function(e,t){return t.args='-i "{{file}}" -c copy -map 0 -segment_time '+e+" -f segment -reset_timestamps 1 %03d_{{file_slugify}}",this.process(t)}},{key:"thumb",value:function(e,t){return t.args="-i {{file}} -ss "+e+" -vframes 1 {{file}}.thumb.png",this.process(t)}}]),t}();