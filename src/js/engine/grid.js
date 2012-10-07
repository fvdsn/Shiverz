// Modula 2D Grid
window.modula = window.modula || {};
(function(modula){

    modula.Grid = modula.Class.extend({
        init: function(options){
            options = options || {};
            this._cellX = this.get('cellX') || options.cellX || 1;
            this._cellY = this.get('cellY') || options.cellY || 1;
            this._cellSize = this.get('cellSize');
            if(!this._cellSize && options.cellSize){
                if(typeof options.cellSize === 'number'){
                    this._cellSize = new Vec2(options.cellSize, options.cellSize);
                }else{
                    this._cellSize = options.cellSize.clone();
                }
            }else{
                this._cellSize = new Vec2(32,32);
            }
            this._invCellSize = new Vec2(1 / this._cellSize.x, 1 / this._cellSize.y);
            this._size = new Vec2( this._cellX * this._cellSize.x,
                                  this._cellY * this._cellSize.y  );

            this._cell = this._cell || options.cells || [];
            if(options.fill !== undefined && !options.cells){
                this.fill(options.fill);
            }
        },
        _set_cell: function(index,cell){
            if(index[0] >= 0 && index[0] < this._cellX && index[1] >= 0 && index[1] < this._cellY){
                this._cell[index[1]*this._cellX+index[0]] = cell;
            }
        },
        _get_cell: function(index){
            if(!index){
                return this._cell;
            }else if(index[0] < 0 || index[0] >= this._cellX || index[1] < 0 || index[1] >= this._cellY){
                return undefined;
            }else{
                return this._cell[index[1]*this._cellX+index[0]]; 
            }
        },
        _get_cells: function(){
            return this._cell;
        },
        getCellUnsafe: function(x,y){
            return this._cell[y*this._cellX+x];
        },
        getCell: function(x,y){
            if(x >= 0 && y >= 0 && x < this._cellX && y < this._cellY){
                return this._cell[y*this._cellX+x];
            }else{
                return undefined;
            }
        },
        fill: function(cell){
            for(var x = 0; x < this._cellX; x++){
                for (var y = 0; y < this._cellY; y++){
                    this._cell[y*this._cellX + x] = cell;
                }
            }
        },
        _get_bound: function(index){
            if(index){
                var csize = this.get('cellSize');
                return new modula.Rect(index[0] * csize.x, index[1] * csize.x, csize.x, csize.y );
            }else{
                return new modula.Rect(0,0,this.get('size').x, this.get('size').y);
            }
        },
        getBoundUnsafe: function(x,y){
            return new modula.Rect(x * this._cellSize.x, y * this._cellSize.y, this._cellSize.x, this._cellSize.y);
        },
        getCellAtPixel: function(pos){
            var size = this.get('size');
            if(pos.x < 0 || pos.x >= size.x || pos.y < 0 || pos.y >= size.y){
                return undefined;
            }else{
                var csize = this.get('cellSize');
                var x = Math.max(0,Math.min(this._cellX - 1,Math.floor(pos.x/csize.x)));
                var y = Math.max(0,Math.min(this._cellY - 1,Math.floor(pos.y/csize.y)));
                return { x:x, y:y, cell:this.getCellUnsafe(x,y)};
            }
        },
        getCellsInRect: function(minx, miny, maxx, maxy){
            var size = this._size;
            if(maxx <= 0 || maxy <= 0){
                return [];
            }else if(minx >= size.x || miny >= size.y){
                return [];
            }else{
                var csize = this._cellSize.clone();
                csize.x = 1.0 / csize.x;
                csize.y = 1.0 / csize.y;
                minx = Math.floor(Math.max(minx,0) * csize.x);
                miny = Math.floor(Math.max(miny,0) * csize.y);
                maxx = Math.floor(Math.min(maxx,size.x-1) * csize.x);
                maxy = Math.floor(Math.min(maxy,size.y-1) * csize.y);
                var cells = [];
                for(var x = minx; x <= maxx; x++){
                    for(var y = miny; y <= maxy; y++){
                        cells.push({x:x, y:y, cell: this.getCellUnsafe(x,y)});
                       }
                }
                return cells;
            }
        },
        getColldingCells: function(bound){
            var Rect  = modula.Rect;
            if(!Rect){
                return [];
            }else{
                var cells = this.getCellsInRect(bound.minX(), bound.minY(), bound.maxX(), bound.maxY());
                var csize = this._cellSize;
                var ccells = [];
                for(var i = 0, len = cells.length; i < len; i++){
                    var cell = cells[i];
                    var rect = new Rect( cell.x * csize.x,
                                                cell.y * csize.y,
                                                csize.x,
                                                csize.y );
                    if( bound.collides(rect)){
                        cell.bound = rect;
                        ccells.push(cell);
                    }
                }
                return ccells;
            }
        },
        collisionVec: function(bound, isSolid){
            var self  = this;

            var pos   = bound.center();
            var minX  = bound.minX();
            var minY  = bound.minY();
            var maxX  = bound.maxX();
            var maxY  = bound.maxY();
     
            var cx    = this._cellX;
            var cy    = this._cellY;
            var csx   = this._cellSize.x;
            var csy   = this._cellSize.y;


            if(maxX <= 0 || maxY <= 0 || minX >= cx*csx || minY >= cy*csy){
                return;
            }

            function is_solid(x,y){
                var cell = self.getCell(x,y);
                return (cell!== undefined) && isSolid(cell,x,y);
            }

            //we transform everything so that the cells are squares of size 1.

            var isx   = 1 / csx;
            var isy   = 1 / csy;

            minX *= isx;
            minY *= isy;
            maxX *= isx;
            maxY *= isy

            var min_px = Math.floor(minX);
            var max_px = Math.floor(maxX);
            var min_py = Math.floor(minY);
            var max_py = Math.floor(maxY);

            // these are the distances the entity should be displaced to escape
            // left blocks, right blocks, up ... 

            var esc_l = (min_px + 1 - minX) * csx;
            var esc_r = -( maxX - max_px )  * csx;  
            var esc_u = (min_py + 1 - minY) * csy;
            var esc_d = -( maxY - max_py )  * csy;

            // at this point we are back in world sizes 

            if(min_px === max_px && min_py === max_py){
                // in the middle of one block
                if(is_solid(min_px,min_py)){
                    var dx = esc_l < -esc_r ? esc_l : esc_r;
                    var dy = esc_u < -esc_d ? esc_u : esc_d;
                    if(Math.abs(dx) < Math.abs(dy)){
                        return new Vec2(dx,0);
                    }else{
                        return new Vec2(0,dy);
                    }
                }else{
                    return undefined;
                }
            }else if(min_px === max_px){
                // in the middle of one vertical two-block rectangle
                var solid_u = is_solid(min_px,min_py);
                var solid_d = is_solid(min_px,max_py);
                if(solid_u && solid_d){
                    return null; // error
                }else if(solid_u){
                    return new Vec2(0,esc_u);
                }else if(solid_d){
                    return new Vec2(0,esc_d);
                }else{
                    return undefined;
                }
            }else if(min_py === max_py){
                // in the middle of one horizontal two-block rectangle
                var solid_l = is_solid(min_px,min_py);
                var solid_r = is_solid(max_px,min_py);
                if(solid_l && solid_r){
                    return null; // error
                }else if(solid_l){
                    return new Vec2(esc_l,0);
                }else if(solid_r){
                    return new Vec2(esc_r,0);
                }else{
                    return undefined;
                }
            }else{
                // touching four blocks
                var solid_ul = is_solid(min_px,min_py);
                var solid_ur = is_solid(max_px,min_py);
                var solid_dl = is_solid(min_px,max_py);
                var solid_dr = is_solid(max_px,max_py);
                var count = 0 + solid_ul + solid_ur + solid_dl + solid_dr;
                if(count === 0){
                    return undefined;
                }else if(count === 4){
                    return null; // error
                }else if(count >= 2){
                    var dx = 0;
                    var dy = 0;
                    if(solid_ul && solid_ur){
                        dy = esc_u;
                    }
                    if(solid_dl && solid_dr){
                        dy = esc_d;
                    }
                    if(solid_dl && solid_ul){
                        dx = esc_l;
                    }
                    if(solid_dr && solid_ur){
                        dx = esc_r;
                    }
                    if(count === 2){
                        if(solid_dr && solid_ul){
                            return null; //WIP
                        }else if(solid_dl && solid_ur){
                            return null; //WIP
                        }
                    }
                    return new Vec2(dx,dy);
                }else{
                    if(solid_dl){
                        return -esc_d < esc_l ? new Vec2(0,esc_d) : new Vec2(esc_l,0);
                    }else if(solid_dr){
                        return -esc_d < -esc_r ? new Vec2(0,esc_d) : new Vec2(esc_r,0);
                    }else if(solid_ur){
                        return esc_u < -esc_r ? new Vec2(0,esc_u) : new Vec2(esc_r, 0);
                    }else{
                        return esc_u < esc_l ? new Vec2(0,esc_u) : new Vec2(esc_l,0);
                    }
                }
            }
        },
    });
    modula.DrawableGrid = modula.Renderer.Drawable2d.extend({
        init: function(options){
            options = options || {};
            this.pass = options.pass || this.pass;
            this.height = options.height || this.height;
            this.zindex = options.zindex || this.zindex;
            this.grid = options.grid;
            this._drawables = options.drawables || {};
            if(options.spriteMap){
                sprites = options.spriteMap.get('spriteNames');
                for(var i = 0, len = sprites.length; i < len; i++){
                    this._drawables[sprites[i]] = options.spriteMap.get('sprite',sprites[i]);
                }
            }
        },
        clone: function(){
            return new modula.DrawableGrid({
                height: this.height,
                zindex: this.zindex,
                drawables: this._drawables,
                grid: this.grid,
            });
        },
        draw: function(renderer, ent, camera){
            var cx = this.grid._cellX;
            var cy = this.grid._cellY;
            var size = this.grid._cellSize; 

            for(var x = 0; x < cx; x++){
                for(var y = 0; y < cy; y++){
                    var cell = this.grid.getCellUnsafe(x,y);
                    var drawable = this._drawables[cell];
                    if(drawable){
                        var px = x * size.x;
                        var py = y * size.y;
                        renderer.context.save();
                        renderer.context.translate(px,py);
                        drawable.draw(renderer,ent);
                        renderer.context.restore();
                    }
                }
            }
        },
    });
})(modula);
