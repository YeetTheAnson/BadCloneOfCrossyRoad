const scene = new THREE.Scene();
scene.background = new THREE.Color(0x333333);

const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(
    -aspect * 10, aspect * 10, 10, -10, 0.1, 1000
);

const cameraOffset = { x: 20, y: 20, z: 20 };
camera.position.set(cameraOffset.x, cameraOffset.y, cameraOffset.z);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const gridHelper = new THREE.GridHelper(500, 500, 0x000000, 0x000000);
gridHelper.position.y = 0;
gridHelper.material.opacity = 0.1;
gridHelper.material.transparent = true;
scene.add(gridHelper);

const basePlateSize = 1000;
const baseGeometry = new THREE.PlaneGeometry(basePlateSize, basePlateSize);
const baseMaterial = new THREE.MeshBasicMaterial({ color: 0x4CAF50 });
const basePlate = new THREE.Mesh(baseGeometry, baseMaterial);
basePlate.rotation.x = -Math.PI / 2;
scene.add(basePlate);

const playerWidth = 2;
const playerHeight = 4; 
const cubeGeometry = new THREE.BoxGeometry(playerWidth, playerHeight, playerWidth);
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

let lastMoveTime = Date.now();

document.addEventListener('keydown', (event) => {
    const key = event.key;
    const moveDistance = 2;

    switch (key) {
        case 'w':
            cube.position.z -= moveDistance;
            break;
        case 's':
            cube.position.z += moveDistance;
            break;
        case 'a':
            cube.position.x -= moveDistance;
            break;
        case 'd':
            cube.position.x += moveDistance;
            break;
    }

    lastMoveTime = Date.now();
});

const threshold = 5;
const cameraFollowSpeed = 0.1;

function updateCamera() {
    const currentTime = Date.now();
    const timeSinceLastMove = currentTime - lastMoveTime;

    let targetX, targetZ;

    if (timeSinceLastMove > 2500) {
        targetX = cube.position.x;
        targetZ = cube.position.z;
    } else {
        const diffX = cube.position.x - (camera.position.x - cameraOffset.x);
        const diffZ = cube.position.z - (camera.position.z - cameraOffset.z);

        targetX = camera.position.x - cameraOffset.x;
        targetZ = camera.position.z - cameraOffset.z;

        if (Math.abs(diffX) > threshold) {
            targetX += diffX - Math.sign(diffX) * threshold;
        }
        if (Math.abs(diffZ) > threshold) {
            targetZ += diffZ - Math.sign(diffZ) * threshold;
        }
    }

    camera.position.x += (targetX + cameraOffset.x - camera.position.x) * cameraFollowSpeed;
    camera.position.z += (targetZ + cameraOffset.z - camera.position.z) * cameraFollowSpeed;

    camera.position.y = cameraOffset.y;

    camera.lookAt(camera.position.x - cameraOffset.x, 0, camera.position.z - cameraOffset.z);
}

function animate() {
    updateCamera();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();