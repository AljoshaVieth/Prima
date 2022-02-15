namespace TheYourneyOfY {
    import f = FudgeCore;

    export class Player extends f.Node {
        public name: string = "Agent Smith";
        private ctrForward: f.Control;
        private rigidbody: f.ComponentRigidbody;
        private isOnGround: boolean;


        constructor() {
            super("Player");
            this.ctrForward = this.ctrForward = new f.Control("Forward", 10, f.CONTROL_TYPE.PROPORTIONAL);
            this.ctrForward.setDelay(200);
            this.initiatePositionAndScale();
            f.Loop.addEventListener(f.EVENT.LOOP_FRAME, this.update);
        }

        private initiatePositionAndScale(): void {
            this.addComponent(new f.ComponentTransform);
            this.addComponent(new f.ComponentMesh(new f.MeshCube("Player")));
            this.addComponent(new f.ComponentMaterial(
                new f.Material("materialPlayer", f.ShaderUniColor, new f.CoatColored(new f.Color(1, 0, 1, 1))))
            );
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
            this.rigidbody.applyForce(f.Vector3.SCALE(this.mtxLocal.getX(), this.ctrForward.getOutput()));
            //console.log(this.ctrForward.getOutput());

            this.isOnGround = false;
            let playerCollisions: f.ComponentRigidbody[] = this.rigidbody.collisions;
            playerCollisions.forEach(collider => {
                f.Debug.info("Collider: " + collider.node.name);
                switch (collider.collisionGroup) {
                    case f.COLLISION_GROUP.GROUP_2: //Ground elements
                        this.isOnGround = true;
                        break;
                    case f.COLLISION_GROUP.GROUP_3: //Obstacles
                        this.isOnGround = true;
                        break;
                    default:
                        break;
                }
            });

            // Jump (using simple keyboard event instead of control since it´s easier in this case)
            if (f.Keyboard.isPressedOne([f.KEYBOARD_CODE.SPACE]) && this.isOnGround){
                f.Debug.info("Lets goooooo");
                this.rigidbody.applyForce(new f.Vector3(0,20,0));
                //let velocity: f.Vector3 = this.rigidbody.getVelocity();
                //velocity.y = 2;
                //this.rigidbody.setVelocity(velocity);
            }
        }
    }

}