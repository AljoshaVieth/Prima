namespace TheJourneyOfY {
    import f = FudgeCore;
    import ComponentMaterial = FudgeCore.ComponentMaterial;

    export class GoalObject extends f.Node {
        componentTransform: f.ComponentTransform;

        constructor() {
            super("GoalObject");
            this.initiatePositionAndScale();
            this.initAnim();
            f.Loop.addEventListener(f.EVENT.LOOP_FRAME, this.update);

        }

        private initiatePositionAndScale(): void {
            this.componentTransform = new f.ComponentTransform();
            this.addComponent(this.componentTransform);
            this.addComponent(new f.ComponentMesh(new f.MeshSphere("GoalObject")));
            let textureImage: f.TextureImage = new f.TextureImage("Textures/goallowpoly.png");
            let goalMaterial: f.Material = new f.Material("GoalMaterial", f.ShaderTexture, new f.CoatTextured(new f.Color(1, 1, 1), textureImage));
            this.addComponent(new ComponentMaterial(goalMaterial));


            //set position
            this.mtxLocal.translateZ(0);
            this.mtxLocal.translateY(0);
            this.mtxLocal.translateX(5);

            //set scale
            this.mtxLocal.scale(f.Vector3.ONE(1));
        }

        private update = (_event: Event) => {
            this.checkForPlayerPosition();
        }

        private checkForPlayerPosition(){

            if(this.mtxLocal.translation.getDistance(player.mtxLocal.translation) < 0.5){
             f.Debug.info("GOAL");
             //TODO fire event
            }
        }

        initAnim(): void {


            let hoveringAnimSeq: f.AnimationSequence = new f.AnimationSequence();
            hoveringAnimSeq.addKey(new f.AnimationKey(0, -1));
            hoveringAnimSeq.addKey(new f.AnimationKey(3000, 1));
            hoveringAnimSeq.addKey(new f.AnimationKey(6000, -1));

            let rotatingAnimSeq: f.AnimationSequence = new f.AnimationSequence();
            rotatingAnimSeq.addKey(new f.AnimationKey(0, 0));
            rotatingAnimSeq.addKey(new f.AnimationKey(3000, 360));
            rotatingAnimSeq.addKey(new f.AnimationKey(6000, 0));



            let animStructure: f.AnimationStructure = {
                components: {
                    ComponentTransform: [
                        {
                            "f.ComponentTransform": {
                                mtxLocal: {
                                    rotation: {
                                        y: rotatingAnimSeq
                                    },
                                    translation: {
                                        y: hoveringAnimSeq
                                    }
                                }
                            }
                        }
                    ]
                }
            };





            let fps: number = 30;
            let animation: f.Animation = new f.Animation("GoalAnimation", animStructure, fps);
            let cmpAnimator: f.ComponentAnimator = new f.ComponentAnimator(animation, f.ANIMATION_PLAYMODE.LOOP, f.ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS);
            cmpAnimator.scale = 1;
            if (this.getComponent(f.ComponentAnimator)) {
                this.removeComponent(this.getComponent(f.ComponentAnimator));
            }
            this.addComponent(cmpAnimator);
            cmpAnimator.activate(true);

            console.log("Component", cmpAnimator);
        }

    }


}