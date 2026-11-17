const ASSETS = {
    image: {
        "neko_wait": "猫_待機.png",
        "neko_jump": "猫_ジャンプ.png",
        "neko_down": "猫_やられ.png",
        "neko_down_big": "猫_やられ_大.png",
        "neko_face": "猫_顔.png",
        "arrow": "矢印.png",
        "item_small": "アイテム_小.png",
        "item_medium": "アイテム_中.png",
        "item_big": "アイテム_大.png",
        "damage_toge": "トゲ.png",
        "bg_ground_start": "背景_地面_スタート.png",
        "title": "タイトル.png"
    },
};

const SOUNDS = {
    "bgm:title": "BGM/タイトル.mp3",
    "bgm:stage1": "BGM/ステージ_昼.mp3",
    "bgm:stage2": "BGM/ステージ_夕方.mp3",
    "bgm:stage3": "BGM/ステージ_夜.mp3",
    "bgm:stage4": "BGM/ステージ_宇宙.mp3",
    "bgm:result": "BGM/リザルト.mp3",
    "se:ok": "SE/決定.mp3",
    "se:return": "SE/戻る.mp3",
    "se:jump": "SE/ジャンプ.mp3",
    "se:landing": "SE/着地.mp3",
    "se:cat_jump1": "SE/鳴き声_ジャンプ1.mp3",
    "se:cat_jump2": "SE/鳴き声_ジャンプ2.mp3",
    "se:cat_jump3": "SE/鳴き声_ジャンプ3.mp3",
    "se:cat_out": "SE/鳴き声_場外.mp3",
    "se:get_item": "SE/アイテム取得.mp3",
    "se:stage_up": "SE/ステージ上昇.mp3",
    "se:damage_toge": "SE/ダメージ.mp3"
};

// phina.js をグローバル領域に展開
phina.globalize();

MySoundManager.loadAssets(SOUNDS);

// MainScene クラスを定義
phina.define('MainScene', {
    superClass: 'DisplayScene',
    init: function() {
        this.superInit();
        // 背景色を指定
        this.backgroundColor = '#d2eaff';

        var game_group = DisplayElement().addChildTo(this),
            ui_group = DisplayElement().addChildTo(this);

        var bg_ground_sprite = Sprite("bg_ground_start")
            .addChildTo(game_group)
            .setOrigin(0.5, 1)
            .setPosition(225, 500);

        var neko = new Neko(game_group);
        var score_manager = new ScoreManager(ui_group);
        var arrow,
            pointer_start_x,
            pointer_start_y,
            power,
            pointer,
            angle,
            pointer_circle;

        var zanki = 3,
            zanki_sprites = [],
            pre_position_x,
            pre_position_y;

        for (let i = 0; i < zanki; i++) {
            var sprite = Sprite("neko_face")
                .addChildTo(ui_group)
                .setOrigin(1, 0)
                .setPosition(450 - i * 72 / 2, 0)
                .setScale(0.5, 0.5);

            zanki_sprites.push(sprite);
        }

        var ground = new Bar(game_group, 225, 450, 1000),
            obj_list = [ground];

        var y = 350, i = 0;
        while(true){
            var x = 100 + Math.random() * 250;

            obj_list.push(new Bar(game_group, x, y, 200));
            if(i == 1){
                obj_list.push(new ItemSmall(game_group, x, y - 15, score_manager));
            }

            if(y < 100){
                break;
            }

            y -= 70 + Math.random() * 30;
            i++;
        }

        // obj_list.push(new Toge(game_group, 100, 300));

        var is_camera_move = false,
            camera_speed = 10,
            stage_count = 1;

        this.onpointstart = (e) => {
            if(is_camera_move){
                return;
            }

            pointer_start_x = e.pointer.x;
            pointer_start_y = e.pointer.y;

            pointer = CircleShape({
                radius: 10,
                fill: "white",
                stroke: "black",
                strokeWidth: 3
            }).addChildTo(this)
            .setPosition(pointer_start_x, pointer_start_y);
            pointer.alpha = 0.5;
        };
        this.onpointmove = (e) => {
            if(neko.state !== Neko.STATE.WAIT){
                return;
            }

            if(is_camera_move){
                pointer_start_x = null;
                pointer_start_y = null;
                return;
            }

            if(pointer_start_x == null || pointer_start_y == null){
                return;
            }

            if(!arrow){
                arrow = Sprite("arrow")
                    .addChildTo(this)
                    .setOrigin(0.5, 0.5)
                    .setPosition(neko.position_x, neko.position_y - 10);
                pointer_circle = CircleShape({
                        radius: 10,
                        fill: "transparent",
                        stroke: "red",
                        strokeWidth: 1
                    }).addChildTo(this)
                    .setPosition(neko.position_x, neko.position_y - 10);
            }

            var rad = Math.atan2(e.pointer.y - pointer_start_y, e.pointer.x - pointer_start_x),
                deg = (180.0 / Math.PI) * rad,
                distance2 = (e.pointer.y - pointer_start_y) * (e.pointer.y - pointer_start_y) + (e.pointer.x - pointer_start_x) * (e.pointer.x - pointer_start_x),
                min_power = 22.0,
                max_power = 30.0;

            if(distance2 < 10.0 * 10.0){
                arrow.remove();
                arrow = null;
                pointer_circle.remove();
                pointer_circle = null;
                return;
            }

            power = min_power + distance2 / (200.0 * 200.0) * (max_power - min_power);
            power = Math.max(min_power, Math.min(power, max_power));
            angle = deg + 180;
            arrow.setRotation(angle)
                .setScale(1.0 + ((power - min_power) / (max_power - min_power)), 1.0);
            var pointer_circle_radius = 10 + 50 * (power - min_power) / (max_power - min_power);
            pointer_circle.radius = pointer_circle_radius;
        };
        this.onpointend = (e) => {
            if(pointer){
                pointer.remove();
                pointer = null;
            }
            if(pointer_circle){
                pointer_circle.remove();
                pointer_circle = null;
            }
            pointer_start_x = null;
            pointer_start_y = null;

            if(neko.state !== Neko.STATE.WAIT){
                return;
            }

            if(is_camera_move){
                return;
            }

            if(arrow){
                arrow.remove();
                arrow = null;
                neko.jump(power, angle, obj_list);
                pre_position_x = neko.position_x;
                pre_position_y = neko.position_y;
            }
        };

        this.update = () => {
            if(!is_camera_move && neko.state == Neko.STATE.WAIT && neko.position_y <= 100){
                is_camera_move = true;
                MySoundManager.playSE("se:stage_up");
                if(bg_ground_sprite){
                    bg_ground_sprite.update = () => {
                        bg_ground_sprite.position.y += camera_speed;
                    };
                }
                if(arrow){
                    arrow.remove();
                    arrow = null;
                }
                if(pointer){
                    pointer.remove();
                    pointer = null;
                }
                if(pointer_circle){
                    pointer_circle.remove();
                    pointer_circle = null;
                }
                pointer_start_x = null;
                pointer_start_y = null;
            }
            if(is_camera_move){
                neko.setPosition(neko.position_x, neko.position_y + camera_speed);
                obj_list.forEach(obj => obj.setPosition(obj.position_x, obj.position_y + camera_speed));

                if(neko.position_y > 400){
                    if(bg_ground_sprite){
                        bg_ground_sprite.remove();
                        bg_ground_sprite = null;
                    }

                    stage_count++;

                    if(10 < stage_count && stage_count < 30){
                        this.backgroundColor = "#ffdbcc";
                        MySoundManager.playBGM("bgm:stage2");
                    }
                    else if(30 < stage_count && stage_count < 50){
                        this.backgroundColor = "#326996";
                        MySoundManager.playBGM("bgm:stage3");
                    }
                    else if(50 <= stage_count){
                        this.backgroundColor = "#000000";
                        MySoundManager.playBGM("bgm:stage4");
                    }

                    is_camera_move = false;

                    obj_list = obj_list.filter(obj => (!obj.is_dead && obj.position_y < 460));

                    var bottom_bar_y = 300,
                        y_span = 70,
                        x_width = 250,
                        min_bar_width = 200;
                    if(stage_count <= 10){
                        min_bar_width = 200;
                        bottom_bar_y = 310;
                        y_span = 70;
                        x_width = 250;
                    }
                    else if(10 < stage_count && stage_count <= 30){
                        min_bar_width = 180;
                        bottom_bar_y = 300;
                        y_span = 80;
                        x_width = 250;
                    }
                    else if(30 < stage_count && stage_count <= 50){
                        min_bar_width = 150;
                        bottom_bar_y = 290;
                        y_span = 90;
                        x_width = 300;
                    }
                    else{
                        min_bar_width = 100;
                        bottom_bar_y = 310;
                        y_span = 100;
                        x_width = 350;
                    }

                    var y = bottom_bar_y;
                    while(true){
                        var bar_width = stage_count <= 10 ? 200 : min_bar_width - Math.random() * (stage_count - 10) * 3;
                        var x = (450 - x_width) / 2.0 + Math.random() * x_width;

                        if(y < 20){
                            y = 20;
                        }

                        obj_list.push(new Bar(game_group, x, y, Math.max(50, bar_width)));

                        if(y < 100){
                            break;
                        }

                        y -= y_span + Math.random() * 30;
                    }

                    var item_probability = 0.5;

                    if(Math.random() <= item_probability){
                        if(stage_count <= 10){
                            obj_list.push(new ItemSmall(game_group, 50 + Math.random() * 350, 50 + Math.random() * 300, score_manager));
                        }
                        else if(stage_count <= 30){
                            if(Math.random() <= 0.5){
                                obj_list.push(new ItemSmall(game_group, 50 + Math.random() * 350, 50 + Math.random() * 300, score_manager));
                            }
                            else{
                                obj_list.push(new ItemMedium(game_group, 50 + Math.random() * 350, 50 + Math.random() * 300, score_manager));
                            }
                        }
                        else{
                            if(Math.random() <= 0.5){
                                obj_list.push(new ItemMedium(game_group, 50 + Math.random() * 350, 50 + Math.random() * 300, score_manager));
                            }
                            else{
                                obj_list.push(new ItemBig(game_group, 50 + Math.random() * 350, 50 + Math.random() * 300, score_manager));
                            }
                        }
                    }

                    if(stage_count <= 10){
                        // トゲなし
                    }
                    else if(10 < stage_count && stage_count <= 30){
                        if(Math.random() <= 0.5){
                            obj_list.push(new Toge(game_group, 50 + Math.random() * 350, 50 + Math.random() * 300));
                        }
                    }
                    else if(stage_count <= 50){
                        for(let i = 0; i < 2; i++){
                            if(Math.random() <= 0.5){
                                obj_list.push(new Toge(game_group, 50 + Math.random() * 350, 50 + Math.random() * 300));
                            }
                        }
                    }
                    else{
                        obj_list.push(new Toge(game_group, 50 + Math.random() * 350, 50 + Math.random() * 300));

                        if(Math.random() <= 0.5){
                            obj_list.push(new Toge(game_group, 50 + Math.random() * 350, 50 + Math.random() * 300));
                        }
                    }

                    if(stage_count <= 10){
                        score_manager.addScore(100);
                    }
                    else if(stage_count <= 30){
                        score_manager.addScore(150);
                    }else if(stage_count <= 50){
                        score_manager.addScore(200);
                    }else{
                        score_manager.addScore(300);
                    }
                }
            }
            if(neko.position_x < -10 || 460 < neko.position_x || 460 < neko.position_y){
                if(0 < zanki){
                    zanki--;
                    neko.wait();
                    neko.setPosition(pre_position_x, pre_position_y);
                    zanki_sprites.pop().remove();
                }
                else{
                    this.exit({
                        score: score_manager.getScore()
                    });
                }
                MySoundManager.playSE("se:cat_out");
            }
        };

        MySoundManager.playBGM("bgm:stage1");
    }
});


phina.define('ResultScene', {
    superClass: 'DisplayScene',
    init: function(param){
        this.superInit(param);
        this.backgroundColor = '#d2eaff';

        var label;
        var sprite;

        sprite = Sprite("neko_down_big").addChildTo(this)
            .setOrigin(0, 1)
            .setPosition(0, 450)
            .setScale(0.75, 0.75);
        sprite.alpha = 0.5;

        label = Label("SCORE").addChildTo(this).setPosition(225, 150);
        label.fontSize = 64;
        label.strokeWidth = 0;
        label.setScale(0.5, 0.5);

        label = Label(param.score).addChildTo(this).setPosition(225, 185);
        label.fontSize = 64;
        label.strokeWidth = 0;
        label.setScale(0.5, 0.5);

        label = Label("クリックでタイトルへ").addChildTo(this).setPosition(225, 250);
        label.fontSize = 64;
        label.strokeWidth = 0;
        label.setScale(0.25, 0.25);

        MySoundManager.playBGM("bgm:result");

        this.onpointend = () => {
            MySoundManager.playSE("se:return");
            this.exit();
        };
    }
});

phina.define('TitleScene', {
    superClass: 'DisplayScene',
    init: function(){
        this.superInit();
        this.backgroundColor = '#d2eaff';

        var sprite = Sprite("title").addChildTo(this)
            .setOrigin(0.5, 0)
            .setPosition(225, 0);

        var label = Label("クリックしてスタート！").addChildTo(this)
            .setPosition(225, 350);

        this.onpointend = () => {
            MySoundManager.playSE("se:ok");
            this.exit();
        };

        MySoundManager.playBGM("bgm:title");
    }
})

var click_hander = function(){
    // メイン処理
    phina.main(function() {
        // アプリケーション生成
        var app = GameApp({
            // startLabel: 'main', // メインシーンから開始する
            startLabel: 'title', // メインシーンから開始する
            // fit: false,
            width: 450,
            height: 450,
            assets: ASSETS
        });
        // アプリケーション実行
        app.run();
    });
    document.getElementById("front_page").remove();
    document.removeEventListener("click", click_hander);
};
window.onload = () => {
    document.getElementById("game_launch").addEventListener("click", click_hander);
};
