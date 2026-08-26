import * as THREE from "three";
import { VoxelGrid, instancedFromVoxels } from "./voxel";

/**
 * Blockout do cenário de Kanto — Centro Pokémon de Viridian City, a partir da
 * imagem de referência. Tudo voxel: prédio, telhado em domo, emblema de
 * Poké Ball, placa da cidade, poste de rotas (Route 2 / Viridian Forest /
 * Pewter / Cerulean), árvore, cerca, farol ao fundo.
 *
 * Cor chapada, sem textura — é teste de peso. z cresce pro fundo; a câmera
 * olha de -z (frente).
 */

const K = {
  grass: 0x6bab3e,
  dirt: 0x6a4b32,
  path: 0x9a9a9a,
  wall: 0xdcdedd,
  roof: 0xab2b1a,
  roofDark: 0x7f1f12,
  trim: 0x1b1b20,
  glass: 0xaad6e5,
  doorGlass: 0xd6382d,
  stoneBrick: 0x7c7c7c,
  log: 0x6a5334,
  plank: 0xb78a54,
  leaves: 0x497b28,
  poppy: 0xcf3b2f,
  lantern: 0xffd24a,
  water: 0x2f6fb0,
  lhWhite: 0xe2e2e2,
  lhRed: 0xc93a2d,
  nurse: 0xfafafa,
  skin: 0xe7b48c,
  hair: 0xef9bb0,
  cloud: 0xf3f6f9,
};

export interface KantoDioramaResult {
  group: THREE.Group;
  stats: { solid: number; glass: number; clouds: number; triangles: number };
  dispose: () => void;
}

export function createKantoDiorama(): KantoDioramaResult {
  const solid = new VoxelGrid();
  const glass = new VoxelGrid();
  const clouds = new VoxelGrid();

  // ---- Centro Pokémon --------------------------------------------------------
  // Paredes (casca oca), footprint x -10..10, z 4..18, altura 1..8.
  solid.shell(-10, 1, 4, 10, 8, 18, K.wall);

  // Porta dupla e janelas na fachada (z = 4).
  solid.clearBox(-3, 1, 4, 3, 5, 4);
  solid.clearBox(-9, 3, 4, -5, 6, 4);
  solid.clearBox(5, 3, 4, 9, 6, 4);
  glass.box(-3, 1, 4, 3, 5, 4, K.doorGlass);
  glass.box(-9, 3, 4, -5, 6, 4, K.glass);
  glass.box(5, 3, 4, 9, 6, 4, K.glass);

  // Faixa preta no topo da parede.
  solid.box(-10, 8, 4, 10, 8, 4, K.trim);
  solid.box(-10, 8, 18, 10, 8, 18, K.trim);
  solid.box(-10, 8, 4, -10, 8, 18, K.trim);
  solid.box(10, 8, 4, 10, 8, 18, K.trim);

  // Telhado em domo escalonado (vermelho).
  solid.box(-12, 9, 2, 12, 9, 20, K.roof);
  solid.box(-11, 10, 3, 11, 10, 19, K.roof);
  solid.box(-9, 11, 5, 9, 11, 17, K.roof);
  solid.box(-6, 12, 8, 6, 12, 14, K.roof);
  solid.box(-3, 13, 10, 3, 13, 12, K.roof);
  solid.box(-1, 14, 10, 1, 14, 12, K.roofDark);

  // Emblema de Poké Ball na frente do telhado (billboard em z = 3).
  solid.box(-4, 9, 3, 4, 10, 3, K.wall); // metade de baixo branca
  solid.box(-4, 11, 3, 4, 11, 3, K.trim); // equador preto
  solid.box(-4, 12, 3, 4, 14, 3, K.roof); // metade de cima vermelha
  solid.box(-1, 11, 3, 1, 11, 3, K.wall); // botão central
  for (const [cx, cy] of [
    [-4, 9], [4, 9], [-4, 14], [4, 14],
  ] as const) {
    solid.delete(cx, cy, 3); // arredonda os cantos
  }

  // ---- Interior visível pela porta -----------------------------------------
  solid.box(-8, 1, 15, 8, 2, 16, K.wall); // balcão
  solid.box(-8, 1, 15, 8, 1, 15, K.roof); // frente vermelha do balcão
  solid.box(-2, 1, 17, 2, 4, 17, K.wall); // máquina de cura
  solid.box(-2, 4, 17, 2, 4, 17, K.roof);
  // Enfermeira Joy.
  solid.box(0, 1, 13, 0, 2, 13, K.nurse);
  solid.set(0, 3, 13, K.skin);
  solid.set(-1, 4, 13, K.hair);
  solid.set(0, 4, 13, K.hair);
  solid.set(1, 4, 13, K.hair);

  // ---- Frente: degrau, canteiros, lanternas --------------------------------
  solid.box(-4, 1, 3, 4, 1, 3, K.stoneBrick);
  // Canteiros de pedra com arbusto e papoula.
  for (const sx of [-9, 6] as const) {
    solid.box(sx, 1, 2, sx + 3, 2, 3, K.stoneBrick);
    solid.box(sx, 3, 2, sx + 3, 3, 3, K.leaves);
    solid.set(sx + 1, 4, 2, K.poppy);
    solid.set(sx + 2, 4, 3, K.poppy);
  }
  // Lanternas de parede ladeando a porta.
  solid.set(-4, 5, 3, K.lantern);
  solid.set(4, 5, 3, K.lantern);
  // Poste de lampião à esquerda.
  solid.box(-13, 1, 1, -13, 4, 1, K.log);
  solid.set(-13, 5, 1, K.lantern);

  // ---- Placa-monumento "Viridian City" (frente esquerda) ------------------
  solid.box(-16, 1, -1, -14, 4, 1, K.stoneBrick);
  solid.set(-15, 2, -2, K.poppy); // Poké Ball gravada (aproximação)

  // ---- Poste de placas de rota (direita) ---------------------------------
  solid.box(13, 1, 0, 13, 7, 0, K.log);
  for (const by of [6, 5, 4, 3] as const) {
    solid.box(14, by, 0, 18, by, 0, K.plank);
    solid.set(18, by, 0, K.log); // ponta em seta
  }

  // ---- Árvore (esquerda) -------------------------------------------------
  solid.set(-14, 0, 10, K.dirt);
  solid.box(-14, 1, 10, -14, 5, 10, K.log);
  solid.box(-16, 5, 8, -12, 8, 12, K.leaves);
  for (const [dx, dz] of [
    [-16, 8], [-12, 8], [-16, 12], [-12, 12],
  ] as const) {
    solid.delete(dx, 8, dz);
    solid.delete(dx, 5, dz);
  }

  // ---- Cerca de madeira (direita) --------------------------------------
  solid.box(12, 1, -1, 12, 1, 9, K.plank);
  for (let z = -1; z <= 9; z += 2) solid.set(12, 2, z, K.log);

  // ---- Farol ao fundo, sobre o mar (direita) --------------------------
  solid.shell(19, 1, 14, 21, 12, 16, K.lhWhite);
  solid.box(19, 3, 14, 21, 4, 16, K.lhRed);
  solid.box(19, 8, 14, 21, 9, 16, K.lhRed);
  solid.box(19, 12, 14, 21, 13, 16, K.lantern);
  solid.box(18, 14, 13, 22, 14, 17, K.lhRed);

  // ---- Nuvens ---------------------------------------------------------
  clouds.box(-9, 21, -2, -3, 21, 4, K.cloud);
  clouds.box(5, 24, 8, 12, 24, 14, K.cloud);
  clouds.box(-3, 22, 17, 4, 22, 22, K.cloud);
  clouds.box(16, 23, -6, 22, 23, 0, K.cloud);

  // ---- Monta os meshes ---------------------------------------------------
  const solidMat = new THREE.MeshLambertMaterial();
  const glassMat = new THREE.MeshLambertMaterial({ transparent: true, opacity: 0.5 });
  const cloudMat = new THREE.MeshLambertMaterial({ transparent: true, opacity: 0.92 });

  const solidVox = solid.exposed();
  const glassVox = glass.exposed();
  const cloudVox = clouds.exposed();

  const solidMesh = instancedFromVoxels(solidVox, solidMat);
  solidMesh.castShadow = true;
  solidMesh.receiveShadow = true;

  const glassMesh = instancedFromVoxels(glassVox, glassMat);
  glassMesh.receiveShadow = true;

  const cloudMesh = instancedFromVoxels(cloudVox, cloudMat);

  // ---- Chão, caminho, mar (planos, não voxel) --------------------------
  const groundMat = new THREE.MeshLambertMaterial({ color: K.grass });
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0.5;
  ground.receiveShadow = true;

  const pathMat = new THREE.MeshLambertMaterial({ color: K.path });
  const path = new THREE.Mesh(new THREE.PlaneGeometry(11, 14), pathMat);
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, 0.51, -1);
  path.receiveShadow = true;

  const waterMat = new THREE.MeshLambertMaterial({
    color: K.water,
    transparent: true,
    opacity: 0.85,
  });
  const water = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), waterMat);
  water.rotation.x = -Math.PI / 2;
  water.position.set(60, 0.42, 30);

  const group = new THREE.Group();
  group.add(ground, path, water, solidMesh, glassMesh, cloudMesh);

  const triangles = (solidVox.length + glassVox.length + cloudVox.length) * 12 + 6;

  const dispose = () => {
    for (const mesh of [solidMesh, glassMesh, cloudMesh, ground, path, water]) {
      mesh.geometry.dispose();
    }
    for (const mat of [solidMat, glassMat, cloudMat, groundMat, pathMat, waterMat]) {
      mat.dispose();
    }
  };

  return {
    group,
    stats: {
      solid: solidVox.length,
      glass: glassVox.length,
      clouds: cloudVox.length,
      triangles,
    },
    dispose,
  };
}
