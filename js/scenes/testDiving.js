import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import { rcb } from '../handle_scenes.js';
import defineOctTube from "./newShapes.js"

const PI = 3.1415926;
let center = [0, 1.5, 0];
let radius = 0.0001;
let collisionSphereRad = .16;
let large = 1.25;
let small = .2;
let current_island = 0; // index of the island I'm standing on right now
let seabed_size = [1., .1, 1.];
let seabed_pos= [.0, 1., .0];
let iPositions = [[-2, 0, 0], [0, 1, 1], [1.2, 2, -1]]; // Island positions
let lPositions = [[-1, .5, .5], [.6, 1.5, 0]]; // Ladder positions
let leftTriggerPressed = false;
let rightTriggerPressed = false;
let rightAPressed = false;

const colors = [
    [1, .4, .5],// light pink
    [0, .5, .9],// light blue
    [0, .9, .4],// light green
    [.9, .9, .9],// light gray
    [.5 ,.5, .5] // mid gray
]

// Make positions large-scale
const l = (a) => {
    return a.map(x => x * large);
}
// Make positions small-scale
const s = (a) => {
    return a.map(x => x * small);
}

export const init = async model => {
    // Define any custom mesh

    // Hide table, but use room
    model.setTable(false);
    model.setRoom(false);

    /**
     * Define custom primitives
     */
    /**
     * Add Primitives for the large-scale view
     * **/
    // add islands
    let largeView = model.add();
    let seabed = largeView.add();
    seabed.add('cube').color(colors[5]);// add floor
    let seaSpace = largeView.add();
    seaSpace.add('cube').color(colors[1]).opacity(.25);// add floor
    /** End of adding large-scale models **/


    /**
     * TODO: Add Arrows (primitives) for the small-scale view
     * **/
    let smallView = model.add();
    let seabed_s = smallView.add();
    seabed_s.add('cube').color(colors[5]);// add floor
    let seaSpace_s = smallView.add();
    seaSpace_s.add('cube').color(colors[1]).opacity(.25);// add floor
    /** End of adding small-scale models **/

    /**
     * TODO: Interaction with small-scale view
     * **/
    /** End of interaction with small-scale view **/


    model.animate(() => {
        /**
         * Configure large-scale models
         * **/
        seabed.identity().move(l(seabed_pos)).scale(l(seabed_size));
        seaSpace.identity().move(l(seabed_pos)).scale(large);
        /** End of configure large-scale models **/

        /**
         * Configure small-scale models
         * **/
        seabed_s.identity().move(s(seabed_pos)).scale(s(seabed_size));
        seaSpace_s.identity().move(s(seabed_pos)).scale(small);
        // the whole thing
        // smallView.identity().move(0,Math.sin(model.time)/50,.5);
        //smallView.hud().turnX(joyStickX/10).turnY(joyStickY/10);
        /** End of configure small-scale models **/

        /**
         * Controller Interactions
         */
        // // let vm = clay.views[0].viewMatrix;
        // // let viewPosition = [];
        // // viewPosition.push(vm[12]);
        // // viewPosition.push(vm[13]);
        // // viewPosition.push(vm[14]);
        //
        // // Press left controller trigger to stand on the next island
        // let rightTrigger = buttonState.right[0].pressed;
        // let leftTrigger = buttonState.left[0].pressed;

        // if (leftTrigger) {
        //     if (!leftTriggerPressed) {
        //         leftTriggerPressed = true;
        //         current_island = (current_island + 1) % 3;
        //     }
        // }
        // else
        //     leftTriggerPressed = false;
        //
        // // small-scale view interaction
        // checkIslandsHit();
        //
        // // small-scale view rotation
        // joyStickX += joyStickState.right.y;
        // joyStickY += joyStickState.right.x;
        //
        // let rightA = buttonState.right[4].pressed;
        // if (rightA) {
        //     if (!rightAPressed) {
        //         rightAPressed = true;
        //         joyStickX = 0;
        //         joyStickY = 0
        //     }
        // }
        // else{
        //     rightAPressed = false;
        // }
        //
        // // largeView.identity().move(cg.scale(cg.subtract(iPositions[current_island],[0,-1,0]), -1));
        // largeView.identity().move(cg.subtract([0,-.5,0],l(iPositions[current_island])));
        // locationArrow.identity().move(islandsObj[current_island].getMatrix().slice(12,15)).move(0,.25,0).scale(.025,.025,.025);


    });
}