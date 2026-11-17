const gravity = 2.0;

class Neko{
    static STATE = {
        WAIT: "wait",
        JUMP: "jump",
        FALL: "fall"
    }

    global_init;
    state;
    position_x;
    position_y;
    velocity_x;
    velocity_y;
    sprite;
    width = 32;

    constructor(init){
        this.state = Neko.STATE.WAIT;
        this.global_init = init;
        this.position_x = 225;
        this.position_y = 450;
        this.velocity_x = 0;
        this.velocity_y = 0;
        this.wait();
    }

    wait(){
        if(this.sprite){
            this.sprite.remove();
        }

        this.state = Neko.STATE.WAIT;
        this.sprite = Sprite("neko_wait")
            .addChildTo(this.global_init)
            .setOrigin(0.3, 1)
            .setPosition(this.position_x, this.position_y)
            .setInteractive(true);
    }

    jump(power, angle, obj_list){
        this.state = Neko.STATE.JUMP;
        this.velocity_x = Math.cos((Math.PI / 180.0) * angle) * power;
        this.velocity_y = Math.sin((Math.PI / 180.0) * angle) * power;
        this.sprite.remove();
        this.sprite = Sprite("neko_jump")
            .addChildTo(this.global_init)
            .setOrigin(0.5, 1)
            .setPosition(this.position_x, this.position_y);
        this.sprite.update = () => {
            var pre_y = this.position_y;

            this.velocity_y += gravity;
            this.setPosition(this.position_x + this.velocity_x, this.position_y + this.velocity_y);

            if(this.velocity_x < 0){
                this.sprite.setScale(1, 1);
            }
            else{
                this.sprite.setScale(-1, 1);
            }

            obj_list.forEach(obj => {
                var neko_center_x = this.position_x,
                    neko_center_y = this.position_y - this.width / 2.0,
                    distance_x = Math.abs(neko_center_x - obj.position_x),
                    distance_y = Math.abs(neko_center_y - obj.position_y);

                if(this.state != Neko.STATE.JUMP){
                    return;
                }

                if(obj.is_dead){
                    return;
                }

                if(obj.tag == "bar"){
                    if(this.velocity_y > 0){
                        var neko_left = this.position_x - this.width / 2,
                            neko_right = this.position_x + this.width / 2,
                            bar_left = obj.position_x - obj.width / 2,
                            bar_right = obj.position_x + obj.width / 2;

                        if(pre_y <= obj.position_y && obj.position_y <= this.position_y &&
                            neko_left < bar_right &&
                            bar_left < neko_right
                        ){
                            this.setPosition(this.position_x, obj.position_y);
                            this.wait();
                            MySoundManager.playSE("se:landing");
                        }
                    }
                }
                if(obj.tag == "item"){

                    if(distance_x < (this.width / 2.0 + obj.width / 2.0) &&
                        distance_y < this.width / 2.0 + obj.width / 2.0){
                        obj.getItem();
                    }
                }
                if(obj.tag == "damage"){
                    if(((neko_center_x - obj.position_x) * (neko_center_x - obj.position_x) + 
                        (neko_center_y - obj.position_y) * (neko_center_y - obj.position_y)) <
                        (this.width / 2 + obj.radius) * (this.width / 2 + obj.radius)){
                        this.down();
                        MySoundManager.playSE("se:damage_toge");
                    }
                }
            });
        };
        MySoundManager.playSE("se:jump");

        var seNum = Math.random();

        if(seNum < 0.33){
            MySoundManager.playSE("se:cat_jump1");
        }
        else if(seNum < 0.66){
            MySoundManager.playSE("se:cat_jump2");
        }
        else{
            MySoundManager.playSE("se:cat_jump3");
        }
    }

    down(){
        this.sprite.remove();
        this.sprite = Sprite("neko_down")
            .addChildTo(this.global_init)
            .setOrigin(0.5, 1)
            .setPosition(this.position_x, this.position_y);

        this.sprite.update = () => {
            this.velocity_y += gravity;
            this.setPosition(this.position_x + this.velocity_x, this.position_y + this.velocity_y);
        }
    }

    setPosition(x, y){
        this.position_x = x;
        this.position_y = y;
        this.sprite.setPosition(x, y);
    }
}

class Bar{
    tag = "bar";
    global_init;
    position_x;
    position_y;
    width;
    rect;
    is_dead = false;

    constructor(init, position_x, position_y, width){
        this.global_init = init;
        this.position_x = position_x;
        this.position_y = position_y;
        this.width = width;
        this.rect = RectangleShape({width: this.width, height: 10, strokeWidth: 0, fill: "#da9b5a", padding: 0}).addChildTo(this.global_init)
            .setOrigin(0.5, 0)
            .setPosition(position_x, position_y);
    }

    setPosition(x, y){
        this.position_x = x;
        this.position_y = y;

        this.rect.setPosition(this.position_x, this.position_y);
    }
}

class ItemSmall{
    tag = "item";
    position_x;
    position_y;
    width = 36;
    sprite;
    scoore_manager;
    point = 100;
    is_dead = false;

    constructor(init, position_x, position_y, score_manager){
        this.position_x = position_x;
        this.position_y = position_y;
        this.sprite = new Sprite("item_small")
            .addChildTo(init)
            .setPosition(position_x, position_y)
            .setScale(0.5, 0.5);
        this.scoore_manager = score_manager;
    }

    getItem(){
        this.scoore_manager.addScore(this.point);
        this.sprite.remove();
        this.is_dead = true;
        MySoundManager.playSE("se:get_item");
    }

    setPosition(x, y){
        this.position_x = x;
        this.position_y = y;

        this.sprite.setPosition(this.position_x, this.position_y);
    }
}

class ItemMedium{
    tag = "item";
    position_x;
    position_y;
    width = 36;
    sprite;
    scoore_manager;
    point = 200;
    is_dead = false;

    constructor(init, position_x, position_y, score_manager){
        this.position_x = position_x;
        this.position_y = position_y;
        this.sprite = new Sprite("item_medium")
            .addChildTo(init)
            .setPosition(position_x, position_y)
            .setScale(0.5, 0.5);
        this.scoore_manager = score_manager;
    }

    getItem(){
        this.scoore_manager.addScore(this.point);
        this.sprite.remove();
        this.is_dead = true;
        MySoundManager.playSE("se:get_item");
    }

    setPosition(x, y){
        this.position_x = x;
        this.position_y = y;

        this.sprite.setPosition(this.position_x, this.position_y);
    }
}

class ItemBig{
    tag = "item";
    position_x;
    position_y;
    width = 36;
    sprite;
    scoore_manager;
    point = 300;
    is_dead = false;

    constructor(init, position_x, position_y, score_manager){
        this.position_x = position_x;
        this.position_y = position_y;
        this.sprite = new Sprite("item_big")
            .addChildTo(init)
            .setPosition(position_x, position_y)
            .setScale(0.5, 0.5);
        this.scoore_manager = score_manager;
    }

    getItem(){
        this.scoore_manager.addScore(this.point);
        this.sprite.remove();
        this.is_dead = true;
        MySoundManager.playSE("se:get_item");
    }

    setPosition(x, y){
        this.position_x = x;
        this.position_y = y;

        this.sprite.setPosition(this.position_x, this.position_y);
    }
}

class Toge{
    tag = "damage";
    position_x;
    position_y;
    radius = 16;
    sprite;
    constructor(init, position_x, position_y){
        this.position_x = position_x;
        this.position_y = position_y;
        this.sprite = Sprite("damage_toge")
            .addChildTo(init)
            .setPosition(position_x, position_y)
            .setScale(0.5, 0.5);
    }

    setPosition(x, y){
        this.position_x = x;
        this.position_y = y;

        this.sprite.setPosition(this.position_x, this.position_y);
    }
}

class ScoreManager{
    score = 0;
    label;

    constructor(init){
        this.label = Label("SCORE: " + this.score).addChildTo(init);
        this.label.setOrigin(0, 0);
        this.label.setPosition(0, 0);
        this.label.fontSize = 16;
        this.label.strokeWidth = 2;
        this.label.stroke = "white";
        this.initialize();
    }

    initialize(){
        this.score = 0;
    }

    addScore(score){
        this.score += score;
        this.label.text = "SCORE: " + this.score;
    }

    getScore(){
        return this.score;
    }
}

class _SoundManager{
    static _instance = null;
    audio_list = {};

    current_bgm = null;
    bgm_volume = 1.0;

    constructor(){
        if(!_SoundManager._instance){
            _SoundManager._instance = this;
        }

        return _SoundManager._instance;
    }

    loadAssets(assets){
        for (const key in assets) {
            if (!Object.hasOwn(assets, key)) continue;
            
            const file_path = assets[key];

            this.audio_list[key] = new Audio(file_path);
        }
    }

    playBGM(asset_name){
        if(this.current_bgm == this.audio_list[asset_name]){
            return;
        }

        var loopEvent = () => {
            this.audio_list[asset_name].currentTime = 0;
            this.audio_list[asset_name].play();
        };

        if(this.current_bgm){
            this.current_bgm.currentTime = 0;
            this.current_bgm.pause();
            this.current_bgm.removeEventListener("ended", loopEvent);
        }

        this.audio_list[asset_name].addEventListener("ended", loopEvent);
            this.audio_list[asset_name].volume = 0.75;
        this.audio_list[asset_name].play();
        this.current_bgm = this.audio_list[asset_name];
    }

    playSE(asset_name){
        this.audio_list[asset_name].currentTime = 0;
        this.audio_list[asset_name].play();
    }
}

MySoundManager = new _SoundManager();
