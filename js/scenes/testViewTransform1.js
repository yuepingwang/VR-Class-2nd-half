import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import { lcb, rcb } from '../handle_scenes.js';

const PI = 3.1415926;
let center = [0,1.5,0];
let radius = 0.0001;
let large = 1.;
let small = .05;
let ladder_ratio = [1,.05,.2];
let iPositions = [ [0,0,-1],[1,2,0],[-1,1,0] ]; // Island positions
let lPositions = [ [.5,0,-1],[1,2,0],[-1,1,0] ]; // Ladder positions
// Make positions large-scale
const l = (a) =>{
    return a.map(x => x * large);
}
// Make positions small-scale
const s = (a) =>{
    return a.map(x => x * small);
}
export const init = async model => {
    // HIDE ROOM
    model.setTable(false);
    model.setRoom(false);

    // CREATE THE BALL.
    let ball = model.add('sphere');

    /**
     * Add Primitives for the large-scale view
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
    /** End of adding large-scale models **/

    /**
     * Add Primitives for the small-scale view
     * **/
    // add islands
    let smallView = model.add();
    let islandS0 = smallView.add();
    islandS0.add('cube').color('blue');// a building
    islandS0.add('cube').color(.8,.8,.8);// ground

    let islandS1 = smallView.add();
    islandS1.add('cube').color('blue');// a building
    islandS1.add('cube').color(.8,.8,.8);// ground

    let islandS2 = smallView.add();
    islandS2.add('cube').color('blue');// a building
    islandS2.add('cube').color(.8,.8,.8);// ground
    let laddersS = smallView.add();
    laddersS.add('cube').color('green');
    laddersS.add('cube').color('green');
    laddersS.add('cube').color('green');

    // smallView.add(islandS0);
    // smallView.add(islandS1);
    // smallView.add(islandS2);
    // smallView.add(laddersS);
    /** End of adding small-scale models **/

    model.animate(() => {

        /**
         * Configure large-scale models
         * **/
        // island0
        island0.child(0).identity().move(0,.2,0).scale(.2);
        island0.child(1).identity().scale(1,.02,1);
        island0.identity().move(l(iPositions[0])).scale(large);
        // island1
        island1.child(0).identity().move(0,.2,0).scale(.2);
        island1.child(1).identity().scale(1,.02,1);
        island1.identity().move(l(iPositions[1])).scale(large);
        // island2
        island2.child(0).identity().move(0,.2,0).scale(.2);
        island2.child(1).identity().scale(1,.02,1);
        island2.identity().move(l(iPositions[2])).scale(large);
        // ladders
        ladders.identity().move(l(lPositions[0])).turnZ(PI/4).scale(l(ladder_ratio));
        /** End of configure large-scale models **/

        /**
         * Configure small-scale models
         * **/
        // island0
        islandS0.child(0).identity().move(0,.2,0).scale(.2);
        islandS0.child(1).identity().scale(1,.02,1);
        islandS0.identity().move(s(iPositions[0])).scale(small);
        // island1
        islandS1.child(0).identity().move(0,.2,0).scale(.2);
        islandS1.child(1).identity().scale(1,.02,1);
        islandS1.identity().move(s(iPositions[1])).scale(small);
        // island2
        islandS2.child(0).identity().move(0,.2,0).scale(.2);
        islandS2.child(1).identity().scale(1,.02,1);
        islandS2.identity().move(s(iPositions[2])).scale(small);
        // ladders
        laddersS.identity().move(s(lPositions[0])).turnZ(PI/4).scale(s(ladder_ratio));

        smallView.identity().move(0,Math.sin(model.time)/50,.5);
        /** End of configure small-scale models **/


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

