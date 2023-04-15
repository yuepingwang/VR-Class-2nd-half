/******************************************************************

 This demo shows how you can embed an entire ray tracer
 inside the fragment shader.

 As with any change to the fragment shader, you need to
 set a flag (in this case uRayTrace) so that the ray tracing
 code will run only for the object(s) that you select.

 You can also see here how to toggle Heads-Up Display (HUD)
 mode for the object that is running the ray tracing shader
 code, by using 'h' mode toggle.

 ******************************************************************/
import { controllerMatrix, buttonState, joyStickState, getViews, viewMatrix} from "../render/core/controllerInput.js";
let leftTriggerPrev = false;
let rightTriggerPrev = false;

let prev_time = 0;

export const init = async model => {
    let screen = model.add('cube').scale(4.0);
    let isHUD = false;
    model.control('h', 'toggle HUD', () => isHUD = ! isHUD);
    model.setRoom(false);
    model.setTable(false);
    model.identity().scale(8.0);
    let posZ = -100.;
    let posX = 0.;
    let posY = 0.;


    model.animate(() => {
        // Add Controllers
        let ml = controllerMatrix.left;
        let mr = controllerMatrix.right;
        let leftTrigger = buttonState.left[0].pressed;
        let rightTrigger = buttonState.right[0].pressed;

        posZ = -model.time;
        if (leftTrigger||rightTrigger){
            if (prev_time==0)
                prev_time = model.time;
            if (leftTrigger&&rightTrigger){
                posY +=1.;
                // posY += 10*model.time-prev_time;
            }
            else if (leftTrigger){
                posX -=1.;
                //posX -= 10*model.time-prev_time;
            }
            else {
                posX +=1.;
                //posX += 10*model.time-prev_time;
            }
        }
        else
            prev_time=0;


        let m = views[0]._viewMatrix, c = .5*Math.cos(model.time), s = .5*Math.sin(model.time);
        if (isHUD)
            model.hud();
        else
            model.setMatrix([m[0],m[4],m[8],0,m[1],m[5],m[9],0,m[2],m[6],m[10],0,0,1.6,-1,1]);
        model.scale(1.,1.,.0001);

        model.flag('uRayTrace');
        model.setUniform('4fv','uL', [.5,.5,.5,1., -.5,-.5,-.5,.2, .7,-.7,0,.2, -.7,.7,0,.2]);
        model.setUniform('4fv','uS', [c,s,0,0, s,0,c,0, 0,c,s,0, -c,-s,0,0]);
        model.setUniform('4fv','uC', [0,0,0,2., 0,1,1,2, 1,0,1,2, 0,1,0,2]);
        model.setUniform('4fv','uP', [posX,posY,posZ+0.1,0, 0,0,0,0, 0,0,0,0, 0,0,0,0]);


        model.customShader(`
        #define ITR 60
        #define FAR 400.
        //uniform vec4 time;
        
        uniform int uRayTrace;
        uniform vec4 uC[4], uL[4], uS[4], uP[4];
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
        
        // vec3 normal(vec3 p)
        // {  
        //     vec2 e = vec2(-1., 1.)*0.01;
        //     return normalize(e.yxx*map(p + e.yxx) + e.xxy*map(p + e.xxy) + 
        //                      e.xyx*map(p + e.xyx) + e.yyy*map(p + e.yyy) );   
        // }
        
         // float raySphere(vec3 V, vec3 W, vec4 S) {
         //    V -= S.xyz;
         //    float b = dot(V, W);
         //    float d = b * b - dot(V, V) + S.w * S.w;
         //    return d < 0. ? -1. : -b - sqrt(d);
         // }
         // vec3 shadeSphere(vec3 p, vec4 s, vec4 c) {
         //    vec3 N = normalize(p - s.xyz);
         //    vec3 color = .1 * c.rgb;
         //    for (int l = 0 ; l < 4 ; l++) {
         //       vec3 lDir = light[l].xyz;
         //       float lBrightness = light[l].w;
         //       float t = -1.;
         //       for (int i = 0 ; i < 4 ; i++)
         //          t = max(t, raySphere(p, lDir, sphere[i]));
         //       if (t < 0.) {
         //          vec3 R = 2. * N * dot(N, lDir) - lDir;
         //          color += lBrightness * ( c.rgb * .9 * max(0., dot(N, lDir))
         //                                 + c.a * vec3(pow(max(0., R.z), 10.)) );
         //       }
         //    }
         //    return color;
         // }
         
         //---------------------------------------------------------------------
	 if (uRayTrace == 1) {
	    float fl = -1. / uProj[3].z; // FOCAL LENGTH OF VIRTUAL CAMERA
            for (int i = 0 ; i < 4 ; i++) {
               light[i]  = vec4((uView * vec4(uL[i].xyz,0.)).xyz,uL[i].w);
               sphere[i] = vec4((uView * uS[i]).xyz,.25) - vec4(0.,0.,fl,0.);
            }
            
            vec3 V = vec3(0.,10.,uP[0].z);
            //vec3 V = vec3(0.,0.,-100.);
            vec3 W = normalize(vec3(2.*vUV.x-1.,1.-2.*vUV.y,-fl));
            float tMin = 1000.;
            
            float rz = march(V,W);
            //float rz =  200.;
            if ( rz < FAR )
            {
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
                color = vec3(0.35,0.07,0.5);
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
                if ( value >= 0.0 && value <= .5)
                    {
                        color = vec3(value * 0.5 + .5);
                    }
                else{
                    opacity = 0.2;
                }
            }
             
         }
        
      `);
    });
}
