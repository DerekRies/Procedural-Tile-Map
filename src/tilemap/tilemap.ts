import * as PIXI from "pixi.js";
import { Tileset } from "./tileset";
import { some, isNil } from "lodash-es";

export enum TILED_RENDER_ORDER {
    RIGHT_DOWN = 'right-down',
    RIGHT_UP = 'right-up',
    LEFT_DOWN = 'left-down',
    LEFT_UP = 'left-up',
}

export enum TILED_ORIENTATION {
    ORTHOGONAL = 'orthogonal',
    ISOMETRIC = 'isometric',
    ISOMETRIC_STAGGERED = 'isometric-staggered',
    HEXAGONAL = 'hexagonal',
}

export interface IPropertyData {
    name: string
    type: string
    value: any
}

export interface ITilemapLayerData {
    data: number[]
    height: number
    width: number
    id: number
    name?: string
    visible?: boolean
    x?: number
    y?: number
    opacity?: number
    properties?: IPropertyData[]
}

export interface ITilesetShortData {
    firstgid: number
    source: string
}

export interface ITilemapData {
    height: number
    width: number
    tileWidth: number
    tileHeight: number
    layers: ITilemapLayerData[]
    renderOrder: TILED_RENDER_ORDER
    tilesets: ITilesetShortData[]
}


function isAnimatedSprite (sprite: any) : sprite is PIXI.AnimatedSprite {
    return !isNil(sprite.animationSpeed);
}


export class Tilemap {

    container: PIXI.Container;

    constructor(public data: ITilemapData,
                public tilesetMap: {[key: string]: Tileset},
                public renderer: PIXI.Renderer) {
        // Chunk the tilemap up into a specified chunkSize
        // calculate the optimal chunk size so that a chunk is 1024x1024 in pixels
        console.groupCollapsed("Building Tilemap");
        
        const chunkSize = Math.floor(1024 / data.tileWidth);
        // const chunkSize = 16;
        const nChunks = (data.width * data.height) / (chunkSize * chunkSize);
        const widthInChunks = Math.floor(data.width / chunkSize);
        const heightInChunks = Math.floor(data.height / chunkSize);
        const chunkSizePixels = chunkSize * data.tileWidth;

        console.table({
            chunkSize,
            nChunks,
            widthInChunks,
            heightInChunks,
            "Map Width": data.width,
            "Map Height": data.height,
            "Tile Width": `${data.tileWidth}px`,
            "Tile Height": `${data.tileHeight}px`,
        });

        this.container = new PIXI.Container();
        this.container.interactive = true;

        for (let chunk = 0; chunk < nChunks; chunk++) {
            console.log(`Building Chunk #${chunk}`)
            const chunkContainer = new PIXI.Container();
            const chunkRenderTexture = PIXI.RenderTexture.create({
                width: chunkSizePixels,
                height: chunkSizePixels
            });

            const chunkX = (chunk % widthInChunks);
            const chunkY = Math.floor(chunk / widthInChunks);
            const topLeftX = chunkX * chunkSize;
            const topLeftY = chunkY * chunkSize;

            const dynamicLayers = new PIXI.Container();

            for (let i = 0; i < data.layers.length; i++) {
                const chunkLayerContainer = new PIXI.Container();
                const layer = data.layers[i];
                let dynamic = false;
                if (layer.properties) {
                    if (some(layer.properties), (prop: IPropertyData) => {
                        return prop.name === "dynamic" && prop.value === true;
                    }) {
                        dynamic = true;
                    }
                }

                for (let x = 0; x < chunkSize; x++) {
                    for (let y = 0; y < chunkSize; y++) {
                        const index = ((y+topLeftY) * data.width) + (x + topLeftX);
                        const tileIndex = layer.data[index];
                        if (tileIndex === 0) continue;

                        // const tileset = tilesetMap["terrain"];
                        // const tile = new PIXI.Sprite(tileset.tileTextures[tileIndex-1]);
                        // const tile = new PIXI.Sprite(this.getTile(tileIndex));
                        const tile = this.getTile(tileIndex);
                        if (isAnimatedSprite(tile)) {
                            tile.play();
                        }
                        
                        tile.x = x * data.tileWidth;
                        tile.y = y * data.tileHeight;
                        if (dynamic) {
                            dynamicLayers.addChild(tile);
                        } else {
                            chunkLayerContainer.addChild(tile);
                        }
                    }
                }
                chunkContainer.addChild(chunkLayerContainer);
            }


            // Draw the border around the chunk
            const grid = new PIXI.Graphics();
            grid.lineStyle(2, 0x000000, 1.0);
            grid.moveTo(0,0);
            grid.lineTo(chunkSizePixels, 0);
            grid.moveTo(0,0);
            grid.lineTo(0, chunkSizePixels);
            chunkContainer.addChild(grid);

            const text = new PIXI.Text(`${chunkX}, ${chunkY}`, {
                fontFamily: 'Lato',
                fontSize: '13px',
                fill: '#fff',
                stroke: '#000',
                strokeThickness: 4
            })
            chunkContainer.addChild(text);
            text.x = 5;
            text.y = 5;

            this.renderer.render(chunkContainer, chunkRenderTexture);
            const chunkSprite = new PIXI.Sprite(chunkRenderTexture);
            const chunkXPixels = ((chunk % widthInChunks)) * chunkSizePixels;
            const chunkYPixels = (Math.floor(chunk / widthInChunks)) * chunkSizePixels;
            chunkSprite.x = chunkXPixels;
            chunkSprite.y = chunkYPixels;
            dynamicLayers.x = chunkXPixels;
            dynamicLayers.y = chunkYPixels;
            this.container.addChild(chunkSprite);
            this.container.addChild(dynamicLayers);
            console.log(chunkContainer, chunkSprite);
        }
        console.groupEnd();
    }

    getTile (globalTileId: number) {
        // need to find the appropriate tileset
        // and then the local tile id
        const tilesets = this.data.tilesets;
        let tileset = null;
        let gidOffset = 0;
        for (let i = tilesets.length - 1; i >= 0; i--) {
            const { firstgid, source } = tilesets[i];
            if (globalTileId >= firstgid) {
                tileset = this.tilesetMap[source];
                gidOffset = firstgid
                break;
            }
        }

        const localTileId = globalTileId - gidOffset;
        // const animatedTile = new PIXI.AnimatedSprite([], )
        // return tileset!.tileTextures[localTileId];
        return tileset!.getTile(localTileId);
    }
}