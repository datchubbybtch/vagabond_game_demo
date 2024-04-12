class WorldMap extends Phaser.Scene
{
    bg;
    player;
    cursors;
    turret;
    ship;

    time = 0;
    enemyBullets;
    playerBullets;
    moveKeys;
    reticle;
    healthpoints;
    enemy;
    hp1;
    hp2;
    hp3;

    currentlyOver = false;

    constructor ()
    {
        super({ key: "world" });
    }

    create ()
    {
        this.bg = this.add.tileSprite(0, 0, 800, 600, 'bg').setOrigin(0).setScrollFactor(0);

        //  Some planets to fly into
        const planet1 = this.physics.add.image(100, 100, 'space', 'blue-planet').setScale(0.15).setSize(360, 360).setOffset(400, 400);
        const planet2 = this.physics.add.image(600, 0, 'space', 'brown-planet').setScale(0.2).setSize(360, 360).setOffset(400, 500);
        const planet3 = this.physics.add.image(300, 700, 'space', 'gas-giant').setScale(0.2).setSize(360, 360).setOffset(450, 500);
        const planet4 = this.physics.add.image(1200, 500, 'space', 'purple-planet').setScale(0.3).setSize(360, 360).setOffset(400, 400);

        this.ship = this.physics.add.sprite(0, 0, 'ship');
        // this.turret = this.physics.add.sprite(800, 600, 'player_handgun');
        this.turret = this.physics.add.sprite(10, 10, 'player_handgun');
        // this.turret.setScale(0.3);

        this.player = this.add.container(400, 200, [ this.ship, this.turret ]);
        this.physics.world.enable(this.player);

        // this.player.setDamping(true);
        this.player.body.useDamping = true;
        this.player.body.setDrag(0.99);
        this.player.body.setAngularDrag(400);
        this.player.body.setCollideWorldBounds();

        this.player.previousPosition = {x:0,y:0};
        this.player.previousPosition.x = this.player.body.x;
        this.player.previousPosition.y = this.player.body.y;

        this.physics.add.overlap(this.player, [ planet1, planet2, planet3, planet4 ], this.playerHitPlanet, null, this);

        this.cameras.main.startFollow(this.player);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.add.text(10, 10, 'Cursors to move. Fly into the planets.', { font: '16px Courier', fill: '#00ff00' }).setScrollFactor(0);
    
        // Set world bounds
        this.physics.world.setBounds(0, 0, 1600, 1200);

        // Add 2 groups for Bullet objects
        this.playerBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });
        this.enemyBullets = this.physics.add.group({ classType: Bullet, runChildUpdate: true });

        // Add background turret, enemy, reticle, healthpoint sprites
        this.enemy = this.physics.add.sprite(300, 600, 'player_handgun');
        this.reticle = this.physics.add.sprite(0, 0, 'target');
        this.hp1 = this.add.image(-350, -250, 'target').setScrollFactor(0.5, 0.5);
        this.hp2 = this.add.image(-300, -250, 'target').setScrollFactor(0.5, 0.5);
        this.hp3 = this.add.image(-250, -250, 'target').setScrollFactor(0.5, 0.5);

        // Set image/sprite properties
        // background.setOrigin(0.5, 0.5).setDisplaySize(1600, 1200);
        this.turret.setOrigin(0.5, 0.5).setDisplaySize(66, 60);
        this.enemy.setOrigin(0.5, 0.5).setDisplaySize(132, 120).setCollideWorldBounds(true);
        this.reticle.setOrigin(0.5, 0.5).setDisplaySize(25, 25).setCollideWorldBounds(true);
        this.hp1.setOrigin(0.5, 0.5).setDisplaySize(50, 50);
        this.hp2.setOrigin(0.5, 0.5).setDisplaySize(50, 50);
        this.hp3.setOrigin(0.5, 0.5).setDisplaySize(50, 50);

        // Set sprite variables
        this.player.health = 3;
        this.enemy.health = 3;
        this.enemy.lastFired = 0;


        // this.container.setSize(128, 64);

        // this.physics.world.enable(this.player);

        // this.player.addChild(this.turret)
        // Phaser.Display.Align.To.TopCenter(this.turret, this.player);


        // // Set camera properties
        // this.cameras.main.zoom = 0.5;
        // this.cameras.main.startFollow(this.player);

        // Creates object for input with WASD kets
        this.moveKeys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        // // Enables movement of player with WASD keys
        // this.input.keyboard.on('keydown_W', event => {
        //     this.player.setAccelerationY(-800);
        // });
        // this.input.keyboard.on('keydown_S', event => {
        //     this.player.setAccelerationY(800);
        // });
        // this.input.keyboard.on('keydown_A', event => {
        //     this.player.setAccelerationX(-800);
        // });
        // this.input.keyboard.on('keydown_D', event => {
        //     this.player.setAccelerationX(800);
        // });

        // // Stops player acceleration on uppress of WASD keys
        // this.input.keyboard.on('keyup_W', event => {
        //     if (this.moveKeys['down'].isUp) { this.player.setAccelerationY(0); }
        // });
        // this.input.keyboard.on('keyup_S', event => {
        //     if (this.moveKeys['up'].isUp) { this.player.setAccelerationY(0); }
        // });
        // this.input.keyboard.on('keyup_A', event => {
        //     if (this.moveKeys['right'].isUp) { this.player.setAccelerationX(0); }
        // });
        // this.input.keyboard.on('keyup_D', event => {
        //     if (this.moveKeys['left'].isUp) { this.player.setAccelerationX(0); }
        // });

        // Fires bullet from player on left click of mouse
        this.input.on('pointerdown', (pointer, time, lastFired) =>
        {
            if (this.player.active === false) { return; }

            // Get bullet from bullets group
            const bullet = this.playerBullets.get().setActive(true).setVisible(true);

            if (bullet)
            {
                bullet.fire(this.player, this.reticle);
                this.physics.add.collider(this.enemy, bullet, (enemyHit, bulletHit) => this.enemyHitCallback(enemyHit, bulletHit));
            }
        });

        // Pointer lock will only work after mousedown
        game.canvas.addEventListener('mousedown', () => {
            game.input.mouse.requestPointerLock();
        });

        // Exit pointer lock when Q or escape (by default) is pressed.
        this.input.keyboard.on('keydown_Q', event => {
            if (game.input.mouse.locked) { game.input.mouse.releasePointerLock(); }
        }, 0);

        // Move reticle upon locked pointer move
        this.input.on('pointermove', pointer =>
        {
            if (this.input.mouse.locked)
            {
                this.reticle.x += pointer.movementX;
                this.reticle.y += pointer.movementY;
            }
        });

        // const transformedPoint = this.cameras.main.getWorldPoint(this.input.x, this.input.y);

        //   this.input.on('pointermove', function (transformedPoint) {
        //     this.physics.moveToObject(this.player, transformedPoint, 240);
        //     }, this);

        // this.events.on('postupdate', () =>
        // {
        //     Phaser.Display.Align.To.TopCenter(this.turret, this.player,);
        // });
    }

    update (time, delta)
    {
        const cursors = this.cursors;
        const sprite = this.player;

        // this.turret.setPosition(this.player.x, this.player.y)

        if (cursors.up.isDown || this.moveKeys['up'].isDown)
        {
            this.physics.velocityFromRotation(sprite.rotation, 200, sprite.body.acceleration);
        }
        else
        {
            sprite.body.setAcceleration(0);
        }

        if (cursors.left.isDown || this.moveKeys['left'].isDown)
        {
            sprite.body.setAngularVelocity(-300);
        }
        else if (cursors.right.isDown || this.moveKeys['right'].isDown)
        {
            sprite.body.setAngularVelocity(300);
        }
        else
        {
            sprite.body.setAngularVelocity(0);
        }

        if(cursors.down.isDown || this.moveKeys['down'].isDown){
            sprite.body.setAcceleration(-0.999,-0.999)

        }else{
            // sprite.body.setDrag(0,0)
        }

        this.reticle.body.setVelocity(this.player.body.velocity.x,this.player.body.velocity.y);
        console.log(this.player.body.velocity, this.reticle.body.velocity)
        // this.reticle.velocity.y = this.player.body.velocity.y;

        this.bg.tilePositionX += sprite.body.deltaX() * 0.5;
        this.bg.tilePositionY += sprite.body.deltaY() * 0.5;

        // Rotates turret to face towards reticle
        this.turret.rotation = Phaser.Math.Angle.Between(this.player.body.x, this.player.body.y, this.reticle.x, this.reticle.y);

        // Rotates enemy to face towards turret
        this.enemy.rotation = Phaser.Math.Angle.Between(this.enemy.x, this.enemy.y, this.player.x, this.player.y);

        // // Make reticle move with player
        // this.reticle.body.velocity.x = this.player.body.velocity.x;
        // this.reticle.body.velocity.y = this.player.body.velocity.y;

        // Constrain velocity of player
        // this.constrainVelocity(this.player, 500);

        // Constrain position of constrainReticle
        this.constrainReticle(this.reticle);

        // Make enemy fire
        this.enemyFire(time);
    }

    playerHitPlanet (player, planet)
    {
        if (this.currentlyOver !== planet)
        {
            this.currentlyOver = planet;

            this.registry.set('planet', planet.frame.name);

            this.scene.switch('subgame');
        }
    }

    enemyHitCallback (enemyHit, bulletHit)
    {
        // Reduce health of enemy
        if (bulletHit.active === true && enemyHit.active === true)
        {
            enemyHit.health = enemyHit.health - 1;
            console.log('Enemy hp: ', enemyHit.health);

            // Kill enemy if health <= 0
            if (enemyHit.health <= 0)
            {
                enemyHit.setActive(false).setVisible(false);
            }

            // Destroy bullet
            bulletHit.setActive(false).setVisible(false);
        }
    }

    playerHitCallback (playerHit, bulletHit)
    {
        // Reduce health of player
        if (bulletHit.active === true && playerHit.active === true)
        {
            playerHit.health = playerHit.health - 1;
            console.log('Player hp: ', playerHit.health);

            // Kill hp sprites and kill player if health <= 0
            if (playerHit.health === 2)
            {
                this.hp3.destroy();
            }
            else if (playerHit.health === 1)
            {
                this.hp2.destroy();
            }
            else
            {
                this.hp1.destroy();

                // Game over state should execute here
            }

            // Destroy bullet
            bulletHit.setActive(false).setVisible(false);
        }
    }

    enemyFire (time)
    {
        if (this.enemy.active === false)
        {
            return;
        }

        if ((time - this.enemy.lastFired) > 1000)
        {
            this.enemy.lastFired = time;

            // Get bullet from bullets group
            const bullet = this.enemyBullets.get().setActive(true).setVisible(true);

            if (bullet)
            {
                bullet.fire(this.enemy, this.player);

                // Add collider between bullet and player
                this.physics.add.collider(this.player, bullet, (playerHit, bulletHit) => this.playerHitCallback(playerHit, bulletHit));
            }
        }
    }

    constrainVelocity (sprite, maxVelocity)
    {
        if (!sprite || !sprite.body)
        { return; }

        let angle, currVelocitySqr, vx, vy;
        vx = sprite.body.velocity.x;
        vy = sprite.body.velocity.y;
        currVelocitySqr = vx * vx + vy * vy;

        if (currVelocitySqr > maxVelocity * maxVelocity)
        {
            angle = Math.atan2(vy, vx);
            vx = Math.cos(angle) * maxVelocity;
            vy = Math.sin(angle) * maxVelocity;
            sprite.body.velocity.x = vx;
            sprite.body.velocity.y = vy;
        }
    }

    constrainReticle (reticle)
    {
        const distX = reticle.x - this.player.x; // X distance between player & reticle
        const distY = reticle.y - this.player.y; // Y distance between player & reticle
        const gameWidth = game.config.width;
        const gameHeight = game.config.height;

        // const diffX = this.player.previousPosition.x - this.player.body.x;
        // const diffY = this.player.previousPosition.y - this.player.body.y;

        // reticle.x += diffX;
        // reticle.y += diffY;

        // this.player.previousPosition.x = this.player.body.x;
        // this.player.previousPosition.y = this.player.body.y;

        // Ensures reticle cannot be moved offscreen (player follow)
        if (distX > gameWidth/2)
        { reticle.x = this.player.x + gameWidth/2; }
        else if (distX < -gameWidth/2)
        { reticle.x = this.player.x - gameWidth/2; }

        if (distY > gameHeight/2)
        { reticle.y = this.player.y + gameHeight/2; }
        else if (distY < -gameHeight/2)
        { reticle.y = this.player.y - gameHeight/2; }

        // reticle.velocity = this.player.body.velocity;

        // if(this.player.body.velocity.x != 0 || this.player.body.velocity.y != 0){
        //     reticle.velocity = this.player.velocity;
        // }

    }
}
