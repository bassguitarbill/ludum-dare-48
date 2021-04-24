import TileSet from "./TileSet.js";
import { loadJson } from "./load.js";
import { Vector2 } from "./math.js";
import AABBHitbox from "./AABBHitbox.js";

export default class World {
  animationTimer = 0;
  waterLevel = 20;
  terrainLayer: MapDataLayer;
  constructor(readonly mapData: TileMapData, readonly tileSets: Array<TileSet>) {
    const terrainLayer = this.mapData.layers.find(l => l.name === 'terrain');
    if (!terrainLayer) throw 'No terrain layer in map data';
    this.terrainLayer = terrainLayer;
  }
  
  static async loadInstance(mapFilePath: string): Promise<World> {
    const mapData: TileMapData = await loadJson(mapFilePath);
    const tileSets: Array<TileSet> = [];
    await Promise.all(mapData.tilesets.map(async (ts, index) => {
      const tileSet = await TileSet.load(ts.source, ts.firstgid);
      tileSets[index] = tileSet;
    }));
    
    return new World(mapData, tileSets);
  }

  tick(dt: number) {
    this.animationTimer += dt;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'lightblue';
    ctx.fillRect(0, 0, this.mapData.width * this.mapData.tilewidth, this.mapData.height * this.mapData.tileheight);

    ctx.fillStyle = 'darkblue';
    this.mapData.height * this.mapData.tileheight
    ctx.fillRect(0, this.waterLevel, this.mapData.width * this.mapData.tilewidth, (this.mapData.height * this.mapData.tileheight) - this.waterLevel);

    if(!this.mapData) return;
    const terrainLayer = this.mapData.layers.find(l => l.name === 'terrain');
    if (terrainLayer) this.drawLayer(ctx, terrainLayer);
  }

  drawLayer(ctx: CanvasRenderingContext2D, layer: MapDataLayer) {
    const tileset = this.tileSets[0];
    const tilesetData = tileset.tileSetData!;
    const image = tileset.image;
    const columns = tilesetData.columns;
    
    for (let x=0; x < layer.width; x++) {
      for (let y=0; y < layer.height; y++) {
        const tileIndex = layer.data[(layer.width * y) + x];
        if (tileIndex === 0) continue; // Empty tile
        
        let tileFromSet = tileIndex - tileset.firstgid;
        /*const animationTile = tilesetData.tiles.find(t => t.id === tileFromSet);
        if(animationTile) {
          let animationTimer = this.animationTimer + (x + y) * 20; // Change this line to make it propagate differently, probably
          animationTimer %= this.animationTimings.slice(-1)[0];
          let currentFrame = 0;
          for (let f=0; f < this.animationFrames.length; f++) {
            currentFrame = this.animationFrames[f];
            if (animationTimer < this.animationTimings[f]) break;
          }
          tileFromSet = animationTile.animation[currentFrame].tileid;
        }*/

        const tileImageX = (tileFromSet % columns) * tilesetData.tilewidth;
        const tileImageY = Math.floor(tileFromSet / columns) * tilesetData.tileheight;
        ctx.drawImage(image, tileImageX, tileImageY, tilesetData.tilewidth, tilesetData.tileheight,
          x * tilesetData.tilewidth, y * tilesetData.tileheight, tilesetData.tilewidth, tilesetData.tileheight);
      }
    }
  }

  getTileIndex(x: number, y: number) {
    return (this.terrainLayer.width * y) + x;
  }

  getAllSpawners(): Array<ObjectData> {
    const eventsLayer = this.mapData.layers.find(layer => layer.name === 'events');
    if (!eventsLayer) return [];
    return eventsLayer.objects.filter(object => object.type === 'spawn');

  }
  getPlayerSpawnLocation(): Vector2 {
    const spawn = this.getAllSpawners().find(object => object.properties.find(property => property.name === 'objectName' && property.value === 'player'));
    if (!spawn) throw 'No player spawn object found in map';
    return new Vector2(spawn.x, spawn.y);
  }

  collides(hitbox: AABBHitbox) {
    let topLeftTileX = Math.floor(hitbox.topLeft.x / this.mapData.tilewidth);
    let topLeftTileY = Math.floor(hitbox.topLeft.y / this.mapData.tileheight);
    let bottomRightTileX = Math.floor(hitbox.bottomRight.x / this.mapData.tilewidth);
    let bottomRightTileY = Math.floor(hitbox.bottomRight.y / this.mapData.tileheight);
    for (let x=topLeftTileX; x < bottomRightTileX; x++) {
      for (let y=topLeftTileY; y < bottomRightTileY; y++) {
        if (this.terrainLayer.data[this.getTileIndex(x, y)] > 0) return true;
      }
    }
    return false;
  }
}

interface TileMapData {
  compressionlevel: number,
  editorsettings: any,
  height: number,
  infinite: boolean,
  layers: Array<MapDataLayer>,
  nextlayerid: number,
  nextobjectid: number,
  orientation: string,
  renderorder: string,
  tiledversion: string,
  tileheight: number,
  tilesets: Array<TileSetReference>,
  tilewidth: number,
  type: string,
  version: number,
  width: number,
}

interface TileSetReference {
  firstgid: number,
  source: string
}

interface MapDataLayer {
  data: Array<number>,
  height: number,
  id: number,
  name: string,
  objects: Array<ObjectData>,
  opacity: number,
  type: string,
  visible: boolean,
  width: number,
  x: number,
  y: number
}

interface ObjectData {
  gid: number,
  height: number,
  id: number,
  name: string,
  point: boolean,
  properties:[
        {
          name: string,
          type: string,
          value: number | string,
        }],
  rotation: number,
  type: string,
  visible: boolean,
  width: number,
  x: number,
  y: number,
}

export { MapDataLayer };