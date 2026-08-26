import * as THREE from "three";
import { VoxelGrid, buildGrid } from "./voxel";
import { createBlockMaterials, createPokeballDecal } from "./block-textures";

/**
 * Blockout texturizado do cenário de Kanto — Centro Pokémon de Viridian City.
 * Tudo voxel exceto o emblema da Poké Ball (decalque num plano) e chão/mar
 * (planos texturizados). z cresce pro fundo; a câmera olha de -z.
 */

export interface KantoDioramaResult {
  group: THREE.Group;
  stats: { blocks: number; triangles: number };
  dispose: () => void;
}

export function createKantoDiorama(): KantoDioramaResult {
  const blocks = createBlockMaterials();
  const g = new VoxelGrid();

  // ---- Centro Pokémon ------------------------------------------------------
  g.shell(-10, 1, 4, 10, 9, 18, "white");

  g.clearBox(-3, 1, 4, 3, 6, 4);
  g.clearBox(-9, 3, 4, -5, 7, 4);
  g.clearBox(5, 3, 4, 9, 7, 4);
  g.box(-3, 1, 4, 3, 6, 4, "red_glass");
  g.box(-9, 3, 4, -5, 7, 4, "blue_glass");
  g.box(5, 3, 4, 9, 7, 4, "blue_glass");

  // Faixa preta no topo da parede.
  g.box(-10, 9, 4, 10, 9, 4, "black");
  g.box(-10, 9, 18, 10, 9, 18, "black");
  g.box(-10, 9, 4, -10, 9, 18, "black");
  g.box(10, 9, 4, 10, 9, 18, "black");

  // Telhado em domo escalonado.
  g.box(-12, 10, 2, 12, 10, 20, "red");
  g.box(-11, 11, 3, 11, 11, 19, "red");
  g.box(-9, 12, 5, 9, 12, 17, "red");
  g.box(-6, 13, 8, 6, 13, 14, "red");
  g.box(-3, 14, 10, 3, 14, 12, "red");
  g.box(-1, 15, 10, 1, 15, 12, "black");

  // ---- Interior visível pela porta --------------------------------------
  g.box(-8, 1, 15, 8, 2, 16, "white");
  g.box(-8, 1, 15, 8, 1, 15, "red");
  g.box(-2, 1, 17, 2, 4, 17, "white");
  g.box(-2, 4, 17, 2, 4, 17, "red");
  g.box(0, 1, 13, 0, 2, 13, "white"); // enfermeira (aproximação)
  g.set(0, 3, 13, "red");

  // ---- Frente: degraus, canteiros, lanternas ----------------------------
  g.box(-5, 1, 3, 5, 1, 3, "stone_bricks");
  for (const sx of [-9, 6] as const) {
    g.box(sx, 1, 2, sx + 3, 2, 3, "stone_bricks");
    g.box(sx, 3, 2, sx + 3, 3, 3, "leaves");
    g.set(sx + 1, 4, 2, "red");
    g.set(sx + 2, 4, 3, "red");
  }
  g.set(-4, 5, 3, "lantern");
  g.set(4, 5, 3, "lantern");
  g.box(-13, 1, 1, -13, 4, 1, "log");
  g.set(-13, 5, 1, "lantern");

  // ---- Placa-monumento "Viridian City" ---------------------------------
  g.box(-16, 1, -1, -14, 4, 1, "stone_bricks");
  g.set(-15, 2, -2, "red");

  // ---- Poste de placas de rota (direita) ------------------------------
  g.box(13, 1, 0, 13, 7, 0, "log");
  for (const by of [6, 5, 4, 3] as const) {
    g.box(14, by, 0, 18, by, 0, "planks");
    g.set(18, by, 0, "log");
  }

  // ---- Árvore (esquerda) --------------------------------------------
  g.set(-14, 0, 10, "dirt");
  g.box(-14, 1, 10, -14, 5, 10, "log");
  g.box(-16, 5, 8, -12, 8, 12, "leaves");
  for (const [dx, dz] of [
    [-16, 8], [-12, 8], [-16, 12], [-12, 12],
  ] as const) {
    g.delete(dx, 8, dz);
    g.delete(dx, 5, dz);
  }

  // ---- Cerca de madeira (direita) ---------------------------------
  g.box(12, 1, -1, 12, 1, 9, "planks");
  for (let z = -1; z <= 9; z += 2) g.set(12, 2, z, "log");

  // ---- Farol, longe no horizonte ---------------------------------
  g.shell(65, 1, 51, 67, 18, 53, "white");
  g.box(65, 4, 51, 67, 5, 53, "red");
  g.box(65, 10, 51, 67, 11, 53, "red");
  g.box(65, 18, 51, 67, 19, 53, "glow");
  g.box(64, 20, 50, 68, 20, 54, "red");

  // ---- Nuvens (pequenos tufos) ----------------------------------
  const puff = (cx: number, cy: number, cz: number) => {
    g.box(cx - 2, cy, cz - 1, cx + 2, cy, cz + 1, "cloud");
    g.box(cx - 1, cy + 1, cz, cx + 1, cy + 1, cz, "cloud");
    g.set(cx - 3, cy, cz, "cloud");
    g.set(cx + 3, cy, cz, "cloud");
  };
  puff(-14, 24, 2);
  puff(4, 27, 12);
  puff(18, 25, -8);
  puff(-2, 23, 22);
  puff(24, 28, 16);

  // ---- Meshes de voxel --------------------------------------------
  const built = buildGrid(g, blocks);

  // ---- Emblema da Poké Ball (decalque num plano) -----------------
  const decal = createPokeballDecal();
  const emblem = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 9),
    new THREE.MeshLambertMaterial({ map: decal.texture, transparent: true }),
  );
  emblem.position.set(0, 11.6, 1.55);
  emblem.rotation.y = Math.PI;
  emblem.castShadow = false;

  // ---- Chão, caminho, mar (planos texturizados) -----------------
  const groundTex = blocks.materials.grass;
  const gTex = (groundTex as THREE.MeshLambertMaterial).map!.clone();
  gTex.repeat.set(220, 220);
  gTex.needsUpdate = true;
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(440, 440),
    new THREE.MeshLambertMaterial({ map: gTex }),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0.5;
  ground.receiveShadow = true;

  const pTex = (blocks.materials.path as THREE.MeshLambertMaterial).map!.clone();
  pTex.repeat.set(11, 15);
  pTex.needsUpdate = true;
  const path = new THREE.Mesh(
    new THREE.PlaneGeometry(11, 15),
    new THREE.MeshLambertMaterial({ map: pTex }),
  );
  path.rotation.x = -Math.PI / 2;
  path.position.set(0, 0.52, -2);
  path.receiveShadow = true;

  const wTex = (blocks.materials.water as THREE.MeshLambertMaterial).map!.clone();
  wTex.repeat.set(60, 60);
  wTex.needsUpdate = true;
  const water = new THREE.Mesh(
    new THREE.PlaneGeometry(320, 320),
    new THREE.MeshLambertMaterial({ map: wTex, transparent: true, opacity: 0.9 }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.set(70, 0.44, 46);

  const group = new THREE.Group();
  group.add(ground, path, water, built.group, emblem);

  const triangles = built.instanceCount * 12 + 6;

  const dispose = () => {
    blocks.dispose();
    decal.dispose();
    gTex.dispose();
    pTex.dispose();
    wTex.dispose();
    emblem.geometry.dispose();
    (emblem.material as THREE.Material).dispose();
    for (const mesh of [ground, path, water]) {
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    }
    built.group.traverse((obj) => {
      if (obj instanceof THREE.InstancedMesh) obj.geometry.dispose();
    });
  };

  return {
    group,
    stats: { blocks: built.instanceCount, triangles },
    dispose,
  };
}
