
(function(modula){
    // A Bounding Shapes Library

    // A Bounding Ellipse
    // cx,cy : center of the ellipse
    // rx,ry : radius of the ellipse
    function BEllipse(cx,cy,rx,ry){
        this.type = 'ellipse';
        this.x = cx-rx;     // minimum x coordinate contained in the ellipse     
        this.y = cy-ry;     // minimum y coordinate contained in the ellipse
        this.sx = 2*rx;     // width of the ellipse on the x axis
        this.sy = 2*ry;     // width of the ellipse on the y axis
        this.hx = rx;       // half of the ellipse width on the x axis
        this.hy = ry;       // half of the ellipse width on the y axis
        this.cx = cx;       // x coordinate of the ellipse center
        this.cy = cy;       // y coordinate of the ellipse center
        this.mx = cx + rx;  // maximum x coordinate contained in the ellipse
        this.my = cy + ry;  // maximum x coordinate contained in the ellipse
    }
    modula.BEllipse = BEllipse;

    // returns an unordered list of vector defining the positions of the intersections between the ellipse's
    // boundary and a line segment defined by the start and end vectors a,b
    BEllipse.prototype.collideSegment = function(a,b){
        // http://paulbourke.net/geometry/sphereline/
        var collisions = [];

        if(a.equals(b)){  //we do not compute the intersection in this case. TODO ?     
            return collisions;
        }

        // make all computations in a space where the ellipse is a circle 
        // centered on zero
        var c = new Vec2(this.cx,this.cy);
        a = a.sub(c).multXY(1/this.hx,1/this.hy);
        b = b.sub(c).multXY(1/this.hx,1/this.hy);


        if(a.lenSq() < 1 && b.lenSq() < 1){   //both points inside the ellipse
            return collisions;
        }

        // compute the roots of the intersection
        var ab = b.sub(a);
        var A = (ab.x*ab.x + ab.y*ab.y);
        var B = 2*( ab.x*a.x + ab.y*a.y);
        var C = a.x*a.x + a.y*a.y - 1;
        var u  = B * B - 4*A*C;
        
        if(u < 0){
            return collisions;
        }

        u = Math.sqrt(u);
        var u1 = (-B + u) / (2*A);
        var u2 = (-B - u) / (2*A);

        if(u1 >= 0 && u1 <= 1){
            var pos = a.add(ab.scale(u1));
            collisions.push(pos);
        }
        if(u1 != u2 && u2 >= 0 && u2 <= 1){
            var pos = a.add(ab.scale(u2));
            collisions.push(pos);
        }
        for(var i = 0; i < collisions.length; i++){
            collisions[i] = collisions[i].multXY(this.hx,this.hy);
            collisions[i] = collisions[i].addXY(this.cx,this.cy);
        }
        return collisions;
    };
    
    // returns true if the ellipse contains the position defined by the vector 'vec'
    BEllipse.prototype.containsVec = function(v){
        v = v.multXY(this.hx,this.hy);
        return v.lenSq() <= 1;
    };
    // returns true if the ellipse contains the position (x,y) 
    BEllipse.prototype.containsXY = function(x,y){
        return this.contains(new Vec2(x,y));
    };
    
    // A bounding rectangle
    // x,y the minimum coordinate contained in the rectangle
    // sx,sy the size of the rectangle along the x,y axis
    function BRect(x,y,sx,sy){
        this.type = 'rect';
        this.x = x;              // minimum x coordinate contained in the rectangle  
        this.y = y;              // minimum y coordinate contained in the rectangle
        this.sx = sx;            // width of the rectangle on the x axis
        this.sy = sy;            // width of the rectangle on the y axis
        this.hx = sx/2;          // half of the rectangle width on the x axis
        this.hy = sy/2;          // half of the rectangle width on the y axis
        this.cx = x + this.hx;   // x coordinate of the rectangle center
        this.cy = y + this.hy;   // y coordinate of the rectangle center
        this.mx = x + sx;        // maximum x coordinate contained in the rectangle
        this.my = y + sy;        // maximum x coordinate contained in the rectangle
    }

    modula.BRect = BRect;
    
    // Static method creating a new bounding rectangle of size (sx,sy) centered on (cx,cy)
    BRect.newCentered = function(cx,cy,sx,sy){
        return new BRect(cx-sx/2,cy-sy/2,sx,sy);
    };
    
    //intersect line a,b with line c,d, returns null if no intersection
    function lineIntersect(a,b,c,d){
        // http://paulbourke.net/geometry/lineline2d/
        var f = ((d.y - c.y)*(b.x - a.x) - (d.x - c.x)*(b.y - a.y)); 
        if(f == 0){
            return null;
        }
        f = 1 / f;
        var fab = ((d.x - c.x)*(a.y - c.y) - (d.y - c.y)*(a.x - c.x)) * f ;
        if(fab < 0 || fab > 1){
            return null;
        }
        var fcd = ((b.x - a.x)*(a.y - c.y) - (b.y - a.y)*(a.x - c.x)) * f ;
        if(fcd < 0 || fcd > 1){
            return null;
        }
        return new Vec2(a.x + fab * (b.x-a.x), a.y + fab * (b.y - a.y) );
    }

    // returns an unordered list of vector defining the positions of the intersections between the ellipse's
    // boundary and a line segment defined by the start and end vectors a,b

    BRect.prototype.collideSegment = function(a,b){
        var collisions = [];
        var corners = [ new Vec2(this.x,this.y), new Vec2(this.x,this.my), 
                        new Vec2(this.mx,this.my), new Vec2(this.mx,this.y) ];
        var pos = lineIntersect(a,b,corners[0],corners[1]);
        if(pos) collisions.push(pos);
        pos = lineIntersect(a,b,corners[1],corners[2]);
        if(pos) collisions.push(pos);
        pos = lineIntersect(a,b,corners[2],corners[3]);
        if(pos) collisions.push(pos);
        pos = lineIntersect(a,b,corners[3],corners[0]);
        if(pos) collisions.push(pos);
        return collisions;
    };
    
    BRect.prototype.translate = function(dpos){
        this.x  += dpos.x;
        this.mx += dpos.x;  
        this.y  += dpos.y;
        this.my += dpos.y;
    };
    
    BRect.prototype.scale = function(vec){
        this.hx *= vec.x;
        this.hy *= vec.y;
        this.sx  = this.hx * 2;
        this.sy  = this.hy * 2;
        this.x   = this.cx - this.hx;
        this.mx  = this.cx + this.hx;
        this.y   = this.cy - this.hy;
        this.my  = this.cy + this.hy;
    };
    
    BRect.prototype.clone = function(){
        return new BRect(this.x,this.y,this.sx,this.sy);
    };
    
    BRect.prototype.cloneAt = function(center){
        return new BRect(center.x - this.sx/2, center.y - this.sy/2, this.sx, this.sy);
    };
    
    // returns true if the rectangle contains the position defined by the vector 'vec'
    BRect.prototype.containsVec = function(vec){
        return ( vec.x >= this.x && vec.x <= this.mx && 
                 vec.y >= this.y && vec.y <= this.my  );
    };
    // returns true if the rectangle contains the position (x,y) 
    BRect.prototype.containsXY = function(x,y){
        return ( x >= this.x && x <= this.mx && 
                 y >= this.y && y <= this.my  );
    };
    
    function boundCollides(amin, amax, bmin, bmax){
        if(amin + amax < bmin + bmax){
            return amax > bmin;
        }else{
            return amin < bmax;
        }
    }
    
    function boundEscapeDist(amin, amax, bmin, bmax){
        if(amin + amax < bmin + bmax){
            var disp = bmin - amax;
            if(disp >= 0){
                return 0;
            }else{
                return disp;
            }
        }else{
            var disp = bmax - amin;
            if(disp <= 0){
                return 0;
            }else{
                return disp;
            }
        }
    }
    
    BRect.prototype.collides = function(b){
        return boundCollides(this.x, this.mx, b.x, b.mx) && 
               boundCollides(this.y, this.my, b.y, b.my);
    };
    
    BRect.prototype.collisionAxis = function(b){
        var dx = boundEscapeDist(this.x, this.mx, b.x, b.mx); 
        var dy = boundEscapeDist(this.y, this.my, b.y, b.my);
        if( Math.abs(dx) < Math.abs(dy) ){
            return new Vec2(dx,0);
        }else{
            return new Vec2(0,dy);
        }
    };
    
    BRect.prototype.collisionVector = function(b){
        return new Vec2( 
            boundEscapeDist(this.x, this.mx, b.x, b.mx),
            boundEscapeDist(this.y, this.my, b.y, b.my)  
        );
    };
    
})(window.modula);
