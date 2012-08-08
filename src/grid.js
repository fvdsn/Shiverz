window.modula = window.modula || {};

(function(modula){
    var Vec2 = modula.Vec2;

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
    });
    modula.DrawableGrid = modula.Renderer.Drawable2d.extend({
        init: function(options){
            options = options || {};
            this.pass = options.pass || this.pass;
            this.height = options.height || this.height;
            this.zindex = options.zindex || this.zindex;
            console.log(this.pass);
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
                        context.save();
                        context.translate(px,py);
                        drawable.draw(renderer,ent);
                        context.restore();
                    }
                }
            }
        },
    });
})(modula);
