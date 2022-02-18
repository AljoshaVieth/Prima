namespace TheJourneyOfY {
    import f = FudgeCore;
    import ComponentMaterial = FudgeCore.ComponentMaterial;

    export class Player extends f.Node {
        private ctrForward: f.Control;
        private rigidbody: f.ComponentRigidbody;
        private isOnGround: boolean;
        private idealPosition: f.Vector3;


        constructor() {
            super("Player");
            this.ctrForward = this.ctrForward = new f.Control("Forward", 5, f.CONTROL_TYPE.PROPORTIONAL);
            this.ctrForward.setDelay(200);
            this.initiatePositionAndScale();
            f.Loop.addEventListener(f.EVENT.LOOP_FRAME, this.update);
        }

        private initiatePositionAndScale(): void {
            this.addComponent(new f.ComponentTransform);
            this.addComponent(new f.ComponentMesh(new f.MeshCube("Player")));
            //this.addComponent(new f.ComponentMaterial(
            //    new f.Material("materialPlayer", f.ShaderUniColor, new f.CoatColored(new f.Color(1, 0, 1, 1))))
            //);
            let textureImage: f.TextureImage = new f.TextureImage("Textures/playerlowpoly.png");
            let playerMaterial: f.Material = new f.Material("PlayerMaterial", f.ShaderTexture, new f.CoatTextured(new f.Color(1,1,1), textureImage));
            this.addComponent(new ComponentMaterial(playerMaterial));
            this.rigidbody = new f.ComponentRigidbody();
            this.addComponent(this.rigidbody);

            this.rigidbody.initialization = f.BODY_INIT.TO_PIVOT; //TO_PIVOT
            this.rigidbody.effectGravity = 1;
            this.rigidbody.typeBody = f.BODY_TYPE.DYNAMIC;
            this.rigidbody.mass = 1;
            this.rigidbody.effectRotation = new f.Vector3(0, 0, 0);
            this.rigidbody.typeCollider = f.COLLIDER_TYPE.CUBE;
            this.rigidbody.collisionGroup = f.COLLISION_GROUP.GROUP_1;


            //set position
            this.mtxLocal.translateZ(0);
            this.mtxLocal.translateY(4);
            this.mtxLocal.translateX(0);

            //set scale
            this.mtxLocal.scale(f.Vector3.ONE(1));
        }

        private update = (_event: Event) => {
            this.handlePlayerMovement();
        }

        private handlePlayerMovement() {
            // Forward
            let forward: number = f.Keyboard.mapToTrit([f.KEYBOARD_CODE.D, f.KEYBOARD_CODE.ARROW_RIGHT], [f.KEYBOARD_CODE.A, f.KEYBOARD_CODE.ARROW_LEFT]);
            this.ctrForward.setInput(forward);
           //aaaaaaaada f.Debug.info("speed " + this.ctrForward.getOutput());
            this.rigidbody.applyForce(f.Vector3.SCALE(this.mtxLocal.getX(), this.ctrForward.getOutput()));
            //console.log(this.ctrForward.getOutput());
            this.isOnGround = false;
            let playerCollisions: f.ComponentRigidbody[] = this.rigidbody.collisions;
            //f.Debug.info(playerCollisions.length);



            playerCollisions.forEach(collider => {
                //f.Debug.info("Collider: " + collider.node.name);
                switch (collider.collisionGroup) {
                    case f.COLLISION_GROUP.GROUP_2: //Ground elements
                        this.isOnGround = true;
                        break;
                    case f.COLLISION_GROUP.GROUP_3: //Obstacles
                        this.isOnGround = true;
                        break;
                    case f.COLLISION_GROUP.GROUP_4: //LethalObjects
                        const gameOverEvent = new GameOverEvent(false);
                        this.dispatchEvent(gameOverEvent);
                        break;
                    default:
                        break;
                }
            });

            /**
             * Sometimes the player leaves the z=0 position, even tough the z axis should be locked.
             * This sometimes causes problems with the jump, so the workaround is to make sure the player is
             * always on z=0 by constantly teleporting him if he is not.
             */
            if(this.rigidbody.getPosition().z != 0.00){
                this.idealPosition = this.rigidbody.getPosition();
                this.idealPosition.z = 0;
                let moveVector: f.Vector3 = f.Vector3.DIFFERENCE(this.idealPosition, this.rigidbody.getPosition());
                this.rigidbody.translateBody(moveVector);
            }

            if(this.rigidbody.getVelocity().x >= 5){
                this.rigidbody.setVelocity(new f.Vector3(5,this.rigidbody.getVelocity().y,this.rigidbody.getVelocity().z));
            }


            // Jump (using simple keyboard event instead of control since it´s easier in this case)
            if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.SPACE]) && this.isOnGround) {
                jumpSound.getComponents(f.ComponentAudio)[0].play(true);

                this.rigidbody.applyForce(new f.Vector3(0, 30, 0));
            }
        }
    }

}