const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const aspect = window.innerWidth / window.innerHeight;
const camera = new THREE.OrthographicCamera(
    -aspect * 10, aspect * 10, 10, -10, 0.1, 1000
);

const cameraOffset = { x: 0, y: 20, z: -20 };
camera.position.set(cameraOffset.x, cameraOffset.y, cameraOffset.z);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(10, 20, 10);
scene.add(directionalLight);

// Player
const playerWidth = 2;
const playerHeight = 4;
const cubeGeometry = new THREE.BoxGeometry(playerWidth, playerHeight, playerWidth);
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x2196F3 });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(0, playerHeight / 2, 0);
scene.add(cube);

// Terrain generation
const terrainGroup = new THREE.Group();
scene.add(terrainGroup);

const rowDepth = 10;
const visibleRows = 20;
let currentRow = 0;

function createTree(x, z) {
    const trunkGeometry = new THREE.BoxGeometry(1, 1, 1);
    const trunkMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(x, 0.5, z);

    const leafHeight = Math.random() < 0.5 ? 2 : 3;
    const leavesGeometry = new THREE.BoxGeometry(3, leafHeight, 3);
    const leavesMaterial = new THREE.MeshBasicMaterial({ color: 0x228B22 });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.set(x, 1 + leafHeight / 2, z);

    const treeGroup = new THREE.Group();
    treeGroup.add(trunk);
    treeGroup.add(leaves);
    return treeGroup;
}

function createSafeRegion(z) {
    const regionGeometry = new THREE.PlaneGeometry(1000, rowDepth);
    const regionMaterial = new THREE.MeshBasicMaterial({ color: 0x4CAF50, side: THREE.DoubleSide });
    const region = new THREE.Mesh(regionGeometry, regionMaterial);
    region.rotation.x = -Math.PI / 2;
    region.position.set(0, 0, z);

    // Add trees
    for (let i = -500; i < 500; i += 20) {
        if (Math.random() < 0.3) { 
            const treeX = i + Math.random() * 20 - 10;
            const treeZ = z + Math.random() * rowDepth - rowDepth / 2;
            const tree = createTree(treeX, treeZ);
            region.add(tree);
        }
    }

    return region;
}

function createWaterRegion(z) {
    const regionGeometry = new THREE.PlaneGeometry(1000, rowDepth);
    const regionMaterial = new THREE.MeshBasicMaterial({ color: 0x4169E1, side: THREE.DoubleSide });
    const region = new THREE.Mesh(regionGeometry, regionMaterial);
    region.rotation.x = -Math.PI / 2;
    region.position.set(0, 0, z);
    return region;
}

function createRoadRegion(z) {
    const regionGeometry = new THREE.PlaneGeometry(1000, rowDepth);
    const regionMaterial = new THREE.MeshBasicMaterial({ color: 0x808080, side: THREE.DoubleSide });
    const region = new THREE.Mesh(regionGeometry, regionMaterial);
    region.rotation.x = -Math.PI / 2;
    region.position.set(0, 0, z);
    return region;
}

function createTrainTrackRegion(z) {
    const regionGeometry = new THREE.PlaneGeometry(1000, rowDepth);
    const regionMaterial = new THREE.MeshBasicMaterial({ color: 0x8B4513, side: THREE.DoubleSide });
    const region = new THREE.Mesh(regionGeometry, regionMaterial);
    region.rotation.x = -Math.PI / 2;
    region.position.set(0, 0, z);

    // Add rail lines
    const railGeometry = new THREE.BoxGeometry(1000, 0.2, 0.5);
    const railMaterial = new THREE.MeshBasicMaterial({ color: 0x696969 });
    const rail1 = new THREE.Mesh(railGeometry, railMaterial);
    const rail2 = new THREE.Mesh(railGeometry, railMaterial);
    rail1.position.set(0, 0.1, -1);
    rail2.position.set(0, 0.1, 1);
    region.add(rail1);
    region.add(rail2);

    return region;
}

function generateTerrain() {
    while (terrainGroup.children.length < visibleRows) {
        let region;
        const z = currentRow * rowDepth;

        if (currentRow % 2 === 0 || currentRow % 3 === 0) { 
            region = createSafeRegion(z);
        } else {
            const dangerType = Math.random();
            if (dangerType < 0.33) {
                region = createWaterRegion(z);
            } else if (dangerType < 0.66) {
                region = createRoadRegion(z);
            } else {
                region = createTrainTrackRegion(z);
            }
        }
        terrainGroup.add(region);
        currentRow++;
    }

    
    while (terrainGroup.children.length > visibleRows) {
        terrainGroup.remove(terrainGroup.children[0]);
    }
}


let lastMoveTime = Date.now();

document.addEventListener('keydown', (event) => {
    const key = event.key;
    const moveDistance = 2;

    switch (key) {
        case 'w':
            cube.position.z += moveDistance;
            break;
        case 's':
            cube.position.z -= moveDistance;
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

    if (timeSinceLastMove > 3000) {
        targetX = cube.position.x;
        targetZ = cube.position.z + cameraOffset.z;
    } else {
        const diffX = cube.position.x - camera.position.x;
        const diffZ = (cube.position.z + cameraOffset.z) - camera.position.z;

        targetX = camera.position.x;
        targetZ = camera.position.z;

        if (Math.abs(diffX) > threshold) {
            targetX += diffX - Math.sign(diffX) * threshold;
        }
        if (Math.abs(diffZ) > threshold) {
            targetZ += diffZ - Math.sign(diffZ) * threshold;
        }
    }

    camera.position.x += (targetX - camera.position.x) * cameraFollowSpeed;
    camera.position.z += (targetZ - camera.position.z) * cameraFollowSpeed;
    camera.position.y = cameraOffset.y;
    camera.lookAt(camera.position.x, 0, camera.position.z - cameraOffset.z);
}

function animate() {
    generateTerrain();
    updateCamera();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();


window.addEventListener('resize', () => {
    const aspect = window.innerWidth / window.innerHeight;
    camera.left = -aspect * 10;
    camera.right = aspect * 10;
    camera.top = 10;
    camera.bottom = -10;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});