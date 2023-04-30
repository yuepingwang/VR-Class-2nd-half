import * as cg from "../render/core/cg.js";
import { controllerMatrix, buttonState, joyStickState } from "../render/core/controllerInput.js";
import { rcb } from '../handle_scenes.js';
import defineOctTube from "./newShapes.js"

const PI = 3.1415926;
const grid_size = 30;
const center = [0, 1.5, 0];
const radius = 0.0001;
const collisionSphereRad = .16;
const large = 1.25;
const small = .2;
const seabed_size = [1., .1, 1.];
const seabed_pos= [.0, -.95, .0];
const iPositions = [[-2, 0, 0], [0, 1, 1], [1.2, 2, -1]]; // Island positions
const lPositions = [[-1, .5, .5], [.6, 1.5, 0]]; // Ladder positions

let current_island = 0; // index of the island I'm standing on right now
let leftTriggerPressed = false;
let rightTriggerPressed = false;
let rightAPressed = false;

const colors = [
    [1, .4, .5],// light pink
    [0, .6, 1.],// light blue
    [0, .9, .4],// light green
    [.9, .9, .9],// light gray
    [.5 ,.5, .5], // mid gray
    [.0, .0, .0], // black
]

// Make positions large-scale
const l = (a) => {
    return a.map(x => x * large);
}
// Make positions small-scale
const s = (a) => {
    return a.map(x => x * small);
}
let createTerrainMesh = (nu, nv, f, data) => {
    let tmp = [];
    for (let j = nv ; j > 0 ; j--) {
        let v = j/nv;
        for (let i = 0 ; i <= nu ; i++) {
            let u = i/nu;
            tmp.push(f(u, v, data));
            tmp.push(f(u, v-1/nv, data));
        }
        if (j > 1) {
            tmp.push(f(1, v-1/nv, data));
            tmp.push(f(0, v-1/nv, data));
        }
    }
    let mesh = new Float32Array(tmp.flat(1));
    mesh.nu = nu;
    mesh.nv = nv;
    return mesh;
}
const heightMap = (u,v) => {
    let h = .4 * cg.noise(3*u,3*v,2);
    return h;
}
const getNormal = (u,v,f) => {
    let U = [u+.001,v,f(u+.001,v)];
    let V = [u,v+.001,f(u,v+.001)];
    let P = [u,v,f(u,v)];
    return cg.normalize(cg.cross([U[0]-P[0],U[1]-P[1],U[2]-P[2]],
        [V[0]-P[0],V[1]-P[1],V[2]-P[2]]));
}

const createTerrainGrid = (nu,nv) =>
    createTerrainMesh(nu,nv, (u,v) => clay.vertexArray([2*u-1,2*v-1,heightMap(u,v)], getNormal(u,v,heightMap), [1,0,0], [u,v]));

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
    let seaSpace = largeView.add();
    //let seabed = largeView.add();
    let terrain = largeView.add();
    clay.defineMesh('myTerrain', createTerrainGrid(grid_size, grid_size));
    //seabed.add('myTerrain').color([4]);
    let seed1 = Math.random();
    let seed2 = Math.random();

    //seabed.add('cube').color(colors[4]);// add floor
    seaSpace.add('cube').color(colors[1]).opacity(.4);// add water

    terrain.add('myTerrain').color(colors[4]).texture('../media/textures/sand2.jpg');

    /** End of adding large-scale models **/


    /**
     * TODO: Add Arrows (primitives) for the small-scale view
     * **/
    let smallView = model.add();
    let terrain_s = smallView.add();
    let seaSpace_s = smallView.add();
    seaSpace_s.add('cube').color(colors[1]).opacity(.4);// add water
    terrain_s.add('myTerrain').color(colors[4]).texture('../media/textures/sand2.jpg');
    /** End of adding small-scale models **/

    /**
     * TODO: Interaction with small-scale view
     * **/
    /** End of interaction with small-scale view **/
    //
    // largeView.child(2).setVertices((u,v) => {
    //     return [2*u-1,2*v-1,.4 * cg.noise(3*u-model.time,3*v,model.time)];});
    model.animate(() => {

        terrain.identity().move(l(seabed_pos)).turnX(-.5*Math.PI).scale(cg.scale([1,1,.5],large));
        /**
         * Configure large-scale models
         * **/
        //seabed.identity().move(l(seabed_pos)).scale(l(seabed_size));
        seaSpace.identity().scale(large);
        /** End of configure large-scale models **/

        /**
         * Configure small-scale models
         * **/
        terrain_s.identity().move(s(seabed_pos)).turnX(-.5*Math.PI).scale(cg.scale([1,1,.5],small));
        seaSpace_s.identity().scale(small);
        // the whole thing
        // smallView.identity().move(0,Math.sin(model.time)/50,.5);
        smallView.hud().move(-.75,-.25,0.);
        /** End of configure small-scale models **/
        //terrain.setVertices((u,v) => { return [2*u-1,2*v-1,.4 * cg.noise(3*u-model.time,3*v,model.time)];});

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