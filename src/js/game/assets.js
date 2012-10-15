window.import_assets = function(module){
	module.assets = {};
	
	module.assets.shipSprite = new RendererCanvas2d.DrawableSprite({
        pass:'ships',
        src:'img/ship_yellow.png',
        centered:true,
    });

    module.assets.buildingSprite = new RendererCanvas2d.DrawableSprite({
        pass:'buildings',
        alpha: 0.5,
        src:'img/blurred-buildings.png',
        centered:true,
        height:-1,
    });

    module.assets.shipHover = new RendererCanvas2d.DrawableSprite({
        pass:'ships',
        src:'img/explosion128blue.png',
        compose: 'lighter',
        alpha: 0.5,
        centered:true,
        scale:1,
    });

    module.assets.shipSpriteFiring = new RendererCanvas2d.DrawableSprite({
        pass:'ships',
        src:'img/ship_yellow_firing.png',
        centered:true,
    });
    
    module.assets.missileSprite = new RendererCanvas2d.DrawableSprite({
        pass:'projectiles',
        src:'img/projectile-green.png',
        compose: 'lighter',
        pos: new V2(-20,0),
        centered:true,
    });

    module.assets.missileSmoke = new RendererCanvas2d.DrawableSprite({
        pass:'projectiles',
        src:'img/smoke-green.png',
        compose: 'lighter',
        centered:true,
    });

    module.assets.boltSprite = new RendererCanvas2d.DrawableSprite({
        pass:'projectiles',
        src:'img/projectile-red.png',
        compose: 'lighter',
        pos: new V2(-20,0),
        centered:true,
    });

    module.assets.boltSmoke = new RendererCanvas2d.DrawableSprite({
        pass:'projectiles',
        src:'img/smoke-red.png',
        compose: 'lighter',
        centered:true,
    });

    module.assets.boltExplosion = new RendererCanvas2d.DrawableSprite({
        pass:'explosions',
        src:'img/explosion128red.png',
        compose: 'lighter',
        centered:true,
    });
    
    module.assets.explosionSprite = new RendererCanvas2d.DrawableSprite({
        pass:'explosions',
        src:'img/explosion128green.png',
        compose: 'lighter',
        centered:true,
    });
    
    module.assets.blockSpriteUnder = new RendererCanvas2d.DrawableSprite({
        src:'img/block-under.png',
        pos:new V2(-12,-16),
    });

    module.assets.blockSprite = new RendererCanvas2d.DrawableSprite({
        src:'img/block.png',
        pos:new V2(-12,-16),
    });

    module.assets.blockSpritePurpleUnder = new RendererCanvas2d.DrawableSprite({
        src:'img/block-purple-under.png',
        pos:new V2(-12,-16),
    });

    module.assets.blockSpritePurple = new RendererCanvas2d.DrawableSprite({
        src:'img/block-purple.png',
        pos:new V2(-12,-16),
    });

    module.assets.blockSpriteGray = new RendererCanvas2d.DrawableSprite({
        src:'img/block-gray.png',
        pos:new V2(-12,16),
    });

    module.assets.blockSpriteDark = new RendererCanvas2d.DrawableSprite({
        src:'img/block-dark-gray.png',
        pos:new V2(-12,16),
    });
};
