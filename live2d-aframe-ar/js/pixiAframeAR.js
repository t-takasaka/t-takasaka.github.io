PIXI.loader.add('moc', "../assets/Koharu/Koharu.moc3", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.BUFFER })
PIXI.loader.add('texture', "../assets/Koharu/Koharu.png")
PIXI.loader.add('motion', "../assets/Koharu/Koharu.motion3.json", { xhrType: PIXI.loaders.Resource.XHR_RESPONSE_TYPE.JSON });
PIXI.loader.once('complete', onComplate);
PIXI.loader.load();
function onComplate(loader, resources) {
	var app = new PIXI.Application(1280, 720, { transparent: true });
	//document.body.appendChild(app.view);
	var moc = LIVE2DCUBISMCORE.Moc.fromArrayBuffer(resources['moc'].data);
	var model = new LIVE2DCUBISMPIXI.ModelBuilder()
		.setMoc(moc)
		.setTimeScale(1)
		.addTexture(0, resources['texture'].texture)
		.addAnimatorLayer("base", LIVE2DCUBISMFRAMEWORK.BuiltinAnimationBlenders.OVERRIDE, 1)
		.build();

	app.stage.addChild(model);
	app.stage.addChild(model.masks);
	var animation = LIVE2DCUBISMFRAMEWORK.Animation.fromMotion3Json(resources['motion'].data);
	model.animator
		.getLayer("base")
		.play(animation);

	app.ticker.add(function (deltaTime) {
		model.update(deltaTime);
		model.masks.update(app.renderer);
	});

	var plane = document.createElement('a-plane');
	plane.setAttribute('koharu', '');
	plane.setAttribute('color', '#000');
	plane.setAttribute('height', '5');
	plane.setAttribute('width', '5');
	plane.setAttribute('position', '0 1.5 0');

	var marker = document.querySelector('a-marker-camera');
	marker.appendChild(plane);

	AFRAME.registerComponent('koharu', {
		init: function () {
			var texture = new THREE.Texture(app.view);
			var material = new THREE.MeshStandardMaterial({ map: texture, metalness: 0 });
			var mesh = this.el.getObject3D('mesh');
			mesh.material = material;
		},
		update: function(){
			var width = 512;
			var height = 512;
			app.view.style.width = width + "px";
			app.view.style.height = height + "px";
			app.renderer.resize(width, height);
			model.position = new PIXI.Point(width * 0.5, height * 0.5);
			model.scale = new PIXI.Point(model.position.x, model.position.x);
			model.masks.resize(app.view.width, app.view.height);
		},
		tick: function (time, timeDelta) {
			var mesh = this.el.getObject3D('mesh');
			mesh.material.map.needsUpdate = true;
		}
	});
}

if( navigator.userAgent.indexOf("Android") > 0 ) {
	let handleStream = s => {
		document.body.append(
			Object.assign(document.createElement('video'), {
				autoplay: true,
				srcObject: s
			})
		);
	}
	navigator.mediaDevices.enumerateDevices().then(devices => {
		let sourceId = null;
		for (var device of devices) {
			if (device.kind == 'videoinput' && (!sourceId || device.label.indexOf('back') !== -1)) {
				sourceId = device.deviceId;
			}
		}
		if (sourceId) {
			let constraints = {
				video: {
					sourceId: sourceId
				}
			};
			navigator.mediaDevices.getUserMedia(constraints)
			.then(handleStream);
		}
	});
}