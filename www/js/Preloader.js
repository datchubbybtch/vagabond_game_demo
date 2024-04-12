class Preloader extends Phaser.Scene
{
    constructor ()
    {
        super({ key: 'preloader' });
    }

    preload ()
    {
        this.load.image('bg', 'img/nebula.jpg');
        this.load.image('ship', 'img/ship.png');
        this.load.atlas('space', 'img/space.png', 'img/space.json');

        this.load.spritesheet('player_handgun', 'img/player_handgun.png',
            { frameWidth: 66, frameHeight: 60 }
        ); // Made by tokkatrain: https://tokkatrain.itch.io/top-down-basic-set
        this.load.image('bullet', 'img/bullet6.png');
        this.load.image('target', 'img/ball.png');
    }

    create ()
    {
        this.scene.start('world');
    }
}
