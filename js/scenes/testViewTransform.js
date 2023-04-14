import * as global from "../global.js";
import { quat } from "../render/math/gl-matrix.js";
import { Gltf2Node } from "../render/nodes/gltf2.js";

export const init = async model => {

    //let gltf1 = new Gltf2Node({ url: './media/gltf/space/space.gltf' });
    let gltf2 = new Gltf2Node({ url: './media/gltf/fire_in_the_sky/scene.gltf' });
    let gltf1 = new Gltf2Node({ url: './media/gltf/dae_diorama_-_eco_house/scene.gltf' });
    let rotation1 = quat.create();
    let rotation2 = quat.create();

    gltf1.addNode(gltf2);
    gltf1.translation = [0, 1.5, 0];
    gltf1.scale = [.05,.05,.05];

//  gltf2.matrix = [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0.5,0,1]; // You can also set the matrix directly.
     gltf2.translation = [0, 0, 0];
     gltf2.scale = [1,1,1];

    global.gltfRoot.addNode(gltf1);
    //global.gltfRoot.addNode(gltf1);
    model.animate(() => {
        quat.rotateY(rotation1, rotation1, -0.003);
        quat.rotateY(rotation2, rotation2,  0.030);

        gltf1.rotation = rotation1;

        gltf2.translation = [0, 1.5 + .5 * Math.sin(model.time * 10), 0];
        gltf2.rotation = rotation2;
    });
    model.animate(() => {
        quat.rotateY(rotation1, rotation1, -0.003);
        quat.rotateY(rotation2, rotation2,  0.030);

        gltf1.rotation = rotation1;

        //gltf2.translation = [0, 1.5 + .5 * Math.sin(model.time * 10), 0];
        gltf2.translation = [2, 2, 0];
        gltf2.rotation = rotation2;
    });
}
