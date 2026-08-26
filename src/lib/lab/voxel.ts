import * as THREE from "three";

/**
 * Grade de voxels mínima pra montar cenários estilo Minecraft no código.
 *
 * O cenário é descrito como blocos numa grade inteira; na hora de renderizar,
 * `exposed()` joga fora todo cubo totalmente cercado (não aparece, não precisa
 * existir) e o resto vira UM `InstancedMesh` — 1 draw call pro cenário inteiro.
 *
 * Isto é blockout: cor chapada por bloco, sem textura. O objetivo é medir o
 * custo de geometria + engine isolado do custo de textura.
 */

const key = (x: number, y: number, z: number) => `${x}|${y}|${z}`;

export interface Voxel {
  x: number;
  y: number;
  z: number;
  color: number;
}

export class VoxelGrid {
  private cells = new Map<string, number>();

  set(x: number, y: number, z: number, color: number): void {
    this.cells.set(key(x, y, z), color);
  }

  delete(x: number, y: number, z: number): void {
    this.cells.delete(key(x, y, z));
  }

  has(x: number, y: number, z: number): boolean {
    return this.cells.has(key(x, y, z));
  }

  /** Caixa sólida, coordenadas inclusivas, ordem dos cantos não importa. */
  box(
    x0: number, y0: number, z0: number,
    x1: number, y1: number, z1: number,
    color: number,
  ): void {
    const [xa, xb] = x0 <= x1 ? [x0, x1] : [x1, x0];
    const [ya, yb] = y0 <= y1 ? [y0, y1] : [y1, y0];
    const [za, zb] = z0 <= z1 ? [z0, z1] : [z1, z0];
    for (let x = xa; x <= xb; x++) {
      for (let y = ya; y <= yb; y++) {
        for (let z = za; z <= zb; z++) this.set(x, y, z, color);
      }
    }
  }

  /** Só a casca externa da caixa (paredes + piso + teto). */
  shell(
    x0: number, y0: number, z0: number,
    x1: number, y1: number, z1: number,
    color: number,
  ): void {
    const [xa, xb] = x0 <= x1 ? [x0, x1] : [x1, x0];
    const [ya, yb] = y0 <= y1 ? [y0, y1] : [y1, y0];
    const [za, zb] = z0 <= z1 ? [z0, z1] : [z1, z0];
    for (let x = xa; x <= xb; x++) {
      for (let y = ya; y <= yb; y++) {
        for (let z = za; z <= zb; z++) {
          if (x === xa || x === xb || y === ya || y === yb || z === za || z === zb) {
            this.set(x, y, z, color);
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

  /** Blocos com pelo menos uma face exposta. Cubos enterrados são descartados. */
  exposed(): Voxel[] {
    const out: Voxel[] = [];
    for (const [k, color] of this.cells) {
      const [x, y, z] = k.split("|").map(Number);
      const buried =
        this.cells.has(key(x + 1, y, z)) &&
        this.cells.has(key(x - 1, y, z)) &&
        this.cells.has(key(x, y + 1, z)) &&
        this.cells.has(key(x, y - 1, z)) &&
        this.cells.has(key(x, y, z + 1)) &&
        this.cells.has(key(x, y, z - 1));
      if (!buried) out.push({ x, y, z, color });
    }
    return out;
  }
}

/**
 * Um `InstancedMesh` a partir da lista de voxels. Cor por instância — o
 * material só precisa suportar `instanceColor` (Lambert/Standard/Basic).
 */
export function instancedFromVoxels(
  voxels: Voxel[],
  material: THREE.Material,
): THREE.InstancedMesh {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const mesh = new THREE.InstancedMesh(geometry, material, voxels.length);
  const matrix = new THREE.Matrix4();
  const color = new THREE.Color();

  voxels.forEach((v, i) => {
    matrix.makeTranslation(v.x, v.y, v.z);
    mesh.setMatrixAt(i, matrix);
    mesh.setColorAt(i, color.setHex(v.color));
  });

  mesh.instanceMatrix.needsUpdate = true;
  if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  mesh.frustumCulled = false;
  return mesh;
}
