/*
	Main js entry for template ATON web-app

===============================================*/
// Realize our app
let APP = ATON.App.realize();

// You can require here flares (plugins) if needed by the app
//APP.requireFlares(["myFlare","anotherFlare"]);

// APP.setup() is required for web-app initialization
// You can place here UI setup (HTML), events handling, etc.
APP.setup = ()=>{

	// Realize base ATON and add base UI events
    ATON.realize();
    ATON.UI.addBasicEvents();

	APP.gItem = ATON.createSceneNode("item");
	APP.gItem.attachToRoot();

	let url = APP.params.get("m");
	if (url){
        APP.baseFolder = ATON.Utils.getBaseFolder(ATON.Utils.resolveCollectionURL(url));
		APP.gItem.load(url);
	}

	APP.setupEventHandling();

    ATON.UI.get("slider").append(
        ATON.UI.createSlider({
            range: [0.0,1.0],
            step: 0.1,
            oninput: (v)=>{
                APP.updateItem(v)
            }
        })
    );
};

APP.updateItem = (v)=>{
	APP.gItem.traverse( ( o ) => {
		if (o.material && o.material.uniforms){
            let UU = o.material.uniforms;

            UU.wSem.value = v;
        }
    });
}

// Custom Mat
APP.createMaterial = (mat)=>{

    let M = new CustomShaderMaterial({
        baseMaterial: mat,

        uniforms: {
            time: { type:'float', value: 0.0 },
            wSem: { type:'float', value: 0.0 },
            //tBase: { type:'t' },
            tSem: { type:'t' }
        },

        vertexShader:`
            varying vec3 vPositionW;
            varying vec4 vPos;

            varying vec3 vNormalW;
            varying vec3 vNormalV;

            varying vec2 sUV;

            void main(){
                vPositionW = ( modelMatrix * vec4( position, 1.0 )).xyz;
                vPos       = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

                vNormalV   = normalize( vec3( normalMatrix * normal ));
                vNormalW   = (modelMatrix * vec4(normal, 0.0)).xyz;

                gl_Position = vPos;

                sUV = uv;
            }
        `,

        fragmentShader:`
            varying vec3 vPositionW;
            varying vec4 vPos;

            varying vec3 vNormalW;
            varying vec3 vNormalV;
            varying vec2 sUV;

            uniform float time;
            uniform float wSem;

            uniform sampler2D tSem;

            void main(){
                float a = csm_DiffuseColor.a;
                vec2 uvCoords = sUV;
                vec4 semcol = texture2D(tSem, uvCoords);

                float k = (csm_DiffuseColor.r + csm_DiffuseColor.g + csm_DiffuseColor.b)/3.0;
                k *= 0.3;

                semcol = mix(vec4(k,k,k,1),semcol, semcol.a);

                csm_DiffuseColor = mix(csm_DiffuseColor,semcol, wSem);
                csm_DiffuseColor.a = a;
            }
        `
	});

	return M;
};

APP.visitor = ()=>{
    if (!APP.gItem) return;

    APP.gItem.traverse( ( o ) => {
		if (o.material && o.material.map){
			let tex   = o.material.map;
			let name  = tex.name;
            //let base  = name + ".jpg";
            //let dname = name + "_"+DSC._dlayer + DSC.TEX_EXT;
            
            let semname = APP.baseFolder + name + "-semap.jpg";

            console.log(name)

            // if first time, setup custom material
            if (!o.material.userData.mSem) o.material = APP.createMaterial(o.material);

			let UU = o.material.uniforms;
			//UU.wSem.value = 1.0;

            ATON.Utils.loadTexture(semname, t => {
                t.flipY = false;
                t.wrapS = THREE.RepeatWrapping;
                t.wrapT = THREE.RepeatWrapping;
                t.colorSpace = ATON._stdEncoding;

                if (UU) UU.tSem.value = t;
                //UU.tDiscov.value.needsUpdate = true;
                o.material.needsUpdate = true;
                //console.log(tex)
            });

			o.material.userData.mSem = true;
		}
	});
};

APP.setupEventHandling = ()=>{
    // If our app required ore or more flares (plugins), we can also wait for them to be ready for specific setups
    ATON.on("AllFlaresReady",()=>{
		// Do stuff
		console.log("All flares ready");
	});

	ATON.on("AllNodeRequestsCompleted",()=>{
		APP.visitor();
	});
};

/* If you plan to use an update routine (executed continuously), you can place its logic here.
APP.update = ()=>{

};
*/
