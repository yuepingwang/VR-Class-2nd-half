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
    [.3 ,.3, .4], // mid gray
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
// const mod = (x,y)=>{
//     return ((x % y) + y) % y;
// }
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
        // set up large-scale view
    let largeView = model.add();
    // add beam
    let beam1 = model.add('tubeY');
    let posZ = -100.;
    let posX = 0.;
    let posY = 0.;
    // add water
    let seaSpace = largeView.add();
    // add terrain
    let terrain = largeView.add();
    let seabed = largeView.add();
    clay.defineMesh('myTerrain', createTerrainGrid(grid_size, grid_size));
    // tessellate
    for (let i=0; i<9;i++){
        seaSpace.add('cube').color(colors[1]).opacity(.3);
        terrain.add('myTerrain').color(colors[4]).texture('../media/textures/sand2.jpg');
        seabed.add('cube').color(colors[4]).opacity(1);
    }


    /** End of adding large-scale models **/


    /**
     * TODO: Add Arrows (primitives) for the small-scale view
     * **/
    let smallView = model.add();
    let terrain_s = smallView.add();
    let seaSpace_s = smallView.add();
    // seaSpace_s.add('cube').color(colors[1]).opacity(.4);// add water
    // terrain_s.add('myTerrain').color(colors[4]).texture('../media/textures/sand2.jpg');
    let seabed_s = smallView.add();
    let pin_s = smallView.add();
    // tessellate
    for (let i=0; i<9;i++){
        seaSpace_s.add('cube').color(colors[1]).opacity(.35);
        terrain_s.add('myTerrain').color(colors[4]).texture('../media/textures/sand2.jpg');
        seabed_s.add('cube').color(colors[4]).opacity(1);
        pin_s.add('sphere').color(colors[0]);
    }
    /** End of adding small-scale models **/

    /**
     * TODO: Interaction with small-scale view
     * **/
    /** End of interaction with small-scale view **/
    //
    // largeView.child(2).setVertices((u,v) => {
    //     return [2*u-1,2*v-1,.4 * cg.noise(3*u-model.time,3*v,model.time)];});

    model.animate(() => {

        /**
         * Configure large-scale models
         * **/
        // beam with fragment shader
        beam1.flag('uRayTrace');
        beam1.setUniform('4fv','uP', [posX,posY,posZ+0.1,0, 0,0,0,0, 0,0,0,0, 0,0,0,0]);
        beam1.identity().move(cg.scale([.5,-.1,-.5],large) ).turnX(Math.PI).turnY(-.4*Math.PI).scale(cg.scale([.2,1,.2],large));

        let vm = clay.views[0].viewMatrix;
        let viewPosition = [];
        viewPosition.push(vm[12]);
        viewPosition.push(vm[13]);
        viewPosition.push(vm[14]);

        //viewPosition[1]=model.time*1;

        let centerCube = [0,0,0];
        centerCube[0] = (viewPosition[0] - viewPosition[0]%(large*2))/large*2;
        centerCube[2] = (viewPosition[2] - viewPosition[2]%(large*2))/large*2;


        for (let i=0; i<9;i++){
            let posX = centerCube[0]+(i%3-1)*large*2;
            let posY = 0;
            let posZ = centerCube[2]+((i-i%3)/3-1)*large*2;
            seaSpace.child(i).identity().move(posX,posY,posZ).scale(large);
            seabed.child(i).identity().move(posX,large*seabed_pos[1]*1.2,posZ).scale(l(seabed_size));
            terrain.child(i).identity().move(posX,large*seabed_pos[1],posZ).turnX(-.5*Math.PI).scale(cg.scale([1,1,.5],large));
            // small view
            let posX_s = centerCube[0]+(i%3-1)*small*2;
            let posY_s = 0;
            let posZ_s = centerCube[2]+((i-i%3)/3-1)*small*2;
            seaSpace_s.child(i).identity().move(posX_s,posY_s,posZ_s).scale(small);
            seabed_s.child(i).identity().move(posX_s,small*seabed_pos[1]*1.2,posZ_s).scale(s(seabed_size));
            terrain_s.child(i).identity().move(posX_s,small*seabed_pos[1],posZ_s).turnX(-.5*Math.PI).scale(cg.scale([1,1,.5],small));
        }
        // let move_s= scale(s(viewPosition),-1)
        pin_s.identity().move(cg.scale(s(viewPosition),-1)).scale(.05);
        // seaSpace.child(0).identity().move(0,0,0).scale(large);
        // seaSpace.child(1).identity().move(1,0,0).scale(large);
        // seaSpace.child(2).identity().move(2,0,0).scale(large);

        //terrain.identity().move(l(seabed_pos)).turnX(-.5*Math.PI).scale(cg.scale([1,1,.5],large));
        /** End of configure large-scale models **/

        /**
         * Configure small-scale models
         * **/
        // terrain_s.identity().move(s(seabed_pos)).turnX(-.5*Math.PI).scale(cg.scale([1,1,.5],small));
        // seaSpace_s.identity().scale(small);
        smallView.hud().move(-.75,-.3,0.);
        /** End of configure small-scale models **/

        /**
         * Custom Shaders
         */
        model.customShader(`
        #define ITR 60
        #define FAR 400.
        //uniform vec4 time;

        uniform int uRayTrace;
        //uniform vec4 uC[4], uL[4], uS[4];
        uniform vec4 uP[4];
        vec4 light[4], sphere[4];

        mat2 mm2(float a){float c = cos(a), s = sin(a);return mat2(c,-s,s,c);}
        mat2 m2 = mat2(0.934, 0.358, -0.358, 0.934);
        float tri(float x){return abs(fract(x)-0.5);}

        float heightmap(vec2 p)
        {
            p*=.05;
            float z=2.;
            float rz = 0.;
            for (float i= 1.;i < 4.;i++ )
            {
                rz+= tri(p.x+tri(p.y*1.5))/z;
                z = z*-.85;
                p = p*1.32;
                p*= m2;
            }
            rz += sin(p.y+sin(p.x*.9))*.7+.3;
            return rz*5.;
        }
        vec3 bary(vec2 a, vec2 b, vec2 c, vec2 p)
        {
            vec2 v0 = b - a, v1 = c - a, v2 = p - a;
            float inv_denom = 1.0 / (v0.x * v1.y - v1.x * v0.y)+1e-9;
            float v = (v2.x * v1.y - v1.x * v2.y) * inv_denom;
            float w = (v0.x * v2.y - v2.x * v0.y) * inv_denom;
            float u = 1.0 - v - w;
            return abs(vec3(u,v,w));
        }

        float map(vec3 p)
        {
            vec3 q = fract(p)-0.5;
            vec3 iq = floor(p);
            vec2 p1 = vec2(iq.x-.5, iq.z+.5);
            vec2 p2 = vec2(iq.x+.5, iq.z-.5);

            float d1 = heightmap(p1);
            float d2 = heightmap(p2);

            float sw = sign(q.x+q.z);
            vec2 px = vec2(iq.x+.5*sw, iq.z+.5*sw);
            float dx = heightmap(px);
            vec3 bar = bary(vec2(.5*sw,.5*sw),vec2(-.5,.5),vec2(.5,-.5), q.xz);
            return (bar.x*dx + bar.y*d1 + bar.z*d2 + p.y + 3.)*.9;
        }

        float march(vec3 ro, vec3 rd)
        {
            float precis = 0.001;
            float h=precis*2.0;
            float d = 0.;
            for( int i=0; i<ITR; i++ )
            {
                if( abs(h)<precis || d>FAR ) break;
                d += h;
                float res = map(ro+rd*d)*1.1;
                h = res;
            }
            return d;
        }

        //---------------------------------------------------------------------
        if (uRayTrace == 1) {
            float fl = -1. / uProj[3].z; // FOCAL LENGTH OF VIRTUAL CAMERA

            // for (int i = 0 ; i < 4 ; i++) {
            //    light[i]  = vec4((uView * vec4(uL[i].xyz,0.)).xyz,uL[i].w);
            //    sphere[i] = vec4((uView * uS[i]).xyz,.25) - vec4(0.,0.,fl,0.);
            // }

            vec3 V = vec3(0.,10.,uP[0].z);
            vec3 W = normalize(vec3(2.*vUV.x-1.,1.-2.*vUV.y,-fl));
            //float tMin = 1000.;

            float rz = march(V,W);
            if ( rz < FAR )
            {
                // Draw Terrain
                vec3 pos = V+rz*W;
                //vec3 nor= normal(pos);
                vec2 e = vec2(-1., 1.)*0.01;
                vec3 nor = normalize(e.yxx*map(pos + e.yxx) + e.xxy*map(pos + e.xxy) +
                e.xyx*map(pos + e.xyx) + e.yyy*map(pos + e.yyy) );
                vec3 ligt = normalize(vec3(-.2, 0.05, -0.2));

                float dif = clamp(dot( nor, ligt ), 0., 1.);
                float fre = pow(clamp(1.0+dot(nor,W),0.0,1.0), 3.);
                vec3 brdf = 2.*vec3(0.10,0.11,0.1);
                brdf += 1.9*dif*vec3(.8,1.,.05);
                color = vec3(0.15,0.2,0.55);
                color = color*brdf + fre*0.1*vec3(.7,.8,1.);
                color = clamp(color,0.,1.);
                color = pow(color,vec3(.9));
            }

            else {
                // Draw Stars
                float starXf = (atan(W.x, W.z) + 1.57) / 6.28;
                float starYf = (asin(W.y) / 1.57);
                int starX = int(starXf * 1000.0 * 16.0);
                int starY = int(starYf * 250.0 * 16.0);
                float starTest = float(7 + starX * starY * 13);
                float value = abs(mod(starTest, 5000.0));
                if ( value >= .0 && value <= .5)
                {
                    color = vec3(value * 1.5 + .5);
                }
                else{
                    opacity = 0.2;
                }
            }

        }

        `);
        /** End of Custom Shaders **/

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