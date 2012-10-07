window.launch_game = function(module){
    modula.use();
    import_settings(module);
    import_assets(module);
    import_ents(module);
    import_game(module);
    window.game = new module.Game();
    window.m = module;
    game.start();
};
window.onload = function(){
    launch_game(window);
};
