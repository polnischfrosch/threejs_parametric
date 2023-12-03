//IMPORT MODULES
import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';
import { createNoise2D, createNoise4D } from "simplex-noise";

//CONSTANT & VARIABLES
let width = window.innerWidth;
let height = window.innerHeight;
//-- GUI PARAMETERS
var gui;
const parameters = {
  planeSize: 15,
  amplitude: 1,
  timeScale: 1,
  resolution: 0.1
}

//-- SCENE VARIABLES
var scene;
var camera;
var renderer;
var container;
var control;
var ambientLight;
var directionalLight;
var ticks = 0;

// Noise variables
const clock = new THREE.Clock();
const noise2D = createNoise2D();

//-- GEOMETRY PARAMETERS
//Create a variable storing the mesh
var mesh = null;
let planeS = parameters.planeSize;
let amp = parameters.amplitude;
let timeS = parameters.timeScale;
let res = parameters.resolution;


function main(){  
  //GUI
  gui = new GUI;
  gui.add(parameters, 'planeSize', 1, 25, 1);
  gui.add(parameters, 'amplitude', -2, 2, 0.1);
  gui.add(parameters, 'timeScale', -2, 2, 0.1);
  gui.add(parameters, 'resolution', 0, 0.2, 0.001);

  //CREATE SCENE AND CAMERA
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 35, width / height, 0.1, 100);
  camera.position.set(20, 20, 20)


  //LIGHTINGS
  ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  directionalLight = new THREE.DirectionalLight( 0xffffff, 1);
  directionalLight.position.set(2,5,5);
  directionalLight.target.position.set(-1,-1,0);
  scene.add( directionalLight );
  scene.add(directionalLight.target);


  //GEOMETRY INITIATION
  // Initiate MeshGrid
  createMeshGrid();


  //RESPONSIVE WINDOW
  window.addEventListener('resize', handleResize);
 
  //CREATE A RENDERER
  renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container = document.querySelector('#threejs-container');
  container.append(renderer.domElement);
  
  //CREATE MOUSE CONTROL
  control = new OrbitControls( camera, renderer.domElement );


  //EXECUTE THE UPDATE
  animate();
}
 
//-----------------------------------------------------------------------------------
//HELPER FUNCTIONS
//-----------------------------------------------------------------------------------
//GEOMETRY FUNCTIONS

// Create MeshGrid
function createMeshGrid(){
  const segments = planeS;
  const planeGeometry = new THREE.PlaneGeometry(planeS,planeS,segments,segments);
  const planeMaterial = new THREE.MeshBasicMaterial({ color: "#2b2b2b", wireframe: true })
  const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
  // Adjust the rotation of the plane to lay it flat
  planeMesh.rotation.x = -Math.PI / 2;
  // Adjust z height with displacement
  displaceVertices(planeMesh);
  mesh = planeMesh;
  scene.add(planeMesh);

  
}

// Vertices Displacement function
function displaceVertices(mesh){
  //const elapsedTime = clock.getElapsedTime();
  ticks += 0.02*timeS;
  const elapsedTime = ticks;
  //console.log(elapsedTime);
  const positions = mesh.geometry.attributes.position;
  for (let i = 0; i < positions.count; i++) {
    // Get the x, y, and z values of the vertex
    const x = positions.getX(i);
    const y = positions.getY(i);
    const z = positions.getZ(i);
    let noiseValue = noise2D(x*res+elapsedTime, y*res+elapsedTime);
    // Displace the vertex along the z-axis based on the noise value
    positions.setZ(i, z + noiseValue * amp);
  };
}

//RESPONSIVE
function handleResize() {
  width = window.innerWidth;
  height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  renderer.render(scene, camera);
}

//Remove 3D Objects and clean the caches
function removeMeshFromScene(scene, mesh) {
  // Check if the mesh exists in the scene
  if (scene && mesh && scene.children.includes(mesh)) {
      // Remove the mesh from the scene
      scene.remove(mesh);
      // Dispose of geometry and material if they exist
      if (mesh.geometry) {
          mesh.geometry.dispose();
      }
      if (mesh.material) {
          // If the material is an array, iterate through it
          if (Array.isArray(mesh.material)) {
              mesh.material.forEach(material => material.dispose());
          } else {
              mesh.material.dispose();
          }
      }

  }
  mesh = null;
}


//ANIMATE AND RENDER
function animate() {
  requestAnimationFrame( animate );
  control.update();
  removeMeshFromScene(scene, mesh);

  if(planeS != parameters.planeSize){
    planeS = parameters.planeSize; // Update the planeS variable to the new size
  } 
  amp = parameters.amplitude;
  res = parameters.resolution;
  timeS = parameters.timeScale;
  createMeshGrid();
  renderer.render( scene, camera );
  console.log(camera.position)
}

//-----------------------------------------------------------------------------------
// CLASS
//-----------------------------------------------------------------------------------



//-----------------------------------------------------------------------------------
// EXECUTE MAIN 
//-----------------------------------------------------------------------------------
main();