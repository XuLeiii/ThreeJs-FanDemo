function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xcccccc);
  //scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    100000000
  );
  camera.position.set(
    -112417.55771430256,
    64121.59264444466,
    23940.856823256017
  );
  camera.rotation.set(
    -1.2178822080031084,
    -0.9004236436148543,
    -1.1313862615404136
  );

  // controls

  controls = new THREE.OrbitControls(camera, renderer.domElement);

  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.25;

  controls.screenSpacePanning = false;

  controls.maxPolarAngle = Math.PI / 2;

  window.addEventListener("resize", onWindowResize, false);

  hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
  hemiLight.color.setHSL(0.6, 1, 0.6);
  hemiLight.groundColor.setHSL(0.095, 1, 0.75);
  hemiLight.position.set(0, 50, 0);
  scene.add(hemiLight);

  var ambient = new THREE.AmbientLight(0x9a9a9a);
  scene.add(ambient);

  var light = new THREE.DirectionalLight(0xffffff, 1.0);
  light.position.set(1, 0.5, 0.8);

  hemiLightHelper = new THREE.HemisphereLightHelper(hemiLight, 10);
  scene.add(hemiLightHelper);

  var loader = new THREE.ObjectLoader();









  //模型包围盒
  var modelBox3 = new THREE.Box3();
  var meshBox3 = new THREE.Box3();
  loader.load("../model/rac_advanced_sample_project.rvt.json", function (obj) {
    scene.add(obj);

    //获取模型的包围盒
    modelBox3.expandByObject(obj);//将无限包围盒包裹在obj这个模型上。

    //计算模型的中心点坐标，这个为爆炸中心向量坐标
    var modelWorldPs = new THREE.Vector3()
      .addVectors(modelBox3.max, modelBox3.min)
      .multiplyScalar(0.5);

    obj.traverse(function (value) {
      if (value.isMesh) {
        meshBox3.setFromObject(value);
        //获取每个mesh的初始中心点，爆炸方向为爆炸中心点指向mesh中心点
        var worldPs = new THREE.Vector3()
          .addVectors(meshBox3.max, meshBox3.min)
          .multiplyScalar(0.5);
        if (isNaN(worldPs.x)) return;
        //计算爆炸方向
        value.worldDir = new THREE.Vector3()
          .subVectors(worldPs, modelWorldPs)
          .normalize();
        //保存初始坐标
        value.userData.oldPs = value.getWorldPosition(new THREE.Vector3());
      }
    });

    function applyScalar(scalar) {
      obj.traverse(function (value) {
        if (!value.isMesh || !value.worldDir) return;

        //爆炸公式
        value.position.copy(
          new THREE.Vector3()
            .copy(value.userData.oldPs)
            .add(
              new THREE.Vector3().copy(value.worldDir).multiplyScalar(scalar)
            )
        );
      });
    }

    document
      .querySelector("#myRange")
      .addEventListener("input", function (evt) {
        applyScalar(this.value * 500);
      });
  });
  var axesHelper = new THREE.AxesHelper(500000);
  scene.add(axesHelper);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
  render();
}

function render() {
  renderer.render(scene, camera);
}
