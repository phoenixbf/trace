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
    else {
        ATON.UI.showModal({
            header: "TRACE tool",
            body: ATON.UI.createContainer({items: [
                ATON.UI.createElementFromHTMLString(`
                    <p>
                    <b>TRACE</b> (Texture Rendering with Annotated Color Encoding) is an interactive Web3D tool for visualizing and inspecting 3D models, designed to highlight and compare modified or reconstructed areas through false-color texturing.<br><br>
                    
                    The system supports <b>transparency and traceability</b> of manual interventions carried out by 3D modelers, such as integrations used to fill <i>holes</i> that emerged due to complex acquisition conditions.<br><br>
                    TRACE supports models with color-coded maps, multiple textures, and interactive inspection using a slider.
                    </p>`
                ),

                ATON.UI.createDropdown({
                    title: "Pick a 3D model",
                    btnclasses: "btn-default",
                    classes: "d-grid gap-2 dropup dropup-center",
                    items:[
                        {
                            title: "Mammouth",
                            icon: "collection-item",
                            url: APP.basePath+"?m=aldrovandi/models/CIPA2025/CS1-mammuth/mammuth_cs1.gltf",
                        },
                        {
                            title: "Mosasaurus",
                            icon: "collection-item",
                            url: APP.basePath+"?m=aldrovandi/models/CIPA2025/CS2-mosasaurus/Mosasaurus.gltf"
                        },
                        {
                            title: "Pesce Martello",
                            icon: "collection-item",
                            url: APP.basePath+"?m=aldrovandi/models/CIPA2025/CS3-pescemartello/pesce-martello.gltf"
                        },
                        {
                            title: "Linum",
                            icon: "collection-item",
                            url: APP.basePath+"?m=aldrovandi/models/CIPA2025/CS4-linum/linum.gltf"
                        },
                        {
                            title: "Busto Aldrovandi",
                            icon: "collection-item",
                            url: APP.basePath+"?m=aldrovandi/models/CIPA2025/CS5-busto/bustoAldrovandi.gltf"
                        },
                        {
                            title: "Lofoforo",
                            icon: "collection-item",
                            url: APP.basePath+"?m=aldrovandi/models/CIPA2025/CS6-lofoforo/DCHOo_semplificato.gltf"
                        },
                        {
                            title: "Busto Donna",
                            icon: "collection-item",
                            url: APP.basePath+"?m=aldrovandi/models/CAA-ATENE2025/bustodonna/Busto_donnaDschagga.gltf"
                        },
                        {
                            title: "Teriaca",
                            icon: "collection-item",
                            url: APP.basePath+"?m=aldrovandi/models/CAA-ATENE2025/teriaca/Teriaca.gltf"
                        },
                        {
                            title: "Mandibola",
                            icon: "collection-item",
                            url: APP.basePath+"?m=aldrovandi/models/CAA-ATENE2025/mandibola/mandibola.gltf"
                        }
                    ]
                })
/*
                ATON.UI.createElementFromHTMLString(`

                        <div class="dropdown d-grid gap-2">
                            <button class="btn btn-secondary aton-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Pick a 3D model...
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="${APP.basePath}?m=aldrovandi/models/CIPA2025/CS1-mammuth/mammuth_cs1.gltf">Mammuth</a></li>
                                <li><a class="dropdown-item" href="${APP.basePath}?m=aldrovandi/models/CIPA2025/CS2-mosasaurus/Mosasaurus.gltf">Mosasaurus</a></li>
                                <li><a class="dropdown-item" href="${APP.basePath}?m=aldrovandi/models/CIPA2025/CS3-pescemartello/pesce-martello.gltf">Pesce Martello</a></li>
                                <li><a class="dropdown-item" href="${APP.basePath}?m=aldrovandi/models/CIPA2025/CS4-linum/linum.gltf">Linum</a></li>
                                <li><a class="dropdown-item" href="${APP.basePath}?m=aldrovandi/models/CIPA2025/CS5-busto/bustoAldrovandi.gltf">Busto Aldrovandi</a></li>
                                <li><a class="dropdown-item" href="${APP.basePath}?m=aldrovandi/models/CIPA2025/CS6-lofoforo/DCHOo_semplificato.gltf">Lofoforo</a></li>
                                <li><a class="dropdown-item" href="${APP.basePath}?m=aldrovandi/models/CAA-ATENE2025/bustodonna/Busto_donnaDschagga.gltf">Busto Donna</a></li>
                                <li><a class="dropdown-item" href="${APP.basePath}?m=aldrovandi/models/CAA-ATENE2025/teriaca/Teriaca.gltf">Teriaca</a></li>
                                <li><a class="dropdown-item" href="${APP.basePath}?m=aldrovandi/models/CAA-ATENE2025/mandibola/mandibola.gltf">Mandibola</a></li>
                            </ul>
                        </div>
                `)
*/
            ]})
        });
    }

	APP.setupEventHandling();

    ATON.UI.get("slider").append(
        ATON.UI.createSlider({
            range: [0.0,1.0],
            step: 0.1,
            value: 0.0,
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

                float t = max(max(semcol.r, semcol.g), semcol.b);

                semcol = mix(vec4(k,k,k,1),semcol, t);
                //semcol = mix(semcol,vec4(k,k,k,1), 0.4);

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
