import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import { lcb, rcb } from '../handle_scenes.js';


let center = [0,1.5,0];
let radius = 0.01;

export const init = async model => {
    // HIDE ROOM
    model.setTable(false);
    model.setRoom(false);

    // CREATE THE BALL.
    let ball = model.add('sphere');

    /**
     * Adding Primitives for the zoomed-in view
     * **/
    // add islands
    let island0 = model.add();
    island0.add('cube').color('blue');// a building
    island0.add('cube').color('white');// ground

    let island1 = model.add();
    island1.add('cube').color('blue');// a building
    island1.add('cube').color('white');// ground

    let island2 = model.add();
    island2.add('cube').color('blue');// a building
    island2.add('cube').color('white');// ground

    // add ladders (connection between islands)
    let ladders = model.add();
    ladders.add('cube').color('green');
    ladders.add('cube').color('green');
    ladders.add('cube').color('green');

    model.animate(() => {

        island0.child(0).identity().move(0,.2,0).scale(.2);
        island0.child(1).identity().scale(.5,.01,.5);
        island1.child(0).identity().move(0,.2,0).scale(.2);
        island1.child(1).identity().scale(.5,.01,.5);
        island1.identity().move(1,2,0);
        island2.child(0).identity().move(0,.2,0).scale(.2);
        island2.child(1).identity().scale(.5,.01,.5);
        island2.identity().move(-1,1,0);
        ladders.identity().move(-1,-1,0).scale(.5);
        // SEE WHETHER LEFT CONTROLLER BEAM HITS THE BALL

        let point = lcb.projectOntoBeam(center);
        let diff = cg.subtract(point, center);
        let hit = cg.norm(diff) < radius;
        let lt = buttonState.left[0].pressed;

        // IF SO, MOVE THE BALL WHILE THE TRIGGER IS DOWN

        if (hit && lt)
            center = point;

        // DISPLAY THE BALL

        ball.color(hit ? lt ? [1,0,0] : [1,.5,.5] : [1,1,1]);
        ball.identity().move(center).scale(radius);
    });
}

