(function(exports){
    require('../engine/modula.js').use();

	exports.shipSprite = new RendererCanvas2d.DrawableSprite({
        pass:'ships',
        src:'img/ship_yellow.png',
        centered:true,
    });

	exports.shipSpriteBlue = exports.shipSprite.clone();
    exports.shipSpriteRed = new RendererCanvas2d.DrawableSprite({
        pass:'ships',
        src:'img/ship_blue.png',
        centered:true,
    });

    exports.buildingSprite = new RendererCanvas2d.DrawableSprite({
        pass:'buildings',
        alpha: 0.5,
        src:'img/blurred-buildings.png',
        centered:true,
        height:-1,
    });

    exports.shipHover = new RendererCanvas2d.DrawableSprite({
        pass:'ships',
        src:'img/explosion128blue.png',
        compose: 'lighter',
        alpha: 0.5,
        centered:true,
        scale:1,
    });
    exports.shipHoverBlue = exports.shipHover.clone();
    exports.shipHoverRed = new RendererCanvas2d.DrawableSprite({
        pass:'ships',
        src:'img/explosion128red.png',
        compose: 'lighter',
        alpha: 0.5,
        centered:true,
        scale:1,
    });

    exports.shipSpriteFiring = new RendererCanvas2d.DrawableSprite({
        pass:'ships',
        src:'img/ship_yellow_firing.png',
        centered:true,
    });
    
    exports.missileSprite = new RendererCanvas2d.DrawableSprite({
        pass:'projectiles',
        src:'img/projectile-green.png',
        compose: 'lighter',
        pos: new V2(-20,0),
        centered:true,
    });

    exports.missileSmoke = new RendererCanvas2d.DrawableSprite({
        pass:'projectiles',
        src:'img/smoke-green.png',
        compose: 'lighter',
        centered:true,
    });

    exports.boltSprite = new RendererCanvas2d.DrawableSprite({
        pass:'projectiles',
        src:'img/projectile-red.png',
        compose: 'lighter',
        pos: new V2(-20,0),
        centered:true,
    });

    exports.boltSmoke = new RendererCanvas2d.DrawableSprite({
        pass:'projectiles',
        src:'img/smoke-red.png',
        compose: 'lighter',
        centered:true,
    });

    exports.boltExplosion = new RendererCanvas2d.DrawableSprite({
        pass:'explosions',
        src:'img/explosion128red.png',
        compose: 'lighter',
        centered:true,
    });
    
    exports.explosionSprite = new RendererCanvas2d.DrawableSprite({
        pass:'explosions',
        src:'img/explosion128green.png',
        compose: 'lighter',
        centered:true,
    });
    
    exports.blockSpriteUnder = new RendererCanvas2d.DrawableSprite({
        src:'img/block-under.png',
        pos:new V2(-12,-16),
    });

    exports.blockSprite = new RendererCanvas2d.DrawableSprite({
        src:'img/block.png',
        pos:new V2(-12,-16),
    });

    exports.blockSpritePurpleUnder = new RendererCanvas2d.DrawableSprite({
        src:'img/block-purple-under.png',
        pos:new V2(-12,-16),
    });

    exports.blockSpritePurple = new RendererCanvas2d.DrawableSprite({
        src:'img/block-purple.png',
        pos:new V2(-12,-16),
    });

    exports.blockSpriteGray = new RendererCanvas2d.DrawableSprite({
        src:'img/block-gray.png',
        pos:new V2(-12,16),
    });

    exports.blockSpriteDark = new RendererCanvas2d.DrawableSprite({
        src:'img/block-dark-gray.png',
        pos:new V2(-12,16),
    });
})(exports);
