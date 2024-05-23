import * as THREE from './three.module.js';
import { FontLoader } from './FontLoader.js';
import { TextGeometry } from './TextGeometry.js';
import init from './init.js';

const { sizes, scene, canvas, perspectiveCamera, orthographicCamera, renderer, controls_persp, controls_orth, raycaster } = init();

let sessionData; // Объявляем переменную для хранения данных сессии

let calculating_config = {
	"radius1": 0,
	"radius2": 0,
	"potential1": 0,
	"potential2": 0,
}

document.addEventListener('DOMContentLoaded', function() {
    fetch('/getSessionData')
        .then(response => response.json())
        .then(data => {
            sessionData = data; // Сохраняем данные сессии в переменную
			calculating_config["radius1"] = parseInt(sessionData['radius1']) / 10;
			calculating_config["radius2"] = parseInt(sessionData['radius2']) / 10;
			calculating_config["potential1"] = parseFloat(sessionData["fi1"]) + 0.0001;
			calculating_config["potential2"] = parseFloat(sessionData["fi2"]) + 0.0001;

			radius1 = calculating_config["radius1"];
			radius2 = calculating_config["radius2"];
			potential1 = calculating_config["potential1"];
			potential2 = calculating_config["potential2"];
			
			const radiusLeftElement = document.getElementById("radius1");
			const radiusRightElement = document.getElementById("radius2");
			const potentialLeftElement = document.getElementById("fi1");
			const potentialRightElement = document.getElementById("fi2");

			// Updating the text content of each element with the corresponding value from 'calculating_config'
			radiusLeftElement.textContent = `Радиус левого: ${calculating_config.radius1.toFixed(2)} cm`;
			radiusRightElement.textContent = `Радиус правого: ${calculating_config.radius2.toFixed(2)} cm`;
			potentialLeftElement.textContent = `Потенциал левого: ${calculating_config.potential1.toFixed(2)} В`;
			potentialRightElement.textContent = `Потенциал правого: ${calculating_config.potential2.toFixed(2)} В`;

			electrod1.geometry = new THREE.CylinderGeometry(radius1, radius1, 20);
            electrod2.geometry = new THREE.CylinderGeometry(radius2, radius2, 20);
			radiuses = [radius1, radius2];
			console.log(sessionData); // Выводим данные в консоль для проверки
			field = initMatrix(table_width, table_height, [electrod1, electrod2], [potential1, potential2], calculation_koef);
			// console.log(field);
		})
        .catch(error => {
            console.error('Ошибка при получении данных сессии:', error);
        });
});

let radius1 = calculating_config["radius1"];
let radius2 = calculating_config["radius2"];
let potential1 = calculating_config["potential1"];
let potential2 = calculating_config["potential2"];


const calculation_koef = 2;
let field;

let radiuses = [radius1, radius2];

const axisHelper = new THREE.AxesHelper(25);
scene.add(axisHelper);

const pointer = new THREE.Vector2();

const group_measuring_points = new THREE.Group();
scene.add(group_measuring_points);

let activeCamera = perspectiveCamera;
let activeControls = controls_persp;

const table_width = 43;
const table_height = 30;

let maxIdPoint = 1;

const config = {
	'activeCamera': 'перспективная',
	'camers': ['перспективная', 'вид сверху'],
	'magnetizm': false,
}

const dict_camera = {
	'перспективная': {
		camera: perspectiveCamera,
		position: new THREE.Vector3(0, 30, 0),
		rotation: new THREE.Vector3(0, 0, 0),
	},
	'вид сверху': {
		camera: orthographicCamera,
		position: new THREE.Vector3(0, 30, 0),
		rotation: new THREE.Vector3(0, 0, 0),
	},
}

const dict_controls = {
	'перспективная': {
		controls: controls_persp,
		enabled: true,
	},
	'вид сверху': {
		controls: controls_orth,
		enabled: false,
	},
}

activeCamera.position.set(0, 30, 0);
activeCamera.rotation.set(0, 0, 0);
controls_persp.enabled = true;
controls_orth.enabled = false;


/** ADD BUTTONS IN HTML */

/** Select */
const divForm = document.createElement('div');
divForm.className = "formDiv";

const divBtn = document.createElement('div');
divBtn.className = "divBtn";

const settingsForm = document.createElement('form');
settingsForm.name = "setingsForm";

const pSelect = document.createElement("p");
pSelect.textContent = "Камера: "

const cameraSelect = document.createElement("select");
cameraSelect.name = "cameraSelect";

const dataText = document.getElementById("dataText");
dataText.textContent = "";

for (let i = 0; i < config.camers.length; i++) {
	const option = document.createElement('option');
	option.value = config.camers[i];
	option.textContent = config.camers[i];
	if (i === 0){
		option.selected = true;
	}
	cameraSelect.appendChild(option);
}

document.body.appendChild(divForm);
divForm.appendChild(settingsForm);
settingsForm.appendChild(divBtn)
divBtn.appendChild(pSelect);
pSelect.appendChild(cameraSelect);

cameraSelect.addEventListener("change", () => {
	config.activeCamera = cameraSelect.options[cameraSelect.selectedIndex].text;
	changeCamera();
});

/** CheckBox */
const checkBoxMagnet = document.createElement('input');
checkBoxMagnet.type = "checkbox";
checkBoxMagnet.id = "magnet";

const pCheckBox = document.createElement("p");
pCheckBox.textContent = "Магнитный курсор: "

divBtn.appendChild(pCheckBox);
pCheckBox.appendChild(checkBoxMagnet);

checkBoxMagnet.addEventListener("change", () => {
	config.magnetizm = checkBoxMagnet.checked;
});


/** Paragraph */
const divPotential = document.createElement('div');
divPotential.className = "divPotential";

const paragraphPotential = document.createElement('p');
paragraphPotential.id = "potential";
paragraphPotential.textContent = `X : ${0}\nY : ${0}\nPotential : ${"INFO"}`;


const divinf1 = document.createElement('div');
divinf1.className = "info1";

const rad1 = document.createElement('p');
rad1.id = "radius1";
rad1.textContent = `Радиус левого: `;

const rad2 = document.createElement('p');
rad2.id = "radius2";
rad2.textContent = `Радиус правого: `;

const divinf2 = document.createElement('div');
divinf2.className = "info2";

const fi1 = document.createElement('p'); // Создаем элемент fi1
fi1.id = "fi1"; // Устанавливаем id для элемента fi1
fi1.textContent = `Потенциал левого: `; // Добавляем текст к элементу fi1

const fi2 = document.createElement('p'); // Создаем элемент fi2
fi2.id = "fi2"; // Устанавливаем id для элемента fi2
fi2.textContent = `Потенциал правого: `; 


settingsForm.appendChild(divPotential);
divPotential.appendChild(paragraphPotential);
settingsForm.appendChild(divinf1);
divinf1.appendChild(rad1);
divinf1.appendChild(rad2);
settingsForm.appendChild(divinf2);
divinf2.appendChild(fi1);
divinf2.appendChild(fi2);

/** Making PLANE */
const plane_geometry = new THREE.PlaneGeometry(table_width, table_height);
const plane_material = new THREE.MeshStandardMaterial({
	color: 0xff3333,
	metalness: 0,
	roughness: 0.5,
});
const plane = new THREE.Mesh(plane_geometry, plane_material);
plane.rotation.x = -Math.PI * 0.5;
plane.receiveShadow = true;
// scene.add(plane);

/** Making TABLE */
const table_geometry = new THREE.BoxGeometry(table_width, table_height, 1);
const table_material = new THREE.MeshStandardMaterial({
	color: 0xff0033,
	metalness: 0,
	roughness: 0.5,
});
const table = new THREE.Mesh(table_geometry, table_material);
table.rotation.x = -Math.PI * 0.5;
table.position.y -= table.geometry.parameters.depth / 2;
table.receiveShadow = true;
scene.add(table);

/** Making LIGHT */
const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
hemisphereLight.position.set(0, 50, 0);
scene.add(hemisphereLight);

const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
directionalLight.position.set( 20, 12, 8 );
directionalLight.castShadow = true;
directionalLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
scene.add(directionalLight);

/** Making ELECTRODS */
const electrod_geometry1 = new THREE.CylinderGeometry(radius1, radius1, 20);
const electrod_geometry2 = new THREE.CylinderGeometry(radius2, radius2, 20);
const electrod_material = new THREE.MeshStandardMaterial({
	color: 0x999999,
	metalness: 0,
	roughness: 0.5,
})

const electrod1 = new THREE.Mesh(electrod_geometry1, electrod_material);
electrod1.position.x = 9 + (plane.position.x - plane.geometry.parameters.width / 2);
electrod1.position.z = -15 + (plane.position.z + plane.geometry.parameters.height / 2);
electrod1.receiveShadow = true;
scene.add(electrod1);

const electrod2 = new THREE.Mesh(electrod_geometry2, electrod_material);
electrod2.position.x = 33.5 + (plane.position.x - plane.geometry.parameters.width / 2);
electrod2.position.z = -15 + (plane.position.z + plane.geometry.parameters.height / 2);
electrod2.receiveShadow = true;
scene.add(electrod2);


/** Making CURSOR */
const cursor_point_geometry = new THREE.SphereGeometry(0.15);
const cursor_material = new THREE.MeshStandardMaterial({
	color: 0xff9933,
	visible: false,
});
const cursor_point = new THREE.Mesh(cursor_point_geometry, cursor_material);
scene.add(cursor_point);


/** Making SETKA */
const checkMesh = new THREE.Group();
const checkMesh_material = new THREE.MeshStandardMaterial({
	color: 0x66ff66,
});

const checkMesh_height = plane.geometry.parameters.height;
const checkMesh_width = plane.geometry.parameters.width;
for (let i = 1; i < checkMesh_width; i++) {
	const geometry = new THREE.BoxGeometry(0.05, 0.05, checkMesh_height);
	const line = new THREE.Mesh(geometry, checkMesh_material);
	line.position.x = i + (plane.position.x - plane.geometry.parameters.width / 2);
	checkMesh.add(line);
}

for (let i = 1; i < checkMesh_height; i++) {
	const geometry = new THREE.BoxGeometry(checkMesh_width, 0.05, 0.05);
	const line = new THREE.Mesh(geometry, checkMesh_material);
	line.position.z = i + (plane.position.z - plane.geometry.parameters.height / 2);
	checkMesh.add(line);
}

scene.add(checkMesh);

/** VALUE OF DIVISION */

const group_text = new THREE.Group();

for (let i = 0; i < checkMesh_width; i++) {
	const loaderFont = new FontLoader();
	loaderFont.load('./fonts/Nyasha_Sans_Regular.json', function ( font ) {
		const text_geometry = new TextGeometry(i.toString(), {
			font: font,
			size: 0.25,
			height: 0.1,
		});
		const text = new THREE.Mesh(text_geometry);
		text.position.x = i + (table.position.x - table.geometry.parameters.width / 2) - text.geometry.parameters.options.size / 2;
		text.position.z = (table.position.z + table.geometry.parameters.height / 2) + text.geometry.parameters.options.size * 2;
		text.position.y = -text.geometry.parameters.options.depth / 2;
		text.rotation.x = -Math.PI * 0.5;
		group_text.add(text);
	});
}

for (let i = 0; i < checkMesh_height; i++) {
	const loaderFont = new FontLoader();
	loaderFont.load('./fonts/Nyasha_Sans_Regular.json', function ( font ) {
		const text_geometry = new TextGeometry(i.toString(), {
			font: font,
			size: 0.25,
			height: 0.1,
		});
		const text = new THREE.Mesh(text_geometry);
		text.position.x = (table.position.x - table.geometry.parameters.width / 2) - text.geometry.parameters.options.size * 2;
		text.position.z = -i + (table.position.z + table.geometry.parameters.height / 2) + text.geometry.parameters.options.size / 2;
		text.position.y = -text.geometry.parameters.options.depth / 2;
		text.rotation.x = -Math.PI * 0.5;
		group_text.add(text);
	});
}

scene.add(group_text);

const tick = () => {
	activeControls.update();
	renderer.render(scene, activeCamera);
	window.requestAnimationFrame(tick);
};

tick();

/** Базовые обпаботчики событий длы поддержки ресайза */
canvas.addEventListener('resize', updateSizeAfterResize);

canvas.addEventListener('mousemove', (event) => {
	const offsetLeft = event["toElement"]["offsetParent"]["offsetLeft"];
	const offsetTop = event["toElement"]["offsetParent"]["offsetTop"];
	pointer.x = ( (event.clientX - offsetLeft) / canvas.clientWidth ) * 2 - 1;
	pointer.y = - ( (event.clientY - offsetTop) / canvas.clientHeight ) * 2 + 1;

	if (config.activeCamera === 'вид сверху') {
		raycaster.setFromCamera(pointer, activeCamera);
		const intersects = raycaster.intersectObjects([table, checkMesh]);

		if ( intersects.length > 0 ) {
			if (config.magnetizm){
				cursor_point.position.x = Math.round(intersects[0].point.x * 2) / 2;
				cursor_point.position.z = Math.round(intersects[0].point.z * 2) / 2;
			} else {
				cursor_point.position.x = intersects[0].point.x;
				cursor_point.position.z = intersects[0].point.z;
			}
			let x = cursor_point.position.x + 21.5;
			x = x.toFixed(2);
			let y = -cursor_point.position.z + 15;
			y = y.toFixed(2);
			let potential_value = field[parseInt(y * calculation_koef)][parseInt(x * calculation_koef)];
			potential_value = potential_value.toFixed(2);
			paragraphPotential.textContent = `X : ${x}   Y : ${y}   Potential : ${potential_value}`;
			cursor_point.material.visible = true;
		} else {
			cursor_point.material.visible = false;
		}
	} else {
		cursor_point.material.visible = false;
	}
});

canvas.addEventListener('dblclick', () => {
	if (!document.fullscreenElement) {
		canvas.requestFullscreen();
	} else {
		document.exitFullscreen();
	}
});

canvas.addEventListener("mousedown", (event) => {
	if (event.button === 0){
		if (config.activeCamera === 'вид сверху' && cursor_point.material.visible) {
			const geometry_measuring_point = new THREE.SphereGeometry(cursor_point.geometry.parameters.radius);
			const material_measuring_point = new THREE.MeshBasicMaterial({
				color: 0xffcc33,
			});
			let measuring_point = new THREE.Mesh(geometry_measuring_point, material_measuring_point);
			measuring_point.idPoint = maxIdPoint;
			maxIdPoint++;
			group_measuring_points.add(measuring_point);
	
			measuring_point.position.x = cursor_point.position.x;
			measuring_point.position.z = cursor_point.position.z;

			let x = cursor_point.position.x + 21.5;
			x = x.toFixed(2);
			let y = -cursor_point.position.z + 15;
			y = y.toFixed(2);
			let potential_value = field[parseInt(y * calculation_koef)][parseInt(x * calculation_koef)];
			potential_value = potential_value.toFixed(2);

			const p = document.createElement('p');
			p.id = `id_${measuring_point.idPoint}`;
			p.textContent = `X: ${x}  Y: ${y}\t  ф: ${potential_value}`;
			dataText.appendChild(p);
		}
	} else if (event.button === 2){
		if (config.activeCamera === 'вид сверху'){
			raycaster.setFromCamera(pointer, activeCamera);
			const intersects = raycaster.intersectObjects(group_measuring_points.children);
			for (let i = 0; i < intersects.length; i++) {
				const object = intersects[i].object;
				object.geometry.dispose();
				object.material.dispose();
				const p = document.getElementById(`id_${object.idPoint}`);
				group_measuring_points.remove(object);
				p.remove();
				renderer.renderLists.dispose();
			}
		}
	}
});

canvas.oncontextmenu = function () {
	return false;
}

function changeCamera() {
	const value = config.activeCamera;
	activeCamera = dict_camera[value].camera;
	activeCamera.position.set(0, 30, 0);
	activeCamera.rotation.set(0, 0, 0);
	updateSizeAfterResize();
	changeControls();
};

function changeControls() {
	const value = config.activeCamera;
	activeControls = dict_controls[value].controls;
	activeControls.enabled = dict_controls[value].enabled;
	for (let i = 0; i < config.camers.length; i++) {
		if (config.camers[i] !== value){
			const controls = dict_controls[config.camers[i]].controls;
			controls.enabled = false;
		}
	}
};

function updateSizeAfterResize() {
	// Обновляем размеры
	sizes.width = canvas.clientWidth;
	sizes.height = canvas.clientHeight;

	let height_camera = 32;
	let width_camera = height_camera * (sizes.width / sizes.height);
	orthographicCamera.left = -width_camera / 2;
	orthographicCamera.right = width_camera / 2;
	orthographicCamera.bottom = -height_camera / 2;
	orthographicCamera.top = height_camera / 2;

	// Обновляем соотношение сторон камеры
	activeCamera.aspect = sizes.width / sizes.height;
	activeCamera.updateProjectionMatrix();

	// Обновляем renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.render(scene, activeCamera);
};


function distanceVector(v1, v2) {
	const dx = v1.x - v2.x;
	const dy = v1.y - v2.y;
	const dz = v1.z - v2.z;

	return  Math.sqrt(dx * dx + dy * dy + dz * dz);
}


function meshPositionToVector(mesh){
	const vector = new THREE.Vector3();
	vector.x = mesh.position.x;
	vector.y = mesh.position.y;
	vector.z = mesh.position.z;
	return vector;
}


function initMatrix(width, height, meshes, potentials, koef){
	width *= koef;
	height *= koef;
	let field = Array(height);
	for (let i = 0; i < height; i++) {
		field[i] = Array(width).fill(0);
	}
	let meshes_vectors = [];
	for (let i = 0; i < meshes.length; i++) {
		let vector = meshPositionToVector(meshes[i]);
		vector.x += 21.5;
		vector.y = 0;
		vector.z += 15;
		meshes_vectors.push(vector);
	}

	for (let i = 0; i < height; i++) {
		for (let j = 0; j < width; j++) {
			const dot_vector = new THREE.Vector3(j / koef, 0, i / koef);
			for (let mesh_index = 0; mesh_index < meshes.length; mesh_index++) {
				if (distanceVector(meshes_vectors[mesh_index], dot_vector) <= radiuses[mesh_index]) {
					field[i][j] = potentials[mesh_index];
					break;
				}
			}
		}
	}
	
	for (let index = 0; index < table_width * koef * 250; index++) {
		const new_field = getUpdateField(field, potentials);
		field = new_field;
	}
	return field;
}


function getUpdateField(field, potentials){
	let new_field = Array(field.length);
	for (let i = 0; i < field.length; i++) {
		new_field[i] = Array(field[0].length);
		for (let j = 0; j < field[0].length; j++) {
			new_field[i][j] = field[i][j];
		}
	}

	for (let i = 0; i < field.length; i++) {
		for (let j = 0; j < field[0].length; j++) {
			let not_electrod = true;
			for (let potential_index = 0; potential_index < potentials.length; potential_index++) {
				if(field[i][j] == potentials[potential_index]){
					not_electrod = false;
				}
			}
			if (not_electrod) {
				let summa = 0;
				let count_neigbour = 8;
				for (let y = -1; y <= 1; y++) {
					for (let x = -1; x <= 1; x++) {
						if ((0 <= i + y && i + y < field.length) && (0 <= j + x && j + x < field[0].length)){
							if ((x != 0 || y != 0) && field[i + y][j + x]) {
								summa += field[i + y][j + x];
							}
						} else {
							count_neigbour--;
						}
					}
				}
				const sr_znach = summa / count_neigbour;
				new_field[i][j] = sr_znach;
			}
		}
	}
	return new_field;
}s