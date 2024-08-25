const scene = new THREE.Scene();
scene.background = new THREE.Color(0x333333);

const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(
    -aspect * 10, aspect * 10, 10, -10, 0.1, 1000
);

camera.position.set(20, 20, 20);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const baseGeometry = new THREE.PlaneGeometry(20, 20);
const baseMaterial = new THREE.MeshBasicMaterial({ color: 0x4CAF50 });
const basePlate = new THREE.Mesh(baseGeometry, baseMaterial);
basePlate.rotation.x = -Math.PI / 2;
scene.add(basePlate);

const playerHeight = 4; 
const cubeGeometry = new THREE.BoxGeometry(2, playerHeight, 2);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x2196F3 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(0, playerHeight / 2, 0); 
scene.add(cube);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

window.addEventListener('resize', () => {
    const aspect = window.innerWidth / window.innerHeight;
    camera.left = -aspect * 10;
    camera.right = aspect * 10;
    camera.top = 10;
    camera.bottom = -10;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const position = { x: 0, z: 0 };

document.addEventListener('keydown', (event) => {
    const key = event.key;

    switch (key) {
        case 'w':
            position.z -= 1;
            break;
        case 's':
            position.z += 1;
            break;
        case 'a':
            position.x -= 1;
            break;
        case 'd':
            position.x += 1;
            break;
    }

    updateCubePosition();
});

function updateCubePosition() {
    cube.position.set(position.x, playerHeight / 2, position.z);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();
