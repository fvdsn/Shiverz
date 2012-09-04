
window.modula = window.modula || {}; 

(function(modula){

    modula.draw = {};

    modula.draw.setContext = function(context){
        modula.draw.context = context;
        return modula.draw;
    };
    modula.draw.line = function(from, to, color){
        var c = modula.draw.context;
        if(color){
            c.save();
            c.strokeStyle = color;
        }
        c.beginPath();
        c.moveTo(from.x,from.y);
        c.lineTo(to.x,to.y);
        c.closePath();
        c.stroke();
        
        if(color){
            c.restore();
        }
        return modula.draw;
    };

    modula.draw.line_at = function(pos, segment, color){
        modula.draw.line(pos,pos.add(segment),color);
        return modula.draw;
    };

    modula.draw.circle = function(pos,radius, color){
        var c = modula.draw.context;
        if(color){
            c.save();
            c.strokeStyle = color;
        }
        c.beginPath();
        c.arc(pos.x,pos.y,radius,0,2*Math.PI);
        c.closePath();
        c.stroke();

        if(color){
            c.restore();
        }
        return modula.draw;
    };

    modula.draw.disc = function(pos,radius, color){
        var c = modula.draw.context;
        if(color){
            c.save();
            c.fillStyle = color;
        }
        c.beginPath();
        c.arc(pos.x,pos.y,radius,0,2*Math.PI);
        c.closePath();
        c.fill();

        if(color){
            c.restore();
        }
        return modula.draw;
    };
    
    modula.draw.centeredRect = function(center,size,color){
        var c = modula.draw.context;
        var hx = size.x * 0.5;
        var hy = size.y * 0.5;
        if(color){
            c.save();
            c.strokeStyle = color;
        }
        
        c.strokeRect(center.x - size.x*0.5, center.y - size.y * 0.5, size.x, size.y);
        
        if(color){
            c.restore();
        }
    };

    if(modula.Vec2){
        
        var proto = modula.Vec2.prototype;
        
        proto.draw = function(color){
            modula.draw.line(new Vec2(0,0), this, color);
            return this;
        };

        proto.drawAt = function(pos,color){
            modula.draw.lineAt(pos,this,color);
            return this;
        };
    }

    if(modula.Transform2){

        var proto = modula.Transform2.prototype;

        proto.drawToWorld = function(size){
            size = size || 10;
            var center = this.getWorldPos();
            var x = this.localToWorld(new Vec2(size,0));
            var y = this.localToWorld(new Vec2(0,size));
            var c = modula.draw.context;

            c.save();
            
            c.strokeStyle = 'red';
            c.beginPath();
            c.moveTo(center.x,center.y);
            c.lineTo(x.x,x.y);
            c.closePath();
            c.stroke();

            c.strokeStyle = 'green';
            c.beginPath();
            c.moveTo(center.x,center.y);
            c.lineTo(y.x,y.y);
            c.closePath();
            c.stroke();

            c.restore();
        };
    }

})(window.modula);




