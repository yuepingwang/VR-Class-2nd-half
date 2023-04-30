import * as global from "../global.js";
import { Gltf2Node } from "../render/nodes/gltf2.js";

export default () => {
   global.scene().addNode(new Gltf2Node({
      url: ""
   })).name = "backGround";

   return {
      enableSceneReloading: true,
      scenes: [ 
         // { name: "DemoSimplest"       , path: "./demoSimplest.js"       },
         // { name: "DemoShapes"         , path: "./demoShapes.js"         },
         // { name: "DemoRobot"          , path: "./demoRobot.js"          },
         // { name: "DemoControllers"    , path: "./demoControllers.js"    },
         // { name: "DemoControllerBeam" , path: "./demoControllerBeam.js" },
         // { name: "DemoCanvas"         , path: "./demoCanvas.js"         },
         // { name: "DemoTwoCubes"       , path: "./demoTwoCubes.js"       },
         // { name: "DemoTrianglesMesh"  , path: "./demoTrianglesMesh.js"  },
         // { name: "DemoOpacity"        , path: "./demoOpacity.js"        },
         // { name: "DemoHUD"            , path: "./demoHUD.js"            },
         // { name: "DemoHands"          , path: "./demoHands.js"          },
         // { name: "DemoShader"         , path: "./demoShader.js"         },
         // { name: "DemoTerrain"        , path: "./demoTerrain.js"        },
         // { name: "DemoRayTrace"       , path: "./testFlyEffect.js"       },
         // { name: "DemoAudio"          , path: "./demoAudio.js"          },
         // { name: "DemoWire"           , path: "./demoWire.js"           },
         // { name: "DemoBlending"       , path: "./demoBlending.js"       },
         // { name: "DemoParticles"      , path: "./demoParticles.js"      },
         // { name: "DemoGLTF"           , path: "./demoGLTF.js"           },
         // { name: "DemoSprite"         , path: "./demoSprite.js"         },
         // { name: "TestFlyEffect"      , path: "./testFlyEffect.js"      },
         // { name: "TestViewTransform"  , path: "./testViewTransform.js"      },
         // { name: "Diving Scene 2"  , path: "./testDiving1.js"      },
         { name: "Diving Scene 2"  , path: "./testViewTransform2.js"      },
         { name: "Cube Modeler"  , path: "./testCubeModeler.js"      },
         { name: "Sphere Modeler"  , path: "./testSphereModeler.js"      },
         { name: "Diving Scene 1"  , path: "./testDiving.js"      },
         { name: "TestViewTransform(Primitives)"  , path: "./testViewTransform1.js"      },
         { name: "ViewTransformInteractions(Primitives)"  , path: "./testViewTransform2.js"      },
      ]
   };
}

