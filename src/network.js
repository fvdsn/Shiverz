window.modula = window.modula || {};

(function(modula){
    modula.getLocalUid : function(uid){
        return uid & ((2 << 26) - 1);
    },
    modula.getOwnerUid : function(uid){
        return uid >> 26;
    },
    modula.Connection = modula.Class.extend({
        init: function(options){
            options = options || {};
            this.remoteUrl;
            this.remoteUid;
            this.localUrl;
            this.ping = 0;
    });
    modula.Main = modula.Main.extend({
        init: function(options){
            options = options || {};
            this._super(options);
            this._maxLocalUid = (2 << 26);
            this._localUid = this._localUid
                || options.localUid
                || Math.floor(Math.random() * this_maxLocalUid);
            this._serverUrl = this.get('serverUrl') || options.serverUrl || null;
            this._isServer  = !this._serverUrl;
            this._networkStatus = this._isServer ? 'connected' : 'disconnected';
        },
        getLocalUid : function(){
            return this._localUid;
        },
        getNextUid  : function(){
            this._nextUid += 1;
            return this._localUid << 26 + this._nextUid;
        },
    });

})(modula);
