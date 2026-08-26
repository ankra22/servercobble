import * as THREE from "three";
import type { BlockName, BlockMaterials } from "./block-textures";

/**
 * Grade de voxels mínima pra montar cenários estilo Minecraft no código.
 *
 * O cenário é descrito como blocos numa grade inteira; na hora de renderizar,
 * `exposed()` joga fora todo cubo totalmente cercado e o resto é agrupado por
 * tipo de bloco — um `InstancedMesh` por tipo (dez e poucos draw calls).
 */

const key = (x: number, y: number, z: number) => `${x}|${y}|${z}`;

export interface Voxel {
  x: number;
  y: number;
  z: number;
  block: BlockName;
}

export class VoxelGrid {
  private cells = new Map<string, BlockName>();

  set(x: number, y: number, z: number, block: BlockName): void {
    this.cells.set(key(x, y, z), block);
  }

  delete(x: number, y: number, z: number): void {
    this.cells.delete(key(x, y, z));
  }

  box(
    x0: number, y0: number, z0: number,
    x1: number, y1: number, z1: number,
    block: BlockName,
  ): void {
    const [xa, xb] = x0 <= x1 ? [x0, x1] : [x1, x0];
    const [ya, yb] = y0 <= y1 ? [y0, y1] : [y1, y0];
    const [za, zb] = z0 <= z1 ? [z0, z1] : [z1, z0];
    for (let x = xa; x <= xb; x++) {
      for (let y = ya; y <= yb; y++) {
        for (let z = za; z <= zb; z++) this.set(x, y, z, block);
      }
    }
  }

  /** Só a casca externa da caixa. */
  shell(
    x0: number, y0: number, z0: number,
    x1: number, y1: number, z1: number,
    block: BlockName,
  ): void {
    const [xa, xb] = x0 <= x1 ? [x0, x1] : [x1, x0];
    const [ya, yb] = y0 <= y1 ? [y0, y1] : [y1, y0];
    const [za, zb] = z0 <= z1 ? [z0, z1] : [z1, z0];
    for (let x = xa; x <= xb; x++) {
      for (let y = ya; y <= yb; y++) {
        for (let z = za; z <= zb; z++) {
          if (x === xa || x === xb || y === ya || y === yb || z === za || z === zb) {
            this.set(x, y, z, block);
          }
        }
      }
    }
  }

  clearBox(
    x0: number, y0: number, z0: number,
    x1: number, y1: number, z1: number,
  ): void {
    const [xa, xb] = x0 <= x1 ? [x0, x1] : [x1, x0];
    const [ya, yb] = y0 <= y1 ? [y0, y1] : [y1, y0];
    const [za, zb] = z0 <= z1 ? [z0, z1] : [z1, z0];
    for (let x = xa; x <= xb; x++) {
      for (let y = ya; y <= yb; y++) {
        for (let z = za; z <= zb; z++) this.delete(x, y, z);
      }
    }
  }

  get size(): number {
    return this.cells.size;
  }

  /** Blocos com pelo menos uma face exposta, agrupados por tipo. */
  exposedByType(): Map<BlockName, Voxel[]> {
    const groups = new Map<BlockName, Voxel[]>();
    for (const [k, block] of this.cells) {
      const [x, y, z] = k.split("|").map(Number);
      const buried =
        this.cells.has(key(x + 1, y, z)) &&
        this.cells.has(key(x - 1, y, z)) &&
        this.cells.has(key(x, y + 1, z)) &&
        this.cells.has(key(x, y - 1, z)) &&
        this.cells.has(key(x, y, z + 1)) &&
        this.cells.has(key(x, y, z - 1));
      if (buried) continue;
      let list = groups.get(block);
      if (!list) {
        list = [];
        groups.set(block, list);
      }
      list.push({ x, y, z, block });
    }
    return groups;
  }
}

export interface BuiltGrid {
  group: THREE.Group;
  instanceCount: number;
}

/** Um `InstancedMesh` por tipo de bloco, todos num `THREE.Group`. */
export function buildGrid(grid: VoxelGrid, blocks: BlockMaterials): BuiltGrid {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const group = new THREE.Group();
  const matrix = new THREE.Matrix4();
  let instanceCount = 0;

  for (const [block, voxels] of grid.exposedByType()) {
    const material = blocks.materials[block];
    const mesh = new THREE.InstancedMesh(geometry, material, voxels.length);
    voxels.forEach((v, i) => {
      matrix.makeTranslation(v.x, v.y, v.z);
      mesh.setMatrixAt(i, matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.castShadow = !blocks.noShadowCast.has(block);
    mesh.receiveShadow = !blocks.noShadowReceive.has(block);
    mesh.frustumCulled = false;
    group.add(mesh);
    instanceCount += voxels.length;
  }

  return { group, instanceCount };
}
