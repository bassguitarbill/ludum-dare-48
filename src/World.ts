import TileSet from "./TileSet.js";
import { loadJson } from "./load.js";

export default class World {
  animationTimer = 0;
  waterLevel = 20;
  constructor(readonly mapData: TileMapData, readonly tileSets: Array<TileSet>) {}
  
  static async load(mapFilePath: string): Promise<World> {
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
    ctx.fillStyle = 'blue';
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
          value: number,
        }],
  rotation: number,
  type: string,
  visible: boolean,
  width: number,
  x: number,
  y: number,
}

export { MapDataLayer };