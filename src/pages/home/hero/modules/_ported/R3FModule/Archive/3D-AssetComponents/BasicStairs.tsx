// import { useBox } from '@react-three/cannon';

// interface BasicStairsProps {
//     area: [number, number];                 // [Width (EW), Depth (NS)]
//     orientation: string;                    // 'NS' | 'SN'| 'EW' | 'WE' : Descending to Ascending steps
//     stairwayHeight: number;                 // Height will be passed in from roomHeight with floor offset of connecting floor
// }

// const BasicStairs = ({...props}) => {

// }

// export default BasicStairs



// Advanced Stairs:
// https://stackoverflow.com/questions/47438219/three-js-custom-stairs-geometry

// var renderer, scene, camera, controls;

// /**
//  * 
//  * @param {number} radius 
//  * @param {number} holeRadius 
//  * @param {number} segments 
//  * @param {number} angle
//  * @param {number} thetaStart 
//  * @param {number} thetaLength 
//  * @param {number} stepTheta 
//  */
// function StairsGeometry(radius, holeRadius, segments, angle, thetaStart, thetaLength, stepTheta) {

//   if (!(this instanceof StairsGeometry)) {
//     throw new TypeError("StairsGeometry needs to be called using new");
//   }

//   THREE.Geometry.call(this);

//   this.type = 'StairsGeometry';

//   this.parameters = {
//     radius: radius,
//     holeRadius: holeRadius,
//     segments: segments,
//     angle: angle,
//     thetaStart: thetaStart,
//     thetaLength: thetaLength,
//     stepTheta: stepTheta
//   };

//   this.fromBufferGeometry(new StairsBufferGeometry(radius, holeRadius, segments, angle, thetaStart, thetaLength, stepTheta));
//   this.mergeVertices();

// }

// StairsGeometry.prototype = Object.create(THREE.Geometry.prototype);
// StairsGeometry.prototype.constructor = StairsGeometry;

// /**
//  * 
//  * @param {number} radius 
//  * @param {number} holeRadius 
//  * @param {number} segments 
//  * @param {number} angle
//  * @param {number} thetaStart 
//  * @param {number} thetaLength 
//  * @param {number} stepTheta 
//  */
// function StairsBufferGeometry(radius, holeRadius, segments, angle, thetaStart, thetaLength, stepTheta) {

//   if (!(this instanceof StairsBufferGeometry)) {
//     throw new TypeError("StairsBufferGeometry needs to be called using new");
//   }

//   THREE.BufferGeometry.call(this);

//   this.type = 'StairsBufferGeometry';

//   this.parameters = {
//     radius: radius,
//     holeRadius: holeRadius,
//     segments: segments,
//     angle: angle,
//     thetaStart: thetaStart,
//     thetaLength: thetaLength,
//     stepTheta: stepTheta
//   };

//   var scope = this;

//   radius = !isNaN(radius) ? radius : 20;
//   holeRadius = !isNaN(holeRadius) ? holeRadius : 20;
//   height = !isNaN(height) ? height : 10;
//   segments = !isNaN(segments = Math.floor(segments)) ? segments : 8;
//   angle = !isNaN(angle) ? angle : Math.PI / 8;
//   thetaStart = !isNaN(thetaStart) ? thetaStart : 0;
//   thetaLength = !isNaN(thetaLength) ? thetaLength : Math.PI * 2;
//   stepTheta = !isNaN(stepTheta) ? stepTheta : Math.PI / 18;


//   // buffers

//   var indices = [];
//   var vertices = [];
//   var normals = [];
//   var uvs = [];

//   // helper variables

//   var index = 0;
//   var indexArray = [];

//   var circumference = thetaLength * radius;
//   var height = circumference * Math.tan(angle);

//   var stepSegments = Math.ceil(thetaLength / stepTheta);
//   var stepThetaSegments = segments;
//   segments = stepSegments * stepThetaSegments;

//   var stepHeight = height / stepSegments;
//   var halfStepHeight = stepHeight / 2;

//   var groupStart = 0;

//   generateStepTops();
//   generateStepFronts();

//   generateStepSide(true);
//   generateStepSide(false);

//   generateBottom();

//   generateSide(true);
//   generateSide(false);

//   generateEdge(true);
//   generateEdge(false);

//   this.setIndex(indices);
//   this.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
//   this.addAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
//   this.addAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));


//   function generateEdge(isStart) {

//     var indexStart = index;
//     var normal = new THREE.Vector3();
//     var vertex = new THREE.Vector3();

//     var theta = thetaStart;
//     if (!isStart) theta += thetaLength;
//     var sinTheta = Math.sin(theta);
//     var cosTheta = Math.cos(theta);
//     var startingHeight = halfStepHeight + (isStart ? 0 : height) - stepHeight;
//     for (var y = 0; y < 2; y++) {
//       for (var x = 0; x < 2; x++) {
//         var activeRadius = x == 0 ? holeRadius : radius;
//         vertex.x = activeRadius * sinTheta;
//         vertex.y = startingHeight + halfStepHeight * (y == 0 ? -1 : 1);
//         vertex.z = activeRadius * cosTheta;

//         vertices.push(vertex.x, vertex.y, vertex.z);

//         normal.set(sinTheta, 0, cosTheta).normalize();
//         normals.push(normal.x, normal.y, normal.z);

//         // uv

//         uvs.push(1 - x, 1 - y);
//         index++;
//       }
//     }

//     var a = indexStart + 0;
//     var b = indexStart + 1;
//     var c = indexStart + 3;
//     var d = indexStart + 2;

//     // faces

//     if (isStart) {
//       indices.push(a, b, d);
//       indices.push(b, c, d);
//     } else {
//       indices.push(a, d, b);
//       indices.push(b, d, c);
//     }

//     scope.addGroup(groupStart, 6, 0);

//     // calculate new start value for groups

//     groupStart += 6;
//   }


//   function generateStepTops() {
//     var indexStart = index;

//     var normal = new THREE.Vector3();
//     var vertex = new THREE.Vector3();

//     var groupCount = 0;
  
//     // Generate Vertices, Normals and UVs
//     var activeTheta = thetaStart;
//     var activeHeight = stepHeight;
//     for (var stepIndex = 0; stepIndex <= stepSegments; stepIndex++) {
//       for (var radiusIndex = 0; radiusIndex < 2; radiusIndex++) {
//         var activeRadius = radiusIndex == 0 ? holeRadius : radius;
//         for (var segmentIndex = 0; segmentIndex <= stepThetaSegments; segmentIndex++) {

//           var segmentRatio = segmentIndex / stepThetaSegments;
//           var theta = segmentRatio * stepTheta + activeTheta;
//           var sinTheta = Math.sin(theta);
//           var cosTheta = Math.cos(theta);

//           // vertex
//           vertex.x = activeRadius * sinTheta;
//           vertex.y = activeHeight;
//           vertex.z = activeRadius * cosTheta;
//           // normal
//           normal.set(sinTheta, 1, cosTheta).normalize();
          
//           vertices.push(vertex.x, vertex.y, vertex.z);
//           normals.push(normal.x, normal.y, normal.z);
//           uvs.push((vertex.x / radius + 1) / 2, (vertex.z / radius + 1) / 2);
//           index++;
//         }
//       }
//       activeHeight += stepHeight;
//       activeTheta += stepTheta;
//     }

//     // Generate Indices
//     var v_perSegAndSide = stepThetaSegments+1;
//     for (var stepIndex = 0; stepIndex < stepSegments; stepIndex++) {
//       for (var segmentIndex = 0; segmentIndex < stepThetaSegments; segmentIndex++) {

//         var segment = indexStart + (2 * v_perSegAndSide * stepIndex)+segmentIndex;

//         var a = segment + 0;
//         var b = segment + v_perSegAndSide + 0;
//         var c = segment + v_perSegAndSide + 1;
//         var d = segment + 1;

//         // faces

//         indices.push(a, b, d);
//         indices.push(b, c, d);

//         // update group counter

//         groupCount += 6;
//       }
//     }

//     // add a group to the geometry. this will ensure multi material support

//     scope.addGroup(groupStart, groupCount, 1);

//     // calculate new start value for groups

//     groupStart += groupCount;

//   }

//   function generateStepFronts() {
//     var indexStart = index;

//     var normal = new THREE.Vector3();
//     var vertex = new THREE.Vector3();

//     var groupCount = 0;

//     // Generate Vertices, Normals and UVs
//     var activeTheta = thetaStart;
//     var activeHeight = 0;
//     for (var stepIndex = 0; stepIndex <= stepSegments; stepIndex++) {
//       for (var radiusIndex = 0; radiusIndex < 2; radiusIndex++) {
//           var activeRadius = radiusIndex == 0 ? holeRadius : radius;
//           var theta = activeTheta;
//           var sinTheta = Math.sin(theta);
//           var cosTheta = Math.cos(theta);

//           // vertex
//           vertex.x = activeRadius * sinTheta;
//           vertex.y = activeHeight;
//           vertex.z = activeRadius * cosTheta;
//           // normal
//           normal.set(sinTheta, 1, cosTheta).normalize();
          
//           vertices.push(vertex.x, vertex.y, vertex.z);
//           normals.push(normal.x, normal.y, normal.z);
//           uvs.push((vertex.x / radius + 1) / 2, (vertex.z / radius + 1) / 2);
//           index++;

//           vertices.push(vertex.x, vertex.y+stepHeight, vertex.z);
//           normals.push(normal.x, normal.y, normal.z);
//           uvs.push((vertex.x / radius + 1) / 2, (vertex.z / radius + 1) / 2);
//           index++;
//       }
//       activeHeight += stepHeight;
//       activeTheta += stepTheta;
//     }

//     // Generate Indices
//     var v_perSegAndSide = 2;
//     for (var stepIndex = 0; stepIndex < stepSegments; stepIndex++) {
//         var segment = indexStart + (2 * v_perSegAndSide * stepIndex);

//         var a = segment + 0;
//         var b = segment + v_perSegAndSide + 0;
//         var c = segment + v_perSegAndSide + 1;
//         var d = segment + 1;

//         // faces

//         indices.push(a, b, d);
//         indices.push(b, c, d);

//         // update group counter

//         groupCount += 6;
//     }

//     // add a group to the geometry. this will ensure multi material support

//     scope.addGroup(groupStart, groupCount, 0);

//     // calculate new start value for groups

//     groupStart += groupCount;
//   }


//   function generateStepSide(isOuter) {

//     var indexStart = index;

//     var normal = new THREE.Vector3();
//     var vertex = new THREE.Vector3();

//     var groupCount = 0;

//     var sign = isOuter ? 1 : -1;

//     var activeTheta = thetaStart;

//     var activeHeight = 0;

//     var activeRadius = isOuter ? radius : holeRadius;

//     // Generate Vertices, Normals and UVs

//     for (var stepIndex = 0; stepIndex <= stepSegments; stepIndex++) {
//         for (var segmentIndex = 0; segmentIndex <= stepThetaSegments; segmentIndex++) {

//           var segmentRatio = segmentIndex / stepThetaSegments;
//           var theta = segmentRatio * stepTheta + activeTheta;
//           var sinTheta = Math.sin(theta);
//           var cosTheta = Math.cos(theta);

//           // vertex
//           vertex.x = activeRadius * sinTheta;
//           vertex.y = activeHeight;
//           vertex.z = activeRadius * cosTheta;
//           // normal
//           normal.set(sinTheta, 0, cosTheta).normalize();
          
//           vertices.push(vertex.x, vertex.y + stepHeight * segmentRatio, vertex.z);
//           normals.push(normal.x * sign, normal.y, normal.z * sign);
//           uvs.push(segmentRatio, segmentRatio);
//           index++;
        
//           vertices.push(vertex.x, vertex.y + stepHeight, vertex.z);
//           normals.push(normal.x * sign, normal.y, normal.z * sign);
//           uvs.push(segmentRatio, 1);
//           index++;
//       }
//       activeHeight += stepHeight;
//       activeTheta += stepTheta;
//     }

//     // Generate Indices
//     var v_perSegAndSide = stepThetaSegments*2+2;
//     for (var stepIndex = 0; stepIndex < stepSegments; stepIndex++) {
//       for (var segmentIndex = 0; segmentIndex < stepThetaSegments; segmentIndex++) {

//         var segment = indexStart + v_perSegAndSide * stepIndex + segmentIndex*2;

//         var a = segment + 0;
//         var b = segment + 1;
//         var c = segment + 2;
//         var d = segment + 3;

//         // faces
//         if (isOuter) {
//           indices.push(a, d, b);
//           indices.push(a, c, d);
//         } else {
//           indices.push(a, b, d);
//           indices.push(a, d, c);
//         }

//         // update group counter

//         groupCount += 6;
//       }
//     }

//     // add a group to the geometry. this will ensure multi material support

//     scope.addGroup(groupStart, groupCount, 0);

//     // calculate new start value for groups

//     groupStart += groupCount;
//   }

//   function generateSide(isOuter) {

//     var indexStart = index;

//     var normal = new THREE.Vector3();
//     var vertex = new THREE.Vector3();

//     var groupCount = 0;

//     // Generate Vertices, Normals and UVs
//     var sign = isOuter ? 1 : -1;
//     var activeRadius = isOuter ? radius : holeRadius;
//     for (var heightIndex = 0; heightIndex < 2; heightIndex++) {
//       for (var segmentIndex = 0; segmentIndex <= segments; segmentIndex++) {

//         var segmentRatio = segmentIndex / segments;

//         var theta = segmentRatio * thetaLength + thetaStart;

//         var sinTheta = Math.sin(theta);
//         var cosTheta = Math.cos(theta);

//         // vertex
//         vertex.x = activeRadius * sinTheta;
//         vertex.y = (heightIndex - 1) * stepHeight + (height * segmentRatio);
//         vertex.z = activeRadius * cosTheta;
//         vertices.push(vertex.x, vertex.y, vertex.z);

//         // normal
//         normal.set(sinTheta, 0, cosTheta).normalize();
//         normals.push(normal.x * sign, normal.y, normal.z * sign);

//         // uv
//         uvs.push(segmentRatio, 1 - heightIndex);

//         // save index of vertex in respective row

//         index++;
//       }
//     }

//     // Generate Indices

//     for (var segmentIndex = 0; segmentIndex < segments; segmentIndex++) {

//       var segment = segmentIndex + indexStart;

//       var a = segment + 0;
//       var b = segment + segments + 1;
//       var c = segment + segments + 2;
//       var d = segment + 1;

//       // faces
//       if (isOuter) {
//         indices.push(a, d, b);
//         indices.push(b, d, c);
//       } else {
//         indices.push(a, b, d);
//         indices.push(b, c, d);
//       }

//       // update group counter

//       groupCount += 6;
//     }

//     // add a group to the geometry. this will ensure multi material support

//     scope.addGroup(groupStart, groupCount, 0);

//     // calculate new start value for groups

//     groupStart += groupCount;
//   }

//   function generateBottom() {

//     var indexStart = index;

//     var normal = new THREE.Vector3();
//     var vertex = new THREE.Vector3();

//     var groupCount = 0;

//     var yNormal = Math.cos(angle);

//     // Generate Vertices, Normals and UVs

//     for (var radiusIndex = 0; radiusIndex < 2; radiusIndex++) {
//       var activeRadius = radiusIndex == 0 ? holeRadius : radius;
//       for (var segmentIndex = 0; segmentIndex <= segments; segmentIndex++) {

//         var segmentRatio = segmentIndex / segments;

//         var theta = segmentRatio * thetaLength + thetaStart;

//         var sinTheta = Math.sin(theta);
//         var cosTheta = Math.cos(theta);

//         // vertex

//         vertex.x = activeRadius * sinTheta;
//         vertex.y = (height * segmentRatio) - stepHeight;
//         vertex.z = activeRadius * cosTheta;
//         vertices.push(vertex.x, vertex.y, vertex.z);

//         // normal

//         normal.set(sinTheta, yNormal, cosTheta).normalize();
//         normals.push(normal.x, normal.y, normal.z);

//         // uv

//         uvs.push((vertex.x / activeRadius + 1) / 2, (vertex.z / activeRadius + 1) / 2);

//         // save index of vertex in respective row

//         index++;
//       }
//     }

//     // Generate Indices

//     for (var segmentIndex = 0; segmentIndex < segments; segmentIndex++) {

//       var segment = segmentIndex + indexStart;

//       var a = segment + 0;
//       var b = segment + segments + 1;
//       var c = segment + segments + 2;
//       var d = segment + 1;

//       // faces
//       indices.push(a, d, b);
//       indices.push(b, d, c);

//       // update group counter

//       groupCount += 6;
//     }

//     // add a group to the geometry. this will ensure multi material support

//     scope.addGroup(groupStart, groupCount, 0);

//     // calculate new start value for groups

//     groupStart += groupCount;
//   }

// }

// StairsBufferGeometry.prototype = Object.create(THREE.BufferGeometry.prototype);
// StairsBufferGeometry.prototype.constructor = StairsBufferGeometry;

// function init() {

//   // renderer
//   renderer = new THREE.WebGLRenderer();
//   renderer.setSize(window.innerWidth, window.innerHeight);
//   renderer.setClearColor(0x404040, 1);
//   document.body.appendChild(renderer.domElement);

//   // scene
//   scene = new THREE.Scene();

//   // camera
//   camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
//   camera.position.set(3, 3, 3);

//   // controls
//   controls = new THREE.OrbitControls(camera);

//   var loader = new THREE.TextureLoader();
//   loader.setCrossOrigin("");
//   var texture1 = loader.load("https://threejs.org/examples/textures/hardwood2_diffuse.jpg");
//   var texture2 = loader.load("https://threejs.org/examples/textures/crate.gif");
  
//   // materials
//   material_1 = new THREE.MeshBasicMaterial({
//     //color: "red"
//     map: texture1,
//   });
//   material_2 = new THREE.MeshBasicMaterial({
//     //color: "blue"
//     map: texture2,
//   });

//   var geometry = new StairsGeometry(2.98, 1.40, 3.60, Math.PI / 10, 0, Math.PI / 2, Math.PI / 10);
//   var mesh = new THREE.Mesh(geometry, [material_1, material_2]);
//   mesh.material.side = THREE.DoubleSide;

//   // mesh
//   scene.add(mesh);
// }

// function animate() {

//   requestAnimationFrame(animate);
//   renderer.render(scene, camera);
// }

// init();
// animate();