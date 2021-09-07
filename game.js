kaboom({
    global: true,
    fullscreen: true, 
    scale: 1.2,
    debu: true,
    clearColor: [0, 0, 0, 1]
});

const MOVE_SPEED = 150;
const JUMP_FORCE = 360;  
const BIG_JUMP_FORCE = 550;  
let CURRENT_JUMP_FORCE = JUMP_FORCE; 
let isjumping = true;

const ENNEMY_SPEED = 20;

const FULL_DEATH = 400;


loadSprite('mario', './img/mario.png');
loadSprite('player', './img/player.png');

loadSprite('coin', './img/coin.png');
loadSprite('star', './img/star.png');
loadSprite('evil-shroom', './img/evil-shroom.png');
loadSprite('blue-evil-shroom', './img/blue-evil-shroom.png');
loadSprite('block', './img/block.png');
loadSprite('blue-block', './img/blue-block.png');
loadSprite('cloud', './img/cloud.png');
loadSprite('mushroom', './img/mushroom.png');
loadSprite('surprise', './img/surprise.png');
loadSprite('unboxed', './img/unboxed.png');
loadSprite('pipe-top-left', './img/pipe-top-left.png');
loadSprite('pipe-top-right', './img/pipe-top-right.png');
loadSprite('pipe-bottom-left', './img/pipe-bottom-left.png');
loadSprite('pipe-bottom-right', './img/pipe-bottom-right.png');
loadSprite('blue-steel', './img/blue-steel.png');



scene("game", ({ level, score }) => {
    layer(['bg', 'ob', 'ui'], 'obj');

    const maps = [
        [
            '                                                                                                 x           x',
            '                                                                                                 x           x',
            '                                                                                                 x           x',
            '                                                                                   %%            x           x',
            '                                                                                                 x           x',
            '                                                                                               -+x           x',
            '                                                                                          ^    ()x           x',
            '                                                                               &&&&&&&&&&&&&&&&&&&           x',
            '                                                                                                             x',
            '                                                                                                             x',
            '                                                                 %%%==%%*=%%==%%                             x',
            '                                                                                                             x',
            '                                                                                                             x',
            '                                                                                                             x',
            '                                                                &&&&&&&&&&&&&&&&&&&&&&&&&&&&&                x',
            '       %       =*=%=       %%==%%==%                      &&&                                                x',
            '                                                     %%%                                          %=%=%      x',
            '                                                                                                           -+x',
            '                          ^    ^                                                                 ^   ^     ()x',
            '=======================================   ====================================================================',
        ],
        [
            '                                                                                                                             x',
            '                                                                                                                              x',
            '                                                                                                                    -+        x',
            '                                                                                                      $$$$$$$$$  z  ()  $$$   x',
            '                                                                                                   &&&&&&&&&&&&&&&&&&&&&&&&&  x',
            '                                                                                                                              x',
            '                                                                                      =*====                                  x',
            '                                                                              z                                               x',
            '                                                                     &&&&&&&&&&&&&  &&&&&&&&&&&&&&&&&&&&&&                    x',
            '                                                                                                                              x',
            '                                                                                                                              x',
            '         %       =*=%=                     %%%                    x                                            x              x',
            '                                                               x  x                                         x  x              x',
            '                                                            x  x  x                                      x  x  x          -+  x',
            '                            z    z         z             x  x  x  x                                   x  x  x  x          ()  x',
            '!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!  !!!!!!!!!!  !!!!!!!!!!!!!!!!!!!!!   !!!!!!!!!!!!  !!!!!!!!!!!!!!!!!!!!!!!!!   !!!  !!  x',
        ]
    ]

    const levelCfg = {
        width: 20,
        height: 20,

        '=': [sprite('block'), solid()],
        '&': [sprite('cloud'), solid()],
        "$": [sprite('star'), 'star'],
        "%": [sprite('surprise'), solid(), 'star-surprise'],
        "*": [sprite('surprise'), solid(), 'mushroom-surprise'],
        "}": [sprite('unboxed'), solid()],
        "-": [sprite('pipe-top-left'), solid(), scale(0.5), 'pipe'],
        "+": [sprite('pipe-top-right'), solid(), scale(0.5), 'pipe'],
        "(": [sprite('pipe-bottom-left'), solid(), scale(0.5)],
        ")": [sprite('pipe-bottom-right'), solid(), scale(0.5), ],
        "^": [sprite('evil-shroom'), solid(), body(), origin('bot'), pos(30, 0), 'dangerous'],
        "#": [sprite('mushroom'), solid(), 'mushroom', body()],
        
        "!": [sprite('blue-block'), solid(), scale(0.5)],
        "z": [sprite('blue-evil-shroom'), solid(), scale(0.5), 'dangerous'],
        "x": [sprite('blue-steel'), solid(), scale(0.5)],

    };

    const gameLevel = addLevel(maps[level], levelCfg);

    //Affichage du score
    const scoreLabel = add([
        text('score:' + score),
        pos(30, 6),
        layer('ui'),
        {
            value: score,
        }
    ]);

    add([text('Niveau : ' + parseInt(level + 1)), pos(170, 6)])

    function big() {
        let timer = 0;
        let isBig = false;
        return {
            update() {
                if (isBig) {
                    CURRENT_JUMP_FORCE = BIG_JUMP_FORCE
                    timer -= dt();
                    if (timer <= 0) {
                        this.smallify();
                    }
                }
            },
            isBig() {
                return isBig
            },
            smallify() {
                this.scale = vec2(1, 1)
                CURRENT_JUMP_FORCE = JUMP_FORCE
                timer = 0
                isBig = false
            },
            biggify(time) {
                this.scale = vec2(1.7)
                timer = time
                isBig = true
            }
        }
    }

    //Ajout du player
    const player = add([
        sprite('player'),
        solid(), 
        pos(30, 0),
        body(),
        big(),
        origin('bot')
    ])

    //Intéractions du player
    player.on("headbump", (obj) => {
        if (obj.is('star-surprise')) {
            gameLevel.spawn('$', obj.gridPos.sub(0, 1))
            destroy(obj)
            gameLevel.spawn('}', obj.gridPos.sub(0, 0))
        }
        if (obj.is('mushroom-surprise')) {
            gameLevel.spawn('#', obj.gridPos.sub(0, 1))
            destroy(obj)
            gameLevel.spawn('}', obj.gridPos.sub(0, 0))
        }
    })

    player.collides('mushroom', (m) => {
        destroy(m)
        player.biggify(6)
    })

    player.collides('star', (s) => {
        destroy(s)
        scoreLabel.value++
        scoreLabel.text = 'score: ' + scoreLabel.value
    })

    player.collides('dangerous', (d) => {
        if(isjumping) {
            destroy(d)
        }else {
            go('lose', { score: scoreLabel.value})
        }
    })

    //Actions du  player
    keyDown('left', () => {
        player.move(-MOVE_SPEED, 0)
    });
    
    keyDown('right', () => {
        player.move(MOVE_SPEED, 0)
    })

    player.action(() => {
        if (player.grounded()) {
            isjumping = false
        }
    })

    keyPress('space', () => {
        if (player.grounded()) {
            isjumping = true
            player.jump(CURRENT_JUMP_FORCE);
        }
    })

    player.action(() => {
        camPos(player.pos)
        if (player.pos.y >= FULL_DEATH) {
            go('lose', { score: scoreLabel.value})
        }
    })

    //GO other level
    player.collides('pipe', () => {
        keyPress('down', () => {
            go("game", {
                level: (level + 1) % maps.length,
                score: scoreLabel.value
            })
        })
    })

    //Actions des NPC
    action('mushroom', (m) => {
        m.move(20, 0)
    })
    
    action('dangerous', (d) => {
        d.move(-ENNEMY_SPEED, 0)
    })
});

scene('lose', ({ score})  => {
    add([text(score, 32), origin('center'), pos(width()/2, height()/2)])
})

start("game",  { level: 0, score: 0 });