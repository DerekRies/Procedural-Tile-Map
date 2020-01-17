import * as PIXI from "pixi.js";
import { isNil } from "lodash-es";
import { ITiledTileset } from "tiled";

export interface ITilesetData {
    imageHeight: number
    imageWidth: number
    tileWidth: number
    tileHeight: number
    tileCount?: number
    margin?: number
    spacing?: number
    tiles?: ITileData[]
}

export interface IAnimationData {
    duration: number
    tileid: number
}

export interface ITileData {
    id: number
    animation?: IAnimationData[]
    terrain?: number[]
}

export class Tileset {
    tileTextures: PIXI.Texture[] = [];
    animatedTiles: Map<number, PIXI.AnimatedSprite.FrameObject[]> = new Map();

    constructor(data:ITilesetData, texture: PIXI.Texture) {
        const { tileWidth, tileHeight, imageHeight, imageWidth } = data;
        const columns = imageWidth / (tileWidth);
        const rows = imageHeight / (tileHeight);
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < columns; j++) {
                const x = j * tileWidth;
                const y = i * tileHeight;
                const bounds = new PIXI.Rectangle(x,y,tileWidth,tileHeight);
                const tileTexture = new PIXI.Texture(texture.baseTexture, bounds);
                this.tileTextures.push(tileTexture);
            }
        }

        // mark the animated tiles
        if (!isNil(data.tiles)) {
            for (let i = 0; i < data.tiles.length; i++) {
                const tile = data.tiles[i];
                if (!isNil(tile.animation)) {
                    console.log(`marking an animated tile: ${tile.id}`)

                    const frames: PIXI.AnimatedSprite.FrameObject[] = [];
                    for (let i = 0; i < tile.animation!.length; i++) {
                        const { duration, tileid } = tile.animation![i];
                        frames.push({
                            texture: this.tileTextures[tileid],
                            time: duration
                        })
                    }
                    this.animatedTiles.set(tile.id, frames);
                }
            }
        }
    }

    static fromTiledFile(file: ITiledTileset, texture: PIXI.Texture) {
        const data: ITilesetData = {
            imageHeight: file.imageheight,
            imageWidth: file.imagewidth,
            tileWidth: file.tilewidth,
            tileHeight: file.tileheight,
            margin: file.margin || 0,
            spacing: file.spacing || 0,
            tiles: file.tiles || []
        }
        return new Tileset(data, texture);
    }

    getTile(localTileId: number): PIXI.Sprite | PIXI.AnimatedSprite {
        if (this.animatedTiles.has(localTileId)) {
            const frames = this.animatedTiles.get(localTileId);
            return new PIXI.AnimatedSprite(frames!);
        }
        return new PIXI.Sprite(this.tileTextures[localTileId]);
    }

}