namespace TheJourneyOfY {
    import f = FudgeCore;
    import Vector3 = FudgeCore.Vector3;
    export let hoveredObject: f.Node;
    export let controlledObject: f.Node;
   export let objectSelected: boolean = false;
    export let hoveringOverControllableObject: boolean = false;

    export class MouseObserver {

        mouseHoverHandler(_event: MouseEvent): void {
            let ray: f.Ray = viewport.getRayFromClient(new f.Vector2(_event.clientX, _event.clientY));
            if (!objectSelected) {
                //f.Debug.info("No object selected");
                for (let controllableObject of controllableObjects.getIterator()) {
                    if (controllableObject.name == "Controllables") {
                        continue; //ignoring parent object since it cannot be moved and causes problems otherwise
                    }
                    let componentMesh: f.ComponentMesh = controllableObject.getComponent(f.ComponentMesh);
                    let position: f.Vector3 = componentMesh ? componentMesh.mtxWorld.translation : controllableObject.mtxWorld.translation;
                    if (ray.getDistance(position).magnitude < controllableObject.radius) {
                        f.Debug.info("hovering over controllable object named: " + controllableObject.name);
                        hoveringOverControllableObject = true;
                        hoveredObject = controllableObject;
                        break; //ignoring other controllable objects. There can only be one.
                    } else {
                        hoveringOverControllableObject = false;
                    }
                }
            } else {
                /*
                for (let borderObject of borderObjects.getIterator()) {
                    if (borderObject.name == "MovementBorder") {
                        continue; //ignoring parent object since it is not relevant and causes problems otherwise
                    }
                    let componentMesh: f.ComponentMesh = borderObject.getComponent(f.ComponentMesh);
                    let position: f.Vector3 = componentMesh ? componentMesh.mtxWorld.translation : borderObject.mtxWorld.translation;
                    if (ray.getDistance(position).magnitude < borderObject.radius) {
                        f.Debug.info("Hovering over " + borderObject.name + "! releasing object...");
                        releaseObject();
                        break; //ignoring other controllable objects. There can only be one.
                    }
                }

                 */
            }

        }

        mouseDownHandler(_event: MouseEvent): void {
            if (hoveringOverControllableObject) {
                swoshSound.getComponents(f.ComponentAudio)[0].play(true);

                activatePhysics = false;
                body.classList.add("grayscale");   //add the class
                objectSelected = true;
                controlledObject = hoveredObject;

                /*
                // not needed anymore cause physics gets disabled completely
                controlledObject.getComponent(f.ComponentRigidbody).effectGravity = 0;
                //stopping rotation
                controlledObject.getComponent(f.ComponentRigidbody).effectRotation = new f.Vector3(0, 0, 0);
                 */
            }
        }

        mouseUpHandler(_event: MouseEvent): void {
            if (objectSelected) {
                releaseObject();
            }
        }

        mouseMoveHandler(_event: MouseEvent): void {
            if (objectSelected) {
                let ray: f.Ray = viewport.getRayFromClient(new f.Vector2(_event.clientX, _event.clientY));
                let mousePositionOnWorld: f.Vector3 = ray.intersectPlane(new f.Vector3(0, 0, 0), new f.Vector3(0, 0, 1)); // check
                let moveVector: f.Vector3 = f.Vector3.DIFFERENCE(mousePositionOnWorld, controlledObject.mtxLocal.translation);
                controlledObject.getComponent(f.ComponentRigidbody).translateBody(moveVector);
            }
        }

        scrollHandler(_event: WheelEvent): void {
            if (objectSelected) {
                controlledObject.getComponent(f.ComponentRigidbody).rotateBody(new Vector3(0, 0, _event.deltaY));
            }
        }

    }
    function releaseObject() {
        activatePhysics = true;
        body.classList.remove("grayscale");   //remove the class
        controlledObject.getComponent(f.ComponentRigidbody).effectGravity = 1;
        controlledObject.getComponent(f.ComponentRigidbody).effectRotation = new f.Vector3(0, 0, 1);
        //controlledObject.getComponent(f.ComponentRigidbody).translateBody(currentPosition);
        objectSelected = false;
        hoveredObject = null;
        controlledObject = null;
    }
}